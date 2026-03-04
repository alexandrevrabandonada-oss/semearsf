-- Add advanced push notification columns to push_subscriptions
ALTER TABLE public.push_subscriptions
ADD COLUMN IF NOT EXISTS station_code_filter text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS quiet_start text DEFAULT '22:00',
ADD COLUMN IF NOT EXISTS quiet_end text DEFAULT '07:00',
ADD COLUMN IF NOT EXISTS pm10_threshold real DEFAULT NULL;

-- Index for station filtering performance
CREATE INDEX IF NOT EXISTS idx_push_subs_station_filter ON public.push_subscriptions (station_code_filter);

-- Comment for documentation
COMMENT ON COLUMN public.push_subscriptions.station_code_filter IS 'Code of the station to filter alerts for. NULL means all stations.';
COMMENT ON COLUMN public.push_subscriptions.quiet_start IS 'Hour when quiet mode starts (HH:MM).';
COMMENT ON COLUMN public.push_subscriptions.quiet_end IS 'Hour when quiet mode ends (HH:MM).';
COMMENT ON COLUMN public.push_subscriptions.pm10_threshold IS 'Custom threshold for PM10 particles.';
