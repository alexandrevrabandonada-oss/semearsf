import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-white/95 backdrop-blur" role="contentinfo">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6">
        <div className="mb-3 flex flex-col items-center gap-3 border-b border-border-subtle pb-3 md:flex-row md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 items-center rounded border border-border-subtle bg-bg-surface px-2 text-xs font-bold tracking-wider text-text-secondary" aria-label="Universidade Federal Fluminense">
                UFF
              </span>
              <span className="h-6 w-px bg-border-subtle" aria-hidden="true" />
              <span className="text-sm font-black uppercase tracking-wider text-brand-primary">
                SEMEAR
              </span>
            </div>
          </div>

          <nav aria-label="Links institucionais do rodape">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold text-text-secondary">
              <li>
                <Link to="/sobre" className="transition-colors hover:text-brand-primary">Sobre</Link>
              </li>
              <li>
                <Link to="/transparencia" className="transition-colors hover:text-brand-primary">Transparencia</Link>
              </li>
              <li>
                <Link to="/status" className="transition-colors hover:text-brand-primary">Status</Link>
              </li>
              <li>
                <a href="mailto:contato@semear.uff.br" className="transition-colors hover:text-brand-primary">Contato</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-2 text-center text-sm text-text-secondary md:flex-row md:justify-between md:text-left">
          <p>Plataforma publica-universitaria de monitoramento e memoria socioambiental</p>
          <p className="text-xs font-semibold text-brand-primary">Financiado por emenda parlamentar</p>
        </div>

        <nav aria-label="Guias institucionais" className="mt-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-text-secondary md:justify-start">
            <li>
              <Link to="/como-ler-dados" className="transition-colors hover:text-brand-primary">Como ler dados</Link>
            </li>
            <li>
              <Link to="/como-participar" className="transition-colors hover:text-brand-primary">Como participar</Link>
            </li>
            <li>
              <Link to="/privacidade-lgpd" className="transition-colors hover:text-brand-primary">Privacidade e LGPD</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}