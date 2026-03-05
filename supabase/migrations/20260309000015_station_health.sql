-- Add health status columns to stations
ALTER TABLE public.stations
  ADD COLUMN IF NOT EXISTS health_status text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_measurement_ts timestamptz;

-- Create index for health status queries
CREATE INDEX IF NOT EXISTS idx_stations_health_status ON public.stations(health_status);

-- RPC function: get_station_health
-- Returns station health info including calculated status
CREATE OR REPLACE FUNCTION public.get_station_health()
RETURNS TABLE (
  station_id uuid,
  code text,
  name text,
  is_online boolean,
  health_status text,
  last_measurement_ts timestamptz,
  last_seen_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH station_data AS (
    SELECT 
      s.id,
      s.code,
      s.name,
      s.last_seen_at,
      (NOW() - s.last_seen_at < INTERVAL '5 minutes') AS online,
      MAX(m.created_at) AS last_m_ts,
      MAX(m.quality_flag) AS last_quality_flag
    FROM public.stations s
    LEFT JOIN public.measurements m ON m.station_id = s.id
    GROUP BY s.id, s.code, s.name, s.last_seen_at
  )
  SELECT 
    sd.id,
    sd.code,
    sd.name,
    sd.online,
    CASE
      WHEN sd.last_m_ts IS NULL THEN 'unknown'::text
      WHEN NOT sd.online THEN 'offline'::text
      WHEN sd.last_quality_flag IN ('suspect', 'missing', 'calibrating') THEN 'degraded'::text
      ELSE 'ok'::text
    END AS health_status,
    sd.last_m_ts,
    sd.last_seen_at
  FROM station_data sd
  ORDER BY sd.code;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comments for documentation
COMMENT ON COLUMN public.stations.health_status IS 'Overall health: ok, degraded, offline, unknown';
COMMENT ON COLUMN public.stations.last_measurement_ts IS 'Timestamp of the most recent measurement from this station.';
COMMENT ON FUNCTION public.get_station_health() IS 'Returns station health overview with calculated status based on recent measurements and flags.';
