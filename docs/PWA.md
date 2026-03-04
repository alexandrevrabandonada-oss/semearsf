# Suporte PWA e Offline (SEMEAR PWA)

Este portal foi desenvolvido como um **Progressive Web App (PWA)**, permitindo instalação em dispositivos móveis e desktop, além de oferecer funcionalidades offline resilientes.

## O que funciona Offline?

- **Interface Base**: Menu, navegação e placeholders são carregados instantaneamente via Service Worker.
- **Páginas Consultadas**: Se você já visitou uma página (ex: "Sobre" ou "Dados"), ela será servida do cache se você estiver sem conexão.
- **Mídia do Acervo**:
  - **Imagens**: São cacheadas permanentemente no primeiro carregamento (`CacheFirst`).
  - **PDFs**: São armazenados em cache, mas o sistema tenta sempre buscar a versão mais recente da rede (`NetworkFirst`).

## Limitações Conhecidas

- **Arquivos Grandes**: PDFs muito pesados podem demorar para serem cacheados no primeiro acesso. Certifique-se de abri-los pelo menos uma vez com internet para garantir a disponibilidade offline.
- **Dados em Tempo Real**: Os gráficos de monitoramento requerem conexão ativa para atualizar. Em modo offline, você verá os últimos dados visualizados.

## Como Testar a Experiência Offline

1. Abra o **Chrome DevTools** (F12).
2. Vá para a aba **Application**.
3. No menu lateral, clique em **Service Workers**.
4. Marque a caixa **Offline**.
5. Recarregue a página ou navegue pelo acervo para ver o cache em ação.

---
*Dica: Para instalar o app, procure pelo botão "Instalar" no menu superior ou use a opção "Adicionar à tela de início" do seu navegador.*
