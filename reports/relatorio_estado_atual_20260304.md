# Relatório Completo do Estado Atual do Projeto

**Projeto:** SEMEAR PWA  
**Data de referência:** 04/03/2026  
**Ambiente:** Produção remota Supabase + frontend Vite/PWA  
**Status geral:** ✅ Operacional e em evolução ativa

---

## 1) Resumo Executivo

O SEMEAR PWA está funcional de ponta a ponta, com build, tipagem e verificações de banco passando com sucesso. O projeto avançou em quatro frentes principais no ciclo recente:

1. **Módulo Conversar** com moderação leve e anti-spam via Edge Functions.
2. **Módulo Corredores** evoluído para experiência editorial/map-first (destaques, capa, nota, blocos relacionados).
3. **Preparação de publicação Android (TWA)** com documentação e templates prontos.
4. **Testes de fumaça de UI com Playwright** cobrindo fluxos críticos.

Além disso, foi iniciada a **adequação territorial para Volta Redonda/Sul Fluminense** em UI e conteúdos demo.

---

## 2) Evidências de Qualidade e Operação

### 2.1 Pipeline de verificação (`npm run done`)

Resultado mais recente: **100% OK**

- `typecheck`: ✅ sem erros
- `build`: ✅ sucesso (Vite + PWA)
- `smoke` (DB): ✅ sucesso
  - stations: OK (count=1)
  - measurements: OK (count=20)
  - events: OK (count=1)
  - registrations: EXPECTED_DENIED
- `db:doctor`: ✅ sucesso
  - 25 migrações locais detectadas
  - 25 migrações remotas detectadas
- `env:doctor`: ✅ sucesso
  - chaves `VITE_*` essenciais presentes
  - sem chaves `NEXT_PUBLIC_*`
- `snapshot`: ✅ atualizado em `reports/state.md`

### 2.2 Estado de versionamento (working tree)

Há um conjunto grande de alterações locais não commitadas (arquivos modificados e novos), coerente com o pacote de evolução recente (Conversar, Corredores, TWA, Playwright, demo e docs).

---

## 3) Estado Funcional por Módulo

## 3.1 Home (`/`)
- Blocos de visão geral operacional funcionando.
- CTA de instalação aprimorado para mobile (offline + notificações).
- Bloco de Corredores em destaque integrado (top 3 com capa).

## 3.2 Dados (`/dados`)
- Fluxo principal operacional.
- Smoke de banco confirma presença de estação, medições e eventos.

## 3.3 Acervo (`/acervo`, `/acervo/linha`, `/acervo/item/:slug`)
- Estrutura e navegação mantidas operacionais.
- Conteúdo demo atualizado para contexto de Volta Redonda/Sul Fluminense.

## 3.4 Blog (`/blog`, `/blog/:slug`)
- Listagem/detalhe operacionais.
- Conteúdo demo territorialmente ajustado.

## 3.5 Conversar (`/conversar`, `/conversar/:slug`)
- Lista e detalhe ativos.
- Comentários agora passam por Edge Function (`submit-comment`) com:
  - honeypot,
  - rate-limit por `ip_hash`,
  - moderação por heurística (`published`/`queued`).
- Denúncia comunitária via `report-comment` com ocultação por limiar.
- Migração dedicada aplicada (`20260309000011_conversar_moderacao.sql`).

## 3.6 Corredores (`/corredores`, `/corredores/:slug`)
- Lista com destaque primeiro, capa e cards editoriais.
- Detalhe com:
  - bloco “O que observar aqui”,
  - separação por tipo de relacionamento,
  - preview de `geometry_json` + placeholder robusto.
- API ampliada com `listFeaturedCorridors` e ordenações editoriais.
- Migração dedicada aplicada (`20260309000012_corredores_editorial.sql`).

## 3.7 Transparência (`/transparencia`)
- Módulo funcional e integrado ao fluxo de import/smoke.
- Demos ajustadas para novo contexto territorial.

