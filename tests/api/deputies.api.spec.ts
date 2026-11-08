import { test, expect } from '../fixtures/api';
import {
  DeputiesPageSchema,
  DeputyVotesPageSchema,
  PartiesSchema,
  contractViolations,
  type DeputyVote,
  type Vote,
} from './support/schemas';

const CURRENT_YEAR = new Date().getFullYear();
// Test data: a deputy in office during the current legislature
const DEPUTY = { id: 220645, name: 'Erika Hilton', party: 'PSOL', state: 'SP' };

/** Deputy history items whose option is not reflected in the corresponding vote. */
function historyMismatches(history: DeputyVote[], votes: Vote[], deputyLabel: string): string[] {
  const byId = new Map(votes.map((v) => [v.id, v]));
  return history
    .filter((item) => item.voto !== 'nenhum')
    .flatMap((item) => {
      const vote = byId.get(item.id);
      if (!vote) return [`${item.id}: not found in the votes list`];
      const voteOption = item.voto as 'aFavor' | 'contra' | 'abstencoes';
      const listed = vote[voteOption].some((d) => `${d.name} (${d.party}-${d.state})` === deputyLabel);
      return listed ? [] : [`${item.id}: deputy voted "${item.voto}" but is not in that list`];
    });
}

test.describe('Deputies API', () => {
  test('TC-API-006 deputies can be filtered by name', async ({ api }) => {
    const response = await api.getDeputies({ year: CURRENT_YEAR, name: 'Erika' });
    const body = await response.json();

    expect(contractViolations(DeputiesPageSchema, body)).toEqual([]);
    expect(body.totalItens).toBeGreaterThan(0);
    for (const deputy of body.itens) {
      expect(deputy.name.toLowerCase()).toContain('erika');
    }
  });

  test('TC-API-006 deputies can be filtered by party and state', async ({ api }) => {
    const [byParty, byPartyAndState] = await Promise.all([
      api.deputiesJson({ year: CURRENT_YEAR, party: 'PSOL' }),
      api.deputiesJson({ year: CURRENT_YEAR, party: 'PSOL', state: 'SP' }),
    ]);

    expect(byParty.itens.map((d) => d.party)).toEqual(byParty.itens.map(() => 'PSOL'));
    expect(byPartyAndState.itens.map((d) => `${d.party}-${d.state}`)).toEqual(
      byPartyAndState.itens.map(() => 'PSOL-SP'),
    );
    expect(byPartyAndState.totalItens).toBeGreaterThan(0);
    expect(byPartyAndState.totalItens).toBeLessThanOrEqual(byParty.totalItens);
  });

  test('TC-API-007 parties endpoint returns a unique, sorted list', async ({ api }) => {
    const response = await api.getParties(CURRENT_YEAR);
    expect(response.status()).toBe(200);

    const parties: string[] = await response.json();
    expect(contractViolations(PartiesSchema, parties)).toEqual([]);
    expect(new Set(parties).size, 'no duplicates').toBe(parties.length);
    expect(parties).toEqual([...parties].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  });

  test('TC-API-008 deputy voting history returns votes for that deputy', async ({ api }) => {
    const response = await api.getDeputyVotes(DEPUTY.id, { year: CURRENT_YEAR });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(contractViolations(DeputyVotesPageSchema, body)).toEqual([]);
    expect(body.itens.length).toBeGreaterThan(0);
    for (const vote of body.itens) {
      expect(vote.data, vote.id).toMatch(new RegExp(`^${CURRENT_YEAR}-`));
    }
  });

  test('TC-API-008 unknown deputy does not cause a server error', async ({ api }) => {
    const response = await api.getDeputyVotes(0, { year: CURRENT_YEAR });

    expect(response.status()).toBeLessThan(500);
    expect([200, 404]).toContain(response.status());
  });

  test('TC-API-009 deputy history matches the vote lists', async ({ api }) => {
    const [history, votes] = await Promise.all([
      api.allDeputyVotes(DEPUTY.id, CURRENT_YEAR),
      api.allVotes(CURRENT_YEAR),
    ]);
    const label = `${DEPUTY.name} (${DEPUTY.party}-${DEPUTY.state})`;

    expect(history.length).toBeGreaterThan(0);
    expect(historyMismatches(history, votes, label)).toEqual([]);
  });

  test('TC-API-010 name search is case-insensitive', async ({ api }) => {
    const [mixed, lower, upper] = await Promise.all(
      ['Erika', 'erika', 'ERIKA'].map((name) => api.deputiesJson({ year: CURRENT_YEAR, name })),
    );

    expect(lower.totalItens).toBe(mixed.totalItens);
    expect(upper.totalItens).toBe(mixed.totalItens);
  });

  test('TC-API-010 name search is accent-insensitive', async ({ api }) => {
    test.fail(true, 'Known issue: "samia" does not find "Sâmia Bomfim"');
    const [withAccent, withoutAccent] = await Promise.all(
      ['Sâmia', 'Samia'].map((name) => api.deputiesJson({ year: CURRENT_YEAR, name })),
    );

    expect(withAccent.totalItens).toBeGreaterThan(0);
    expect(withoutAccent.totalItens).toBe(withAccent.totalItens);
  });
});
