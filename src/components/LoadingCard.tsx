import { Chip, SurfaceCard } from "./BrandSystem";

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
      <SurfaceCard className="loading-panel brand-watermark motion-pop w-full max-w-md p-6 text-center md:p-8">
        <Chip tone="active">SEMEAR • UFF</Chip>
        <div className="mt-5 flex items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-semibold text-text-secondary">{message}</p>
        <p className="mt-2 text-xs text-text-secondary/80">Aguarde alguns segundos.</p>
      </SurfaceCard>
    </div>
  );
}
