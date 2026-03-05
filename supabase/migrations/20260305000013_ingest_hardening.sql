-- Migration: ingest-measurement hardening
-- Date: 2026-03-05
-- Description: Add unique constraint for measurements, create ingest_logs table

-- 1. Create unique index on measurements(station_id, ts) to prevent duplicates on retry
CREATE UNIQUE INDEX IF NOT EXISTS idx_measurements_station_ts 
ON public.measurements(station_id, ts);

-- 2. Create ingest_logs table for monitoring ingestion events
CREATE TABLE IF NOT EXISTS public.ingest_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  station_code text NOT NULL,
  pm25 numeric,
  pm10 numeric,
  battery_v numeric,
  rssi int,
  firmware text,
  device_temp numeric,
  inserted boolean NOT NULL DEFAULT false,
  duplicated boolean NOT NULL DEFAULT false,
  error_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes on ingest_logs for querying
CREATE INDEX IF NOT EXISTS idx_ingest_logs_station_code 
ON public.ingest_logs(station_code);

CREATE INDEX IF NOT EXISTS idx_ingest_logs_occurred_at 
ON public.ingest_logs(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_ingest_logs_status 
ON public.ingest_logs(inserted, duplicated, error_reason);

-- 4. Enable RLS on ingest_logs
ALTER TABLE public.ingest_logs ENABLE ROW LEVEL SECURITY;

-- Public read (for diagnostics/monitoring dashboards)
CREATE POLICY "ingest_logs_select_public"
  ON public.ingest_logs FOR SELECT
  USING (true);

-- Service role write (function deployment)
-- No explicit INSERT/UPDATE policy means only service_role can write
