# Módulo Conversar: Moderação e Anti-spam

Este documento descreve o fluxo de moderação leve e as medidas anti-spam implementadas para o canal de participação pública do SEMEAR.

## Fluxo de Publicação

Para garantir a agilidade sem comprometer a integridade do espaço, os comentários seguem este fluxo:

1.  **Honeypot**: O formulário contém um campo invisível para humanos. Se preenchido (bots), a submissão é rejeitada instantaneamente.
2.  **Rate-limit**: Cada `ip_hash` pode publicar no máximo **3 comentários a cada 10 minutos**.
3.  **Heurísticas**: Comentários muito curtos (< 2 caracteres) ou muito longos (> 2000 caracteres) são marcados como `moderation_status = 'queued'` e não aparecem publicamente até uma revisão manual via DB.
4.  **Publicação**: Comentários que passam pelas validações são inseridos com `moderation_status = 'published'` e ficam visíveis imediatamente.

## Sistema de Denúncia Comunitária

Qualquer usuário pode denunciar um comentário:

-   **Limite de Denúncias**: Quando um comentário atinge **3 denúncias**, ele é automaticamente marcado como `is_hidden = true`.
-   **Remoção Automática**: Itens escondidos param de ser retornados pela API pública para todos os usuários.

## Infraestrutura Técnica

O fluxo é processado via **Supabase Edge Functions** para garantir que segredos como a `SERVICE_ROLE_KEY` (necessária para bypassar RLS e ler `ip_hash` recentes) nunca vazem para o cliente.

### Funções:
-   `submit-comment`: Processa a lógica de anti-spam e inserção.
-   `report-comment`: Gerencia o contador de denúncias e o estado de visibilidade.

### Auditoria:
Os campos `ip_hash` (anonimizado), `user_agent` e `reported_count` permitem que administradores identifiquem padrões de ataque e bloqueiem IPs se necessário diretamente no dashboard do Supabase.
