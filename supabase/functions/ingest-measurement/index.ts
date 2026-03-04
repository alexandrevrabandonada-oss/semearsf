import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.6";

const MAX_FUTURE_MS = 10 * 60 * 1000;
const MAX_PAST_MS = 7 * 24 * 60 * 60 * 1000;

type IngestPayload = {
  station_code?: unknown;
  ts?: unknown;
  pm25?: unknown;
  pm10?: unknown;
  temp?: unknown;
  humidity?: unknown;
  quality_flag?: unknown;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function parseBearer(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function isValidIsoTimestamp(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString() === value;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  const ingestApiKey = Deno.env.get("INGEST_API_KEY");
  if (!ingestApiKey) {
    return json(500, { ok: false, error: "missing_ingest_api_key" });
  }

  const token = parseBearer(req.headers.get("authorization"));
  if (!token || token !== ingestApiKey) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "missing_supabase_secrets" });
  }

  let payload: IngestPayload;
  try {
    payload = (await req.json()) as IngestPayload;
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const stationCode = typeof payload.station_code === "string" ? payload.station_code.trim() : "";
  if (!stationCode) {
    return json(400, { ok: false, error: "station_code_required" });
  }

  const ts = typeof payload.ts === "string" ? payload.ts : "";
  if (!ts || !isValidIsoTimestamp(ts)) {
    return json(400, { ok: false, error: "invalid_ts" });
  }

  const now = Date.now();
  const tsMs = new Date(ts).getTime();
  if (tsMs - now > MAX_FUTURE_MS) {
    return json(400, { ok: false, error: "ts_too_far_in_future" });
  }
  if (now - tsMs > MAX_PAST_MS) {
    return json(400, { ok: false, error: "ts_too_old" });
  }

  const pm25 = toNumberOrNull(payload.pm25);
  const pm10 = toNumberOrNull(payload.pm10);
  const temp = toNumberOrNull(payload.temp);
  const humidity = toNumberOrNull(payload.humidity);
  const qualityFlag = payload.quality_flag ?? null;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: station, error: stationError } = await supabase
    .from("stations")
    .select("id")
    .eq("code", stationCode)
    .maybeSingle();

  if (stationError) {
    return json(500, { ok: false, error: "station_lookup_failed" });
  }
  if (!station?.id) {
    return json(404, { ok: false, error: "station_not_found" });
  }

  const { error: insertError } = await supabase.from("measurements").insert({
    station_id: station.id,
    ts,
    pm25,
    pm10,
    temp,
    humidity,
    quality_flag: qualityFlag
  });

  if (insertError) {
    return json(500, { ok: false, error: "measurement_insert_failed" });
  }

  const { error: updateError } = await supabase
    .from("stations")
    .update({ last_seen_at: new Date().toISOString(), status: "online" })
    .eq("id", station.id);

  if (updateError) {
    return json(500, { ok: false, error: "station_update_failed" });
  }

  // --- Push Notification Alerts (Phase 2) ---
  if (pm25 !== null) {
    try {
      // 1. Fetch eligible active subscriptions
      // Rules: is_active=true AND pm25 >= threshold AND (last_alert_at is null OR expired cooldown)
      const { data: subs, error: subError } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("is_active", true)
        .lte("pm25_threshold", pm25);

      if (subError) throw subError;

      const eligibleSubs = (subs || []).filter(sub => {
        if (!sub.last_alert_at) return true;
        const lastAlert = new Date(sub.last_alert_at).getTime();
        const cooldownMs = (sub.cooldown_minutes || 120) * 60 * 1000;
        return Date.now() - lastAlert >= cooldownMs;
      });

      if (eligibleSubs.length > 0) {
        const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
        const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

        if (vapidPublicKey && vapidPrivateKey) {
          webpush.setVapidDetails(
            'mailto:portal@semear.org.br',
            vapidPublicKey,
            vapidPrivateKey
          );

          const payload = JSON.stringify({
            title: `Alerta: Qualidade do Ar (${stationCode})`,
            body: `Nível crítico de PM2.5 detectado: ${pm25} µg/m³.`,
            icon: '/icons/icon-192.png',
            data: { url: `/dados?station=${stationCode}` }
          });

          // Dispatch notifications
          await Promise.allSettled(
            eligibleSubs.map(async (sub) => {
              const pushSubscription = {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              };
              await webpush.sendNotification(pushSubscription, payload);

              // Update sub state
              await supabase
                .from("push_subscriptions")
                .update({
                  last_alert_at: new Date().toISOString(),
                  last_alert_pm25: pm25
                })
                .eq("id", sub.id);
            })
          );

          // Log the alert event (aggregate for this ingest)
          await supabase.from("push_alert_events").insert({
            station_id: station.id,
            pm25,
            reason: `Disparo automático para ${eligibleSubs.length} assinantes.`
          });
        }
      }
    } catch (err) {
      console.error("[PushAlert] Failed to trigger alerts:", err.message);
      // Don't fail the whole ingest if push fails
    }
  }

  return json(200, { ok: true });
});
