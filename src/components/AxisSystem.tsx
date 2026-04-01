/**
 * AxisSystem — Sub-identidade visual por eixo do portal SEMEAR.
 *
 * Cada eixo tem:
 *  · acento cromático próprio (classe CSS axis-*-[eixo])
 *  · tipo de card próprio (AxisCard)
 *  · tratamento de heading próprio (AxisHeading)
 *  · eyebrow/chip próprio (AxisEyebrow)
 *  · placeholder próprio (AxisPlaceholder)
 *  · divider próprio (AxisDivider)
 *  · capa de seção própria (AxisSectionHeader)
 *
 * O shell institucional (header/navbar/footer) permanece intocado.
 */

import type { ReactNode } from "react";

export type Axis =
  | "dados"
  | "acervo"
  | "timeline"
  | "dossie"
  | "corredor"
  | "blog"
  | "relatorio";

interface AxisMeta {
  defaultLabel: string;
  cardClass: string;
  sectionHeaderClass: string;
  eyebrowClass: string;
  dividerClass: string;
  placeholderClass: string;
  headingClass: string;
  /** Tailwind text-color class for numeric/accent highlights */
  accentTextClass: string;
}

export const AXIS_META: Record<Axis, AxisMeta> = {
  dados: {
    defaultLabel: "Dados",
    cardClass: "axis-card-dados",
    sectionHeaderClass: "axis-section-header-dados",
    eyebrowClass: "axis-eyebrow-dados",
    dividerClass: "axis-divider-dados",
    placeholderClass: "axis-placeholder-dados",
    headingClass: "axis-heading-dados",
    accentTextClass: "text-accent-lab",
  },
  acervo: {
    defaultLabel: "Acervo",
    cardClass: "axis-card-acervo",
    sectionHeaderClass: "axis-section-header-acervo",
    eyebrowClass: "axis-eyebrow-acervo",
    dividerClass: "axis-divider-acervo",
    placeholderClass: "axis-placeholder-acervo",
    headingClass: "axis-heading-acervo",
    accentTextClass: "text-accent-brown",
  },
  timeline: {
    defaultLabel: "Linha do Tempo",
    cardClass: "axis-card-timeline",
    sectionHeaderClass: "axis-section-header-timeline",
    eyebrowClass: "axis-eyebrow-timeline",
    dividerClass: "axis-divider-timeline",
    placeholderClass: "axis-placeholder-timeline",
    headingClass: "axis-heading-timeline",
    accentTextClass: "text-accent-brown",
  },
  dossie: {
    defaultLabel: "Dossiês",
    cardClass: "axis-card-dossie",
    sectionHeaderClass: "axis-section-header-dossie",
    eyebrowClass: "axis-eyebrow-dossie",
    dividerClass: "axis-divider-dossie",
    placeholderClass: "axis-placeholder-dossie",
    headingClass: "axis-heading-dossie",
    accentTextClass: "text-accent-green",
  },
  corredor: {
    defaultLabel: "Corredores",
    cardClass: "axis-card-corredor",
    sectionHeaderClass: "axis-section-header-corredor",
    eyebrowClass: "axis-eyebrow-corredor",
    dividerClass: "axis-divider-corredor",
    placeholderClass: "axis-placeholder-corredor",
    headingClass: "axis-heading-corredor",
    accentTextClass: "text-accent-green",
  },
  blog: {
    defaultLabel: "Blog",
    cardClass: "axis-card-blog",
    sectionHeaderClass: "axis-section-header-blog",
    eyebrowClass: "axis-eyebrow-blog",
    dividerClass: "axis-divider-blog",
    placeholderClass: "axis-placeholder-blog",
    headingClass: "axis-heading-blog",
    accentTextClass: "text-brand-primary",
  },
  relatorio: {
    defaultLabel: "Relatórios",
    cardClass: "axis-card-relatorio",
    sectionHeaderClass: "axis-section-header-relatorio",
    eyebrowClass: "axis-eyebrow-relatorio",
    dividerClass: "axis-divider-relatorio",
    placeholderClass: "axis-placeholder-relatorio",
    headingClass: "axis-heading-relatorio",
    accentTextClass: "text-warning",
  },
};

// ── AxisCard ──────────────────────────────────────

interface AxisCardProps {
  axis: Axis;
  children: ReactNode;
  className?: string;
  as?: "article" | "div" | "li";
}

export function AxisCard({ axis, children, className = "", as: Tag = "article" }: AxisCardProps) {
  const { cardClass } = AXIS_META[axis];
  return <Tag className={`${cardClass} ${className}`.trim()}>{children}</Tag>;
}

// ── AxisEyebrow ───────────────────────────────────

interface AxisEyebrowProps {
  axis: Axis;
  children?: ReactNode;
  className?: string;
}

export function AxisEyebrow({ axis, children, className = "" }: AxisEyebrowProps) {
  const { eyebrowClass, defaultLabel } = AXIS_META[axis];
  return (
    <span className={`${eyebrowClass} ${className}`.trim()}>
      {children ?? defaultLabel}
    </span>
  );
}

// ── AxisDivider ───────────────────────────────────

export function AxisDivider({ axis, className = "" }: { axis: Axis; className?: string }) {
  const { dividerClass } = AXIS_META[axis];
  return <div className={`${dividerClass} ${className}`.trim()} aria-hidden="true" />;
}

// ── AxisPlaceholder ───────────────────────────────

interface AxisPlaceholderProps {
  axis: Axis;
  label?: string;
  subtitle?: string;
  className?: string;
}

export function AxisPlaceholder({ axis, label, subtitle = "Conteúdo em preparação", className = "" }: AxisPlaceholderProps) {
  const { placeholderClass, defaultLabel, eyebrowClass } = AXIS_META[axis];
  return (
    <div className={`${placeholderClass} flex min-h-36 flex-col justify-between p-5 ${className}`.trim()}>
      <span className={`${eyebrowClass} w-fit`}>{label ?? defaultLabel}</span>
      <span className="max-w-[14rem] text-base font-black uppercase leading-tight text-text-primary">
        {subtitle}
      </span>
    </div>
  );
}

// ── AxisHeading ───────────────────────────────────

interface AxisHeadingProps {
  axis: Axis;
  as?: "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
  className?: string;
}

export function AxisHeading({ axis, children, className = "", as: Tag = "h2" }: AxisHeadingProps) {
  const { headingClass } = AXIS_META[axis];
  return <Tag className={`${headingClass} ${className}`.trim()}>{children}</Tag>;
}

// ── AxisSectionHeader ─────────────────────────────
// Full section-header shell with axis styling applied.

interface AxisSectionHeaderProps {
  axis: Axis;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Small decorative disc from BrandSystem */
  disc?: boolean;
}

export function AxisSectionHeader({
  axis,
  eyebrow,
  title,
  description,
  action,
  disc = true,
}: AxisSectionHeaderProps) {
  const { sectionHeaderClass, eyebrowClass, defaultLabel, headingClass, accentTextClass } = AXIS_META[axis];
  return (
    <div className="space-y-3.5">
      <div className={`${sectionHeaderClass} semear-seed-wave`.trim()}>
        <div className="flex flex-col gap-2.5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={eyebrowClass}>{eyebrow ?? defaultLabel}</span>
              {disc && (
                <span
                  className={`semear-core-disc h-6 w-6 ${accentTextClass}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <h2 className={`max-w-3xl text-2xl md:text-3xl ${headingClass}`}>{title}</h2>
            {description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0 motion-control md:pt-1">{action}</div> : null}
        </div>
      </div>
      <AxisDivider axis={axis} />
    </div>
  );
}
