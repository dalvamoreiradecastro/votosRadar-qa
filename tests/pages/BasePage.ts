import type { Locator, Page, Response } from '@playwright/test';

/** The "(loaded de total)" counter shown above every list, e.g. "Votações (20 de 300)". */
export interface Counter {
  loaded: number;
  total: number;
}

/**
 * Base class for the screens of the app.
 *
 * Holds only what every screen really shares:
 * - the screen root: the app keeps hidden screens in the DOM, so every locator must be scoped to it;
 * - the list counter and how to read it;
 * - the "act and wait for the API response" pattern.
 *
 * Elements that are not part of a screen, such as the sidebar menu and the theme toggle,
 * live in their own component ({@link NavigationMenu}) and are injected through fixtures.
 */
export abstract class BasePage {
  /** Root element of the screen; every locator of a subclass starts from here. */
  readonly screen: Locator;
  /** List counter, e.g. "Votações (20 de 300)". */
  readonly counter: Locator;

  /**
   * @param screenTestId `data-testid` of the screen root, e.g. "votacoes-screen"
   * @param counterLabel label that precedes the counter, e.g. "Votações"
   */
  protected constructor(
    protected readonly page: Page,
    screenTestId: string,
    counterLabel: string,
  ) {
    this.screen = page.getByTestId(screenTestId);
    this.counter = this.screen.getByText(new RegExp(`^${counterLabel} \\(\\d+ de \\d+\\)$`));
  }

  async readCounter(): Promise<Counter> {
    const text = await this.counter.innerText();
    const [, loaded, total] = text.match(/\((\d+) de (\d+)\)/) ?? [];
    return { loaded: Number(loaded), total: Number(total) };
  }

  /**
   * Runs an action and returns the API response it triggers.
   * The listener is registered before the action, so a fast response is never missed.
   */
  protected async actAndWaitForResponse(
    isExpected: (response: Response) => boolean,
    action: () => Promise<unknown>,
  ): Promise<Response> {
    const [response] = await Promise.all([this.page.waitForResponse(isExpected), action()]);
    return response;
  }
}
