import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listUpcomingEvents, type Event } from "../lib/api";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

export function AgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await listUpcomingEvents();
        setEvents(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar agenda.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Atividades</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-text-primary md:text-4xl">Agenda</h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          Confira os próximos eventos, oficinas e atividades públicas do SEMEAR.
        </p>
      </div>

      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        {loading ? <p className="text-base text-text-secondary">Carregando eventos...</p> : null}
        {!loading && !events.length ? (
          <p aria-live="polite" className="text-base text-text-secondary" role="status">
            Nenhum evento publicado no momento.
          </p>
        ) : null}
        {events.length ? (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-surface p-5 md:flex-row md:items-center md:justify-between"
                key={event.id}
              >
                <div className="flex-1">
                  <p className="text-lg font-black text-text-primary">{String(event.title ?? "Sem titulo")}</p>
                  <p className="mt-1 text-sm text-text-secondary">Inicio: {formatDate(String(event.start_at ?? ""))}</p>
                  <p className="text-sm text-text-secondary">
                    Local: {typeof event.location === "string" && event.location.trim() ? event.location : "Local nao informado."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="inline-flex w-fit min-h-[44px] items-center rounded-md border border-brand-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/s/agenda/${event.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: String(event.title),
                          url: shareUrl
                        }).catch(console.error);
                      } else {
                        void navigator.clipboard.writeText(shareUrl);
                        alert("Link copiado!");
                      }
                    }}
                  >
                    Compartilhar
                  </button>
                  <Link
                    className="inline-flex w-fit min-h-[44px] items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-primary/90"
                    to={`/inscricoes?eventId=${encodeURIComponent(event.id)}`}
                  >
                    Inscrever-se
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? (
        <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
