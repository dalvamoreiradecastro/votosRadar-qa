/**
 * Backend API paths: the single source of truth for every test that calls, waits for or mocks the API.
 * The host comes from the selected environment (see ./environment.ts); only paths live here.
 */
export const ENDPOINTS = {
  votes: '/api/votacoes',
  deputies: '/api/deputados',
  parties: '/api/deputados/partidos',
  deputyVotes: (deputyId: number) => `/api/deputados/${deputyId}/votacoes`,
} as const;

/**
 * True when `url` points to the given endpoint path, whatever the host and query string.
 * Works for `page.route()` predicates and `waitForResponse()` filters alike, so tests
 * never need to rewrite a path as a regex or a glob.
 */
export function isEndpoint(url: string | URL, path: string): boolean {
  return new URL(url).pathname === path;
}
