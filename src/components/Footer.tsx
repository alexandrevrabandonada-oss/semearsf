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
      <div className="mx-auto w-full max-w-7xl px-4 pb-4 pt-3 md:px-6 md:pb-5 md:pt-4">
        <div className="signature-shell logo-watermark-soft overflow-hidden bg-gradient-to-b from-surface-1 via-surface-1 to-brand-primary-soft/25">
          <div className="grid gap-8 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] lg:gap-10">
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
                    <span className="text-xl font-black uppercase tracking-[0.18em] text-brand-primary">
                      SEMEAR
                    </span>
                  </div>
                  <p className="mt-1 max-w-md text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
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
                    <Link to={link.to} className="inline-flex rounded-full px-1 py-0.5 transition-colors hover:text-brand-primary">
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
                    <Link to={link.to} className="inline-flex rounded-full px-1 py-0.5 transition-colors hover:text-brand-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-divider-subtle px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-2">
                <p className="text-sm leading-relaxed text-text-secondary">
                  O SEMEAR combina dados em tempo real, memória pública e participação social em uma experiência institucional clara e confiável.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="seed-badge">{INSTITUTIONAL_FUNDING}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    Dados abertos, memória pública e cuidado editorial.
                  </span>
                </div>
              </div>

              <p className="max-w-xs text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary md:text-right">
                {INSTITUTIONAL_UNIVERSITY_FULL_NAME}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

