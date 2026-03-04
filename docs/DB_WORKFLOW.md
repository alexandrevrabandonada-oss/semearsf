# Fluxo de Banco de Dados (DB Workflow) - SEMEAR PWA

Este projeto utiliza o Supabase CLI para gerenciar migrações de banco de dados. Para garantir a integridade entre ambientes local e remoto, siga estas diretrizes.

## Nomenclatura de Migrações

Todas as novas migrações **devem** seguir o padrão de 14 dígitos (timestamp) da CLI:
`YYYYMMDDHHMMSS_descricao_da_mudanca.sql`

Exemplo: `20260308000001_relatorio_gastos.sql`

> [!IMPORTANT]
> **Não renomeie migrações antigas**: Se uma migração já foi aplicada em produção (remoto), renomeá-la localmente causará conflitos de histórico. O `Migration Doctor` avisará sobre nomes fora do padrão, mas isso deve ser tratado apenas para **novas** migrações.

## Ferramenta de Diagnóstico (Doctor)

Se você encontrar erros de "diverging history" ou "out of sync", use:
```bash
npm run db:doctor
```

O Doctor realiza:
1. **Status Check**: Verifica se o DB local está rodando e se a CLI está vinculada.
2. **CLI Scan**: Tenta listar migrações via Supabase CLI.
3. **FS Fallback**: Se o CLI falhar, ele analisa a pasta `supabase/migrations` diretamente para garantir que os arquivos estão presentes.
4. **Naming Lint**: Alerta sobre arquivos que não seguem o padrão de 14 dígitos.

## Aplicando Mudanças

1. Crie a migração localmente ou edite o schema.
2. Teste no banco local.
3. Para subir para o ambiente remoto:
   ```bash
   npm run db:push
   ```
4. Após o push bem-sucedido, rode `npm run done` para verificar a integridade geral.

---
*Nota: A integridade do banco é crítica para o funcionamento do PWA e das Edge Functions.*
