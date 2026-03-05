# TWA - Trusted Web Activity (Android App)

Guia completo para publicar o SEMEAR PWA como aplicativo nativo Android na Google Play Store usando TWA (Trusted Web Activity).

## O que é TWA?

TWA (Trusted Web Activity) permite empacotar um PWA como aplicativo Android nativo, sem precisar reescrever código. O app usa Chrome Custom Tabs nativo e mantém 100% de compatibilidade com o PWA web.

## Pré-requisitos

### Infraestrutura
- ✅ PWA publicado em produção com HTTPS
- ✅ Domínio próprio configurado (ex: `semear.org.br`)
- ✅ Service Worker ativo e funcional
- ✅ Manifest.json válido e acessível

### Ferramentas
- Node.js 18+ e npm
- Java JDK 17+ (configurar `JAVA_HOME`)
- Android SDK (via Android Studio ou CLI)
- Bubblewrap CLI: `npm install -g @bubblewrap/cli`

### Google Play Console
- Conta de desenvolvedor Google Play ($25 taxa única)
- Acesso à [Play Console](https://play.google.com/console)

## Checklist Completo de Publicação

### 1. Domínio e HTTPS ✅

**Requisitos:**
- Domínio em produção com certificado SSL válido
- PWA acessível via HTTPS
- Service Worker registrado corretamente

**Verificação:**
```bash
# Testar manifest
curl -I https://seu-dominio.com/manifest.webmanifest

# Testar assetlinks
curl https://seu-dominio.com/.well-known/assetlinks.json
```

### 2. Package Name (Identificador Único)

**Formato:** Reverse domain (ex: `br.org.semear.pwa`)

**Regras:**
- Deve ser único na Play Store
- Não pode ser alterado depois da publicação
- Segmentos separados por ponto
- Apenas letras minúsculas, números e underscores

**Sugestões:**
```
br.org.semear.pwa
br.org.semear.mobile
org.semear.app
```

### 3. Asset Links (Digital Asset Links)

**Arquivo:** `public/.well-known/assetlinks.json`

Este arquivo vincula seu domínio ao app Android e permite que o TWA abra sem barra de endereço.

**Passos:**

1. **Gerar SHA-256 fingerprint do keystore:**
   ```bash
   keytool -list -v -keystore android.keystore -alias semear-key
   ```

2. **Copiar o fingerprint SHA-256** (sem os dois-pontos)

3. **Criar `assetlinks.json`:**
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "br.org.semear.pwa",
       "sha256_cert_fingerprints": [
         "COLE_SEU_SHA256_AQUI"
       ]
     }
   }]
   ```

4. **Deploy do arquivo:**
   - Deve estar em: `https://seu-dominio.com/.well-known/assetlinks.json`
   - Deve retornar `Content-Type: application/json`
   - Deve ser acessível publicamente (sem autenticação)

