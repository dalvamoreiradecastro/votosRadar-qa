# API Test Cases

Base URL: `https://votoradar.y4tress.com/api`

### TC-API-001 — List votes returns a valid paginated response

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F10 | R02 | High | Contract | Planned |

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
| F05, F10 | R01 | High | Data consistency | Planned |

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
| F02, F10 | R02 | High | Functional | Planned |

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
| F03, F10 | R04 | Medium | Functional | Planned |

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
| F10 | — | Medium | Negative | Planned |

**Preconditions**
- None

**Steps**
1. Send `GET /votacoes?ano=abc&pagina=0`.
2. Send `GET /votacoes?ano=2026&pagina=-1`.

**Expected result**
- Both requests return `400`.
- The error message describes the invalid parameter.
- The response does not expose internal implementation details (e.g. raw exception messages).

---

### TC-API-006 — Deputies can be filtered by name, party and state

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06, F10 | R02 | High | Functional | Planned |

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
| F06, F10 | — | Low | Contract | Planned |

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
| F06, F10 | R01 | Medium | Functional | Planned |

**Preconditions**
- A valid deputy ID is obtained from `GET /deputados?ano=2026&pagina=0`.

**Steps**
1. Send `GET /deputados/{id}/votacoes?ano=2026&pagina=0`.
2. Send the same request with an ID that does not exist (e.g. `0`).

**Expected result**
- Step 1: status `200` with a paginated list of votes from 2026.
- Step 2: status `404`, or `200` with an empty list. Never `500`.
