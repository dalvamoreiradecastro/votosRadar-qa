# Votes Explorer Test Cases

### TC-VOT-001 — Current year is selected by default and votes are listed

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F02, F03 | R02 | High | Functional | Planned |

**Preconditions**
- None

**Steps**
1. Open the home page.

**Expected result**
- The year filter shows years from 2016 to the current year.
- The current year is selected.
- The votes list shows at least one card, and the counter reads `Votações (X de Y)` with `0 < X ≤ Y`.

---

### TC-VOT-002 — Selecting a year lists only votes from that year

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F02 | R02 | High | Functional | Planned |

**Preconditions**
- Home page is open.

**Steps**
1. Click the year "2025".

**Expected result**
- "2025" becomes the selected year.
- Every card shows a date in 2025.
- The counter total (`Y`) matches `totalItens` returned by `GET /api/votacoes?ano=2025`.

---

### TC-VOT-003 — Votes counter reflects the number of loaded cards

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F03 | R04 | Medium | Functional | Planned |

**Preconditions**
- Home page is open.

**Steps**
1. Count the cards in the votes list.
2. Compare with the counter `Votações (X de Y)`.

**Expected result**
- `X` equals the number of cards displayed.
- `Y` equals `totalItens` from the API for the selected year.

---

### TC-VOT-004 — Scrolling the list loads more votes without duplicates

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F03 | R04 | Medium | Functional | Planned |

**Preconditions**
- Home page is open with a year that has more than 20 votes.

**Steps**
1. Note the counter value `X`.
2. Scroll to the end of the votes list.

**Expected result**
- More cards are loaded and `X` increases, never exceeding `Y`.
- No vote ID appears more than once in the list.
- When all votes are loaded, `X` equals `Y` and no further requests are made.

---

### TC-VOT-005 — Details panel shows a hint before any vote is selected

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F04 | R07 | Low | UI | Planned |

**Preconditions**
- Home page is open on a desktop viewport.

**Steps**
1. Observe the details panel without selecting a vote.

**Expected result**
- The panel displays "Selecione uma votação para ver os detalhes."

---

### TC-VOT-006 — Selecting a vote shows its details

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F04 | R03 | High | Functional | Planned |

**Preconditions**
- Home page is open on a desktop viewport.

**Steps**
1. Click the first vote card and note its date, ID and status.
2. Click the second vote card.

**Expected result**
- After each click, the selected card is highlighted.
- The details panel shows the same date, ID, status and description as the selected card.
- The panel lists the bills voted ("Proposições votadas") and the vote results.

---

### TC-VOT-007 — Vote counts on the card match the summary text

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F05 | R01 | High | Data consistency | Planned |

**Preconditions**
- Home page is open.

**Steps**
1. For each loaded card, read the summary text (e.g. `Resultado: 1 voto 'Sim', 10 votos 'Não'`).
2. Read the counters on the same card (e.g. `1 a favor · 10 contra`).

**Expected result**
- The number of "Sim" votes equals the "a favor" counter.
- The number of "Não" votes equals the "contra" counter.

---

### TC-VOT-008 — Status badge is consistent with the vote outcome

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F05 | R01 | High | Data consistency | Planned |

**Preconditions**
- Home page is open.

**Steps**
1. For each loaded card, compare the status badge with the beginning of the summary text.

**Expected result**
- Summaries starting with "Aprovad…" show the `APROVADO` badge.
- Summaries starting with "Rejeitad…" show the `REPROVADO` badge.

---

### TC-VOT-009 — Year without votes shows an empty state

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F07 | R07 | Low | Functional | Planned (with mocked API) |

**Preconditions**
- `GET /api/votacoes` is mocked to return an empty list (`totalItens: 0`).

**Steps**
1. Open the home page.

**Expected result**
- The list shows a message indicating there are no votes for the selected year.
- The counter reads `Votações (0 de 0)` or equivalent.
- No blank area or error is displayed.

---

### TC-VOT-010 — API failure shows a friendly error message

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F07 | R05 | High | Error handling | Planned (with mocked API) |

**Preconditions**
- `GET /api/votacoes` is mocked to return HTTP 500.

**Steps**
1. Open the home page.

**Expected result**
- A user-friendly error message is displayed in the votes list area.
- The rest of the page (menu, year filter) remains usable.
- No technical details (stack traces, exception messages) are shown.
