# Guia de Deploy e Conteúdo (Repositório-First)

O SEMEAR PWA utiliza uma estratégia de gerenciamento de conteúdo baseada em Git e scripts de importação automáticos. Isso permite manter o histórico de dados no repositório e sincronizar com o banco de dados Supabase sem a necessidade de um painel administrativo complexo.

## Comandos de Deploy (Ship)

### 🚀 Full Ship (Infra + Conteúdo)
Use este comando quando houver mudanças no banco de dados (migrações), nas Edge Functions ou no conteúdo dos arquivos JSON.
```bash
npm run ship:all
```
*Ações realizadas:*
1. Push de novas migrações (`db:push`)
2. Deploy de Edge Functions (`fn:deploy`)
3. Verificação de integridade (`done`)
4. Importação de todo o conteúdo (Acervo, Blog, Transparência)

### 📦 Content Ship (Apenas Conteúdo)
Use este comando para atualizar apenas os dados (posts, despesas, itens do acervo) sem mexer na infraestrutura.
```bash
npm run ship:content
```
*Ações realizadas:*
1. Importação do Acervo (`acervo:import`)
2. Importação do Blog (`blog:import`)
3. Importação da Transparência (`transparency:import`)
4. Verificação final e snapshot (`done`)

### 🧪 Modo Demo Local (Conteúdo e Sensores)
Para testes de UI ou demonstrações para stakeholders, você pode carregar uma massa de dados fictícia completa preenchendo os principais módulos da plataforma (Acervo, Blog, Transparência, Dossiês, Conversar e Corredores Climáticos):

```bash
npm run demo:load
```
*Isto irá injetar conteúdo estático contendo a tag `meta: { demo: true }` no banco através da Service Role, com `upsert` por `slug` nos módulos suportados e resumo final de contagens por módulo no terminal.*

*Resumo esperado ao final do `demo:load`:*
- Acervo
- Blog
- Transparência (links e finanças)
- Dossiês (coleções e vínculos)
- Conversar
- Corredores (itens e vínculos)

Para testes focados especificamente nos painéis de sensores (gerando um histórico imediato de Material Particulado falso na estação `piloto`), execute:
```bash
npm run demo:dados
```

#### Limpando Dados de Demonstração
Todos os artefatos de demonstração são sinalizados nativamente no JSON. Para varrer completamente o seu banco de dados e prepará-lo para Produção, aplique as seguintes queries no painel SQL do Supabase:

```sql
delete from acervo_items where meta->>'demo' = 'true';
delete from blog_posts where meta->>'demo' = 'true';
delete from acervo_collections where meta->>'demo' = 'true';
delete from transparency_expenses where meta->>'demo' = 'true';
delete from transparency_links where meta->>'demo' = 'true';
```

## Como Atualizar Conteúdo

1. Edite os arquivos correspondentes em `/data`:
   - `acervo.seed.json`: Itens da biblioteca digital.
   - `blog.seed.json`: Notícias e artigos do blog.
   - `transparencia.links.json`: Links oficiais de órgãos de controle.
   - `transparencia.expenses.json`: Planilha de despesas da emenda.
2. Execute o comando: `npm run ship:content`.
3. Verifique os logs no terminal para confirmar o número de itens inseridos/atualizados.

## Regras de Migração (Banco de Dados)
- Nunca remova arquivos da pasta `supabase/migrations`.
- Use sempre o formato `YYYYMMDDHHMMSS_nome.sql` (14 dígitos).
- Em caso de dúvidas sobre a sincronia, use o Doctor: `npm run db:doctor`.

## Variáveis de Ambiente
Este projeto utiliza **Vite**. Todas as variáveis expostas ao frontend **devem** começar com `VITE_`. O uso de `NEXT_PUBLIC_` é depreciado e causará avisos no pipeline de verificação.

### Env (Vite)
Este projeto utiliza **Vite**. Siga estas regras estritamente:
- **Frontend**: Variáveis que aparecem na UI (como URLs do Supabase no browser) **obrigatoriamente** devem começar com `VITE_`.
- **Legacy**: Nunca use `NEXT_PUBLIC_*`. O Vite não as carrega automaticamente e o pipeline de verificação emitirá avisos.
- **Server/Tools**: Variáveis sensíveis (como `SERVICE_ROLE_KEY`) não devem ter prefixo `VITE_` para evitar exposição acidental.

#### Variáveis de Produção (Vercel)
Além das `VITE_*`, configure:
- `SUPABASE_SERVICE_ROLE_KEY`: Acesso administrativo ao DB.
- `SHARE_HASH_SALT`: Salt para anonimização de IPs no social analytics.
- `INGEST_API_KEY`: Chave de autorização para o ingest de sensores.
- `VAPID_PRIVATE_KEY`: Chave privada para notificações push.

#### Vite Env (Cleanup)
Se você importou um arquivo `.env.local` legado que contém chaves `NEXT_PUBLIC_*`, rode o comando de limpeza para garantir que apenas o padrão Vite seja utilizado e evitar avisos no pipeline:
```bash
npm run env:clean
```
Este comando criará um backup automático e removerá as chaves legadas.

## Testes de UI (Smoke Tests)

O projeto inclui testes de UI automatizados com Playwright para verificar os fluxos críticos da aplicação.

### Executar Smoke Tests
```bash
npm run test:smoke:ui
```

*Ações realizadas:*
- Inicia o servidor de desenvolvimento automaticamente (se não estiver rodando)
- Executa testes de fumaça nas páginas principais:
  - Página inicial (navegação, blocos de dados)
  - Dados (seletor de estação, visualizações)
  - Acervo (listagem, linha do tempo)
  - Blog (listagem de posts)
  - Conversar (interface de conversas)
  - Status (informações do sistema)

### Quando Executar
- **Opcional**: Antes de fazer deploy de mudanças significativas na UI
- **Recomendado**: Após modificações em componentes de navegação ou layout
- **CI/CD**: Pode ser integrado no pipeline de deployment para validação automática

### Configuração
Os testes são resilientes e não dependem de dados exatos no banco. Eles verificam:
- Presença de elementos principais da interface
- Navegação entre páginas
- Carregamento correto de componentes

**Nota**: Os testes rodam em modo headless por padrão. Para debug visual, use:
```bash
npx playwright test --headed --grep @smoke
```

## CI (GitHub Actions)

O repositório possui pipeline em `.github/workflows/ci.yml`, executado em `push` e `pull_request`.

### Etapas do CI
```bash
npm ci
npm run verify
npm run test:smoke:ui
npm run test:a11y
```

### Playwright no CI
- O workflow instala browsers com `npx playwright install --with-deps chromium`.
- Os testes sobem `vite preview` automaticamente via `playwright.config.ts` usando `http://127.0.0.1:4173`.
- Localmente, o Playwright continua usando `vite dev` por padrão.
