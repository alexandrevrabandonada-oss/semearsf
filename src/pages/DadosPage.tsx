import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { getMeasurementsDownsampled, getStationOverview, type DownsampledMeasurement, type StationOverview } from "../lib/api";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";
const POLLING_INTERVAL_MS = 60_000;

type TabId = "now" | "24h" | "7d";

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
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
  const [activeTab, setActiveTab] = useState<TabId>("24h");
  const [measurements24h, setMeasurements24h] = useState<DownsampledMeasurement[]>([]);
  const [measurements7d, setMeasurements7d] = useState<DownsampledMeasurement[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPM25, setShowPM25] = useState(true);
  const [showPM10, setShowPM10] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible"
  );

  // Carrega estações na inicialização

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

  // Carrega medições 24h e 7d
  const loadMeasurements = useCallback(async (stationId: string, silent = false) => {
    try {
      if (!silent) setLoadingMeasurements(true);
      setError(null);
      
      const [data24h, data7d] = await Promise.all([
        getMeasurementsDownsampled(stationId, "24h"),
        getMeasurementsDownsampled(stationId, "7d")
      ]);
      
      setMeasurements24h(data24h);
      setMeasurements7d(data7d);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao carregar medições.";
      setError(`${message}${ENV_HINT}`);
    } finally {
      if (!silent) setLoadingMeasurements(false);
    }
  }, []);

  // Atualiza medições quando muda estação
  useEffect(() => {
    const stationId = selectedStationId ?? "";
    if (!stationId) return;
    void loadMeasurements(stationId);
  }, [loadMeasurements, selectedStationId]);

  // Polling automático quando página visível
  useEffect(() => {
    function onVisibilityChange() {
      const visible = document.visibilityState === "visible";
      setIsPageVisible(visible);
      if (visible && selectedStationId) {
        void loadMeasurements(selectedStationId, true);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadMeasurements, selectedStationId]);

  useEffect(() => {
    const stationId = selectedStationId ?? "";
    if (!stationId || !isPageVisible) return;

    const intervalId = window.setInterval(() => {
      void loadMeasurements(stationId, true);
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isPageVisible, loadMeasurements, selectedStationId]);

  // Dados computados
  const selectedStation = useMemo(
    () => stations.find((station) => station.station_id === selectedStationId) ?? null,
    [selectedStationId, stations]
  );

  const currentMeasurements = activeTab === "24h" ? measurements24h : measurements7d;
  const isOnline = selectedStation?.is_online ?? false;

  // Estatísticas
  const stats = useMemo(() => {
    if (currentMeasurements.length === 0) {
      return { pm25Avg: null, pm25Max: null, pm10Avg: null, pm10Max: null, lastValue: null, lastTime: null };
    }

    const pm25Values = currentMeasurements.filter(m => m.pm25 !== null).map(m => m.pm25!);
    const pm10Values = currentMeasurements.filter(m => m.pm10 !== null).map(m => m.pm10!);

    const last = currentMeasurements[0];

    return {
      pm25Avg: pm25Values.length > 0 ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length : null,
      pm25Max: pm25Values.length > 0 ? Math.max(...pm25Values) : null,
      pm10Avg: pm10Values.length > 0 ? pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length : null,
      pm10Max: pm10Values.length > 0 ? Math.max(...pm10Values) : null,
      lastValue: last,
      lastTime: last?.bucket_ts ?? null
    };
  }, [currentMeasurements]);

  // Resumo textual para acessibilidade
  const textualSummary = useMemo(() => {
    if (!selectedStation || currentMeasurements.length === 0) {
      return "Nenhum dado disponível para o período selecionado.";
    }

    const period = activeTab === "24h" ? "últimas 24 horas" : activeTab === "7d" ? "últimos 7 dias" : "agora";
    const pm25Text = stats.pm25Avg !== null 
      ? `PM2.5 com média de ${stats.pm25Avg.toFixed(1)} µg/m³ (máximo de ${stats.pm25Max?.toFixed(1)} µg/m³)` 
      : "PM2.5 sem dados";
    const pm10Text = stats.pm10Avg !== null 
      ? `PM10 com média de ${stats.pm10Avg.toFixed(1)} µg/m³ (máximo de ${stats.pm10Max?.toFixed(1)} µg/m³)` 
      : "PM10 sem dados";

    return `Na estação ${selectedStation.name}, ${period}: ${pm25Text}, ${pm10Text}.`;
  }, [activeTab, currentMeasurements.length, selectedStation, stats]);

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    return [...currentMeasurements]
      .reverse()
      .map(m => ({
        ts: formatShortDate(m.bucket_ts),
        pm25: m.pm25,
        pm10: m.pm10,
        temp: m.temp,
        humidity: m.humidity
      }));
  }, [currentMeasurements]);

  // Função para exportar CSV
  const handleExportCSV = () => {
    if (!selectedStation || currentMeasurements.length === 0) return;

    const headers = ["bucket_ts", "pm25", "pm10", "temp", "humidity", "quality_flag"];
    const csvRows = [headers.join(",")];

    for (const row of currentMeasurements) {
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
    a.download = `semear_${selectedStation.code}_${activeTab}_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

      {/* Seleção de estação */}
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
          <button
            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedStationId || loadingMeasurements}
            onClick={() => selectedStationId && void loadMeasurements(selectedStationId)}
            type="button"
          >
            Atualizar agora
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-brand-primary">Status da Estação</p>
            <p className={`mt-1 text-sm font-bold ${isOnline ? "text-accent-green" : "text-error"}`}>
              {selectedStationId ? (isOnline ? "● Online" : "● Offline") : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-brand-primary">Última Atualização</p>
            <p className="mt-1 text-sm font-bold text-text-primary">{stats.lastTime ? formatDate(stats.lastTime) : "-"}</p>
          </div>
        </div>
      </section>

      {/* Tabs de período */}
      {selectedStationId && (
        <section className="rounded-2xl border border-border-subtle bg-white p-6">
          <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Período de visualização">
            <button
              role="tab"
              aria-selected={activeTab === "now"}
              aria-controls="panel-now"
              className={`rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                activeTab === "now" 
                  ? "bg-brand-primary text-white" 
                  : "border border-border-subtle bg-white text-text-primary hover:bg-bg-surface"
              }`}
              onClick={() => setActiveTab("now")}
              type="button"
            >
              Agora
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "24h"}
              aria-controls="panel-24h"
              className={`rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                activeTab === "24h" 
                  ? "bg-brand-primary text-white" 
                  : "border border-border-subtle bg-white text-text-primary hover:bg-bg-surface"
              }`}
              onClick={() => setActiveTab("24h")}
              type="button"
            >
              Últimas 24h
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "7d"}
              aria-controls="panel-7d"
              className={`rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                activeTab === "7d" 
                  ? "bg-brand-primary text-white" 
                  : "border border-border-subtle bg-white text-text-primary hover:bg-bg-surface"
              }`}
              onClick={() => setActiveTab("7d")}
              type="button"
            >
              Últimos 7 dias
            </button>
          </div>

          {/* Painel Agora */}
          {activeTab === "now" && (
            <div role="tabpanel" id="panel-now" aria-labelledby="tab-now">
              <h2 className="text-lg font-bold text-brand-primary mb-4">Última Leitura</h2>
              {stats.lastValue ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                    <p className="text-xs uppercase tracking-wide text-brand-primary">PM2.5</p>
                    <p className="mt-2 text-3xl font-black text-text-primary">
                      {stats.lastValue.pm25?.toFixed(1) ?? "-"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">µg/m³</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                    <p className="text-xs uppercase tracking-wide text-brand-primary">PM10</p>
                    <p className="mt-2 text-3xl font-black text-text-primary">
                      {stats.lastValue.pm10?.toFixed(1) ?? "-"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">µg/m³</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                    <p className="text-xs uppercase tracking-wide text-brand-primary">Temperatura</p>
                    <p className="mt-2 text-3xl font-black text-text-primary">
                      {stats.lastValue.temp?.toFixed(1) ?? "-"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">°C</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                    <p className="text-xs uppercase tracking-wide text-brand-primary">Umidade</p>
                    <p className="mt-2 text-3xl font-black text-text-primary">
                      {stats.lastValue.humidity?.toFixed(0) ?? "-"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">%</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Nenhum dado disponível.</p>
              )}
            </div>
          )}

          {/* Painel 24h / 7d */}
          {(activeTab === "24h" || activeTab === "7d") && (
            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
              {loadingMeasurements ? (
                <p aria-live="polite" className="text-sm text-text-secondary" role="status">
                  Carregando medições...
                </p>
              ) : currentMeasurements.length === 0 ? (
                <p aria-live="polite" className="text-sm text-text-secondary" role="status">
                  Não há medições para o período selecionado.
                </p>
              ) : (
                <>
                  {/* Resumo textual para acessibilidade */}
                  <div className="sr-only" aria-live="polite" role="status">
                    {textualSummary}
                  </div>

                  {/* Cards de resumo */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                      <p className="text-xs uppercase tracking-wide text-brand-primary">PM2.5 Média</p>
                      <p className="mt-2 text-2xl font-black text-text-primary">
                        {stats.pm25Avg !== null ? stats.pm25Avg.toFixed(1) : "-"}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">µg/m³</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                      <p className="text-xs uppercase tracking-wide text-brand-primary">PM2.5 Máximo</p>
                      <p className="mt-2 text-2xl font-black text-text-primary">
                        {stats.pm25Max !== null ? stats.pm25Max.toFixed(1) : "-"}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">µg/m³</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                      <p className="text-xs uppercase tracking-wide text-brand-primary">PM10 Média</p>
                      <p className="mt-2 text-2xl font-black text-text-primary">
                        {stats.pm10Avg !== null ? stats.pm10Avg.toFixed(1) : "-"}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">µg/m³</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                      <p className="text-xs uppercase tracking-wide text-brand-primary">PM10 Máximo</p>
                      <p className="mt-2 text-2xl font-black text-text-primary">
                        {stats.pm10Max !== null ? stats.pm10Max.toFixed(1) : "-"}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">µg/m³</p>
                    </div>
                  </div>

                  {/* Controles do gráfico */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPM25}
                          onChange={(e) => setShowPM25(e.target.checked)}
                          className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                        />
                        <span className="text-sm font-semibold text-text-primary">
                          <span style={{ color: "#10b981" }}>■</span> PM2.5
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPM10}
                          onChange={(e) => setShowPM10(e.target.checked)}
                          className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                        />
                        <span className="text-sm font-semibold text-text-primary">
                          <span style={{ color: "#f59e0b" }}>■</span> PM10
                        </span>
                      </label>
                    </div>
                    <button
                      className="rounded-md border border-brand-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:opacity-60"
                      disabled={currentMeasurements.length === 0}
                      onClick={handleExportCSV}
                      type="button"
                      aria-label="Baixar dados em formato CSV"
                    >
                      Baixar CSV
                    </button>
                  </div>

                  {/* Gráfico */}
                  <div className="rounded-lg border border-border-subtle bg-white p-4 mb-6">
                    <h3 className="text-sm font-bold text-brand-primary mb-4">Evolução Temporal</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="ts" 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                          label={{ value: 'µg/m³', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '12px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px' }}
                          iconType="line"
                        />
                        {showPM25 && (
                          <Line 
                            type="monotone" 
                            dataKey="pm25" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="PM2.5 (µg/m³)"
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        )}
                        {showPM10 && (
                          <Line 
                            type="monotone" 
                            dataKey="pm10" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            name="PM10 (µg/m³)"
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabela fallback para acessibilidade */}
                  <details className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                    <summary className="cursor-pointer text-sm font-bold text-brand-primary">
                      Ver tabela de dados (acessível para leitores de tela)
                    </summary>
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-brand-primary">
                            <th className="px-3 py-2 font-bold">Data/Hora</th>
                            <th className="px-3 py-2 font-bold">PM2.5 (µg/m³)</th>
                            <th className="px-3 py-2 font-bold">PM10 (µg/m³)</th>
                            <th className="px-3 py-2 font-bold">Temp (°C)</th>
                            <th className="px-3 py-2 font-bold">Umidade (%)</th>
                            <th className="px-3 py-2 font-bold">Qualidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMeasurements.map((row) => (
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
                  </details>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* Mensagens de erro */}
      {error ? (
        <p aria-live="assertive" className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
