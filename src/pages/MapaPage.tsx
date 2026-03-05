import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getStationOverview, getStationHealth, listCorridors, type StationOverview, type StationHealth, type ClimateCorridor } from "../lib/api";

// Fix default marker icons in react-leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

// Mock coordinates for stations (Volta Redonda region)
// In production, these should come from the database
const MOCK_COORDINATES: Record<string, [number, number]> = {
  "vr-centro-01": [-22.5203, -44.1044],
  "vr-retiro-01": [-22.5123, -44.0944],
  "vr-siderlandia-01": [-22.5303, -44.1144],
  "default": [-22.5203, -44.1044],
};

function getStationCoordinates(code: string | null): [number, number] {
  if (!code) return MOCK_COORDINATES.default;
  return MOCK_COORDINATES[code] || MOCK_COORDINATES.default;
}

function getHealthMarkerIcon(health: string | undefined) {
  const colors: Record<string, { bg: string; text: string }> = {
    ok: { bg: '#22c55e', text: '#fff' },        // green
    degraded: { bg: '#eab308', text: '#000' },  // yellow
    offline: { bg: '#ef4444', text: '#fff' },   // red
    unknown: { bg: '#a1a1a1', text: '#fff' }    // gray
  };
  
  const color = colors[health || 'unknown'];
  
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color.bg};
      color: ${color.text};
      border: 2px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      ${health === 'ok' ? '✓' : health === 'degraded' ? '⚠' : health === 'offline' ? '✕' : '?'}
    </div>`,
    className: 'leaflet-health-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function MapaPage() {
  const [stations, setStations] = useState<StationOverview[]>([]);
  const [stationHealth, setStationHealth] = useState<Map<string, StationHealth>>(new Map());
  const [corridors, setCorridors] = useState<ClimateCorridor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [stationsData, healthData, corridorsData] = await Promise.all([
          getStationOverview(),
          getStationHealth(),
          listCorridors(),
        ]);
        setStations(stationsData);
        
        // Create health map by station_id
        const healthMap = new Map<string, StationHealth>();
        healthData.forEach(h => {
          healthMap.set(h.station_id, h);
        });
        setStationHealth(healthMap);
        
        setCorridors(corridorsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar dados do mapa.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const mapCenter = useMemo<[number, number]>(() => {
    if (stations.length === 0) return [-22.5203, -44.1044]; // Volta Redonda center
    const firstStation = stations[0];
    return getStationCoordinates(firstStation.code);
  }, [stations]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary md:text-4xl">Mapa de Monitoramento</h1>
            <p className="text-xs font-semibold tracking-wider text-text-secondary mt-1 uppercase">Estações de Qualidade do Ar e Corredores Climáticos</p>
          </div>
        </div>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          Visualize a localização das estações de monitoramento e os corredores climáticos mapeados em Volta Redonda e região. Clique nos marcadores para acessar dados detalhados.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p aria-live="assertive" className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {/* Map Section */}
      <section className="rounded-2xl border border-border-subtle bg-white p-6 overflow-hidden">
        <h2 className="text-lg font-bold text-brand-primary mb-4">Mapa Interativo</h2>
        
        {loading ? (
          <p aria-live="polite" className="text-sm text-text-secondary" role="status">
            Carregando mapa...
          </p>
        ) : (
          <div className="relative" style={{ height: "500px" }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Station Markers */}
              {stations.map((station) => {
                const coords = getStationCoordinates(station.code);
                const health = stationHealth.get(station.station_id);
                const icon = getHealthMarkerIcon(health?.health_status);
                
                return (
                  <Marker key={station.station_id} position={coords} icon={icon}>
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-sm mb-1">{station.name}</h3>
                        <p className="text-xs text-text-secondary mb-2">
                          Status: <span className={station.is_online ? "text-accent-green" : "text-error"}>
                            {station.is_online ? "● Online" : "● Offline"}
                          </span>
                        </p>
                        {health && (
                          <p className="text-xs text-text-secondary mb-2">
                            Qualidade: <span className="font-bold">{health.health_status === 'ok' ? 'Excelente' : health.health_status === 'degraded' ? 'Degradado' : health.health_status === 'offline' ? 'Offline' : 'Desconhecido'}</span>
                          </p>
                        )}
                        {station.bairro && (
                          <p className="text-xs text-text-secondary mb-2">{station.bairro}</p>
                        )}
                        <Link
                          to={`/dados?station=${station.code}`}
                          className="inline-block mt-2 rounded bg-brand-primary px-3 py-1 text-xs font-bold text-white hover:bg-brand-primary/90"
                        >
                          Ver Dados
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Corridor GeoJSON layers */}
              {corridors.map((corridor) => {
                if (!corridor.geometry_json) return null;
                
                try {
                  return (
                    <GeoJSON
                      key={corridor.id}
                      data={corridor.geometry_json}
                      style={{
                        color: "#10b981",
                        weight: 3,
                        opacity: 0.6,
                        fillOpacity: 0.2,
                      }}
                      onEachFeature={(feature, layer) => {
                        layer.bindPopup(`
                          <div class="p-2">
                            <h3 class="font-bold text-sm mb-1">${corridor.title}</h3>
                            <p class="text-xs text-gray-600 mb-2">${corridor.excerpt || ""}</p>
                            <a 
                              href="/corredores/${corridor.slug}" 
                              class="inline-block mt-2 rounded bg-brand-primary px-3 py-1 text-xs font-bold text-white hover:bg-brand-primary/90"
                            >
                              Abrir Corredor
                            </a>
                          </div>
                        `);
                      }}
                    />
                  );
                } catch (e) {
                  console.warn(`Invalid GeoJSON for corridor ${corridor.slug}:`, e);
                  return null;
                }
              })}
            </MapContainer>
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div className="mt-4 rounded-lg border border-border-subtle bg-bg-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-primary mb-3">Legenda</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#22c55e', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✓</div>
                <span className="text-xs text-text-secondary"><strong>Excelente:</strong> Qualidade confiável</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#eab308', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>⚠</div>
                <span className="text-xs text-text-secondary"><strong>Degradado:</strong> Qualidade comprometida</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✕</div>
                <span className="text-xs text-text-secondary"><strong>Offline:</strong> Sem comunicação</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#a1a1a1', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>?</div>
                <span className="text-xs text-text-secondary"><strong>Desconhecido:</strong> Sem dados</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#10b981', height: '4px', width: '30px' }}></div>
                <span className="text-xs text-text-secondary"><strong>Corredor climático</strong></span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Accessible Fallback List */}
      <section className="rounded-2xl border border-border-subtle bg-white p-6">
        <h2 className="text-lg font-bold text-brand-primary mb-4">Lista de Estações e Corredores</h2>
        <p className="text-sm text-text-secondary mb-4">
          Informações acessíveis para leitores de tela e navegação sem JavaScript.
        </p>

        {/* Stations List */}
        <div className="mb-6">
          <h3 className="text-md font-bold text-text-primary mb-3">Estações de Monitoramento</h3>
          {loading ? (
            <p aria-live="polite" className="text-sm text-text-secondary" role="status">
              Carregando estações...
            </p>
          ) : stations.length === 0 ? (
            <p className="text-sm text-text-secondary">Nenhuma estação encontrada.</p>
          ) : (
            <ul className="space-y-3">
              {stations.map((station) => (
                <li key={station.station_id} className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <h4 className="font-bold text-text-primary">{station.name}</h4>
                      {station.bairro && (
                        <p className="text-sm text-text-secondary mt-1">{station.bairro}</p>
                      )}
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Status:</span>{" "}
                        <span className={station.is_online ? "text-accent-green" : "text-error"}>
                          {station.is_online ? "● Online" : "● Offline"}
                        </span>
                      </p>
                      {station.last_seen_at && (
                        <p className="text-sm text-text-secondary mt-1">
                          Última atualização: {new Date(station.last_seen_at).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/dados?station=${station.code}`}
                      className="rounded-md bg-brand-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-brand-primary/90"
                    >
                      Ver Dados
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Corridors List */}
        <div>
          <h3 className="text-md font-bold text-text-primary mb-3">Corredores Climáticos</h3>
          {loading ? (
            <p aria-live="polite" className="text-sm text-text-secondary" role="status">
              Carregando corredores...
            </p>
          ) : corridors.length === 0 ? (
            <p className="text-sm text-text-secondary">Nenhum corredor climático encontrado.</p>
          ) : (
            <ul className="space-y-3">
              {corridors.map((corridor) => (
                <li key={corridor.id} className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <h4 className="font-bold text-text-primary">{corridor.title}</h4>
                      {corridor.excerpt && (
                        <p className="text-sm text-text-secondary mt-2">{corridor.excerpt}</p>
                      )}
                      {corridor.featured && (
                        <span className="inline-block mt-2 rounded-full bg-accent-green/10 px-2 py-1 text-xs font-bold text-accent-green">
                          Em Destaque
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/corredores/${corridor.slug}`}
                      className="rounded-md border border-brand-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                    >
                      Abrir Corredor
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </section>
  );
}
