import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const ciPort = process.env.PLAYWRIGHT_PORT || '4173';
const localPort = process.env.PLAYWRIGHT_PORT || '5173';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || (isCI ? `http://127.0.0.1:${ciPort}` : `http://127.0.0.1:${localPort}`);

/**
 * Playwright configuration for SEMEAR PWA smoke tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,

  /* Retry on CI only */
  retries: isCI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: isCI ? 1 : undefined,

  /* Reporter to use */
  reporter: 'html',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run app server before tests */
  webServer: {
    command: isCI
      ? `npm run preview -- --host 127.0.0.1 --port ${ciPort}`
      : `npm run dev -- --host 127.0.0.1 --port ${localPort}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120000,
  },
});
