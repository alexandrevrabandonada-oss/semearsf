# Gestão do Acervo Digital (Media Pipeline)

O acervo do portal SEMEAR PWA suporta diversos tipos de mídia (PDFs, Imagens, Links) associados a cada item curriculado.

## Workflow Repository-First

O conteúdo textual é gerido em `data/acervo.json` (ou importado via S3/API), mas arquivos de mídia pesada devem ser enviados para o **Supabase Storage**.

### Upload de Arquivos via CLI

Use o script `acervo:upload` para enviar arquivos e atualizar o banco de dados automaticamente.

#### Exemplo 1: Adicionar um PDF
```bash
npm run acervo:upload -- --slug meu-item-estudo --file "C:\caminho\documento.pdf" --kind pdf --title "Relatório Técnico 2026"
```

#### Exemplo 2: Definir Capa (Imagem)
```bash
npm run acervo:upload -- --slug galeria-fotos-evento --file "C:\caminho\capa.jpg" --kind image --cover true
```

### Parâmetros Suportados

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `--slug`  | Sim         | O slug identificador do item no acervo (ex: `meu-item`). |
| `--file`  | Sim         | Caminho absoluto para o arquivo no seu computador. |
| `--kind`  | Sim         | Tipo de mídia: `pdf` ou `image`. |
| `--title` | Não         | Título descritivo do arquivo (padrão é o nome do arquivo). |
| `--cover` | Não         | Se `true`, define este arquivo como `cover_url` do item. |

## Dossiês (Coleções Temáticas)

Dossiês são agrupamentos curados de itens do acervo. O gerenciamento de coleções e seus vínculos com os itens é feito via repository-first:
1. Cadastre os dossiês e sues metadados básicos no arquivo `data/collections.seed.json`.
2. Defina os vínculos específicos entre `collection_slug` e `item_slug` com suas ordenações no arquivo `data/collection_items.seed.json`.
3. Aplique as configurações ao banco de dados rodando:

```bash
npm run collections:import
```

---
*Nota: Este workflow substitui a necessidade de um painel administrativo para upload e curadoria inicial, mantendo o controle via repositório/cli.*
