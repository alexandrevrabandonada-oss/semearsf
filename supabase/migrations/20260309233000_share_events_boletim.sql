DO $$
DECLARE
    con_name text;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'public.share_events'::regclass
      AND contype = 'c'
      AND conname = 'share_events_kind_check';

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.share_events DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;
END $$;

ALTER TABLE public.share_events
ADD CONSTRAINT share_events_kind_check
CHECK (kind IN (
  'acervo',
  'agenda',
  'blog',
  'boletim',
  'corredores',
  'dados',
  'dossies',
  'relatorios',
  'transparencia'
));
