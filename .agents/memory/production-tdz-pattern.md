---
name: Production TDZ in React components
description: How const useState declarations after useEffect cause TDZ crashes only in production (not dev)
---

## Rule
Every `const` (state, ref, or derived value) that appears in a `useEffect` dependency array must be declared BEFORE that `useEffect` in the component function body.

## Why
- Dependency arrays are evaluated at render time (when the component function executes).
- In production Rollup bundles, `const` is preserved — TDZ applies if anything in the dep array hasn't been declared yet.
- In dev mode, Vite/Babel often transforms `const` → `var` for compatibility, so TDZ does not surface. This masks the bug in development.
- When the minifier inlines and reorders code, a `const [x] = useState()` that appears after `useEffect([..., x, ...])` causes `ReferenceError: Cannot access 'x' before initialization` at render time.

## How to apply
- Any time you add a `useEffect` that lists a local `const` in its dep array, ensure that `const` is declared higher up in the component body.
- Error signature: `Cannot access 'X' before initialization` in a React component, only in the production build.
- Diagnostic: in the minified bundle, find `const[X,...]=useState(...)` position and `useEffect(...,[...,X,...])` position — if declaration char-index > dep-array char-index, it's broken.
- Fix: move the `useState`/`useRef` declarations above the `useEffect` that depends on them.
- Real examples fixed in `StudentDashboard.tsx`:
  - `lucentActiveTab` / `lucentNotesViewMode` — declared after countdown useEffect
  - `hwActiveHwId` / `hwViewMode` — declared ~120 lines after useEffects at L2883–2900 that listed them in dep arrays
  - `flashcardMcqs` — declared ~390 lines after useEffect at L2904 that listed it in dep array
- Scanner script (node): collect useState/useRef declaration lines in a Map, then for each useEffect dep array check if any dep's declaration line > hook line. Reliable way to find remaining bugs.
- Crash signature in reports: minified var name (e.g. `Ki`, `Hs`) in "Cannot access 'X' before initialization"; component shows as minified name (`WTt` = StudentDashboard); `dIt` = App.tsx parent.
- App.tsx renders `<main id="main-content">` — component stack `main → div → zh → WTt` means WTt is rendered by App through ErrorBoundary wrappers (each shows as `zh`).
