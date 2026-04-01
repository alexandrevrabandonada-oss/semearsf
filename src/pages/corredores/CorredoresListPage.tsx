import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { IconShell, SectionHeader, SurfaceCard, EditorialCard, EditorialCardActions, EditorialCardBody, EditorialCardExcerpt, EditorialCardMeta, EditorialCardTitle, Chip } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";
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
      <SurfaceCard className="signature-shell p-6 md:p-8">
        <SectionHeader
          eyebrow="Território"
          title="Corredores Climáticos"
          description="Navegue pelas rotas e recortes territoriais monitorados. Descubra os impactos reais e as soluções coletivas em Volta Redonda e no Sul Fluminense."
          action={
            <Link to="/mapa" className="ui-btn-ghost px-4">
              Ver mapa
            </Link>
          }
        />
      </SurfaceCard>

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
              <EditorialCard variant="standard" tone="tecnico">
                <div className="semear-card-media relative h-48 w-full overflow-hidden bg-gradient-to-br from-brand-primary-soft/40 to-surface-2">
                  {c.featured && (
                    <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-brand-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                      Destaque
                    </div>
                  )}
                  {c.cover_url ? (
                    <img
                      src={getOptimizedCover(c, "small") || c.cover_url}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-border-subtle">
                      <IconShell tone="seed" className="h-14 w-14 rounded-full">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </IconShell>
                    </div>
                  )}
                </div>

                <EditorialCardBody>
                  <EditorialCardMeta>
                    <span className="ui-tag-signature">Corredor</span>
                    {c.featured ? <span className="ui-tag-signature-editorial">Destaque</span> : null}
                  </EditorialCardMeta>
                  <EditorialCardTitle className="line-clamp-2">{c.title}</EditorialCardTitle>
                  {c.excerpt ? <EditorialCardExcerpt className="line-clamp-3">{c.excerpt}</EditorialCardExcerpt> : null}
                  <EditorialCardActions>
                    <span className="semear-card-cta">
                      Explorar rota
                      <span aria-hidden="true">→</span>
                    </span>
                  </EditorialCardActions>
                </EditorialCardBody>
              </EditorialCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

