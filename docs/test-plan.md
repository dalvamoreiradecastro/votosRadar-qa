# Test Plan — VotoRadar

| Field | Value |
|---|---|
| Application | [VotoRadar](https://votoradar.y4tress.com) — Legislative Voting Portal |
| Author | Dalva Castro |
| Version | 1.0 |
| Last updated | 2026-11-08 |

## 1. Introduction

VotoRadar is a read-only web portal that lets citizens explore votes held in the Brazilian Chamber of Deputies (Câmara dos Deputados): which bills were voted on, the outcome, and how each deputy voted. A Senate section exists in the menu but has no data yet.

This plan defines what will be tested, how, and which risks drive prioritization. Testing is performed with the knowledge and consent of the site owner.

## 2. Application overview

- **Type:** Single Page Application built with Expo (React Native for Web); content is rendered client-side
- **Routing:** navigation and filters do not change the URL (no deep links)
- **Authentication:** none, all content is public
- **Main areas:**
  - **Chamber › Votes:** year filter (2016–2026), lazily loaded list of votes, details panel (date, ID, status, summary, bills voted, vote results)
  - **Chamber › Deputies:** list of deputies and their votes
  - **Senate:** placeholder, no data yet
  - **Global:** sidebar menu, light/dark theme toggle, system status indicator
- **Backend API** (consumed by the frontend):

  | Endpoint | Purpose |
  |---|---|
  | `GET /api/votacoes?ano={year}&pagina={page}` | Paginated votes for a year, including totals and the list of deputies per vote option |
  | `GET /api/deputados?ano={year}&pagina={page}` | Paginated list of deputies |
  | `GET /api/deputados/partidos?ano={year}` | List of parties |
  | `GET /api/deputados/{id}/votacoes?ano={year}&pagina={page}` | Voting history of a deputy |

- **Data source:** voting data appears to come from the Chamber of Deputies Open Data API (`dadosabertos.camara.leg.br`), which serves as the test oracle for data accuracy checks.

## 3. Scope

### 3.1 In scope

| ID | Feature | Notes |
|---|---|---|
| F01 | Navigation | Sidebar menu, expand/collapse Chamber and Senate sections, active item highlight |
| F02 | Year filter | Default year, switching years, list and counter update |
| F03 | Votes list | Card content, total counter (`X of Y`), lazy loading on scroll |
| F04 | Vote details | Panel opens on selection, content matches selected card, empty state before selection |
| F05 | Data consistency | Vote counts in the summary text match the card counters; status matches the result |
| F06 | Deputies view | Listing and filtering by deputy |
| F07 | Empty and error states | No results, Senate without data, API failure |
| F08 | Theme toggle | Light/dark mode switch |
| F09 | Responsiveness | Desktop and mobile viewports |
| F10 | API | Endpoints consumed by the frontend: status codes, response schema, filters |
| F11 | Performance (light) | Page load time and API response time under minimal load |

### 3.2 Out of scope

- Authentication and authorization (the application has none)
- Full verification of every record against the official source (a sample is verified instead)
- Senate data, until it is published
- Security and penetration testing
- Load and stress testing beyond a light, pre-agreed scenario (third-party site)
- Accessibility audit (may be added in a later phase)

## 4. Risk analysis

Prioritization is risk-based: **Risk = Impact × Likelihood**.

| ID | Risk | Impact | Likelihood | Priority | Mitigation |
|---|---|---|---|---|---|
| R01 | Incorrect vote data (e.g. a deputy shown as "for" when they voted "against") | High | Medium | **High** | Consistency checks (F05) and sampled comparison against the official API |
| R02 | Year filter returns votes from the wrong year or a wrong total | High | Medium | **High** | E2E tests for each filter state, cross-check with API |
| R03 | Details panel shows data from a different vote than the one selected | High | Low | **Medium** | E2E tests selecting multiple items |
| R04 | Lazy loading skips or duplicates items | Medium | Medium | **Medium** | Scroll tests validating counter and unique IDs |
| R05 | API slow or unavailable, with no feedback to the user | Medium | Medium | **Medium** | Network mocking to simulate errors and delays |
| R06 | Broken layout on mobile devices | Medium | Medium | **Medium** | Tests on mobile viewports |
| R07 | Empty states render a blank screen or an error | Low | Medium | **Low** | Tests for Senate section and empty results |

## 5. Test approach

| Level | What | Tooling |
|---|---|---|
| Exploratory | Initial sessions to map features and find bugs | Browser + DevTools |
| Manual test cases | Documented cases with IDs, preconditions, steps and expected results | Markdown (`docs/test-cases/`) |
| End-to-end (UI) | Automation of high and medium priority cases, each linked to its manual case ID | Playwright + TypeScript, Page Object Model |
| API | Contract and data checks on the endpoints the frontend uses | Playwright `request` |
| Performance | Light scenario agreed with the site owner | To be defined |

## 6. Test environment

- **Environment:** production (`https://votoradar.y4tress.com`), the only one available
- **Browsers:** Chromium, Firefox, WebKit
- **Viewports:** desktop (1280×720) and mobile (e.g. Pixel 7, iPhone 14)
- **CI:** GitHub Actions on every push and pull request

> Because tests run against production with live data, assertions must not depend on exact values that change over time (e.g. total number of votes), unless the data is mocked.

## 7. Entry and exit criteria

**Entry**
- Site reachable and returning data for at least one year
- Test cases reviewed

**Exit**
- All high-priority test cases executed
- No open High-severity bugs without an agreed workaround
- Automated suite passing in CI

## 8. Defect management

Bugs are reported as GitHub Issues containing: title, environment, steps to reproduce, expected vs. actual result, severity, and evidence (screenshot or video).

## 9. Deliverables

- This test plan
- Manual test cases (`docs/test-cases/`)
- Automated test suite (`tests/`)
- Bug reports (GitHub Issues)
- CI pipeline (`.github/workflows/`)
- Test reports (Playwright HTML report)

## 10. Assumptions and open questions

- [x] Are filter selections reflected in the URL (shareable links)? **No**, navigation and filters keep the URL at `/`.
- [x] Which filters are available on the Deputies view? **Year, name (applied on Enter), party and state.** A selected deputy's history can be filtered by vote option and year.
- [ ] Are there votes with outcomes other than approved/rejected?
- [ ] Agree date, time and volume for the performance scenario with the site owner
