import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  searchAcervo,
  searchAll,
  searchBlog,
  searchEvents,
  searchReports,
  searchTransparency,
  type AcervoItem,
  type BlogPost,
  type Event,
  type ReportDocument,
  type SearchResultItem
} from "../lib/api";

type SearchType = "todos" | "acervo" | "blog" | "relatorios" | "transparencia" | "agenda";

type SearchResults = {
  acervo: AcervoItem[];
  blog: BlogPost[];
  reports: ReportDocument[];
  transparency: any[];
  events: Event[];
  mixed: SearchResultItem[];
};

const EMPTY_RESULTS: SearchResults = {
  acervo: [],
  blog: [],
  reports: [],
  transparency: [],
  events: [],
  mixed: []
};

const TYPE_LABEL: Record<SearchType, string> = {
  todos: "Todos",
  acervo: "Acervo",
  blog: "Blog",
  relatorios: "Relatórios",
  transparencia: "Transparência",
  agenda: "Agenda"
};

const REPORT_KIND_LABEL: Record<ReportDocument["kind"], string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

function reportToSearchResult(report: ReportDocument): SearchResultItem {
  return {
    kind: "report",
    title: report.title,
    slug: report.slug,
    excerpt: report.summary ?? "",
    score: 0,
    url: `/relatorios/${report.slug}`
  };
}


