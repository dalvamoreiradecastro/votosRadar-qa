import { test, expect } from '../fixtures/pages';

test.describe('Navigation', () => {
  test('TC-NAV-001 votes explorer is the default view', async ({ page, votesPage }) => {
    await page.goto('/');

    await expect(votesPage.screen).toBeVisible();
    await expect(votesPage.screen).toContainText('Explorador de Votações');
  });

  test('TC-NAV-002 switch between votes and deputies views', async ({ page, navigation, votesPage, deputiesPage }) => {
    await page.goto('/');

    await navigation.goTo('deputados');
    await expect(deputiesPage.screen).toBeVisible();
    await expect(votesPage.screen).toBeHidden();

    await navigation.goTo('votacoes');
    await expect(votesPage.screen).toBeVisible();
    await expect(deputiesPage.screen).toBeHidden();
  });

  test('TC-NAV-003 senate section shows a "coming soon" state', async ({ page, navigation }) => {
    await page.goto('/');

    await navigation.goTo('senadores');
    await expect(page.getByTestId('app-screen')).toContainText('Em breve.');

    await navigation.goTo('senado-votos');
    await expect(page.getByTestId('app-screen')).toContainText('Em breve.');
  });

  test('TC-NAV-004 toggle between light and dark themes', async ({ page, navigation }) => {
    await page.goto('/');
    const screen = page.getByTestId('app-screen');
    const background = () => screen.evaluate((el) => getComputedStyle(el).backgroundColor);

    await expect(navigation.themeToggle).toHaveAttribute('aria-label', 'Ativar modo escuro');
    const light = await background();

    await navigation.toggleTheme();
    await expect(navigation.themeToggle).toHaveAttribute('aria-label', 'Ativar modo claro');
    expect(await background()).not.toBe(light);

    await navigation.toggleTheme();
    await expect(navigation.themeToggle).toHaveAttribute('aria-label', 'Ativar modo escuro');
    expect(await background()).toBe(light);
  });

  test('TC-NAV-005 mobile layout uses a collapsible menu', async ({ page, navigation, deputiesPage, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only behavior');
    await page.goto('/');

    await expect(navigation.openMenuButton).toBeVisible();
    await expect(navigation.item('deputados')).toBeHidden();

    await navigation.openMenuButton.click();
    await expect(navigation.item('deputados')).toBeVisible();

    await navigation.item('deputados').click();
    await expect(deputiesPage.screen).toBeVisible();
    await expect(navigation.item('deputados')).toBeHidden();

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
