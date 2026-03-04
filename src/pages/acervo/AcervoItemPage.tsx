import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAcervoBySlug, type AcervoItem } from "../../lib/api";

const KIND_LABELS: Record<string, string> = {
    paper: "Artigo científico",
    report: "Relatório",
    news: "Notícia",
    link: "Link externo",
    video: "Vídeo",
    photo: "Fotografia"
};

function SimpleMarkdown({ text }: { text: string }) {
    const html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br />");
    // eslint-disable-next-line react/no-danger
    return <div className="text-sm leading-relaxed text-texto/90" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function AcervoItemPage() {
    const { slug } = useParams<{ slug: string }>();
    const [item, setItem] = useState<AcervoItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                const data = await getAcervoBySlug(slug as string);
                if (!cancelled) setItem(data);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Falha ao carregar item do acervo.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();
        return () => { cancelled = true; };
    }, [slug]);

    return (
        <section className="space-y-6">
            <Link
                className="inline-flex items-center gap-1 text-xs font-semibold text-ciano/70 hover:text-ciano"
                to="/acervo"
            >
                ← Voltar ao Acervo
            </Link>

            {loading ? (
                <p aria-live="polite" className="text-sm text-texto/80" role="status">Carregando item...</p>
            ) : error ? (
                <p aria-live="assertive" className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto" role="alert">
                    {error}
                </p>
            ) : !item ? (
                <div className="rounded-2xl border border-ciano/30 bg-fundo/80 p-10 text-center">
                    <p className="text-4xl">🔍</p>
                    <p aria-live="polite" className="mt-3 text-sm font-semibold text-texto/70" role="status">
                        Item não encontrado. Verifique o link ou volte ao acervo.
                    </p>
                </div>
            ) : (
                <article className="rounded-2xl border border-ciano/50 bg-fundo/80 p-6 md:p-8">
                    {/* Kind badge */}
                    <span className="inline-block rounded-full bg-ciano/15 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-ciano">
                        {KIND_LABELS[item.kind] ?? item.kind}
                    </span>

                    <h1 className="mt-3 text-2xl font-black leading-tight text-cta md:text-3xl">
                        {item.title}
                    </h1>

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-texto/60">
                        {item.source_name && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">Fonte:</span>{" "}
                                {item.source_url ? (
                                    <a
                                        className="text-ciano hover:underline"
                                        href={item.source_url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        {item.source_name}
                                    </a>
                                ) : item.source_name}
                            </span>
                        )}
                        {item.published_at && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">Data:</span>{" "}
                                {new Date(item.published_at).toLocaleDateString("pt-BR")}
                            </span>
                        )}
                        {item.city && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">Cidade:</span>{" "}
                                {item.city}
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                                <span
                                    className="rounded-full border border-ciano/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ciano/80"
                                    key={tag}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <hr className="my-6 border-ciano/20" />

                    {/* Excerpt */}
                    {item.excerpt && (
                        <p className="mb-4 text-base font-semibold text-texto/90">{item.excerpt}</p>
                    )}

                    {/* Body */}
                    {item.content_md ? <SimpleMarkdown text={item.content_md} /> : null}

                    {/* External link CTA */}
                    {item.source_url && !item.content_md && (
                        <a
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cta px-5 py-3 text-sm font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90"
                            href={item.source_url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Acessar fonte →
                        </a>
                    )}
                </article>
            )}
        </section>
    );
}
