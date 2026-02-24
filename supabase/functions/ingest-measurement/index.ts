import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  return json(200, { ok: true });
});
