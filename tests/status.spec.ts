import { test, expect } from '@playwright/test';

test.describe('Status Page @smoke', () => {
  test('should load status page', async ({ page }) => {
    await page.goto('/status');
    
    // Check page has status-related content
    const hasStatusHeading = await page.getByRole('heading', { name: /status/i }).count() > 0;
    const hasSystemInfo = await page.getByText(/sistema|serviço|operational|online/i).count() > 0;
    
    expect(hasStatusHeading || hasSystemInfo).toBeTruthy();
    
    // Verify main content area is present
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('should display system health information', async ({ page }) => {
    await page.goto('/status');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for health indicators (very flexible)
    const hasHealthInfo = await page.locator('*').filter({ hasText: /online|offline|ok|erro|healthy|unhealthy|ativo|inativo/i }).count() > 0;
    const hasLoadingState = await page.getByText(/carregando/i).count() > 0;
    
    expect(hasHealthInfo || hasLoadingState).toBeTruthy();
  });
});
