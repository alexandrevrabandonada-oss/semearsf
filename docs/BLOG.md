# Redação e Importação de Blog

Este guia explica como gerenciar o conteúdo do **Blog da Emenda** via repositório.

## Estrutura do Post

O blog utiliza `data/blog.seed.json`. Cada item deve seguir esta estrutura:

- `slug`: Identificador único (URL). Ex: `titulo-do-post`.
- `title`: Título principal.
- `excerpt`: Breve resumo (aparece na lista).
- `content_md`: Conteúdo em Markdown (suporta negrito, itálico e quebras de linha básicas).
- `tags`: Array de strings (ex: `["tecnica", "relatorio"]`).
- `published_at`: Data ISO (YYYY-MM-DDTHH:mm:ssZ).
- `status`: `published` ou `draft`.
- `cover_url`: Link para imagem de capa.

## Regras de Mídia

> [!IMPORTANT]
> **Nunca comite arquivos PDF ou imagens pesadas diretamente no repositório Git.**
> 1. Para imagens, utilize serviços externos ou o Supabase Storage.
> 2. Para PDFs, utilize links externos.

## Como Importar

1. Edite o arquivo `data/blog.seed.json`.
2. Certifique-se de que o `.env.local` possui `SUPABASE_SERVICE_ROLE_KEY`.
3. Execute o comando:
   ```bash
   npm run blog:import
   ```

A importação utiliza `upsert` baseado no `slug`, então editar um item existente no JSON e rodar o comando atualizará o conteúdo no banco de dados.
