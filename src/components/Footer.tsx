export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-acento/50 bg-fundo/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-3 text-center text-xs font-semibold text-texto md:flex-row md:justify-between md:px-6">
        <span className="rounded-md border border-cta/50 bg-cta/10 px-3 py-1">
          Projeto financiado por Emenda Parlamentar
        </span>
        <span className="rounded-md border border-ciano/50 bg-ciano/10 px-3 py-1">Coordenacao: UFF</span>
      </div>
    </footer>
  );
}
