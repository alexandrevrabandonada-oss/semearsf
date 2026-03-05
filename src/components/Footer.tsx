export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-white/95 backdrop-blur" role="contentinfo">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6">
        {/* Institutional Lockup */}
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
          
          {/* Links */}
          <nav aria-label="Links institucionais do rodapé">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold text-text-secondary">
              <li>
                <a href="/sobre" className="transition-colors hover:text-brand-primary">Sobre</a>
              </li>
              <li>
                <a href="/transparencia" className="transition-colors hover:text-brand-primary">Transparência</a>
              </li>
              <li>
                <a href="/status" className="transition-colors hover:text-brand-primary">Status</a>
              </li>
              <li>
                <a href="mailto:contato@semear.uff.br" className="transition-colors hover:text-brand-primary">Contato</a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Description */}
        <div className="flex flex-col items-center gap-2 text-center text-sm text-text-secondary md:flex-row md:justify-between md:text-left">
          <p>Plataforma pública-universitária de monitoramento e memória socioambiental</p>
          <p className="text-xs font-semibold text-brand-primary">Financiado por emenda parlamentar</p>
        </div>
      </div>
    </footer>
  );
}
