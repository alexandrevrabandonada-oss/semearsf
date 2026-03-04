import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAcervoBySlug, listCollectionsForItem, type AcervoItem, type AcervoCollection } from "../../lib/api";

const KIND_LABELS: Record<string, string> = {
    paper: "Artigo científico",
    report: "Relatório",
    news: "Notícia",
    link: "Link externo",
    video: "Vídeo",
    photo: "Fotografia"
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
    cientifico: "Científico",
    imprensa: "Imprensa",
    institucional: "Institucional",
    pessoal: "Pessoal"
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
    const [collections, setCollections] = useState<AcervoCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                const [data, cols] = await Promise.all([
                    getAcervoBySlug(slug as string),
                    listCollectionsForItem(slug as string)
                ]);
                if (!cancelled) {
                    setItem(data);
                    setCollections(cols);
                }
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
                    {/* Kind badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-block rounded-full bg-ciano/15 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-ciano">
                            {KIND_LABELS[item.kind] ?? item.kind}
                        </span>
                        {item.source_type && (
                            <span className="inline-block rounded-full bg-acento/15 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-acento">
                                {SOURCE_TYPE_LABELS[item.source_type] || item.source_type}
                            </span>
                        )}
                        {item.featured && (
                            <span className="inline-block rounded-full bg-cta/15 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-cta">
                                ⭐ Destaque
                            </span>
                        )}
                        <button
                            className="inline-flex items-center gap-1 rounded-full bg-ciano/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ciano hover:bg-ciano/20"
                            onClick={() => {
                                const url = `${window.location.origin}/s/acervo/${item.slug}`;
                                if (navigator.share) {
                                    void navigator.share({
                                        title: item.title,
                                        text: item.excerpt || undefined,
                                        url
                                    });
                                } else {
                                    void navigator.clipboard.writeText(url);
                                    alert("Link de compartilhamento copiado!");
                                }
                            }}
                            type="button"
                        >
                            🔗 Compartilhar
                        </button>
                    </div>

                    <h1 className="mt-4 text-2xl font-black leading-tight text-cta md:text-3xl">
                        {item.title}
                    </h1>

                    {item.authors && (
                        <p className="mt-2 text-sm font-semibold text-texto/70 italic">Por: {item.authors}</p>
                    )}

                    {/* Meta row */}
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-texto/60">
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
                        {item.doi && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">DOI:</span> {item.doi}
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
                        <div className="mt-4 flex flex-wrap gap-1">
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

                    {/* Associated Collections */}
                    {collections.length > 0 && (
                        <div className="mt-8 rounded-xl border border-cta/30 bg-cta/5 p-5">
                            <span className="block mb-3 text-xs font-bold uppercase tracking-widest text-cta">
                                📚 Este item está nos dossiês:
                            </span>
                            <div className="flex flex-col gap-2">
                                {collections.map(col => (
                                    <Link
                                        key={col.id}
                                        to={`/dossies/${col.slug}`}
                                        className="text-sm font-semibold text-cta hover:underline block"
                                    >
                                        → {col.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr className="my-8 border-ciano/20" />

                    {/* Curator Note */}
                    {item.curator_note && (
                        <div className="mb-8 rounded-xl border border-acento/30 bg-acento/5 p-5 italic text-texto/90">
                            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-acento">Nota da Curadoria</span>
                            <p className="text-sm">"{item.curator_note}"</p>
                        </div>
                    )}

                    {/* Excerpt */}
                    {item.excerpt && (
                        <p className="mb-6 text-base font-semibold leading-relaxed text-texto/90">{item.excerpt}</p>
                    )}

                    {/* Body */}
                    {item.content_md ? <SimpleMarkdown text={item.content_md} /> : null}

                    {/* External link CTA */}
                    {item.source_url && !item.content_md && (
                        <a
                            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-cta px-6 py-4 text-sm font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90"
                            href={item.source_url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Acessar fonte completa →
                        </a>
                    )}
                </article>
            )}
        </section>
    );
}
