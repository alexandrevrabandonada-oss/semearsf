import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listFeaturedAcervo, type AcervoItem } from "../../lib/api";

const areas = [
    {
        href: "/acervo/artigos",
        label: "Artigos",
        emoji: "📄",
        description:
            "Publicações científicas, relatórios técnicos e textos acadêmicos produzidos ou referenciados pelo projeto SEMEAR.",
        color: "border-ciano/60 hover:border-ciano"
    },
    {
        href: "/acervo/noticias",
        label: "Notícias",
        emoji: "📰",
        description:
            "Cobertura jornalística, notas de imprensa e registros de eventos relacionados à qualidade do ar e meio ambiente.",
        color: "border-acento/60 hover:border-acento"
    },
    {
        href: "/acervo/midias",
        label: "Mídias",
        emoji: "🎬",
        description:
            "Vídeos, fotorreportagens, podcasts e materiais audiovisuais de memória pública e comunicação ambiental.",
        color: "border-primaria/60 hover:border-primaria"
    }
];

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
        <section className="space-y-8">
            <div className="rounded-2xl border border-ciano/60 bg-fundo/80 p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ciano">Acervo Vivo</p>
                <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">
                    Curadoria
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-texto/90 md:text-base">
                    Ciência aberta e memória pública. O Acervo SEMEAR reúne artigos, notícias e mídias
                    selecionados para transparência, educação ambiental e engajamento comunitário.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {areas.map((area) => (
                    <Link
                        className={`group flex flex-col gap-3 rounded-2xl border bg-fundo/70 p-6 transition-all hover:-translate-y-0.5 hover:bg-fundo/90 ${area.color}`}
                        key={area.href}
                        to={area.href}
                    >
                        <span className="text-3xl">{area.emoji}</span>
                        <h2 className="text-lg font-black uppercase tracking-wide text-cta">{area.label}</h2>
                        <p className="text-sm text-texto/80">{area.description}</p>
                        <span className="mt-auto text-xs font-bold uppercase tracking-widest text-ciano/70 group-hover:text-ciano">
                            Explorar →
                        </span>
                    </Link>
                ))}
            </div>

            {featured.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wider text-cta">Destaques do Acervo</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {featured.map((item) => (
                            <Link
                                className="flex flex-col gap-2 rounded-xl border border-ciano/30 bg-fundo/60 p-5 transition-all hover:border-ciano hover:bg-fundo/80"
                                key={item.id}
                                to={`/acervo/item/${item.slug}`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="rounded-full bg-ciano/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ciano">
                                        {item.kind}
                                    </span>
                                    {item.year && <span className="text-xs text-texto/50">{item.year}</span>}
                                </div>
                                <h3 className="font-bold text-texto">{item.title}</h3>
                                {item.excerpt && <p className="line-clamp-2 text-xs text-texto/70">{item.excerpt}</p>}
                                <span className="text-xs font-semibold text-ciano/70 hover:text-ciano">Ler mais →</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {loading && featured.length === 0 && (
                <p className="text-center text-sm text-texto/50">Carregando destaques...</p>
            )}
        </section>
    );
}
