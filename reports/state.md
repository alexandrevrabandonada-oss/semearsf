# Project State Snapshot\n\n**Date:** 2026-03-04T19:51:19.005Z\n\n## Versions\n`\nnode: v22.19.0\nnpm:  10.9.3\n`\n\n## Git\n`\n## main...origin/main
 M package.json
 M reports/product_state_report.md
 M reports/state.md
 M src/App.tsx
 M src/components/Navbar.tsx
 M src/lib/api.ts
 M src/pages/TransparenciaPage.tsx
 D supabase/migrations/20260224_000001_baseline.sql
 D supabase/migrations/20260225_000002_downsample_rpc.sql
 D supabase/migrations/20260304_000003_acervo_items.sql
 D supabase/migrations/20260305_000001_acervo.sql
 D supabase/migrations/20260305_000002_acervo_curadoria.sql
?? data/blog.seed.json
?? data/transparencia.expenses.json
?? data/transparencia.links.json
?? docs/BLOG.md
?? src/pages/BlogListPage.tsx
?? src/pages/BlogPostPage.tsx
?? supabase/migrations/20260224000001_baseline.sql
?? supabase/migrations/20260225000002_downsample_rpc.sql
?? supabase/migrations/20260305000001_acervo.sql
?? supabase/migrations/20260305000002_acervo_curadoria.sql
?? supabase/migrations/20260306164000_blog.sql
?? supabase/migrations/20260307164000_transparencia.sql
?? supabase/migrations/OLD_20260304000003_acervo_items.sql
?? tools/blog-import.mjs
?? tools/transparency-import.mjs\n`\n\n## package.json scripts\n`json\n{
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
  "blog:import": "node tools/blog-import.mjs",
  "transparency:import": "node tools/transparency-import.mjs",
  "done": "npm run verify && npm run smoke && npm run snapshot"
}\n`\n\n## Routes (parsed from src/App.tsx)\n- *
- /
- /acervo
- /acervo/:area
- /acervo/item/:slug
- /agenda
- /blog
- /blog/:slug
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
  BlogListPage.tsx
  BlogPostPage.tsx
  DadosPage.tsx
  HomePage.tsx
  InscricoesPage.tsx
  OfflinePage.tsx
  PagePlaceholder.tsx
  SobrePage.tsx
  TransparenciaPage.tsx
vite-env.d.ts\n`\n\n`\nacervo-import.mjs
blog-import.mjs
db-smoke.mjs
secrets-set.mjs
simulate-sensor.mjs
snapshot.mjs
transparency-import.mjs\n`\n\n## Root files (existence only)\n- vercel.json: exists\n- .gitignore: exists\n- .env.local.example: exists\n\n## Env keys present (names only)\n`\n\n`\n\n## DB Smoke\n`\nstations: OK count=1
measurements: OK count=0
events: OK count=1
registrations: EXPECTED_DENIED
DB_SMOKE: OK\n`\n