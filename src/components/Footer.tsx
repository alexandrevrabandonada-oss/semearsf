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
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-surface-1/90 backdrop-blur-xl" role="contentinfo">
      <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-2 md:px-6 md:pb-3.5 md:pt-3">
        <div className="signature-shell logo-watermark-soft overflow-hidden bg-gradient-to-b from-surface-1 via-surface-1 to-brand-primary-soft/25">
          <div className="grid gap-6 px-4 py-4 md:px-6 md:py-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.74fr)_minmax(0,0.74fr)] lg:gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/brand/semear-logo.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 rounded-2xl border border-border-subtle bg-surface-1 object-contain p-1 shadow-[0_8px_20px_rgba(17,38,59,0.06)]"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="section-badge" aria-label={INSTITUTIONAL_UNIVERSITY_FULL_NAME}>
                      UFF
                    </span>
                    <span className="text-lg font-black uppercase tracking-[0.18em] text-brand-primary md:text-xl">
                      SEMEAR
                    </span>
                  </div>
                  <p className="max-w-md text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary md:text-xs">
                    {INSTITUTIONAL_COORDINATION}
                  </p>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-snug text-text-secondary md:text-[0.95rem]">
                Ciência aberta, vigilância popular em saúde e memória socioambiental em uma plataforma pública de referência.
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary md:text-xs">
                {INSTITUTIONAL_TAGLINE}
              </p>
            </div>

            <div>
              <p className="section-badge mb-3">Explorar</p>
              <ul className="space-y-1.5 text-sm font-semibold text-text-secondary">
                {editorialLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="inline-flex rounded-full px-1 py-0.5 transition-colors hover:text-brand-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="section-badge mb-3">Institucional</p>
              <ul className="space-y-1.5 text-sm font-semibold text-text-secondary">
                {institutionalLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="inline-flex rounded-full px-1 py-0.5 transition-colors hover:text-brand-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-divider-subtle px-4 py-3 md:px-6 md:py-3.5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl space-y-2">
                <p className="text-sm leading-snug text-text-secondary">
                  O SEMEAR combina dados em tempo real, memória pública e participação social em uma experiência institucional clara e confiável.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="seed-badge">{INSTITUTIONAL_FUNDING}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary md:text-xs">
                    Dados abertos, memória pública e cuidado editorial.
                  </span>
                </div>
              </div>

              <p className="max-w-xs text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary md:text-right md:text-xs">
                {INSTITUTIONAL_UNIVERSITY_FULL_NAME}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

