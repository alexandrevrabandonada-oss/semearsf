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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-error">{error}</p>
                <button
                    className="mt-4 text-brand-primary underline"
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
                <h1 className="mb-4 text-3xl font-black text-text-primary md:text-5xl">Conversar</h1>
                <p className="max-w-2xl text-lg text-text-secondary">
                    Espaço de participação direta. Rodas de conversa, fóruns e feedback sobre o clima e a cidade em Volta Redonda e no Sul Fluminense.
                </p>
            </header>

            {conversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface py-20 text-center">
                    <p className="text-text-secondary">Nenhuma roda de conversa ativa no momento.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {conversations.map((c) => (
                        <Link
                            key={c.id}
                            to={`/conversar/${c.slug}`}
                            className="group relative block overflow-hidden rounded-2xl border border-border-subtle bg-white p-6 transition-all hover:border-brand-primary/30 hover:shadow-md"
                        >
                            <h2 className="mb-2 text-xl font-bold text-text-primary group-hover:text-brand-primary">{c.title}</h2>
                            {c.excerpt && <p className="mb-4 text-sm text-text-secondary">{c.excerpt}</p>}
                            <div className="flex items-center gap-4 text-xs font-semibold text-brand-primary">
                                <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                                <span className="h-1 w-1 rounded-full bg-border-subtle" />
                                <span>Participar →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
