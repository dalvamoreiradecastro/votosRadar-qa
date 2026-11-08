# API Test Cases

Base URL: `https://votoradar.y4tress.com/api`

### TC-API-001 — List votes returns a valid paginated response

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F10 | R02 | High | Contract | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /votacoes?ano=2026&pagina=0`.

**Expected result**
- Status `200` and JSON content type.
- Body contains `itens` (array), `pagina` (`0`), `tamanhoPagina`, `totalItens` and `temProximaPagina`.
- Each item contains `id`, `data`, `anoVotacao`, `descricao`, `resultado`, `proposicoes`, `totais`, and the lists of deputies per vote option.

---

### TC-API-002 — Vote totals match the lists of deputies

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F05, F10 | R01 | High | Data consistency | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /votacoes?ano=2026&pagina=0`.
2. For each item, compare `totais` with the deputy lists.

**Expected result**
- `totais.aFavor` equals the length of `aFavor`.
- `totais.contra` equals the length of `contra`.
- `totais.abstencoes` equals the length of the abstentions list.

---

### TC-API-003 — Votes are filtered by the requested year

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F02, F10 | R02 | High | Functional | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /votacoes?ano=2025&pagina=0`.

**Expected result**
- Every item has `anoVotacao` equal to `2025` and a `data` starting with `2025-`.

---

### TC-API-004 — Pagination is consistent

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F03, F10 | R04 | Medium | Functional | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /votacoes?ano=2026&pagina=0` and `GET /votacoes?ano=2026&pagina=1`.
2. Send `GET /votacoes?ano=2026&pagina=999`.

**Expected result**
- Pages 0 and 1 do not share any vote ID.
- `totalItens` is the same on both pages.
- `temProximaPagina` is `true` when more items exist after the page.
- Page 999 returns `200` with an empty `itens` and `temProximaPagina: false`.

---

### TC-API-005 — Invalid parameters return a clear 400 error

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F10 | — | Medium | Negative | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /votacoes?ano=abc&pagina=0`.
2. Send `GET /votacoes?ano=2026&pagina=-1`.
3. Send `GET /votacoes?pagina=0` (no year).

**Expected result**
- All requests return `400`.
- The error message describes the invalid parameter.
- The response does not expose internal implementation details (e.g. raw exception messages).

> **Known bug:** step 1 returns the raw Java exception message `For input string: "abc"`. The automated check is marked with `test.fail()` until the bug is fixed.

---

### TC-API-006 — Deputies can be filtered by name, party and state

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06, F10 | R02 | High | Functional | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /deputados?ano=2026&pagina=0&nome=Erika`.
2. Send `GET /deputados?ano=2026&pagina=0&partido=PSOL`.
3. Send `GET /deputados?ano=2026&pagina=0&partido=PSOL&uf=SP`.

**Expected result**
- Step 1: every item's `name` contains "Erika".
- Step 2: every item's `party` is `PSOL`.
- Step 3: every item has `party` `PSOL` and `state` `SP`, and `totalItens` is not greater than in step 2.

---

### TC-API-007 — Parties endpoint returns a unique, sorted list

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06, F10 | — | Low | Contract | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /deputados/partidos?ano=2026`.

**Expected result**
- Status `200` with a non-empty array of strings.
- No duplicate values.
- Values are sorted alphabetically.

---

### TC-API-008 — Deputy voting history returns votes for that deputy

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06, F10 | R01 | Medium | Functional | Automated |

**Preconditions**
- A valid deputy ID is obtained from `GET /deputados?ano=2026&pagina=0`.

**Steps**
1. Send `GET /deputados/{id}/votacoes?ano=2026&pagina=0`.
2. Send the same request with an ID that does not exist (e.g. `0`).

**Expected result**
- Step 1: status `200` with a paginated list of votes from 2026; each item has a `voto` of `aFavor`, `contra`, `abstencoes` or `nenhum`.
- Step 2: status `404`, or `200` with an empty list. Never `500`.

---

### TC-API-009 — Deputy voting history matches the vote lists

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F05, F06, F10 | R01 | High | Data consistency | Automated |

**Preconditions**
- A deputy with votes in the current year (e.g. Erika Hilton, ID `220645`).

**Steps**
1. Fetch the deputy's complete history: `GET /deputados/{id}/votacoes?ano=2026` (all pages).
2. Fetch all votes of the year: `GET /votacoes?ano=2026` (all pages).
3. For each history item with `voto` other than `nenhum`, find the vote with the same `id`.

**Expected result**
- Every history item exists in the votes list.
- The deputy is listed in the vote's list that matches their option (`aFavor`, `contra` or `abstencoes`).

---

### TC-API-010 — Name search ignores case and accents

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06, F10 | — | Low | Usability | Automated |

**Preconditions**
- None

**Steps**
1. Send `GET /deputados?ano=2026&pagina=0&nome=` with `Erika`, `erika` and `ERIKA`.
2. Send the same request with `Sâmia` and `Samia`.

**Expected result**
- Step 1: all three searches return the same total.
- Step 2: both searches return the same total (users often type without accents on mobile keyboards).

> **Known issue:** the search is accent-sensitive, so `Samia` returns no results. The automated check is marked with `test.fail()`.
