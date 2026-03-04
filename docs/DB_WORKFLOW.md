# DB Workflow (Repo-First)

## Regra principal
- Nunca usar SQL Editor para alterar schema.
- Toda mudanca de banco deve entrar em `supabase/migrations/*.sql`.

## Fluxo padrao
1. Criar/editar migration idempotente em `supabase/migrations/`.
2. Validar localmente (quando aplicavel) com Supabase CLI.
3. Aplicar no projeto com `db push`.
4. Versionar a migration no Git junto do codigo que depende dela.

## Comandos
- `npm run db:status`
- `npm run db:push`
- `npm run db:types`
- `npm run done`

## Setup minimo de CLI
1. `npx supabase init` (se ainda nao existir `supabase/config.toml`)
2. `npx supabase login --token <SUPABASE_ACCESS_TOKEN>`
3. `npx supabase link --project-ref <PROJECT_REF> -p <DB_PASSWORD>`

## Boas praticas
- Sempre usar SQL idempotente (`if not exists`, `drop policy if exists`, etc.).
- Ao mudar nomes de colunas, alinhar migration + API + paginas no mesmo commit.
- Nao expor `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Secrets de Edge Function devem ser configurados via CLI/Dashboard, nunca hardcoded.
