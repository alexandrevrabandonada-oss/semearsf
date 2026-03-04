# Acervo SEMEAR - Guia de Importação

Este documento explica como gerenciar e importar itens para o Acervo Vivo sem usar painéis administrativos.

## 1. O Arquivo de Dados

Os dados estão no arquivo `data/acervo.seed.json`.

### Formato esperado:
```json
{
  "kind": "paper | news | video | photo | report | link",
  "title": "Título do Item",
  "slug": "url-amigavel-unica",
  "excerpt": "Resumo curto (opcional)",
  "source_name": "Nome da Fonte (opcional)",
  "source_url": "URL da Fonte (opcional)",
  "published_at": "YYYY-MM-DD (opcional)",
  "tags": ["tag1", "tag2"],
  "content_md": "Conteúdo em Markdown (opcional)",
  "meta": { "chave": "valor" }
}
```

### Regras importantes:
- **Não armazene PDFs no repositório**: Use o campo `source_url` para apontar para o arquivo hospedado (ex: Google Drive, site da UFF, etc).
- **Slug único**: O slug é usado para identificar o item. Se você mudar os dados de um slug existente, o script fará um **UPSERT** (atualização).

## 2. Como Importar

### Pré-requisitos
No arquivo `.env.local`, você deve ter as seguintes chaves configuradas:
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (Chave de serviço para permissão de escrita)

### Comando
Para sincronizar o arquivo JSON com o banco de dados:

```bash
npm run acervo:import
```

O script informará quantos itens foram inseridos/atualizados e se houve algum erro.

## 3. Verificação
Após a importação, os itens estarão visíveis no portal em:
- `/acervo` (Hub principal)
- `/acervo/artigos`
- `/acervo/noticias`
- `/acervo/midias`
