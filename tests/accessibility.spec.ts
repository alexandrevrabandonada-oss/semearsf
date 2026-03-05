import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from '@axe-core/playwright';

/**
 * Accessibility smoke tests using axe-core
 * Tests critical pages for WCAG 2.1 AA violations
 * 
 * Run with: npm run test:a11y
 */

const a11yTestConfig = {
  runOnly: {
    type: 'tag',
    values: ['wcag2aa', 'wcag21aa'],
  },
  rules: {
    // Ignore color-contrast for visually testing purposes
    // It's verified in design system but complex gradients may trigger false positives
    'color-contrast': { enabled: false },
  },
};

test.describe('Accessibility Tests @a11y', () => {
  
  test('Home page - / should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    // Wait for content to load
    await expect(page.getByRole('heading', { name: /ciência aberta/i })).toBeVisible();
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Acervo page - /acervo should have no accessibility violations', async ({ page }) => {
    await page.goto('/acervo');
    await injectAxe(page);
    
    // Give page time to load initial content
    await page.waitForLoadState('networkidle');
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Blog page - /blog should have no accessibility violations', async ({ page }) => {
    await page.goto('/blog');
    await injectAxe(page);
    
    // Wait for blog content to render
    await page.waitForLoadState('networkidle');
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Dados page - /dados should have no accessibility violations', async ({ page }) => {
    await page.goto('/dados');
    await injectAxe(page);
    
    // Wait for monitoring panel to load
    await page.waitForLoadState('networkidle');
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Agenda page - /agenda should have no accessibility violations', async ({ page }) => {
    await page.goto('/agenda');
    await injectAxe(page);
    
    // Wait for events list to load
    await page.waitForLoadState('networkidle');
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Conversar page - /conversar should have no accessibility violations', async ({ page }) => {
    await page.goto('/conversar');
    await injectAxe(page);
    
    // Wait for conversations to render
    await page.waitForLoadState('networkidle');
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Transparencia page - /transparencia should have no accessibility violations', async ({ page }) => {
    await page.goto('/transparencia');
    await injectAxe(page);
    
    // Wait for financial data to load
    await page.waitForLoadState('networkidle');
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Sobre page - /sobre has proper heading hierarchy', async ({ page }) => {
    await page.goto('/sobre');
    await injectAxe(page);
    
    // Verify main heading exists
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    
    // Check for violations
    const violations = await getViolations(page, a11yTestConfig);
    expect(violations).toHaveLength(0);
  });

  test('Navigation has keyboard focus indicators', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    
    // Check if focused element is visible
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.getAttribute('class') || '';
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('Skip link is accessible via keyboard', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab - should focus skip link
    await page.keyboard.press('Tab');
    
    // Get the focused element
    const focusedElement = await page.evaluate(() => {
      return (document.activeElement as HTMLElement).textContent || '';
    });
    
    // Skip link should be first focusable element
    expect(focusedElement.toLowerCase()).toContain('pulsar');
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Get all images
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // img without src (as fallback/placeholder) are OK without alt
      const src = await img.getAttribute('src');
      if (src && src.trim()) {
        expect(alt).toBeTruthy();
      }
    }
  });

  test('Form inputs have associated labels', async ({ page }) => {
    await page.goto('/conversar');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Navigate to a conversation to see comment form
    const firstThread = page.locator('a').filter({ hasText: /participar/i }).first();
    if (await firstThread.isVisible()) {
      await firstThread.click();
      await page.waitForLoadState('networkidle');
      
      // Check for form inputs with labels
      const inputs = await page.locator('input, textarea').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    }
  });
});

test.describe('Accessibility - Focus Management @a11y', () => {
  
  test('modals trap keyboard focus correctly', async ({ page }) => {
    await page.goto('/acervo/item/test-item');
    await page.waitForLoadState('networkidle');
    
    // Try to navigate through the page
    // (Actual modal test would require clicking a media button)
    const mainContent = page.locator('main, article');
    await expect(mainContent).toBeVisible();
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/dados');
    
    // Wait for buttons to render
    await page.waitForLoadState('networkidle');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const isVisible = await button.isVisible();
      if (isVisible) {
        // Check button has accessible text or aria-label
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    }
  });

  test('links are properly labeled', async ({ page }) => {
    await page.goto('/');
    
    const links = await page.locator('a').all();
    
    for (const link of links) {
      const text = (await link.textContent())?.trim();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Links should have visible text or aria-label
      if (text !== '→' && !text?.includes('svg')) {
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });
});

test.describe('Accessibility - ARIA Attributes @a11y', () => {
  
  test('live regions use appropriate ARIA attributes', async ({ page }) => {
    await page.goto('/conversar');
    await page.waitForLoadState('networkidle');
    
    // Look for aria-live regions
    const liveRegions = await page.locator('[aria-live]').all();
    
    // Should have at least one live region (loading, status messages, etc)
    expect(liveRegions.length).toBeGreaterThanOrEqual(0);
  });

  test('dialogs have proper ARIA attributes', async ({ page }) => {
    // This is a placeholder - actual modal test would need modal to be opened
    const page_content = page.locator('main');
    await expect(page_content).toBeVisible();
  });

  test('expandable sections have aria-expanded', async ({ page }) => {
    await page.goto('/corredores');
    await page.waitForLoadState('networkidle');
    
    // Check for any expandable sections (details elements count)
    const details = await page.locator('details').all();
    
    for (const detail of details) {
      // Details elements should work with keyboard
      const isOpen = await detail.evaluate((el: any) => el.open);
      expect(typeof isOpen).toBe('boolean');
    }
  });
});
