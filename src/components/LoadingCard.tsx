export type LoadingCardProps = {
  message?: string;
};

export function LoadingCard({ message = "Carregando..." }: LoadingCardProps) {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6 text-center shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">SEMEAR • UFF</p>
        <div className="mt-4 flex items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-semibold text-text-secondary">{message}</p>
        <p className="mt-2 text-xs text-text-secondary/80">Aguarde alguns segundos.</p>
      </div>
    </div>
  );
}