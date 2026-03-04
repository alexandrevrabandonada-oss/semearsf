# Project State Snapshot\n\n**Date:** 2026-03-04T18:51:57.905Z\n\n## Versions\n`\nnode: v22.19.0\nnpm:  10.9.3\n`\n\n## Git\n`\n## main...origin/main
 M .gitignore
 M package-lock.json
 M package.json
 M reports/state.md
 M src/App.tsx
 M src/components/Footer.tsx
 M src/components/Navbar.tsx
 M src/lib/api.ts
 M tsconfig.json
 M vite.config.js
 M vite.config.ts
?? public/
?? src/lib/acervo.ts
?? src/pages/OfflinePage.tsx
?? src/pages/acervo/
?? supabase/migrations/20260304_000003_acervo_items.sql
?? supabase/migrations/20260305_000001_acervo.sql\n`\n\n## package.json scripts\n`json\n{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "verify": "npm run typecheck && npm run build",
  "db:push": "supabase db push",
  "db:status": "supabase status",
  "db:types": "supabase gen types typescript --local > src/lib/supabase/database.types.ts",
  "fn:deploy": "supabase functions deploy ingest-measurement --no-verify-jwt",
  "secrets:set": "node tools/secrets-set.mjs",
  "ship:infra": "npm run db:push && npm run fn:deploy && npm run done",
  "simulate:sensor": "node tools/simulate-sensor.mjs",
  "smoke": "node tools/db-smoke.mjs",
  "snapshot": "node tools/snapshot.mjs",
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
vite-env.d.ts\n`\n\n`\ndb-smoke.mjs
secrets-set.mjs
simulate-sensor.mjs
snapshot.mjs\n`\n\n## Root files (existence only)\n- vercel.json: exists\n- .gitignore: exists\n- .env.local.example: exists\n\n## Env keys present (names only)\n`\n\n`\n\n## DB Smoke\n`\nstations: OK count=1
measurements: OK count=0
events: OK count=1
registrations: EXPECTED_DENIED
DB_SMOKE: OK\n`\n