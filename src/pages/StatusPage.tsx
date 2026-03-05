import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSystemStatus, type SystemStatus } from "../lib/api";
import { getContrastAuditResults } from "../lib/contrastAudit";

export function StatusPage() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOpsHelp, setShowOpsHelp] = useState(false);

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

    const formatNumber = (value: number) => value.toLocaleString("pt-BR");
    const totalAboveThreshold24h = (status?.operations?.station_metrics ?? []).reduce((sum, station) => sum + (station.above_threshold_24h || 0), 0);
    const socialLabels: Record<string, string> = {
        dados: "Dados",
        agenda: "Agenda",
        blog: "Blog",
        acervo: "Acervo",
        dossies: "Dossies",
        relatorios: "Relatorios"
    };
    const socialKindsOrder = ["dados", "agenda", "blog", "acervo", "dossies", "relatorios"];
    const socialByKind = status?.social?.by_kind ?? {};
    const isDevAccessibilityVisible = import.meta.env.MODE !== "production";
    const contrastAudit = getContrastAuditResults();
    const contrastFailures = contrastAudit.filter((item) => !item.passes);

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

                <div className="rounded-2xl border border-primaria/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Transparência (7 dias / mês atual)</h2>
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-primaria">{formatCurrency(status.transparency.current_month_total_cents)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-texto/40 italic">Total no mês atual</span>
                            <span className="text-[10px] text-texto/50">{formatNumber(status.transparency.current_month_count)} lançamentos</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-ciano">{formatCurrency(status.transparency.last_7d_total_cents)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-texto/40 italic">Total nos últimos 7 dias</span>
                            <span className="text-[10px] text-texto/50">{formatNumber(status.transparency.last_7d_count)} lançamentos</span>
                        </div>
                        <div className="space-y-2 mt-2">
                            {Object.entries(status.transparency.current_month_by_category).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 3).map(([cat, amount]) => (
                                <div className="flex justify-between items-center text-xs" key={cat}>
                                    <span className="text-texto/60 capitalize">{cat}</span>
                                    <span className="font-bold text-texto">{formatCurrency(amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-3 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ciano/80">Top categorias (7 dias)</p>
                        {Object.entries(status.transparency.last_7d_by_category).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 3).map(([cat, amount]) => (
                            <div className="flex justify-between items-center text-xs" key={`last7-${cat}`}>
                                <span className="text-texto/60 capitalize">{cat}</span>
                                <span className="font-bold text-texto">{formatCurrency(amount)}</span>
                            </div>
                        ))}
                        {Object.keys(status.transparency.last_7d_by_category).length === 0 && (
                            <p className="text-[10px] text-texto/50 italic">Sem lançamentos nos últimos 7 dias.</p>
                        )}
                    </div>
                    <Link to="/transparencia" className="mt-auto pt-3 text-xs font-bold text-ciano hover:underline">Detalhes financeiros →</Link>
                </div>

                <div className="rounded-2xl border border-ciano/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Alcance social (7 dias)</h2>
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-ciano">{formatNumber(status.social.total_7d)}</span>
                            <span className="mb-1 text-[10px] font-bold uppercase tracking-tighter text-texto/40">Compartilhamentos</span>
                        </div>
                        <div className="space-y-2">
                            {socialKindsOrder.map((kind) => (
                                <div key={kind} className="flex items-center justify-between text-xs">
                                    <span className="text-texto/60">{socialLabels[kind] || kind}</span>
                                    <span className="font-black text-texto">{formatNumber(Number(socialByKind[kind] || 0))}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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

                <div className="rounded-2xl border border-ciano/40 bg-fundo/60 p-6 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-cta">Saúde da Rede</h2>
                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div style={{ backgroundColor: "#22c55e", borderRadius: "4px", width: "20px", height: "20px" }}></div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-texto/70">Excelente</span>
                                <span className="text-sm font-black text-texto ml-auto">{status.network_health?.ok || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div style={{ backgroundColor: "#eab308", borderRadius: "4px", width: "20px", height: "20px" }}></div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-texto/70">Degradado</span>
                                <span className="text-sm font-black text-texto ml-auto">{status.network_health?.degraded || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div style={{ backgroundColor: "#ef4444", borderRadius: "4px", width: "20px", height: "20px" }}></div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-texto/70">Offline</span>
                                <span className="text-sm font-black text-texto ml-auto">{status.network_health?.offline || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isDevAccessibilityVisible && (
                    <div className="rounded-2xl border border-amber-500/30 bg-fundo/60 p-6 flex flex-col md:col-span-3">
                        <h2 className="text-xs font-black uppercase tracking-widest text-cta">Acessibilidade (dev)</h2>
                        <div className="mt-4 flex flex-wrap items-end gap-6">
                            <div>
                                <p className="text-3xl font-black text-texto">{formatNumber(contrastAudit.length)}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-texto/60">Combinações auditadas</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-amber-500">{formatNumber(contrastFailures.length)}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-texto/60">Abaixo do AA</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {contrastAudit.map((item) => (
                                <div key={item.name} className="flex flex-col gap-1 rounded-lg border border-base/20 bg-base/10 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-bold text-texto">{item.name}</p>
                                        <p className="text-texto/60">{item.foreground} em {item.background}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className={item.passes ? "font-black text-green-600" : "font-black text-amber-500"}>{item.ratio.toFixed(2)}:1</p>
                                        <p className="text-texto/60">mínimo {(item.minRatio ?? 4.5).toFixed(1)}:1</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-texto/60">Este bloco aparece apenas fora de produção para revisar contraste do design system.</p>
                    </div>
                )}

                <div className="rounded-2xl border border-base/40 bg-fundo/60 p-6 flex flex-col md:col-span-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xs font-black uppercase tracking-widest text-cta">Operação (últimos 7 dias)</h2>
                        <button
                            type="button"
                            onClick={() => setShowOpsHelp(true)}
                            className="text-left text-xs font-bold text-ciano hover:underline sm:text-right"
                        >
                            Como ler estes números?
                        </button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-ciano/20 bg-base/20 p-4">
                            <p className="text-2xl font-black text-ciano">{formatNumber(status.operations.kpis.total_measurements)}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Total de medições</p>
                            <p className="mt-1 text-xs text-texto/50">Registros válidos recebidos no período.</p>
                        </div>
                        <div className="rounded-xl border border-primaria/20 bg-base/20 p-4">
                            <p className="text-2xl font-black text-primaria">{formatNumber(status.operations.kpis.inserted_count)}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Ingest inserido</p>
                            <p className="mt-1 text-xs text-texto/50">Entradas novas gravadas pela rotina hardenizada.</p>
                        </div>
                        <div className="rounded-xl border border-acento/20 bg-base/20 p-4">
                            <p className="text-2xl font-black text-acento">{formatNumber(status.operations.kpis.duplicated_count)}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Ingest duplicado</p>
                            <p className="mt-1 text-xs text-texto/50">Repetições detectadas e não reinseridas.</p>
                        </div>
                        <div className="rounded-xl border border-base/40 bg-base/20 p-4">
                            <p className="text-2xl font-black text-base">{formatNumber(status.operations.kpis.total_push_alerts)}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Alertas disparados</p>
                            <p className="mt-1 text-xs text-texto/50">Eventos `push_events` com trigger ativo.</p>
                        </div>
                        <div className="rounded-xl border border-base/40 bg-base/20 p-4">
                            <p className="text-2xl font-black text-texto">{formatNumber(status.operations.kpis.published_events_count)}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Eventos publicados</p>
                            <p className="mt-1 text-xs text-texto/50">Entradas de agenda com `status = published`.</p>
                        </div>
                        <div className="rounded-xl border border-base/40 bg-base/20 p-4">
                            <p className="text-2xl font-black text-texto">{formatNumber(status.operations.kpis.published_content_items_count)}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Acervo + blog publicados</p>
                            <p className="mt-1 text-xs text-texto/50">Soma de itens publicados em acervo e blog.</p>
                        </div>
                        <div className="rounded-xl border border-amber-500/30 bg-base/20 p-4">
                            <p className="text-2xl font-black text-amber-500">{formatNumber(status.operations.kpis.scheduled_content_items_count)}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Agendados</p>
                            <p className="mt-1 text-xs text-texto/50">Itens com publicação futura (blog + acervo).</p>
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-red-500/30 bg-base/20 p-4">
                        <p className="text-2xl font-black text-red-500">{formatNumber(totalAboveThreshold24h)}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-texto/70">Leituras acima do limiar (24h)</p>
                        <p className="mt-1 text-xs text-texto/50">Contagem de leituras acima da referencia OMS (PM2.5 &gt; 15 ou PM10 &gt; 45).</p>
                    </div>

                    <div className="mt-4 rounded-xl border border-ciano/15 bg-base/10 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-ciano">Medições por estação (7 dias)</p>
                        <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                            {status.operations.station_metrics.length === 0 ? (
                                <p className="text-xs text-texto/50 italic">Sem dados no período.</p>
                            ) : (
                                status.operations.station_metrics.map((station, idx) => (
                                    <div key={`${station.station_code}-${idx}`} className="flex items-center justify-between rounded-md bg-fundo/40 px-3 py-2 text-xs">
                                        <span className="font-mono text-texto/70">{station.station_code || station.station_name}</span>
                                        <div className="text-right">
                                            <span className="block font-black text-ciano">{formatNumber(station.measurements_count)}</span>
                                            <span className="block text-[10px] font-bold uppercase tracking-wide text-red-500">{formatNumber(station.above_threshold_24h || 0)} acima (24h)</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showOpsHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowOpsHelp(false)}>
                    <div
                        className="w-full max-w-xl rounded-2xl border border-ciano/30 bg-fundo p-6 shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ops-help-title"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        <h3 id="ops-help-title" className="text-lg font-black text-texto">Como ler estes números</h3>
                        <p className="mt-3 text-sm text-texto/70">Todos os indicadores cobrem os últimos 7 dias corridos, em janela móvel.</p>
                        <ul className="mt-4 space-y-2 text-sm text-texto/80">
                            <li><span className="font-bold">Medições:</span> total de linhas em `measurements` no período.</li>
                            <li><span className="font-bold">Ingest inserido/duplicado:</span> contagem em `ingest_logs` da rotina hardenizada.</li>
                            <li><span className="font-bold">Alertas disparados:</span> total de `push_events` com trigger verdadeiro.</li>
                            <li><span className="font-bold">Eventos publicados:</span> registros de agenda com `status = published` no período.</li>
                            <li><span className="font-bold">Acervo + blog publicados:</span> soma de novos itens de acervo e posts publicados.</li>
                            <li><span className="font-bold">Agendados:</span> total de conteúdos com `publish_at` no futuro.</li>
                            <li><span className="font-bold">Acima do limiar (24h):</span> leituras por estação acima de PM2.5 &gt; 15 ou PM10 &gt; 45.</li>
                        </ul>
                        <button
                            type="button"
                            onClick={() => setShowOpsHelp(false)}
                            className="mt-6 rounded-lg bg-ciano/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-ciano hover:bg-ciano/25"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-cta uppercase tracking-widest">Próximos Passos</h3>
                    <div className="space-y-4">
                        {status.content.upcoming_events.length === 0 ? (
                            <p className="text-sm text-texto/40 italic">Nenhum evento agendado.</p>
                        ) : (
                            status.content.upcoming_events.map((ev) => (
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
                                status.content.latest_blog.map((post) => (
                                    <Link to={`/blog/${post.slug}`} key={post.id} className="block group">
                                        <p className="text-xs font-bold text-texto group-hover:text-ciano transition-colors">{post.title}</p>
                                        <p className="text-[10px] text-texto/50 uppercase">{new Date(post.published_at!).toLocaleDateString()}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-cta uppercase tracking-widest">Memória Digital</h3>
                    <div className="space-y-4">
                        {status.content.latest_acervo.length === 0 ? (
                            <p className="text-sm text-texto/40 italic">Acervo vazio.</p>
                        ) : (
                            status.content.latest_acervo.map((item) => (
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





