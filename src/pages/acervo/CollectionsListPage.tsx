import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCollections, type AcervoCollection } from "../../lib/api";
import { getOptimizedCover } from "../../lib/imageOptimization";
import { trackShare } from "../../lib/observability";

export function CollectionsListPage() {
    const [collections, setCollections] = useState<AcervoCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const data = await listCollections();
                setCollections(data);
            } catch (err) {
                console.error("Erro ao carregar dossiês:", err);
                setError("Não foi possível carregar as coleções do acervo.");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-ciano/60 bg-fundo/80 p-6 md:p-8">
                <h1 className="text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">Dossiês</h1>
                <p className="mt-3 text-sm text-texto/90">
                    Coleções temáticas curadas pela equipe do SEMEAR para facilitar sua pesquisa.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-texto/70" aria-live="polite" aria-busy="true">Carregando coleções...</p>
            ) : error ? (
                <p className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto" aria-live="assertive">{error}</p>
            ) : collections.length === 0 ? (
                <p className="text-sm text-texto/50 italic" aria-live="polite">Nenhum dossiê publicado ainda.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2" aria-live="polite">
                    {collections.map((col) => (
                        <div
                            key={col.id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-ciano/40 bg-base/40 transition-all hover:border-ciano/60 hover:bg-base/60"
                        >
                            {col.cover_url && (
                                <Link to={`/dossies/${col.slug}`} className="aspect-video w-full overflow-hidden bg-ciano/5 relative block">
                                    <img
                                        src={getOptimizedCover(col, 'small') || ''}
                                        alt={col.title}
                                        loading="lazy"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                                        style={
                                            (!col.cover_small_url && !col.cover_thumb_url) ? {} : {
                                                filter: 'blur(0)'
                                            }
                                        }
                                    />
                                </Link>
                            )}
                            <div className="p-6 flex flex-col flex-1">
                                <Link to={`/dossies/${col.slug}`}>
                                    <h2 className="text-xl font-bold text-texto transition-colors group-hover:text-cta">{col.title}</h2>
                                </Link>
                                {col.excerpt && <p className="mt-2 text-sm text-texto/80 line-clamp-2">{col.excerpt}</p>}

                                <div className="mt-4 flex flex-wrap gap-2 content-start flex-1">
                                    {col.tags.map((tag) => (
                                        <span key={tag} className="rounded-full bg-ciano/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ciano">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <Link
                                        to={`/dossies/${col.slug}`}
                                        className="flex-1 rounded-md bg-ciano px-3 py-2 text-center text-xs font-black uppercase tracking-widest text-base transition-colors hover:bg-ciano/90"
                                    >
                                        Abrir
                                    </Link>
                                    <button
                                        type="button"
                                        aria-label="Compartilhar dossiê"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const url = `${window.location.origin}/s/dossies/${col.slug}`;
                                            trackShare("dossies", col.slug, "list");
                                            if (navigator.share) {
                                                void navigator.share({
                                                    title: col.title,
                                                    text: col.excerpt || undefined,
                                                    url
                                                });
                                            } else {
                                                trackShare("dossies", col.slug, "list-copy");
                                                void navigator.clipboard.writeText(url);
                                                alert("Link copiado!");
                                            }
                                        }}
                                        className="flex items-center justify-center rounded-md border border-ciano/40 bg-transparent px-4 py-2 text-ciano hover:bg-ciano hover:text-base transition-colors"
                                    >
                                        <span className="sr-only">Compartilhar</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
