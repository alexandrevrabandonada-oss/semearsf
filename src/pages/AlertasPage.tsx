import { useState, useEffect } from "react";

export function AlertasPage() {
    const [status, setStatus] = useState<"default" | "granted" | "denied">("default");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pm25Threshold, setPm25Threshold] = useState(35);
    const [cooldownMinutes, setCooldownMinutes] = useState(120);
    const [testLoading, setTestLoading] = useState(false);
    const [testMessage, setTestMessage] = useState<string | null>(null);

    useEffect(() => {
        if ("Notification" in window) {
            setStatus(Notification.permission);
        }

        checkSubscription();
    }, []);

    async function checkSubscription() {
        if (!("serviceWorker" in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (err) {
            console.error("Erro ao verificar inscrição:", err);
        }
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

            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                throw new Error("Configuração VAPID ausente.");
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey
            });

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-push`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    subscription,
                    user_agent: navigator.userAgent,
                    pm25_threshold: pm25Threshold,
                    cooldown_minutes: cooldownMinutes
                })
            });

            if (!response.ok) {
                throw new Error("Falha ao registrar inscrição no servidor.");
            }

            setIsSubscribed(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao ativar notificações.");
        } finally {
            setLoading(false);
        }
    }

    async function sendTest() {
        setTestLoading(true);
        setTestMessage(null);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_INGEST_API_KEY || "";
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-push`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro no teste.");

            setTestMessage(`Sucesso! Notificações enviadas para ${data.sent} assinantes.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao enviar teste.");
        } finally {
            setTestLoading(false);
        }
    }

    return (
        <section className="mx-auto max-w-2xl space-y-8 py-10 px-4">
            <header className="text-center space-y-2">
                <h1 className="text-3xl font-black text-cta md:text-4xl italic tracking-tight">Alertas & Notificações</h1>
                <p className="text-texto/70 text-sm md:text-base leading-relaxed">
                    Personalize seus alertas de qualidade do ar e receba avisos em tempo real.
                </p>
            </header>

            <div
                className="rounded-2xl border border-ciano/30 bg-fundo/80 p-8 shadow-2xl backdrop-blur-md"
                aria-live="polite"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ciano/10 text-2xl animate-pulse">
                        🔔
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-texto tracking-tight">Estado das Notificações</h2>
                        <p className={`text-xs uppercase tracking-[0.2em] font-black ${status === 'granted' ? 'text-base' : 'text-texto/40'}`}>
                            {status === "granted" ? "Ativadas" : status === "denied" ? "Bloqueadas" : "Aguardando Permissão"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-acento/50 bg-acento/10 p-4 text-sm text-texto flex items-center gap-3">
                        <span className="text-lg">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {testMessage && (
                    <div className="mb-6 rounded-xl border border-base/50 bg-base/10 p-4 text-sm text-base font-bold flex items-center gap-3">
                        <span className="text-lg">✅</span>
                        <span>{testMessage}</span>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-texto/10">
                        <div className="space-y-2">
                            <label htmlFor="pm25" className="block text-xs font-black uppercase text-texto/60 tracking-wider">
                                Limiar PM2.5 (µg/m³)
                            </label>
                            <input
                                id="pm25"
                                type="number"
                                value={pm25Threshold}
                                onChange={(e) => setPm25Threshold(Number(e.target.value))}
                                className="w-full rounded-xl bg-texto/5 border border-texto/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
                                min="1"
                                disabled={isSubscribed}
                            />
                            <p className="text-[10px] text-texto/40">Você será avisado quando o nível ultrapassar este valor.</p>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cooldown" className="block text-xs font-black uppercase text-texto/60 tracking-wider">
                                Cooldown (minutos)
                            </label>
                            <input
                                id="cooldown"
                                type="number"
                                value={cooldownMinutes}
                                onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                                className="w-full rounded-xl bg-texto/5 border border-texto/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
                                min="1"
                                disabled={isSubscribed}
                            />
                            <p className="text-[10px] text-texto/40">Tempo mínimo de espera entre dois alertas seguidos.</p>
                        </div>
                    </div>

                    {isSubscribed ? (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-base/20 bg-base/5 p-6 text-center">
                                <p className="text-sm font-bold text-base flex items-center justify-center gap-2">
                                    <span>🚀</span> Inscrição Ativa e Configurada!
                                </p>
                            </div>

                            <button
                                className="w-full rounded-xl border border-cta bg-cta/10 py-3 text-xs font-black uppercase tracking-[0.2em] text-cta transition-all hover:bg-cta hover:text-base active:scale-95 disabled:opacity-50"
                                disabled={testLoading}
                                onClick={sendTest}
                            >
                                {testLoading ? "Enviando..." : "Enviar Notificação de Teste"}
                            </button>
                        </div>
                    ) : (
                        <button
                            className="w-full rounded-xl bg-cta py-4 text-sm font-black uppercase tracking-[0.2em] text-base shadow-lg transition-all hover:scale-[1.02] hover:shadow-cta/20 active:scale-[0.98] disabled:opacity-50"
                            disabled={loading || status === "denied"}
                            onClick={subscribe}
                        >
                            {loading ? "Processando..." : "Ativar Notificações"}
                        </button>
                    )}

                    {status === "denied" && (
                        <div className="rounded-lg bg-acento/5 p-4 text-center">
                            <p className="text-xs text-acento font-medium italic">
                                As notificações foram bloqueadas. Por favor, libere o acesso nas configurações do site (cadeado na barra de endereços).
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="rounded-2xl bg-texto/5 p-6 text-[11px] leading-relaxed text-texto/50 text-center border border-texto/5">
                <p>O serviço utiliza <strong>Duração de Sessão</strong> para armazenamento temporário das preferências de alerta até o próximo registro.</p>
            </footer>
        </section>
    );
}
