import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { listAcervoItems, type AcervoItem, type AcervoKind } from "../../lib/api";
import { type AcervoArea, AREA_KINDS } from "../../lib/acervo";

const AREA_META: Record<AcervoArea, { label: string; emoji: string; description: string; color: string }> = {
    artigos: {
        label: "Artigos",
        emoji: "📄",
        description: "Publicações científicas, relatórios técnicos e papers acadêmicos.",
        color: "border-ciano/60"
    },
    noticias: {
        label: "Notícias",
        emoji: "📰",
        description: "Cobertura jornalística e links sobre qualidade do ar e meio ambiente.",
        color: "border-acento/60"
    },
    midias: {
        label: "Mídias",
        emoji: "🎬",
        description: "Vídeos, fotorreportagens e materiais audiovisuais.",
        color: "border-primaria/60"
    }
};

const KIND_LABELS: Record<AcervoKind, string> = {
    paper: "Artigo",
    report: "Relatório",
    news: "Notícia",
    link: "Link",
    video: "Vídeo",
    photo: "Foto"
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
    cientifico: "Científico",
    imprensa: "Imprensa",
    institucional: "Institucional",
    pessoal: "Pessoal"
};

function isAcervoArea(value: string | undefined): value is AcervoArea {
    return value === "artigos" || value === "noticias" || value === "midias";
}

