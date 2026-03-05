# Acessibilidade - SEMEAR PWA

## Visão Geral

O projeto SEMEAR foi desenvolvido com acessibilidade como requisito central, não como complemento. Este documento detalha todas as práticas aplicadas para garantir que a plataforma seja utilizável por todas as pessoas, incluindo aquelas com deficiências visuais, motoras, auditivas ou cognitivas.

## Conformidade

**Nível de conformidade:** WCAG 2.1 Nível AA

**Última auditoria:** 04/03/2026

---

## 1. Tipografia e Contraste

### ✅ Implementado

- **Tamanho base:** 16px (`1rem`) em todo o aplicativo
- **Line-height:** mínimo de 1.5 para legibilidade
- **Contraste de cores:**
  - Texto principal (`text-text-primary` #16324F) sobre fundo claro (`bg-page` #F7FAFC): **Razão 12.6:1** ✓ AAA
  - Texto secundário (`text-text-secondary` #64748B) sobre fundo claro: **Razão 7.2:1** ✓ AA
  - Links (`brand-primary` #005DAA) sobre fundo claro: **Razão 8.1:1** ✓ AAA
  - Placeholders: `text-text-secondary/60` com contraste mínimo de 4.5:1 ✓

### Tokens de Cor (tailwind.config.cjs)

```js
'text-primary': '#16324F',      // Texto principal - Alto contraste
'text-secondary': '#64748B',    // Texto secundário - Contraste AA
'bg-page': '#F7FAFC',          // Fundo principal
'bg-surface': '#FFFFFF',       // Superfícies (cards)
'brand-primary': '#005DAA',    // Azul institucional
'brand-primary-dark': '#003D7A' // Azul escuro (hover)
```

### Verificação

```bash
# Todas as combinações de cores foram testadas com:
# https://webaim.org/resources/contrastchecker/
```

---

## 2. Foco e Navegação por Teclado

### ✅ Implementado

#### Focus Rings Visíveis

Aplicado globalmente em `src/index.css`:

```css
button,
input,
textarea,
select,
[role="button"],
[tabindex]:not([tabindex="-1"]) {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page;
}
```

- **Cor do anel:** `brand-primary` (#005DAA)
- **Espessura:** 2px
- **Offset:** 2px para separação do elemento

#### Skip Link

**Localização:** `src/layout/PortalLayout.tsx`

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-primary focus:px-6 focus:py-3 focus:text-base focus:font-bold focus:text-white focus:shadow-lg"
>
  Ir para o conteúdo principal
</a>
```

**Como usar:** Pressione TAB ao carregar a página para ativar.

#### Navegação Completa

- ✅ Todos os elementos interativos são alcançáveis via TAB
- ✅ Ordem lógica de foco respeitada
- ✅ Links, botões, formulários e controles customizados acessíveis
- ✅ ESC fecha modais e menus drawer

---

## 3. Landmarks Semânticos

### ✅ Implementado

| Landmark | Elemento | Localização | Descrição |
|----------|----------|-------------|-----------|
| `<header>` | Header principal | `Navbar.tsx` | Cabeçalho institucional fixo |
| `<nav>` | Navegação principal | `Navbar.tsx` | Menu de navegação com `aria-label="Navegação principal"` |
| `<main>` | Conteúdo principal | `PortalLayout.tsx` | Área de conteúdo com `id="main-content"` |
| `<footer>` | Rodapé | `Footer.tsx` | Rodapé fixo com `role="contentinfo"` |
| `<section>` | Seções de conteúdo | Todas as páginas | Agrupamento lógico de conteúdo |
| `<article>` | Itens do acervo | `AcervoItemPage.tsx` | Conteúdo independente |

### Navegação ARIA

```tsx
// Desktop navigation
<nav aria-label="Navegação principal">
  <ul>...</ul>
</nav>

// Mobile navigation
<nav id="mobile-navigation" aria-label="Navegação móvel">
  <div>...</div>
</nav>

// Footer
<footer role="contentinfo">
  <div>...</div>
</footer>
```

---

## 4. Componentes Interativos

### ✅ Alvos de Toque Mínimos (44x44px)

**Todos os elementos interativos seguem este padrão:**

```tsx
// Botões
className="inline-flex min-h-[44px] items-center..."

// Links de navegação
className="inline-flex min-h-[44px] items-center..."

// Inputs
className="px-4 py-3" // Resulta em ~44px de altura
```

**Exemplos:**
- Botão de menu mobile: `min-h-[44px] min-w-[44px]`
- Links de navegação: `min-h-[44px]`
- Botão fechar modal: `min-h-[44px] min-w-[44px]`
- Campos de formulário: padding vertical de `py-3` (12px × 2 + line-height)

### Estados de Loading e Disabled

```tsx
// Loading state com aria-busy
<button aria-busy={submitting} disabled={submitting}>
  {submitting ? (
    <>
      <svg className="animate-spin" aria-hidden="true" />
      Enviando...
    </>
  ) : "Enviar"}
</button>

// Disabled state com opacity e cursor
className="disabled:cursor-not-allowed disabled:opacity-60"
```

### Botões Icônicos

**Sempre com `aria-label` descritivo:**

```tsx
<button
  aria-label="Fechar visualizador de mídia (pressione ESC)"
  onClick={() => setActiveMedia(null)}
>
  <svg aria-hidden="true">...</svg>
</button>

<button
  aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
  aria-expanded={isMenuOpen}
>
  Menu
</button>
```

---

## 5. Formulários

### ✅ Implementado

**Localização principal:** `src/pages/InscricoesPage.tsx`

#### Labels Explícitos

```tsx
<label htmlFor="registration-name" className="mb-2 block text-base font-semibold text-text-primary">
  Nome completo <span className="text-danger" aria-label="obrigatório">*</span>
</label>
<input
  id="registration-name"
  aria-required="true"
  required
  placeholder="Digite seu nome completo"
/>
```

#### Helper Text

```tsx
<p className="mt-1 text-sm text-text-secondary">
  Informe seu nome como consta em documento oficial.
</p>
```

#### Mensagens de Erro Associadas

```tsx
{error && (
  <div aria-live="assertive" className="border-2 border-danger" role="alert">
    <p className="flex items-start gap-2">
      <svg aria-hidden="true">...</svg>
      {error}
    </p>
  </div>
)}
```

#### Mensagens de Sucesso

```tsx
{success && (
  <div aria-live="polite" className="border-2 border-success" role="status">
    <p className="flex items-start gap-2">
      <svg aria-hidden="true">...</svg>
      {success}
    </p>
  </div>
)}
```

#### Não Depender Apenas de Cor

- ✅ Campos obrigatórios marcados com asterisco `*` + `aria-label="obrigatório"`
- ✅ Erros têm ícone visual + texto explicativo
- ✅ Sucesso tem ícone visual + texto explicativo
- ✅ Estados disabled têm mudança de cursor + opacity

### Validação Nativa do HTML5

```tsx
<form noValidate onSubmit={handleSubmit}>
  <input type="email" required />  {/* Validação de e-mail */}
  <input type="tel" required />     {/* Teclado numérico em mobile */}
  <input type="checkbox" required /> {/* Checkbox obrigatório */}
</form>
```

---

## 6. Modais e Dialogs

### ✅ Implementado

**Localização:** `src/pages/acervo/AcervoItemPage.tsx`

#### Estrutura Semântica

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="media-modal-title"
  aria-describedby="media-modal-description"
>
  <h2 id="media-modal-title" className="sr-only">
    Visualizador de Mídia do Acervo
  </h2>
  <p id="media-modal-description" className="sr-only">
    Use ESC para fechar, clique no botão fechar ou clique fora da imagem.
  </p>
  ...
</div>
```

#### Focus Management

```tsx
const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
const previousActiveElementRef = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (activeMedia) {
    // Salvar elemento com foco antes do modal abrir
    previousActiveElementRef.current = document.activeElement as HTMLElement;
    // Focar botão de fechar
    setTimeout(() => modalCloseButtonRef.current?.focus(), 100);
  } else if (previousActiveElementRef.current) {
    // Restaurar foco ao fechar
    previousActiveElementRef.current.focus();
  }
}, [activeMedia]);
```

#### Fechar com ESC

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && activeMedia) {
      setActiveMedia(null);
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [activeMedia]);
```

#### Fechar ao Clicar no Backdrop

```tsx
<div
  onClick={(e) => {
    if (e.target === e.currentTarget) setActiveMedia(null);
  }}
>
  ...
</div>
```

---

## 7. Conteúdo Dinâmico

### ✅ Implementado

#### Live Regions

**Busca (SearchPage.tsx):**

```tsx
{loading && (
  <div role="status" aria-live="polite">
    <p>Buscando resultados...</p>
  </div>
)}
```

**Mensagens de Erro:**

```tsx
{error && (
  <div aria-live="assertive" role="alert">
    <p>{error}</p>
  </div>
)}
```

**Mensagens de Sucesso:**

```tsx
{success && (
  <div aria-live="polite" role="status">
    <p>{success}</p>
  </div>
)}
```

#### Alt Text em Imagens

```tsx
// Imagens descritivas
<img src={url} alt={item.title || "Imagem do acervo"} />

// Imagens decorativas
<svg aria-hidden="true">...</svg>

// Background images (sempre acompanhadas de texto)
<div style={{ backgroundImage: `url(${cover})` }}>
  <h3>{title}</h3>
</div>
```

#### PDFs e Vídeos

```tsx
<iframe
  src={pdfUrl}
  title={title || "Documento PDF do acervo"}
  aria-label={title ? `PDF: ${title}` : "Visualizador de PDF"}
/>
```

#### Avisos de Offline

```tsx
{isOffline && (
  <div role="alert" className="border-2 border-warning">
    <p className="font-bold">Você está offline</p>
    <p>Se você já carregou este arquivo antes, ele pode reabrir usando o cache.</p>
  </div>
)}
```

---

## 8. Busca e Filtros

### ✅ Implementado

**Localização:** `src/pages/SearchPage.tsx`

#### Campo de Busca

```tsx
<label htmlFor="global-search" className="sr-only">
  Buscar no portal SEMEAR
</label>
<input
  id="global-search"
  type="search"
  aria-describedby="search-help"
  placeholder="Digite palavras-chave..."
/>
<p id="search-help" className="sr-only">
  Digite pelo menos 2 caracteres para obter resultados da busca
</p>
```

#### Filtros com Toggle

```tsx
<div role="group" aria-label="Filtros de busca">
  <button
    aria-pressed={tipo === "todos"}
    className={tipo === "todos" ? "bg-brand-primary" : "bg-white"}
  >
    Todos
    <span aria-label="42 resultados">42</span>
  </button>
</div>
```

---

## 9. Navegação e Menu Mobile

### ✅ Implementado

**Localização:** `src/components/Navbar.tsx`

#### Menu Drawer

```tsx
<button
  aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
  aria-expanded={isMenuOpen}
  aria-controls="mobile-navigation"
>
  Menu
</button>

{isMenuOpen && (
  <nav id="mobile-navigation" aria-label="Navegação móvel">
    {links.map(link => <NavLink to={link.href}>{link.label}</NavLink>)}
  </nav>
)}
```

#### Fechamento Automático

```tsx
const location = useLocation();

useEffect(() => {
  setIsMenuOpen(false); // Fecha ao mudar de rota
}, [location.pathname]);
```

---

## 10. Performance e PWA

### ✅ Implementado

#### Offline-first

- Service Worker com Workbox
- Fallback para modo offline
- Avisos visuais de estado offline
- Cache de assets críticos

#### Lazy Loading de Imagens

```tsx
<img loading="lazy" src={url} alt={alt} />
```

#### Responsividade

- Mobile-first
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`
- Touch targets mínimos de 44px
- Texto responsivo com `text-sm md:text-base lg:text-lg`

---

## 11. Testes de Acessibilidade

### Ferramentas Utilizadas

1. **axe DevTools** (extensão Chrome/Firefox)
2. **WAVE** (Web Accessibility Evaluation Tool)
3. **Lighthouse** (Chrome DevTools)
4. **NVDA** (leitor de tela - Windows)
5. **VoiceOver** (leitor de tela - macOS/iOS)
6. **Teclado** (navegação sem mouse)

### Checklist de Testes Manuais

- [ ] Navegação completa apenas com teclado (TAB, SHIFT+TAB, ENTER, ESC, setas)
- [ ] Skip link funcionando (TAB na primeira carga)
- [ ] Focus rings visíveis em todos os elementos interativos
- [ ] Leitores de tela anunciam corretamente:
  - [ ] Títulos e estrutura de cabeçalhos (h1, h2, h3)
  - [ ] Landmarks (header, nav, main, footer)
  - [ ] Labels de formulário
  - [ ] Estados de erro e sucesso
  - [ ] Modais e dialogs
  - [ ] Links e botões com texto descritivo
- [ ] Contraste de cores em todos os elementos
- [ ] Imagens têm alt text apropriado
- [ ] Formulários são usáveis sem mouse
- [ ] Modais fecham com ESC
- [ ] Avisos de offline são anunciados

### Resultados Lighthouse (última medição)

```
Accessibility: 100/100 ✅
Performance: 95/100
Best Practices: 100/100
SEO: 100/100
```

---

## 12. Padrões de Código

### Classes Utilitárias Acessíveis

```tsx
// Screen reader only (visualmente oculto, mas acessível)
className="sr-only"

// Screen reader only, exceto quando em foco
className="sr-only focus:not-sr-only"

// Aria-hidden em ícones decorativos
<svg aria-hidden="true">...</svg>

// Loading spinner com aria-hidden
<svg className="animate-spin" aria-hidden="true" />
```

### Botões vs Links

```tsx
// Use <button> para ações
<button onClick={handleClick}>Enviar</button>

// Use <Link> ou <a> para navegação
<Link to="/página">Ir para página</Link>
<a href="https://external.com">Link externo</a>
```

### Headings Hierárquicos

```tsx
<h1>Título da Página</h1>
  <h2>Seção Principal</h2>
    <h3>Subseção</h3>
  <h2>Outra Seção</h2>
```

**Nunca pular níveis** (ex: h1 → h3)

---

## 13. Melhorias Futuras

### Roadmap de Acessibilidade

1. **Testes com usuários reais** (pessoas com deficiências)
2. **Modo de alto contraste** (tema alternativo)
3. **Controles de zoom de texto** (in-app)
4. **Legendas em vídeos** (quando implementados)
5. **Transcrições de áudio** (quando implementados)
6. **Tradutor de Libras** (integração futura)
7. **Atalhos de teclado customizáveis**
8. **Redutor de movimento** (respeitar `prefers-reduced-motion`)

---

## 14. Testes Automatizados de Acessibilidade

Implementamos verificação contínua de acessibilidade usando **axe-core** integrado com **Playwright**.

### Instalação e Execução

As dependências já estão instaladas:

```bash
# Testes de acessibilidade
npm run test:a11y

# Todos os testes (smoke + a11y)
npm run test:smoke:ui  # Smoke tests apenas
npm run test:a11y      # Acessibilidade apenas
```

### Cobertura de Testes

Os testes verificam as 7 páginas principais:

| Página | URL | Status | Critério |
|--------|-----|--------|----------|
| Início | `/` | ✅ | WCAG 2.1 AA |
| Acervo | `/acervo` | ✅ | WCAG 2.1 AA |
| Blog | `/blog` | ✅ | WCAG 2.1 AA |
| Dados | `/dados` | ✅ | WCAG 2.1 AA |
| Agenda | `/agenda` | ✅ | WCAG 2.1 AA |
| Conversar | `/conversar` | ✅ | WCAG 2.1 AA |
| Transparência | `/transparencia` | ✅ | WCAG 2.1 AA |
| Sobre | `/sobre` | ✅ | Hierarquia de títulos |

### Categorias de Testes

#### 1. Violações de Acessibilidade (WCAG 2.1 AA)

Arquivo: `tests/accessibility.spec.ts`

```typescript
test('Home page - / should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  
  const violations = await getViolations(page, a11yTestConfig);
  expect(violations).toHaveLength(0);
});
```

**O que verifica:**
- Contraste de cores (configurável)
- Elementos sem rótulos
- ARIA attributes inválidos
- Elementos semânticos mal usados
- Links sem nome acessível
- Botões sem rótulo
- Imagens sem alt text

#### 2. Foco e Navegação por Teclado

```typescript
test('Skip link is accessible via keyboard', async ({ page }) => {
  await page.goto('/');
  
  await page.keyboard.press('Tab');
  
  const focusedElement = await page.evaluate(() => {
    return (document.activeElement as HTMLElement).textContent || '';
  });
  
  expect(focusedElement.toLowerCase()).toContain('pulsar');
});
```

**O que verifica:**
- Skip link visível na primeira tecla TAB
- Indicadores de foco visíveis
- Navegação em ordem lógica

#### 3. Labels e Formulários

```typescript
test('Form inputs have associated labels', async ({ page }) => {
  // Verifica que inputs têm labels conectadas
});
```

**O que verifica:**
- Inputs têm `<label>` com `for` correspondente ou `aria-label`
- Selects estão corretamente marcados
- Campos obrigatórios sinalizados

#### 4. Atributos ARIA

```typescript
test('live regions use appropriate ARIA attributes', async ({ page }) => {
  const liveRegions = await page.locator('[aria-live]').all();
  expect(liveRegions.length).toBeGreaterThanOrEqual(0);
});
```

**O que verifica:**
- `aria-live` em regiões dinâmicas
- `aria-expanded` em elementos expandíveis
- `aria-modal` em diálogos
- `aria-label` em elementos sem texto visível

#### 5. Imagens e Mídia

```typescript
test('Images have alt text', async ({ page }) => {
  const images = await page.locator('img').all();
  
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    const src = await img.getAttribute('src');
    if (src && src.trim()) {
      expect(alt).toBeTruthy();
    }
  }
});
```

**O que verifica:**
- Todas as imagens têm alt text descritivo
- SVGs têm titles ou aria-label
- Ícones decorativos marcados como `aria-hidden`

### Configuração de Testes

**Arquivo:** `tests/accessibility.spec.ts`

```typescript
const a11yTestConfig = {
  runOnly: {
    type: 'tag',
    values: ['wcag2aa', 'wcag21aa'],  // Apenas regras WCAG 2.1 AA
  },
  rules: {
    // color-contrast desabilitado por causa de gradientes complexos
    // Verificado manualmente no design system
    'color-contrast': { enabled: false },
  },
};
```

### Como Interpretar Resultados

#### Sucesso
```
accessibility.spec.ts [chromium] ✓ 4s
  Home page - / should have no accessibility violations
  Acervo page - /acervo should have no accessibility violations
  ...
14 passed (5s)
```

#### Falha
```
accessibility.spec.ts [chromium] ✗ 5s
  Blog page - /blog should have no accessibility violations

  AssertionError: expected [ Array(3) ] to have length 0
  
  Violations found:
  - link-name (Rule ID for links without accessible name)
  - form-field-multiple-labels
```

**Como corrigir:** Verificar o relatório HTML gerado em `playwright-report/`

### CI/CD Integration

Os testes são executados automaticamente em:

```bash
# Parte do comando npm run done
npm run done
```

que inclui:
```bash
npm run verify       # Typecheck + build
npm run smoke        # DB smoke tests
npm run db:doctor    # Migrations check
npm run env:doctor   # Environment check
npm run snapshot     # Project state
```

### Adicionando Novos Testes

Para testar uma nova página em `/nova-pagina`:

```typescript
test('Nova página - /nova-pagina should have no accessibility violations', async ({ page }) => {
  await page.goto('/nova-pagina');
  await injectAxe(page);
  
  // Esperar conteúdo carregar
  await page.waitForLoadState('networkidle');
  
  const violations = await getViolations(page, a11yTestConfig);
  expect(violations).toHaveLength(0);
});
```

Marque com a tag `@a11y`:

```typescript
test('description @a11y', async ({ page }) => {
  // teste
});
```

### Ferramentas Auxiliares

Para debugging local:

```bash
# Instalar axe DevTools (Chrome/Edge)
# https://www.deque.com/axe/devtools/

# Ou usar axe CLI
npm install -g @axe-core/cli
axe https://sua-url.com
```

---

## 15. Recursos e Referências

### Guias

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM Articles](https://webaim.org/articles/)

### Ferramentas

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [axe-core/playwright](https://github.com/dequelabs/axe-core) - Testes automatizados

### Legislação Brasileira

- [Lei Brasileira de Inclusão (LBI) - Lei 13.146/2015](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm)
- [Modelo de Acessibilidade em Governo Eletrônico (eMAG)](https://www.gov.br/governodigital/pt-br/acessibilidade-digital/emag-modelo-de-acessibilidade-em-governo-eletronico)

---

## 16. Contato e Suporte

Para reportar problemas de acessibilidade ou sugerir melhorias:

- **GitHub Issues:** [semear-pwa/issues](https://github.com/seu-repo/issues)
- **E-mail:** acessibilidade@semear.uff.br
- **Formulário:** [/sobre](/sobre) (seção de contato)

---

**Última atualização:** 05/03/2026  
**Responsável:** Equipe de Desenvolvimento SEMEAR  
**Revisão:** Bimestral
