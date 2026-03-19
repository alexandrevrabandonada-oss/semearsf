import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { AcervoItem, Event, StationOverview, BlogPost, TransparencySummary, AcervoCollection, ClimateCorridor, ReportDocument } from "../lib/api";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { getOptimizedCover } from "../lib/imageOptimization";
import { INSTITUTIONAL_COORDINATION, INSTITUTIONAL_TAGLINE, INSTITUTIONAL_UNIVERSITY_FULL_NAME } from "../content/institucional";

const REPORT_KIND_LABEL: Record<ReportDocument["kind"], string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

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

  const onlineCount = stations.filter(s => s.is_online).length;
  const offlineCount = stations.length - onlineCount;

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <section className="space-y-8">
      {/* Hero Section - Institutional Portal */}
      <div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-white via-white to-bg-surface/30 p-8 shadow-sm md:p-12">
        {/* Institutional Lockup */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black uppercase tracking-[0.18em] text-brand-primary-dark md:text-4xl">
                SEMEAR
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {INSTITUTIONAL_COORDINATION}
              </p>
            </div>
            <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-white text-[10px] font-bold tracking-[0.12em] text-text-primary/60" aria-label={INSTITUTIONAL_UNIVERSITY_FULL_NAME}>
              UFF
            </div>
          </div>
          <div className="h-1 w-24 bg-accent-green rounded-full" aria-hidden="true" />
        </div>

        {/* Main Heading with clear hierarchy */}
        <div className="space-y-4 border-t border-border-subtle pt-6">
          <h1 className="text-4xl font-black leading-tight text-text-primary md:text-5xl lg:text-6xl">
            Monitoramento da Qualidade do Ar e Memória Socioambiental
          </h1>
          <p className="max-w-3xl text-base text-text-secondary md:text-lg leading-relaxed">
            {INSTITUTIONAL_TAGLINE}. Plataforma pública-universitária que reúne dados científicos em tempo real, acervo histórico curado, rodas de conversa inclusivas e atividades participativas de vigilância popular em saúde.
          </p>
        </div>

        {/* Institutional Search */}
        <div className="mt-8 max-w-2xl">
          <label htmlFor="home-search" className="mb-2 block text-sm font-semibold text-text-primary">
            Buscar no portal
          </label>
          <div className="relative group">
            <input
              id="home-search"
              type="search"
              placeholder="Digite palavras-chave (ex: qualidade do ar, eventos, documentos...)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value;
                  if (q.trim()) window.location.href = `/buscar?q=${encodeURIComponent(q)}`;
                }
              }}
              className="w-full rounded-lg border-2 border-border-subtle bg-white px-6 py-4 pr-12 text-base text-text-primary placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap gap-4">
          {prompt && (
            <button
              onClick={async () => {
                await prompt.prompt();
                const { outcome } = await prompt.userChoice;
                if (outcome === 'accepted') clearPrompt();
              }}
              className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-primary-dark hover:shadow-md"
            >
              📱 Instalar Aplicativo
            </button>
          )}
          <Link 
            to="/dados" 
            className="rounded-lg bg-accent-green px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-success hover:shadow-md"
          >
            Dados em Tempo Real
          </Link>
          <Link 
            to="/agenda" 
            className="rounded-lg border-2 border-brand-primary bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
          >
            Agenda de Atividades
          </Link>
          <Link 
            to="/acervo" 
            className="rounded-lg border-2 border-text-secondary/30 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-text-primary transition-all hover:border-brand-primary hover:text-brand-primary"
          >
            Explorar Acervo
          </Link>
        </div>
      </div>

      {/* Dados Agora - Real-time monitoring */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/10 text-accent-green">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary">Dados Agora</h2>
            <p className="text-sm text-text-secondary">Monitoramento em tempo real</p>
          </div>
        </div>

        {loading ? (
          <div className="h-32 w-full animate-pulse rounded-lg bg-bg-surface" />
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-success">{onlineCount}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Estações Online</span>
              </div>
              <div className="h-12 w-px bg-border-subtle" />
              <div className="flex flex-col">
                <span className="text-4xl font-black text-text-secondary">{offlineCount}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Offline</span>
              </div>
            </div>

            <div className="space-y-3 rounded-lg bg-bg-surface p-4">
              {stations.filter(s => s.pm25 !== null).slice(0, 2).map(s => (
                <div key={s.station_id} className="flex items-center justify-between border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                  <span className="text-sm font-semibold text-text-primary truncate mr-4">{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-text-primary">{Math.round(s.pm25!)} µg/m³</span>
                    <span className="text-xs text-text-secondary">{new Date(s.last_ts!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              <p className="pt-2 text-xs text-text-secondary italic">
                Medições de MP2.5 (material particulado fino)
              </p>
            </div>
          </div>
        )}

        <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/dados">
          Acessar painel completo de dados
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Próximas Atividades */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-yellow/10 text-accent-brown">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary">Próximas Atividades</h2>
            <p className="text-sm text-text-secondary">Agenda pública de eventos e encontros</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 w-full animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-20 w-full animate-pulse rounded-lg bg-bg-surface" />
          </div>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum evento publicado para os próximos dias.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to="/agenda"
                className="group flex items-center gap-4 rounded-lg border border-border-subtle bg-white p-4 transition-all hover:border-brand-primary hover:shadow-md"
              >
                <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-accent-yellow/10 text-accent-brown">
                  <span className="text-xl font-black">{new Date(event.start_at).getDate()}</span>
                  <span className="text-xs font-semibold uppercase">{new Date(event.start_at).toLocaleDateString("pt-BR", { month: "short" })}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-text-primary group-hover:text-brand-primary">{event.title}</h3>
                  <p className="text-xs text-text-secondary">{new Date(event.start_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/agenda">
          Ver agenda completa
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Dossiês em Destaque */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-primary">Dossiês em Destaque</h2>
              <p className="text-sm text-text-secondary">Coleções temáticas curadas</p>
            </div>
          </div>
          <Link className="text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/dossies">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-bg-surface" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent p-12 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <svg className="h-8 w-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-black text-text-primary">Explore o Acervo Completo</p>
              <p className="text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Estamos preparando dossiês temáticos curados sobre qualidade do ar, memória industrial e saúde. 
                Enquanto isso, mergulhe em nosso acervo de documentos, fotografias, artigos científicos e testemunhos.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link 
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-primary-dark hover:shadow-md"
                to="/acervo"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-6-4a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
                Explorar Acervo
              </Link>
              <Link 
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand-primary bg-white px-6 py-3 text-sm font-bold text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
                to="/acervo/linha"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ver Linha do Tempo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {collections.map((col) => (
              <div
                key={col.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm transition-all hover:border-brand-primary hover:shadow-md"
              >
                {col.cover_url && (
                  <Link to={`/dossies/${col.slug}`} className="aspect-video w-full overflow-hidden bg-bg-surface">
                    <img
                      src={getOptimizedCover(col, 'thumb') || ''}
                      alt={col.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <Link to={`/dossies/${col.slug}`}>
                    <h3 className="text-lg font-bold text-text-primary transition-colors group-hover:text-brand-primary">{col.title}</h3>
                  </Link>
                  {col.excerpt && <p className="mt-2 text-sm text-text-secondary line-clamp-2">{col.excerpt}</p>}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {col.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Link
                      to={`/dossies/${col.slug}`}
                      className="flex-1 rounded-lg bg-brand-primary px-4 py-2 text-center text-sm font-bold text-white transition-all hover:bg-brand-primary-dark"
                    >
                      Abrir Dossiê
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const shareUrl = `${window.location.origin}/s/dossies/${col.slug}`;
                        if (navigator.share) {
                          navigator.share({ title: col.title, text: col.excerpt || '', url: shareUrl }).catch(() => { });
                        } else {
                          navigator.clipboard.writeText(shareUrl);
                          alert("Link copiado para a área de transferência!");
                        }
                      }}
                      className="flex items-center justify-center rounded-lg border border-border-subtle bg-white px-3 py-2 text-text-secondary transition-all hover:border-brand-primary hover:text-brand-primary"
                      aria-label="Compartilhar dossiê"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Destaques do Acervo */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-brown/10 text-accent-brown">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-primary">Destaques do Acervo</h2>
              <p className="text-sm text-text-secondary">Documentos, imagens e memória histórica</p>
            </div>
          </div>
          <Link className="text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/acervo">
            Ver acervo completo →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-bg-surface" />
            ))}
          </div>
        ) : acervo.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum destaque disponível.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            {acervo.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                to={`/acervo/item/${item.slug}`}
                className="group flex flex-col gap-2 rounded-lg border border-border-subtle bg-white p-4 transition-all hover:border-brand-primary hover:shadow-md"
              >
                <span className="inline-block rounded-full bg-accent-brown/10 px-2 py-1 text-xs font-semibold text-accent-brown">
                  {item.kind}
                </span>
                <h3 className="line-clamp-2 text-sm font-bold text-text-primary group-hover:text-brand-primary">{item.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Corredores Climáticos */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-primary">Corredores Climáticos</h2>
              <p className="text-sm text-text-secondary">Rotas e recortes territoriais monitorados</p>
            </div>
          </div>
          <Link className="text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/corredores">
            Ver mapa →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-bg-surface" />
            ))}
          </div>
        ) : corridors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum corredor em destaque no momento.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {corridors.map((c) => (
              <Link
                key={c.id}
                to={`/corredores/${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm transition-all hover:border-success hover:shadow-md"
              >
                {c.cover_url && (
                  <div className="h-48 w-full overflow-hidden bg-bg-surface">
                    <img
                      src={getOptimizedCover(c, "thumb") || c.cover_url}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 text-lg font-bold text-text-primary transition-colors group-hover:text-success">
                    {c.title}
                  </h3>
                  {c.excerpt && (
                    <p className="mb-4 flex-grow text-sm text-text-secondary line-clamp-2">
                      {c.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm font-bold text-success">
                    <span>Explorar corredor</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Relatórios e Notas Técnicas */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h10M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H9l-3 3v11a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-primary">Relatórios e Notas Técnicas</h2>
              <p className="text-sm text-text-secondary">Publicações oficiais em PDF</p>
            </div>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-bold text-brand-primary transition-colors hover:border-brand-primary hover:bg-brand-primary/5"
            to="/relatorios"
          >
            Ver todos
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-bg-surface" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum relatório em destaque no momento.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {reports.map((report) => {
              const thumbUrl = getOptimizedCover(report, "thumb");
              return (
                <Link
                  key={report.id}
                  to={
                    "/relatorios/" + report.slug
                  }
                  className="group overflow-hidden rounded-2xl border border-border-subtle bg-white transition-all hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md"
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={"Capa de " + report.title}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 flex-col justify-between bg-gradient-to-br from-brand-primary/10 via-white to-bg-surface p-5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">SEMEAR</span>
                      <span className="max-w-[12rem] text-base font-black uppercase leading-tight text-text-primary">
                        Relatórios e notas técnicas
                      </span>
                    </div>
                  )}
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                        Destaque
                      </span>
                      <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        {REPORT_KIND_LABEL[report.kind]}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-black text-text-primary group-hover:text-brand-primary">{report.title}</h3>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                      {report.published_at ? new Date(report.published_at).toLocaleDateString("pt-BR") : "Sem data"}
                    </p>
                    {report.summary && (
                      <p className="text-sm text-text-secondary line-clamp-3">{report.summary}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* O Que Há de Novo - Blog + Transparência */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary">O Que Há de Novo</h2>
            <p className="text-sm text-text-secondary">Últimas atualizações e transparência</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Blog Latest */}
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-primary">Última Publicação do Blog</p>
            {loading ? (
              <div className="h-20 animate-pulse rounded-lg bg-white" />
            ) : latestBlog ? (
              <Link to={`/blog/${latestBlog.slug}`} className="group block">
                <h3 className="text-base font-bold text-text-primary group-hover:text-brand-primary">{latestBlog.title}</h3>
                <p className="mt-2 text-xs text-text-secondary">{new Date(latestBlog.published_at!).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </Link>
            ) : (
              <p className="text-sm text-text-secondary italic">Nenhum post recente.</p>
            )}
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/blog">
              Ver todos os posts
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Transparency */}
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-primary">Transparência Financeira</p>
            {loading ? (
              <div className="h-20 animate-pulse rounded-lg bg-white" />
            ) : transparency ? (
              <div>
                <p className="text-3xl font-black text-text-primary">{formatCurrency(transparency.total_cents)}</p>
                <p className="mt-2 text-xs text-text-secondary">Recursos investidos no projeto</p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary italic">Sem dados financeiros disponíveis.</p>
            )}
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/transparencia">
              Acessar prestação de contas
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline" to="/status">
          Ver status completo do sistema
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

    </section>
  );
}

