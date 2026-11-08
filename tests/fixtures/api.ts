import { test as base } from '@playwright/test';
import { VotoRadarApi } from '../api/support/VotoRadarApi';

/**
 * Injects the API client into each test:
 *   test('...', async ({ api }) => { ... })
 * It uses Playwright's `request` fixture, which already knows the baseURL.
 */
export const test = base.extend<{ api: VotoRadarApi }>({
  api: async ({ request }, use) => {
    await use(new VotoRadarApi(request));
  },
});

export { expect } from '@playwright/test';
