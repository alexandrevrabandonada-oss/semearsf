import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getConversationBySlug,
    listConversationComments,
    createConversationComment,
    Conversation,
    ConversationComment
} from "../../lib/api";

function SimpleMarkdown({ text }: { text: string }) {
    const html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br />");
    // eslint-disable-next-line react/no-danger
    return <div className="space-y-4 text-base leading-relaxed text-texto/90" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ConversarDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [comments, setComments] = useState<ConversationComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!slug) return;
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const conv = await getConversationBySlug(slug as string);
                if (!conv) {
                    setError("Conversa não encontrada");
                    return;
                }
                setConversation(conv);
                const comms = await listConversationComments(conv.id);
                setComments(comms);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar conversa");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!conversation || !name.trim() || !body.trim()) return;

        try {
            setSubmitting(true);
            const newComment = await createConversationComment({
                conversation_id: conversation.id,
                name: name.trim(),
                body: body.trim()
            });
            setComments([...comments, newComment]);
            setName("");
            setBody("");
        } catch (err) {
            alert("Falha ao publicar comentário. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cta border-t-transparent" />
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-red-500">{error || "Conversa não encontrada"}</p>
                <Link to="/conversar" className="mt-4 inline-block text-cta underline">Voltar para a lista</Link>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
            <Link to="/conversar" className="mb-6 inline-flex items-center text-sm font-semibold text-ciano hover:underline">
                ← Voltar para Conversar
            </Link>

            <article className="mb-16">
                <h1 className="mb-6 text-3xl font-black md:text-5xl">{conversation.title}</h1>
                {conversation.excerpt && (
                    <p className="mb-8 border-l-4 border-ciano/30 pl-4 text-xl italic text-texto-secundario">
                        {conversation.excerpt}
                    </p>
                )}
                <div className="prose prose-invert max-w-none">
                    {conversation.body_md ? (
                        <SimpleMarkdown text={conversation.body_md} />
                    ) : (
                        <p className="italic text-texto-secundario">Esta conversa não possui descrição detalhada ainda.</p>
                    )}
                </div>
            </article>

            <section className="border-t border-ciano/10 pt-16">
                <h2 className="mb-8 text-2xl font-black uppercase tracking-wider text-cta">Comentários e Contribuições</h2>

                <div className="mb-12 space-y-6">
                    {comments.length === 0 ? (
                        <p className="italic text-texto-secundario">Nenhum comentário ainda. Seja o primeiro a participar!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="rounded-2xl border border-ciano/10 bg-fundo-card p-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-bold text-base">{comment.name}</span>
                                    <span className="text-xs text-texto-secundario">
                                        {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <p className="whitespace-pre-wrap text-texto/90">{comment.body}</p>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-cta/30 bg-cta/5 p-6 md:p-8">
                    <h3 className="mb-6 text-xl font-bold">Deixe sua contribuição</h3>
                    <div className="grid gap-4">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-texto-secundario">
                                Seu nome ou organização
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-ciano/30 bg-fundo px-4 py-2 text-texto focus:border-cta focus:outline-none focus:ring-1 focus:ring-cta"
                                placeholder="Ex: Maria Santos"
                            />
                        </div>
                        <div>
                            <label htmlFor="body" className="mb-2 block text-xs font-bold uppercase tracking-wider text-texto-secundario">
                                Mensagem
                            </label>
                            <textarea
                                id="body"
                                required
                                rows={4}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full rounded-lg border border-ciano/30 bg-fundo px-4 py-2 text-texto focus:border-cta focus:outline-none focus:ring-1 focus:ring-cta"
                                placeholder="Compartilhe seu relato, dúvida ou sugestão..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 inline-flex items-center justify-center rounded-lg bg-cta px-6 py-3 font-black uppercase tracking-widest text-base transition-all hover:brightness-110 disabled:opacity-50"
                        >
                            {submitting ? "Enviando..." : "Publicar Comentário"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
