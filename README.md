# VotoRadar QA

[![Tests](https://github.com/dalvamoreiradecastro/votosRadar-qa/actions/workflows/tests.yml/badge.svg)](https://github.com/dalvamoreiradecastro/votosRadar-qa/actions/workflows/tests.yml)
[![Lint](https://github.com/dalvamoreiradecastro/votosRadar-qa/actions/workflows/lint.yml/badge.svg)](https://github.com/dalvamoreiradecastro/votosRadar-qa/actions/workflows/lint.yml)

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

## Continuous integration

Two workflows run on every pull request and on every push to `main`:

| Workflow | Checks | Duration |
|---|---|---|
| [lint.yml](.github/workflows/lint.yml) | ESLint (zero warnings allowed) and TypeScript type check | ~30 s |
| [tests.yml](.github/workflows/tests.yml) | API tests and UI tests on 5 browsers/devices | ~10 min |

`main` is protected by a branch ruleset: changes go through a pull request, and the **"ESLint and type check"** check must pass before merging. Broken or sloppy code is stopped in seconds, before anyone spends time reviewing it.

The test workflow can also be started on demand:

- **API tests** run in their own job for fast feedback.
- **UI tests** run as a matrix: one parallel job per browser/device, each installing only the browser it needs.
- Each job uploads a blob report; a final job merges them into a single **HTML report**, available as the `playwright-report` artifact of the run.
- Failures are annotated directly on the pull request.

### Configuration, variables and secrets

Test jobs run inside a [GitHub Environment](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment) named after the target (`production`), so each environment keeps its own configuration in **Settings → Environments**:

| Name | Kind | Purpose |
|---|---|---|
| `BASE_URL` | Variable (optional) | Overrides the UI URL of the environment |
| `API_URL` | Variable (optional) | Overrides the API URL of the environment |

Nothing is hardcoded in the workflow, and when a variable is not set the defaults from [config/environment.ts](config/environment.ts) apply.

URLs are public, so they are stored as **variables**, which stay readable in the logs. **Secrets** are reserved for sensitive values such as tokens or passwords: GitHub encrypts them, masks them as `***` in the logs, and does not expose them to workflows triggered from forks. The site under test is public and needs no credentials, so the project currently has no secrets. A future one (e.g. an API token) would be added to the same environment and read as `${{ secrets.NAME }}`, never committed to the repository; locally, the git-ignored `.env` file plays the same role.
