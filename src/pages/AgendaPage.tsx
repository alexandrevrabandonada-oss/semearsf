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
      <div className="rounded-2xl border border-ciano/60 bg-fundo/80 p-6 md:p-8">
        <h1 className="text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">Agenda</h1>
        <p className="mt-3 text-sm text-texto/90">
          [Placeholder] A lista abaixo mostra apenas eventos publicados no banco, sem conteudo ficticio.
        </p>
      </div>

      <section className="rounded-2xl border border-primaria/50 bg-base/70 p-6">
        {loading ? <p className="text-sm text-texto/80">Carregando eventos...</p> : null}
        {!loading && !events.length ? (
          <p aria-live="polite" className="text-sm text-texto/80" role="status">
            Nenhum evento publicado.
          </p>
        ) : null}
        {events.length ? (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                className="flex flex-col gap-3 rounded-lg border border-ciano/40 bg-fundo/80 p-4 md:flex-row md:items-center md:justify-between"
                key={event.id}
              >
                <div>
                  <p className="text-base font-bold text-texto">{String(event.title ?? "Sem titulo")}</p>
                  <p className="text-xs text-texto/80">Inicio: {formatDate(String(event.start_at ?? ""))}</p>
                  <p className="text-xs text-texto/80">
                    Local: {typeof event.location === "string" && event.location.trim() ? event.location : "Local nao informado."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="inline-flex w-fit rounded-md border border-cta px-4 py-2 text-sm font-black uppercase tracking-wide text-cta transition-colors hover:bg-cta hover:text-base"
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
                    className="inline-flex w-fit rounded-md bg-cta px-4 py-2 text-sm font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90"
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
        <p aria-live="assertive" className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
