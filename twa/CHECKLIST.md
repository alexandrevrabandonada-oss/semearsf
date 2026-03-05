# TWA Pre-Flight Checklist

Use este checklist antes de iniciar o processo de publicação do TWA.

## Infraestrutura

- [ ] PWA publicado em produção com HTTPS
- [ ] Domínio próprio configurado
- [ ] Service Worker registrado e funcional
- [ ] Manifest.json acessível e válido
- [ ] PWA passa em [Lighthouse](https://web.dev/measure/) com score PWA > 90

## Assets Preparados

- [ ] Ícone 512x512 PNG (opaco, sem margens)
- [ ] Ícone maskable 512x512 PNG (safe area 20%)
- [ ] Feature graphic 1024x500 (opcional mas recomendado)
- [ ] Screenshots phone 2-8 (1080x2400 ou similar)
- [ ] Screenshots tablet (opcional)

## Configuração

- [ ] Package name definido (ex: `br.org.semear.pwa`)
- [ ] Bubblewrap config copiado e editado
- [ ] assetlinks.json.example copiado e configurado
- [ ] SHA-256 fingerprint obtido e atualizado
- [ ] assetlinks.json deployado e acessível

## Ferramentas Instaladas

- [ ] Node.js 18+
- [ ] Java JDK 17+
- [ ] Android SDK
- [ ] Bubblewrap CLI (`npm i -g @bubblewrap/cli`)

## Play Console

- [ ] Conta desenvolvedor Google Play criada ($25)
- [ ] Acesso à Play Console verificado
- [ ] Título do app definido
- [ ] Descrição curta (80 chars)
- [ ] Descrição completa (até 4000 chars)
- [ ] Categoria escolhida

## Build & Test

- [ ] Keystore criado e backup feito
- [ ] APK gerado e testado localmente
- [ ] AAB gerado para upload
- [ ] App abre sem barra de endereço (full screen)
- [ ] Navegação funciona
- [ ] Modo offline funciona
- [ ] Notificações funcionam

## Publicação

- [ ] App criado na Play Console
- [ ] Screenshots uploadados
- [ ] Ícones uploadados
- [ ] Descrições preenchidas
- [ ] AAB enviado (internal testing)
- [ ] Questionário de conteúdo preenchido
- [ ] Política de privacidade linkada (se necessário)
- [ ] App submetido para revisão

## Pós-Publicação

- [ ] App aprovado e publicado
- [ ] Link da Play Store funcional
- [ ] Deep links testados
- [ ] Versão documentada
- [ ] Backup do keystore seguro
- [ ] Processo de atualização documentado

---

**Próximos passos:**
1. Revise `README.md` neste diretório
2. Consulte `/docs/TWA.md` para guia completo
3. Execute comandos em sequência conforme README
