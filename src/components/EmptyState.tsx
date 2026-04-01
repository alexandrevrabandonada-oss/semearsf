import type { ReactNode } from "react";

import { Chip, IconShell, SurfaceCard } from "./BrandSystem";

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <SurfaceCard className="brand-watermark semear-seed-wave motion-list-item p-8 text-center md:p-10">
      <div className="mx-auto mb-5 flex max-w-xs items-center gap-3">
        <div className="seed-radial-divider flex-1" aria-hidden="true" />
        <Chip tone="seed">estado vazio</Chip>
        <div className="seed-radial-divider flex-1" aria-hidden="true" />
      </div>
      <IconShell tone="brand" className="mx-auto mb-4 rounded-full semear-core-disc">
        {icon ?? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </IconShell>
      <h2 className="text-xl font-black leading-tight text-text-primary">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </SurfaceCard>
  );
}
