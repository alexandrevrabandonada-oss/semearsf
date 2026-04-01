import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCollections, type AcervoCollection } from "../../lib/api";
import { getOptimizedCover } from "../../lib/imageOptimization";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";
import { AxisSectionHeader } from "../../components/AxisSystem";
import { FeaturedCard } from "../../components/CardFamilies";

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
      <AxisSectionHeader
        axis="dossie"
        eyebrow="Biblioteca temática"
        title="Dossiês"
        description="Coleções curadas pela equipe do SEMEAR para facilitar a navegação por temas, recortes e documentos editoriais."
      />

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
            <Link key={col.id} to={`/dossies/${col.slug}`} className="group motion-list-item block h-full">
              <FeaturedCard
                coverUrl={getOptimizedCover(col, "small")}
                coverAlt={col.title}
                eyebrow="Dossiê"
                title={col.title}
                excerpt={col.excerpt}
                tags={col.tags}
                cta="Abrir dossiê"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

