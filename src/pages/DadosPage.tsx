import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getMeasurementsDownsampled, getStationOverview, type DownsampledMeasurement, type StationOverview } from "../lib/api";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";
const POLLING_INTERVAL_MS = 60_000;

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function parseIsoDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function DadosPage() {
  const [searchParams] = useSearchParams();
  const stationCodeFromQuery = searchParams.get("station");

  const [stations, setStations] = useState<StationOverview[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<"24h" | "7d">("24h");
  const [measurements, setMeasurements] = useState<DownsampledMeasurement[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible"
  );

  useEffect(() => {
    async function run() {
      try {
        setLoadingStations(true);
        setError(null);
        const data = await getStationOverview();
        setStations(data);

        let defaultStationId = data[0]?.station_id ?? null;
        if (stationCodeFromQuery) {
          const matched = data.find(s => s.code === stationCodeFromQuery);
          if (matched) defaultStationId = matched.station_id;
        }

        setSelectedStationId((prev) => prev ?? defaultStationId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar estacoes.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoadingStations(false);
      }
    }

    void run();
  }, [stationCodeFromQuery]);

  const loadMeasurements = useCallback(async (stationId: string, range: "24h" | "7d", silent = false) => {
    try {
      if (!silent) setLoadingMeasurements(true);
      setError(null);
      setSuccessMessage(null);
      const data = await getMeasurementsDownsampled(stationId, range);
      setMeasurements(data);
      if (!silent) setSuccessMessage("Dados atualizados com sucesso.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao carregar medicoes.";
      setError(`${message}${ENV_HINT}`);
    } finally {
      if (!silent) setLoadingMeasurements(false);
    }
  }, []);

  useEffect(() => {
    const stationId = selectedStationId ?? "";
    if (!stationId) return;
    void loadMeasurements(stationId, selectedRange);
  }, [loadMeasurements, selectedRange, selectedStationId]);

  useEffect(() => {
    function onVisibilityChange() {
      const visible = document.visibilityState === "visible";
      setIsPageVisible(visible);
      if (visible && selectedStationId) {
        void loadMeasurements(selectedStationId, selectedRange, true);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadMeasurements, selectedRange, selectedStationId]);

  useEffect(() => {
    const stationId = selectedStationId ?? "";
    if (!stationId || !isPageVisible) return;

    const intervalId = window.setInterval(() => {
      void loadMeasurements(stationId, selectedRange, true);
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isPageVisible, loadMeasurements, selectedRange, selectedStationId]);

  const selectedStation = useMemo(
    () => stations.find((station) => station.station_id === selectedStationId) ?? null,
    [selectedStationId, stations]
  );
  const lastUpdate = measurements[0]?.bucket_ts;
  const isOnline = selectedStation?.is_online ?? false;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-white p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2l-3.574 2.005a.5.5 0 00-.066.713l.483.352a.5.5 0 00.756-.072l3.539-8.529a.5.5 0 00-.671-.672L11 7.322a.5.5 0 00-.066.713l.483.352a.5.5 0 00.756-.072l3.539-8.529a.5.5 0 00-.671-.672L11 7.322z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary md:text-4xl">Monitoramento Ambiental</h1>
            <p className="text-xs font-semibold tracking-wider text-text-secondary mt-1 uppercase">Qualidade do Ar em Tempo Real</p>
          </div>
        </div>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          Acompanhe as leituras de qualidade do ar de nossas estações públicas em Volta Redonda e no Sul Fluminense. Dados científicos atualizados, acessíveis e exportáveis.
        </p>
      </div>

      <section className="rounded-2xl border border-border-subtle bg-white p-6">
        <h2 className="text-lg font-bold text-brand-primary">Estação de Monitoramento</h2>
        {loadingStations ? (
          <p aria-live="polite" className="mt-3 text-sm text-text-secondary" role="status">
            Carregando estações...
          </p>
        ) : null}
        {!loadingStations && !stations.length ? (
          <p aria-live="polite" className="mt-3 text-sm text-text-secondary" role="status">
            Nenhuma estação encontrada.
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-text-primary">Selecione uma estação</span>
            <select
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              disabled={!stations.length}
              onChange={(e) => setSelectedStationId(e.target.value || null)}
              value={selectedStationId ?? ""}
            >
              {!selectedStationId ? <option value="">Selecione...</option> : null}
              {stations.map((station) => (
                <option key={station.station_id} value={station.station_id}>
                  {String(station.name ?? station.station_id)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              className="flex-1 md:flex-none rounded-md border border-brand-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:opacity-60"
              disabled={!selectedStation}
              onClick={() => {
                if (!selectedStation) return;
                const shareUrl = `${window.location.origin}/s/dados/${selectedStation.code}`;
                if (navigator.share) {
                  navigator.share({
                    title: `Qualidade do Ar: ${selectedStation.name}`,
                    url: shareUrl
                  }).catch(console.error);
                } else {
                  void navigator.clipboard.writeText(shareUrl);
                  alert("Link copiado!");
                }
              }}
              type="button"
            >
              Compartilhar
            </button>
            <button
              className="flex-1 md:flex-none rounded-md bg-brand-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedStationId || loadingMeasurements}
              onClick={() => selectedStationId && void loadMeasurements(selectedStationId, selectedRange)}
              type="button"
            >
              Atualizar agora
            </button>
            <button
              className="flex-1 md:flex-none rounded-md border border-brand-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:opacity-60"
              disabled={!selectedStation || measurements.length === 0}
              onClick={() => {
                if (!selectedStation || measurements.length === 0) return;

                const headers = ["bucket_ts", "pm25", "pm10", "temp", "humidity", "quality_flag"];
                const csvRows = [headers.join(",")];

                for (const row of measurements) {
                  const values = [
                    row.bucket_ts ? new Date(row.bucket_ts).toISOString() : "",
                    row.pm25 ?? "",
                    row.pm10 ?? "",
                    row.temp ?? "",
                    row.humidity ?? "",
                    row.quality_flag ?? ""
                  ];
                  csvRows.push(values.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : String(v)).join(","));
                }

                const csvString = csvRows.join("\n");
                const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                const today = new Date().toISOString().split("T")[0];
                a.href = url;
                a.download = `semear_${selectedStation.code}_${selectedRange}_${today}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              type="button"
            >
              Baixar CSV
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${selectedRange === "24h" ? "bg-brand-primary text-white" : "border border-border-subtle bg-white text-text-primary hover:bg-bg-surface"
              }`}
            onClick={() => setSelectedRange("24h")}
            type="button"
          >
            24h
          </button>
          <button
            className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${selectedRange === "7d" ? "bg-brand-primary text-white" : "border border-border-subtle bg-white text-text-primary hover:bg-bg-surface"
              }`}
            onClick={() => setSelectedRange("7d")}
            type="button"
          >
            7d
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-brand-primary">Status</p>
            <p className={`mt-1 text-sm font-bold ${isOnline ? "text-accent-green" : "text-error"}`}>
              {selectedStationId ? (isOnline ? "Online" : "Offline") : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-brand-primary">Última atualização</p>
            <p className="mt-1 text-sm font-bold text-text-primary">{selectedStationId ? formatDate(lastUpdate) : "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-white p-6">
        <h2 className="text-lg font-bold text-brand-primary">Medições consolidadas por bucket ({selectedRange})</h2>
        {!selectedStationId ? (
          <p aria-live="polite" className="mt-3 text-sm text-text-secondary" role="status">
            Selecione uma estação para ver as medições.
          </p>
        ) : null}
        {selectedStationId && loadingMeasurements ? (
          <p aria-live="polite" className="mt-3 text-sm text-text-secondary" role="status">
            Carregando medições...
          </p>
        ) : null}
        {selectedStationId && !loadingMeasurements && !measurements.length ? (
          <p aria-live="polite" className="mt-3 text-sm text-text-secondary" role="status">
            Não há medições para esta estação.
          </p>
        ) : null}
        {selectedStationId && !loadingMeasurements && measurements.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-brand-primary">
                  <th className="px-3 py-2 font-bold">ts</th>
                  <th className="px-3 py-2 font-bold">pm25</th>
                  <th className="px-3 py-2 font-bold">pm10</th>
                  <th className="px-3 py-2 font-bold">temp</th>
                  <th className="px-3 py-2 font-bold">humidity</th>
                  <th className="px-3 py-2 font-bold">quality_flag</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((row) => (
                  <tr className="border-b border-border-subtle/50" key={String(row.bucket_ts)}>
                    <td className="px-3 py-2 text-text-primary">{formatDate(row.bucket_ts)}</td>
                    <td className="px-3 py-2 text-text-primary">{formatCellValue(row.pm25)}</td>
                    <td className="px-3 py-2 text-text-primary">{formatCellValue(row.pm10)}</td>
                    <td className="px-3 py-2 text-text-primary">{formatCellValue(row.temp)}</td>
                    <td className="px-3 py-2 text-text-primary">{formatCellValue(row.humidity)}</td>
                    <td className="px-3 py-2 text-text-primary">{formatCellValue(row.quality_flag)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-6 rounded-lg border border-dashed border-brand-primary/30 bg-brand-primary/5 p-4">
          <p className="text-sm font-semibold text-brand-primary">[Placeholder de gráfico]</p>
          <p className="mt-1 text-xs text-text-secondary">
            Área reservada para visualização gráfica das medições (sem biblioteca de chart neste momento).
          </p>
        </div>
      </section>

      {successMessage ? (
        <p aria-live="polite" className="rounded-md border border-accent-green/30 bg-accent-green/10 p-3 text-sm text-accent-green" role="status">
          {successMessage}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
