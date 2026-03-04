import { useState, useEffect } from "react";

export function AlertasPage() {
    const [status, setStatus] = useState<"default" | "granted" | "denied">("default");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ("Notification" in window) {
            setStatus(Notification.permission);
        }

        checkSubscription();
    }, []);

    async function checkSubscription() {
        if (!("serviceWorker" in navigator)) return;

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    }

    async function subscribe() {
        setLoading(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();
            setStatus(permission);

            if (permission !== "granted") {
                throw new Error("Permissão negada para notificações.");
            }

            const registration = await navigator.serviceWorker.ready;

            // Get VAPID key from env
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                throw new Error("Configuração VAPID ausente (VITE_VAPID_PUBLIC_KEY).");
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey
            });

            // Register in backend
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-push`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    subscription,
                    user_agent: navigator.userAgent
                })
            });

            if (!response.ok) {
                throw new Error("Falha ao registrar inscrição no servidor.");
            }

            setIsSubscribed(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido ao ativar notificações.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mx-auto max-w-2xl space-y-8 py-10">
            <header className="text-center space-y-2">
                <h1 className="text-3xl font-black text-cta md:text-4xl">Alertas e Notificações</h1>
                <p className="text-texto/70 text-sm md:text-base">
                    Fique por dentro das atualizações do portal e alertas críticos de qualidade do ar.
                </p>
            </header>

            <div className="rounded-2xl border border-ciano/30 bg-fundo/80 p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ciano/10 text-2xl">
                        🔔
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-texto">Estado das Notificações</h2>
                        <p className="text-xs text-texto/50 uppercase tracking-widest font-black">
                            {status === "granted" ? "Ativadas" : status === "denied" ? "Bloqueadas" : "Não configuradas"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-acento/50 bg-acento/10 p-4 text-sm text-texto">
                        <span className="font-bold">Erro:</span> {error}
                    </div>
                )}

                <div className="space-y-4">
                    {isSubscribed ? (
                        <div className="rounded-xl border border-ciano/20 bg-ciano/5 p-4 text-center">
                            <p className="text-sm font-semibold text-ciano">🚀 Você já está inscrito para receber alertas!</p>
                            <p className="text-[10px] mt-2 text-texto/40 uppercase tracking-wider">
                                Você receberá notificações diretamente no seu navegador ou dispositivo.
                            </p>
                        </div>
                    ) : (
                        <button
                            className="w-full rounded-xl bg-cta py-4 text-sm font-black uppercase tracking-widest text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            disabled={loading || status === "denied"}
                            onClick={subscribe}
                        >
                            {loading ? "Processando..." : "Ativar Notificações"}
                        </button>
                    )}

                    {status === "denied" && (
                        <p className="text-center text-xs text-acento font-medium italic">
                            As notificações foram bloqueadas no seu navegador. Ative as permissões nas configurações do site para continuar.
                        </p>
                    )}
                </div>
            </div>

            <footer className="rounded-xl border border-texto/10 bg-texto/5 p-6 text-xs text-texto/60 text-center">
                <p>Respeitamos sua privacidade. Você pode desativar os alertas a qualquer momento limpando o cache do navegador ou revogando as permissões de notificação.</p>
            </footer>
        </section>
    );
}
