import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { useInstallPrompt } from "../hooks/useInstallPrompt";

const links = [
  { href: "/", label: "Home" },
  { href: "/dados", label: "Dados" },
  { href: "/acervo", label: "Acervo" },
  { href: "/acervo/linha", label: "Linha do tempo" },
  { href: "/blog", label: "Blog" },
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
    if (outcome === 'accepted') {
      clearPrompt();
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-bg-surface/95 backdrop-blur">
      {/* Institutional banner */}
      <div className="border-b border-border-subtle bg-brand-primary-soft/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-4 py-1.5 text-[11px] font-semibold text-brand-primary-dark md:justify-end md:px-6">
          <span>Projeto financiado por emenda parlamentar</span>
          <span className="hidden h-3 w-px bg-border-subtle md:block" aria-hidden="true" />
          <span className="hidden md:inline">Coordenação: UFF</span>
        </div>
      </div>

      {/* Brand identity */}
      <div className="border-b border-border-subtle bg-bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-black uppercase tracking-[0.18em] text-brand-primary-dark md:text-xl">
              {import.meta.env.VITE_PROJECT_NAME || "SEMEAR"}
            </span>
            <span className="h-6 w-px bg-border-subtle" aria-hidden="true" />
            <span className="inline-flex min-h-[32px] items-center rounded border border-border-subtle bg-bg-surface px-2 text-[10px] font-semibold tracking-[0.14em] text-text-secondary" aria-label="Universidade Federal Fluminense">
              UFF
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border-subtle bg-bg-surface px-3 text-sm font-semibold text-text-primary md:hidden"
            aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden border-b border-border-subtle bg-bg-surface md:block" aria-label="Navegação principal">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-2.5">
          <ul className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  className={({ isActive }) =>
                    [
                      "inline-flex min-h-[44px] items-center rounded-md px-3 transition-colors",
                      isActive ? "border border-border-subtle bg-brand-primary-soft text-brand-primary-dark" : "text-text-secondary hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                    ].join(" ")
                  }
                  to={link.href}
                  aria-current={undefined} // React Router already handles this
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            className="inline-flex min-h-[44px] items-center rounded-md border border-border-subtle bg-bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-brand-primary-soft"
            onClick={handleInstallClick}
            type="button"
            aria-label="Instalar aplicativo - Funciona offline e recebe notificações"
          >
            <span aria-hidden="true">Instalar app</span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer menu */}
      {isMenuOpen && (
        <nav id="mobile-navigation" className="border-b border-border-subtle bg-bg-surface md:hidden" aria-label="Navegação móvel">
          <div className="mx-auto w-full max-w-6xl space-y-1 px-4 py-3">
            {links.map((link) => (
              <NavLink
                key={link.href}
                className={({ isActive }) =>
                  [
                    "flex min-h-[44px] items-center rounded-md px-3 text-sm font-semibold transition-colors",
                    isActive ? "bg-brand-primary-soft text-brand-primary-dark" : "text-text-secondary hover:bg-brand-primary-soft"
                  ].join(" ")
                }
                to={link.href}
              >
                {link.label}
              </NavLink>
            ))}

            <button
              className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-border-subtle bg-bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-brand-primary-soft"
              onClick={handleInstallClick}
              type="button"
              aria-label="Instalar aplicativo"
            >
              <span aria-hidden="true">Instalar app</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
