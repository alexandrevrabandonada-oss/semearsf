import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listAcervoItems, listBlogPosts, listStations, listUpcomingEvents, getTransparencySummary, listCollections, type AcervoItem, type Event, type Station, type BlogPost, type TransparencySummary, type AcervoCollection } from "../lib/api";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

function getStationOnlineStatus(station: Station) {
  const lastSeen = typeof station.last_seen_at === "string" ? new Date(station.last_seen_at) : null;
  if (!lastSeen || Number.isNaN(lastSeen.getTime())) return false;
  return Date.now() - lastSeen.getTime() <= ONLINE_THRESHOLD_MS;
}

export function HomePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [acervo, setAcervo] = useState<AcervoItem[]>([]);
  const [latestBlog, setLatestBlog] = useState<BlogPost | null>(null);
  const [transparency, setTransparency] = useState<TransparencySummary | null>(null);
  const [collections, setCollections] = useState<AcervoCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [stationsData, eventsData, acervoData, blogData, transData, collectionsData] = await Promise.all([
          listStations(),
          listUpcomingEvents(),
          listAcervoItems({ featured: true, limit: 6 }),
          listBlogPosts({ limit: 1 }),
          getTransparencySummary(),
          listCollections()
        ]);
        setStations(stationsData);
        setEvents(eventsData.slice(0, 3));
        setAcervo(acervoData);
        setLatestBlog(blogData[0] || null);
        setTransparency(transData);
        setCollections((collectionsData as AcervoCollection[]).slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
        setError("Não foi possível carregar as informações em tempo real.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const onlineCount = stations.filter(getStationOnlineStatus).length;
  const offlineCount = stations.length - onlineCount;

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <section className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-2xl border border-primaria/60 bg-fundo/90 p-8 shadow-[0_0_0_1px_rgba(24,165,114,0.25)] md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ciano">Portal SEMEAR</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-texto md:text-5xl">
          Ciência aberta e memória pública em um único lugar.
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-texto/90 md:text-base">
          Acompanhe os dados de qualidade do ar em tempo real, participe das nossas atividades e explore o acervo curado pela equipe SEMEAR.
        </p>
        <div className="mt-8 relative max-w-xl group">
          <input
            type="text"
            placeholder="Buscar no acervo e no projeto..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value;
                if (q.trim()) window.location.href = `/buscar?q=${encodeURIComponent(q)}`;
              }
            }}
            className="w-full rounded-xl border border-ciano/30 bg-base/20 p-4 pr-12 text-sm font-bold text-texto placeholder:text-texto/40 focus:border-ciano focus:outline-none transition-all group-hover:border-ciano/50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ciano/40 pointer-events-none">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-lg bg-cta px-5 py-3 text-sm font-black uppercase tracking-wide text-base transition-transform hover:-translate-y-0.5 hover:bg-cta/90" to="/dados">
            Ver dados agora
          </Link>
          <Link className="rounded-lg bg-ciano px-5 py-3 text-sm font-black uppercase tracking-wide text-base transition-transform hover:-translate-y-0.5 hover:bg-ciano/90" to="/agenda">
            Ver agenda
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dado Agora */}
        <div className="flex flex-col rounded-2xl border border-ciano/40 bg-fundo/60 p-6 transition-all hover:border-ciano/60">
          <h2 className="text-lg font-black uppercase tracking-wide text-cta">Dado agora</h2>
          <div className="mt-4 flex flex-1 flex-col justify-center gap-4">
            {loading ? (
              <div className="h-12 w-full animate-pulse rounded-lg bg-ciano/10" />
            ) : error ? (
              <p className="text-sm text-acento/80">{error}</p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-primaria">{onlineCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-texto/50">Online</span>
                </div>
                <div className="h-8 w-px bg-ciano/20" />
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-acento">{offlineCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-texto/50">Offline</span>
                </div>
                <div className="ml-auto text-xs text-texto/70 italic">
                  Monitoramento local em tempo real.
                </div>
              </div>
            )}
          </div>
          <Link className="mt-6 text-sm font-bold text-ciano hover:underline" to="/dados">
            Acessar painel de dados →
          </Link>
        </div>

        {/* O Que Há de Novo (Blog + Transparência) */}
        <div className="flex flex-col rounded-2xl border border-primaria/40 bg-fundo/60 p-6 transition-all hover:border-primaria/60">
          <h2 className="text-lg font-black uppercase tracking-wide text-cta">O que há de novo</h2>
          <div className="mt-4 flex flex-1 flex-col gap-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-20 w-full animate-pulse rounded-lg bg-primaria/10" />
                <div className="h-12 w-full animate-pulse rounded-lg bg-primaria/10" />
              </div>
            ) : (
              <>
                {/* Blog Signal */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primaria">Última do Blog</p>
                  {latestBlog ? (
                    <Link to={`/blog/${latestBlog.slug}`} className="group block">
                      <h3 className="text-sm font-bold leading-snug text-texto group-hover:text-ciano">{latestBlog.title}</h3>
                      <p className="text-[10px] text-texto/50 uppercase mt-1">{new Date(latestBlog.published_at!).toLocaleDateString()}</p>
                    </Link>
                  ) : (
                    <p className="text-xs text-texto/40 italic">Nenhum post recente.</p>
                  )}
                </div>

                {/* Transparency Signal */}
                <div className="mt-auto pt-4 border-t border-primaria/10 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primaria">Transparência</p>
                  {transparency ? (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-texto">{formatCurrency(transparency.total_cents)}</span>
                      <Link to="/transparencia" className="text-[10px] font-bold text-ciano hover:underline uppercase">Auditável →</Link>
                    </div>
                  ) : (
                    <p className="text-xs text-texto/40 italic">Sem dados financeiros.</p>
                  )}
                </div>
              </>
            )}
          </div>
          <Link className="mt-6 text-sm font-bold text-primaria hover:underline" to="/status">
            Ver status do sistema →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Próximas Atividades */}
        <div className="flex flex-col rounded-2xl border border-acento/40 bg-fundo/60 p-6 transition-all hover:border-acento/60">
          <h2 className="text-lg font-black uppercase tracking-wide text-cta">Próximas atividades</h2>
          <div className="mt-4 flex flex-1 flex-col gap-3">
            {loading ? (
              <div className="space-y-2">
                <div className="h-10 w-full animate-pulse rounded-lg bg-acento/10" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-acento/10" />
              </div>
            ) : error ? (
              <p className="text-sm text-acento/80">{error}</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-texto/50 italic">Nenhum evento publicado para os próximos dias.</p>
            ) : (
              events.map((event) => (
                <Link
                  className="group flex flex-col rounded-lg border border-acento/20 bg-base/40 p-3 transition-colors hover:bg-base/60"
                  key={event.id}
                  to="/agenda"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-acento">
                    {new Date(event.start_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-texto group-hover:text-cta">{event.title}</span>
                </Link>
              ))
            )}
          </div>
          <Link className="mt-6 text-sm font-bold text-acento hover:underline" to="/agenda">
            Ver agenda completa →
          </Link>
        </div>

        {/* Destaques do Acervo */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wide text-cta">Destaques do Acervo</h2>
            <Link className="text-sm font-bold text-ciano hover:underline" to="/acervo">Ver tudo →</Link>
          </div>

          {loading ? (
            <div className="grid gap-3 md:grid-cols-2 flex-1">
              {[1, 2].map((i) => (
                <div className="h-24 animate-pulse rounded-xl bg-ciano/5" key={i} />
              ))}
            </div>
          ) : acervo.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ciano/30 py-4 text-center flex-1 flex items-center justify-center">
              <p className="text-xs text-texto/50 italic">Nenhum destaque.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 flex-1">
              {acervo.slice(0, 4).map((item) => (
                <Link
                  className="flex flex-col gap-1 rounded-xl border border-ciano/20 bg-fundo/70 p-4 transition-all hover:border-ciano hover:bg-fundo/90"
                  key={item.id}
                  to={`/acervo/item/${item.slug}`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-ciano">
                    {item.kind}
                  </span>
                  <h3 className="line-clamp-1 text-sm font-bold text-texto">{item.title}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Collections (Dossiês) */}
      <div className="rounded-2xl border border-ciano/40 bg-fundo/60 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-wide text-cta md:text-2xl">Dossiês em Destaque</h2>
          <Link className="text-sm font-bold text-ciano hover:underline" to="/dossies">Ver todos →</Link>
        </div>
        <p className="mt-2 text-sm text-texto/70">Explore coleções temáticas curadas pelo nosso time.</p>

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-ciano/5" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <p className="mt-6 text-sm text-texto/50 italic">Nenhuma coleção em destaque no momento.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/dossies/${col.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-ciano/20 bg-base/20 transition-all hover:border-ciano/50 hover:bg-base/40"
              >
                {col.cover_url && (
                  <div className="aspect-video w-full overflow-hidden bg-ciano/5 relative">
                    {/* CSS Blur Placeholder Pattern */}
                    <img
                      src={col.cover_small_url || col.cover_thumb_url || col.cover_url}
                      alt={col.title}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                      style={
                        (!col.cover_small_url && !col.cover_thumb_url) ? {} : {
                          filter: 'blur(0)', // In a real implementation we would transition this on image load
                        }
                      }
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-texto group-hover:text-cta">{col.title}</h3>
                  {col.excerpt && <p className="mt-2 text-xs text-texto/80 line-clamp-2">{col.excerpt}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {col.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-ciano/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ciano">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
