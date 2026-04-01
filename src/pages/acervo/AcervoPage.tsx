import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Chip,
    EditorialCard,
    EditorialCardActions,
    EditorialCardBody,
    EditorialCardExcerpt,
    EditorialCardMeta,
    EditorialCardTitle,
    IconShell,
    SectionHeader,
    SurfaceCard,
} from "../../components/BrandSystem";
import { BrandRadialDivider, BrandTextureSkeleton, BrandWatermarkPanel } from "../../components/BrandMicro";
import { listFeaturedAcervo, type AcervoItem } from "../../lib/api";

const areas = [
    {
        href: "/acervo/artigos",
        label: "Artigos",
        emoji: "📄",
        description:
            "Publicações científicas, relatórios técnicos e textos acadêmicos produzidos ou referenciados pelo projeto SEMEAR.",
        tone: "brand" as const,
    },
    {
        href: "/acervo/noticias",
        label: "Notícias",
        emoji: "📰",
        description:
            "Cobertura jornalística, notas de imprensa e registros de eventos relacionados à qualidade do ar e meio ambiente.",
        tone: "seed" as const,
    },
    {
        href: "/acervo/midias",
        label: "Mídias",
        emoji: "🎬",
        description:
            "Vídeos, fotorreportagens, podcasts e materiais audiovisuais de memória pública e comunicação ambiental.",
        tone: "lab" as const,
    },
];

const KIND_LABELS: Record<string, string> = {
    paper: "Artigo",
    report: "Relatório",
    news: "Notícia",
    link: "Link",
    video: "Vídeo",
    photo: "Foto",
};

export function AcervoPage() {
    const [featured, setFeatured] = useState<AcervoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await listFeaturedAcervo(6);
                setFeatured(data);
            } catch (err) {
                console.error("Erro ao carregar destaques:", err);
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
                    eyebrow="Acervo Vivo"
                    title="Curadoria de conteúdo"
                    description="Ciência aberta e memória pública. O Acervo SEMEAR reúne artigos, notícias e mídias selecionados para transparência, educação ambiental e engajamento comunitário."
                />
            </SurfaceCard>

            {/* Linha do Tempo — destaque */}
            <Link to="/acervo/linha" className="group motion-list-item block">
                <SurfaceCard className="border-accent-lab/25 bg-gradient-to-r from-accent-lab/8 via-surface-1 to-surface-1 p-5 md:p-6">
                    <BrandWatermarkPanel className="flex flex-col gap-4 md:flex-row md:items-center">
                        <IconShell tone="lab" className="h-14 w-14 shrink-0 rounded-full">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </IconShell>
                        <div className="min-w-0 flex-1">
                            <span className="section-badge">Linha do Tempo</span>
                            <h2 className="mt-2 text-xl font-black leading-tight text-text-primary md:text-2xl">
                                Navegue pelo acervo histórico
                            </h2>
                            <p className="mt-1 text-sm text-text-secondary">
                                Toda a história documentada do projeto, ano a ano, do presente ao passado.
                            </p>
                        </div>
                        <span className="ui-btn-ghost shrink-0">Explorar história →</span>
                    </BrandWatermarkPanel>
                </SurfaceCard>
            </Link>

            {/* Áreas do acervo */}
            <div className="grid gap-5 md:grid-cols-3">
                {areas.map((area) => (
                    <Link key={area.href} to={area.href} className="group motion-list-item block h-full">
                        <EditorialCard variant="standard">
                            <div className="flex items-start gap-4 p-5 md:p-6">
                                <IconShell tone={area.tone} className="h-12 w-12 shrink-0 rounded-full">
                                    <span className="text-xl leading-none" role="img" aria-label={area.label}>
                                        {area.emoji}
                                    </span>
                                </IconShell>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <h2 className="text-lg font-black leading-tight text-text-primary">{area.label}</h2>
                                    <p className="text-sm leading-relaxed text-text-secondary">{area.description}</p>
                                </div>
                            </div>
                            <EditorialCardActions className="px-5 pb-5 md:px-6 md:pb-6">
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary transition-transform group-hover:translate-x-0.5">
                                    Explorar {area.label.toLowerCase()}
                                    <span aria-hidden="true">→</span>
                                </span>
                            </EditorialCardActions>
                        </EditorialCard>
                    </Link>
                ))}
            </div>

            {/* Destaques */}
            {(loading || featured.length > 0) && (
                <SurfaceCard className="p-5 md:p-6">
                    <SectionHeader
                        eyebrow="Destaques"
                        title="Em destaque no acervo"
                    />
                    {loading ? (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {featured.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/acervo/item/${item.slug}`}
                                    className="group motion-list-item block h-full"
                                >
                                    <EditorialCard variant="compact">
                                        <EditorialCardBody className="justify-between">
                                            <div className="space-y-2">
                                                <EditorialCardMeta className="justify-between">
                                                    <Chip tone="active">{KIND_LABELS[item.kind] ?? item.kind}</Chip>
                                                    {item.year ? <span>{item.year}</span> : null}
                                                </EditorialCardMeta>
                                                <EditorialCardTitle className="line-clamp-2 text-base md:text-lg">
                                                    {item.title}
                                                </EditorialCardTitle>
                                                {item.excerpt ? (
                                                    <EditorialCardExcerpt className="line-clamp-2 text-sm">
                                                        {item.excerpt}
                                                    </EditorialCardExcerpt>
                                                ) : null}
                                            </div>
                                            <EditorialCardActions className="pt-1">
                                                <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary">
                                                    Ler mais
                                                    <span aria-hidden="true">→</span>
                                                </span>
                                            </EditorialCardActions>
                                        </EditorialCardBody>
                                    </EditorialCard>
                                </Link>
                            ))}
                        </div>
                    )}
                    <BrandRadialDivider className="mt-5" />
                </SurfaceCard>
            )}
        </section>
    );
}
