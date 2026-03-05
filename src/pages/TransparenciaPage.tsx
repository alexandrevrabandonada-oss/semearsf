import { useEffect, useState } from "react";
import { getTransparencySummary, listExpenses, listTransparencyLinks, type Expense, type TransparencyLink, type TransparencySummary } from "../lib/api";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

function toCsvCell(value: unknown) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function TransparenciaPage() {
  const [summary, setSummary] = useState<TransparencySummary | null>(null);
  const [links, setLinks] = useState<TransparencyLink[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadExpensesCsv = () => {
    const header = ["occurred_on", "vendor", "category", "amount", "description", "document_url"];
    const rows = expenses.map((exp) => [
      exp.occurred_on,
      exp.vendor,
      exp.category,
      (exp.amount_cents / 100).toFixed(2),
      exp.description,
      exp.document_url ?? ""
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => toCsvCell(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos_transparencia_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [sumData, linkData, expData] = await Promise.all([
          getTransparencySummary(),
          listTransparencyLinks(),
          listExpenses(1000)
        ]);
        if (!cancelled) {
          setSummary(sumData);
          setLinks(linkData);
          setExpenses(expData);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-danger bg-danger/10 p-8 text-center">
        <p className="text-base font-bold text-danger">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-brand-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-primary-dark"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm md:p-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary md:text-4xl">
              Transparência e Prestação de Contas
            </h1>
            <p className="mt-2 text-base text-text-secondary">
              Acompanhamento financeiro completo e auditável do projeto SEMEAR
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-brand-primary/30 bg-brand-primary-soft p-4">
          <p className="text-sm font-semibold text-brand-primary">
            ✓ Todos os recursos são públicos, provenientes de emenda parlamentar
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Prestação de contas permanente e acessível à população
          </p>
        </div>
      </section>

      {/* Financial Summary */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Total Investido</p>
          </div>
          <p className="mt-2 text-3xl font-black text-success">
            {summary ? formatBRL(summary.total_cents) : "R$ 0,00"}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Recursos de emenda parlamentar</p>
        </div>

        <div className="col-span-2 rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">Distribuição por Categoria</p>
          <div className="flex flex-wrap gap-4">
            {summary && Object.entries(summary.by_category).map(([cat, amount]) => (
              <div key={cat} className="flex flex-col rounded-lg border border-border-subtle bg-bg-surface px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{cat}</span>
                <span className="mt-1 text-lg font-black text-brand-primary">{formatBRL(amount)}</span>
              </div>
            ))}
            {(!summary || Object.keys(summary.by_category).length === 0) && (
              <p className="text-sm italic text-text-secondary">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </section>

      {/* Official Links */}
      <section className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-text-primary">Links Oficiais de Controle</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-surface p-4 transition-all hover:border-brand-primary hover:shadow-md"
            >
              <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">{link.kind}</span>
              <span className="text-base font-bold text-text-primary group-hover:text-brand-primary">{link.title}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-text-secondary">
                Acessar link externo
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </a>
          ))}
          {links.length === 0 && (
            <p className="col-span-full rounded-lg border border-dashed border-border-subtle bg-bg-surface p-8 text-center text-base text-text-secondary">Nenhum link oficial cadastrado no momento.</p>
          )}
        </div>
      </section>

      {/* Activity Table */}
      <section className="rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/10 text-accent-green">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
            <h2 className="text-2xl font-black text-text-primary">Últimas Despesas Lançadas</h2>
          </div>
          <button
          type="button"
          onClick={handleDownloadExpensesCsv}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-brand-primary transition-colors hover:bg-bg-surface"
        >
          Baixar CSV (gastos)
        </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-surface">
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Data</th>
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Favorecido</th>
                <th className="hidden px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Descrição</th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-wider text-text-secondary">Valor</th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-wider text-text-secondary">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {expenses.map((exp) => (
                <tr key={exp.id} className="transition-colors hover:bg-bg-surface">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-text-secondary">
                    {new Date(exp.occurred_on).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-4 font-semibold text-text-primary">{exp.vendor}</td>
                  <td className="hidden px-4 py-4 md:table-cell">
                    <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                      {exp.category}
                    </span>
                  </td>
                  <td className="max-w-[200px] px-4 py-4 text-sm text-text-secondary line-clamp-1">{exp.description}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-success">
                    {formatBRL(exp.amount_cents)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {exp.document_url ? (
                      <a
                        href={exp.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                      >
                        Documento
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-bg-surface px-2 py-1 text-xs font-semibold text-text-secondary">Sem documento</span>
                    )}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-base text-text-secondary">Nenhuma despesa lançada no momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
