import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Chip, SectionHeader, SurfaceCard } from "../components/BrandSystem";
import { listBlogPosts, type BlogPost } from "../lib/api";
import { getOptimizedCover } from "../lib/imageOptimization";

export function BlogListPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const demoOrAdminMode = useMemo(() => {
        const envMode = String(import.meta.env.VITE_PROJECT_MODE ?? "").toLowerCase();
        const envFlag = String(import.meta.env.VITE_SHOW_SCHEDULED ?? "").toLowerCase() === "true";
        const localFlag = typeof window !== "undefined"
            ? ["admin", "demo", "true"].includes(String(window.localStorage.getItem("semear:show-scheduled") ?? "").toLowerCase())
            : false;
        return envFlag || envMode === "admin" || envMode === "demo" || localFlag;
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            try {
                setLoading(true);
                setError(null);
                const data = await listBlogPosts({ limit: 50, includeScheduled: demoOrAdminMode });
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
    }, [demoOrAdminMode]);

    const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
    const isScheduled = (post: BlogPost) => Boolean(post.publish_at) && new Date(post.publish_at as string).getTime() > Date.now();

    return (
        <section className="space-y-12">
            <SurfaceCard className="signature-shell logo-watermark-soft p-6 md:p-8">
                <SectionHeader
                    eyebrow="Comunicação"
                    title="Blog da Emenda"
                    description="Acompanhe as últimas atualizações, notícias institucionais e artigos sobre o monitoramento do ar."
                />
            </SurfaceCard>

            {loading ? (
                <p aria-live="polite" className="text-base text-text-secondary" role="status">Carregando posts...</p>
            ) : error ? (
                <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
                    {error}
                </p>
            ) : posts.length === 0 ? (
                <div className="floral-placeholder py-12 text-center text-text-secondary">
                    <div className="mx-auto mb-5 flex max-w-xs items-center gap-3 px-6">
                        <div className="seed-radial-divider flex-1" aria-hidden="true" />
                        <span className="section-badge">Blog</span>
                        <div className="seed-radial-divider flex-1" aria-hidden="true" />
                    </div>
                    <p className="text-4xl">✍️</p>
                    <p className="mt-4 text-base font-semibold">Nenhum post publicado no momento.</p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link
                            className="group motion-list-item flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border-subtle bg-surface-1 shadow-[0_1px_2px_rgba(17,38,59,0.04)] motion-surface motion-surface-hover"
                            key={post.id}
                            to={`/blog/${post.slug}`}
                        >
                            {post.cover_url ? (
                                <div className="h-40 w-full overflow-hidden bg-bg-surface relative">
                                    <img
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-all duration-700 ease-in-out"
                                        src={getOptimizedCover(post, "thumb") || ""}
                                        loading="lazy"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        style={
                                            (!post.cover_small_url && !post.cover_thumb_url) ? {} : {
                                                filter: "blur(0)"
                                            }
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="floral-placeholder flex h-40 w-full flex-col justify-between p-5">
                                    <span className="section-badge w-fit">SEMEAR</span>
                                    <span className="max-w-[12rem] text-lg font-black leading-tight text-text-primary">
                                        Conteúdo editorial sem capa
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-1 flex-col p-5 md:p-6">
                                <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                    <span>{(post.publish_at || post.published_at) ? new Date((post.publish_at || post.published_at) as string).toLocaleDateString("pt-BR") : "Draft"}</span>
                                    {demoOrAdminMode && isScheduled(post) && (
                                        <Chip tone="active">Agendado</Chip>
                                    )}
                                </div>
                                <h2 className="mb-2 text-lg font-black leading-tight text-text-primary line-clamp-2 md:text-xl">
                                    {post.title}
                                </h2>
                                {post.excerpt && (
                                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                                        {post.excerpt}
                                    </p>
                                )}
                                <div className="mt-auto flex flex-wrap gap-1">
                                    {post.tags.slice(0, 3).map((tag) => (
                                        <span
                                            className="rounded-full bg-brand-primary-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-primary-dark"
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



