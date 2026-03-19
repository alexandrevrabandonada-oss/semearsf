# Offline

O portal usa cache do navegador para manter partes institucionais e conteúdos já acessados disponíveis quando a conexão cai.

## O que fica disponível

- Navegação entre rotas institucionais já precacheadas pelo service worker.
- Páginas e ativos que já tenham sido carregados anteriormente.
- PDFs de `reports` e `transparency` após o primeiro acesso no dispositivo.
- Thumbs e capas de acervo, relatórios e transparência via cache com atualização em segundo plano.
- Respostas de `api/*` quando houver cache válido da última requisição.

## O que não fica garantido

- Tiles do mapa base externo não são cacheados como fonte primária; sem conexão, o mapa interativo pode ficar incompleto.
- Conteúdo que nunca foi acessado antes pode não abrir sem rede.
- APIs sem resposta prévia em cache continuam dependendo da rede.

## Regras práticas

- Use o banner "Você está offline" como sinal de estado, não como bloqueio total.
- O botão "Tentar novamente" recarrega a página para tentar restabelecer navegação e novas requisições.
- Em `/dados`, `/relatorios/:slug` e `/mapa`, o conteúdo principal continua visível ou degradado de forma segura mesmo sem conexão.

## Limitações

- O cache do navegador tem tamanho finito e pode ser limpo pelo usuário ou pelo sistema operacional.
- PDFs e imagens dependem de terem sido acessados ao menos uma vez para entrarem no cache runtime.
- O fallback offline é uma garantia de degradação graciosa, não de disponibilidade total.