export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tipo = (searchParams.get("tipo") as SearchType) || "todos";

  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY_RESULTS);
      return;
    }

    async function performSearch() {
      try {
        setLoading(true);
        setError(null);

        if (query.trim().length >= 2) {
          const [mixedRes, reportsRes, transRes, eventsRes] = await Promise.all([
            searchAll(query, 30),
            searchReports(query, 10),
            searchTransparency(query, 5),
            searchEvents(query, 5)
          ]);
          const mixedWithReports = [...mixedRes];
          reportsRes.forEach((report) => {
            const reportResult = reportToSearchResult(report);
            if (!mixedWithReports.some((item) => item.url === reportResult.url)) {
              mixedWithReports.push(reportResult);
            }
          });

          const isAll = tipo === "todos";
          const isAcervo = tipo === "acervo";
          const isBlog = tipo === "blog";
          const isReports = tipo === "relatorios";

          setResults({
            acervo: isAcervo ? (mixedRes.filter((r) => r.kind === "acervo") as unknown as AcervoItem[]) : [],
            blog: isBlog ? (mixedRes.filter((r) => r.kind === "blog") as unknown as BlogPost[]) : [],
            reports: isAll || isReports ? reportsRes : [],
            transparency: isAll || tipo === "transparencia" ? transRes : [],
            events: isAll || tipo === "agenda" ? eventsRes : [],
            mixed: isAll ? mixedWithReports : []
          });
        } else {
          const promises: Promise<any>[] = [];

          if (tipo === "todos" || tipo === "acervo") promises.push(searchAcervo(query, 10));
          else promises.push(Promise.resolve([]));

          if (tipo === "todos" || tipo === "blog") promises.push(searchBlog(query, 10));
          else promises.push(Promise.resolve([]));

          if (tipo === "todos" || tipo === "relatorios") promises.push(searchReports(query, 10));
          else promises.push(Promise.resolve([]));

          if (tipo === "todos" || tipo === "transparencia") promises.push(searchTransparency(query, 10));
          else promises.push(Promise.resolve([]));

          if (tipo === "todos" || tipo === "agenda") promises.push(searchEvents(query, 10));
          else promises.push(Promise.resolve([]));

          const [acervoRes, blogRes, reportsRes, transRes, eventsRes] = await Promise.all(promises);

          setResults({
            acervo: acervoRes,
            blog: blogRes,
            reports: reportsRes,
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

  const totalResults =
    results.acervo.length +
    results.blog.length +
    results.reports.length +
    results.transparency.length +
    results.events.length +
    results.mixed.length;

  const countByType: Record<SearchType, number> = {
    todos: totalResults,
    acervo: results.acervo.length,
    blog: results.blog.length,
    relatorios: results.reports.length,
    transparencia: results.transparency.length,
    agenda: results.events.length
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-black text-text-primary">Busca no Portal</h1>
          <p className="mt-2 text-base text-text-secondary">Explore acervo, blog, relatórios, transparência e agenda</p>
        </div>

        <div className="relative group">
          <label htmlFor="global-search" className="sr-only">Buscar no portal SEMEAR</label>
          <input
            id="global-search"
            type="search"
            placeholder="Digite palavras-chave"
            value={query}
            onChange={(e) => setSearchParams({ q: e.target.value, tipo })}
            className="w-full rounded-xl border-2 border-border-subtle bg-white p-5 pr-14 text-base font-semibold text-text-primary placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-sm"
          />
        </div>

        <div role="group" aria-label="Filtros de busca">
          <div className="flex flex-wrap gap-2">
            {(["todos", "acervo", "blog", "relatorios", "transparencia", "agenda"] as SearchType[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTipoChange(t)}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  tipo === t
                    ? "bg-brand-primary text-white shadow-md"
                    : "border border-border-subtle bg-white text-text-secondary hover:bg-brand-primary-soft hover:text-brand-primary"
                }`}
                aria-pressed={tipo === t}
              >
                <span>{TYPE_LABEL[t]}</span>
                {query.trim().length >= 2 && !loading && (
                  <span
                    className={`flex h-5 items-center justify-center rounded-full px-2 text-xs font-bold ${
                      tipo === t ? "bg-white/20 text-white" : "bg-brand-primary/10 text-brand-primary"
                    }`}
                    aria-label={`${countByType[t]} resultados`}
                  >
                    {countByType[t]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
          <div className="h-12 w-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin mb-4" aria-hidden="true" />
          <p className="text-base font-semibold text-brand-primary">Buscando resultados...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border-2 border-danger bg-danger/10 p-10 text-center" role="alert">
          <p className="text-base font-bold text-danger">{error}</p>
        </div>
      ) : query && totalResults === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-bg-surface p-20 text-center">
          <h2 className="text-xl font-bold text-text-primary">Nenhum resultado encontrado</h2>
          <p className="mt-2 text-base text-text-secondary">Tente usar termos mais genéricos.</p>
        </div>
      ) : !query ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-bg-surface p-20 text-center">
          <h2 className="text-xl font-bold text-text-primary">Comece a digitar</h2>
          <p className="mt-2 text-base text-text-secondary">Digite algo acima para buscar no portal.</p>
        </div>
      ) : (
        <div className="space-y-12 pb-20">
          {results.mixed.length > 0 && (
            <section aria-labelledby="main-results-heading">
              <h2 id="main-results-heading" className="mb-4 text-base font-black uppercase tracking-wider text-brand-primary flex items-center gap-2">
                Principais Resultados <span className="rounded-full bg-brand-primary/10 px-2 py-1 text-xs text-brand-primary">{results.mixed.length}</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.mixed.map((item) => {
                  const matchedReport = item.kind === "report"
                    ? results.reports.find((report) => report.slug === item.slug)
                    : null;
                  return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className="group flex flex-col rounded-xl border border-border-subtle bg-white p-5 shadow-sm transition-all hover:border-brand-primary hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-brand-primary/10 text-brand-primary">
                        {item.kind === "blog" ? "Blog" : item.kind === "report" ? (matchedReport ? REPORT_KIND_LABEL[matchedReport.kind] : "Relatório") : "Acervo"}
                      </span>
                      <span className="text-xs text-text-secondary">Score: {item.score.toFixed(2)}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-text-primary group-hover:text-brand-primary">{item.title}</h3>
                    {item.excerpt && <p className="mt-2 text-sm text-text-secondary line-clamp-2">{item.excerpt}</p>}
                  </Link>
                  );
                })}
              </div>
            </section>
          )}

          {results.reports.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta flex items-center gap-2">
                Relatórios <span className="rounded-full bg-cta/10 px-2 py-0.5 text-[10px] text-cta">{results.reports.length}</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.reports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/relatorios/${report.slug}`}
                    className="group flex flex-col rounded-xl border border-brand-primary/25 bg-fundo/60 p-5 transition-all hover:border-brand-primary hover:bg-fundo/80"
                  >
                    <span className="w-fit rounded-full bg-brand-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-primary">{REPORT_KIND_LABEL[report.kind]}</span>
                    <h3 className="mt-2 font-bold text-texto group-hover:text-ciano">{report.title}</h3>
                    {report.summary && <p className="mt-2 line-clamp-2 text-xs text-texto/60">{report.summary}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.acervo.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Acervo</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.acervo.map((item) => (
                  <Link key={item.id} to={`/acervo/item/${item.slug}`} className="group flex flex-col rounded-xl border border-ciano/20 bg-fundo/60 p-5 transition-all hover:border-ciano hover:bg-fundo/80">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ciano">{item.kind}</span>
                    <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.blog.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Blog</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.blog.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col rounded-xl border border-primaria/20 bg-fundo/60 p-5 transition-all hover:border-primaria hover:bg-fundo/80">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primaria">Boletim</span>
                    <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{post.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.events.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Agenda</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.events.map((event) => (
                  <Link key={event.id} to="/agenda" className="group flex flex-col rounded-xl border border-acento/20 bg-fundo/60 p-5 transition-all hover:border-acento hover:bg-fundo/80">
                    <h3 className="mt-1 font-bold text-texto group-hover:text-cta">{event.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.transparency.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Transparência</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.transparency.map((expense) => (
                  <Link key={expense.id} to="/transparencia" className="group flex flex-col rounded-xl border border-base/40 bg-fundo/60 p-5 transition-all hover:border-ciano hover:bg-fundo/80">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-texto/40">{expense.category}</span>
                      <span className="text-sm font-black text-primaria">{formatCurrency(expense.amount_cents)}</span>
                    </div>
                    <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{expense.vendor}</h3>
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
