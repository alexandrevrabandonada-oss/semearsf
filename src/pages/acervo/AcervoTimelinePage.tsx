import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAcervoYearIndex, getAcervoByYear, type AcervoYearIndex, type AcervoItem } from "../../lib/api";

function TypeBadge({ kind }: { kind: string }) {
    const map: Record<string, { label: string; color: string }> = {
        paper: { label: "Artigo", color: "bg-ciano text-base" },
        news: { label: "Notícia", color: "bg-acento/20 text-acento border border-acento" },
        video: { label: "Vídeo", color: "bg-red-500/20 text-red-500 border border-red-500" },
        photo: { label: "Foto", color: "bg-fundo text-texto border border-texto/30" },
        report: { label: "Relatório", color: "bg-cta text-base" },
        link: { label: "Link", color: "bg-base text-texto border border-texto/20" }
    };
    const m = map[kind] || map.link;
    return (
        <span className={`rounded-sm px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${m.color}`}>
            {m.label}
        </span>
    );
}

export function AcervoTimelinePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryYear = searchParams.get("year");
    const selectedYear = queryYear ? parseInt(queryYear, 10) : null;

    const [index, setIndex] = useState<AcervoYearIndex[]>([]);
    const [items, setItems] = useState<AcervoItem[]>([]);
    const [isLoadingIndex, setIsLoadingIndex] = useState(true);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectYear = (year: number) => {
        setSearchParams({ year: String(year) }, { replace: true });
    };

    useEffect(() => {
        async function loadIndex() {
            try {
                setIsLoadingIndex(true);
                const data = await getAcervoYearIndex();
                setIndex(data);
                if (data.length > 0 && !queryYear) {
                    setSearchParams({ year: String(data[0].year) }, { replace: true });
                }
            } catch (err: any) {
                setError(err.message || "Erro ao carregar a linha do tempo.");
            } finally {
                setIsLoadingIndex(false);
            }
        }
        void loadIndex();
    }, [queryYear, setSearchParams]);

    useEffect(() => {
        async function loadItems() {
            if (!selectedYear) return;
            try {
                setIsLoadingItems(true);
                const data = await getAcervoByYear(selectedYear);
                setItems(data);
            } catch (err: any) {
                setError(err.message || "Erro ao consultar ano.");
            } finally {
                setIsLoadingItems(false);
            }
        }
        void loadItems();
    }, [selectedYear]);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-start pt-20">

            {/* Sidebar: Linha do Tempo */}
            <aside className="w-full shrink-0 md:sticky md:top-24 md:w-64 space-y-4">
                <h1 className="text-3xl font-black uppercase tracking-widest text-cta">Linha do Tempo</h1>
                <p className="text-xs text-texto/60 italic">Navegue pelo acervo histórico por ano de publicação.</p>

                {isLoadingIndex ? (
                    <p className="text-sm text-texto/50 animate-pulse">Calculando períodos...</p>
                ) : (
                    <div className="flex flex-row overflow-x-auto gap-2 pb-2 md:flex-col md:overflow-visible md:pb-0">
                        {index.map((entry) => (
                            <button
                                key={entry.year}
                                onClick={() => handleSelectYear(entry.year)}
                                className={`flex shrink-0 items-center justify-between rounded-md border px-4 py-3 text-left transition-colors md:w-full ${selectedYear === entry.year
                                    ? "border-ciano bg-ciano/10 text-ciano"
                                    : "border-texto/10 bg-base text-texto/70 hover:border-ciano/40 hover:text-texto"
                                    }`}
                            >
                                <span className="font-mono text-lg font-black">{entry.year}</span>
                                <span className="ml-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    {entry.total} {entry.total === 1 ? 'item' : 'itens'}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 space-y-6">
                {error && (
                    <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {selectedYear && (
                    <div className="flex items-end gap-3 border-b border-texto/10 pb-4">
                        <h2 className="text-4xl font-black text-ciano">{selectedYear}</h2>
                        <span className="mb-1 text-xs uppercase tracking-widest text-texto/50 font-bold">Documentos preservados</span>
                    </div>
                )}

                {isLoadingItems ? (
                    <p className="text-sm text-texto/50 animate-pulse">Restaurando arquivos...</p>
                ) : (
                    <div className="grid gap-4">
                        {items.length === 0 && !isLoadingIndex ? (
                            <p className="mt-8 text-center text-sm italic text-texto/40">Nenhum item encontrado para este ano.</p>
                        ) : (
                            items.map((item) => (
                                <Link
                                    key={item.slug}
                                    to={`/acervo/item/${item.slug}`}
                                    className="group flex flex-col items-start gap-4 rounded-xl border border-texto/10 bg-base/50 p-4 transition-all hover:border-ciano/40 hover:bg-base md:flex-row md:items-center"
                                >
                                    {/* Thumbnail Fallback */}
                                    <div className="h-20 w-32 shrink-0 overflow-hidden rounded-md bg-fundo">
                                        {item.cover_thumb_url ? (
                                            <img
                                                src={item.cover_thumb_url}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                                                <svg className="w-8 h-8 text-texto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Data */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <TypeBadge kind={item.kind} />
                                            {item.year && (
                                                <span className="text-[10px] font-bold text-texto/60 uppercase tracking-widest bg-base px-2 py-0.5 rounded-sm border border-texto/10">
                                                    {item.year}
                                                </span>
                                            )}
                                            {item.source_name && (
                                                <span className="text-[10px] font-bold text-texto/50 uppercase tracking-wide truncate max-w-[120px]">
                                                    {item.source_name}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-texto transition-colors group-hover:text-ciano line-clamp-2">
                                            {item.title}
                                        </h3>
                                        {item.curator_note && (
                                            <div className="mt-4 rounded-lg border border-acento/20 bg-acento/5 p-3 italic text-texto/90 transition-colors group-hover:border-acento/40">
                                                <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-acento">Nota do curador</span>
                                                <p className="text-xs">"{item.curator_note}"</p>
                                            </div>
                                        )}
                                        {!item.curator_note && item.excerpt && (
                                            <p className="text-xs text-texto/70 line-clamp-2">
                                                {item.excerpt}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
