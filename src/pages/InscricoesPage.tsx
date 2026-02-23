import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { createRegistration, getEventSummary, type EventSummary } from "../lib/api";

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  bairro: string;
  consent_lgpd: boolean;
};

const initialForm: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  bairro: "",
  consent_lgpd: false
};

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

export function InscricoesPage() {
  const [searchParams] = useSearchParams();
  const eventId = useMemo(() => searchParams.get("eventId"), [searchParams]);

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const safeEventId = eventId ?? "";
    if (!safeEventId) {
      setEvent(null);
      return;
    }

    async function run() {
      try {
        setLoadingEvent(true);
        setError(null);
        const data = await getEventSummary(safeEventId);
        setEvent(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar evento.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoadingEvent(false);
      }
    }

    void run();
  }, [eventId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      if (!event?.id) {
        throw new Error("Selecione um evento valido na agenda antes de enviar a inscricao.");
      }

      const result = await createRegistration({
        event_id: event.id,
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        bairro: form.bairro,
        consent_lgpd: form.consent_lgpd
      });
      if (result.status === "waitlist") {
        setSuccess("Inscricao recebida na lista de espera. A equipe confirmara por contato.");
      } else {
        setSuccess("Inscricao confirmada com sucesso. A equipe enviara as proximas orientacoes.");
      }
      setForm(initialForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel concluir a inscricao.";
      setError(`${message}${ENV_HINT}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-ciano/60 bg-fundo/80 p-6 md:p-8">
        <h1 className="text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">Inscricoes</h1>
        <p className="mt-3 text-sm text-texto/90">
          [Placeholder] Este formulario envia dados reais para o banco. Preencha apenas informacoes oficiais.
        </p>
      </div>

      <section className="rounded-2xl border border-primaria/50 bg-base/70 p-6">
        {loadingEvent ? <p className="text-sm text-texto/80">Carregando dados do evento...</p> : null}
        {event ? (
          <div className="mb-6 rounded-lg border border-ciano/50 bg-fundo/80 p-4">
            <p className="text-xs uppercase tracking-wide text-ciano">Evento selecionado</p>
            <p className="mt-1 text-base font-bold text-texto">{event.title}</p>
            <p className="text-xs text-texto/80">Inicio: {formatDate(event.start_at)}</p>
            <p className="text-xs text-texto/80">Local: {event.location?.trim() ? event.location : "Local nao informado."}</p>
          </div>
        ) : eventId && !loadingEvent && !error ? (
          <p className="mb-6 text-sm text-texto/80">Evento nao encontrado para o ID informado.</p>
        ) : (
          <p className="mb-6 text-sm text-texto/80">Nenhum evento especificado no link. Acesse a agenda para iniciar uma inscricao.</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-texto">Nome</span>
            <input
              className="w-full rounded-md border border-ciano/40 bg-fundo px-3 py-2 text-texto outline-none ring-0 placeholder:text-texto/40 focus:border-ciano"
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              type="text"
              value={form.name}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-texto">Email</span>
            <input
              className="w-full rounded-md border border-ciano/40 bg-fundo px-3 py-2 text-texto outline-none ring-0 placeholder:text-texto/40 focus:border-ciano"
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-texto">WhatsApp</span>
            <input
              className="w-full rounded-md border border-ciano/40 bg-fundo px-3 py-2 text-texto outline-none ring-0 placeholder:text-texto/40 focus:border-ciano"
              onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
              required
              type="text"
              value={form.whatsapp}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-texto">Bairro</span>
            <input
              className="w-full rounded-md border border-ciano/40 bg-fundo px-3 py-2 text-texto outline-none ring-0 placeholder:text-texto/40 focus:border-ciano"
              onChange={(e) => setForm((prev) => ({ ...prev, bairro: e.target.value }))}
              required
              type="text"
              value={form.bairro}
            />
          </label>

          <label className="flex items-start gap-2 text-sm text-texto">
            <input
              checked={form.consent_lgpd}
              className="mt-0.5 size-4 accent-primaria"
              onChange={(e) => setForm((prev) => ({ ...prev, consent_lgpd: e.target.checked }))}
              required
              type="checkbox"
            />
            <span>Aceito o tratamento dos meus dados para inscricao (LGPD).</span>
          </label>

          <button
            className="rounded-md bg-cta px-4 py-2 text-sm font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting || !event?.id}
            type="submit"
          >
            {submitting ? "Enviando..." : "Enviar inscricao"}
          </button>
        </form>
      </section>

      {success ? (
        <p aria-live="polite" className="rounded-md border border-primaria/70 bg-primaria/15 p-3 text-sm text-texto" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="rounded-md border border-acento/70 bg-acento/15 p-3 text-sm text-texto" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
