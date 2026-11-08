import { z } from 'zod';

/**
 * API contract, as consumed by the frontend.
 * Objects are not strict: extra fields are allowed so that backward-compatible
 * additions to the API do not break the tests.
 */

const isoDate = z.iso.date();

export const DeputyRefSchema = z.object({
  name: z.string().min(1),
  party: z.string().min(1),
  state: z.string().length(2),
});

export const ProposicaoSchema = z.object({
  id: z.number().int(),
  siglaTipo: z.string().min(1),
  numero: z.number().int(),
  ano: z.number().int(),
  ementa: z.string(),
});

export const VoteSchema = z.object({
  id: z.string().regex(/^\d+-\d+$/),
  data: isoDate,
  anoVotacao: z.number().int(),
  descricao: z.string(),
  resultado: z.enum(['aprovado', 'reprovado']),
  proposicoes: z.array(ProposicaoSchema),
  totais: z.object({
    aFavor: z.number().int().nonnegative(),
    contra: z.number().int().nonnegative(),
    abstencoes: z.number().int().nonnegative(),
  }),
  aFavor: z.array(DeputyRefSchema),
  contra: z.array(DeputyRefSchema),
  abstencoes: z.array(DeputyRefSchema),
});

export const DeputySchema = DeputyRefSchema.extend({
  id: z.number().int().positive(),
});

export const VoteOptionSchema = z.enum(['aFavor', 'contra', 'abstencoes', 'nenhum']);

export const DeputyVoteSchema = z.object({
  id: z.string().regex(/^\d+-\d+$/),
  data: isoDate,
  descricao: z.string(),
  resultado: z.enum(['aprovado', 'reprovado']),
  proposicoes: z.array(ProposicaoSchema),
  voto: VoteOptionSchema,
});

/** Generic paginated envelope used by every list endpoint. */
export const pageOf = <T extends z.ZodType>(item: T) =>
  z.object({
    itens: z.array(item),
    pagina: z.number().int().nonnegative(),
    tamanhoPagina: z.number().int().positive(),
    totalItens: z.number().int().nonnegative(),
    temProximaPagina: z.boolean(),
  });

export const VotesPageSchema = pageOf(VoteSchema);
export const DeputiesPageSchema = pageOf(DeputySchema);
export const DeputyVotesPageSchema = pageOf(DeputyVoteSchema);
export const PartiesSchema = z.array(z.string().min(1)).min(1);

export type Vote = z.infer<typeof VoteSchema>;
export type Deputy = z.infer<typeof DeputySchema>;
export type DeputyVote = z.infer<typeof DeputyVoteSchema>;
export type VoteOption = z.infer<typeof VoteOptionSchema>;
export type Page<T> = {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
  temProximaPagina: boolean;
};

/**
 * Validates `data` against `schema` and returns the list of contract violations
 * in a readable form (empty when valid). Use with `expect(...).toEqual([])`.
 */
export function contractViolations(schema: z.ZodType, data: unknown): string[] {
  const result = schema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
}
