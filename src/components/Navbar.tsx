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
      "motion-control motion-focus inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold",
      isActive
        ? "border border-brand-primary/15 bg-brand-primary-soft text-brand-primary-dark shadow-[0_8px_24px_rgba(0,93,170,0.12)]"
        : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
    ].join(" ");

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface-1/92 backdrop-blur-xl">
      <div className="signature-shell border-b border-border-subtle bg-brand-primary-soft/60">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold text-brand-primary-dark md:px-6">
          <span className="section-badge">{INSTITUTIONAL_FUNDING}</span>
          <span className="hidden text-text-secondary md:inline">{INSTITUTIONAL_COORDINATION}</span>
        </div>
      </div>

      <div className="border-b border-border-subtle bg-surface-1">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <img
              src="/brand/semear-logo.svg"
              alt=""
              aria-hidden="true"
              className="h-12 w-12 shrink-0 rounded-2xl border border-border-subtle bg-surface-1 object-contain p-1 shadow-[0_8px_20px_rgba(17,38,59,0.06)]"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-badge">SEMEAR</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Chancela UFF</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-lg font-black uppercase tracking-[0.18em] text-brand-primary-dark md:text-xl">
                  {import.meta.env.VITE_PROJECT_NAME || "SEMEAR"}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {INSTITUTIONAL_UNIVERSITY_FULL_NAME}
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <span className="ui-chip">PWA pública</span>
            <button
            className="ui-btn-secondary motion-focus px-4 shadow-sm"
              onClick={handleInstallClick}
              type="button"
              aria-label="Instalar aplicativo - Funciona offline e recebe notificações"
            >
              Instalar app
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="ui-btn-secondary motion-focus px-4 md:hidden"
            aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            Menu
          </button>
        </div>
      </div>

      <nav className="signature-shell hidden border-b border-border-subtle bg-surface-1 md:block" aria-label="Navegação principal">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <ul className="flex flex-wrap items-center gap-2">
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
            className="ui-btn-ghost motion-focus px-4 text-brand-primary"
          >
            Sobre o projeto
          </Link>
        </div>
      </nav>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="motion-dialog border-b border-border-subtle bg-surface-1 md:hidden"
          aria-label="Navegação móvel"
        >
          <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-4">
            <div className="rounded-[1.5rem] border border-border-subtle bg-brand-primary-soft/40 p-4">
              <p className="section-badge">Menu principal</p>
              <p className="mt-2 text-sm text-text-secondary">
                Navegação institucional do portal SEMEAR.
              </p>
            </div>

            <div className="grid gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  className={({ isActive }) =>
                    [
                      "motion-control motion-focus flex min-h-[44px] items-center rounded-2xl px-4 text-sm font-semibold",
                      isActive
                        ? "border border-brand-primary/15 bg-brand-primary-soft text-brand-primary-dark shadow-[0_8px_24px_rgba(0,93,170,0.12)]"
                        : "border border-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-2 hover:text-text-primary"
                    ].join(" ")
                  }
                  to={link.href}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="grid gap-3 border-t border-divider-subtle pt-4">
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

