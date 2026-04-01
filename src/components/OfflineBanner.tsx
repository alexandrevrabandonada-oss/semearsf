type OfflineBannerProps = {
  title?: string;
  description: string;
  ctaLabel?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function OfflineBanner({
  title = "Conexão indisponível",
  description,
  ctaLabel = "Recarregar dados",
  onRetry,
  compact = false
}: OfflineBannerProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-amber-900",
        compact ? "text-sm" : "text-base"
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-black uppercase tracking-wide">{title}</p>
          <p className="leading-relaxed">{description}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="motion-action inline-flex min-h-[44px] items-center rounded-lg border border-amber-500/30 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-amber-900 hover:bg-amber-100"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}



