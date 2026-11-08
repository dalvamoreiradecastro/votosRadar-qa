# VotoRadar QA

Test automation portfolio for [VotoRadar](https://votoradar.y4tress.com), a portal that shows how Brazilian federal deputies voted on legislative proposals.

> 🚧 Work in progress

## What's inside

| Area | Location |
|---|---|
| Test plan (scope, risks, approach) | [docs/test-plan.md](docs/test-plan.md) |
| Manual test cases | [docs/test-cases/](docs/test-cases/) |
| End-to-end UI tests (Page Object Model) | [tests/e2e/](tests/e2e/), [tests/pages/](tests/pages/) |
| API tests (schema + functional) | [tests/api/](tests/api/) |
| Environment configuration | [config/environment.ts](config/environment.ts) |

## Getting started

Requirements: Node.js 22+.

```bash
npm install
npx playwright install --with-deps
cp .env.example .env   # optional, defaults to production
```

## Running the tests

| Command | What it runs |
|---|---|
| `npm test` | All tests (API + UI on 5 browsers/devices) |
| `npm run test:api` | API tests only |
| `npm run test:e2e` | UI tests on Chromium, Firefox, WebKit, Pixel 7 and iPhone 14 |
| `npm run test:ui` | Playwright UI mode, for debugging |
| `npm run report` | Opens the last HTML report |
| `npm run lint` / `npm run typecheck` | Static checks |

## Environments

The same test code runs against any environment. The target is selected with `TEST_ENV`:

| `TEST_ENV` | UI | API |
|---|---|---|
| `production` (default) | https://votoradar.y4tress.com | https://votoradar.y4tress.com |
| `local` | http://localhost:8081 | http://localhost:8080 |

```bash
npm run test:prod     # TEST_ENV=production
npm run test:local    # TEST_ENV=local (start the app first with `docker compose up`)
```

`BASE_URL` and `API_URL` override the URLs of the selected environment, e.g. for a preview deployment. Configuration is validated on startup, so a typo such as `TEST_ENV=prodution` fails immediately with a clear message. See [.env.example](.env.example).
