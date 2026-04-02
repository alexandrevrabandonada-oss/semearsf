import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { SurfaceCard } from "../components/BrandSystem";
import {
  DocumentalCard,
  EditorialFamilyCard,
  FeaturedCard,
  TerritorialCard
} from "../components/CardFamilies";
import type {
  AcervoCollection,
  AcervoItem,
  BlogPost,
  ClimateCorridor,
  Event,
  ReportDocument,
  StationOverview,
  TransparencySummary
} from "../lib/api";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { getOptimizedCover } from "../lib/imageOptimization";
import { INSTITUTIONAL_COORDINATION, INSTITUTIONAL_TAGLINE } from "../content/institucional";

const REPORT_KIND_LABEL: Record<ReportDocument["kind"], string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function HomePage() {
  const { prompt, clearPrompt } = useInstallPrompt();
  const [stations, setStations] = useState<StationOverview[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [acervo, setAcervo] = useState<AcervoItem[]>([]);
  const [latestBlog, setLatestBlog] = useState<BlogPost | null>(null);
  const [transparency, setTransparency] = useState<TransparencySummary | null>(null);
  const [collections, setCollections] = useState<AcervoCollection[]>([]);
  const [corridors, setCorridors] = useState<ClimateCorridor[]>([]);
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [monitoringApi, contentApi, transparencyApi] = await Promise.all([
          import("../lib/api/monitoring"),
          import("../lib/api/content"),
          import("../lib/api/transparency")
        ]);
        const [stationsData, eventsData, acervoData, blogData, transData, collectionsData, corridorsData, reportsData] = await Promise.all([
          monitoringApi.getStationOverview(),
          contentApi.listUpcomingEvents(),
          contentApi.listAcervoItems({ featured: true, limit: 6 }),
          contentApi.listBlogPosts({ limit: 1 }),
          transparencyApi.getTransparencySummary(),
          contentApi.listFeaturedCollections(3),
          contentApi.listFeaturedCorridors(3),
          contentApi.listLatestReports(3)
        ]);
        setStations(stationsData);
        setEvents(eventsData.slice(0, 3));
        setAcervo(acervoData);
        setLatestBlog(blogData[0] || null);
        setTransparency(transData);
        setCollections(collectionsData as AcervoCollection[]);
        setCorridors(corridorsData);
        setReports(reportsData.filter((report) => report.featured).slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
        setError("Não foi possível carregar as informações em tempo real.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const onlineCount = stations.filter((s) => s.is_online).length;
  const offlineCount = stations.length - onlineCount;
  const formatCurrency = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const featuredCollection = collections[0] ?? null;
  const secondaryCollections = collections.slice(1, 3);

  return (
    <section className="space-y-8 md:space-y-10">

      {/* ── 1. HERO ─────────────────────── manifesto assimétrico ── */}
      <SurfaceCard className="hero-semear-shell signature-shell overflow-hidden border-brand-primary/12 bg-gradient-to-br from-surface-1 via-surface-1 to-surface-2 px-5 py-7 shadow-[0_20px_60px_rgba(17,38,59,0.08)] md:px-7 md:py-9">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(260px,0.82fr)] lg:items-start">

          {/* Left — manifesto */}
          <div className="space-y-6">
            {/* Coord badge */}
            <div className="flex items-center gap-3">
              <span className="ui-pill-institutional">UFF</span>
              <span className="h-px w-8 bg-border-subtle opacity-50" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">{INSTITUTIONAL_COORDINATION}</span>
            </div>

            {/* Big SEMEAR + two-line statement */}
            <div className="space-y-3">
              <div className="hero-title-shell">
                <img src="/brand/semear-logo.svg" alt="" aria-hidden="true" className="h-10 w-10 rounded-xl border border-border-subtle bg-surface-1 p-1 shadow-sm md:h-12 md:w-12" />
                <h1 className="text-[3.8rem] font-black leading-[0.86] tracking-[-0.055em] text-text-primary md:text-[6.5rem] lg:text-[8.5rem]">
                  SEMEAR
                </h1>
              </div>
              <div className="space-y-0 pl-1">
                <p className="text-[1.3rem] font-black leading-snug text-brand-primary-dark md:text-[1.6rem]">
                  Ciência aberta.
                </p>
                <p className="text-[1.3rem] font-black leading-snug text-brand-primary md:text-[1.6rem]">
                  Vigilância popular.
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="max-w-[40ch] text-sm leading-relaxed text-text-secondary md:text-[0.9375rem]">
              {INSTITUTIONAL_TAGLINE}. Dados em tempo real, acervo curado e memória ambiental em uma plataforma pública-universitária de referência.
            </p>

            {/* Inline metric belt */}
            {!loading && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-border-subtle bg-surface-2/60 px-4 py-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[1.6rem] font-black tabular-nums text-text-primary">{onlineCount}</span>
                  <span className="text-[11px] text-text-secondary">estações online</span>
                </div>
                <div className="h-4 w-px bg-border-subtle" aria-hidden="true" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[1.6rem] font-black tabular-nums text-text-primary">{collections.length}</span>
                  <span className="text-[11px] text-text-secondary">dossiês</span>
                </div>
                <div className="h-4 w-px bg-border-subtle" aria-hidden="true" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[1.6rem] font-black tabular-nums text-text-primary">{reports.length}</span>
                  <span className="text-[11px] text-text-secondary">relatórios</span>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="hero-search-shell max-w-xl">
              <div className="group relative">
                <input
                  id="home-search"
                  type="search"
                  placeholder="Busque relatório, corredor, tema ou publicação…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = (e.target as HTMLInputElement).value;
                      if (q.trim()) window.location.href = `/buscar?q=${encodeURIComponent(q)}`;
                    }
                  }}
                  className="w-full rounded-full border-2 border-border-subtle bg-surface-1 px-5 py-3 pr-12 text-base text-text-primary transition-all duration-200 placeholder:text-text-secondary/60 focus:border-brand-primary focus:ring-4 focus:ring-focus-ring/30"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-brand-primary-soft p-1.5 text-brand-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Link to="/dados" className="hero-shortcut-chip">PM2.5 ao vivo</Link>
                <Link to="/relatorios" className="hero-shortcut-chip">Relatórios oficiais</Link>
                <Link to="/corredores" className="hero-shortcut-chip">Corredores</Link>
                <Link to="/acervo" className="hero-shortcut-chip">Acervo</Link>
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              {prompt && (
                <button
                  onClick={async () => {
                    await prompt.prompt();
                    const { outcome } = await prompt.userChoice;
                    if (outcome === "accepted") clearPrompt();
                  }}
                  className="ui-cta-primary px-6"
                >
                  Instalar app
                </button>
              )}
              <Link to="/dados" className="ui-cta-primary px-6">
                Dados em tempo real →
              </Link>
              <Link to="/corredores" className="ui-cta-secondary px-6">
                Corredores climáticos
              </Link>
            </div>
          </div>

          {/* Right — live data panel */}
          <div className="data-now-panel motion-surface motion-surface-hover p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="ui-pill-institutional">Ao vivo</span>
                <h2 className="text-lg font-black text-text-primary">Dados agora</h2>
              </div>
              <Link to="/dados" className="rounded-full bg-brand-primary/10 p-2 text-brand-primary hover:bg-brand-primary/20" aria-label="Ver painel de dados">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Link>
            </div>
            {loading ? (
              <div className="mt-4 space-y-3">
                <div className="seed-skeleton h-16 rounded-2xl" />
                <div className="seed-skeleton h-16 rounded-2xl" />
              </div>
            ) : error ? (
              <p className="mt-4 text-sm text-danger">{error}</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-border-subtle bg-brand-primary-soft/60 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary-dark">Online</p>
                    <p className="mt-1.5 text-3xl font-black text-text-primary">{onlineCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-surface-2 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Offline</p>
                    <p className="mt-1.5 text-3xl font-black text-text-primary">{offlineCount}</p>
                  </div>
                </div>
                <div className="space-y-2.5 rounded-2xl border border-border-subtle bg-surface-2/80 p-3.5">
                  {stations.filter((s) => s.pm25 !== null).slice(0, 3).map((station) => (
                    <div key={station.station_id} className="flex items-center justify-between gap-3 border-b border-divider-subtle pb-2.5 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{station.name}</p>
                        <p className="text-[11px] text-text-secondary">{station.last_ts ? formatDateTime(station.last_ts) : "—"}</p>
                      </div>
                      <p className="shrink-0 text-base font-black text-text-primary">{Math.round(station.pm25!)} µg/m³</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SurfaceCard>

      {/* ── 2. DOSSIÊS ──────── full-bleed + 2-col secondary ────── */}
      <div className="home-section-dossies rounded-[2rem] p-5 md:p-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <span className="axis-eyebrow-dossie">Biblioteca temática</span>
            <h2 className="text-2xl font-black text-text-primary md:text-3xl">Dossiês em destaque</h2>
            <p className="max-w-sm text-sm text-text-secondary">Coleções curadas por tema, território e urgência documental.</p>
          </div>
          <Link className="ui-btn-ghost shrink-0" to="/dossies">Ver todos →</Link>
        </div>
        {loading ? (
          <div className="space-y-4">
            <div className="seed-skeleton h-80 rounded-[1.75rem]" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="seed-skeleton h-52 rounded-[1.75rem]" />
              <div className="seed-skeleton h-52 rounded-[1.75rem]" />
            </div>
          </div>
        ) : !featuredCollection ? (
          <div className="rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum dossiê em destaque no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Link to={`/dossies/${featuredCollection.slug}`} className="group block">
              <FeaturedCard
                coverUrl={getOptimizedCover(featuredCollection, "small")}
                coverAlt={featuredCollection.title}
                eyebrow="Dossiê principal"
                title={featuredCollection.title}
                excerpt={featuredCollection.excerpt}
                tags={featuredCollection.tags}
                cta="Abrir dossiê"
              />
            </Link>
            {secondaryCollections.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {secondaryCollections.map((col) => (
                  <Link key={col.id} to={`/dossies/${col.slug}`} className="group block h-full">
                    <FeaturedCard
                      coverUrl={getOptimizedCover(col, "thumb")}
                      coverAlt={col.title}
                      eyebrow="Dossiê"
                      title={col.title}
                      excerpt={col.excerpt}
                      tags={col.tags}
                      cta="Abrir dossiê"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. CORREDORES ───── dark territorial strip ───────────── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b1e13] via-[#0e2a1a] to-[#091a10] p-5 md:p-7">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle at center, rgba(21,128,61,0.5) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <span className="inline-flex items-center rounded-full border border-accent-green/30 bg-accent-green/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-accent-green">
              Território
            </span>
            <h2 className="text-2xl font-black text-white md:text-3xl">Corredores Climáticos</h2>
            <p className="max-w-sm text-sm text-white/55">
              Rotas e recortes territoriais monitorados em Volta Redonda e no Sul Fluminense.
            </p>
          </div>
          <Link
            to="/corredores"
            className="shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Ver mapa →
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[1.5rem] bg-white/10" />
            ))}
          </div>
        ) : corridors.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/15 p-8 text-center">
            <p className="text-sm text-white/50">Nenhum corredor publicado no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {corridors.slice(0, 3).map((c) => (
              <Link key={c.id} to={`/corredores/${c.slug}`} className="group block h-full">
                <TerritorialCard
                  coverUrl={getOptimizedCover(c, "small") || c.cover_url || null}
                  coverAlt={c.title}
                  title={c.title}
                  excerpt={c.excerpt}
                  featured={c.featured ?? false}
                  cta="Explorar →"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. EM CIRCULAÇÃO ── blog + relatórios + transparência ── */}
      <SurfaceCard className="home-section-novidades p-5 md:p-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <span className="axis-eyebrow-blog">Blog &amp; Relatórios</span>
            <h2 className="text-2xl font-black text-text-primary md:text-3xl">Em circulação</h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link className="ui-btn-ghost" to="/blog">Blog</Link>
            <Link className="ui-btn-ghost" to="/relatorios">Relatórios</Link>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
          {/* Blog + transparency */}
          <div className="space-y-4">
            {loading ? (
              <div className="seed-skeleton h-64 rounded-[1.6rem]" />
            ) : latestBlog ? (
              <Link to={`/blog/${latestBlog.slug}`} className="group block">
                <EditorialFamilyCard
                  coverUrl={getOptimizedCover(latestBlog, "thumb")}
                  coverAlt={latestBlog.title}
                  date={latestBlog.published_at ? new Date(latestBlog.published_at).toLocaleDateString("pt-BR") : undefined}
                  title={latestBlog.title}
                  excerpt={latestBlog.excerpt}
                  tags={latestBlog.tags}
                  cta="Ler artigo completo"
                />
              </Link>
            ) : (
              <div className="flex min-h-[10rem] items-center justify-center rounded-[1.6rem] border border-dashed border-border-subtle">
                <p className="text-sm text-text-secondary">Nenhum post publicado.</p>
              </div>
            )}
            {transparency && (
              <Link
                to="/transparencia"
                className="group flex items-center justify-between rounded-[1.25rem] border border-border-subtle bg-surface-2/70 px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">Transparência financeira</p>
                    <p className="text-sm font-black text-text-primary">{formatCurrency(transparency.total_cents)} investidos</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-brand-primary">Prestar contas →</span>
              </Link>
            )}
          </div>
          {/* Reports belt */}
          <div className="space-y-2.5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="seed-skeleton h-24 rounded-[1.25rem]" />
              ))
            ) : reports.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border-subtle p-6 text-center">
                <p className="text-sm text-text-secondary">Nenhum relatório recente.</p>
              </div>
            ) : (
              reports.map((report) => (
                <Link key={report.id} to={`/relatorios/${report.slug}`} className="group block">
                  <DocumentalCard
                    variant="compact"
                    kindLabel={REPORT_KIND_LABEL[report.kind]}
                    date={report.published_at ? new Date(report.published_at).toLocaleDateString("pt-BR") : report.year ? String(report.year) : undefined}
                    title={report.title}
                    summary={report.summary}
                    cta="Abrir PDF"
                  />
                </Link>
              ))
            )}
            <Link
              to="/relatorios"
              className="flex items-center justify-center gap-1.5 rounded-[1.25rem] border border-border-subtle py-2.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
            >
              Ver todos os relatórios <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </SurfaceCard>

      {/* ── 5. AGENDA ─────────── aparece só se houver eventos ───── */}
      {(loading || events.length > 0) && (
      <SurfaceCard className="home-section-data p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <span className="axis-eyebrow-dados">Participação</span>
            <h2 className="text-xl font-black text-text-primary md:text-2xl">Próximos eventos</h2>
          </div>
          <Link className="ui-btn-ghost shrink-0" to="/agenda">Ver agenda →</Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="seed-skeleton h-24 rounded-[1.5rem]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to="/agenda"
                className="group flex gap-4 rounded-[1.35rem] border border-border-subtle bg-surface-2/60 p-4 transition-all duration-200 hover:border-brand-primary/20 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-border-subtle bg-surface-1 shadow-sm">
                  <span className="text-xl font-black leading-none text-text-primary">{new Date(event.start_at).getDate()}</span>
                  <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    {new Date(event.start_at).toLocaleDateString("pt-BR", { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-black text-text-primary">{event.title}</p>
                  <p className="text-[11px] text-text-secondary">{formatDateTime(event.start_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SurfaceCard>
      )}
    </section>
  );
}




