import type { Locator, Page, Response } from '@playwright/test';
import { ENDPOINTS, isEndpoint } from '../../config/endpoints';
import { BasePage } from './BasePage';

export interface VoteCard {
  date: string;
  id: string;
  status: string;
  description: string;
  inFavor: number;
  against: number;
  abstentions: number;
}

/**
 * True for the first-page response of the votes list, optionally for a given year.
 * Later pages come from lazy loading while scrolling and must not be confused with it.
 */
function isFirstVotesPage(res: Response, year?: number): boolean {
  if (!isEndpoint(res.url(), ENDPOINTS.votes)) return false;
  const params = new URL(res.url()).searchParams;
  return params.get('pagina') === '0' && (year === undefined || params.get('ano') === String(year));
}

/** "Explorador de Votações" screen. */
export class VotesPage extends BasePage {
  readonly list: Locator;
  readonly cards: Locator;
  readonly detailsPanel: Locator;

  constructor(page: Page) {
    super(page, 'votacoes-screen', 'Votações');
    this.list = this.screen.getByTestId('votacoes-list');
    this.cards = this.list.getByTestId(/^votacao-\d/);
    this.detailsPanel = this.screen.getByTestId('votacao-details-panel');
  }

  /** Opens the home page and returns the initial (first page) votes API response. */
  async goto(): Promise<Response> {
    return this.actAndWaitForResponse(
      (res) => isFirstVotesPage(res),
      () => this.page.goto('/'),
    );
  }

  yearButton(year: number): Locator {
    return this.screen.getByTestId(`votacoes-filter-year-${year}`);
  }

  /** Selects a year and returns the votes API response for it. */
  async selectYear(year: number): Promise<Response> {
    return this.actAndWaitForResponse(
      (res) => isFirstVotesPage(res, year),
      () => this.yearButton(year).click(),
    );
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
