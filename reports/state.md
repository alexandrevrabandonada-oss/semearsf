# Project State Snapshot\n\n**Date:** 2026-02-24T18:40:16.841Z\n\n## Versions\n`\nnode: v22.19.0\nnpm:  10.9.3\n`\n\n## Git\n`\n## main...origin/main
 M reports/state.md
 M tools/db-smoke.mjs
 M tools/snapshot.mjs
?? supabase/
?? tools/simulate-sensor.mjs\n`\n\n## package.json scripts\n`json\n{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "verify": "npm run typecheck && npm run build",
  "smoke": "node tools/db-smoke.mjs",
  "snapshot": "node tools/snapshot.mjs",
  "done": "npm run verify && npm run smoke && npm run snapshot"
}\n`\n\n## Routes (parsed from src/App.tsx)\n- *
- /
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
  api.ts
  supabase/
    client.ts
main.tsx
pages/
  AgendaPage.tsx
  DadosPage.tsx
  HomePage.tsx
  InscricoesPage.tsx
  PagePlaceholder.tsx
  SobrePage.tsx
  TransparenciaPage.tsx
vite-env.d.ts\n`\n\n`\ndb-smoke.mjs
simulate-sensor.mjs
snapshot.mjs\n`\n\n## Root files (existence only)\n- vercel.json: exists\n- .gitignore: exists\n- .env.local.example: exists\n\n## Env keys present (names only)\n`\n\n`\n\n## DB Smoke\n`\nstations: OK count=1
measurements: OK count=0
events: OK count=1
registrations: EXPECTED_DENIED
DB_SMOKE: OK\n`\n