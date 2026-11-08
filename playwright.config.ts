import { defineConfig, devices } from '@playwright/test';
import { env } from './config/environment';

console.log(`Running tests against "${env.name}": UI ${env.baseURL} | API ${env.apiURL}`);

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
  /* Production sits behind a rate limiter (10 req/s per IP): keep parallelism low there */
  workers: env.isProduction ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Live production API can take a few seconds to respond under parallel load */
  expect: { timeout: 10_000 },

  use: {
    baseURL: env.baseURL,
    /* Evidence is collected only when something goes wrong */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    /* API tests: no browser needed, requests go straight to the backend */
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiURL },
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
