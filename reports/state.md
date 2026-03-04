# Project State Snapshot

**Date:** 2026-03-04T21:47:01.077Z

## Versions
```
node: v22.19.0
npm:  10.9.3
```

## Git
```
## main...origin/main
 M .env.local
 M docs/DEPLOY.md
 M package-lock.json
 M package.json
 M reports/state.md
 M src/pages/AgendaPage.tsx
 M src/pages/AlertasPage.tsx
 M src/pages/DadosPage.tsx
 M supabase/functions/ingest-measurement/index.ts
 M supabase/functions/register-push/index.ts
 M tools/env-doctor.mjs
 M vercel.json
?? api/share/agenda.ts
?? api/share/dados.ts
?? supabase/migrations/20260308000005_push_adv.sql
?? tools/env-clean.mjs
?? vapid.json
```

## package.json scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "verify": "npm run typecheck && npm run build",
  "db:push": "npx supabase db push",
  "db:status": "npx supabase db status",
  "db:types": "npx supabase gen types typescript --local > src/lib/supabase/database.types.ts",
  "db:doctor": "node tools/migration-doctor.mjs",
  "env:doctor": "node tools/env-doctor.mjs",
  "env:clean": "node tools/env-clean.mjs",
  "fn:deploy": "npx supabase functions deploy --no-verify-jwt",
  "secrets:set": "node tools/secrets-set.mjs",
  "ship:infra": "npm run db:push && npm run fn:deploy && npm run done",
  "ship:content": "npm run acervo:import && npm run blog:import && npm run transparency:import && npm run done",
  "ship:all": "npm run ship:infra && npm run ship:content",
  "simulate:sensor": "node tools/simulate-sensor.mjs",
  "smoke": "node tools/db-smoke.mjs",
  "snapshot": "node tools/snapshot.mjs",
  "acervo:import": "node tools/acervo-import.mjs",
  "acervo:upload": "node tools/acervo-upload.mjs",
  "blog:import": "node tools/blog-import.mjs",
  "transparency:import": "node tools/transparency-import.mjs",
  "done": "npm run verify && npm run smoke && npm run db:doctor && npm run env:doctor && npm run snapshot"
}
```

## Routes (parsed from src/App.tsx)
- *
- /
- /acervo
- /acervo/:area
- /acervo/item/:slug
- /agenda
- /alertas
- /blog
- /blog/:slug
- /buscar
- /dados
- /inscricoes
- /sobre
- /status
- /transparencia

## Tree (src, tools)
```
App.tsx
components/
  Footer.tsx
  Navbar.tsx
index.css
layout/
  PortalLayout.tsx
lib/
  acervo.ts
  api.ts
  supabase/
    client.ts
main.tsx
pages/
  acervo/
    AcervoItemPage.tsx
    AcervoListPage.tsx
    AcervoPage.tsx
  AgendaPage.tsx
  AlertasPage.tsx
  BlogListPage.tsx
  BlogPostPage.tsx
  DadosPage.tsx
  HomePage.tsx
  InscricoesPage.tsx
  OfflinePage.tsx
  PagePlaceholder.tsx
  SearchPage.tsx
  SobrePage.tsx
  StatusPage.tsx
  TransparenciaPage.tsx
vite-env.d.ts
```

```
acervo-import.mjs
acervo-upload.mjs
blog-import.mjs
db-smoke.mjs
env-clean.mjs
env-doctor.mjs
migration-doctor.mjs
secrets-set.mjs
simulate-sensor.mjs
snapshot.mjs
transparency-import.mjs
vapid-gen.mjs
```

## Root files (existence only)
- vercel.json: exists
- .gitignore: exists
- .env.local.example: exists

## Env keys present (names only)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
INGEST_API_KEY
SHARE_HASH_SALT
VITE_VAPID_PUBLIC_KEY
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VITE_PROJECT_NAME
```

## DB Smoke
```text
stations: OK count=1
measurements: OK count=0
events: OK count=1
registrations: EXPECTED_DENIED
DB_SMOKE: OK
```

## Supabase Migration Doctor
```text
=== SUPABASE MIGRATION DOCTOR (Hardened) ===
[OK] DB Local: Rodando
[OK] CLI Link: Autenticado

--- LOCAL STATE ---
[WARN] CLI local list: Falhou (Usando fallback de Filesystem)
      Motivo: Connecting to local database... failed to connect to postgres: failed to connect to `host=127.0.0.1 user=postgres database=postgres`: dial error (dial tcp 127.0.0.1:54322: connectex: Nenhuma conexão pôde ser feita porque a máquina de destino as recusou ativamente.)
[OK] Filesystem Scan: 11 arquivos encontrados
      Últimas 5 migrações locais:
      - 20260308000005_push_adv.sql
      - 20260308000004_share_analytics.sql
      - 20260308000003_push_rules.sql
      - 20260308000002_push.sql
      - 20260308000001_storage_acervo.sql

--- REMOTE STATE ---
[OK] CLI remote list: Sucesso
      Total: 11 migrações no ambiente remoto.

Doctor analysis completed.
```

## Env Doctor
```text
=== ENV DOCTOR (Vite-only Hardening) ===
[OK] Chaves Vite detectadas:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
    - VITE_VAPID_PUBLIC_KEY
    - VITE_PROJECT_NAME
[OK] Ambiente limpo de chaves NEXT_PUBLIC_*.
```
