# Changelog público do SEMEAR

- 2026-03-05 — Boletim mensal compartilhável com `/s/boletim/YYYY-MM`, analytics `share_events(kind='boletim')` e leitura de período por querystring em `/status`.
- 2026-03-05 — Smoke test específico para sincronização de filtros em `/transparencia`, incluindo download de CSV e atualização de URL.
- 2026-03-05 — Redução do chunk principal com carregamento sob demanda de `api.ts` nas páginas eager `Home` e `Dados`.
- 2026-03-05 — Compartilhamento de relatórios com OG premium, capa/thumb e rota curta `/s/relatorios/:slug`.
- 2026-03-05 — Biblioteca de relatórios com filtros por tipo, ano, tag, busca e ordenação por destaque.
- 2026-03-05 — Transparência com filtros por período, categoria e fornecedor, export CSV por filtro e visualização de comprovantes.
- 2026-03-05 — Status com boletim mensal exportável, KPIs operacionais e leitura pública dos indicadores técnicos.
- 2026-03-05 — Publicação programada para blog e acervo com `publish_at` e filtros públicos para ocultar conteúdo futuro.
- 2026-03-05 — CI GitHub Actions com Vite preview, smoke UI e testes de acessibilidade em Playwright.
- 2026-03-05 — Módulo público de relatórios em PDF com importador, upload, detalhe, compartilhamento e bloco na home.
- 2026-03-05 — Páginas institucionais de guia: `/como-ler-dados`, `/como-participar` e `/privacidade-lgpd`.
