import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listBlogPosts, type BlogPost } from "../lib/api";

export function BlogListPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            try {
                setLoading(true);
                setError(null);
                const data = await listBlogPosts({ limit: 50 });
                if (!cancelled) setPosts(data);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Falha ao carregar blog.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        void run();
        return () => { cancelled = true; };
    }, []);

    const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-primaria/60 bg-fundo/80 p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ciano">Comunicação</p>
                <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">
                    Blog da Emenda
                </h1>
                <p className="mt-2 text-sm text-texto/80">
                    Acompanhe as últimas atualizações, notícias institucionais e artigos sobre o monitoramento do ar.
                </p>
            </div>

            {loading ? (
                <p aria-live="polite" className="text-sm text-texto/80" role="status">Carregando posts...</p>
            ) : error ? (
                <p aria-live="assertive" className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto" role="alert">
                    {error}
                </p>
            ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ciano/30 py-12 text-center text-texto/50">
                    <p className="text-4xl">✍️</p>
                    <p className="mt-4 font-semibold">Nenhum post publicado no momento.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link
                            className="flex flex-col overflow-hidden rounded-2xl border border-ciano/20 bg-fundo/70 transition-all hover:border-ciano hover:bg-fundo/90"
                            key={post.id}
                            to={`/blog/${post.slug}`}
                        >
                            {post.cover_url && (
                                <img
                                    alt={post.title}
                                    className="h-40 w-full object-cover"
                                    src={post.cover_url}
                                />
                            )}
                            <div className="flex flex-1 flex-col p-5">
                                <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-texto/50">
                                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR") : "Draft"}</span>
                                </div>
                                <h2 className="mb-2 text-lg font-black leading-tight text-cta line-clamp-2">
                                    {post.title}
                                </h2>
                                {post.excerpt && (
                                    <p className="mb-4 line-clamp-3 text-xs text-texto/70 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                )}
                                <div className="mt-auto flex flex-wrap gap-1">
                                    {post.tags.slice(0, 3).map((tag) => (
                                        <span
                                            className="rounded-full bg-ciano/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ciano"
                                            key={tag}
                                        >
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
