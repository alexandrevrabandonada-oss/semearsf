import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Conversation, listConversations } from "../../lib/api";

export function ConversarListPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await listConversations();
                setConversations(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao carregar rodas de conversa");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cta border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-red-500">{error}</p>
                <button
                    className="mt-4 text-cta underline"
                    onClick={() => window.location.reload()}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
            <header className="mb-12">
                <h1 className="mb-4 text-3xl font-black md:text-5xl">Conversar</h1>
                <p className="max-w-2xl text-lg text-texto-secundario">
                    Espaço de participação direta. Rodas de conversa, fóruns e feedback sobre o clima e a cidade no Rio de Janeiro.
                </p>
            </header>

            {conversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ciano/30 py-20 text-center">
                    <p className="text-texto-secundario">Nenhuma roda de conversa ativa no momento.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {conversations.map((c) => (
                        <Link
                            key={c.id}
                            to={`/conversar/${c.slug}`}
                            className="group relative block overflow-hidden rounded-2xl border border-ciano/20 bg-fundo-card p-6 transition-all hover:border-cta/50 hover:bg-ciano/5"
                        >
                            <h2 className="mb-2 text-xl font-bold group-hover:text-cta">{c.title}</h2>
                            {c.excerpt && <p className="mb-4 text-sm text-texto-secundario">{c.excerpt}</p>}
                            <div className="flex items-center gap-4 text-xs font-semibold text-ciano">
                                <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                                <span className="h-1 w-1 rounded-full bg-ciano/30" />
                                <span>Participar →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
