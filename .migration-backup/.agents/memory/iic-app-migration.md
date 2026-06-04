---
name: IIC App Migration
description: Migration of IIC Learning Platform from Vercel/GitHub to Replit pnpm workspace
---

# IIC App Migration

## Source
- GitHub: https://github.com/nadimanwar794-eng/03062026
- App type: Vite + React (NOT Next.js) — no framework conversion needed

## Key facts
- All source files in `artifacts/iic-app/src/` (components/, utils/, hooks/, services/, api/, firebase.ts, types.ts, constants.ts, etc.)
- Entry: `src/main.tsx` (PWA register stripped, ErrorBoundary kept)
- App CSS imported as `src/app.css` alongside scaffold's `src/index.css`
- Firebase keys hardcoded in `src/firebase.ts` — should be moved to Replit Secrets for prod

**Why:** rsync not available on Replit NixOS — use `cp -r` for directory copies.

## 5 UI changes applied (2026-06-04)
1. Store.tsx: headerFlip state + useEffect removed
2. Store.tsx: flip header → plain static credits pill
3. Store.tsx: discount banner block removed entirely
4. Store.tsx: features card always shows discount breakdown + Level/Score row + Subscription row + inCooldown/activeEvent timers + Lifetime price override (Basic=9999, Ultra=19999)
5. StudentDashboard.tsx: credits pill simplified to plain Crown + {user.credits} CR text (no button, no flip)
