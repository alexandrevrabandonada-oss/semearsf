import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listReports, type ReportDocument } from "../../lib/api";

export function ReportsListPage() {
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await listReports(200);
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
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((item) => {
      const title = item.title.toLowerCase();
      const summary = (item.summary ?? "").toLowerCase();
      const tags = item.tags.join(" ").toLowerCase();
      return title.includes(term) || summary.includes(term) || tags.includes(term);
    });
  }, [q, reports]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Documentos Oficiais</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-text-primary md:text-4xl">Relatórios</h1>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          Relatórios técnicos, notas metodológicas e documentos oficiais em PDF para consulta pública.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Buscar</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Título, resumo ou tag..."
            className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-base text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        {loading ? (
          <p aria-live="polite" className="text-base text-text-secondary" role="status">Carregando relatórios...</p>
        ) : error ? (
          <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhum relatório encontrado.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/relatorios/${item.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-surface p-4 transition-all hover:border-brand-primary hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-black text-text-primary">{item.title}</h2>
                    <span className="text-xs font-semibold text-text-secondary">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "Sem data"}
                    </span>
                  </div>
                  {item.summary && <p className="text-sm leading-relaxed text-text-secondary line-clamp-2">{item.summary}</p>}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
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