5. **Validar:**
   - Use [Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

### 4. Ícones Obrigatórios

**Ícone Padrão:**
- Tamanho: 512x512px
- Formato: PNG com fundo sólido
- Margens: 0px (full bleed)
- Localização: `public/icons/icon-512x512.png`

**Ícone Maskable (Adaptativo):**
- Tamanho: 512x512px
- Formato: PNG com safe area
- Safe area: Conteúdo importante dentro de círculo central
- Margens: 20% em todas as direções
- Localização: `public/icons/icon-maskable-512x512.png`

**Gerador recomendado:**
- [Maskable.app](https://maskable.app/editor)

**Feature Graphic (opcional, mas recomendado):**
- Tamanho: 1024x500px
- Usado na Play Store como banner

### 5. Screenshots Para Play Store

**Requisitos mínimos:**
- Pelo menos 2 screenshots
- Formatos aceitos: PNG ou JPEG
- Tamanhos aceitos:
  - Phone: 320px - 3840px (maior lado)
  - Tablet: 1080px - 7680px (maior lado)
  
**Recomendações:**
- 4-6 screenshots mostrando funcionalidades principais
- Use dispositivos reais ou emuladores
- Capture em resoluções modernas (1080x2400, 1440x3200)

**Páginas a capturar:**
- Home (dashboard com dados)
- Dados/Monitoramento
- Acervo
- Blog
- Página de detalhe de item
- Funcionalidades offline (se aplicável)

**Ferramentas:**
- Chrome DevTools (Device Mode)
- Android Studio Emulator
- [Screely](https://screely.com/) para adicionar molduras

### 6. Texto e Metadados da Play Store

**Título do App:**
- Máximo: 50 caracteres
- Sugestão: "SEMEAR - Ciência Aberta"

**Descrição Curta:**
- Máximo: 80 caracteres
- Sugestão: "Monitore clima, explore acervo científico e participe da comunidade SEMEAR"

**Descrição Completa:**
- Máximo: 4000 caracteres
- Incluir:
  - O que é o SEMEAR
  - Funcionalidades principais
  - Benefícios do app
  - Informações sobre offline/notificações

**Exemplo:**
```
SEMEAR (Sistema de Monitoramento Ecológico e Acervo de Registros) é uma plataforma de ciência aberta que une monitoramento ambiental em tempo real com um acervo digital colaborativo.

🌡️ DADOS EM TEMPO REAL
- Acompanhe estações de monitoramento climático
- Visualize gráficos de temperatura, umidade e qualidade do ar
- Alertas de eventos climáticos extremos

📚 ACERVO DIGITAL
- Explore documentos, fotos e vídeos históricos
- Navegue por linha do tempo interativa
- Dossiês temáticos curados

🗣️ PARTICIPAÇÃO COMUNITÁRIA
- Contribua com conversas e comentários
- Compartilhe observações locais
- Conecte-se com outros interessados

✨ FUNCIONA OFFLINE
- Acesse conteúdo mesmo sem conexão
- Receba notificações push de eventos importantes
- Sincronização automática quando online

O SEMEAR é um projeto de memória pública e engajamento científico desenvolvido para promover transparência e participação cidadã na gestão ambiental.
```

### 7. Configuração do Bubblewrap

**Arquivo:** `twa/bubblewrap.config.json`

Configurações importantes:
```json
{
  "host": "seu-dominio.com",
  "packageId": "br.org.semear.pwa",
  "name": "SEMEAR",
  "launcherName": "SEMEAR",
  "themeColor": "#18A572",
  "backgroundColor": "#0A1F1A",
  "enableNotifications": true
}
```

### 8. Build e Geração do AAB

**Comandos:**

```bash
# Navegar para pasta TWA
cd twa

# Inicializar (primeira vez)
bubblewrap init --manifest=https://seu-dominio.com/manifest.webmanifest

# Criar keystore (primeira vez)
bubblewrap update

# Build do AAB para Play Store
bubblewrap build

# O arquivo será gerado em:
# ./app-release-bundle.aab
```

**⚠️ IMPORTANTE: Backup do Keystore**
O arquivo `android.keystore` é crítico. Se você perder este arquivo:
- Não poderá atualizar o app na Play Store
- Precisará criar um novo app com package name diferente
- **Faça backup seguro e criptografado!**

### 9. Upload na Play Console

**Passos:**

1. **Criar App:**
   - Acesse [Play Console](https://play.google.com/console)
   - Clique em "Criar app"
   - Preencha nome, idioma padrão, tipo (gratuito/pago)
   - Aceite declarações de política

2. **Configurar Página da Loja:**
   - Detalhes do app (título, descrição)
   - Ícone do app (512x512)
   - Feature graphic (1024x500)
   - Screenshots (phone e tablet)
   - Categoria: Educação ou Ferramentas
   - Detalhes de contato

3. **Criar Release (Testes Internos/Fechados):**
   - Internal testing ou Closed testing
   - Upload do `.aab`
   - Preencher notas da versão

4. **Questionário de Conteúdo:**
   - Classificação etária
   - Privacidade e segurança
   - App content (anúncios, compras)

5. **Configurar Assinatura do App:**
   - Play App Signing (gerenciado pelo Google)
   - Fazer upload do keystore ou deixar Google criar

6. **Revisar e Publicar:**
   - Revisar todas as seções
   - Enviar para revisão
   - Aguardar aprovação (1-7 dias)

### 10. Pós-Publicação

**Atualizar versão:**
```json
// bubblewrap.config.json
{
  "appVersionName": "1.0.1",  // Semântico
  "appVersionCode": 2          // Incremental
}
```

**Build de atualização:**
```bash
bubblewrap build
```

**Publicar update:**
- Upload do novo `.aab` na Play Console
- Criar nova release em "Production" ou "Internal Testing"
- Preencher changelog
- Enviar para revisão

## Testes Antes da Publicação

### Checklist de QA:

- [ ] App abre sem barra de endereço (full screen)
- [ ] Navegação funciona corretamente
- [ ] Service Worker cacheia recursos
- [ ] Modo offline funciona
- [ ] Notificações push funcionam
- [ ] Links externos abrem em Chrome Custom Tabs
- [ ] Deep links funcionam (/dados, /acervo, etc.)
- [ ] Ícone adaptativo aparece corretamente
- [ ] Splash screen personalizada aparece
- [ ] Sem erros no Logcat

**Comando para testar APK local:**
```bash
adb install app-release-signed.apk
adb logcat | grep "chromium"
```

## Troubleshooting

### "Digital Asset Links verification failed"
**Solução:**
1. Verifique se `assetlinks.json` está acessível: `curl https://seu-dominio.com/.well-known/assetlinks.json`
2. Confirme que retorna `Content-Type: application/json`
3. Valide SHA-256 fingerprint: `keytool -list -v -keystore android.keystore`
4. Use [Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

### App abre com barra de navegação
- Verifique Digital Asset Links
- Aguarde até 24h para propagação do DNS/verificação
- Teste em modo incógnito ou limpe cache do Chrome

### Keystore password esquecida
**Não há recuperação!** Se perdeu:
- Crie novo keystore
- Gere novo app com package name diferente
- Publique como app novo (não é update)

### Build falha com erro de Java
- Verifique `JAVA_HOME`: `echo $JAVA_HOME`
- Use JDK 17 ou superior
- Reinstale Android SDK se necessário

### Screenshots rejeitados
- Use resoluções mínimas: 1080x2400 para phone, 1200x2000 para tablet
- Não inclua bordas de dispositivo simuladas
- Evite texto muito pequeno
- Mostre conteúdo real, não placeholders

## Recursos Adicionais

### Ferramentas
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWABuilder](https://www.pwabuilder.com/)
- [Maskable Icon Editor](https://maskable.app/editor)
- [Asset Links Generator](https://developers.google.com/digital-asset-links/tools/generator)

### Documentação
- [TWA Quick Start](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

### Validação
- [Lighthouse PWA Audit](https://web.dev/measure/)
- [Chrome Flags TWA](chrome://flags/#enable-twa-quality-enforcement)

## Cronograma Estimado

| Etapa | Duração |
|-------|---------|
| Preparar assets (ícones, screenshots) | 2-4 horas |
| Configurar Bubblewrap e gerar AAB | 1-2 horas |
| Criar entrada na Play Console | 1 hora |
| Configurar página da loja | 2-3 horas |
| Revisão do Google | 1-7 dias |
| **Total** | ~1 semana |

## Contato e Suporte

Para questões específicas do SEMEAR TWA:
- Consulte `/twa/README.md` para guia resumido
- Revise configuração em `twa/bubblewrap.config.json.example`
- Valide `assetlinks.json.example` antes do deploy

