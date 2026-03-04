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
      <div className="rounded-2xl border border-ciano/60 bg-fundo/80 p-6 md:p-8">
        <h1 className="text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">Dados</h1>
        <p className="mt-3 text-sm text-texto/90">
          [Placeholder] Painel ao vivo sem dados ficticios. As informacoes abaixo refletem somente o que esta no banco.
        </p>
      </div>

      <section className="rounded-2xl border border-primaria/50 bg-base/70 p-6">
        <h2 className="text-lg font-bold text-ciano">Estacao</h2>
        {loadingStations ? (
          <p aria-live="polite" className="mt-3 text-sm text-texto/80" role="status">
            Carregando estacoes...
          </p>
        ) : null}
        {!loadingStations && !stations.length ? (
          <p aria-live="polite" className="mt-3 text-sm text-texto/80" role="status">
            Nenhuma estacao encontrada.
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-texto">Selecione uma estacao</span>
            <select
              className="w-full rounded-md border border-ciano/40 bg-fundo px-3 py-2 text-texto outline-none focus:border-ciano"
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
              className="flex-1 md:flex-none rounded-md border border-cta px-4 py-2 text-sm font-black uppercase tracking-wide text-cta transition-colors hover:bg-cta hover:text-base disabled:opacity-60"
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
              className="flex-1 md:flex-none rounded-md bg-cta px-4 py-2 text-sm font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedStationId || loadingMeasurements}
              onClick={() => selectedStationId && void loadMeasurements(selectedStationId, selectedRange)}
              type="button"
            >
              Atualizar agora
            </button>
            <button
              className="flex-1 md:flex-none rounded-md border border-ciano px-4 py-2 text-sm font-black uppercase tracking-wide text-ciano transition-colors hover:bg-ciano hover:text-base disabled:opacity-60"
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
                  // Escape values if they contain commas (though none of these should)
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
            className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${selectedRange === "24h" ? "bg-ciano text-base" : "border border-ciano/40 bg-fundo text-texto hover:bg-fundo/80"
              }`}
            onClick={() => setSelectedRange("24h")}
            type="button"
          >
            24h
          </button>
          <button
            className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${selectedRange === "7d" ? "bg-ciano text-base" : "border border-ciano/40 bg-fundo text-texto hover:bg-fundo/80"
              }`}
            onClick={() => setSelectedRange("7d")}
            type="button"
          >
            7d
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-ciano/40 bg-fundo/80 p-4">
            <p className="text-xs uppercase tracking-wide text-ciano">Status</p>
            <p className={`mt-1 text-sm font-bold ${isOnline ? "text-primaria" : "text-acento"}`}>
              {selectedStationId ? (isOnline ? "Online" : "Offline") : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-ciano/40 bg-fundo/80 p-4">
            <p className="text-xs uppercase tracking-wide text-ciano">Ultima atualizacao</p>
            <p className="mt-1 text-sm font-bold text-texto">{selectedStationId ? formatDate(lastUpdate) : "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-acento/60 bg-fundo/70 p-6">
        <h2 className="text-lg font-bold text-cta">Medicoes consolidadas por bucket ({selectedRange})</h2>
        {!selectedStationId ? (
          <p aria-live="polite" className="mt-3 text-sm text-texto/80" role="status">
            Selecione uma estacao para ver as medicoes.
          </p>
        ) : null}
        {selectedStationId && loadingMeasurements ? (
          <p aria-live="polite" className="mt-3 text-sm text-texto/80" role="status">
            Carregando medicoes...
          </p>
        ) : null}
        {selectedStationId && !loadingMeasurements && !measurements.length ? (
          <p aria-live="polite" className="mt-3 text-sm text-texto/80" role="status">
            Nao ha medicoes para esta estacao.
          </p>
        ) : null}
        {selectedStationId && !loadingMeasurements && measurements.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ciano/40 text-left text-xs uppercase tracking-wide text-ciano">
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
                  <tr className="border-b border-base/80" key={String(row.bucket_ts)}>
                    <td className="px-3 py-2 text-texto/90">{formatDate(row.bucket_ts)}</td>
                    <td className="px-3 py-2 text-texto/90">{formatCellValue(row.pm25)}</td>
                    <td className="px-3 py-2 text-texto/90">{formatCellValue(row.pm10)}</td>
                    <td className="px-3 py-2 text-texto/90">{formatCellValue(row.temp)}</td>
                    <td className="px-3 py-2 text-texto/90">{formatCellValue(row.humidity)}</td>
                    <td className="px-3 py-2 text-texto/90">{formatCellValue(row.quality_flag)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-6 rounded-lg border border-dashed border-cta/60 bg-base/60 p-4">
          <p className="text-sm font-semibold text-cta">[Placeholder de grafico]</p>
          <p className="mt-1 text-xs text-texto/80">
            Area reservada para visualizacao grafica das medicoes (sem biblioteca de chart neste momento).
          </p>
        </div>
      </section>

      {successMessage ? (
        <p aria-live="polite" className="rounded-md border border-primaria/70 bg-primaria/15 p-3 text-sm text-texto" role="status">
          {successMessage}
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
