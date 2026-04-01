import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";
import { AxisSectionHeader } from "../../components/AxisSystem";
import { TerritorialCard } from "../../components/CardFamilies";
import { ClimateCorridor, listCorridors } from "../../lib/api";
import { getOptimizedCover } from "../../lib/imageOptimization";

export function CorredoresListPage() {
  const [corridors, setCorridors] = useState<ClimateCorridor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await listCorridors();
        const sorted = [...data].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        setCorridors(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao carregar corredores");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <BrandTextureSkeleton key={index} className="h-72 rounded-[1.75rem]" lines={4} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-error">{error}</p>
        <button className="mt-4 text-brand-primary underline hover:text-brand-primary/80" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-10 md:space-y-12">
      <AxisSectionHeader
        axis="corredor"
        eyebrow="Território"
        title="Corredores Climáticos"
        description="Navegue pelas rotas e recortes territoriais monitorados. Descubra os impactos reais e as soluções coletivas em Volta Redonda e no Sul Fluminense."
        action={
          <Link to="/mapa" className="ui-btn-ghost px-4">
            Ver mapa
          </Link>
        }
      />

      {corridors.length === 0 ? (
        <BrandIllustratedEmptyState
          title="Nenhum corredor mapeado"
          description="Novos recortes territoriais monitorados serão publicados nesta seção assim que finalizados."
          icon={<span className="text-2xl" aria-hidden="true">🗺️</span>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {corridors.map((c) => (
            <Link key={c.id} to={`/corredores/${c.slug}`} className="group motion-list-item block h-full">
              <TerritorialCard
                coverUrl={getOptimizedCover(c, "small")}
                coverAlt={c.title}
                title={c.title}
                excerpt={c.excerpt}
                featured={c.featured}
                cta="Explorar rota"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

