import type { Locator, Page } from '@playwright/test';

export type MenuItem = 'deputados' | 'votacoes' | 'senadores' | 'senado-votos';

/**
 * Sidebar menu, header and theme toggle.
 * On mobile viewports the sidebar is hidden behind the "open menu" button;
 * this class hides that difference from the tests.
 */
export class NavigationMenu {
  readonly openMenuButton: Locator;
  readonly themeToggle: Locator;
  readonly senateGroup: Locator;

  constructor(private readonly page: Page) {
    this.openMenuButton = page.getByTestId('open-menu');
    this.themeToggle = page.getByTestId('toggle-theme');
    this.senateGroup = page.getByTestId('navigation-group-senado');
  }

  item(name: MenuItem): Locator {
    return this.page.getByTestId(`navigation-${name}`);
  }

  async open(): Promise<void> {
    // isVisible() does not wait: first make sure the layout (mobile or desktop) has rendered
    await this.openMenuButton.or(this.item('votacoes')).first().waitFor();
    if (await this.openMenuButton.isVisible()) {
      await this.openMenuButton.click();
    }
  }

  async goTo(name: MenuItem): Promise<void> {
    await this.open();
    if (name === 'senadores' || name === 'senado-votos') {
      await this.expandSenate();
    }
    await this.item(name).click();
  }

  async expandSenate(): Promise<void> {
    if (!(await this.item('senadores').isVisible())) {
      await this.senateGroup.click();
    }
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }
}
