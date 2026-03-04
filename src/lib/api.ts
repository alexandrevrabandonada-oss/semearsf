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

// ─────────────────────────────────────────
// Acervo
// ─────────────────────────────────────────

export type AcervoKind = "paper" | "news" | "video" | "photo" | "report" | "link";

export type AcervoItem = {
  id: string;
  kind: AcervoKind;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string | null;
  source_name: string | null;
  source_url: string | null;
  published_at: string | null;
  year: number | null;
  city: string;
  tags: string[];
  meta: Record<string, unknown>;
  curator_note: string | null;
  authors: string | null;
  doi: string | null;
  featured: boolean;
  source_type: string | null;
  created_at: string;
};

export type ListAcervoParams = {
  kind?: AcervoKind;
  q?: string;
  tag?: string;
  year?: number;
  featured?: boolean;
  source_type?: string;
  limit?: number;
  offset?: number;
};

function rowToAcervoItem(row: Record<string, unknown>): AcervoItem {
  return {
    id: String(row.id ?? ""),
    kind: (row.kind as AcervoKind) ?? "link",
    title: String(row.title ?? "Sem título"),
    slug: String(row.slug ?? ""),
    excerpt: typeof row.excerpt === "string" ? row.excerpt : null,
    content_md: typeof row.content_md === "string" ? row.content_md : null,
    source_name: typeof row.source_name === "string" ? row.source_name : null,
    source_url: typeof row.source_url === "string" ? row.source_url : null,
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    year: typeof row.year === "number" ? row.year : null,
    city: typeof row.city === "string" ? row.city : "Volta Redonda",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    meta: row.meta && typeof row.meta === "object" && !Array.isArray(row.meta)
      ? (row.meta as Record<string, unknown>)
      : {},
    curator_note: typeof row.curator_note === "string" ? row.curator_note : null,
    authors: typeof row.authors === "string" ? row.authors : null,
    doi: typeof row.doi === "string" ? row.doi : null,
    featured: Boolean(row.featured),
    source_type: typeof row.source_type === "string" ? row.source_type : null,
    created_at: typeof row.created_at === "string" ? row.created_at : ""
  };
}

export async function listAcervoItems(params: ListAcervoParams = {}): Promise<AcervoItem[]> {
  try {
    const { kind, q, tag, year, featured, source_type, limit = 50, offset = 0 } = params;
    const supabase = assertSupabase();

    let query = supabase
      .from("acervo_items")
      .select("id, kind, title, slug, excerpt, source_name, source_url, published_at, year, city, tags, featured, source_type, created_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (kind) query = query.eq("kind", kind);
    if (year) query = query.eq("year", year);
    if (featured !== undefined) query = query.eq("featured", featured);
    if (source_type) query = query.eq("source_type", source_type);
    if (tag) query = query.contains("tags", [tag]);
    if (q) query = query.textSearch("search_vec", q, { config: "portuguese", type: "websearch" });

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(rowToAcervoItem);
  } catch (error) {
    throw toAppError("Falha ao listar itens do acervo", error);
  }
}

export async function listFeaturedAcervo(limit = 6): Promise<AcervoItem[]> {
  return listAcervoItems({ featured: true, limit });
}

export async function getAcervoBySlug(slug: string): Promise<AcervoItem | null> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("id, kind, title, slug, excerpt, content_md, source_name, source_url, published_at, year, city, tags, meta, curator_note, authors, doi, featured, source_type, created_at")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return rowToAcervoItem(data as Record<string, unknown>);
  } catch (error) {
    throw toAppError("Falha ao carregar item do acervo", error);
  }
}
