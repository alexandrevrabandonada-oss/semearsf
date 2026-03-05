# Guia de Empacotamento Android (TWA)

Este documento detalha o checklist necessário para transformar o SEMEAR PWA em um aplicativo nativo Android via **Trusted Web Activity (TWA)** para publicação na Google Play Store.

## 1. Definições do Aplicativo
- **App Name**: SEMEAR
- **Suggested Package Name**: `br.org.semear.portal`
- **Theme Color**: `#00e5ff` (Ciano)
- **Background Color**: `#0a0a0a` (Preto/Fundo)

## 2. Configuração de Domínio (Asset Links)
Para que o Chrome não exiba a barra de endereços (URL bar) dentro do aplicativo, o domínio web deve provar que é dono do aplicativo Android.

1.  Renomeie `public/.well-known/assetlinks.json.example` para `public/.well-known/assetlinks.json`.
2.  Substitua o `package_name` pelo ID real do seu app (ex: `br.org.semear.portal`).
3.  Substitua o array `sha256_cert_fingerprints` pela assinatura digital do seu keystore de release.
4.  Realize o deploy (versão web) para que a URL `https://tudominio.com/.well-known/assetlinks.json` seja publicamente acessível (HTTP 200, Content-Type: application/json).

## 3. Empacotamento com PWABuilder / Bubblewrap
Recomendamos o uso do **Bubblewrap** CLI (oficial da Google) ou o portal **PWABuilder**.

### Via Bubblewrap CLI
1. Instale o Bubblewrap CLI:
   `npm i -g @GoogleChromeLabs/bubblewrap`
2. Inicialize o projeto apontando para a URL de produção do PWA:
   `bubblewrap init --manifest https://tudominio.com/manifest.webmanifest`
3. Siga o assistente interativo:
   - Defina o package name (`br.org.semear.portal`).
   - Crie as chaves de assinatura (keystore).
4. Sincronize e faça a build do APK/AAB:
   `bubblewrap build`

*Nota: O Bubblewrap criará um arquivo TWAConfig.json na pasta local. Mantenha os seus arquivos de keystore seguros.*

## 4. Checklist para a Google Play Console
Ao submeter o app (`.aab` gerado) na Google Play Console, você precisará preparar as seguintes mídias e informações:

- [ ] **Ícone do App (512x512 PNG)**: Ícone translúcido/opaco final (como `public/icons/icon-512.png`).
- [ ] **Gráfico de Recursos (Feature Graphic) (1024x500 PNG/JPEG)**: Uma arte horizontal da marca. Pode ser o `AutoCover` ou arte promocional do portal.
- [ ] **Capturas de Tela do Telefone (Phone Screenshots)**: Mínimo de 2, até 8 capturas verticais.
  - Tela 1: Home com os Dossiês (Modo Dark).
  - Tela 2: Mapa de Corredores Climáticos.
  - Tela 3: Acervo e linha do tempo.
  - Tela 4: Gráficos de dados em tempo real.
- [ ] **Título**: SEMEAR Portal
- [ ] **Descrição Curta**: Portal de Monitoramento Ambiental e Engajamento Comunitário do Caju e adjacências.
- [ ] **Descrição Completa**: Ciência cidadã, sensores de qualidade do ar e curadoria de conteúdos da Baía de Guanabara desenvolvidos pela equipe SEMEAR.

## 5. UI & UX (Safe Areas)
O PWA já implementa `env(safe-area-inset-*)` (via Tailwind custom classes ou inline styles no index.css) para evitar que o conteúdo suma atrás de "notches" do iPhone/Android ou das barras de navegação virtuais de baixo. Quando rodando como TWA (standalone), estas margens são estritamente respeitadas.
