import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
                // Sort: featured first, then by position/created_at (already sorted by API)
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
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-error">{error}</p>
                <button
                    className="mt-4 text-brand-primary underline hover:text-brand-primary/80"
                    onClick={() => window.location.reload()}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            <header className="mb-12 text-center md:text-left">
                <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-brand-primary md:text-6xl lg:text-7xl">
                    Corredores Climáticos
                </h1>
                <p className="mx-auto max-w-3xl text-lg text-text-secondary md:mx-0 md:text-xl">
                    Navegue pelas rotas e recortes territoriais monitorados. Descubra os impactos reais e as soluções coletivas em Volta Redonda e no Sul Fluminense.
                </p>
            </header>

            {corridors.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border-subtle bg-bg-surface/50 p-12 text-center backdrop-blur-sm">
                    <span className="mb-4 text-4xl">🗺️</span>
                    <h2 className="text-xl font-bold text-text-primary">Nenhum corredor mapeado</h2>
                    <p className="mt-2 text-text-secondary">
                        Em breve novos recortes territoriais estarão disponíveis.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {corridors.map((c) => (
                        <Link
                            key={c.id}
                            to={`/corredores/${c.slug}`}
                            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border-subtle bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-lg"
                        >
                            {c.featured && (
                                <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-brand-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                    Destaque
                                </div>
                            )}
                            
                            {/* Cover Image */}
                            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-brand-primary/5 to-brand-primary/10">
                                {c.cover_url ? (
                                    <img
                                        src={getOptimizedCover(c, "small") || c.cover_url}
                                        alt={c.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-border-subtle transition-transform duration-500 group-hover:scale-105">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-7.22-.06L31.39,63.78A8,8,0,0,0,26,71V208a8,8,0,0,0,11.58,7.16l57.69-28.84,61.35,30.68A8.14,8.14,0,0,0,160,217a8,8,0,0,0,3.34-.73l64-21.33A8,8,0,0,0,232,187V56A8,8,0,0,0,228.92,49.69ZM90,52.25l58,29v106.5l-58-29ZM42,80.1l32-16v106.5l-32,16Zm172,95.8-32,10.67V80.1l32-10.67Z"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                                <h2 className="mb-3 text-2xl font-black leading-tight text-text-primary transition-colors group-hover:text-brand-primary">
                                    {c.title}
                                </h2>

                                {c.excerpt && (
                                    <p className="mb-6 flex-grow text-sm leading-relaxed text-text-secondary line-clamp-3">
                                        {c.excerpt}
                                    </p>
                                )}

                                <div className="mt-auto flex items-center justify-between text-xs font-bold uppercase tracking-widest text-brand-primary">
                                    <span>Explorar Rota</span>
                                    <span className="transition-transform group-hover:translate-x-1">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
