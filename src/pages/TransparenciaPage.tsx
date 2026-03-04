import { useEffect, useState } from "react";
import { getTransparencySummary, listExpenses, listTransparencyLinks, type Expense, type TransparencyLink, type TransparencySummary } from "../lib/api";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

export function TransparenciaPage() {
  const [summary, setSummary] = useState<TransparencySummary | null>(null);
  const [links, setLinks] = useState<TransparencyLink[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [sumData, linkData, expData] = await Promise.all([
          getTransparencySummary(),
          listTransparencyLinks(),
          listExpenses(10)
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ciano border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-acento/50 bg-acento/10 p-8 text-center">
        <p className="text-cta font-bold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-bold text-ciano underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="rounded-2xl border border-primaria/60 bg-fundo/80 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ciano">Prestação de Contas</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">
          Transparência da Emenda
        </h1>
        <p className="mt-2 text-sm text-texto/80">
          Acompanhamento financeiro, despesas detalhadas e links oficiais dos órgãos de controle.
        </p>
      </section>

      {/* Financial Summary */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-ciano/20 bg-fundo/40 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-texto/50">Total Investido</p>
          <p className="mt-2 text-3xl font-black text-ciano">
            {summary ? formatBRL(summary.total_cents) : "R$ 0,00"}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-ciano/20 bg-fundo/40 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-texto/50 text-center mb-4">Gasto por Categoria</p>
          <div className="flex flex-wrap justify-center gap-4">
            {summary && Object.entries(summary.by_category).map(([cat, amount]) => (
              <div key={cat} className="flex flex-col items-center min-w-[100px]">
                <span className="text-[10px] font-bold uppercase text-texto/40">{cat}</span>
                <span className="text-sm font-black text-cta">{formatBRL(amount)}</span>
              </div>
            ))}
            {(!summary || Object.keys(summary.by_category).length === 0) && (
              <p className="text-xs text-texto/30 italic">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </section>

      {/* Official Links */}
      <section>
        <h2 className="mb-4 text-lg font-black uppercase tracking-wider text-cta flex items-center gap-2">
          <span className="h-4 w-1 bg-ciano" />
          Links Oficiais
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border border-ciano/10 bg-fundo/60 p-4 transition-all hover:border-ciano hover:bg-fundo/80"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-ciano/60 group-hover:text-ciano">{link.kind}</span>
              <span className="mt-1 text-sm font-bold text-texto group-hover:text-cta">{link.title}</span>
            </a>
          ))}
          {links.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm italic text-texto/30">Nenhum link oficial cadastrado no momento.</p>
          )}
        </div>
      </section>

      {/* Activity Table */}
      <section>
        <h2 className="mb-4 text-lg font-black uppercase tracking-wider text-cta flex items-center gap-2">
          <span className="h-4 w-1 bg-ciano" />
          Últimos Lançamentos
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-ciano/20 bg-fundo/40">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-ciano/10 bg-fundo/60 text-[10px] uppercase tracking-widest text-texto/50">
                <th className="px-4 py-3 font-black">Data</th>
                <th className="px-4 py-3 font-black">Favorecido</th>
                <th className="hidden px-4 py-3 font-black md:table-cell">Categoria</th>
                <th className="px-4 py-3 font-black">Descrição</th>
                <th className="px-4 py-3 text-right font-black">Valor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ciano/5">
              {expenses.map((exp) => (
                <tr key={exp.id} className="transition-colors hover:bg-ciano/5">
                  <td className="px-4 py-4 font-mono text-xs whitespace-nowrap">
                    {new Date(exp.occurred_on).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-4 font-bold text-texto">{exp.vendor}</td>
                  <td className="hidden px-4 py-4 md:table-cell">
                    <span className="rounded-full bg-ciano/10 px-2 py-0.5 text-[10px] font-bold uppercase text-ciano">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-texto/70 line-clamp-1 max-w-[200px]">{exp.description}</td>
                  <td className="px-4 py-4 text-right font-black text-cta whitespace-nowrap">
                    {formatBRL(exp.amount_cents)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {exp.document_url && (
                      <a
                        href={exp.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black uppercase text-ciano hover:underline"
                      >
                        Ver Doc
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center italic text-texto/30">Nenhuma despesa lançada no momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
