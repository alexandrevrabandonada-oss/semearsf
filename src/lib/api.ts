import { assertSupabase } from "./supabase/client";

export type Station = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type Measurement = {
  id: string;
  station_id: string;
  ts: string;
  [key: string]: unknown;
};

export type DownsampledMeasurement = {
  bucket_ts: string;
  pm25: number | null;
  pm10: number | null;
  temp: number | null;
  humidity: number | null;
  quality_flag: string | null;
};

export type Event = {
  id: string;
  title: string;
  start_at: string;
  status?: string;
  [key: string]: unknown;
};

export type EventSummary = {
  id: string;
  title: string;
  start_at: string;
  location?: string | null;
  capacity?: number | null;
};

export type RegistrationPayload = {
  event_id: string;
  name: string;
  email: string;
  whatsapp: string;
  bairro: string;
  consent_lgpd: boolean;
};

export type RegistrationResult = {
  status: "confirmed" | "waitlist";
};

function toAppError(scope: string, error: unknown): Error {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "Erro inesperado na comunicacao com o banco.";
  return new Error(`${scope}: ${message}`);
}

function parseCapacity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0) return null;
  return Math.floor(value);
}

export async function listStations(): Promise<Station[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.from("stations").select("*").order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Station[];
  } catch (error) {
    throw toAppError("Falha ao listar estacoes", error);
  }
}

export async function getLatestMeasurements(stationId: string, limit = 20): Promise<Measurement[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("measurements")
      .select("*")
      .eq("station_id", stationId)
      .order("ts", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Measurement[];
  } catch (error) {
    throw toAppError("Falha ao listar medicoes", error);
  }
}

export async function getMeasurementsDownsampled(
  stationId: string,
  range: "24h" | "7d"
): Promise<DownsampledMeasurement[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.rpc("get_measurements_downsampled", {
      p_station_id: stationId,
      p_range: range
    });
    if (error) throw error;
    return (data ?? []) as DownsampledMeasurement[];
  } catch (error) {
    throw toAppError("Falha ao listar medicoes consolidadas", error);
  }
}

export async function listUpcomingEvents(): Promise<Event[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("start_at", { ascending: true })
      .limit(20);
    if (error) throw error;
    return (data ?? []) as Event[];
  } catch (error) {
    throw toAppError("Falha ao listar eventos", error);
  }
}

export async function getEventSummary(eventId: string): Promise<EventSummary | null> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("id, title, start_at, location, capacity")
      .eq("id", eventId)
      .maybeSingle();
    if (error) throw error;
    return (data as EventSummary | null) ?? null;
  } catch (error) {
    throw toAppError("Falha ao carregar dados do evento", error);
  }
}

async function getEventRegistrationCount(eventId: string): Promise<number> {
  const supabase = assertSupabase();
  const { count, error } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);
  if (error) throw error;
  return count ?? 0;
}

export async function createRegistration(payload: RegistrationPayload): Promise<RegistrationResult> {
  try {
    if (!payload.consent_lgpd) {
      throw new Error("Para concluir a inscricao, voce precisa aceitar o consentimento LGPD.");
    }
    if (!payload.event_id) {
      throw new Error("Evento nao informado. Acesse a inscricao por um evento da agenda.");
    }

    const supabase = assertSupabase();
    const event = await getEventSummary(payload.event_id);
    if (!event) {
      throw new Error("Evento nao encontrado para inscricao.");
    }

    const capacity = parseCapacity(event.capacity);
    const currentCount = capacity === null ? 0 : await getEventRegistrationCount(payload.event_id);
    const registrationStatus: RegistrationResult["status"] =
      capacity !== null && currentCount >= capacity ? "waitlist" : "confirmed";

    const { error } = await supabase.from("registrations").insert({
      event_id: payload.event_id,
      name: payload.name,
      email: payload.email,
      whatsapp: payload.whatsapp,
      bairro: payload.bairro,
      consent_lgpd: true,
      status: registrationStatus
    });

    if (error) throw error;
    return { status: registrationStatus };
  } catch (error) {
    throw toAppError("Falha ao criar inscricao", error);
  }
}
