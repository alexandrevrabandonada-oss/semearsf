import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCorridorBySlug, type ClimateCorridorWithLinks } from "../../lib/api";
import { getOptimizedCover } from "../../lib/imageOptimization";

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
            className="group flex flex-col justify-center rounded-2xl border border-border-subtle bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-md"
        >
            <div className="mb-2 text-2xl">{icon}</div>
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-brand-primary/70">
                {typeLabel}
            </div>
            <div className="font-semibold text-text-primary group-hover:text-brand-primary line-clamp-2">
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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !corridor) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-error">{error || "Página não encontrada"}</p>
                <Link to="/corredores" className="mt-4 inline-block text-brand-primary underline">
                    Voltar para Corredores
                </Link>
            </div>
        );
    }

    const stations = corridor.links.filter((l) => l.item_kind === "station");
    const acervoItems = corridor.links.filter((l) => l.item_kind === "acervo");
    const blogPosts = corridor.links.filter((l) => l.item_kind === "blog");
    const events = corridor.links.filter((l) => l.item_kind === "event");

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
            <Link
                to="/corredores"
                className="mb-8 inline-flex items-center text-xs font-bold uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
            >
                ← Voltar aos Corredores
            </Link>

            <header className="mb-16">
                {corridor.featured && (
                    <span className="mb-4 inline-block rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                        Destaque Editorial
                    </span>
                )}
                <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-brand-primary md:text-6xl">
                    {corridor.title}
                </h1>
                {corridor.excerpt && (
                    <p className="border-l-4 border-brand-primary/30 pl-6 text-xl leading-relaxed text-text-secondary italic">
                        {corridor.excerpt}
                    </p>
                )}
            </header>

            {/* Cover Image */}
            {corridor.cover_url && (
                <section className="mb-12 overflow-hidden rounded-3xl border border-border-subtle shadow-md">
                    <img
                        src={getOptimizedCover(corridor, "cover") || corridor.cover_url}
                        alt={corridor.title}
                        className="h-auto w-full object-cover"
                    />
                </section>
            )}

            {/* Editorial Note - "O que observar aqui" */}
            {corridor.note_md && (
                <section className="mb-16 rounded-3xl border border-brand-primary/20 bg-brand-primary/5 p-8">
                    <h2 className="mb-4 flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-brand-primary">
                        <span className="text-3xl">👁️</span>
                        O que observar aqui
                    </h2>
                    <div className="prose prose-lg max-w-none text-text-primary">
                        <p className="whitespace-pre-wrap leading-relaxed">{corridor.note_md}</p>
                    </div>
                </section>
            )}

            {/* Geometry / Map Placeholder */}
            {corridor.geometry_json ? (
                <section className="mb-20 overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-md">
                    <div className="p-8">
                        <h3 className="mb-4 text-xl font-black uppercase tracking-tight text-text-primary">
                            Geometria do Corredor
                        </h3>
                        <details className="cursor-pointer">
                            <summary className="mb-2 text-sm font-bold text-brand-primary hover:underline">
                                Ver dados GeoJSON
                            </summary>
                            <pre className="max-h-96 overflow-auto rounded-xl bg-bg-surface p-4 text-xs text-text-secondary">
                                {JSON.stringify(corridor.geometry_json, null, 2)}
                            </pre>
                        </details>
                        <p className="mt-4 text-sm italic text-text-secondary">
                            Visualização interativa em desenvolvimento.
                        </p>
                    </div>
                </section>
            ) : (
                <section className="mb-20 overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-md">
                    <div className="flex h-64 w-full flex-col items-center justify-center bg-gradient-to-br from-bg-surface to-brand-primary/10 md:h-96">
                        <svg className="mb-4 h-16 w-16 text-border-subtle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="text-sm font-bold uppercase tracking-widest text-text-secondary">Mapa em breve</span>
                    </div>
                </section>
            )}

            {/* Connected Content - Organized by Type */}
            <div className="space-y-16">
                {/* Stations */}
                {stations.length > 0 && (
                    <section>
                        <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-text-primary">
                            📡 Estações Relacionadas
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {stations.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Acervo Items */}
                {acervoItems.length > 0 && (
                    <section>
                        <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-text-primary">
                            📚 Itens do Acervo Relacionados
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {acervoItems.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Blog Posts */}
                {blogPosts.length > 0 && (
                    <section>
                        <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-text-primary">
                            📝 Posts do Blog Relacionados
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {blogPosts.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Events */}
                {events.length > 0 && (
                    <section>
                        <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-text-primary">
                            📅 Eventos Relacionados
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {events.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {stations.length === 0 && acervoItems.length === 0 && blogPosts.length === 0 && events.length === 0 && (
                    <section className="text-center">
                        <p className="italic text-text-secondary">
                            Nenhum conteúdo relacionado vinculado a este corredor climático.
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}
