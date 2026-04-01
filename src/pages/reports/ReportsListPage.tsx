import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Chip, EditorialCard, EditorialCardActions, EditorialCardBody, EditorialCardExcerpt, EditorialCardMeta, EditorialCardTitle, SectionHeader, SurfaceCard } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";
import { getOptimizedCover } from "../../lib/imageOptimization";
import { listReports, type ReportDocument, type ReportKind } from "../../lib/api";

const KIND_LABEL: Record<ReportKind, string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

export function ReportsListPage() {
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [allReports, setAllReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState<string>("all");
  const [kind, setKind] = useState<"all" | ReportKind>("all");
  const [tag, setTag] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        const data = await listReports({ limit: 500 });
        if (cancelled) return;
        setAllReports(data);
      } catch {
        // options fallback silently
      }
    }
    void loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await listReports({
          limit: 500,
          year: year === "all" ? undefined : Number(year),
          kind: kind === "all" ? undefined : kind,
          tag: tag === "all" ? undefined : tag,
          q: q.trim() || undefined
        });
        if (!cancelled) setReports(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar relatórios.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [year, kind, tag, q]);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(allReports.map((item) => item.year).filter((v): v is number => typeof v === "number")));
    return years.sort((a, b) => b - a);
  }, [allReports]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    allReports.forEach((item) => item.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allReports]);

  const featuredReports = useMemo(() => reports.filter((item) => item.featured).slice(0, 3), [reports]);
  const featuredIds = useMemo(() => new Set(featuredReports.map((item) => item.id)), [featuredReports]);
  const regularReports = useMemo(() => reports.filter((item) => !featuredIds.has(item.id)), [featuredIds, reports]);

  return (
    <section className="space-y-10 md:space-y-12">
      <SurfaceCard className="signature-shell logo-watermark-soft p-6 md:p-8">
        <SectionHeader
          eyebrow="Biblioteca oficial"
          title="Relatórios"
          description="Relatórios, notas técnicas, boletins e anexos oficiais em PDF para consulta pública e controle social."
        />
      </SurfaceCard>

      <SurfaceCard className="p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Ano</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              {yearOptions.map((value) => (
                <option key={value} value={String(value)}>{value}</option>
              ))}
            </select>
          </label>

          <div className="block md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tipo</span>
            <div className="flex flex-wrap gap-2">
              {(["all", "relatorio", "nota-tecnica", "boletim", "anexo"] as const).map((value) => {
                const isActive = kind === value;
                const label = value === "all" ? "Todos" : KIND_LABEL[value];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setKind(value)}
                    className={`ui-segment-tab ${isActive ? "ui-segment-tab-active" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tag</span>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              {tagOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-4">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Busca</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Título ou resumo..."
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </SurfaceCard>

      {!loading && !error && featuredReports.length > 0 ? (
        <SurfaceCard className="signature-shell border-brand-primary/15 bg-gradient-to-br from-brand-primary-soft/60 via-surface-1 to-surface-1 p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div className="space-y-2">
              <span className="section-badge">Destaques</span>
              <h2 className="text-xl font-black leading-tight text-text-primary md:text-2xl">Relatórios editoriais em evidência</h2>
            </div>
            <Chip tone="active">{featuredReports.length} selecionado(s)</Chip>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredReports.map((item) => {
              const thumbUrl = getOptimizedCover(item, "thumb");
              return (
                <Link
                  key={item.id}
                  to={`/relatorios/${item.slug}`}
                  className="group motion-list-item block h-full"
                >
                  <EditorialCard variant="featured" tone="documental">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`Capa de ${item.title}`}
                        loading="lazy"
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="report-placeholder flex h-48 flex-col justify-between p-5">
                        <span className="section-badge w-fit">SEMEAR</span>
                        <span className="text-base font-black uppercase leading-tight text-text-primary">Destaque editorial</span>
                      </div>
                    )}
                    <EditorialCardBody>
                      <EditorialCardMeta>
                        <span className="ui-tag-signature">Destaque</span>
                        <span className="ui-tag-signature">{KIND_LABEL[item.kind]}</span>
                      </EditorialCardMeta>
                      <EditorialCardTitle className="line-clamp-2">{item.title}</EditorialCardTitle>
                      {item.summary ? <EditorialCardExcerpt className="line-clamp-3">{item.summary}</EditorialCardExcerpt> : null}
                      <EditorialCardActions className="pt-1">
                        <span className="semear-card-cta">
                          Abrir PDF
                          <span aria-hidden="true">→</span>
                        </span>
                      </EditorialCardActions>
                    </EditorialCardBody>
                  </EditorialCard>
                </Link>
              );
            })}
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2" aria-live="polite" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <BrandTextureSkeleton key={index} className="h-52 rounded-[1.5rem]" lines={4} />
            ))}
          </div>
        ) : error ? (
          <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
            {error}
          </p>
        ) : reports.length === 0 ? (
          <BrandIllustratedEmptyState
            title="Nenhum documento encontrado para os filtros aplicados"
            description="Ajuste ano, tipo, tag ou termo de busca para localizar relatórios oficiais do SEMEAR."
            icon={<span className="text-2xl" aria-hidden="true">📄</span>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {regularReports.map((item) => {
              const thumbUrl = getOptimizedCover(item, "thumb");
              return (
                <Link
                  key={item.id}
                  to={`/relatorios/${item.slug}`}
                  className="group motion-list-item block h-full"
                >
                  <EditorialCard variant="compact" tone="documental">
                    {thumbUrl ? (
                      <div className="h-36 overflow-hidden bg-surface-2">
                        <img
                          src={thumbUrl}
                          alt={`Capa de ${item.title}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="document-placeholder flex h-36 w-full flex-col justify-between p-4">
                        <span className="section-badge w-fit">SEMEAR</span>
                        <span className="text-xs font-black uppercase leading-tight text-text-primary">Documento oficial</span>
                      </div>
                    )}
                    <EditorialCardBody className="gap-2">
                      <EditorialCardMeta className="justify-between">
                        <span className="ui-tag-signature">
                          {KIND_LABEL[item.kind]}
                        </span>
                        <span>{item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "Sem data"}</span>
                      </EditorialCardMeta>
                      <EditorialCardTitle className="text-base line-clamp-2 md:text-lg">{item.title}</EditorialCardTitle>
                      {item.summary ? <EditorialCardExcerpt className="line-clamp-2 text-sm">{item.summary}</EditorialCardExcerpt> : null}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 4).map((itemTag) => (
                            <button
                              key={itemTag}
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setTag(itemTag);
                              }}
                              className="motion-control ui-tag-signature"
                              aria-label={`Filtrar relatórios pela tag ${itemTag}`}
                            >
                              {itemTag}
                            </button>
                          ))}
                        </div>
                      )}
                      <EditorialCardActions className="pt-1">
                        <span className="semear-card-cta">
                          Abrir PDF
                          <span aria-hidden="true">→</span>
                        </span>
                      </EditorialCardActions>
                    </EditorialCardBody>
                  </EditorialCard>
                </Link>
              );
            })}
          </div>
        )}
      </SurfaceCard>
    </section>
  );
}


