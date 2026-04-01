import { SurfaceCard } from "./BrandSystem";

type SkeletonCardProps = {
  className?: string;
};

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <SurfaceCard className={`motion-list-item motion-pop p-6 ${className}`.trim()}>
      <div className="space-y-4">
        <div className="seed-radial-divider" />
        <div className="h-4 w-1/3 rounded-full bg-surface-3" />
        <div className="h-6 w-2/3 rounded-full bg-surface-3" />
        <div className="h-4 w-full rounded-full bg-surface-3" />
        <div className="h-4 w-5/6 rounded-full bg-surface-3" />
        <div className="seed-skeleton h-24" />
      </div>
    </SurfaceCard>
  );
}