## 3.8 Compartilhamento social
- Página de compartilhamento para corredores criada em `api/share/corredores.ts`.
- Evento de analytics de share para `kind='corredores'` registrado.

---

## 4) Banco de Dados e Supabase

- **Migrations:** 25 locais / 25 remotas (sincronizadas).
- Novas migrações relevantes:
  - `20260309000011_conversar_moderacao.sql`
  - `20260309000012_corredores_editorial.sql`
- **Edge Functions novas:**
  - `submit-comment`
  - `report-comment`
- `db:push` e `fn:deploy` já executados anteriormente no ciclo, sem falhas bloqueantes.

---

## 5) QA e Testes Automatizados

### 5.1 Smoke backend
- Script `tools/db-smoke.mjs` operacional e passando.

### 5.2 Smoke UI (Playwright)
- Configuração criada (`playwright.config.ts`).
- Suites mínimas criadas para fluxos críticos:
  - `home.spec.ts`
  - `dados.spec.ts`
  - `acervo.spec.ts`
  - `blog.spec.ts`
  - `conversar.spec.ts`
  - `status.spec.ts`
- Script disponível: `npm run test:smoke:ui`.

---

## 6) Publicação Mobile (TWA)

Estrutura de preparação concluída:

- Pasta `twa/` com:
  - `bubblewrap.config.json.example`
  - `README.md`
  - `CHECKLIST.md`
  - `.gitignore`
- Documentação expandida em `docs/TWA.md`.
- Template de Digital Asset Links em:
  - `public/.well-known/assetlinks.json.example`
  - `public/.well-known/README.md`

Estado: **pronto para fase de build/assinatura/publicação**, dependendo de keystore final e ativos de loja.

---

## 7) Adequação Territorial (Volta Redonda / Sul Fluminense)

### 7.1 O que já foi ajustado
- Textos de UI em Conversar e Corredores.
- Conteúdos demo em acervo, blog, coleções, conversas, corredores e transparência.
- Termos críticos ligados ao Rio/Caju removidos do conteúdo operacional principal.

### 7.2 Atenção técnica
- Alguns slugs/chaves históricas de demo foram renomeados; isso é adequado para novo recorte, mas recomenda-se reexecutar carga demo para consistência total no banco remoto.

---

## 8) Riscos e Pontos de Atenção

1. **Mudanças locais ainda não commitadas**: alto volume; importante consolidar em commits temáticos.
2. **Ciclo demo vs produção**: garantir que dados demo não contaminem comunicação externa de produção.
3. **TWA**: falta a etapa final operacional (keystore definitivo, `assetlinks.json` real e publicação na Play Console).
4. **Governança de conteúdo regional**: manter revisão editorial contínua para preservar aderência a Volta Redonda/Sul Fluminense.

---

## 9) Próximos Passos Recomendados (prioridade)

1. **Executar `npm run demo:load`** após as mudanças territoriais para sincronizar demos no banco.
2. **Rodar `npm run test:smoke:ui`** e anexar resultado ao pipeline de release.
3. **Organizar commits por tema** (Corredores, Conversar, TWA, Playwright, territorialização).
4. **Fechar checklist TWA** com keystore final + `assetlinks.json` em produção.
5. **Atualizar relatório institucional principal** para remover menções legadas do Grande Rio onde ainda houver.

---

## 10) Conclusão

O projeto encontra-se em **estado maduro de operação**, com base técnica sólida e validações automatizadas consistentes. As evoluções recentes fortalecem participação cidadã (Conversar), narrativa territorial (Corredores), confiabilidade (smoke UI) e caminho de distribuição mobile (TWA). A transição para o recorte de **Volta Redonda/Sul Fluminense** está bem encaminhada e, com os próximos passos de sincronização e versionamento, o projeto fica pronto para um novo ciclo de publicação com menor risco.
