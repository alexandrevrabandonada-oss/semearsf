import { Link } from "react-router-dom";

import { INSTITUTIONAL_COORDINATION, INSTITUTIONAL_FUNDING, INSTITUTIONAL_TAGLINE, INSTITUTIONAL_UNIVERSITY_FULL_NAME } from "../content/institucional";

const editorialLinks = [
  { to: "/dados", label: "Dados" },
  { to: "/acervo", label: "Acervo" },
  { to: "/agenda", label: "Agenda" },
  { to: "/relatorios", label: "Relatórios" },
  { to: "/corredores", label: "Corredores" }
];

const institutionalLinks = [
  { to: "/sobre", label: "Sobre" },
  { to: "/transparencia", label: "Transparência" },
  { to: "/governanca", label: "Governança" },
  { to: "/privacidade-lgpd", label: "Privacidade e LGPD" },
  { to: "/imprensa", label: "Imprensa" }
];

export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-surface-1/96 backdrop-blur-xl" role="contentinfo">
      <div className="signature-shell logo-watermark-soft">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-7">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/brand/semear-logo.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-14 w-14 rounded-2xl border border-border-subtle bg-surface-1 object-contain p-1 shadow-[0_8px_20px_rgba(17,38,59,0.06)]"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="section-badge" aria-label={INSTITUTIONAL_UNIVERSITY_FULL_NAME}>
                      UFF
                    </span>
                    <span className="text-lg font-black uppercase tracking-[0.18em] text-brand-primary">
                      SEMEAR
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    {INSTITUTIONAL_COORDINATION}
                  </p>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-relaxed text-text-secondary md:text-base">
                Ciência aberta, vigilância popular em saúde e memória socioambiental em uma plataforma pública de referência.
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {INSTITUTIONAL_TAGLINE}
              </p>
            </div>

            <div>
              <p className="section-badge mb-4">Explorar</p>
              <ul className="space-y-2 text-sm font-semibold text-text-secondary">
                {editorialLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition-colors hover:text-brand-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="section-badge mb-4">Institucional</p>
              <ul className="space-y-2 text-sm font-semibold text-text-secondary">
                {institutionalLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition-colors hover:text-brand-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-divider-subtle pt-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
              O SEMEAR combina dados em tempo real, memória pública e participação social em uma experiência institucional clara e confiável.
            </p>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">{INSTITUTIONAL_FUNDING}</p>
              <p className="mt-1 text-xs text-text-secondary">Dados abertos, memória pública e cuidado editorial.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

