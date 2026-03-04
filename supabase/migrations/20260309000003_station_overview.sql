-- Create a function to get all stations with their latest measurement and online status
CREATE OR REPLACE FUNCTION public.get_station_overview()
RETURNS TABLE (
    station_id uuid,
    code text,
    name text,
    bairro text,
    last_seen_at timestamptz,
    is_online boolean,
    last_ts timestamptz,
    pm25 real,
    pm10 real,
    temp real,
    humidity real
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT 
        s.id as station_id,
        s.code,
        s.name,
        s.bairro,
        s.last_seen_at,
        (s.last_seen_at >= now() - interval '5 minutes') as is_online,
        m.ts as last_ts,
        m.pm25,
        m.pm10,
        m.temp,
        m.humidity
    FROM public.stations s
    LEFT JOIN LATERAL (
        SELECT ts, pm25, pm10, temp, humidity
        FROM public.measurements
        WHERE station_id = s.id
        ORDER BY ts DESC
        LIMIT 1
    ) m ON true
    ORDER BY s.name ASC;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_station_overview() TO anon, authenticated, service_role;
