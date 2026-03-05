# Transparência

## Subir comprovante de despesa

Pré-requisitos:
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` configurados em `.env.local` ou `.env`
- despesa já cadastrada na tabela `public.expenses`

### Opção 1: por ID da despesa

```bash
npm run transparency:upload -- --expense-id <uuid> --file <caminho-do-arquivo>
```

Exemplo:

```bash
npm run transparency:upload -- --expense-id 11111111-2222-3333-4444-555555555555 --file ./docs/nota-fiscal.pdf
```

### Opção 2: por lookup (data + fornecedor + valor)

```bash
npm run transparency:upload -- --date <YYYY-MM-DD> --vendor <nome> --amount <valor_em_reais> --file <caminho-do-arquivo>
```

Exemplos:

```bash
npm run transparency:upload -- --date 2026-03-05 --vendor "Fornecedor X" --amount 123.45 --file ./docs/comprovante.pdf
```

```bash
npm run transparency:upload -- --date 2026-03-05 --vendor "Fornecedor X" --amount 1250,50 --file ./docs/nota-fiscal.pdf
```

Comportamento:
- faz upload no bucket público `transparency`
- organiza o arquivo em `transparency/<year>/<month>/<vendor>-<amount>-<timestamp>.pdf`
- salva a URL pública em `expenses.document_url`
- se o lookup encontrar mais de um resultado, o script interrompe e pede refinamento

## Exportar CSV por filtro

Na página `/transparencia`:
1. aplique filtros de mês/ano/categoria/fornecedor
2. clique em **Baixar CSV**
3. o arquivo exportado respeita os filtros ativos
