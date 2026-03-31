import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { IconShell, SectionHeader, SurfaceCard } from "../../components/BrandSystem";
import { getAcervoByYear, getAcervoYearIndex, type AcervoItem, type AcervoYearIndex } from "../../lib/api";
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

const KIND_LABELS: Record<string, string> = {
  paper: "Artigo",
  report: "Relatório",
  news: "Notícia",
  link: "Link",
  video: "Vídeo",
  photo: "Foto"
};

function isAcervoArea(value: string | undefined): value is AcervoArea {
  return value === "artigos" || value === "noticias" || value === "midias";
}

function TypeBadge({ kind }: { kind: string }) {
  return <span className="ui-chip">{KIND_LABELS[kind] || "Link"}</span>;
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

  const area = useMemo(() => {
    const first = AREA_KINDS.artigos ? "artigos" : undefined;
    return isAcervoArea(first) ? first : "artigos";
  }, []);

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

  if (!isAcervoArea(area)) {
    return (
      <p aria-live="polite" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
        Área inválida. Use /acervo/artigos, /acervo/noticias ou /acervo/midias.
      </p>
    );
  }

  const meta = AREA_META[area];

  return (
    <section className="space-y-12">
      <SurfaceCard className="signature-shell logo-watermark-soft p-6 md:p-8">
        <SectionHeader
          eyebrow={`Acervo / ${meta.label}`}
          title={`${meta.emoji} ${meta.label}`}
          description={meta.description}
        />
      </SurfaceCard>

      <div className="grid gap-6 md:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        <aside className="space-y-4 md:sticky md:top-24 md:self-start">
          <SurfaceCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Linha do tempo</p>
            <p className="mt-2 text-sm text-text-secondary">Navegue pelo acervo histórico por ano de publicação.</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            {isLoadingIndex ? (
              <p className="text-sm text-text-secondary motion-pop">Calculando períodos...</p>
            ) : (
              <div className="grid gap-2">
                {index.map((entry) => (
                  <button
                    key={entry.year}
                    onClick={() => handleSelectYear(entry.year)}
                  className={`motion-control motion-focus flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${selectedYear === entry.year
                      ? "border-brand-primary/15 bg-brand-primary-soft text-brand-primary-dark"
                      : "border-border-subtle bg-surface-1 text-text-secondary hover:border-brand-primary/20 hover:bg-surface-2 hover:text-text-primary"
                      }`}
                  >
                    <span className="font-mono text-lg font-black">{entry.year}</span>
                    <span className="ml-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {entry.total} {entry.total === 1 ? "item" : "itens"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SurfaceCard>
        </aside>

        <main className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {selectedYear && (
            <SurfaceCard className="signature-surface p-5 md:p-6">
              <div className="flex items-end gap-3 border-b border-divider-subtle pb-4">
                <h2 className="text-4xl font-black text-brand-primary-dark">{selectedYear}</h2>
                <span className="mb-1 text-xs font-bold uppercase tracking-widest text-text-secondary">Documentos preservados</span>
              </div>
            </SurfaceCard>
          )}

          <SurfaceCard className="signature-surface p-5 md:p-6">
            {isLoadingItems ? (
              <p className="text-sm text-text-secondary motion-pop">Restaurando arquivos...</p>
            ) : items.length === 0 && !isLoadingIndex ? (
              <div className="seed-placeholder py-8 text-center">
                <p className="text-4xl">📭</p>
                <p className="mt-3 text-base font-semibold text-text-secondary">Nenhum item encontrado para este ano.</p>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/acervo/item/${item.slug}`}
                    className="group motion-list-item signature-surface flex h-full flex-col gap-4 p-4 motion-surface motion-surface-hover md:flex-row md:items-center"
                  >
                    <div className="h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
                      {getOptimizedCover(item, "thumb") ? (
                        <img
                          src={getOptimizedCover(item, "thumb")!}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center opacity-20 transition-opacity group-hover:opacity-40">
                          <IconShell tone="seed" className="h-10 w-10 rounded-full">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                          </IconShell>
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <TypeBadge kind={item.kind} />
                          {item.year && <span className="ui-chip">{item.year}</span>}
                          {item.source_name && <span className="ui-chip">{item.source_name}</span>}
                        </div>
                        {item.published_at && (
                          <span className="shrink-0 text-sm text-text-secondary">
                            {new Date(item.published_at).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black leading-tight text-text-primary transition-colors group-hover:text-brand-primary">
                        {item.title}
                      </h3>
                      {item.curator_note ? (
                        <div className="rounded-2xl border border-accent-brown/15 bg-accent-brown/5 p-3 italic text-text-primary">
                          <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-accent-brown">
                            Nota do curador
                          </span>
                          <p className="text-xs">{item.curator_note}</p>
                        </div>
                      ) : item.excerpt ? (
                        <p className="line-clamp-2 text-xs text-text-secondary">{item.excerpt}</p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SurfaceCard>
        </main>
      </div>
    </section>
  );
}

