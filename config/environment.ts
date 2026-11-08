import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Loads variables from a local .env file, if present. Real environment variables take precedence.
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

/**
 * Known environments. In production the UI and the API share the same domain;
 * locally (docker compose) the frontend and backend run on different ports.
 */
const ENVIRONMENTS = {
  production: {
    baseURL: 'https://votoradar.y4tress.com',
    apiURL: 'https://votoradar.y4tress.com',
  },
  local: {
    baseURL: 'http://localhost:8081',
    apiURL: 'http://localhost:8080',
  },
} as const;

type EnvironmentName = keyof typeof ENVIRONMENTS;

const EnvSchema = z.object({
  TEST_ENV: z.enum(Object.keys(ENVIRONMENTS) as [EnvironmentName, ...EnvironmentName[]]).default('production'),
  BASE_URL: z.url().optional(),
  API_URL: z.url().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid test environment configuration:\n${details}\nSee .env.example for the expected variables.`);
}

const { TEST_ENV, BASE_URL, API_URL } = parsed.data;

/** Resolved configuration: explicit URLs override the defaults of the selected environment. */
export const env = {
  name: TEST_ENV,
  baseURL: BASE_URL ?? ENVIRONMENTS[TEST_ENV].baseURL,
  apiURL: API_URL ?? ENVIRONMENTS[TEST_ENV].apiURL,
  isProduction: TEST_ENV === 'production',
} as const;
