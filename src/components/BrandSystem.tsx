import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

type IconShellProps = {
  children: ReactNode;
  tone?: "seed" | "lab" | "brand" | "neutral" | "warm";
  className?: string;
};

type ChipProps = {
  children: ReactNode;
  tone?: "default" | "active" | "seed" | "lab";
  className?: string;
};

const iconToneClasses: Record<NonNullable<IconShellProps["tone"]>, string> = {
  seed: "bg-accent-seed/10 text-accent-seed",
  lab: "bg-accent-lab/10 text-accent-lab",
  brand: "bg-brand-primary-soft text-brand-primary",
  neutral: "bg-surface-2 text-text-primary",
  warm: "bg-accent-yellow/10 text-accent-brown"
};

const chipToneClasses: Record<NonNullable<ChipProps["tone"]>, string> = {
  default: "border-border-subtle bg-surface-2 text-text-secondary",
  active: "border-brand-primary/15 bg-brand-primary-soft text-brand-primary-dark",
  seed: "border-accent-seed/20 bg-accent-seed/10 text-accent-seed",
  lab: "border-accent-lab/20 bg-accent-lab/10 text-accent-lab"
};

export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return <div className={`surface-card motion-surface motion-surface-hover flex h-full flex-col ${className}`.trim()}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2.5">
          <span className="section-badge">{eyebrow}</span>
          <h2 className="max-w-3xl text-2xl font-black leading-tight tracking-tight text-text-primary md:text-3xl">{title}</h2>
          {description ? <p className="max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0 motion-control md:pb-1">{action}</div> : null}
      </div>
      <div className="decorative-divider" aria-hidden="true" />
    </div>
  );
}

export function IconShell({ children, tone = "brand", className = "" }: IconShellProps) {
  return <div className={`ui-icon-shell ${iconToneClasses[tone]} ${className}`.trim()}>{children}</div>;
}

export function Chip({ children, tone = "default", className = "" }: ChipProps) {
  return <span className={`ui-chip leading-none ${chipToneClasses[tone]} ${className}`.trim()}>{children}</span>;
}
