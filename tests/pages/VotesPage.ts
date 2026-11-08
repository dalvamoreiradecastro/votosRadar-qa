import type { Locator, Page, Response } from '@playwright/test';

export interface VoteCard {
  date: string;
  id: string;
  status: string;
  description: string;
  inFavor: number;
  against: number;
  abstentions: number;
}

export interface Counter {
  loaded: number;
  total: number;
}

const VOTES_API = /\/api\/votacoes\?/;

/**
 * "Explorador de Votações" screen.
 * All locators are scoped to the screen root because hidden screens stay in the DOM.
 */
export class VotesPage {
  readonly screen: Locator;
  readonly list: Locator;
  readonly cards: Locator;
  readonly counter: Locator;
  readonly detailsPanel: Locator;

  constructor(private readonly page: Page) {
    this.screen = page.getByTestId('votacoes-screen');
    this.list = this.screen.getByTestId('votacoes-list');
    this.cards = this.list.getByTestId(/^votacao-\d/);
    this.counter = this.screen.getByText(/^Votações \(\d+ de \d+\)$/);
    this.detailsPanel = this.screen.getByTestId('votacao-details-panel');
  }

  /** Opens the home page and returns the initial (first page) votes API response. */
  async goto(): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse((res) => VOTES_API.test(res.url()) && res.url().includes('pagina=0')),
      this.page.goto('/'),
    ]);
    return response;
  }

  yearButton(year: number): Locator {
    return this.screen.getByTestId(`votacoes-filter-year-${year}`);
  }

  /** Selects a year and returns the votes API response for it. */
  async selectYear(year: number): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => VOTES_API.test(res.url()) && res.url().includes(`ano=${year}`) && res.url().includes('pagina=0'),
      ),
      this.yearButton(year).click(),
    ]);
    return response;
  }

  /** Selects the year only if the list is not already showing it. */
  async showYear(year: number): Promise<void> {
    await this.cards.first().waitFor();
    const first = await this.readCard(this.cards.first());
    if (!first.date.startsWith(String(year))) {
      await this.selectYear(year);
    }
  }

  card(id: string): Locator {
    return this.list.getByTestId(`votacao-${id}`);
  }

  /** Scrolls the lazily loaded list until the given card is loaded (or no more pages load). */
  async loadUntilVisible(card: Locator, maxPages = 20): Promise<void> {
    for (let page = 0; page < maxPages && !(await card.isVisible()); page++) {
      const loaded = await this.cards.count();
      await this.cards.last().scrollIntoViewIfNeeded();
      try {
        await this.cards.nth(loaded).waitFor({ timeout: 5_000 });
      } catch {
        return; // no more pages
      }
    }
  }

  /**
   * Reads the deputies listed in the details panel, grouped by vote option.
   * Example: { "A FAVOR": ["Name (PARTY-UF)"], "CONTRA": [...] }
   */
  async readVoteGroups(): Promise<Record<string, string[]>> {
    const lines = (await this.detailsPanel.innerText()).split('\n').map((l) => l.trim());
    const groups: Record<string, string[]> = {};
    let current: string[] | null = null;
    for (const line of lines) {
      const header = line.match(/^([A-ZÀ-Ú ]+) · \d+$/);
      if (header) {
        current = groups[header[1]] = [];
      } else if (current && /\(.+-[A-Z]{2}\)$/.test(line)) {
        current.push(line);
      }
    }
    return groups;
  }

  async readCounter(): Promise<Counter> {
    const text = await this.counter.innerText();
    const [, loaded, total] = text.match(/\((\d+) de (\d+)\)/) ?? [];
    return { loaded: Number(loaded), total: Number(total) };
  }

  async readCard(card: Locator): Promise<VoteCard> {
    const lines = (await card.innerText()).split('\n').map((l) => l.trim()).filter(Boolean);
    const [date, id] = lines[0].split(' · ');
    const footer = lines[lines.length - 1];
    const count = (label: RegExp): number => Number(footer.match(label)?.[1] ?? NaN);

    return {
      date,
      id,
      status: lines[1].toLowerCase(),
      description: lines.slice(2, -1).join(' '),
      inFavor: count(/(\d+) a favor/),
      against: count(/(\d+) contra/),
      abstentions: count(/(\d+) abstenç/),
    };
  }

  async readAllCards(): Promise<VoteCard[]> {
    const cards: VoteCard[] = [];
    for (const card of await this.cards.all()) {
      cards.push(await this.readCard(card));
    }
    return cards;
  }
}
