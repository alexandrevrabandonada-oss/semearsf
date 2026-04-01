import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Chip, EditorialCard, EditorialCardActions, EditorialCardBody, EditorialCardExcerpt, EditorialCardMeta, EditorialCardTitle, IconShell, SectionHeader, SurfaceCard } from "../../components/BrandSystem";
import { listAcervoItems, type AcervoItem, type AcervoKind } from "../../lib/api";
import { type AcervoArea, AREA_KINDS } from "../../lib/acervo";
import { getOptimizedCover } from "../../lib/imageOptimization";

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
        const results = await Promise.all(kinds.map((k) => listAcervoItems({ kind: k as AcervoKind, limit: 100 })));
        const merged = results.flat().sort((a, b) => {
          const ta = a.published_at ?? "";
          const tb = b.published_at ?? "";
          return tb.localeCompare(ta);
        });
        if (!cancelled) setItems(merged);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar itens do acervo.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [area]);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);
  const allYears = useMemo(
    () => Array.from(new Set(items.map((i) => i.year).filter((y): y is number => y !== null))).sort((a, b) => b - a).map(String),
    [items]
  );
  const allSourceTypes = useMemo(() => Array.from(new Set(items.map((i) => i.source_type).filter((t): t is string => t !== null))).sort(), [items]);

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
      <p aria-live="polite" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
        Área inválida. Use /acervo/artigos, /acervo/noticias ou /acervo/midias.
      </p>
    );
  }

  const meta = AREA_META[area];

  return (
    <section className="space-y-8">
      <SurfaceCard className="signature-shell document-placeholder p-6 md:p-8">
        <SectionHeader
          eyebrow={`Acervo / ${meta.label}`}
          title={`${meta.emoji} ${meta.label}`}
          description={meta.description}
        />
      </SurfaceCard>

      <SurfaceCard className="p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Busca</span>
            <input
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-base text-text-primary outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Título, autor ou resumo..."
              type="search"
              value={search}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tag</span>
            <select
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-base text-text-primary outline-none"
              onChange={(e) => setTagFilter(e.target.value)}
              value={tagFilter}
            >
              <option value="">Todas</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Fonte</span>
            <select
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-base text-text-primary outline-none"
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
                className="size-4 rounded border-border-subtle bg-white text-brand-primary focus:ring-brand-primary"
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                type="checkbox"
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Apenas destaques</span>
            </label>
          </div>
        </div>
        {(search || tagFilter || yearFilter || sourceTypeFilter || featuredOnly) && (
          <button
            className="mt-3 text-sm font-semibold text-brand-primary underline hover:text-brand-primary/80"
            onClick={() => { setSearch(""); setTagFilter(""); setYearFilter(""); setSourceTypeFilter(""); setFeaturedOnly(false); }}
            type="button"
          >
            Limpar filtros
          </button>
        )}
      </SurfaceCard>

      <SurfaceCard className="p-6">
        {loading ? (
          <p aria-live="polite" className="text-base text-text-secondary" role="status">Carregando {meta.label.toLowerCase()}...</p>
        ) : error ? (
          <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="document-placeholder py-8 text-center">
            <p className="text-4xl">📭</p>
            <p aria-live="polite" className="mt-3 text-base font-semibold text-text-secondary" role="status">
              {items.length === 0 ? `Nenhum item publicado em ${meta.label} ainda.` : "Nenhum resultado para os filtros aplicados."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {filtered.map((item) => (
              <li key={item.slug}>
                <Link
                  className="group motion-list-item block h-full"
                  to={`/acervo/item/${item.slug}`}
                >
                  <EditorialCard variant={item.cover_url ? "media" : "compact"}>
                    {item.cover_url ? (
                      <div className="relative h-40 overflow-hidden bg-surface-2">
                        <img
                          src={getOptimizedCover(item, "thumb") || ""}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                          style={(!item.cover_small_url && !item.cover_thumb_url) ? {} : { filter: "blur(0)" }}
                        />
                      </div>
                    ) : (
                      <div className="document-placeholder flex h-40 flex-col justify-between p-5">
                        <span className="section-badge w-fit">SEMEAR</span>
                        <span className="max-w-[12rem] text-lg font-black leading-tight text-text-primary">Item do acervo</span>
                      </div>
                    )}
                    <EditorialCardBody>
                      <EditorialCardMeta className="justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-border-subtle bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{KIND_LABELS[item.kind]}</span>
                          {item.source_type && <Chip tone="active">{SOURCE_TYPE_LABELS[item.source_type] || item.source_type}</Chip>}
                          {item.featured ? <Chip tone="seed">Destaque</Chip> : null}
                        </div>
                        {item.published_at && <span className="shrink-0 text-sm text-text-secondary">{new Date(item.published_at).toLocaleDateString("pt-BR")}</span>}
                      </EditorialCardMeta>
                      <EditorialCardTitle className="line-clamp-2">{item.title}</EditorialCardTitle>
                      {item.authors ? <p className="text-xs font-semibold italic text-text-secondary">Por: {item.authors}</p> : null}
                      {item.excerpt ? <EditorialCardExcerpt className="line-clamp-2 text-sm">{item.excerpt}</EditorialCardExcerpt> : null}
                      {item.source_name ? <p className="text-xs text-text-secondary">Fonte: {item.source_name}</p> : null}
                      {item.tags.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.tags.slice(0, 5).map((itemTag) => (
                            <span key={itemTag} className="ui-chip">
                              {itemTag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <EditorialCardActions className="pt-1">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary">
                          Abrir item
                          <span aria-hidden="true">→</span>
                        </span>
                      </EditorialCardActions>
                    </EditorialCardBody>
                  </EditorialCard>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </section>
  );
}
