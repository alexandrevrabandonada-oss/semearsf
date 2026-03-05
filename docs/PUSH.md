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

## Alertas Automáticos (Threshold-Based)

A Edge Function `ingest-measurement` dispara notificações automaticamente quando medições excedem limites configurados.

### Regras de Disparo

Cada subscription (`push_subscriptions`) possui:

- **`pm25_threshold`** (padrão: 35 µg/m³): Limite para PM2.5
- **`pm10_threshold`** (padrão: null/desabilitado): Limite para PM10
- **`station_code_filter`** (padrão: null): Se definido, alerta apenas para estação específica
- **`cooldown_minutes`** (padrão: 120 min): Intervalo mínimo entre alertas consecutivos
- **`quiet_start`** e **`quiet_end`** (padrão: "22:00" - "07:00"): Horário de silêncio

### Quiet Hours (Horário de Silêncio)

Durante o período entre `quiet_start` e `quiet_end`, **nenhum alerta** é enviado.

Exemplos:
- `quiet_start: "22:00"`, `quiet_end: "07:00"` → Sem alertas das 22h às 7h
- `quiet_start: "00:00"`, `quiet_end: "00:00"` → Alertas 24h

⚠️ **Nota**: O cálculo usa horário UTC do servidor. Ajuste conforme necessário.

### Cooldown (Intervalo de Segurança)

Após um alerta ser disparado, a subscription entra em **cooldown**. Novos alertas só serão enviados após `cooldown_minutes` minutos.

Exemplo:
- `cooldown_minutes: 120` → Próximo alerta somente após 2 horas

Isso evita spam de notificações para medições consecutivas acima do limite.

### Filtro por Estação

Se `station_code_filter` estiver definido, a subscription receberá alertas **apenas** dessa estação.

Exemplo:
- `station_code_filter: "vr-centro-01"` → Alertas apenas da estação VR Centro

Se `null`, recebe alertas de todas as estações ativas.

### Log de Eventos (push_events)

Todos os alertas disparados são registrados na tabela `push_events`:

- **`ts`**: Timestamp da medição que triggou o alerta
- **`station_code`**: Código da estação
- **`pollutant`**: Poluente que excedeu limite (PM2.5 ou PM10)
- **`value`**: Valor medido (µg/m³)
- **`triggered`**: Se notificações foram enviadas
- **`reason`**: Contexto (threshold, subscriptions ativas, etc.)

⚠️ **Privacidade**: Esta tabela **NÃO contém dados pessoais** (endpoints, p256dh, auth).

Você pode visualizar estatísticas de alertas em `/status`.

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
