import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCollections, type AcervoCollection } from "../../lib/api";

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
                <p className="text-sm text-texto/70">Carregando coleções...</p>
            ) : error ? (
                <p className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto">{error}</p>
            ) : collections.length === 0 ? (
                <p className="text-sm text-texto/50 italic">Nenhum dossiê publicado ainda.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {collections.map((col) => (
                        <Link
                            key={col.id}
                            to={`/dossies/${col.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-ciano/40 bg-base/40 transition-all hover:border-ciano/60 hover:bg-base/60"
                        >
                            {col.cover_url && (
                                <div className="aspect-video w-full overflow-hidden bg-ciano/5 relative">
                                    <img
                                        src={col.cover_small_url || col.cover_thumb_url || col.cover_url}
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
                                </div>
                            )}
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-texto group-hover:text-cta">{col.title}</h2>
                                {col.excerpt && <p className="mt-2 text-sm text-texto/80 line-clamp-2">{col.excerpt}</p>}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {col.tags.map((tag) => (
                                        <span key={tag} className="rounded-full bg-ciano/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ciano">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
