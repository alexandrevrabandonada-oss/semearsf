import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCollectionBySlug, type CollectionWithItems } from "../../lib/api";

export function CollectionDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [collection, setCollection] = useState<CollectionWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await getCollectionBySlug(slug);
                setCollection(data);
            } catch (err) {
                console.error("Erro ao carregar detalhes do dossiê:", err);
                setError("Coleção não encontrada ou erro na conexão.");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, [slug]);

    if (loading) return <p className="text-sm text-texto/70" aria-live="polite" aria-busy="true">Carregando detalhes do dossiê...</p>;
    if (error || !collection) return <p className="text-sm text-acento" aria-live="assertive">{error || "Coleção não encontrada."}</p>;

    return (
        <section className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {collection.cover_url && (
                    <div className="w-full md:w-1/3">
                        <img
                            src={collection.cover_url}
                            alt={collection.title}
                            className="rounded-2xl border border-ciano/30 shadow-lg"
                        />
                    </div>
                )}
                <div className="flex-1 space-y-4">
                    <Link to="/dossies" className="text-xs font-bold uppercase tracking-widest text-ciano hover:underline">
                        ← Voltar para todos os dossiês
                    </Link>
                    <h1 className="text-3xl font-black text-texto md:text-5xl">{collection.title}</h1>
                    <p className="text-base text-texto/90 leading-relaxed md:text-lg">{collection.excerpt}</p>
                    <div className="flex flex-wrap gap-2">
                        {collection.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-cta/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cta">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-wide text-cta">Itens desta Coleção</h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {collection.items.map((item) => (
                        <Link
                            key={item.id}
                            to={`/acervo/item/${item.slug}`}
                            className="flex flex-col gap-1 rounded-xl border border-ciano/20 bg-fundo/70 p-4 transition-all hover:border-ciano hover:bg-fundo/90"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-ciano">
                                {item.kind}
                            </span>
                            <h3 className="line-clamp-2 text-sm font-bold text-texto">{item.title}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
