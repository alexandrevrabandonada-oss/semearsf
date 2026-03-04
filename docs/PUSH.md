# Notificações Push (SEMEAR PWA)

O portal utiliza Web Push Notifications para alertar os usuários sobre atualizações críticas e avisos de qualidade do ar.

## Configuração Inicial (VAPID)

Para que o serviço funcione, você deve gerar um par de chaves VAPID.

1.  **Gerar Chaves**:
    ```bash
    node tools/vapid-gen.mjs
    ```
2.  **Configurar Frontend**: No seu `.env.local`, adicione a chave pública:
    ```env
    VITE_VAPID_PUBLIC_KEY="sua_chave_publica_aqui"
    ```
3.  **Configurar Supabase**: No painel do Supabase (Settings > Edge Functions), adicione as Secrets:
    - `VAPID_PUBLIC_KEY`
    - `VAPID_PRIVATE_KEY`
    - `INGEST_API_KEY` (utilizada para autorizar o disparo de notificações)

## Workflow de Inscrição

1.  O usuário acessa a rota `/alertas`.
2.  O navegador solicita permissão (`Notification.requestPermission`).
3.  Se aceito, o Service Worker gera uma `PushSubscription`.
4.  A inscrição é enviada para a Edge Function `register-push`, que a armazena no banco de dados.

## Como Testar Notificações

Você pode disparar uma notificação de teste para todos os usuários ativos usando a Edge Function `test-push`.

Exemplo via `curl`:
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/test-push \
  -H "Authorization: Bearer [SEU_INGEST_API_KEY]" \
  -H "Content-Type: application/json"
```

---
*Nota: Certifique-se de que o Service Worker está registrado e ativo (veja docs/PWA.md).*
