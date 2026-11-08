import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Deputy, DeputyVote, Page, Vote } from './schemas';

export interface PageQuery {
  year: number;
  page?: number;
}

export interface DeputiesQuery extends PageQuery {
  name?: string;
  party?: string;
  state?: string;
}

/**
 * Thin client for the VotoRadar backend, the API equivalent of a page object.
 * Methods return the raw APIResponse so tests can assert on status codes;
 * `*Json` helpers return the parsed body for data-focused tests.
 */
export class VotoRadarApi {
  constructor(private readonly request: APIRequestContext) {}

  getVotes({ year, page = 0 }: PageQuery): Promise<APIResponse> {
    return this.request.get('/api/votacoes', { params: { ano: year, pagina: page } });
  }

  /** Sends raw query parameters, for negative tests with invalid values. */
  getVotesRaw(params: Record<string, string>): Promise<APIResponse> {
    return this.request.get('/api/votacoes', { params });
  }

  getDeputies({ year, page = 0, name, party, state }: DeputiesQuery): Promise<APIResponse> {
    const params: Record<string, string | number> = { ano: year, pagina: page };
    if (name) params.nome = name;
    if (party) params.partido = party;
    if (state) params.uf = state;
    return this.request.get('/api/deputados', { params });
  }

  getParties(year: number): Promise<APIResponse> {
    return this.request.get('/api/deputados/partidos', { params: { ano: year } });
  }

  getDeputyVotes(deputyId: number, { year, page = 0 }: PageQuery): Promise<APIResponse> {
    return this.request.get(`/api/deputados/${deputyId}/votacoes`, { params: { ano: year, pagina: page } });
  }

  async votesJson(query: PageQuery): Promise<Page<Vote>> {
    return (await this.getVotes(query)).json();
  }

  async deputiesJson(query: DeputiesQuery): Promise<Page<Deputy>> {
    return (await this.getDeputies(query)).json();
  }

  async deputyVotesJson(deputyId: number, query: PageQuery): Promise<Page<DeputyVote>> {
    return (await this.getDeputyVotes(deputyId, query)).json();
  }

  /** Fetches every page of votes for a year. */
  allVotes(year: number): Promise<Vote[]> {
    return this.allPages((page) => this.votesJson({ year, page }));
  }

  /** Fetches a deputy's complete voting history for a year. */
  allDeputyVotes(deputyId: number, year: number): Promise<DeputyVote[]> {
    return this.allPages((page) => this.deputyVotesJson(deputyId, { year, page }));
  }

  /** Reads the first page to learn the total, then requests the remaining pages in parallel. */
  private async allPages<T>(fetchPage: (page: number) => Promise<Page<T>>): Promise<T[]> {
    const first = await fetchPage(0);
    const pageCount = Math.ceil(first.totalItens / first.tamanhoPagina);
    const rest = await Promise.all(Array.from({ length: pageCount - 1 }, (_, i) => fetchPage(i + 1)));
    return [first, ...rest].flatMap((p) => p.itens);
  }
}
