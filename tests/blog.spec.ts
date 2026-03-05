import { test, expect } from '@playwright/test';

test.describe('Blog Page @smoke', () => {
  test('should load blog list', async ({ page }) => {
    await page.goto('/blog');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /blog/i }).first()).toBeVisible();
    
    // Verify page structure (posts list, grid, or empty state)
    const hasContent = await page.locator('article, [class*="card"], [class*="post"]').count() > 0;
    const hasLoadingState = await page.getByText(/carregando/i).count() > 0;
    const hasEmptyState = await page.getByText(/nenhum|sem posts/i).count() > 0;
    
    expect(hasContent || hasLoadingState || hasEmptyState).toBeTruthy();
    
    // Verify main content area is present
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to blog post if available', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Try to find and click first blog post link
    const postLink = page.locator('a[href*="/blog/"]').first();
    
    if (await postLink.count() > 0) {
      const href = await postLink.getAttribute('href');
      
      // Avoid clicking on the "/blog" link itself
      if (href && href !== '/blog' && !href.endsWith('/blog')) {
        await postLink.click();
        await expect(page).toHaveURL(/\/blog\/.+/);
        
        // Verify post page loads
        await expect(page.locator('main')).toBeVisible();
      }
    }
    // If no posts, that's okay - blog might be empty
  });
});
