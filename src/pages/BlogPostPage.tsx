import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getBlogPostBySlug, type BlogPost } from "../lib/api";
import { trackShare } from "../lib/observability";

function SimpleMarkdown({ text }: { text: string }) {
    const html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br />");
    // eslint-disable-next-line react/no-danger
    return <div className="text-base leading-relaxed text-text-primary space-y-4" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                const data = await getBlogPostBySlug(slug as string);
                if (!cancelled) setPost(data);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Falha ao carregar post.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();
        return () => { cancelled = true; };
    }, [slug]);

    if (loading) {
        return <p aria-live="polite" className="text-base text-text-secondary" role="status">Carregando post...</p>;
    }

    if (error) {
        return (
            <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
                {error}
            </p>
        );
    }

    if (!post) {
        return (
            <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center shadow-sm">
                <p className="text-4xl">🔍</p>
                <p aria-live="polite" className="mt-3 text-base font-semibold text-text-secondary" role="status">
                    Post não encontrado.
                </p>
                <Link className="mt-4 inline-block text-sm font-bold text-brand-primary hover:underline" to="/blog">
                    Voltar ao Blog
                </Link>
            </div>
        );
    }

    return (
        <article className="mx-auto max-w-4xl space-y-6">
            <Link
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
                to="/blog"
            >
                ← Voltar ao Blog
            </Link>

            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm">
                {post.cover_url && (
                    <img
                        alt={post.title}
                        className="h-64 w-full object-cover md:h-96"
                        src={post.cover_url}
                    />
                )}
                <div className="p-6 md:p-10">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR") : "Draft"}</span>
                        {post.tags.length > 0 && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-border-subtle" />
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span className="text-brand-primary" key={tag}>#{tag}</span>
                                    ))}
                                </div>
                            </>
                        )}
                        <button
                            className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-primary hover:bg-brand-primary/20"
                            onClick={() => {
                                const url = `${window.location.origin}/s/blog/${post.slug}`;
                                trackShare("blog", post.slug, "post");
                                if (navigator.share) {
                                    void navigator.share({
                                        title: post.title,
                                        text: post.excerpt || undefined,
                                        url
                                    });
                                } else {
                                    trackShare("blog", post.slug, "post-copy");
                                    void navigator.clipboard.writeText(url);
                                    alert("Link de compartilhamento copiado!");
                                }
                            }}
                            type="button"
                        >
                            🔗 Compartilhar
                        </button>
                    </div>

                    <h1 className="mb-6 text-3xl font-black leading-tight text-text-primary md:text-5xl">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mb-8 text-lg font-semibold leading-relaxed text-text-secondary border-l-4 border-brand-primary/30 pl-4 italic">
                            {post.excerpt}
                        </p>
                    )}

                    <hr className="my-8 border-border-subtle" />

                    {post.content_md ? (
                        <SimpleMarkdown text={post.content_md} />
                    ) : (
                        <p className="text-center italic text-text-secondary/50">Este post ainda não possui conteúdo.</p>
                    )}
                </div>
            </div>
        </article>
    );
}
