import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCollections, type AcervoCollection } from "../../lib/api";
import { getOptimizedCover } from "../../lib/imageOptimization";
import { trackShare } from "../../lib/observability";
import { Chip, EditorialCard, EditorialCardActions, EditorialCardBody, EditorialCardExcerpt, EditorialCardMeta, EditorialCardTitle, SectionHeader, SurfaceCard } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";

export function CollectionsListPage() {
  const [collections, setCollections] = useState<AcervoCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listCollections();
        setCollections(data);
      } catch (err) {
        console.error("Erro ao carregar dossiês:", err);
        setError("Não foi possível carregar as coleções do acervo.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <section className="space-y-10 md:space-y-12">
      <SurfaceCard className="signature-shell logo-watermark-soft p-6 md:p-8">
        <SectionHeader
          eyebrow="Biblioteca temática"
          title="Dossiês"
          description="Coleções curadas pela equipe do SEMEAR para facilitar a navegação por temas, recortes e documentos editoriais."
        />
      </SurfaceCard>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <BrandTextureSkeleton key={index} className="h-72 rounded-[1.75rem]" lines={4} />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-md border border-accent/70 bg-accent/15 p-3 text-sm text-text-primary" aria-live="assertive">{error}</p>
      ) : collections.length === 0 ? (
        <BrandIllustratedEmptyState
          title="Nenhum dossiê publicado ainda"
          description="Os dossiês curados do SEMEAR serão exibidos aqui com destaque temático e documentação associada."
          icon={<span className="text-2xl" aria-hidden="true">📚</span>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {collections.map((col) => (
            <EditorialCard key={col.id} variant={col.cover_url ? "featured" : "text"} tone="featured">
              <Link to={`/dossies/${col.slug}`} className="block">
                {col.cover_url ? (
                  <div className="relative h-48 w-full overflow-hidden bg-surface-2">
                    <img
                      src={getOptimizedCover(col, "small") || ""}
                      alt={col.title}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      style={(!col.cover_small_url && !col.cover_thumb_url) ? {} : { filter: "blur(0)" }}
                    />
                  </div>
                ) : (
                  <div className="document-placeholder flex h-48 flex-col justify-between p-5">
                    <span className="ui-seal w-fit">SEMEAR</span>
                    <span className="max-w-[12rem] text-lg font-black leading-tight text-text-primary">Dossiê sem capa</span>
                  </div>
                )}
              </Link>

              <EditorialCardBody>
                <EditorialCardMeta>
                  <span className="ui-tag-signature">Dossiê</span>
                  <span className="ui-tag-signature-editorial">Curadoria</span>
                </EditorialCardMeta>
                <EditorialCardTitle className="line-clamp-2">{col.title}</EditorialCardTitle>
                {col.excerpt ? <EditorialCardExcerpt className="line-clamp-3">{col.excerpt}</EditorialCardExcerpt> : null}
                <div className="mt-1 flex flex-wrap gap-2">
                  {col.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="ui-tag-signature-editorial">
                      {tag}
                    </span>
                  ))}
                </div>
                <EditorialCardActions className="pt-1">
                  <Link to={`/dossies/${col.slug}`} className="semear-card-cta px-4">
                    Abrir dossiê
                  </Link>
                  <button
                    type="button"
                    aria-label="Compartilhar dossiê"
                    onClick={(e) => {
                      e.preventDefault();
                      const url = `${window.location.origin}/s/dossies/${col.slug}`;
                      trackShare("dossies", col.slug, "list");
                      if (navigator.share) {
                        void navigator.share({
                          title: col.title,
                          text: col.excerpt || undefined,
                          url
                        });
                      } else {
                        trackShare("dossies", col.slug, "list-copy");
                        void navigator.clipboard.writeText(url);
                        alert("Link copiado!");
                      }
                    }}
                    className="ui-btn-secondary px-4 text-xs text-brand-primary"
                  >
                    Compartilhar
                  </button>
                </EditorialCardActions>
              </EditorialCardBody>
            </EditorialCard>
          ))}
        </div>
      )}
    </section>
  );
}

