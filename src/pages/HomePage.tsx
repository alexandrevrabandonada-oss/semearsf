import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listAcervoItems, listStations, listUpcomingEvents, type AcervoItem, type Event, type Station } from "../lib/api";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [stationsData, eventsData, acervoData] = await Promise.all([
          listStations(),
          listUpcomingEvents(),
          listAcervoItems({ featured: true, limit: 6 })
        ]);
        setStations(stationsData);
        setEvents(eventsData.slice(0, 3));
        setAcervo(acervoData);
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
      </div>

      {/* Destaques do Acervo */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-wider text-cta">Destaques do Acervo</h2>
          <Link className="text-sm font-bold text-ciano hover:underline" to="/acervo">Ver tudo →</Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div className="h-40 animate-pulse rounded-xl bg-ciano/5" key={i} />
            ))}
          </div>
        ) : acervo.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ciano/30 py-8 text-center">
            <p className="text-sm text-texto/50">Nenhum destaque no acervo no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {acervo.map((item) => (
              <Link
                className="flex flex-col gap-2 rounded-xl border border-ciano/20 bg-fundo/70 p-5 transition-all hover:border-ciano hover:bg-fundo/90"
                key={item.id}
                to={`/acervo/item/${item.slug}`}
              >
                <span className="rounded-full bg-ciano/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ciano w-fit">
                  {item.kind}
                </span>
                <h3 className="line-clamp-2 font-bold text-texto">{item.title}</h3>
                {item.excerpt && <p className="line-clamp-2 text-xs text-texto/70">{item.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
