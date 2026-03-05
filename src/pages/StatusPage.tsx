import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSystemStatus, type SystemStatus } from "../lib/api";

export function StatusPage() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const data = await getSystemStatus();
                setStatus(data);
            } catch (err) {
                console.error("Erro ao carregar status do sistema:", err);
                setError("Não foi possível carregar as informações de status.");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    const formatCurrency = (cents: number) => {
        return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-ciano border-t-transparent" />
                <p className="text-sm font-bold uppercase tracking-widest text-ciano italic">Consultando sistemas...</p>
            </div>
        );
    }

    if (error || !status) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-acento/30 p-8 text-center">
                <div className="text-4xl">⚠️</div>
                <h2 className="mt-4 text-xl font-black text-acento uppercase">Falha na Conexão</h2>
                <p className="mt-2 text-sm text-texto/60">{error || "Erro ao obter diagnóstico."}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 rounded-lg bg-acento/10 px-6 py-2 text-xs font-bold uppercase tracking-wider text-acento hover:bg-acento/20"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ciano">Diagnóstico em Tempo Real</p>
                <h1 className="text-4xl font-black text-texto">Status do Sistema</h1>
                <p className="text-sm text-texto/60">Visão consolidada da integridade técnica e de conteúdo do portal.</p>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Monitoring Card */}
                <div className="rounded-2xl border border-ciano/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Rede de Monitoramento</h2>
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-primaria">{status.monitoring.stations_count}</span>
                            <span className="mb-1 text-[10px] font-bold uppercase tracking-tighter text-texto/40">Estações Ativas</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-texto">{status.monitoring.measurements_24h}</span>
                            <span className="mb-1 text-[10px] font-bold uppercase tracking-tighter text-texto/40">Medições (24h)</span>
                        </div>
                        {status.monitoring.latest_measurement && (
                            <div className="mt-2 rounded-lg bg-base/40 p-3">
                                <p className="text-[10px] font-bold uppercase text-ciano">{status.monitoring.latest_measurement.station_name}</p>
                                <p className="text-xs text-texto/80 font-mono">
                                    {new Date(status.monitoring.latest_measurement.ts).toLocaleTimeString("pt-BR")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Push Alerts Card */}
                <div className="rounded-2xl border border-acento/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Alertas (7 dias)</h2>
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-acento">{status.alerts.total_7d}</span>
                            <span className="mb-1 text-[10px] font-bold uppercase tracking-tighter text-texto/40">Triggers</span>
                        </div>
                        {status.alerts.top_stations.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-ciano/70">Top Estações</p>
                                {status.alerts.top_stations.map((station, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-texto/60 font-mono">{station.station_code}</span>
                                        <span className="font-black text-acento">{station.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {status.alerts.top_pollutants.length > 0 && (
                            <div className="space-y-2 mt-3">
                                <p className="text-[10px] font-bold uppercase text-ciano/70">Top Poluentes</p>
                                {status.alerts.top_pollutants.map((pol, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-texto/60">{pol.pollutant}</span>
                                        <span className="font-black text-acento">{pol.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Transparency Card */}
                <div className="rounded-2xl border border-primaria/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Transparência</h2>
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-primaria">{formatCurrency(status.transparency.total_cents)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-texto/40 italic">Total de recursos aplicados</span>
                        </div>
                        <div className="space-y-2 mt-2">
                            {Object.entries(status.transparency.by_category).slice(0, 3).map(([cat, amount]) => (
                                <div className="flex justify-between items-center text-xs" key={cat}>
                                    <span className="text-texto/60 capitalize">{cat}</span>
                                    <span className="font-bold text-texto">{formatCurrency(amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Link to="/transparencia" className="mt-auto pt-6 text-xs font-bold text-ciano hover:underline">Detalhes financeiros →</Link>
                </div>

                {/* Content Signals */}
                <div className="rounded-2xl border border-acento/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Sinais de Conteúdo</h2>
                    <div className="mt-6 space-y-4 flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-texto/70 italic">Blog</span>
                            <span className="text-xs font-black text-texto">{status.content.latest_blog.length} Recentes</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-texto/70 italic">Acervo</span>
                            <span className="text-xs font-black text-texto">{status.content.latest_acervo.length} Itens</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-texto/70 italic">Agenda</span>
                            <span className="text-xs font-black text-texto">{status.content.upcoming_events.length} Eventos</span>
                        </div>
                    </div>
                    <p className="mt-auto text-[10px] text-texto/40 uppercase tracking-tighter">Sincronizado</p>
                </div>

                {/* Network Health Card */}
                <div className="rounded-2xl border border-ciano/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Saúde da Rede</h2>
                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div style={{ backgroundColor: '#22c55e', borderRadius: '4px', width: '20px', height: '20px' }}></div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-texto/70">Excelente</span>
                                <span className="text-sm font-black text-texto ml-auto">{status.network_health?.ok || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div style={{ backgroundColor: '#eab308', borderRadius: '4px', width: '20px', height: '20px' }}></div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-texto/70">Degradado</span>
                                <span className="text-sm font-black text-texto ml-auto">{status.network_health?.degraded || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div style={{ backgroundColor: '#ef4444', borderRadius: '4px', width: '20px', height: '20px' }}></div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-texto/70">Offline</span>
                                <span className="text-sm font-black text-texto ml-auto">{status.network_health?.offline || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Reach Card */}
                <div className="rounded-2xl border border-base/40 bg-fundo/60 p-6 flex flex-col md:col-span-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-cta">Alcance Social (7 dias)</h2>
                            <div className="mt-4 flex items-end gap-3">
                                <span className="text-5xl font-black text-base">{status.social.total_7d}</span>
                                <span className="mb-2 text-[10px] font-bold uppercase tracking-tighter text-texto/40 italic">Cliques de compartilhamento</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase text-texto/30 tracking-widest">Top Engajamento</p>
                            <div className="mt-2 space-y-1">
                                {status.social.top_slugs.length === 0 ? (
                                    <p className="text-[10px] text-texto/20 italic">Sem dados recentes</p>
                                ) : (
                                    status.social.top_slugs.map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-end justify-center mb-1">
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <span className="text-texto/40 font-mono">/{item.slug}</span>
                                                <span className="font-black text-base italic">{item.count}</span>
                                            </div>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-ciano/50">
                                                {item.kind === 'dossies' ? 'Dossiê' : item.kind === 'dados' ? 'Estação' : item.kind}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed Consolidado */}
            <div className="grid gap-10 md:grid-cols-2">
                {/* Atividades e Blog */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-cta uppercase tracking-widest">Próximos Passos</h3>
                    <div className="space-y-4">
                        {status.content.upcoming_events.length === 0 ? (
                            <p className="text-sm text-texto/40 italic">Nenhum evento agendado.</p>
                        ) : (
                            status.content.upcoming_events.map(ev => (
                                <div key={ev.id} className="border-l-2 border-acento pl-4">
                                    <p className="text-[10px] font-bold text-acento uppercase">{new Date(ev.start_at).toLocaleDateString()}</p>
                                    <p className="text-sm font-bold text-texto">{ev.title}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 border-t border-ciano/20">
                        <h4 className="text-sm font-black text-ciano uppercase tracking-widest mb-4">Blog</h4>
                        <div className="space-y-3">
                            {status.content.latest_blog.length === 0 ? (
                                <p className="text-xs text-texto/40 italic">Nenhum post disponível.</p>
                            ) : (
                                status.content.latest_blog.map(post => (
                                    <Link to={`/blog/${post.slug}`} key={post.id} className="block group">
                                        <p className="text-xs font-bold text-texto group-hover:text-ciano transition-colors">{post.title}</p>
                                        <p className="text-[10px] text-texto/50 uppercase">{new Date(post.published_at!).toLocaleDateString()}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Acervo */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-cta uppercase tracking-widest">Memória Digital</h3>
                    <div className="space-y-4">
                        {status.content.latest_acervo.length === 0 ? (
                            <p className="text-sm text-texto/40 italic">Acervo vazio.</p>
                        ) : (
                            status.content.latest_acervo.map(item => (
                                <Link to={`/acervo/item/${item.slug}`} key={item.id} className="flex flex-col border border-ciano/20 bg-base/20 rounded-xl p-4 hover:border-ciano/40 transition-all">
                                    <span className="text-[10px] font-bold text-ciano uppercase tracking-widest">{item.kind}</span>
                                    <span className="text-sm font-bold text-texto mt-1">{item.title}</span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
