import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Chip, IconShell, SectionHeader, SurfaceCard } from "../components/BrandSystem";
import { LoadingCard } from "../components/LoadingCard";
import { OfflineBanner } from "../components/OfflineBanner";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { SkeletonCard } from "../components/SkeletonCard";
import type { DownsampledMeasurement, StationOverview, StationHealth } from "../lib/api";
import { classifyOmsPollutant } from "../lib/airQuality";
import { trackCsvDownload } from "../lib/observability";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";
const POLLING_INTERVAL_MS = 60_000;

type TabId = "now" | "24h" | "7d";

const MeasurementsChart = lazy(() =>
  import("../components/MeasurementsChart").then((m) => ({ default: m.MeasurementsChart }))
);

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function getHealthBadgeInfo(health: string | undefined) {
  switch (health) {
    case 'ok':
      return { label: 'Excelente', color: 'border-emerald-500/20 bg-emerald-50 text-emerald-800', icon: '✓' };
    case 'degraded':
      return { label: 'Degradado', color: 'border-amber-500/20 bg-amber-50 text-amber-900', icon: '⚠' };
    case 'offline':
      return { label: 'Offline', color: 'border-red-500/20 bg-red-50 text-red-900', icon: '✕' };
    case 'unknown':
    default:
      return { label: 'Desconhecido', color: 'border-slate-300 bg-slate-50 text-slate-700', icon: '?' };
  }
}


function getOmsLevelStyle(level: string) {
  switch (level) {
    case "bom":
      return "bg-green-100 text-green-900";
    case "moderado":
      return "bg-yellow-100 text-yellow-900";
    case "alto":
      return "bg-orange-100 text-orange-900";
    case "muito alto":
      return "bg-red-100 text-red-900";
    default:
      return "bg-gray-100 text-gray-900";
  }
}

