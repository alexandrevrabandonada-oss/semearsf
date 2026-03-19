import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
    <section className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Biblioteca Oficial</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-text-primary md:text-4xl">Relatórios</h1>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          Relatórios, notas técnicas, boletins e anexos oficiais em PDF para consulta pública e controle social.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Ano</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm"
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
                    className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                      isActive
                        ? "bg-brand-primary text-white"
                        : "border border-border-subtle bg-white text-text-secondary hover:border-brand-primary hover:text-brand-primary"
                    }`}
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
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      {!loading && !error && featuredReports.length > 0 ? (
        <div className="rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 via-white to-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Destaques</p>
              <h2 className="mt-1 text-xl font-black text-text-primary">Relatórios editoriais em evidência</h2>
            </div>
            <span className="rounded-full border border-border-subtle bg-white px-3 py-1 text-xs font-semibold text-text-secondary">
              {featuredReports.length} selecionado(s)
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {featuredReports.map((item) => {
              const thumbUrl = getOptimizedCover(item, "thumb");
              return (
                <Link
                  key={item.id}
                  to={`/relatorios/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-brand-primary/20 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md"
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={`Capa de ${item.title}`}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 flex-col justify-between bg-gradient-to-br from-brand-primary/10 via-white to-bg-surface p-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">SEMEAR</span>
                      <span className="text-sm font-black uppercase leading-tight text-text-primary">Destaque editorial</span>
                    </div>
                  )}
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                        Destaque
                      </span>
                      <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        {KIND_LABEL[item.kind]}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-text-primary group-hover:text-brand-primary">{item.title}</h3>
                    {item.summary ? <p className="text-sm leading-relaxed text-text-secondary line-clamp-3">{item.summary}</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        {loading ? (
          <p aria-live="polite" className="text-base text-text-secondary" role="status">Carregando relatórios...</p>
        ) : error ? (
          <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
            {error}
          </p>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-primary/30 bg-brand-primary/5 p-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Biblioteca institucional</p>
            <h2 className="mt-2 text-xl font-black text-text-primary">Nenhum documento encontrado para os filtros aplicados</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-text-secondary">
              Ajuste ano, tipo, tag ou termo de busca para localizar relatórios oficiais. Este acervo é atualizado de forma contínua pela equipe técnica.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {regularReports.map((item) => {
              const thumbUrl = getOptimizedCover(item, "thumb");
              return (
                <li key={item.id}>
                  <Link
                    to={`/relatorios/${item.slug}`}
                    className="grid gap-4 rounded-xl border border-border-subtle bg-bg-surface p-4 transition-all hover:border-brand-primary hover:shadow-md md:grid-cols-[132px_minmax(0,1fr)] md:items-start"
                  >
                    {thumbUrl ? (
                      <div className="overflow-hidden rounded-lg border border-border-subtle bg-white">
                        <img
                          src={thumbUrl}
                          alt={`Capa de ${item.title}`}
                          loading="lazy"
                          className="h-24 w-full object-cover md:h-28"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-full flex-col justify-between rounded-lg border border-dashed border-brand-primary/25 bg-gradient-to-br from-brand-primary/10 via-white to-bg-surface p-3 md:h-28">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">SEMEAR</span>
                        <span className="text-xs font-black uppercase leading-tight text-text-primary">Documento oficial</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary border border-border-subtle">
                            {KIND_LABEL[item.kind]}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-text-secondary">
                          {item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "Sem data"}
                        </span>
                      </div>
                      <h2 className="text-base font-black text-text-primary">{item.title}</h2>
                      {item.summary && <p className="text-sm leading-relaxed text-text-secondary line-clamp-2">{item.summary}</p>}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 5).map((itemTag) => (
                            <button
                              key={itemTag}
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setTag(itemTag);
                              }}
                              className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary transition-colors hover:border-brand-primary hover:bg-brand-primary/5"
                              aria-label={`Filtrar relatórios pela tag ${itemTag}`}
                            >
                              {itemTag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
