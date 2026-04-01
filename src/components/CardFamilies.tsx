/**
 * CardFamilies — 4 famílias de card com papel editorial distinto.
 *
 * FeaturedCard   · Dossiês / destaque    — capa alta, título 2xl, tags verdes, CTA sólido
 * EditorialCard  · Blog                  — byline, título itálico, tags inline, CTA ghost
 * DocumentalCard · Relatórios / Acervo   — strip âmbar, tipo-badge, título denso, PDF CTA
 * TerritorialCard· Corredores            — imagem full-bleed, overlay bottom, title+CTA dentro
 */

import type { ReactNode } from "react";

// ─── FeaturedCard ───────────────────────────────────────────────────────────

interface FeaturedCardProps {
  coverUrl?: string | null;
  coverAlt?: string;
  eyebrow?: string;
  title: string;
  excerpt?: string | null;
  tags?: string[];
  cta?: string;
  className?: string;
  /** Slot for the link wrapper — wrap with <Link to={...}> outside */
  children?: ReactNode;
}

export function FeaturedCard({
  coverUrl,
  coverAlt = "",
  eyebrow,
  title,
  excerpt,
  tags = [],
  cta = "Abrir →",
  className = "",
}: FeaturedCardProps) {
  return (
    <article className={`cf-featured group ${className}`.trim()}>
      {/* Image */}
      <div className="cf-featured-image">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={coverAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="axis-placeholder-dossie flex h-full flex-col items-start justify-between p-5">
            <span className="cf-featured-eyebrow">{eyebrow ?? "SEMEAR"}</span>
            <span className="max-w-[14rem] text-xl font-black uppercase leading-tight text-text-primary">
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="cf-featured-body">
        {eyebrow && (
          <span className="cf-featured-eyebrow w-fit">{eyebrow}</span>
        )}

        <h3 className="cf-featured-title line-clamp-2">{title}</h3>

        {excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="cf-featured-tag">{tag}</span>
            ))}
          </div>
        )}

        <button type="button" className="cf-featured-cta" tabIndex={-1} aria-hidden="true">
          {cta}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

// ─── EditorialCard ───────────────────────────────────────────────────────────

interface EditorialFamilyCardProps {
  coverUrl?: string | null;
  coverAlt?: string;
  date?: string | null;
  title: string;
  excerpt?: string | null;
  tags?: string[];
  scheduled?: boolean;
  cta?: string;
  className?: string;
}

