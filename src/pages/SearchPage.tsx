import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchAcervo, searchBlog, searchTransparency, searchEvents, searchAll, type AcervoItem, type BlogPost, type Event, type SearchResultItem } from "../lib/api";

type SearchType = "todos" | "acervo" | "blog" | "transparencia" | "agenda";

interface SearchResults {
    acervo: AcervoItem[];
    blog: BlogPost[];
    transparency: any[];
    events: Event[];
    mixed: SearchResultItem[];
}

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const tipo = (searchParams.get("tipo") as SearchType) || "todos";

    const [results, setResults] = useState<SearchResults>({
        acervo: [],
        blog: [],
        transparency: [],
        events: [],
        mixed: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ acervo: [], blog: [], transparency: [], events: [], mixed: [] });
            return;
        }

        async function performSearch() {
            try {
                setLoading(true);
                setError(null);

                const promises: Promise<any>[] = [];

                if (query.trim().length >= 2) {
                    const [mixedRes, transRes, eventsRes] = await Promise.all([
                        searchAll(query, 30),
                        searchTransparency(query, 5),
                        searchEvents(query, 5)
                    ]);

                    // Client-side filtering of the mixed FTS results based on 'tipo'
                    const isAll = tipo === "todos";
                    const isAcervo = tipo === "acervo";
                    const isBlog = tipo === "blog";

                    setResults({
                        acervo: isAcervo ? (mixedRes.filter(r => r.kind === "acervo") as unknown as AcervoItem[]) : [],
                        blog: isBlog ? (mixedRes.filter(r => r.kind === "blog") as unknown as BlogPost[]) : [],
                        transparency: (isAll || tipo === "transparencia") ? transRes : [],
                        events: (isAll || tipo === "agenda") ? eventsRes : [],
                        mixed: isAll ? mixedRes : []
                    });
                } else {
                    // Fallback for short queries (though 1 char usually isn't very useful, we keep the original logic just in case)
                    if (tipo === "todos" || tipo === "acervo") promises.push(searchAcervo(query, 10));
                    else promises.push(Promise.resolve([]));

                    if (tipo === "todos" || tipo === "blog") promises.push(searchBlog(query, 10));
                    else promises.push(Promise.resolve([]));

                    if (tipo === "todos" || tipo === "transparencia") promises.push(searchTransparency(query, 10));
                    else promises.push(Promise.resolve([]));

                    if (tipo === "todos" || tipo === "agenda") promises.push(searchEvents(query, 10));
                    else promises.push(Promise.resolve([]));

                    const [acervoRes, blogRes, transRes, eventsRes] = await Promise.all(promises);

                    setResults({
                        acervo: acervoRes,
                        blog: blogRes,
                        transparency: transRes,
                        events: eventsRes,
                        mixed: []
                    });
                }
            } catch (err) {
                console.error("Erro na busca:", err);
                setError("Ocorreu um erro ao realizar a busca.");
            } finally {
                setLoading(false);
            }
        }

        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [query, tipo]);

    const handleTipoChange = (newTipo: SearchType) => {
        setSearchParams({ q: query, tipo: newTipo });
    };

    const totalResults = results.acervo.length + results.blog.length + results.transparency.length + results.events.length + results.mixed.length;

    const formatCurrency = (cents: number) => {
        return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    return (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ciano">Busca Global</p>
                    <h1 className="text-4xl font-black text-texto">Explorar o Projeto</h1>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="O que você está procurando? (ex: estação, emenda, evento...)"
                        value={query}
                        onChange={(e) => setSearchParams({ q: e.target.value, tipo })}
                        className="w-full rounded-2xl border border-ciano/30 bg-base/40 p-5 pr-14 text-lg font-bold text-texto placeholder:text-texto/40 focus:border-ciano focus:outline-none transition-all group-hover:border-ciano/50 shadow-lg"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-ciano/60">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(["todos", "acervo", "blog", "transparencia", "agenda"] as SearchType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => handleTipoChange(t)}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${tipo === t
                                ? "bg-ciano text-base shadow-lg shadow-ciano/20"
                                : "bg-base/40 text-texto/60 hover:bg-base/60 hover:text-texto"
                                }`}
                        >
                            <span>{t === "transparencia" ? "Transparência" : t}</span>
                            {query.trim().length >= 2 && !loading && (
                                <span className={`flex h-4 items-center justify-center rounded-full px-1.5 text-[9px] ${tipo === t ? 'bg-base/20 text-base' : 'bg-texto/10 text-texto/60'}`}>
                                    {t === "todos" ? totalResults : results[t === "agenda" ? "events" : t === "transparencia" ? "transparency" : t].length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="h-12 w-12 rounded-full border-4 border-ciano border-t-transparent animate-spin mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-ciano italic">Vasculhando o projeto...</p>
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-dashed border-acento/40 p-10 text-center bg-acento/5">
                    <p className="text-acento font-bold">{error}</p>
                </div>
            ) : query && totalResults === 0 ? (
                <div className="rounded-2xl border border-dashed border-ciano/30 p-20 text-center bg-base/20">
                    <div className="text-4xl mb-4">🔦</div>
                    <h2 className="text-xl font-bold text-texto uppercase">Nenhum resultado</h2>
                    <p className="mt-2 text-sm text-texto/50">Tente usar termos mais genéricos ou verifique a ortografia.</p>
                </div>
            ) : !query ? (
                <div className="rounded-2xl border border-dashed border-ciano/30 p-20 text-center bg-base/20">
                    <div className="text-4xl mb-4">🔎</div>
                    <h2 className="text-xl font-bold text-texto uppercase">Comece a digitar</h2>
                    <p className="mt-2 text-sm text-texto/50">Digite algo acima para buscar no acervo, blog, transparência e agenda.</p>
                </div>
            ) : (
                <div className="space-y-12 pb-20">
                    {/* Mixed Results (FTS) */}
                    {results.mixed.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta flex items-center gap-2">
                                Principais Resultados <span className="rounded-full bg-cta/10 px-2 py-0.5 text-[10px] text-cta">{results.mixed.length}</span>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {results.mixed.map((item) => (
                                    <Link
                                        key={item.url}
                                        to={item.url}
                                        className="group flex flex-col rounded-xl border border-ciano/20 bg-fundo/60 p-5 transition-all hover:border-ciano hover:bg-fundo/80"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${item.kind === 'blog' ? 'bg-primaria/10 text-primaria' : 'bg-ciano/10 text-ciano'}`}>
                                                {item.kind === 'blog' ? 'Blog da Emenda' : 'Acervo'}
                                            </span>
                                            <span className="text-[10px] text-texto/40">Score: {item.score.toFixed(2)}</span>
                                        </div>
                                        <h3 className="mt-2 font-bold text-texto group-hover:text-ciano">{item.title}</h3>
                                        {item.excerpt && <p className="mt-2 text-xs text-texto/60 line-clamp-2">{item.excerpt}</p>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Acervo Results */}
                    {results.acervo.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta flex items-center gap-2">
                                Acervo <span className="rounded-full bg-cta/10 px-2 py-0.5 text-[10px] text-cta">{results.acervo.length}</span>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {results.acervo.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/acervo/item/${item.slug}`}
                                        className="group flex flex-col rounded-xl border border-ciano/20 bg-fundo/60 p-5 transition-all hover:border-ciano hover:bg-fundo/80"
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-ciano">{item.kind}</span>
                                        <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{item.title}</h3>
                                        {item.excerpt && <p className="mt-2 line-clamp-2 text-xs text-texto/60">{item.excerpt}</p>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Blog Results */}
                    {results.blog.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta flex items-center gap-2">
                                Blog <span className="rounded-full bg-cta/10 px-2 py-0.5 text-[10px] text-cta">{results.blog.length}</span>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {results.blog.map((post) => (
                                    <Link
                                        key={post.id}
                                        to={`/blog/${post.slug}`}
                                        className="group flex flex-col rounded-xl border border-primaria/20 bg-fundo/60 p-5 transition-all hover:border-primaria hover:bg-fundo/80"
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primaria">Boletim</span>
                                        <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{post.title}</h3>
                                        <p className="mt-2 text-[10px] text-texto/40 uppercase">{new Date(post.published_at!).toLocaleDateString()}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agenda Results */}
                    {results.events.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta flex items-center gap-2">
                                Agenda <span className="rounded-full bg-cta/10 px-2 py-0.5 text-[10px] text-cta">{results.events.length}</span>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {results.events.map((event) => (
                                    <Link
                                        key={event.id}
                                        to="/agenda"
                                        className="group flex flex-col rounded-xl border border-acento/20 bg-fundo/60 p-5 transition-all hover:border-acento hover:bg-fundo/80"
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-acento">
                                            {new Date(event.start_at).toLocaleDateString()}
                                        </span>
                                        <h3 className="mt-1 font-bold text-texto group-hover:text-cta">{event.title}</h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transparency Results */}
                    {results.transparency.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta flex items-center gap-2">
                                Transparência <span className="rounded-full bg-cta/10 px-2 py-0.5 text-[10px] text-cta">{results.transparency.length}</span>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {results.transparency.map((expense) => (
                                    <Link
                                        key={expense.id}
                                        to="/transparencia"
                                        className="group flex flex-col rounded-xl border border-base/40 bg-fundo/60 p-5 transition-all hover:border-ciano hover:bg-fundo/80"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-texto/40">{expense.category}</span>
                                            <span className="text-sm font-black text-primaria">{formatCurrency(expense.amount_cents)}</span>
                                        </div>
                                        <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{expense.vendor}</h3>
                                        <p className="mt-1 text-xs text-texto/60">{expense.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
