import { test as base } from '@playwright/test';
import { NavigationMenu } from '../pages/NavigationMenu';
import { VotesPage } from '../pages/VotesPage';
import { DeputiesPage } from '../pages/DeputiesPage';

interface PageObjects {
  navigation: NavigationMenu;
  votesPage: VotesPage;
  deputiesPage: DeputiesPage;
}

/**
 * Extends Playwright's `test` so page objects are injected into each test:
 *   test('...', async ({ votesPage }) => { ... })
 */
export const test = base.extend<PageObjects>({
  navigation: async ({ page }, use) => {
    await use(new NavigationMenu(page));
  },
  votesPage: async ({ page }, use) => {
    await use(new VotesPage(page));
  },
  deputiesPage: async ({ page }, use) => {
    await use(new DeputiesPage(page));
  },
});

export { expect } from '@playwright/test';
