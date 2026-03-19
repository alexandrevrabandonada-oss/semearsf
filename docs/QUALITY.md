# Quality Gates

## Metas

- Performance: >= 90
- PWA: >= 95
- Accessibility: >= 95
- Best Practices: >= 95

## Como usar

1. Rode `npm run audit:lighthouse`.
2. Abra os relatórios em `reports/lighthouse/<timestamp>/`.
3. Compare os resultados com as metas acima.

## Se cair abaixo da meta

- Performance
  - Revise `reports/state.md` e o resumo de chunks.
  - Corte dependências eager e mova telas pesadas para lazy.
  - Verifique imagens grandes, gráficos e bundles de API.

- PWA
  - Confirme `manifest`, `service worker` e offline fallback.
  - Verifique se rotas institucionais continuam precacheadas.
  - Confirme que assets críticos têm cache runtime adequado.

- Accessibility
  - Rode `npm run test:a11y`.
  - Revise headings, labels, skip links, foco visível e contrastes.
  - Corrija páginas com diálogos, listas e tabelas sem semântica.

- Best Practices
  - Procure erros de console, mixed content e links quebrados.
  - Revise uso de `target="_blank"`, `rel="noopener noreferrer"` e APIs inseguras.
  - Verifique se as páginas públicas seguem o padrão institucional.

## Nota operacional

Os relatórios do Lighthouse são gerados localmente e não devem ser versionados.
