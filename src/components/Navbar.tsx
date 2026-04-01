import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { INSTITUTIONAL_COORDINATION, INSTITUTIONAL_FUNDING, INSTITUTIONAL_UNIVERSITY_FULL_NAME } from "../content/institucional";

const links = [
  { href: "/", label: "Home" },
  { href: "/dados", label: "Dados" },
  { href: "/acervo", label: "Acervo" },
  { href: "/acervo/linha", label: "Linha do tempo" },
  { href: "/blog", label: "Blog" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/agenda", label: "Agenda" },
  { href: "/conversar", label: "Conversar" },
  { href: "/corredores", label: "Corredores" },
  { href: "/mapa", label: "Mapa" },
  { href: "/dossies", label: "Dossiês" },
  { href: "/inscricoes", label: "Inscricoes" },
  { href: "/sobre", label: "Sobre" },
  { href: "/transparencia", label: "Transparencia" }
];

const primaryLinks = links.slice(0, 9);

export function Navbar() {
  const { prompt, clearPrompt } = useInstallPrompt();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleInstallClick = async () => {
    if (!prompt) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        alert("📱 Para instalar o app:\n\n• Android: Menu (⋮) → Instalar aplicativo\n• iOS: Compartilhar (↑) → Adicionar à Tela de Início\n\n✨ Funciona offline e recebe notificações!");
      } else {
        alert("Para instalar o app, acesse este site em um dispositivo móvel ou use um navegador compatível.");
      }
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      clearPrompt();
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      "ui-nav-pill motion-focus",
      isActive ? "ui-nav-pill-active" : ""
    ].join(" ");

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface-1/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 pt-2 md:px-6 md:pt-3">
        <div className="signature-shell logo-watermark-soft overflow-hidden">
          <div className="grid gap-3 border-b border-divider-subtle px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:px-6 md:py-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-badge">{INSTITUTIONAL_FUNDING}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {INSTITUTIONAL_COORDINATION}
                </span>
              </div>
              <p className="max-w-xl text-[11px] leading-snug text-text-secondary md:text-xs">
                Coordenação: {INSTITUTIONAL_UNIVERSITY_FULL_NAME}
              </p>
            </div>

            <Link to="/" className="group flex min-w-0 items-center gap-2.5">
              <img
                src="/brand/semear-logo.svg"
                alt=""
                aria-hidden="true"
                className="h-10 w-10 shrink-0 rounded-2xl border border-border-subtle bg-surface-1 object-contain p-1 shadow-[0_8px_20px_rgba(17,38,59,0.06)] md:h-11 md:w-11"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-lg font-black uppercase tracking-[0.18em] text-brand-primary-dark md:text-xl">
                    {import.meta.env.VITE_PROJECT_NAME || "SEMEAR"}
                  </span>
                <span className="ui-chip ui-chip-active border-0 bg-brand-primary-soft/80 px-2.5 py-1 text-[10px] tracking-[0.14em] text-brand-primary-dark">
                    UFF
                  </span>
                </div>
                <p className="max-w-md text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary md:text-xs">
                  Plataforma pública-universitária de referência
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <span className="ui-chip">PWA pública</span>
              <button
                className="ui-btn-primary motion-focus px-3.5 py-2 text-[13px] shadow-[0_10px_26px_rgba(0,93,170,0.18)]"
                onClick={handleInstallClick}
                type="button"
                aria-label="Instalar aplicativo - Funciona offline e recebe notificações"
              >
                Instalar app
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <span className="ui-chip hidden sm:inline-flex">PWA pública</span>
              <button
                className="ui-cta-secondary min-h-[40px] px-3.5 py-2 text-[13px]"
                onClick={() => setIsMenuOpen((open) => !open)}
                type="button"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                Menu
              </button>
            </div>
          </div>

          <nav className="hidden bg-surface-1/96 px-4 py-2.5 md:block md:px-6" aria-label="Navegação principal">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              <ul className="flex flex-wrap items-center gap-1.5">
                {primaryLinks.map((link) => (
                  <li key={link.href}>
                    <NavLink className={navItemClass} to={link.href} aria-current={undefined}>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <Link
                to="/sobre"
                className="ui-cta-secondary motion-focus inline-flex min-h-[40px] items-center gap-2 px-3.5 py-2 text-[13px]"
              >
                <span className="ui-chip ui-chip-active border-0 bg-white/70 px-2.5 py-1 text-[10px] tracking-[0.14em]">Guia</span>
                Sobre o projeto
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="motion-dialog border-b border-border-subtle bg-surface-1 md:hidden"
          aria-label="Navegação móvel"
        >
          <div className="mx-auto w-full max-w-7xl space-y-3 px-4 py-3 md:px-6">
            <div className="signature-shell logo-watermark-soft p-3.5">
              <p className="section-badge">Menu principal</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                Navegação institucional do portal SEMEAR, com acesso rápido aos fluxos mais usados.
              </p>
            </div>

            <div className="grid gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  className={({ isActive }) =>
                    [
                      "ui-nav-pill motion-focus w-full justify-start rounded-2xl px-4",
                      isActive ? "ui-nav-pill-active" : ""
                    ].join(" ")
                  }
                  to={link.href}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="grid gap-3 border-t border-divider-subtle pt-3.5">
              <button
                className="ui-btn-primary w-full px-4"
                onClick={handleInstallClick}
                type="button"
                aria-label="Instalar aplicativo"
              >
                Instalar app
              </button>
              <button
                className="ui-btn-secondary w-full px-4"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                Fechar menu
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