export function DadosPage() {
  const [searchParams] = useSearchParams();
  const stationCodeFromQuery = searchParams.get("station");

  const [stations, setStations] = useState<StationOverview[]>([]);
  const [stationHealth, setStationHealth] = useState<Map<string, StationHealth>>(new Map());
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("24h");
  const [measurements24h, setMeasurements24h] = useState<DownsampledMeasurement[]>([]);
  const [measurements7d, setMeasurements7d] = useState<DownsampledMeasurement[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPM25, setShowPM25] = useState(true);
  const [showPM10, setShowPM10] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible"
  );

  // Carrega estações na inicialização

  useEffect(() => {
    async function run() {
      try {
        setLoadingStations(true);
        setError(null);
        const monitoringApi = await import("../lib/api/monitoring");
        const data = await monitoringApi.getStationOverview();
        const health = await monitoringApi.getStationHealth();
        
        setStations(data);
        
        // Criar mapa de health por station_id
        const healthMap = new Map<string, StationHealth>();
        health.forEach(h => {
          healthMap.set(h.station_id, h);
        });
        setStationHealth(healthMap);

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
      
      const monitoringApi = await import("../lib/api/monitoring");
      const [data24h, data7d] = await Promise.all([
        monitoringApi.getMeasurementsDownsampled(stationId, "24h"),
        monitoringApi.getMeasurementsDownsampled(stationId, "7d")
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

  const pm25NowClassification = useMemo(() => classifyOmsPollutant("pm25", stats.lastValue?.pm25 ?? null), [stats.lastValue]);
  const pm10NowClassification = useMemo(() => classifyOmsPollutant("pm10", stats.lastValue?.pm10 ?? null), [stats.lastValue]);

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
        ts: m.bucket_ts,
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
    trackCsvDownload("dados", currentMeasurements.length);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-10 md:space-y-12">
      {!isOnline && (
        <OfflineBanner
          description="Algumas leituras podem ficar desatualizadas até a conexão voltar. A lista da estação e o histórico carregado continuam disponíveis."
          onRetry={() => window.location.reload()}
        />
      )}

      <SurfaceCard className="signature-shell logo-watermark-soft overflow-hidden p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <IconShell tone="brand" className="rounded-full">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </IconShell>
              <div>
                <p className="section-badge">Painel ambiental</p>
                <h1 className="mt-2 text-2xl font-black leading-tight text-text-primary md:text-4xl">Dados ao vivo</h1>
              </div>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              Acompanhe as leituras das estações públicas de Volta Redonda e do Sul Fluminense. Leia agora, compare períodos e exporte o recorte em CSV.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-[34rem] lg:grid-cols-1">
            <div className="signature-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Status</p>
              <p className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${selectedStationId ? (isOnline ? "border-emerald-500/20 bg-emerald-50 text-emerald-800" : "border-red-500/20 bg-red-50 text-red-900") : "border-slate-300 bg-slate-50 text-slate-700"}`}>
                {selectedStationId ? (isOnline ? "● Online" : "● Offline") : "Selecione uma estação"}
              </p>
            </div>
            <div className="signature-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Qualidade</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {selectedStationId && stationHealth.has(selectedStationId)
                  ? getHealthBadgeInfo(stationHealth.get(selectedStationId)!.health_status).label
                  : "Sem leitura ainda"}
              </p>
            </div>
            <div className="signature-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Atualização</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{stats.lastTime ? formatDate(stats.lastTime) : "Aguardando dados"}</p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
          <div className="space-y-6">
            <SectionHeader
              eyebrow="Leitura pública"
              title="Selecionar estação e acompanhar leituras"
              description="Escolha a estação, confira a situação atual e atualize a leitura quando precisar."
            />

            <div className="signature-surface p-5 md:p-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-text-primary">Estação monitorada</span>
                  <select
                    className="w-full rounded-full border border-border-subtle bg-surface-1 px-4 py-3 text-text-primary outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-focus-ring/30"
                    disabled={!stations.length}
                    onChange={(e) => setSelectedStationId(e.target.value || null)}
                    value={selectedStationId ?? ""}
                  >
                    {!selectedStationId ? <option value="">Selecione uma estação</option> : null}
                    {stations.map((station) => (
                      <option key={station.station_id} value={station.station_id}>
                        {String(station.name ?? station.station_id)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="ui-btn-primary px-5 shadow-[0_12px_30px_rgba(0,93,170,0.18)]"
                  disabled={!selectedStationId || loadingMeasurements}
                  onClick={() => selectedStationId && void loadMeasurements(selectedStationId)}
                  type="button"
                >
                  Atualizar leitura
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Status da estação</p>
                  <p className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${selectedStationId ? (isOnline ? "border-emerald-500/20 bg-emerald-50 text-emerald-800" : "border-red-500/20 bg-red-50 text-red-900") : "border-slate-300 bg-slate-50 text-slate-700"}`}>
                    {selectedStationId ? (isOnline ? "● Online" : "● Offline") : "Selecione uma estação"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Última atualização</p>
                  <p className="mt-2 text-sm font-bold text-text-primary">{stats.lastTime ? formatDate(stats.lastTime) : "Aguardando dados"}</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Qualidade dos dados</p>
                  {selectedStationId && stationHealth.has(selectedStationId) ? (
                    (() => {
                      const health = stationHealth.get(selectedStationId)!;
                      const info = getHealthBadgeInfo(health.health_status);
                      return (
                        <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${info.color}`} aria-label={`Qualidade do dado: ${info.label}`} title={`Status: ${info.label} - ${health.health_status === 'ok' ? 'Medições confiáveis' : health.health_status === 'degraded' ? 'Qualidade comprometida' : health.health_status === 'offline' ? 'Sem comunicação' : 'Dados não disponíveis'}`}>
                          <span aria-hidden="true">{info.icon}</span>
                          <span>{info.label}</span>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="mt-2 text-sm text-text-secondary">Selecione uma estação para ver a qualidade.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader
              eyebrow="Guia rápido"
              title="Como ler os dados"
              description="O painel foi organizado para leitura rápida e segura em uso público."
            />
            <div className="signature-surface p-5">
              <ul className="space-y-3 text-sm leading-relaxed text-text-secondary">
                <li><span className="font-semibold text-text-primary">1.</span> PM2.5 e PM10 medem material particulado no ar em µg/m³.</li>
                <li><span className="font-semibold text-text-primary">2.</span> A classificação OMS resume o nível atual: bom, moderado, alto ou muito alto.</li>
                <li><span className="font-semibold text-text-primary">3.</span> Use 24h e 7 dias para contexto. Uma leitura isolada pode enganar.</li>
                <li><span className="font-semibold text-text-primary">4.</span> Quando houver indisponibilidade, recarregue os dados ou troque de estação.</li>
              </ul>
            </div>
            <div className="signature-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Exportação</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Baixe o recorte em CSV para análise externa. O botão fica visível nos períodos com dados carregados.
              </p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {selectedStationId && (
        <SurfaceCard className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Período de visualização">
            <button
              id="tab-now"
              role="tab"
              aria-selected={activeTab === "now"}
              aria-controls="panel-now"
              className={activeTab === "now" ? "motion-tab motion-tab-active" : "motion-tab"}
              onClick={() => setActiveTab("now")}
              type="button"
            >
              Agora
            </button>
            <button
              id="tab-24h"
              role="tab"
              aria-selected={activeTab === "24h"}
              aria-controls="panel-24h"
              className={activeTab === "24h" ? "motion-tab motion-tab-active" : "motion-tab"}
              onClick={() => setActiveTab("24h")}
              type="button"
            >
              24h
            </button>
            <button
              id="tab-7d"
              role="tab"
              aria-selected={activeTab === "7d"}
              aria-controls="panel-7d"
              className={activeTab === "7d" ? "motion-tab motion-tab-active" : "motion-tab"}
              onClick={() => setActiveTab("7d")}
              type="button"
            >
              7 dias
            </button>
          </div>

          {activeTab === "now" && (
            <div role="tabpanel" id="panel-now" aria-labelledby="tab-now">
              <h2 className="mt-6 text-lg font-bold text-brand-primary">Leitura atual</h2>
              {stats.lastValue ? (
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <div className="signature-surface p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM2.5</p>
                    <p className="mt-2 text-4xl font-black leading-none text-text-primary">{stats.lastValue.pm25?.toFixed(1) ?? "-"}</p>
                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${getOmsLevelStyle(pm25NowClassification.level)}`}>
                      <span aria-hidden="true">{pm25NowClassification.icon}</span>
                      <span>Classificação: {pm25NowClassification.level}</span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-text-secondary">{pm25NowClassification.summary}</p>
                    <p className="mt-1 text-xs font-medium text-text-secondary">Cuidado: {pm25NowClassification.recommendation}</p>
                  </div>
                  <div className="signature-surface p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM10</p>
                    <p className="mt-2 text-4xl font-black leading-none text-text-primary">{stats.lastValue.pm10?.toFixed(1) ?? "-"}</p>
                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${getOmsLevelStyle(pm10NowClassification.level)}`}>
                      <span aria-hidden="true">{pm10NowClassification.icon}</span>
                      <span>Classificação: {pm10NowClassification.level}</span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-text-secondary">{pm10NowClassification.summary}</p>
                    <p className="mt-1 text-xs font-medium text-text-secondary">Cuidado: {pm10NowClassification.recommendation}</p>
                  </div>
                  <div className="signature-surface p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Temperatura</p>
                    <p className="mt-2 text-3xl font-black text-text-primary">{stats.lastValue.temp?.toFixed(1) ?? "-"}</p>
                    <p className="mt-1 text-xs text-text-secondary">°C</p>
                  </div>
                  <div className="signature-surface p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Umidade</p>
                    <p className="mt-2 text-3xl font-black text-text-primary">{stats.lastValue.humidity?.toFixed(0) ?? "-"}</p>
                    <p className="mt-1 text-xs text-text-secondary">%</p>
                  </div>
                </div>
              ) : (
                <EmptyState title="Sem leitura disponível agora" description="Escolha outra estação ou aguarde o próximo envio de dados." />
              )}
            </div>
          )}

          {(activeTab === "24h" || activeTab === "7d") && (
            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
              {loadingMeasurements ? (
                <p aria-live="polite" className="mt-6 text-sm text-text-secondary" role="status">
                  Carregando medições do período...
                </p>
              ) : currentMeasurements.length === 0 ? (
                <EmptyState title="Sem medições para este intervalo" description="Troque para outro intervalo ou aguarde o próximo ciclo de coleta." />
              ) : (
                <>
                  <div className="sr-only" aria-live="polite" role="status">
                    {textualSummary}
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                      <div className="signature-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM2.5 média</p>
                        <p className="mt-2 text-3xl font-black text-text-primary">{stats.pm25Avg !== null ? stats.pm25Avg.toFixed(1) : "-"}</p>
                        <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                      </div>
                      <div className="signature-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM2.5 máximo</p>
                        <p className="mt-2 text-3xl font-black text-text-primary">{stats.pm25Max !== null ? stats.pm25Max.toFixed(1) : "-"}</p>
                        <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                      </div>
                      <div className="signature-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM10 média</p>
                        <p className="mt-2 text-3xl font-black text-text-primary">{stats.pm10Avg !== null ? stats.pm10Avg.toFixed(1) : "-"}</p>
                        <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                      </div>
                      <div className="signature-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM10 máximo</p>
                        <p className="mt-2 text-3xl font-black text-text-primary">{stats.pm10Max !== null ? stats.pm10Max.toFixed(1) : "-"}</p>
                        <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                      </div>
                    </div>

                    <div className="signature-surface p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Resumo operacional</p>
                      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{textualSummary}</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-surface-2 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Leitura</p>
                          <p className="mt-2 text-base font-bold text-text-primary">{activeTab === "24h" ? "Últimas 24 horas" : "Últimos 7 dias"}</p>
                        </div>
                        <div className="rounded-2xl bg-surface-2 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Exportação</p>
                          <p className="mt-2 text-base font-bold text-text-primary">CSV disponível</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showPM25}
                          onChange={(e) => setShowPM25(e.target.checked)}
                          className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                        />
                        <span className="text-sm font-semibold text-text-primary"><span style={{ color: "#10b981" }}>■</span> PM2.5</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showPM10}
                          onChange={(e) => setShowPM10(e.target.checked)}
                          className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                        />
                        <span className="text-sm font-semibold text-text-primary"><span style={{ color: "#f59e0b" }}>■</span> PM10</span>
                      </label>
                    </div>
                    <button
                      className="ui-btn-secondary px-4 text-xs font-black uppercase tracking-wide text-brand-primary disabled:opacity-60"
                      disabled={currentMeasurements.length === 0}
                      onClick={handleExportCSV}
                      type="button"
                      aria-label="Baixar dados em formato CSV"
                    >
                      Baixar CSV
                    </button>
                  </div>

                  <div className="signature-surface mt-5 p-4 md:p-5">
                    <h3 className="mb-4 text-sm font-bold text-brand-primary">Evolução temporal</h3>
                    <Suspense fallback={<LoadingCard message="Carregando gráfico histórico..." />}>
                      <MeasurementsChart data={chartData} showPM25={showPM25} showPM10={showPM10} />
                    </Suspense>
                  </div>

                  <details className="signature-surface mt-5 p-4">
                    <summary className="cursor-pointer text-sm font-bold text-brand-primary">
                      Abrir tabela em texto
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
        </SurfaceCard>
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





