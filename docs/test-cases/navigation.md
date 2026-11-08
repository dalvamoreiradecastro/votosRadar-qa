# Navigation Test Cases

### TC-NAV-001 — Votes explorer is the default view

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F01 | — | High | Functional | Automated |

**Preconditions**
- None

**Steps**
1. Open the home page (`/`).

**Expected result**
- The "Explorador de Votações" view is displayed.
- The "Votos" item under "Câmara" is highlighted as active in the menu.

---

### TC-NAV-002 — Switch between Votes and Deputies views

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F01 | — | High | Functional | Automated |

**Preconditions**
- Home page is open on a desktop viewport.

**Steps**
1. Click "Deputados" in the menu.
2. Click "Votos" in the menu.

**Expected result**
- After step 1, the "Explorador de Deputados" view is displayed and "Deputados" is highlighted.
- After step 2, the "Explorador de Votações" view is displayed and "Votos" is highlighted.

---

### TC-NAV-003 — Senate section without data shows an informative state

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F01, F07 | R07 | Low | Functional | Automated |

**Preconditions**
- Home page is open on a desktop viewport.

**Steps**
1. Click "Senado" in the menu.
2. Click "Senadores", then "Votos" under the Senate section.

**Expected result**
- The Senate section expands and shows the "Senadores" and "Votos" items.
- Each view shows a message indicating that data is not yet available.
- No blank screen, error message or Chamber data is displayed.

---

### TC-NAV-004 — Toggle between light and dark themes

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F08 | — | Low | UI | Automated |

**Preconditions**
- Home page is open in light theme.

**Steps**
1. Click the theme toggle button (☾) in the header.
2. Click the theme toggle button again.

**Expected result**
- After step 1, the page switches to the dark theme and all text remains readable.
- After step 2, the page returns to the light theme.

---

### TC-NAV-005 — Mobile layout uses a collapsible menu

| Feature | Risk | Priority | Type | Automation |
|---|---|---|---|---|
| F01, F09 | R06 | Medium | UI | Automated |

**Preconditions**
- Home page is open on a mobile viewport (e.g. Pixel 7 or iPhone 14).

**Steps**
1. Observe the header.
2. Tap the menu button (☰).
3. Tap "Deputados".

**Expected result**
- The sidebar is hidden and a menu button (☰) is shown in the header.
- Tapping the menu button opens the navigation menu.
- Tapping "Deputados" displays the deputies view and closes the menu.
- No horizontal scrolling is required to read the content.
