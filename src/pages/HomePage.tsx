import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Chip,
  EditorialCard,
  EditorialCardActions,
  EditorialCardBody,
  EditorialCardEyebrow,
  EditorialCardExcerpt,
  EditorialCardMeta,
  EditorialCardTitle,
  IconShell,
  SectionHeader,
  SurfaceCard
} from "../components/BrandSystem";
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
  const featuredCorridor = corridors[0] ?? null;
  const supportingCorridors = corridors.slice(1, 3);
  const featuredReport = reports[0] ?? null;
  const supportingReports = reports.slice(1, 3);
  const featuredEvent = events[0] ?? null;
  const upcomingEvents = events.slice(1, 3);

  const heroMetrics = useMemo(
    () => [
      { label: "estações online", value: String(onlineCount), tone: "seed" as const },
      { label: "dossiês", value: String(collections.length), tone: "active" as const },
      { label: "relatórios", value: String(reports.length), tone: "lab" as const }
    ],
    [collections.length, onlineCount, reports.length]
  );

  return (
    <section className="space-y-12 md:space-y-14">
      <SurfaceCard className="signature-shell logo-watermark-soft overflow-hidden border-brand-primary/12 bg-gradient-to-br from-surface-1 via-surface-1 to-surface-2 p-6 shadow-[0_20px_60px_rgba(17,38,59,0.08)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="seed-badge">Selo institucional</span>
              <span className="ui-chip">PWA público-universitário</span>
              <span className="ui-chip ui-chip-active">UFF</span>
            </div>

            <div className="seed-radial-divider max-w-md" aria-hidden="true" />

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-text-secondary">{INSTITUTIONAL_COORDINATION}</p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.04em] text-text-primary md:text-6xl lg:text-[4.75rem]">
                SEMEAR
              </h1>
              <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-accent-seed via-brand-primary to-accent-lab" aria-hidden="true" />
            </div>

            <div className="max-w-3xl space-y-3">
              <p className="text-2xl font-black leading-tight text-brand-primary-dark md:text-[2.15rem]">
                Monitoramento da qualidade do ar e memória socioambiental em uma interface pública de referência.
              </p>
              <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
                {INSTITUTIONAL_TAGLINE}. Plataforma pública-universitária que reúne dados científicos em tempo real, acervo histórico curado, rodas de conversa inclusivas e atividades participativas de vigilância popular em saúde.
              </p>
            </div>

            <div className="signature-surface motion-list-item max-w-3xl p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="home-search" className="text-sm font-semibold text-text-primary">
                  Buscar no portal
                </label>
                <span className="seed-badge">Busca integrada</span>
              </div>
              <div className="group relative mt-3">
                <input
                  id="home-search"
                  type="search"
                  placeholder="Busque por dados, relatórios, acervo ou atividades..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = (e.target as HTMLInputElement).value;
                      if (q.trim()) window.location.href = `/buscar?q=${encodeURIComponent(q)}`;
                    }
                  }}
                  className="w-full rounded-full border-2 border-border-subtle bg-surface-1 px-6 py-4 pr-14 text-base text-text-primary shadow-[0_1px_0_rgba(17,38,59,0.02)] transition-all duration-200 placeholder:text-text-secondary/60 focus:border-brand-primary focus:ring-4 focus:ring-focus-ring/30"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-brand-primary-soft p-2 text-brand-primary transition-transform group-focus-within:scale-110">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/dados" className="ui-chip ui-chip-active">Dados</Link>
                <Link to="/relatorios" className="ui-chip">Relatórios</Link>
                <Link to="/acervo" className="ui-chip">Acervo</Link>
                <Link to="/mapa" className="ui-chip">Mapa</Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {prompt && (
                <button
                  onClick={async () => {
                    await prompt.prompt();
                    const { outcome } = await prompt.userChoice;
                    if (outcome === "accepted") clearPrompt();
                  }}
                  className="ui-btn-primary px-6 shadow-[0_12px_30px_rgba(0,93,170,0.18)] hover:shadow-[0_18px_40px_rgba(0,93,170,0.24)]"
                >
                  Instalar aplicativo
                </button>
              )}
              <Link to="/dados" className="ui-btn-primary bg-accent-lab px-6 hover:bg-accent-lab/90">
                Ir para dados
              </Link>
              <Link to="/agenda" className="ui-btn-secondary px-6">
                Ver agenda
              </Link>
              <Link to="/acervo" className="ui-btn-ghost px-6">
                Ir para acervo
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {heroMetrics.map((metric) => (
                <Chip key={metric.label} tone={metric.tone}>
                  <span className="font-black text-sm text-text-primary">{metric.value}</span>
                  <span>{metric.label}</span>
                </Chip>
              ))}
            </div>
          </div>

            <div className="grid gap-4">
            <div className="signature-surface motion-list-item p-5 motion-surface motion-surface-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="section-badge">Painel instantâneo</span>
                  <h2 className="text-xl font-black text-text-primary">Dados agora</h2>
                </div>
                <IconShell tone="lab" className="h-12 w-12 rounded-full">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </IconShell>
              </div>

              {loading ? (
                <div className="mt-6 space-y-3">
                  <div className="seed-skeleton h-16 rounded-2xl" />
                  <div className="seed-skeleton h-16 rounded-2xl" />
                </div>
              ) : error ? (
                <p className="mt-6 text-sm text-danger">{error}</p>
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border-subtle bg-brand-primary-soft/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary-dark">Online</p>
                      <p className="mt-2 text-4xl font-black text-text-primary">{onlineCount}</p>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Offline</p>
                      <p className="mt-2 text-4xl font-black text-text-primary">{offlineCount}</p>
                    </div>
                  </div>

                  <div className="motion-list-item space-y-3 rounded-2xl border border-border-subtle bg-surface-2/80 p-4">
                    {stations.filter((s) => s.pm25 !== null).slice(0, 3).map((station) => (
                      <div key={station.station_id} className="flex items-center justify-between gap-4 border-b border-divider-subtle pb-3 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-primary">{station.name}</p>
                          <p className="text-xs text-text-secondary">Última leitura</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-text-primary">{Math.round(station.pm25!)} µg/m³</p>
                          <p className="text-xs text-text-secondary">{station.last_ts ? formatDateTime(station.last_ts) : "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
            <div className="signature-surface motion-list-item p-5">
                <p className="section-badge">Acervo</p>
                <p className="mt-3 text-3xl font-black text-text-primary">{acervo.length}</p>
                <p className="mt-1 text-sm text-text-secondary">Itens destacados para navegação rápida.</p>
              </div>
            <div className="signature-surface motion-list-item p-5">
                <p className="section-badge">Transparência</p>
                <p className="mt-3 text-3xl font-black text-text-primary">{transparency ? formatCurrency(transparency.total_cents) : "—"}</p>
                <p className="mt-1 text-sm text-text-secondary">Recursos investidos no projeto.</p>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <SectionHeader
          eyebrow="Dados agora"
          title="Monitoramento em tempo real"
          description="Leituras recentes, disponibilidade das estações e contexto imediato para navegação pública."
          action={<Link className="ui-btn-ghost" to="/dados">Ir para dados</Link>}
        />

        <div className="mt-6 rounded-[1.5rem] border border-border-subtle bg-surface-1 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Resumo operacional</p>
              <h3 className="mt-1 text-xl font-black text-text-primary">Estações e leituras</h3>
            </div>
            <IconShell tone="brand" className="h-12 w-12 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </IconShell>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-primary-soft/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary-dark">Online</p>
              <p className="mt-2 text-3xl font-black text-text-primary">{onlineCount}</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Offline</p>
              <p className="mt-2 text-3xl font-black text-text-primary">{offlineCount}</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Fontes</p>
              <p className="mt-2 text-3xl font-black text-text-primary">{stations.length}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {stations.filter((s) => s.pm25 !== null).slice(0, 2).map((station) => (
              <div key={station.station_id} className="flex items-center justify-between rounded-2xl border border-divider-subtle bg-surface-2 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{station.name}</p>
                  <p className="text-xs text-text-secondary">Última leitura registrada</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-text-primary">{Math.round(station.pm25!)} µg/m³</p>
                  <p className="text-xs text-text-secondary">{station.last_ts ? formatDateTime(station.last_ts) : "-"}</p>
                </div>
              </div>
            ))}
          </div>
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/dados">
            Ir para dados
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <SectionHeader
          eyebrow="Agenda"
          title="Ver agenda"
          description="Um ritmo mais editorial para a agenda pública, com destaque para o próximo encontro e menos repetição de cards iguais."
          action={<Link className="ui-btn-ghost" to="/agenda">Ver agenda completa</Link>}
        />
        {loading ? (
          <div className="mt-6 space-y-4">
            <div className="seed-skeleton h-56 rounded-[1.5rem]" />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="seed-skeleton h-28 rounded-[1.5rem]" />
              <div className="seed-skeleton h-28 rounded-[1.5rem]" />
            </div>
          </div>
        ) : error ? (
          <p className="mt-6 text-sm text-danger">{error}</p>
        ) : !featuredEvent ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum evento publicado para os próximos dias.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Link to="/agenda" className="group block h-full">
              <EditorialCard variant="featured">
                <div className="relative min-h-[18rem] bg-gradient-to-br from-accent-yellow/15 via-surface-1 to-surface-2">
                  <div className="absolute inset-0 seed-placeholder opacity-45" aria-hidden="true" />
                  <div className="absolute left-5 top-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-border-subtle bg-surface-1/90 shadow-[0_14px_30px_rgba(17,38,59,0.08)]">
                    <div className="text-center">
                      <span className="block text-4xl font-black text-text-primary">{new Date(featuredEvent.start_at).getDate()}</span>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                        {new Date(featuredEvent.start_at).toLocaleDateString("pt-BR", { month: "short" })}
                      </span>
                    </div>
                  </div>
                </div>
                <EditorialCardBody className="justify-between">
                  <div className="space-y-3">
                    <EditorialCardEyebrow>Próximo encontro</EditorialCardEyebrow>
                    <EditorialCardTitle className="text-2xl md:text-[1.9rem]">{featuredEvent.title}</EditorialCardTitle>
                    <EditorialCardExcerpt className="line-clamp-3">
                      {typeof featuredEvent.description === "string" && featuredEvent.description.trim()
                        ? featuredEvent.description
                        : "Atividade pública aberta para participação e circulação de conhecimento."}
                    </EditorialCardExcerpt>
                  </div>
                  <EditorialCardActions>
                    <EditorialCardMeta>
                      <span>{formatDateTime(featuredEvent.start_at)}</span>
                    </EditorialCardMeta>
                    <span className="ui-btn-ghost">Abrir agenda</span>
                  </EditorialCardActions>
                </EditorialCardBody>
              </EditorialCard>
            </Link>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
                  <p className="text-sm text-text-secondary">Nenhum outro evento publicado.</p>
                </div>
              ) : upcomingEvents.map((event) => (
                <Link key={event.id} to="/agenda" className="group block h-full">
                  <EditorialCard variant="compact" className="grid grid-cols-[84px_minmax(0,1fr)]">
                    <div className="flex items-center justify-center bg-gradient-to-br from-brand-primary-soft via-surface-1 to-surface-2 p-4 text-center">
                      <div>
                        <span className="block text-2xl font-black text-text-primary">{new Date(event.start_at).getDate()}</span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          {new Date(event.start_at).toLocaleDateString("pt-BR", { month: "short" })}
                        </span>
                      </div>
                    </div>
                    <EditorialCardBody className="justify-between p-4 md:p-5">
                      <div className="space-y-2">
                        <EditorialCardEyebrow>Agenda</EditorialCardEyebrow>
                        <EditorialCardTitle className="text-lg">{event.title}</EditorialCardTitle>
                      </div>
                      <EditorialCardMeta>
                        <span>{formatDateTime(event.start_at)}</span>
                      </EditorialCardMeta>
                    </EditorialCardBody>
                  </EditorialCard>
                </Link>
              ))}
            </div>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <SectionHeader
          eyebrow="Dossiês"
          title="Dossiês em destaque"
          description="Mais editorial, com um cartão principal maior e apoios menores para criar hierarquia e evitar repetição visual."
          action={<Link className="ui-btn-ghost" to="/dossies">Ver todos</Link>}
        />
        {loading ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="seed-skeleton h-80 rounded-[1.75rem]" />
            <div className="grid gap-4">
              <div className="seed-skeleton h-36 rounded-[1.5rem]" />
              <div className="seed-skeleton h-36 rounded-[1.5rem]" />
            </div>
          </div>
        ) : !featuredCollection ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum dossiê em destaque no momento.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Link to={`/dossies/${featuredCollection.slug}`} className="group block h-full">
              <EditorialCard variant="featured">
                <div className="relative min-h-[20rem] bg-gradient-to-br from-brand-primary-soft via-surface-1 to-surface-2">
                  {featuredCollection.cover_url ? (
                    <img src={getOptimizedCover(featuredCollection, "thumb") || ""} alt={featuredCollection.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="document-placeholder absolute inset-0" />
                  )}
                  <div className="absolute left-5 top-5">
                    <span className="seed-badge">Dossiê principal</span>
                  </div>
                </div>
                <EditorialCardBody className="justify-between">
                  <div className="space-y-3">
                    <EditorialCardTitle className="text-2xl md:text-[1.95rem]">{featuredCollection.title}</EditorialCardTitle>
                    {featuredCollection.excerpt ? <EditorialCardExcerpt className="line-clamp-4">{featuredCollection.excerpt}</EditorialCardExcerpt> : null}
                  </div>
                  <EditorialCardActions>
                    {featuredCollection.tags.slice(0, 3).map((tag) => <Chip key={tag} tone="active">{tag}</Chip>)}
                    <span className="ui-btn-ghost">Abrir dossiê</span>
                  </EditorialCardActions>
                </EditorialCardBody>
              </EditorialCard>
            </Link>
            <div className="grid gap-4">
              {secondaryCollections.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
                  <p className="text-sm text-text-secondary">Outros dossiês aparecerão aqui.</p>
                </div>
              ) : (
                secondaryCollections.map((col) => (
                  <Link key={col.id} to={`/dossies/${col.slug}`} className="group block h-full">
                    <EditorialCard variant="compact" className="grid gap-4 md:grid-cols-[112px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-[1.35rem] bg-surface-2">
                        {col.cover_url ? (
                          <img src={getOptimizedCover(col, "thumb") || ""} alt={col.title} loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="document-placeholder flex h-full min-h-28 items-center justify-center bg-gradient-to-br from-brand-primary-soft to-surface-2">
                            <IconShell tone="seed" className="h-11 w-11 rounded-full">
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </IconShell>
                          </div>
                        )}
                      </div>
                      <EditorialCardBody className="justify-between p-4 md:p-5">
                        <div className="space-y-2">
                          <EditorialCardEyebrow>Dossiê</EditorialCardEyebrow>
                          <EditorialCardTitle className="text-lg">{col.title}</EditorialCardTitle>
                          {col.excerpt ? <EditorialCardExcerpt className="line-clamp-2">{col.excerpt}</EditorialCardExcerpt> : null}
                        </div>
                        <div className="flex flex-wrap gap-2">{col.tags.slice(0, 2).map((tag) => <span key={tag} className="ui-chip">{tag}</span>)}</div>
                      </EditorialCardBody>
                    </EditorialCard>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <SectionHeader
          eyebrow="Corredores"
          title="Corredores climáticos"
          description="Rotas e recortes territoriais monitorados em linguagem mais sintética e visualmente mais territorial."
          action={<Link className="ui-btn-ghost" to="/corredores">Ver mapa</Link>}
        />
        {loading ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="seed-skeleton h-72 rounded-[1.75rem]" />
            <div className="space-y-4">
              <div className="seed-skeleton h-28 rounded-[1.5rem]" />
              <div className="seed-skeleton h-28 rounded-[1.5rem]" />
            </div>
          </div>
        ) : !featuredCorridor ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum corredor em destaque no momento.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <Link to={`/corredores/${featuredCorridor.slug}`} className="group block h-full">
              <EditorialCard variant="featured">
                <div className="relative min-h-[20rem] bg-gradient-to-br from-success/10 via-surface-1 to-surface-2">
                  {featuredCorridor.cover_url ? (
                    <img src={getOptimizedCover(featuredCorridor, "thumb") || featuredCorridor.cover_url} alt={featuredCorridor.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="floral-placeholder absolute inset-0" />
                  )}
                </div>
                <EditorialCardBody className="justify-between">
                  <div className="space-y-3">
                    <EditorialCardEyebrow>Corredor principal</EditorialCardEyebrow>
                    <EditorialCardTitle className="text-2xl md:text-[1.95rem]">{featuredCorridor.title}</EditorialCardTitle>
                    {featuredCorridor.excerpt ? <EditorialCardExcerpt>{featuredCorridor.excerpt}</EditorialCardExcerpt> : null}
                  </div>
                  <EditorialCardActions>
                    <span className="ui-btn-ghost">Explorar corredor</span>
                  </EditorialCardActions>
                </EditorialCardBody>
              </EditorialCard>
            </Link>
            <div className="grid gap-4">
              {supportingCorridors.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
                  <p className="text-sm text-text-secondary">Outros corredores aparecerão aqui.</p>
                </div>
              ) : (
                supportingCorridors.map((corridor) => (
                  <Link key={corridor.id} to={`/corredores/${corridor.slug}`} className="group block h-full">
                    <EditorialCard variant="compact" className="grid gap-4 md:grid-cols-[112px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-[1.35rem] bg-surface-2">
                        {corridor.cover_url ? (
                          <img src={getOptimizedCover(corridor, "thumb") || corridor.cover_url} alt={corridor.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="floral-placeholder flex h-full min-h-28 items-center justify-center bg-gradient-to-br from-success/10 to-surface-2">
                            <IconShell tone="seed" className="h-10 w-10 rounded-full">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                            </IconShell>
                          </div>
                        )}
                      </div>
                      <EditorialCardBody className="justify-between p-4 md:p-5">
                        <div className="space-y-2">
                          <EditorialCardEyebrow>Corredor</EditorialCardEyebrow>
                          <EditorialCardTitle className="text-lg">{corridor.title}</EditorialCardTitle>
                          {corridor.excerpt ? <EditorialCardExcerpt className="line-clamp-2">{corridor.excerpt}</EditorialCardExcerpt> : null}
                        </div>
                        <EditorialCardMeta>
                          <span>Explorar rota</span>
                        </EditorialCardMeta>
                      </EditorialCardBody>
                    </EditorialCard>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <SectionHeader
          eyebrow="Novidades"
          title="O que há de novo"
          description="Blog e transparência ganham uma leitura mais serena, com mais destaque para o conteúdo editorial e menos blocos equivalentes."
          action={<Link className="ui-btn-ghost" to="/status">Ver status</Link>}
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <div className="grid gap-4">
            <Link to={latestBlog ? `/blog/${latestBlog.slug}` : "/blog"} className="group block h-full">
              <EditorialCard variant="featured">
                <div className="relative min-h-[16rem] bg-gradient-to-br from-brand-primary-soft via-surface-1 to-surface-2">
                  {latestBlog?.cover_url ? (
                    <img src={getOptimizedCover(latestBlog, "thumb") || ""} alt={latestBlog.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="floral-placeholder absolute inset-0" />
                  )}
                </div>
                <EditorialCardBody className="justify-between">
                  <div className="space-y-3">
                    <EditorialCardEyebrow>Blog</EditorialCardEyebrow>
                    {latestBlog ? (
                      <>
                        <EditorialCardTitle className="text-2xl md:text-[1.9rem]">{latestBlog.title}</EditorialCardTitle>
                        <EditorialCardExcerpt className="line-clamp-4">{latestBlog.excerpt}</EditorialCardExcerpt>
                      </>
                    ) : (
                      <EditorialCardExcerpt>Nenhuma atualização recente.</EditorialCardExcerpt>
                    )}
                  </div>
                  <EditorialCardActions>
                    <span className="ui-btn-ghost">Ver todos os posts</span>
                  </EditorialCardActions>
                </EditorialCardBody>
              </EditorialCard>
            </Link>
            <Link to="/transparencia" className="group block h-full">
              <EditorialCard variant="compact">
                <div className="relative min-h-[11rem] bg-gradient-to-br from-brand-primary-soft/70 via-surface-1 to-surface-2">
                  <div className="brand-watermark absolute inset-0 opacity-30" aria-hidden="true" />
                </div>
                <EditorialCardBody className="justify-between">
                  <div className="space-y-2">
                    <EditorialCardEyebrow>Transparência financeira</EditorialCardEyebrow>
                    <EditorialCardTitle className="text-[1.55rem]">{transparency ? formatCurrency(transparency.total_cents) : "—"}</EditorialCardTitle>
                    <EditorialCardExcerpt>Recursos investidos no projeto.</EditorialCardExcerpt>
                  </div>
                  <EditorialCardActions>
                    <span className="ui-btn-ghost">Acessar prestação de contas</span>
                  </EditorialCardActions>
                </EditorialCardBody>
              </EditorialCard>
            </Link>
          </div>
          <div className="grid gap-4">
            <EditorialCard variant="compact">
              <EditorialCardBody className="justify-between">
                <div className="space-y-3">
                  <EditorialCardEyebrow>Resumo do sistema</EditorialCardEyebrow>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-surface-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Acervo</p>
                      <p className="mt-2 text-2xl font-black text-text-primary">{acervo.length}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Dossiês</p>
                      <p className="mt-2 text-2xl font-black text-text-primary">{collections.length}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Relatórios</p>
                      <p className="mt-2 text-2xl font-black text-text-primary">{reports.length}</p>
                    </div>
                  </div>
                </div>
              </EditorialCardBody>
            </EditorialCard>
            <EditorialCard variant="text">
              <EditorialCardBody className="justify-between">
                <div className="space-y-3">
                  <EditorialCardEyebrow>Chamada editorial</EditorialCardEyebrow>
                  <EditorialCardExcerpt>
                    O SEMEAR combina dados, memória e participação pública em uma experiência que precisa parecer uma referência institucional, não apenas um portal funcional.
                  </EditorialCardExcerpt>
                </div>
              </EditorialCardBody>
            </EditorialCard>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <SectionHeader
          eyebrow="Relatórios"
          title="Relatórios e notas técnicas"
          description="A última camada da home traz os documentos oficiais com destaque editorial, thumbnail reforçada e cards menos genéricos."
          action={<Link className="ui-btn-ghost" to="/relatorios">Ver todos</Link>}
        />
        {loading ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="seed-skeleton h-72 rounded-[1.75rem]" />
            <div className="space-y-4">
              <div className="seed-skeleton h-28 rounded-[1.5rem]" />
              <div className="seed-skeleton h-28 rounded-[1.5rem]" />
            </div>
          </div>
        ) : !featuredReport ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum relatório em destaque no momento.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Link to={`/relatorios/${featuredReport.slug}`} className="group block h-full">
              <EditorialCard variant="featured">
                <div className="relative min-h-[18rem] bg-gradient-to-br from-brand-primary-soft via-surface-1 to-surface-2">
                  {getOptimizedCover(featuredReport, "thumb") ? (
                    <img src={getOptimizedCover(featuredReport, "thumb") || ""} alt={`Capa de ${featuredReport.title}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="report-placeholder absolute inset-0 flex flex-col justify-between bg-gradient-to-br from-brand-primary-soft via-surface-1 to-surface-2 p-6">
                      <span className="seed-badge w-fit">SEMEAR</span>
                      <span className="max-w-md text-2xl font-black uppercase leading-tight text-text-primary">Relatórios e notas técnicas</span>
                    </div>
                  )}
                </div>
                <EditorialCardBody className="justify-between">
                  <div className="space-y-4">
                    <EditorialCardMeta>
                      <Chip tone="active">Destaque</Chip>
                      <Chip tone="default">{REPORT_KIND_LABEL[featuredReport.kind]}</Chip>
                    </EditorialCardMeta>
                    <EditorialCardTitle className="text-2xl md:text-[1.95rem]">{featuredReport.title}</EditorialCardTitle>
                    <EditorialCardExcerpt>{featuredReport.summary || "Documento oficial com leitura editorial e dados complementares."}</EditorialCardExcerpt>
                  </div>
                  <EditorialCardActions>
                    <span className="ui-btn-ghost">Abrir PDF</span>
                  </EditorialCardActions>
                </EditorialCardBody>
              </EditorialCard>
            </Link>
            <div className="grid gap-4">
              {supportingReports.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-border-subtle bg-surface-2 p-8 text-center">
                  <p className="text-sm text-text-secondary">Outros relatórios aparecerão aqui.</p>
                </div>
              ) : (
                supportingReports.map((report) => {
                  const thumbUrl = getOptimizedCover(report, "thumb");
                  return (
                    <Link key={report.id} to={`/relatorios/${report.slug}`} className="group block h-full">
                      <EditorialCard variant="compact" className="grid gap-4 md:grid-cols-[104px_minmax(0,1fr)]">
                        <div className="overflow-hidden rounded-[1.35rem] bg-surface-2">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={`Capa de ${report.title}`} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="document-placeholder flex h-full items-center justify-center bg-gradient-to-br from-brand-primary-soft to-surface-2 text-xs font-black uppercase tracking-[0.16em] text-brand-primary-dark">
                              PDF
                            </div>
                          )}
                        </div>
                        <EditorialCardBody className="justify-between p-4 md:p-5">
                          <div className="space-y-2">
                            <EditorialCardMeta>
                              <span className="ui-chip">{REPORT_KIND_LABEL[report.kind]}</span>
                              <span>{report.published_at ? new Date(report.published_at).toLocaleDateString("pt-BR") : "Sem data"}</span>
                            </EditorialCardMeta>
                            <EditorialCardTitle className="text-lg">{report.title}</EditorialCardTitle>
                            {report.summary ? <EditorialCardExcerpt className="line-clamp-2">{report.summary}</EditorialCardExcerpt> : null}
                          </div>
                        </EditorialCardBody>
                      </EditorialCard>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}
      </SurfaceCard>
    </section>
  );
}






