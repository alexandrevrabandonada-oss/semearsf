import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCorridorBySlug, type ClimateCorridorWithLinks } from "../../lib/api";

function ItemLink({ kind, refId }: { kind: string; refId: string }) {
    // Map kind to appropriate URL and label prefix
    let url = "#";
    let icon = "🔗";
    let label = refId;
    let typeLabel = kind;

    switch (kind) {
        case "station":
            url = `/dados?station=${refId}`;
            icon = "📡";
            typeLabel = "Estação de Monitoramento";
            break;
        case "acervo":
            url = `/acervo/item/${refId}`;
            icon = "📚";
            typeLabel = "Item do Acervo";
            break;
        case "blog":
            url = `/blog/${refId}`;
            icon = "📝";
            typeLabel = "Postagem";
            break;
        case "event":
            url = `/agenda/${refId}`;
            icon = "📅";
            typeLabel = "Evento";
            break;
        default:
            break;
    }

    return (
        <Link
            to={url}
            className="group flex flex-col justify-center rounded-2xl border border-ciano/20 bg-fundo-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cta/50 hover:bg-ciano/10"
        >
            <div className="mb-2 text-2xl">{icon}</div>
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-ciano/70">
                {typeLabel}
            </div>
            <div className="font-semibold text-texto group-hover:text-cta line-clamp-2">
                {label}
            </div>
        </Link>
    );
}

export function CorredoresDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [corridor, setCorridor] = useState<ClimateCorridorWithLinks | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        async function load() {
            try {
                const data = await getCorridorBySlug(slug as string);
                if (!data) {
                    setError("Corredor Climático não encontrado");
                    return;
                }
                setCorridor(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao carregar Corredor");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cta border-t-transparent" />
            </div>
        );
    }

    if (error || !corridor) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-red-500">{error || "Página não encontrada"}</p>
                <Link to="/corredores" className="mt-4 inline-block text-cta underline">
                    Voltar para Corredores
                </Link>
            </div>
        );
    }

    const stations = corridor.links.filter((l) => l.item_kind === "station");
    const otherLinks = corridor.links.filter((l) => l.item_kind !== "station");

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
            <Link
                to="/corredores"
                className="mb-8 inline-flex items-center text-xs font-bold uppercase tracking-widest text-ciano/70 transition-colors hover:text-ciano"
            >
                ← Voltar aos Corredores
            </Link>

            <header className="mb-16">
                {corridor.featured && (
                    <span className="mb-4 inline-block rounded-full border border-cta/30 bg-cta/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cta">
                        Destaque Editorial
                    </span>
                )}
                <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-cta md:text-6xl">
                    {corridor.title}
                </h1>
                {corridor.excerpt && (
                    <p className="border-l-4 border-ciano/30 pl-6 text-xl leading-relaxed text-texto/90 italic">
                        {corridor.excerpt}
                    </p>
                )}
            </header>

            {/* Geometry / Map Placeholder for MVP */}
            <section className="mb-20 overflow-hidden rounded-3xl border border-ciano/20 bg-fundo-card shadow-2xl">
                <div className="flex h-64 w-full flex-col items-center justify-center bg-gradient-to-br from-fundo to-primaria/10 md:h-96">
                    <svg className="mb-4 h-16 w-16 text-ciano/30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-sm font-bold uppercase tracking-widest text-texto-secundario">Visualização do Mapa em Breve</span>
                </div>
            </section>

            {/* Connected Nodes */}
            <section className="space-y-16">
                <div>
                    <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-texto">
                        Estações no Corredor
                    </h2>
                    {stations.length === 0 ? (
                        <p className="italic text-texto-secundario">Nenhuma estação de monitoramento vinculada a este corredor.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {stations.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    )}
                </div>

                {otherLinks.length > 0 && (
                    <div>
                        <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-texto">
                            Conteúdo Relacionado
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {otherLinks.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
