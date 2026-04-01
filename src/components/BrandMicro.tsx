import type { ReactNode } from "react";

import { EmptyState, type EmptyStateProps } from "./EmptyState";

type ClassNameProps = {
  className?: string;
};

type WatermarkPanelProps = {
  children: ReactNode;
  className?: string;
};

type OrganicPlaceholderProps = {
  label?: string;
  subtitle?: string;
  className?: string;
};

type TextureSkeletonProps = {
  className?: string;
  lines?: number;
};

export function BrandRadialDivider({ className = "" }: ClassNameProps) {
  return <div className={`seed-radial-divider ${className}`.trim()} aria-hidden="true" />;
}

export function BrandWatermarkPanel({ children, className = "" }: WatermarkPanelProps) {
  return <div className={`logo-watermark-soft semear-seed-wave ${className}`.trim()}>{children}</div>;
}

export function BrandOrganicPlaceholder({ label = "SEMEAR", subtitle = "Conteudo em preparacao", className = "" }: OrganicPlaceholderProps) {
  return (
    <div className={`seed-placeholder-miolo flex min-h-36 flex-col justify-between p-5 ${className}`.trim()}>
      <span className="ui-seal w-fit">{label}</span>
      <span className="max-w-[14rem] text-base font-black uppercase leading-tight text-text-primary">{subtitle}</span>
    </div>
  );
}

export function BrandIllustratedEmptyState(props: EmptyStateProps) {
  return <EmptyState {...props} />;
}

export function BrandTextureSkeleton({ className = "", lines = 3 }: TextureSkeletonProps) {
  return (
    <div className={`seed-loading-panel p-4 ${className}`.trim()} aria-hidden="true">
      <div className="mb-3 flex items-center gap-2">
        <span className="semear-core-disc h-5 w-5" />
        <div className="seed-skeleton h-3 w-24 rounded-full" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className={`seed-skeleton h-3 rounded-full ${index === lines - 1 ? "w-2/3" : "w-full"}`.trim()} />
        ))}
      </div>
    </div>
  );
}
