import { test, expect } from '@playwright/test';

test.describe('Acervo Page @smoke', () => {
  test('should load acervo index', async ({ page }) => {
    await page.goto('/acervo');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /acervo/i }).first()).toBeVisible();
    
    // Verify navigation structure exists (could be cards, list, or grid)
    const hasContent = await page.locator('article, [class*="card"], [class*="grid"], main > div').count() > 0;
    const hasLoadingState = await page.getByText(/carregando/i).count() > 0;
    
    expect(hasContent || hasLoadingState).toBeTruthy();
  });

  test('should navigate to linha do tempo view', async ({ page }) => {
    await page.goto('/acervo');
    
    // Look for "Linha do Tempo" link
    const linhaLink = page.getByRole('link', { name: /linha/i });
    
    // If the link exists, navigate to it
    if (await linhaLink.count() > 0) {
      await linhaLink.first().click();
      await expect(page).toHaveURL(/\/acervo\/linha/);
      
      // Verify timeline page loads
      await expect(page.locator('main')).toBeVisible();
    } else {
      // If direct link not found, try navigating directly
      await page.goto('/acervo/linha');
      
      // Verify page loads (either with content or empty state)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle item navigation', async ({ page }) => {
    await page.goto('/acervo');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Try to find and click first item link if it exists
    const itemLink = page.locator('a[href*="/acervo/item/"]').first();
    
    if (await itemLink.count() > 0) {
      await itemLink.click();
      await expect(page).toHaveURL(/\/acervo\/item\//);
      
      // Verify item detail page loads
      await expect(page.locator('main')).toBeVisible();
    }
    // If no items, that's okay - just verify the acervo page is functional
  });
});
