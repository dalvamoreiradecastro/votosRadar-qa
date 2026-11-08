# Manual Test Cases

Manual test cases for VotoRadar, derived from the [test plan](../test-plan.md).

## Files

| File | Area | ID prefix |
|---|---|---|
| [navigation.md](navigation.md) | Menu, theme, responsive layout | `TC-NAV` |
| [votes.md](votes.md) | Votes explorer | `TC-VOT` |
| [deputies.md](deputies.md) | Deputies explorer | `TC-DEP` |
| [api.md](api.md) | Backend API | `TC-API` |

## Conventions

- **ID:** `TC-<AREA>-<NNN>`. IDs are never reused or renumbered.
- **Traceability:** each case references a feature (`F01`–`F11`) and, when applicable, a risk (`R01`–`R07`) from the test plan. Automated tests reference the case ID in their title, e.g. `test('TC-VOT-007 vote counts match the summary', ...)`.
- **Priority:** High / Medium / Low, based on the risk analysis.
- **Automation status:** `Planned`, `Automated`, or `Manual only`.
- **Live data:** tests run against production data that changes daily. Expected results describe rules (e.g. "counter equals the API total") instead of fixed values.

## Template

```markdown
### TC-XXX-000 — Short description of the behavior

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F00 | R00 | High | Functional | Planned |

**Preconditions**
- ...

**Steps**
1. ...

**Expected result**
- ...
```

## Summary

| Area | High | Medium | Low | Total |
|---|---|---|---|---|
| Navigation | 2 | 1 | 2 | 5 |
| Votes | 6 | 2 | 2 | 10 |
| Deputies | 7 | 2 | 0 | 9 |
| API | 4 | 3 | 1 | 8 |
| **Total** | **19** | **8** | **5** | **32** |
