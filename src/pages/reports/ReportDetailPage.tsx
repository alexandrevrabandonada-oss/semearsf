import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getReportBySlug, type ReportDocument } from "../../lib/api";

export function ReportDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [report, setReport] = useState<ReportDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reportSlug = slug;
    if (!reportSlug) return;
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await getReportBySlug(String(reportSlug));
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar relatório.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (isViewerOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && isViewerOpen) setIsViewerOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isViewerOpen]);

  if (loading) {
    return <p aria-live="polite" className="text-base text-text-secondary" role="status">Carregando relatório...</p>;
  }

  if (error) {
    return (
      <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
        {error}
      </p>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-white p-8 text-center">
        <p className="text-sm text-text-secondary">Relatório não encontrado.</p>
      </div>
    );
  }

  const hasPdf = Boolean(report.pdf_url);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/s/relatorios/${report.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.summary || undefined,
          url: shareUrl
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    alert("Link de compartilhamento copiado.");
  };

  return (
    <section className="space-y-6">
      <Link to="/relatorios" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary/70 hover:text-brand-primary">
        ← Voltar para relatórios
      </Link>

      <article className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Documento Oficial</p>
        <h1 className="mt-2 text-2xl font-black text-text-primary md:text-4xl">{report.title}</h1>
        {report.summary && <p className="mt-3 text-base leading-relaxed text-text-secondary">{report.summary}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <span>{report.published_at ? new Date(report.published_at).toLocaleDateString("pt-BR") : "Sem data de publicação"}</span>
          {typeof report.year === "number" && <span>Ano: {report.year}</span>}
        </div>

        {report.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {report.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!hasPdf}
            onClick={() => setIsViewerOpen(true)}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Abrir PDF
          </button>

          <button
            type="button"
            onClick={() => { void handleShare(); }}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-border-subtle bg-white px-5 py-3 text-sm font-bold uppercase tracking-wide text-text-primary transition-colors hover:bg-bg-surface"
          >
            Compartilhar
          </button>

          {hasPdf && (
            <a
              href={report.pdf_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-border-subtle bg-white px-5 py-3 text-sm font-bold uppercase tracking-wide text-text-primary transition-colors hover:bg-bg-surface"
            >
              Abrir em nova aba
            </a>
          )}
        </div>
      </article>

      {isViewerOpen && hasPdf && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-viewer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsViewerOpen(false);
          }}
        >
          <h2 id="report-viewer-title" className="sr-only">Visualizador de PDF</h2>

          <div className="mb-3 flex w-full max-w-6xl justify-end gap-2">
            <a
              href={report.pdf_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Abrir em nova aba
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-error px-3 text-white hover:bg-error/90"
              aria-label="Fechar visualizador (ESC)"
            >
              ✕
            </button>
          </div>

          <iframe
            src={report.pdf_url as string}
            title={report.title}
            className="h-[80vh] w-full max-w-6xl rounded-xl border border-white/20 bg-white"
          />
        </div>
      )}
    </section>
  );
}