export function AcervoListPage() {
    const { area } = useParams<{ area: string }>();
    const [items, setItems] = useState<AcervoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [sourceTypeFilter, setSourceTypeFilter] = useState("");
    const [featuredOnly, setFeaturedOnly] = useState(false);

    useEffect(() => {
        if (!isAcervoArea(area)) return;
        let cancelled = false;

        const kinds = AREA_KINDS[area];

        async function run() {
            try {
                setLoading(true);
                setError(null);
                setSearch("");
                setTagFilter("");
                setYearFilter("");
                setSourceTypeFilter("");
                setFeaturedOnly(false);
                // Fetch all kinds for this area in parallel, merge, sort
                const results = await Promise.all(
                    kinds.map((k) => listAcervoItems({ kind: k as AcervoKind, limit: 100 }))
                );
                const merged = results.flat().sort((a, b) => {
                    const ta = a.published_at ?? "";
                    const tb = b.published_at ?? "";
                    return tb.localeCompare(ta);
                });
                if (!cancelled) setItems(merged);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Falha ao carregar itens do acervo.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();
        return () => { cancelled = true; };
    }, [area]);

    const allTags = useMemo(
        () => Array.from(new Set(items.flatMap((i) => i.tags))).sort(),
        [items]
    );

    const allYears = useMemo(
        () =>
            Array.from(new Set(items.map((i) => i.year).filter((y): y is number => y !== null)))
                .sort((a, b) => b - a)
                .map(String),
        [items]
    );

    const allSourceTypes = useMemo(
        () => Array.from(new Set(items.map((i) => i.source_type).filter((t): t is string => t !== null))).sort(),
        [items]
    );

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return items.filter((item) => {
            const matchSearch = !q || item.title.toLowerCase().includes(q) || (item.excerpt ?? "").toLowerCase().includes(q) || (item.authors ?? "").toLowerCase().includes(q);
            const matchTag = !tagFilter || item.tags.includes(tagFilter);
            const matchYear = !yearFilter || String(item.year ?? "") === yearFilter;
            const matchSourceType = !sourceTypeFilter || item.source_type === sourceTypeFilter;
            const matchFeatured = !featuredOnly || item.featured;
            return matchSearch && matchTag && matchYear && matchSourceType && matchFeatured;
        });
    }, [items, search, tagFilter, yearFilter, sourceTypeFilter, featuredOnly]);

    if (!isAcervoArea(area)) {
        return (
            <p aria-live="polite" className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto" role="alert">
                Área inválida. Use /acervo/artigos, /acervo/noticias ou /acervo/midias.
            </p>
        );
    }

    const meta = AREA_META[area];

    return (
        <section className="space-y-6">
            <div className={`rounded-2xl border bg-fundo/80 p-6 md:p-8 ${meta.color}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ciano">Acervo / {meta.label}</p>
                <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">
                    {meta.emoji} {meta.label}
                </h1>
                <p className="mt-2 text-sm text-texto/80">{meta.description}</p>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-ciano/30 bg-fundo/60 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto/70">Busca</span>
                        <input
                            className="w-full rounded-md border border-ciano/40 bg-base px-3 py-2 text-sm text-texto outline-none focus:border-ciano"
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Título, autor ou resumo..."
                            type="search"
                            value={search}
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto/70">Tag</span>
                        <select
                            className="w-full rounded-md border border-ciano/40 bg-base px-3 py-2 text-sm text-texto outline-none focus:border-ciano"
                            onChange={(e) => setTagFilter(e.target.value)}
                            value={tagFilter}
                        >
                            <option value="">Todas</option>
                            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto/70">Fonte</span>
                        <select
                            className="w-full rounded-md border border-ciano/40 bg-base px-3 py-2 text-sm text-texto outline-none focus:border-ciano"
                            onChange={(e) => setSourceTypeFilter(e.target.value)}
                            value={sourceTypeFilter}
                        >
                            <option value="">Todas</option>
                            {allSourceTypes.map((t) => <option key={t} value={t}>{SOURCE_TYPE_LABELS[t] || t}</option>)}
                        </select>
                    </label>
                    <div className="flex flex-col justify-end">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                checked={featuredOnly}
                                className="size-4 rounded border-ciano/40 bg-base text-ciano focus:ring-ciano"
                                onChange={(e) => setFeaturedOnly(e.target.checked)}
                                type="checkbox"
                            />
                            <span className="text-xs font-semibold uppercase tracking-wide text-texto/70">Apenas Destaques</span>
                        </label>
                    </div>
                </div>
                {(search || tagFilter || yearFilter || sourceTypeFilter || featuredOnly) && (
                    <button
                        className="mt-3 text-xs font-semibold text-ciano/80 underline hover:text-ciano"
                        onClick={() => { setSearch(""); setTagFilter(""); setYearFilter(""); setSourceTypeFilter(""); setFeaturedOnly(false); }}
                        type="button"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Results */}
            <div className="rounded-2xl border border-primaria/40 bg-base/70 p-6">
                {loading ? (
                    <p aria-live="polite" className="text-sm text-texto/80" role="status">
                        Carregando {meta.label.toLowerCase()}...
                    </p>
                ) : error ? (
                    <p aria-live="assertive" className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto" role="alert">
                        {error}
                    </p>
                ) : filtered.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-4xl">📭</p>
                        <p aria-live="polite" className="mt-3 text-sm font-semibold text-texto/70" role="status">
                            {items.length === 0
                                ? `Nenhum item publicado em ${meta.label} ainda.`
                                : "Nenhum resultado para os filtros aplicados."}
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {filtered.map((item) => (
                            <li key={item.slug}>
                                <Link
                                    className="flex flex-col gap-1 rounded-xl border border-ciano/20 bg-fundo/70 p-4 transition-all hover:border-ciano/60 hover:bg-fundo/90"
                                    to={`/acervo/item/${item.slug}`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="shrink-0 rounded-full bg-ciano/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ciano">
                                                {KIND_LABELS[item.kind]}
                                            </span>
                                            {item.source_type && (
                                                <span className="shrink-0 rounded-full bg-acento/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-acento">
                                                    {SOURCE_TYPE_LABELS[item.source_type] || item.source_type}
                                                </span>
                                            )}
                                            {item.featured && (
                                                <span className="shrink-0 text-xs">⭐</span>
                                            )}
                                            <p className="font-bold text-texto">{item.title}</p>
                                        </div>
                                        {item.published_at && (
                                            <span className="shrink-0 text-xs text-texto/50">
                                                {new Date(item.published_at).toLocaleDateString("pt-BR")}
                                            </span>
                                        )}
                                    </div>
                                    {item.authors && (
                                        <p className="text-[10px] font-semibold text-texto/60 italic">Por: {item.authors}</p>
                                    )}
                                    {item.excerpt && (
                                        <p className="line-clamp-2 text-xs text-texto/70">{item.excerpt}</p>
                                    )}
                                    {item.source_name && (
                                        <p className="text-[10px] text-texto/50">Fonte: {item.source_name}</p>
                                    )}
                                    {item.tags.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
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
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
