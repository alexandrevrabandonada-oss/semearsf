-- Create push_events table for automatic threshold alerts
-- This table stores NO personal data, only station and measurement context

CREATE TABLE IF NOT EXISTS public.push_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ts timestamptz NOT NULL,
  station_code text NOT NULL,
  pollutant text NOT NULL,  -- 'PM2.5' or 'PM10'
  value real NOT NULL,       -- Measured value that triggered alert
  triggered boolean DEFAULT true,
  reason text,               -- Why alert fired (threshold, subscriptions count, etc.)
  created_at timestamptz DEFAULT now()
);

-- Index for performance (querying recent events by station or pollutant)
CREATE INDEX IF NOT EXISTS idx_push_events_ts ON public.push_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_push_events_station ON public.push_events (station_code);
CREATE INDEX IF NOT EXISTS idx_push_events_pollutant ON public.push_events (pollutant);

-- Enable RLS (service_role only - no public access)
ALTER TABLE public.push_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service_role can interact
CREATE POLICY "Service Role full access"
ON public.push_events FOR ALL
USING ( auth.role() = 'service_role' )
WITH CHECK ( auth.role() = 'service_role' );

-- Comments for documentation
COMMENT ON TABLE public.push_events IS 'Logs automatic push alert triggers (threshold-based). No personal/subscription data.';
COMMENT ON COLUMN public.push_events.ts IS 'Timestamp of the measurement that triggered the alert.';
COMMENT ON COLUMN public.push_events.station_code IS 'Station code where measurement was taken.';
COMMENT ON COLUMN public.push_events.pollutant IS 'Pollutant that exceeded threshold (PM2.5 or PM10).';
COMMENT ON COLUMN public.push_events.value IS 'Measured value that triggered the alert (µg/m³).';
COMMENT ON COLUMN public.push_events.triggered IS 'Whether the alert was successfully triggered.';
COMMENT ON COLUMN public.push_events.reason IS 'Context: threshold value, subscriptions count, etc.';
