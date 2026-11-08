import { test, expect } from '../fixtures/pages';
import { env } from '../../config/environment';

const CURRENT_YEAR = new Date().getFullYear();

// Test data: a deputy in office during the current legislature
const DEPUTY = { name: 'Erika Hilton', party: 'PSOL', state: 'SP' };

test.describe('Deputies explorer', () => {
  test.beforeEach(async ({ page, navigation, deputiesPage }) => {
    await page.goto('/');
    await navigation.goTo('deputados');
    await expect(deputiesPage.items.first()).toBeVisible();
  });

  test('TC-DEP-001 list loads with default filters', async ({ deputiesPage }) => {
    await expect(deputiesPage.nameFilter).toHaveValue('');
    await expect(deputiesPage.partyFilter.locator('option:checked')).toHaveText('Todos');
    await expect(deputiesPage.stateFilter.locator('option:checked')).toHaveText('Todos');

    const { loaded, total } = await deputiesPage.readCounter();
    expect(loaded).toBeGreaterThan(0);
    expect(loaded).toBeLessThanOrEqual(total);

    const [first] = await deputiesPage.readAllItems();
    expect(first.name).not.toBe('');
    expect(first.party).toMatch(/^[A-Za-zÀ-ú]+$/);
    expect(first.state).toMatch(/^[A-Z]{2}$/);
  });

  test('TC-DEP-001 details area shows a hint before selection (desktop)', async ({ deputiesPage, isMobile }) => {
    test.skip(isMobile, 'The hint is only shown in the desktop side-by-side layout');
    await expect(deputiesPage.screen).toContainText('Selecione um deputado para ver como ele votou.');
  });

  test('TC-DEP-002 search by name returns only matching deputies', async ({ deputiesPage }) => {
    const body = await (await deputiesPage.searchByName('Erika')).json();
    await expect(deputiesPage.counter).toContainText(`de ${body.totalItens})`);

    const deputies = await deputiesPage.readAllItems();
    expect(deputies.length).toBeGreaterThan(0);
    for (const deputy of deputies) {
      expect(deputy.name.toLowerCase()).toContain('erika');
    }
  });

  test('TC-DEP-003 search with no matches shows an empty state', async ({ deputiesPage }) => {
    await deputiesPage.searchByName('zzzzzz');

    await expect(deputiesPage.items).toHaveCount(0);
    await expect(deputiesPage.screen.getByText(/nenhum deputado/i)).toBeVisible();
  });

  test('TC-DEP-004 filter by party', async ({ page, deputiesPage }) => {
    const body = await (await deputiesPage.filterByParty('PSOL')).json();
    await expect(deputiesPage.counter).toContainText(`de ${body.totalItens})`);

    for (const deputy of await deputiesPage.readAllItems()) {
      expect(deputy.party, deputy.name).toBe('PSOL');
    }

    // The API may live on a different host than the UI (e.g. locally), so use the configured API URL
    const parties = await (await page.request.get(`${env.apiURL}/api/deputados/partidos?ano=${CURRENT_YEAR}`)).json();
    await expect(deputiesPage.partyFilter.locator('option')).toHaveText(['Todos', ...parties]);
  });

  test('TC-DEP-005 filter by state', async ({ deputiesPage }) => {
    const body = await (await deputiesPage.filterByState('SP')).json();
    await expect(deputiesPage.counter).toContainText(`de ${body.totalItens})`);

    for (const deputy of await deputiesPage.readAllItems()) {
      expect(deputy.state, deputy.name).toBe('SP');
    }
    // "Todos" + 26 states + the Federal District
    await expect(deputiesPage.stateFilter.locator('option')).toHaveCount(28);
  });

  test('TC-DEP-006 combine party and state filters', async ({ deputiesPage }) => {
    const partyOnly = await (await deputiesPage.filterByParty('PSOL')).json();
    await expect(deputiesPage.counter).toContainText(`de ${partyOnly.totalItens})`);

    const combined = await (await deputiesPage.filterByState('SP')).json();
    await expect(deputiesPage.counter).toContainText(`de ${combined.totalItens})`);
    expect(combined.totalItens).toBeLessThanOrEqual(partyOnly.totalItens);
    for (const deputy of await deputiesPage.readAllItems()) {
      expect(`${deputy.party}-${deputy.state}`, deputy.name).toBe('PSOL-SP');
    }

    const stateOnly = await (await deputiesPage.filterByParty('Todos')).json();
    await expect(deputiesPage.counter).toContainText(`de ${stateOnly.totalItens})`);
    for (const deputy of await deputiesPage.readAllItems()) {
      expect(deputy.state, deputy.name).toBe('SP');
    }
  });

  test('TC-DEP-007 selecting a deputy shows their voting history', async ({ deputiesPage }) => {
    await deputiesPage.searchByName(DEPUTY.name);
    await deputiesPage.openDeputy(DEPUTY.name);

    await expect(deputiesPage.votesPanel).toContainText(
      new RegExp(`${DEPUTY.name} \\(${DEPUTY.party}-${DEPUTY.state}\\) · \\d+ votações`),
    );
    for (const option of ['all', 'aFavor', 'contra', 'abstencoes', 'nenhum'] as const) {
      await expect(deputiesPage.voteFilter(option)).toBeVisible();
    }
    await expect(deputiesPage.voteItems.first()).toContainText(/\d{4}-\d{2}-\d{2} · \d+-\d+/);
  });

  test('TC-DEP-008 filter a deputy history by vote option', async ({ deputiesPage }) => {
    await deputiesPage.searchByName(DEPUTY.name);
    await deputiesPage.openDeputy(DEPUTY.name);

    for (const [option, badge] of [['contra', 'CONTRA'], ['aFavor', 'A FAVOR']] as const) {
      await deputiesPage.voteFilter(option).click();
      await expect
        .poll(async () => {
          const options = await deputiesPage.readVoteOptions();
          return options.length > 0 && options.every((o) => o === badge);
        }, { message: `all items should be "${badge}"` })
        .toBe(true);
    }
  });

  test('TC-DEP-009 deputy vote matches the vote details', async ({ navigation, deputiesPage, votesPage, isMobile }) => {
    test.skip(isMobile, 'Details panel layout differs on mobile');

    await deputiesPage.searchByName(DEPUTY.name);
    await deputiesPage.openDeputy(DEPUTY.name);
    await deputiesPage.voteFilter('contra').click();
    await expect.poll(() => deputiesPage.readVoteOptions()).toContain('CONTRA');

    const [header] = (await deputiesPage.voteItems.first().innerText()).split('\n');
    const [date, voteId] = header.split(' · ');

    await navigation.goTo('votacoes');
    await votesPage.showYear(Number(date.slice(0, 4)));

    const card = votesPage.card(voteId);
    await votesPage.loadUntilVisible(card);
    await card.click();
    await expect(votesPage.detailsPanel).toContainText(voteId);

    const groups = await votesPage.readVoteGroups();
    expect(groups.CONTRA, 'details panel has a "CONTRA" group').toBeDefined();
    expect(groups.CONTRA).toContain(`${DEPUTY.name} (${DEPUTY.party}-${DEPUTY.state})`);
  });
});
