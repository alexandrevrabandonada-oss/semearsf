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

      {/* ── MOBILE compact top bar ─────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="SEMEAR – Início">
          <img
            src="/brand/semear-logo.svg"
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0 rounded-xl border border-border-subtle bg-surface-1 object-contain p-0.5 shadow-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-brand-primary-dark">
              {import.meta.env.VITE_PROJECT_NAME || "SEMEAR"}
            </span>
            <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-primary-dark">
              UFF
            </span>
          </div>
        </Link>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-2 text-text-secondary transition-all duration-150 hover:bg-surface-3 active:scale-95"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu de navegação"}
        >
          {isMenuOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── DESKTOP institutional header ───────────────────── */}
      <div className="mx-auto hidden w-full max-w-7xl px-6 pt-3 md:block">
        <div className="signature-shell logo-watermark-soft overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-divider-subtle px-6 py-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-badge">{INSTITUTIONAL_FUNDING}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {INSTITUTIONAL_COORDINATION}
                </span>
              </div>
              <p className="max-w-xl text-xs leading-snug text-text-secondary">
                Coordenação: {INSTITUTIONAL_UNIVERSITY_FULL_NAME}
              </p>
            </div>

            <Link to="/" className="group flex min-w-0 items-center gap-2.5">
              <img
                src="/brand/semear-logo.svg"
                alt=""
                aria-hidden="true"
                className="h-11 w-11 shrink-0 rounded-2xl border border-border-subtle bg-surface-1 object-contain p-1 shadow-[0_8px_20px_rgba(17,38,59,0.06)]"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-xl font-black uppercase tracking-[0.18em] text-brand-primary-dark">
                    {import.meta.env.VITE_PROJECT_NAME || "SEMEAR"}
                  </span>
                  <span className="ui-chip ui-chip-active border-0 bg-brand-primary-soft/80 px-2.5 py-1 text-[10px] tracking-[0.14em] text-brand-primary-dark">
                    UFF
                  </span>
                </div>
                <p className="max-w-md text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Plataforma pública-universitária de referência
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
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
          </div>

          <nav className="bg-surface-1/96 px-6 py-2.5" aria-label="Navegação principal">
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

      {/* ── MOBILE menu drawer ──────────────────────────────── */}
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="motion-dialog max-h-[calc(100svh-58px)] overflow-y-auto border-b border-border-subtle bg-surface-1 md:hidden"
          aria-label="Navegação móvel"
        >
          <div className="space-y-3 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  className={({ isActive }) =>
                    [
                      "ui-nav-pill motion-focus justify-start rounded-2xl px-3.5 py-2.5",
                      isActive ? "ui-nav-pill-active" : ""
                    ].join(" ")
                  }
                  to={link.href}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-divider-subtle pt-3">
              <button
                className="ui-btn-primary px-4"
                onClick={handleInstallClick}
                type="button"
                aria-label="Instalar aplicativo"
              >
                Instalar app
              </button>
              <button
                className="ui-btn-secondary px-4"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                Fechar
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

