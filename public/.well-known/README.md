# Digital Asset Links

Este arquivo (`assetlinks.json`) é necessário para vincular o domínio web ao aplicativo Android TWA.

## Como usar

1. **Copie o arquivo de exemplo:**
   ```bash
   cp assetlinks.json.example assetlinks.json
   ```

2. **Obtenha o SHA-256 fingerprint do seu keystore:**
   ```bash
   keytool -list -v -keystore twa/android.keystore -alias semear-key
   ```

3. **Atualize `assetlinks.json`:**
   - Substitua `package_name` pelo seu package único (ex: `br.org.semear.pwa`)
   - Substitua o SHA-256 fingerprint pelo gerado no passo 2

4. **Deploy:**
   - Este arquivo DEVE estar acessível em: `https://seu-dominio.com/.well-known/assetlinks.json`
   - DEVE retornar `Content-Type: application/json`
   - DEVE ser público (sem autenticação)

5. **Validar:**
   - Use [Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

## Troubleshooting

Se o TWA mostrar barra de endereço:
- Verifique se o arquivo está acessível: `curl https://seu-dominio.com/.well-known/assetlinks.json`
- Confirme Content-Type correto
- Valide SHA-256 fingerprint
- Aguarde até 24h para propagação
- Limpe cache do Chrome

## Mais informações

Consulte `/docs/TWA.md` para o guia completo de publicação Android.
