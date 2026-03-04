-- Migration: transparency
-- Tables for official links and project expenses

-- 1. transparency_links
CREATE TABLE IF NOT EXISTS public.transparency_links (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  url        text NOT NULL,
  kind       text NOT NULL DEFAULT 'portal' CHECK (kind IN ('portal', 'processo', 'nota', 'arquivo')),
  created_at timestamptz DEFAULT now()
);

-- 2. expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_on  date NOT NULL,
  vendor       text NOT NULL,
  description  text NOT NULL,
  category     text NOT NULL, -- e.g. equipamentos|servicos|formacao|comunicacao|viagens|outros
  amount_cents bigint NOT NULL,
  document_url text,
  meta         jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz DEFAULT now()
);

-- 3. RLS
ALTER TABLE public.transparency_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Public SELECT for everyone
CREATE POLICY "transparency_links_select_public" ON public.transparency_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "expenses_select_public" ON public.expenses FOR SELECT TO anon, authenticated USING (true);

-- Write access restricted (only service role can manage via API/importer)
-- No public INSERT/UPDATE/DELETE policies means only postgres/service_role can write.

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_occurred_on ON public.expenses (occurred_on DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);
