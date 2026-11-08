# Deputies Explorer Test Cases

All cases start from the Deputies view: open the home page and click "Deputados" in the menu.

### TC-DEP-001 — Deputies list loads with all filters set to their defaults

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06 | R02 | High | Functional | Automated |

**Preconditions**
- Deputies view is open.

**Steps**
1. Observe the filters and the list.

**Expected result**
- The current year is selected, the name field is empty, and party and state show "Todos".
- The counter reads `Deputados (X de Y)` with `0 < X ≤ Y`.
- Each item shows the deputy's name and `PARTY-STATE`.
- The details area shows "Selecione um deputado para ver como ele votou."

---

### TC-DEP-002 — Search by name returns only matching deputies

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06 | R02 | High | Functional | Automated |

**Preconditions**
- Deputies view is open.

**Steps**
1. Type `Erika` in the "Nome" field.
2. Press Enter.

**Expected result**
- Every deputy listed has "Erika" in their name (case-insensitive).
- The counter total matches the number of results.

> **Note:** the search is only triggered by pressing Enter, while party and state filters apply immediately. This inconsistency is tracked as a usability observation.

---

### TC-DEP-003 — Search with no matches shows an empty state

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06, F07 | R07 | Medium | Functional | Automated |

**Preconditions**
- Deputies view is open.

**Steps**
1. Type `zzzzzz` in the "Nome" field.
2. Press Enter.

**Expected result**
- The list is empty and a "no results" message is displayed.
- The counter reads `Deputados (0 de 0)` or equivalent.

---

### TC-DEP-004 — Filter by party

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06 | R02 | High | Functional | Automated |

**Preconditions**
- Deputies view is open.

**Steps**
1. Select `PSOL` in the "Partido" dropdown.

**Expected result**
- The list updates without any extra action.
- Every deputy listed shows `PSOL-` as their party.
- The party options match the list returned by `GET /api/deputados/partidos`.

---

### TC-DEP-005 — Filter by state

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06 | R02 | Medium | Functional | Automated |

**Preconditions**
- Deputies view is open.

**Steps**
1. Select `SP` in the "Estado" dropdown.

**Expected result**
- Every deputy listed shows `-SP` as their state.
- The "Estado" dropdown lists all 27 Brazilian federative units.

---

### TC-DEP-006 — Combine party and state filters

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06 | R02 | High | Functional | Automated |

**Preconditions**
- Deputies view is open.

**Steps**
1. Select `PSOL` in "Partido".
2. Select `SP` in "Estado".
3. Set "Partido" back to "Todos".

**Expected result**
- After step 2, every deputy listed shows `PSOL-SP`.
- The total after step 2 is less than or equal to the total after step 1.
- After step 3, the list shows deputies from any party in `SP`.

---

### TC-DEP-007 — Selecting a deputy shows their voting history

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06 | R03 | High | Functional | Automated |

**Preconditions**
- Deputies view is open.

**Steps**
1. Search for `Erika Hilton` and press Enter.
2. Click "Erika Hilton".

**Expected result**
- The details header shows `Erika Hilton (PSOL-SP) · N votações`.
- The vote option filter shows "Todos", "A favor", "Contra", "Abstenção" and "Nenhum", with "Todos" selected.
- Each item in the history shows date, vote ID, the deputy's vote option and the related bill.

---

### TC-DEP-008 — Filter a deputy's history by vote option

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F06 | R01 | High | Functional | Automated |

**Preconditions**
- A deputy's voting history is displayed (TC-DEP-007).

**Steps**
1. Select "Contra".
2. Select "A favor".

**Expected result**
- After step 1, every item shows the `CONTRA` badge.
- After step 2, every item shows the `A FAVOR` badge.
- If there are no items for an option, an empty-state message is displayed.

---

### TC-DEP-009 — Deputy's vote matches the vote details

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F05, F06 | R01 | High | Data consistency | Automated |

**Preconditions**
- A deputy's voting history is displayed (TC-DEP-007).

**Steps**
1. Note the vote ID and the deputy's option (e.g. `CONTRA`) of the first history item.
2. Go to the Votes view, select the same year and open the vote with that ID.

**Expected result**
- The deputy is listed in the group that matches the noted option (e.g. among the "contra" votes).
