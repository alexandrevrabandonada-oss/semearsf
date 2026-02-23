# Project State Snapshot\n\n**Date:** 2026-02-23T18:04:45.348Z\n\n## Versions\n`\nnode: v22.19.0\nnpm:  10.9.3\n`\n\n## Git\n`\n## main...origin/main [ahead 1]
 M .env.local.example
 M .gitignore
 M package.json
 M reports/state.md
 M src/lib/supabase/client.ts
 M src/pages/AgendaPage.tsx
 M src/pages/DadosPage.tsx
 M src/pages/InscricoesPage.tsx
 M tools/snapshot.mjs
?? src/lib/api.ts
?? src/vite-env.d.ts\n`\n\n## package.json scripts\n`json\n{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "verify": "npm run typecheck && npm run build",
  "snapshot": "node tools/snapshot.mjs",
  "done": "npm run verify && npm run snapshot"
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
vite-env.d.ts\n`\n\n`\nsnapshot.mjs\n`\n\n## Root files (existence only)\n- vercel.json: exists\n- .gitignore: exists\n- .env.local.example: exists\n\n## Env keys present (names only)\n`\n\n`\n