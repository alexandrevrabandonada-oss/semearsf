# Guia de Deploy e Conteúdo (Repositório-First)

O SEMEAR PWA utiliza uma estratégia de gerenciamento de conteúdo baseada em Git e scripts de importação automáticos. Isso permite manter o histórico de dados no repositório e sincronizar com o banco de dados Supabase sem a necessidade de um painel administrativo complexo.

## Comandos de Deploy (Ship)

### 🚀 Full Ship (Infra + Conteúdo)
Use este comando quando houver mudanças no banco de dados (migrações), nas Edge Functions ou no conteúdo dos arquivos JSON.
```bash
npm run ship:all
```
*Ações realizadas:*
1. Push de novas migrações (`db:push`)
2. Deploy de Edge Functions (`fn:deploy`)
3. Verificação de integridade (`done`)
4. Importação de todo o conteúdo (Acervo, Blog, Transparência)

### 📦 Content Ship (Apenas Conteúdo)
Use este comando para atualizar apenas os dados (posts, despesas, itens do acervo) sem mexer na infraestrutura.
```bash
npm run ship:content
```
*Ações realizadas:*
1. Importação do Acervo (`acervo:import`)
2. Importação do Blog (`blog:import`)
3. Importação da Transparência (`transparency:import`)
4. Verificação final e snapshot (`done`)

## Como Atualizar Conteúdo

1. Edite os arquivos correspondentes em `/data`:
   - `acervo.seed.json`: Itens da biblioteca digital.
   - `blog.seed.json`: Notícias e artigos do blog.
   - `transparencia.links.json`: Links oficiais de órgãos de controle.
   - `transparencia.expenses.json`: Planilha de despesas da emenda.
2. Execute o comando: `npm run ship:content`.
3. Verifique os logs no terminal para confirmar o número de itens inseridos/atualizados.

## Regras de Migração (Banco de Dados)
- Nunca remova arquivos da pasta `supabase/migrations`.
- Use sempre o formato `YYYYMMDDHHMMSS_nome.sql` (14 dígitos).
- Em caso de dúvidas sobre a sincronia, use o Doctor: `npm run db:doctor`.

## Variáveis de Ambiente
Este projeto utiliza **Vite**. Todas as variáveis expostas ao frontend **devem** começar com `VITE_`. O uso de `NEXT_PUBLIC_` é depreciado e causará avisos no pipeline de verificação.

### Env (Vite)
Este projeto utiliza **Vite**. Siga estas regras estritamente:
- **Frontend**: Variáveis que aparecem na UI (como URLs do Supabase no browser) **obrigatoriamente** devem começar com `VITE_`.
- **Legacy**: Nunca use `NEXT_PUBLIC_*`. O Vite não as carrega automaticamente e o pipeline de verificação emitirá avisos.
- **Server/Tools**: Variáveis sensíveis (como `SERVICE_ROLE_KEY`) não devem ter prefixo `VITE_` para evitar exposição acidental.

#### Variáveis de Produção (Vercel)
Além das `VITE_*`, configure:
- `SUPABASE_SERVICE_ROLE_KEY`: Acesso administrativo ao DB.
- `SHARE_HASH_SALT`: Salt para anonimização de IPs no social analytics.
- `INGEST_API_KEY`: Chave de autorização para o ingest de sensores.
- `VAPID_PRIVATE_KEY`: Chave privada para notificações push.

#### Vite Env (Cleanup)
Se você importou um arquivo `.env.local` legado que contém chaves `NEXT_PUBLIC_*`, rode o comando de limpeza para garantir que apenas o padrão Vite seja utilizado e evitar avisos no pipeline:
```bash
npm run env:clean
```
Este comando criará um backup automático e removerá as chaves legadas.
