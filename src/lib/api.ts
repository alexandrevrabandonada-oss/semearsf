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

// ─────────────────────────────────────────
// Blog
// ─────────────────────────────────────────

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string | null;
  cover_url: string | null;
  tags: string[];
  published_at: string | null;
  status: "draft" | "published";
  created_at: string;
};

export type ListBlogParams = {
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
};

function rowToBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Sem título"),
    excerpt: typeof row.excerpt === "string" ? row.excerpt : null,
    content_md: typeof row.content_md === "string" ? row.content_md : null,
    cover_url: typeof row.cover_url === "string" ? row.cover_url : null,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    status: (row.status as "draft" | "published") ?? "draft",
    created_at: typeof row.created_at === "string" ? row.created_at : ""
  };
}

export async function listBlogPosts(params: ListBlogParams = {}): Promise<BlogPost[]> {
  try {
    const { q, tag, limit = 50, offset = 0 } = params;
    const supabase = assertSupabase();

    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_url, tags, published_at, status, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (tag) query = query.contains("tags", [tag]);
    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(rowToBlogPost);
  } catch (error) {
    throw toAppError("Falha ao listar posts do blog", error);
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return rowToBlogPost(data as Record<string, unknown>);
  } catch (error) {
    throw toAppError("Falha ao carregar post do blog", error);
  }
}

// ─────────────────────────────────────────
// Transparência
// ─────────────────────────────────────────

export type TransparencyLink = {
  id: string;
  title: string;
  url: string;
  kind: "portal" | "processo" | "nota" | "arquivo";
  created_at: string;
};

export type Expense = {
  id: string;
  occurred_on: string;
  vendor: string;
  description: string;
  category: string;
  amount_cents: number;
  document_url: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

export async function listTransparencyLinks(): Promise<TransparencyLink[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("transparency_links")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TransparencyLink[];
  } catch (error) {
    throw toAppError("Falha ao listar links de transparência", error);
  }
}

export async function listExpenses(limit = 100): Promise<Expense[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("occurred_on", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Expense[];
  } catch (error) {
    throw toAppError("Falha ao listar despesas", error);
  }
}

export type TransparencySummary = {
  total_cents: number;
  by_category: Record<string, number>;
  count: number;
};

export async function getTransparencySummary(): Promise<TransparencySummary> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("category, amount_cents");
    if (error) throw error;

    const summary: TransparencySummary = {
      total_cents: 0,
      by_category: {},
      count: (data ?? []).length
    };

    (data ?? []).forEach((row) => {
      const amount = Number(row.amount_cents);
      const cat = String(row.category);
      summary.total_cents += amount;
      summary.by_category[cat] = (summary.by_category[cat] ?? 0) + amount;
    });

    return summary;
  } catch (error) {
    throw toAppError("Falha ao calcular sumário de transparência", error);
  }
}
// ─────────────────────────────────────────
// Status do Sistema
// ─────────────────────────────────────────

export type SystemStatus = {
  monitoring: {
    stations_count: number;
    measurements_24h: number;
    latest_measurement: {
      ts: string;
      station_name: string;
    } | null;
  };
  content: {
    upcoming_events: EventSummary[];
    latest_acervo: any[]; // Use AcervoItem type if available, but for status list generic is fine
    latest_blog: BlogPost[];
  };
  transparency: TransparencySummary;
};

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const supabase = assertSupabase();

    // 1. Monitoring stats
    const [{ count: stationsCount }, { count: measurements24h }] = await Promise.all([
      supabase.from("stations").select("*", { count: "exact", head: true }),
      supabase.from("measurements")
        .select("*", { count: "exact", head: true })
        .gt("ts", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Latest measurement with station name
    const { data: latestM } = await supabase
      .from("measurements")
      .select("ts, station:stations(name)")
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Content
    const [events, acervo, blog, transparency] = await Promise.all([
      supabase.from("events").select("id, title, start_at, location, capacity")
        .order("start_at", { ascending: true })
        .gt("start_at", new Date().toISOString())
        .limit(3),
      supabase.from("acervo_items").select("*").order("created_at", { ascending: false }).limit(3),
      listBlogPosts({ limit: 2 }),
      getTransparencySummary()
    ]);

    return {
      monitoring: {
        stations_count: stationsCount || 0,
        measurements_24h: measurements24h || 0,
        latest_measurement: latestM ? {
          ts: String(latestM.ts),
          station_name: String((latestM.station as any)?.name || "N/A")
        } : null
      },
      content: {
        upcoming_events: (events.data ?? []) as EventSummary[],
        latest_acervo: (acervo.data ?? []) as any[],
        latest_blog: blog
      },
      transparency
    };
  } catch (error) {
    throw toAppError("Falha ao obter status do sistema", error);
  }
}

/**
 * Busca itens no acervo pelo título ou excerto.
 */
export async function searchAcervo(q: string, limit = 10): Promise<AcervoItem[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("*")
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AcervoItem[];
  } catch (error) {
    throw toAppError("Falha ao buscar no acervo", error);
  }
}

/**
 * Busca posts no blog pelo título ou conteúdo.
 */
export async function searchBlog(q: string, limit = 10): Promise<BlogPost[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .or(`title.ilike.%${q}%,content_md.ilike.%${q}%`)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as BlogPost[];
  } catch (error) {
    throw toAppError("Falha ao buscar no blog", error);
  }
}

/**
 * Busca gastos na transparência por fornecedor, descrição ou categoria.
 */
export async function searchTransparency(q: string, limit = 10): Promise<any[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .or(`vendor.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
      .order("occurred_on", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as any[];
  } catch (error) {
    throw toAppError("Falha ao buscar na transparência", error);
  }
}

/**
 * Busca eventos na agenda por título ou descrição.
 */
export async function searchEvents(q: string, limit = 10): Promise<Event[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order("start_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as Event[];
  } catch (error) {
    throw toAppError("Falha ao buscar eventos", error);
  }
}
