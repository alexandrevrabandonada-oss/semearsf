# Guia do Acervo

Este documento detalha o processo editorial de ingestão, publicação e manutenção dos itens do Acervo Vivo SEMEAR.

## Publicação rápida via Demo

Para carregar dados demonstrativos de todo o projeto, execute:
```
node tools/demo-load.mjs
```
Este script usa `SUPABASE_SERVICE_ROLE_KEY` e não pode ser usado em ambiente público.

---

## Upload de Mídias

Utilize o script `tools/acervo-upload.mjs` para enviar arquivos para um item do acervo.

### Uso básico
```bash
node tools/acervo-upload.mjs \
  --slug <slug-do-item> \
  --file <caminho/para/arquivo.jpg> \
  --kind image \
  --title "Descrição da imagem"
```

### Flags
| Flag | Descrição |
|---|---|
| `--slug` | Slug do item no banco de dados |
| `--file` | Caminho local do arquivo a ser enviado |
| `--kind` | Tipo de mídia: `pdf` ou `image` |
| `--title` | Título descritivo exibido na galeria |
| `--cover true` | Define a URL subida como `cover_url` principal |
| `--small-url <url>` | Define explicitamente o `cover_small_url` (versão reduzida) |
| `--thumb-url <url>` | Define explicitamente o `cover_thumb_url` (versão miniatura) |

---

## Capas Otimizadas

O SEMEAR PWA suporta **três tamanhos de capa** para minimizar o consumo de dados em diferentes contextos:

| Campo | Uso recomendado | Dimensões sugeridas |
|---|---|---|
| `cover_url` | Página de detalhe do item (OG tag, full display) | 1200×630px |
| `cover_small_url` | Listagens e dossiês (cards médios) | 600×315px |
| `cover_thumb_url` | Home, Linha do Tempo (miniaturas em grid) | 300×158px |

### Como funciona o fallback no frontend

O `src/lib/imageOptimization.ts` exporta a função `getOptimizedCover(item, context)`.

- `context = 'thumb'`: Usa `cover_thumb_url → cover_small_url → cover_url`.
- `context = 'small'`: Usa `cover_small_url → cover_url`.
- `context = 'cover'`: Usa `cover_url`.

Se a versão solicitada não existir, a função retorna a próxima disponível automaticamente.

### Exemplo de workflow completo de capas

1. **Enviar a imagem principal** e definir como capa:
   ```bash
   node tools/acervo-upload.mjs --slug relatorio-ar-2024 --file cover.jpg --kind image --cover true
   ```
   Isso define `cover_url` e faz o upload do arquivo.

2. **Definir versões reduzidas** (após otimizar externamente via Squoosh, ImageMagick, etc.):
   ```bash
   node tools/acervo-upload.mjs --slug relatorio-ar-2024 --file cover-small.jpg --kind image \
     --small-url https://exemplo.supabase.co/.../cover-small.jpg

   node tools/acervo-upload.mjs --slug relatorio-ar-2024 --file cover-thumb.jpg --kind image \
     --thumb-url https://exemplo.supabase.co/.../cover-thumb.jpg
   ```

> **Integração automática ativa:** Quando `cover_small_url` e `cover_thumb_url` não estão definidos no banco, o `getOptimizedCover()` **auto-gera** a URL transformada diretamente via Supabase Storage Transform API (`/render/image/public/`). Para imagens externas (não hospeadas no Supabase Storage), a URL original é retornada como fallback.

---

## Estrutura de Campos Relevantes

| Campo | Tipo | Descrição |
|---|---|---|
| `slug` | text unique | Identificador único do item |
| `kind` | enum | `paper`, `news`, `video`, `photo`, `report`, `link` |
| `cover_url` | text | URL pública da capa original |
| `cover_small_url` | text | URL pública da capa reduzida |
| `cover_thumb_url` | text | URL pública da miniatura |
| `media` | jsonb | Array de mídias associadas ao item |
| `featured` | boolean | Se `true`, aparece nos destaques da Home |
| `meta.demo` | boolean | Se `true`, indica dado de demonstração |
