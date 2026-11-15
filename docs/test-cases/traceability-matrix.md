# Traceability Matrix

Every test case in one place: what it covers, how important it is, and which automated test verifies it.
Each case links to its full description (preconditions, steps, expected result); feature (`F01`–`F11`)
and risk (`R01`–`R07`) IDs come from the [test plan](../test-plan.md#3-scope).

**34 test cases · 34 automated (100%) · 40 automated tests** (plus 1 smoke test with no case).
Automated test titles start with the case ID, so `npx playwright test -g TC-VOT-007` runs the tests of a single case.

## Test cases

### Navigation

| ID | Test case | Priority | Feature | Risk | Type | Automated test | Notes |
|---|---|---|---|---|---|---|---|
| [TC-NAV-001](navigation.md#tc-nav-001--votes-explorer-is-the-default-view) | Votes explorer is the default view | High | F01 | — | Functional | [navigation.spec.ts](../../tests/e2e/navigation.spec.ts) |  |
| [TC-NAV-002](navigation.md#tc-nav-002--switch-between-votes-and-deputies-views) | Switch between Votes and Deputies views | High | F01 | — | Functional | [navigation.spec.ts](../../tests/e2e/navigation.spec.ts) |  |
| [TC-NAV-003](navigation.md#tc-nav-003--senate-section-without-data-shows-an-informative-state) | Senate section without data shows an informative state | Low | F01, F07 | R07 | Functional | [navigation.spec.ts](../../tests/e2e/navigation.spec.ts) |  |
| [TC-NAV-004](navigation.md#tc-nav-004--toggle-between-light-and-dark-themes) | Toggle between light and dark themes | Low | F08 | — | UI | [navigation.spec.ts](../../tests/e2e/navigation.spec.ts) |  |
| [TC-NAV-005](navigation.md#tc-nav-005--mobile-layout-uses-a-collapsible-menu) | Mobile layout uses a collapsible menu | Medium | F01, F09 | R06 | UI | [navigation.spec.ts](../../tests/e2e/navigation.spec.ts) | Mobile only |

### Votes

| ID | Test case | Priority | Feature | Risk | Type | Automated test | Notes |
|---|---|---|---|---|---|---|---|
| [TC-VOT-001](votes.md#tc-vot-001--current-year-is-selected-by-default-and-votes-are-listed) | Current year is selected by default and votes are listed | High | F02, F03 | R02 | Functional | [votes.spec.ts](../../tests/e2e/votes.spec.ts) |  |
| [TC-VOT-002](votes.md#tc-vot-002--selecting-a-year-lists-only-votes-from-that-year) | Selecting a year lists only votes from that year | High | F02 | R02 | Functional | [votes.spec.ts](../../tests/e2e/votes.spec.ts) |  |
| [TC-VOT-003](votes.md#tc-vot-003--votes-counter-reflects-the-number-of-loaded-cards) | Votes counter reflects the number of loaded cards | Medium | F03 | R04 | Functional | [votes.spec.ts](../../tests/e2e/votes.spec.ts) |  |
| [TC-VOT-004](votes.md#tc-vot-004--scrolling-the-list-loads-more-votes-without-duplicates) | Scrolling the list loads more votes without duplicates | Medium | F03 | R04 | Functional | [votes.spec.ts](../../tests/e2e/votes.spec.ts) |  |
| [TC-VOT-005](votes.md#tc-vot-005--details-panel-shows-a-hint-before-any-vote-is-selected) | Details panel shows a hint before any vote is selected | Low | F04 | R07 | UI | [votes.spec.ts](../../tests/e2e/votes.spec.ts) | Desktop only |
| [TC-VOT-006](votes.md#tc-vot-006--selecting-a-vote-shows-its-details) | Selecting a vote shows its details | High | F04 | R03 | Functional | [votes.spec.ts](../../tests/e2e/votes.spec.ts) | Desktop only |
| [TC-VOT-007](votes.md#tc-vot-007--vote-counts-on-the-card-match-the-summary-text) | Vote counts on the card match the summary text | High | F05 | R01 | Data consistency | [votes.spec.ts](../../tests/e2e/votes.spec.ts) |  |
| [TC-VOT-008](votes.md#tc-vot-008--status-badge-is-consistent-with-the-vote-outcome) | Status badge is consistent with the vote outcome | High | F05 | R01 | Data consistency | [votes.spec.ts](../../tests/e2e/votes.spec.ts) |  |
| [TC-VOT-009](votes.md#tc-vot-009--year-without-votes-shows-an-empty-state) | Year without votes shows an empty state | Low | F07 | R07 | Functional | [votes.spec.ts](../../tests/e2e/votes.spec.ts) | Mocked API |
| [TC-VOT-010](votes.md#tc-vot-010--api-failure-shows-a-friendly-error-message) | API failure shows a friendly error message | High | F07 | R05 | Error handling | [votes.spec.ts](../../tests/e2e/votes.spec.ts) | Known bug (`test.fail`); Mocked API |

### Deputies

| ID | Test case | Priority | Feature | Risk | Type | Automated test | Notes |
|---|---|---|---|---|---|---|---|
| [TC-DEP-001](deputies.md#tc-dep-001--deputies-list-loads-with-all-filters-set-to-their-defaults) | Deputies list loads with all filters set to their defaults | High | F06 | R02 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) (2 tests) | Part desktop only |
| [TC-DEP-002](deputies.md#tc-dep-002--search-by-name-returns-only-matching-deputies) | Search by name returns only matching deputies | High | F06 | R02 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) |  |
| [TC-DEP-003](deputies.md#tc-dep-003--search-with-no-matches-shows-an-empty-state) | Search with no matches shows an empty state | Medium | F06, F07 | R07 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) |  |
| [TC-DEP-004](deputies.md#tc-dep-004--filter-by-party) | Filter by party | High | F06 | R02 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) |  |
| [TC-DEP-005](deputies.md#tc-dep-005--filter-by-state) | Filter by state | Medium | F06 | R02 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) |  |
| [TC-DEP-006](deputies.md#tc-dep-006--combine-party-and-state-filters) | Combine party and state filters | High | F06 | R02 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) |  |
| [TC-DEP-007](deputies.md#tc-dep-007--selecting-a-deputy-shows-their-voting-history) | Selecting a deputy shows their voting history | High | F06 | R03 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) |  |
| [TC-DEP-008](deputies.md#tc-dep-008--filter-a-deputys-history-by-vote-option) | Filter a deputy's history by vote option | High | F06 | R01 | Functional | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) |  |
| [TC-DEP-009](deputies.md#tc-dep-009--deputys-vote-matches-the-vote-details) | Deputy's vote matches the vote details | High | F05, F06 | R01 | Data consistency | [deputies.spec.ts](../../tests/e2e/deputies.spec.ts) | Desktop only |

### API

| ID | Test case | Priority | Feature | Risk | Type | Automated test | Notes |
|---|---|---|---|---|---|---|---|
| [TC-API-001](api.md#tc-api-001--list-votes-returns-a-valid-paginated-response) | List votes returns a valid paginated response | High | F10 | R02 | Contract | [votes.api.spec.ts](../../tests/api/votes.api.spec.ts) |  |
| [TC-API-002](api.md#tc-api-002--vote-totals-match-the-lists-of-deputies) | Vote totals match the lists of deputies | High | F05, F10 | R01 | Data consistency | [votes.api.spec.ts](../../tests/api/votes.api.spec.ts) |  |
| [TC-API-003](api.md#tc-api-003--votes-are-filtered-by-the-requested-year) | Votes are filtered by the requested year | High | F02, F10 | R02 | Functional | [votes.api.spec.ts](../../tests/api/votes.api.spec.ts) |  |
| [TC-API-004](api.md#tc-api-004--pagination-is-consistent) | Pagination is consistent | Medium | F03, F10 | R04 | Functional | [votes.api.spec.ts](../../tests/api/votes.api.spec.ts) |  |
| [TC-API-005](api.md#tc-api-005--invalid-parameters-return-a-clear-400-error) | Invalid parameters return a clear 400 error | Medium | F10 | — | Negative | [votes.api.spec.ts](../../tests/api/votes.api.spec.ts) (3 tests) | Known bug in 1 of 3 tests (`test.fail`) |
| [TC-API-006](api.md#tc-api-006--deputies-can-be-filtered-by-name-party-and-state) | Deputies can be filtered by name, party and state | High | F06, F10 | R02 | Functional | [deputies.api.spec.ts](../../tests/api/deputies.api.spec.ts) (2 tests) |  |
| [TC-API-007](api.md#tc-api-007--parties-endpoint-returns-a-unique-sorted-list) | Parties endpoint returns a unique, sorted list | Low | F06, F10 | — | Contract | [deputies.api.spec.ts](../../tests/api/deputies.api.spec.ts) |  |
| [TC-API-008](api.md#tc-api-008--deputy-voting-history-returns-votes-for-that-deputy) | Deputy voting history returns votes for that deputy | Medium | F06, F10 | R01 | Functional | [deputies.api.spec.ts](../../tests/api/deputies.api.spec.ts) (2 tests) |  |
| [TC-API-009](api.md#tc-api-009--deputy-voting-history-matches-the-vote-lists) | Deputy voting history matches the vote lists | High | F05, F06, F10 | R01 | Data consistency | [deputies.api.spec.ts](../../tests/api/deputies.api.spec.ts) |  |
| [TC-API-010](api.md#tc-api-010--name-search-ignores-case-and-accents) | Name search ignores case and accents | Low | F06, F10 | — | Usability | [deputies.api.spec.ts](../../tests/api/deputies.api.spec.ts) (2 tests) | Known bug in 1 of 2 tests (`test.fail`) |

**Notes**
- **Known bug:** the test is marked `test.fail()` because it currently reproduces a known defect. It passes while the bug exists, and Playwright flags it as soon as the bug is fixed.
- **Desktop only / Mobile only:** the behavior exists on one layout only, so the test is skipped on the other.
- **Mocked API:** the API response is simulated with `page.route()` to reach a state that cannot be triggered on demand in production (empty year, server error).
- UI tests run on 5 browsers/devices (Chromium, Firefox, WebKit, Pixel 7, iPhone 14); API tests run once.

## Coverage by feature

| Feature | Test cases |
|---|---|
| F01 Navigation | 4 |
| F02 Year filter | 3 |
| F03 Votes list | 4 |
| F04 Vote details | 2 |
| F05 Data consistency | 5 |
| F06 Deputies view | 14 |
| F07 Empty and error states | 4 |
| F08 Theme toggle | 1 |
| F09 Responsiveness | 1 dedicated case; every UI test also runs on 2 mobile devices |
| F10 API | 10 |
| F11 Performance (light) | **0** (see gaps) |

## Coverage by risk

| Risk | Level | Test cases |
|---|---|---|
| R01 Incorrect vote data | High | 7 |
| R02 Wrong year filter or total | High | 10 |
| R03 Details panel shows another vote | Medium | 2 |
| R04 Lazy loading skips or duplicates items | Medium | 3 |
| R05 API slow or unavailable, with no feedback | Medium | 1 |
| R06 Broken layout on mobile | Medium | 1 dedicated case; every UI test also runs on 2 mobile devices |
| R07 Empty states render a blank screen | Low | 4 |
| No specific risk | — | 6 |

Both high risks have the most coverage, at UI and API level.

## Known gaps

| Gap | Why | Next step |
|---|---|---|
| F11 Performance has no test case | Production sits behind a rate limiter (10 req/s per IP) and belongs to a third party | Light load test, agreed with the site owner |
| R05 covers API failure, but not a slow API | Only the 500 error is simulated | Add a case with a delayed mocked response (loading state, timeout message) |
| New deputy history features are not covered | "Todos os anos" filter, "Ver votação" and "Abrir proposição" buttons were released after the cases were written | Write and automate cases `TC-DEP-010`+ |
