import { test, expect } from '../fixtures/api';
import { VotesPageSchema, contractViolations, type Vote } from './support/schemas';

const CURRENT_YEAR = new Date().getFullYear();
const PAST_YEAR = 2025;

/** Mismatches between `totais` and the deputy lists of each vote. */
function totalsMismatches(votes: Vote[]): string[] {
  return votes.flatMap((v) => {
    const counted = { aFavor: v.aFavor.length, contra: v.contra.length, abstencoes: v.abstencoes.length };
    return JSON.stringify(counted) === JSON.stringify(v.totais)
      ? []
      : [`${v.id}: totais=${JSON.stringify(v.totais)} lists=${JSON.stringify(counted)}`];
  });
}

test.describe('Votes API', () => {
  test('TC-API-001 list votes returns a valid paginated response', async ({ api }) => {
    const response = await api.getVotes({ year: CURRENT_YEAR });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(contractViolations(VotesPageSchema, body)).toEqual([]);
    expect(body.pagina).toBe(0);
    expect(body.itens.length).toBeGreaterThan(0);
    expect(body.itens.length).toBeLessThanOrEqual(body.tamanhoPagina);
  });

  test('TC-API-002 vote totals match the lists of deputies', async ({ api }) => {
    const votes = await api.allVotes(PAST_YEAR);

    expect(votes.length).toBeGreaterThan(0);
    expect(totalsMismatches(votes)).toEqual([]);
  });

  test('TC-API-003 votes are filtered by the requested year', async ({ api }) => {
    const votes = await api.allVotes(PAST_YEAR);

    const wrongYear = votes.filter((v) => v.anoVotacao !== PAST_YEAR || !v.data.startsWith(`${PAST_YEAR}-`));
    expect(wrongYear.map((v) => `${v.id} (${v.data})`)).toEqual([]);
  });

  test('TC-API-004 pagination is consistent', async ({ api }) => {
    const [page0, page1, beyond] = await Promise.all([
      api.votesJson({ year: CURRENT_YEAR, page: 0 }),
      api.votesJson({ year: CURRENT_YEAR, page: 1 }),
      api.votesJson({ year: CURRENT_YEAR, page: 999 }),
    ]);

    const ids0 = page0.itens.map((v) => v.id);
    const ids1 = page1.itens.map((v) => v.id);
    expect(ids1.filter((id) => ids0.includes(id)), 'pages must not overlap').toEqual([]);
    expect(page1.totalItens).toBe(page0.totalItens);

    const hasMoreAfterFirstPage = page0.totalItens > page0.tamanhoPagina;
    expect(page0.temProximaPagina).toBe(hasMoreAfterFirstPage);

    expect(beyond.itens).toEqual([]);
    expect(beyond.temProximaPagina).toBe(false);
  });

  test('TC-API-005 invalid page returns a clear 400 error', async ({ api }) => {
    const response = await api.getVotesRaw({ ano: String(CURRENT_YEAR), pagina: '-1' });

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('pagina must be non-negative');
  });

  test('TC-API-005 invalid year returns a 400 error without internal details', async ({ api }) => {
    test.fail(true, 'Known bug: raw Java exception message "For input string" is returned');
    const response = await api.getVotesRaw({ ano: 'abc', pagina: '0' });

    expect(response.status()).toBe(400);
    expect(await response.text()).not.toContain('For input string');
  });

  test('TC-API-005 missing year returns a 400 error', async ({ api }) => {
    const response = await api.getVotesRaw({ pagina: '0' });

    expect(response.status()).toBe(400);
  });
});
