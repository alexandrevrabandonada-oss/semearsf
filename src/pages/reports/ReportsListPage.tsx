import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listReports, type ReportDocument, type ReportKind } from "../../lib/api";

const KIND_LABEL: Record<ReportKind, string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota técnica",
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

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tipo</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as "all" | ReportKind)}
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="relatorio">Relatório</option>
              <option value="nota-tecnica">Nota técnica</option>
              <option value="boletim">Boletim</option>
              <option value="anexo">Anexo</option>
            </select>
          </label>

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

          <label className="block">
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
            {reports.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/relatorios/${item.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-surface p-4 transition-all hover:border-brand-primary hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.featured && (
                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                          Destaque
                        </span>
                      )}
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
                        <span key={itemTag} className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
                          {itemTag}
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
