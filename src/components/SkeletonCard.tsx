type SkeletonCardProps = {
  className?: string;
};

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`rounded-2xl border border-border-subtle bg-white p-6 shadow-sm ${className}`.trim()}>
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-1/3 rounded-full bg-bg-surface" />
        <div className="h-6 w-2/3 rounded-full bg-bg-surface" />
        <div className="h-4 w-full rounded-full bg-bg-surface" />
        <div className="h-4 w-5/6 rounded-full bg-bg-surface" />
        <div className="h-24 rounded-xl bg-bg-surface" />
      </div>
    </div>
  );
}
