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
    <footer className="mt-8 border-t border-border-subtle bg-surface-1/95" role="contentinfo">
      <div className="mx-auto w-full max-w-7xl px-4 pb-2 pt-0 lg:px-6 lg:pb-3 lg:pt-3">
        <div className="signature-shell logo-watermark-soft overflow-hidden bg-gradient-to-b from-surface-1 via-surface-1 to-brand-primary-soft/25">
          <div className="hidden gap-5 px-4 py-3 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] lg:px-6 lg:py-3.5 lg:gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src="/brand/semear-logo.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-11 w-11 rounded-2xl border border-border-subtle bg-surface-1 object-contain p-1 shadow-[0_8px_20px_rgba(17,38,59,0.06)]"
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="section-badge" aria-label={INSTITUTIONAL_UNIVERSITY_FULL_NAME}>
                      UFF
                    </span>
                    <span className="text-base font-black uppercase tracking-[0.18em] text-brand-primary xl:text-lg">
                      SEMEAR
                    </span>
                  </div>
                  <p className="max-w-md text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary xl:text-[11px]">
                    {INSTITUTIONAL_COORDINATION}
                  </p>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-snug text-text-secondary">
                Ciência aberta, vigilância popular em saúde e memória socioambiental em uma plataforma pública de referência.
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary xl:text-[11px]">
                {INSTITUTIONAL_TAGLINE}
              </p>
            </div>

            <div>
              <p className="section-badge mb-2.5">Explorar</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-semibold text-text-secondary">
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
              <p className="section-badge mb-2.5">Institucional</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-semibold text-text-secondary">
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

          <div className="border-t border-divider-subtle px-4 py-2.5 lg:px-6 lg:py-2.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <span className="seed-badge shrink-0">{INSTITUTIONAL_FUNDING}</span>
                <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary md:inline lg:text-xs">
                  Dados abertos, memória pública e cuidado editorial.
                </span>
                <p className="hidden text-sm leading-snug text-text-secondary xl:block">
                  O SEMEAR combina dados em tempo real, memória pública e participação social em uma experiência institucional clara e confiável.
                </p>
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary sm:shrink-0 sm:text-right lg:text-xs">
                {INSTITUTIONAL_UNIVERSITY_FULL_NAME}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

