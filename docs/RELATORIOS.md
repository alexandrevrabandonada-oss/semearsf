# Relatorios

## Objetivo
Este modulo publica documentos oficiais em PDF no SEMEAR.

## 1) Criar/editar metadados em `data/reports.seed.json`

O arquivo deve ser um array JSON. Cada item representa um relatorio e usa `slug` como chave de upsert.

Exemplo:

```json
[
  {
    "slug": "qualidade-do-ar-2026",
    "title": "Relatorio de Qualidade do Ar 2026",
    "summary": "Sintese tecnica anual das medicoes e tendencias.",
    "published_at": "2026-03-05",
    "year": 2026,
    "pdf_url": null,
    "cover_url": null,
    "tags": ["qualidade-do-ar", "tecnico"]
  }
]
```

Campos principais:
- `slug`: identificador unico e estavel (URL)
- `title`: titulo publico
- `summary`: resumo curto
- `published_at`: data de publicacao (`YYYY-MM-DD`)
- `year`: ano de referencia
- `pdf_url`: URL publica do PDF (pode iniciar `null`)
- `cover_url`: capa opcional
- `tags`: array de tags

## 2) Importar metadados no banco

```bash
npm run reports:import
```

Esse comando faz upsert por `slug` na tabela `reports`.

## 3) Subir o PDF e atualizar `pdf_url`

```bash
npm run reports:upload -- --slug <slug> --file <caminho_pdf>
```

Com titulo opcional no mesmo comando:

```bash
npm run reports:upload -- --slug <slug> --file <caminho_pdf> --title "Novo titulo"
```

Comportamento do upload:
- bucket: `reports`
- path no storage: `<slug>/<timestamp>-<filename>`
- atualiza `reports.pdf_url` com URL publica
- se `--title` for informado, atualiza `reports.title`

## 4) Ship dedicado de relatorios

```bash
npm run ship:reports
```

Executa:
- `npm run reports:import`
- `npm run done`