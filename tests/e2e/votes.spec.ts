import { test, expect } from '../fixtures/pages';
import type { VoteCard } from '../pages/VotesPage';

const CURRENT_YEAR = new Date().getFullYear();

/** Extracts the "Sim"/"Não" counts from a vote description, if present. */
function parseSummary(description: string): { yes: number; no: number } | null {
  const yes = description.match(/(\d+) votos? ["“']Sim["”']/i);
  const no = description.match(/(\d+) votos? ["“']Não["”']/i);
  return yes && no ? { yes: Number(yes[1]), no: Number(no[1]) } : null;
}

/** Cards whose description has numeric results, paired with the parsed values. */
function cardsWithSummary(cards: VoteCard[]) {
  return cards
    .map((card) => ({ card, summary: parseSummary(card.description) }))
    .filter((c): c is { card: VoteCard; summary: { yes: number; no: number } } => c.summary !== null);
}

/** Expected badge for a description, or null when the outcome is not stated. */
function expectedStatus(description: string): string | null {
  if (/^aprovad/i.test(description)) return 'aprovado';
  if (/^rejeitad/i.test(description)) return 'reprovado';
  return null;
}

test.describe('Votes explorer', () => {
  test('TC-VOT-001 current year is loaded by default', async ({ votesPage }) => {
    const response = await votesPage.goto();

    expect(response.url()).toContain(`ano=${CURRENT_YEAR}`);
    await expect(votesPage.yearButton(2016)).toBeVisible();
    await expect(votesPage.yearButton(CURRENT_YEAR)).toBeVisible();
    await expect(votesPage.cards.first()).toBeVisible();

    const { loaded, total } = await votesPage.readCounter();
    expect(loaded).toBeGreaterThan(0);
    expect(loaded).toBeLessThanOrEqual(total);
  });

  test('TC-VOT-002 selecting a year lists only votes from that year', async ({ votesPage }) => {
    await votesPage.goto();

    const response = await votesPage.selectYear(2025);
    const body = await response.json();

    await expect(votesPage.counter).toContainText(`de ${body.totalItens})`);
    const cards = await votesPage.readAllCards();
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.date, `vote ${card.id}`).toMatch(/^2025-/);
    }
  });

  test('TC-VOT-003 counter reflects the number of loaded cards', async ({ votesPage }) => {
    const response = await votesPage.goto();
    const body = await response.json();
    await expect(votesPage.cards.first()).toBeVisible();

    const { loaded, total } = await votesPage.readCounter();
    await expect(votesPage.cards).toHaveCount(loaded);
    expect(total).toBe(body.totalItens);
  });

  test('TC-VOT-004 scrolling loads more votes without duplicates', async ({ votesPage }) => {
    await votesPage.goto();
    await expect(votesPage.cards.first()).toBeVisible();
    const before = await votesPage.readCounter();
    test.skip(before.total <= before.loaded, 'Not enough votes to paginate');

    await votesPage.cards.last().scrollIntoViewIfNeeded();
    await expect(votesPage.cards).not.toHaveCount(before.loaded);

    const after = await votesPage.readCounter();
    expect(after.loaded).toBeGreaterThan(before.loaded);
    expect(after.loaded).toBeLessThanOrEqual(after.total);

    const ids = (await votesPage.readAllCards()).map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('TC-VOT-005 details panel shows a hint before selection', async ({ votesPage, isMobile }) => {
    test.skip(isMobile, 'The hint is only shown in the desktop side-by-side layout');
    await votesPage.goto();

    await expect(votesPage.detailsPanel).toHaveText('Selecione uma votação para ver os detalhes.');
  });

  test('TC-VOT-006 selecting a vote shows its details', async ({ votesPage, isMobile }) => {
    test.skip(isMobile, 'Details panel layout differs on mobile');
    await votesPage.goto();

    for (const card of [votesPage.cards.nth(0), votesPage.cards.nth(1)]) {
      const data = await votesPage.readCard(card);
      await card.click();

      await expect(votesPage.detailsPanel).toContainText(`${data.date} · ${data.id}`);
      await expect(votesPage.detailsPanel).toContainText(new RegExp(data.status, 'i'));
      await expect(votesPage.detailsPanel).toContainText('Proposições votadas');
      await expect(votesPage.detailsPanel).toContainText('Resultado dos votos');
    }
  });

  test('TC-VOT-007 vote counts on the card match the summary text', async ({ votesPage }) => {
    await votesPage.goto();
    await expect(votesPage.cards.first()).toBeVisible();

    const checked = cardsWithSummary(await votesPage.readAllCards());
    expect(checked.length, 'at least one vote with a numeric summary').toBeGreaterThan(0);

    // Comparing whole objects reports every mismatching vote at once
    const fromCards = checked.map(({ card }) => ({ id: card.id, yes: card.inFavor, no: card.against }));
    const fromText = checked.map(({ card, summary }) => ({ id: card.id, ...summary }));
    expect(fromCards).toEqual(fromText);
  });

  test('TC-VOT-008 status badge is consistent with the outcome', async ({ votesPage }) => {
    await votesPage.goto();
    await expect(votesPage.cards.first()).toBeVisible();

    const checked = (await votesPage.readAllCards())
      .map((card) => ({ id: card.id, badge: card.status, expected: expectedStatus(card.description) }))
      .filter((c) => c.expected !== null);
    expect(checked.length, 'at least one vote with a stated outcome').toBeGreaterThan(0);

    expect(checked.map((c) => ({ id: c.id, badge: c.badge }))).toEqual(
      checked.map((c) => ({ id: c.id, badge: c.expected })),
    );
  });

  test('TC-VOT-009 year without votes shows an empty state', async ({ page, votesPage }) => {
    await page.route('**/api/votacoes?**', (route) =>
      route.fulfill({
        json: { itens: [], pagina: 0, tamanhoPagina: 10, totalItens: 0, temProximaPagina: false },
      }),
    );
    await votesPage.goto();

    await expect(votesPage.cards).toHaveCount(0);
    await expect(votesPage.screen.getByText(/nenhuma votação/i)).toBeVisible();
  });

  test('TC-VOT-010 API failure shows a friendly error message', async ({ page, votesPage }) => {
    // Known bug: the raw "500 Internal Server Error" message is displayed,
    // together with a misleading "Nenhuma votação encontrada." empty state.
    test.fail(true, 'Known bug: technical error message shown to the user');

    await page.route('**/api/votacoes?**', (route) =>
      route.fulfill({ status: 500, body: 'Internal Server Error' }),
    );
    await votesPage.goto();

    await expect(votesPage.screen).not.toContainText('Internal Server Error');
    await expect(votesPage.screen).not.toContainText('Nenhuma votação encontrada');
    await expect(votesPage.screen.getByText(/não foi possível|tente novamente/i)).toBeVisible();
  });
});
