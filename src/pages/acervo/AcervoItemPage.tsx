import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAcervoBySlug, listCollectionsForItem, getRelatedItemsByCollections, type AcervoItem, type AcervoCollection } from "../../lib/api";

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
    const [related, setRelated] = useState<AcervoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [activeMedia, setActiveMedia] = useState<{ url: string; type: string; title?: string } | null>(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Close Modal on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && activeMedia) {
                setActiveMedia(null);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [activeMedia]);

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
                let relatedItems: AcervoItem[] = [];
                if (data && data.id) {
                    relatedItems = await getRelatedItemsByCollections(data.id, 6);
                }
                if (!cancelled) {
                    setItem(data);
                    setCollections(cols);
                    setRelated(relatedItems);
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

                    {/* Associated Collections (Chips) */}
                    {collections.length > 0 && (
                        <div className="mt-8 rounded-xl border border-cta/30 bg-cta/5 p-5">
                            <span className="block mb-3 text-xs font-bold uppercase tracking-widest text-cta">
                                📚 Este item está nos dossiês:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {collections.map(col => (
                                    <Link
                                        key={col.id}
                                        to={`/dossies/${col.slug}`}
                                        className="rounded-full bg-cta/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cta hover:bg-cta/25 transition-colors"
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

                    {/* Media Gallery / PDF Viewer Buttons */}
                    {item.media && item.media.length > 0 && (
                        <div className="mt-8 mb-8 flex flex-wrap gap-4">
                            {item.media.map((m, idx) => {
                                const isPdf = m.type.toLowerCase().includes("pdf") || m.url.toLowerCase().endsWith(".pdf");
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMedia(m)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-cta px-5 py-3 text-sm font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90"
                                        type="button"
                                        aria-label={isPdf ? "Abrir PDF" : "Ver imagem"}
                                    >
                                        <span className="text-xl">{isPdf ? "📄" : "🖼️"}</span>
                                        {m.title || (isPdf ? "Abrir PDF" : "Ver Imagem")}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* External link CTA */}
                    {item.source_url && !item.content_md && (!item.media || item.media.length === 0) && (
                        <a
                            className="mt-8 mb-8 inline-flex items-center gap-2 rounded-lg bg-cta px-6 py-4 text-sm font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90"
                            href={item.source_url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Acessar fonte completa →
                        </a>
                    )}

                    {/* Related Items */}
                    {related.length > 0 && (
                        <div className="mt-10 border-t border-ciano/20 pt-8">
                            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-ciano">
                                Relacionados neste dossiê
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {related.map(rel => (
                                    <Link
                                        key={rel.id}
                                        to={`/acervo/item/${rel.slug}`}
                                        className="group flex flex-col rounded-xl border border-ciano/20 bg-fundo/50 p-4 transition-all hover:bg-base/20 hover:border-ciano"
                                    >
                                        <span className="mb-2 inline-block self-start rounded-full bg-ciano/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ciano group-hover:bg-ciano/20 transition-colors">
                                            {KIND_LABELS[rel.kind] ?? rel.kind}
                                        </span>
                                        <h4 className="text-sm font-bold text-texto group-hover:text-ciano line-clamp-2 leading-snug">
                                            {rel.title}
                                        </h4>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            )}

            {/* Media Viewer Modal */}
            {activeMedia && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-fundo/95 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="media-modal-title"
                >
                    <div className="absolute top-4 right-4 flex items-center gap-4">
                        <a
                            href={activeMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold uppercase tracking-widest text-ciano hover:text-ciano/80"
                        >
                            Abrir em nova aba ↗
                        </a>
                        <button
                            className="rounded-full bg-acento/20 p-2 text-acento hover:bg-acento/30 transition-colors"
                            onClick={() => setActiveMedia(null)}
                            aria-label="Fechar visualizador"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex h-full w-full max-w-5xl flex-col items-center justify-center pt-12 pb-4">
                        <p id="media-modal-title" className="sr-only">Visualizador de Mídia do Acervo</p>

                        {isOffline && (
                            <div className="mb-4 w-full rounded-lg border border-acento/40 bg-acento/10 p-3 text-center">
                                <p className="text-sm font-bold text-acento">Você está offline</p>
                                <p className="text-xs text-texto/80 mt-1">Se você já carregou este arquivo antes, ele pode reabrir usando o cache do dispositivo.</p>
                            </div>
                        )}

                        {activeMedia.type.toLowerCase().includes("pdf") || activeMedia.url.toLowerCase().endsWith(".pdf") ? (
                            <iframe
                                src={activeMedia.url}
                                className="h-full w-full rounded-xl border border-ciano/30 bg-base"
                                title={activeMedia.title || "Documento PDF"}
                            />
                        ) : (
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-ciano/10 bg-base/50">
                                <img
                                    src={activeMedia.url}
                                    alt={activeMedia.title || "Mídia do acervo"}
                                    className="max-h-full max-w-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        )}
                        {activeMedia.title && (
                            <p className="mt-4 text-center text-sm font-semibold italic text-texto/70">{activeMedia.title}</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
