# Deploy Infra e Edge Function

Checklist de deploy sem expor segredos no repositório.

## 1) Login e link do projeto

```bash
npx supabase login --token "$SUPABASE_ACCESS_TOKEN"
npx supabase link --project-ref <project-ref> -p <db-password>
```

## 2) Aplicar migrations

```bash
npm run db:push
```

## 3) Definir secrets da Edge Function

Crie `.env.local` (ou `.env`) com:

```dotenv
INGEST_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Execute:

```bash
npm run secrets:set
```

## 4) Deploy da Edge Function

```bash
npm run fn:deploy
```

## 5) Teste de ingestao

```bash
npm run simulate:sensor
```

Se o script retornar sucesso, a pipeline de ingestao esta operacional.
