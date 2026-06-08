---
name: Vite/Terser TDZ from useState ordering
description: Minifier merges separate const useState() calls into one const declaration; useEffect dependency array evaluated before that const causes TDZ ReferenceError crash.
---

## The Rule
In a React component, every `useState` variable used in a `useEffect` dependency array must be declared (in source order) BEFORE that `useEffect`. When the Vite/Rollup+Terser production minifier merges multiple consecutive `const [x,setX]=useState(...)` lines into a single `const` declaration, all variables in that merged statement are in TDZ until the whole statement runs. If a `useEffect` call precedes that merged `const`, evaluating the dep array `[x]` triggers TDZ.

**Why:** The source had `classContentStats` declared ~175 lines after a `useEffect([classContentStats])` that checked `Object.keys(classContentStats).length > 0`. TypeScript didn't catch it (no use-before-declaration in the same file, since the IIFE/closure delayed execution). The minifier merged nearby useState calls into one const, exposing the ordering bug.

**How to apply:** When debugging "Cannot access 'X' before initialization" in minified React bundles:
1. Find the minified component (Clt, Blt etc.) and search for the 2-3 char variable in the bundle.
2. Compare its useEffect dependency position vs. its useState declaration position in the bundle.
3. In the source, move the useState declaration to BEFORE the useEffect that depends on it.
4. Rebuild and re-verify: the minified name will change, confirming the ordering changed.