export function EditorialFamilyCard({
  coverUrl,
  coverAlt = "",
  date,
  title,
  excerpt,
  tags = [],
  scheduled,
  cta = "Ler artigo",
  className = "",
}: EditorialFamilyCardProps) {
  return (
    <article className={`cf-editorial group ${className}`.trim()}>
      {/* Image */}
      {coverUrl ? (
        <div className="cf-editorial-image">
          <img
            src={coverUrl}
            alt={coverAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="axis-placeholder-blog cf-editorial-image flex flex-col items-start justify-between p-5">
          <span className="axis-eyebrow-blog w-fit text-[9px]">SEMEAR</span>
          <span className="max-w-[13rem] text-base font-black leading-tight text-text-primary">
            {title}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="cf-editorial-body">
        {/* Byline */}
        <div className="flex items-center justify-between gap-2">
          {date && (
            <span className="cf-editorial-byline">
              <svg className="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </span>
          )}
          {scheduled && (
            <span className="cf-editorial-scheduled">Agendado</span>
          )}
        </div>

        {/* Separator */}
        <div className="h-px w-16 bg-gradient-to-r from-brand-primary/40 to-transparent" aria-hidden="true" />

        <h3 className="cf-editorial-title line-clamp-2">{title}</h3>

        {excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="cf-editorial-inline-tags">
            {tags.slice(0, 4).map((tag, i) => (
              <span key={tag} className="cf-editorial-inline-tag">
                {i > 0 && <span className="opacity-40 mr-1" aria-hidden="true">·</span>}
                {tag}
              </span>
            ))}
          </div>
        )}

        <span className="cf-editorial-cta">
          {cta}
          <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </article>
  );
}

// ─── DocumentalCard ──────────────────────────────────────────────────────────

interface DocumentalCardProps {
  thumbUrl?: string | null;
  thumbAlt?: string;
  kindLabel: string;
  date?: string | null;
  title: string;
  summary?: string | null;
  tags?: string[];
  featured?: boolean;
  variant: "featured" | "compact";
  onTagClick?: (tag: string) => void;
  cta?: string;
  className?: string;
}

export function DocumentalCard({
  thumbUrl,
  thumbAlt = "",
  kindLabel,
  date,
  title,
  summary,
  tags = [],
  featured,
  variant,
  onTagClick,
  cta = "Abrir PDF",
  className = "",
}: DocumentalCardProps) {
  if (variant === "featured") {
    return (
      <article className={`cf-documental-featured group ${className}`.trim()}>
        <div className="cf-documental-featured-image">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={thumbAlt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="axis-placeholder-relatorio flex h-full flex-col items-start justify-between p-5">
              <span className="cf-documental-kind">{kindLabel}</span>
              <span className="max-w-[14rem] text-base font-black uppercase leading-tight text-text-primary">
                Documento oficial
              </span>
            </div>
          )}
        </div>

        <div className="cf-documental-featured-body">
          <div className="flex items-center justify-between gap-2">
            <span className="cf-documental-kind">{kindLabel}</span>
            {featured && (
              <span className="inline-flex items-center rounded-full border border-accent-yellow/35 bg-accent-yellow/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-warning">
                Destaque
              </span>
            )}
            {date && <span className="cf-documental-date">{date}</span>}
          </div>

          <h3 className="cf-documental-featured-title line-clamp-2">{title}</h3>

          {summary && (
            <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">{summary}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="cf-documental-tag"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick?.(tag); }}
                  aria-label={`Filtrar por ${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <div className="mt-auto pt-2">
            <span className="cf-documental-cta" aria-hidden="true">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {cta}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Compact variant — side-by-side, no image needed (accent strip on left)
  return (
    <article className={`cf-documental-compact group ${className}`.trim()}>
      <div className="cf-documental-compact-body">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="cf-documental-kind">{kindLabel}</span>
          {date && <span className="cf-documental-date">{date}</span>}
        </div>

        <h3 className="cf-documental-title line-clamp-2">{title}</h3>

        {summary && (
          <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">{summary}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                type="button"
                className="cf-documental-tag"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick?.(tag); }}
                aria-label={`Filtrar por ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="pt-1">
          <span className="cf-documental-cta" aria-hidden="true">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {cta}
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── TerritorialCard ─────────────────────────────────────────────────────────

interface TerritorialCardProps {
  coverUrl?: string | null;
  coverAlt?: string;
  title: string;
  excerpt?: string | null;
  featured?: boolean;
  cta?: string;
  className?: string;
}

export function TerritorialCard({
  coverUrl,
  coverAlt = "",
  title,
  excerpt,
  featured,
  cta = "Explorar rota",
  className = "",
}: TerritorialCardProps) {
  return (
    <article className={`cf-territorial group ${className}`.trim()}>
      {/* Background image or placeholder */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={coverAlt}
          loading="lazy"
          className="cf-territorial-image"
        />
      ) : (
        <div className="cf-territorial-placeholder">
          {/* Decorative map SVG */}
          <svg className="h-16 w-16 text-accent-green/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="cf-territorial-gradient" aria-hidden="true" />

      {/* Top row: badge + featured ribbon */}
      <div className="cf-territorial-top">
        <span className="cf-territorial-badge">Corredor</span>
        {featured && (
          <span className="cf-territorial-featured-ribbon">Destaque</span>
        )}
      </div>

      {/* Bottom overlay: title + excerpt + CTA */}
      <div className="cf-territorial-bottom">
        <h3 className="cf-territorial-title line-clamp-2">{title}</h3>
        {excerpt && (
          <p className="cf-territorial-excerpt">{excerpt}</p>
        )}
        <button
          type="button"
          className="cf-territorial-cta"
          tabIndex={-1}
          aria-hidden="true"
        >
          {cta}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
