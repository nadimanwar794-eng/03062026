# IIC — The Future of Learning

An educational platform for students in India (CBSE, BSEB, etc.) providing study notes, PDF resources, MCQ practice, daily challenges, and a credit/subscription system.

## Run & Operate

- `PORT=5000 pnpm --filter @workspace/iic-app run dev` — run the frontend (port 5000, mapped to port 80)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm install` — install all workspace packages (required after clone)

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: React 19, Vite, Tailwind CSS, Shadcn/UI, Framer Motion
- Backend/DB: Firebase (Realtime Database + Firestore + Auth + Analytics)
- PWA: vite-plugin-pwa with offline support
- Routing: wouter
- API server: Express 5 + Drizzle ORM (minimal, health-check only)

## Where things live

- `artifacts/iic-app/src/` — React frontend source
- `artifacts/iic-app/src/firebase.ts` — Firebase config and all DB/auth helpers
- `artifacts/iic-app/src/components/` — UI components (StudentDashboard, AdminDashboard, Auth, etc.)
- `artifacts/api-server/` — Express API server (minimal, extends later)
- `lib/db/` — Drizzle schema (PostgreSQL, for future server-side use)

## Architecture decisions

- Firebase is the primary data store (RTDB + Firestore). The Express api-server is a future extension point, not currently used by the frontend.
- Firebase config (apiKey etc.) is hardcoded in `firebase.ts` — this is correct for client-side Firebase; these are not secret keys.
- Auth uses Firebase Auth (email/password + Google). This is intentional; replacing with Replit Auth would require a full backend rewrite.
- PWA with offline support via localforage caching of content.
- Monorepo with pnpm workspaces; all frontend deps live in `artifacts/iic-app/`.

## Product

- Student onboarding: board/class selection (CBSE, BSEB, etc.)
- Study notes and PDF viewer per subject/chapter
- MCQ practice with scoring
- Daily challenges and competitions
- Credit system and subscription tiers
- Admin dashboard for content management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm install` from the workspace root before starting any workflow.
- The "permission-denied" Firestore errors in the browser console are Firebase security rules — they don't break the app and are managed in the Firebase console.
- The `.migration-backup/` directory contains the pre-migration snapshot; it can be safely ignored.

## Pointers

- Firebase project: `project-1959318394445181665`
- Main workflow: `IIC App` (runs `PORT=5000 pnpm --filter @workspace/iic-app run dev`)
