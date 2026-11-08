import { defineConfig, devices } from '@playwright/test';

/**
 * Target environment URL.
 * Defaults to production; override with the BASE_URL environment variable.
 */
const BASE_URL = process.env.BASE_URL ?? 'https://votoradar.y4tress.com';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if test.only is left in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only, to surface flaky tests without hiding them locally */
  retries: process.env.CI ? 2 : 0,
  /* Limit parallelism on CI to be gentle with a production environment */
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Live production API can take a few seconds to respond under parallel load */
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    /* Evidence is collected only when something goes wrong */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    /* API tests: no browser needed */
    {
      name: 'api',
      testDir: './tests/api',
    },

    /* End-to-end UI tests: desktop browsers */
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Safari'] },
    },

    /* End-to-end UI tests: mobile viewports */
    {
      name: 'mobile-chrome',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      testDir: './tests/e2e',
      use: { ...devices['iPhone 14'] },
    },
  ],
});
