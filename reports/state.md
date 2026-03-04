# Project State Snapshot\n\n**Date:** 2026-03-04T19:16:35.578Z\n\n## Versions\n`\nnode: v22.19.0\nnpm:  10.9.3\n`\n\n## Git\n`\n## main...origin/main
 M package.json
 M reports/product_state_report.md
 M reports/state.md
 M src/lib/api.ts
 M src/pages/HomePage.tsx
 M src/pages/acervo/AcervoItemPage.tsx
 M src/pages/acervo/AcervoListPage.tsx
 M src/pages/acervo/AcervoPage.tsx
?? data/
?? docs/ACERVO.md
?? supabase/migrations/20260305_000002_acervo_curadoria.sql
?? tools/acervo-import.mjs\n`\n\n## package.json scripts\n`json\n{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "verify": "npm run typecheck && npm run build",
  "db:push": "npx supabase db push",
  "db:status": "npx supabase db status",
  "db:types": "npx supabase gen types typescript --local > src/lib/supabase/database.types.ts",
  "fn:deploy": "supabase functions deploy ingest-measurement --no-verify-jwt",
  "secrets:set": "node tools/secrets-set.mjs",
  "ship:infra": "npm run db:push && npm run fn:deploy && npm run done",
  "simulate:sensor": "node tools/simulate-sensor.mjs",
  "smoke": "node tools/db-smoke.mjs",
  "snapshot": "node tools/snapshot.mjs",
  "acervo:import": "node tools/acervo-import.mjs",
  "done": "npm run verify && npm run smoke && npm run snapshot"
}\n`\n\n## Routes (parsed from src/App.tsx)\n- *
- /
- /acervo
- /acervo/:area
- /acervo/item/:slug
- /agenda
- /dados
- /inscricoes
- /sobre
- /transparencia\n\n## Tree (src, tools)\n`\nApp.tsx
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
  DadosPage.tsx
  HomePage.tsx
  InscricoesPage.tsx
  OfflinePage.tsx
  PagePlaceholder.tsx
  SobrePage.tsx
  TransparenciaPage.tsx
vite-env.d.ts\n`\n\n`\nacervo-import.mjs
db-smoke.mjs
secrets-set.mjs
simulate-sensor.mjs
snapshot.mjs\n`\n\n## Root files (existence only)\n- vercel.json: exists\n- .gitignore: exists\n- .env.local.example: exists\n\n## Env keys present (names only)\n`\n\n`\n\n## DB Smoke\n`\nstations: OK count=1
measurements: OK count=0
events: OK count=1
registrations: EXPECTED_DENIED
DB_SMOKE: OK\n`\n