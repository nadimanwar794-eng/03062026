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
- Real example fixed: `lucentActiveTab` / `lucentNotesViewMode` in `StudentDashboard.tsx` were declared after the countdown `useEffect` that listed them in deps, causing the `Hs` TDZ crash in production.
