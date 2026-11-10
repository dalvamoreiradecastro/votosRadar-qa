import type { Locator, Page, Response } from '@playwright/test';
import type { Counter } from './VotesPage';

export type VoteOption = 'all' | 'aFavor' | 'contra' | 'abstencoes' | 'nenhum';

export interface DeputyItem {
  name: string;
  party: string;
  state: string;
}

const DEPUTIES_API = /\/api\/deputados\?/;

/**
 * "Explorador de Deputados" screen.
 * All locators are scoped to the screen root because hidden screens stay in the DOM.
 */
export class DeputiesPage {
  readonly screen: Locator;
  readonly nameFilter: Locator;
  readonly partyFilter: Locator;
  readonly stateFilter: Locator;
  readonly list: Locator;
  readonly items: Locator;
  readonly counter: Locator;
  readonly votesPanel: Locator;
  readonly votesList: Locator;
  readonly voteItems: Locator;

  constructor(private readonly page: Page) {
    this.screen = page.getByTestId('deputados-screen');
    // On mobile, expanding the filters renders a second copy of the panel in a floating overlay,
    // which comes first in the DOM, while the original copy stays rendered behind the list.
    // `.first()` therefore targets the panel the user actually sees, on desktop and on mobile.
    // TODO: ask developers for a distinct test ID on the mobile overlay to remove this DOM-order dependency.
    const filters = this.screen.getByTestId('deputados-filters').first();
    this.nameFilter = filters.getByTestId('deputados-filter-name');
    this.partyFilter = filters.getByTestId('deputados-filter-party');
    this.stateFilter = filters.getByTestId('deputados-filter-state');
    this.list = this.screen.getByTestId('deputados-list');
    this.items = this.list.getByTestId(/^deputado-\d+$/);
    this.counter = this.screen.getByText(/^Deputados \(\d+ de \d+\)$/);
    this.votesPanel = this.screen.getByTestId('deputado-votes-panel');
    this.votesList = this.votesPanel.getByTestId('deputado-votes-list');
    // Anchored to the vote id ("2635476-36"): child buttons share the prefix
    // (deputado-votacao-details-*, deputado-votacao-proposicao-*) and must not match
    this.voteItems = this.votesList.getByTestId(/^deputado-votacao-\d+-\d+$/);
  }

  /**
   * Runs an action and waits for the first-page deputies API response
   * where `param` has the expected value (`null` = parameter absent).
   * Matching the exact request avoids catching unrelated lazy-loading requests.
   */
  private async waitForList(param: string, value: string | null, action: () => Promise<void>): Promise<Response> {
    const isExpected = (res: Response): boolean => {
      if (!DEPUTIES_API.test(res.url())) return false;
      const params = new URL(res.url()).searchParams;
      return params.get('pagina') === '0' && params.get(param) === value;
    };
    const [response] = await Promise.all([this.page.waitForResponse(isExpected), action()]);
    return response;
  }

  /**
   * On mobile the filters are collapsed behind a "Filtros · YEAR ▾" toggle.
   * Expands them, like a user would, before interacting with any filter.
   */
  async openFilters(): Promise<void> {
    const toggle = this.screen.getByTestId('deputados-filters-toggle');
    await this.items.first().waitFor();
    if ((await toggle.isVisible()) && (await toggle.innerText()).includes('▾')) {
      await toggle.click();
    }
  }

  /** Searches by name. The search is only triggered by pressing Enter. */
  async searchByName(name: string): Promise<Response> {
    await this.openFilters();
    await this.nameFilter.click();
    await this.nameFilter.fill(name);
    return this.waitForList('nome', name, () => this.nameFilter.press('Enter'));
  }

  /** Selects a party; use "Todos" to clear the filter. */
  async filterByParty(party: string): Promise<Response> {
    await this.openFilters();
    return this.waitForList('partido', party === 'Todos' ? null : party, async () => {
      await this.partyFilter.selectOption(party);
    });
  }

  /** Selects a state; use "Todos" to clear the filter. */
  async filterByState(state: string): Promise<Response> {
    await this.openFilters();
    return this.waitForList('uf', state === 'Todos' ? null : state, async () => {
      await this.stateFilter.selectOption(state);
    });
  }

  async readCounter(): Promise<Counter> {
    const text = await this.counter.innerText();
    const [, loaded, total] = text.match(/\((\d+) de (\d+)\)/) ?? [];
    return { loaded: Number(loaded), total: Number(total) };
  }

  async readAllItems(): Promise<DeputyItem[]> {
    const result: DeputyItem[] = [];
    for (const item of await this.items.all()) {
      const [name, partyState] = (await item.innerText()).split('\n').map((l) => l.trim());
      const [party, state] = partyState.split('-');
      result.push({ name, party, state });
    }
    return result;
  }

  async openDeputy(name: string): Promise<void> {
    await this.items.filter({ hasText: name }).first().click();
    await this.voteItems.first().waitFor();
  }

  voteFilter(option: VoteOption): Locator {
    return this.votesPanel.getByTestId(`deputado-vote-filter-${option}`);
  }

  /** Returns the vote option badge (e.g. "CONTRA") of each item in the deputy's history. */
  async readVoteOptions(): Promise<string[]> {
    const options: string[] = [];
    for (const item of await this.voteItems.all()) {
      options.push((await item.innerText()).split('\n')[1].trim().toUpperCase());
    }
    return options;
  }
}
