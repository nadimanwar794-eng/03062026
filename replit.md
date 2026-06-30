# IIC — The Future of Learning

An AI-powered educational platform for Indian students (CBSE/BSEB boards) providing high-yield study materials: notes, MCQs, videos, and school management tools.

## Run & Operate

- `pnpm --filter @workspace/iic-app run dev` — run the student app (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 PWA, Vite, Tailwind CSS v4, Framer Motion, Radix UI
- Backend/DB: Firebase (Firestore + Realtime Database + Auth)
- Offline: localforage (IndexedDB cache)
- API: Express 5 (skeleton in artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/iic-app/src/firebase.ts` — Firebase initialization, all RTDB/Firestore helpers
- `artifacts/iic-app/src/components/Auth.tsx` — login/signup UI (email, Google, anonymous)
- `artifacts/iic-app/src/services/groq.ts` — AI service stubs (currently disabled)
- `artifacts/iic-app/src/components/StudentDashboard.tsx` — main student experience
- `lib/db/` — Drizzle ORM schema and migrations

## Architecture decisions

- Firebase is the primary data store (RTDB for content, Firestore for structured data). Firebase client config is intentionally hardcoded — standard for Firebase web apps.
- Groq AI integration is stubbed out and returns disabled messages. Re-enable by restoring `callGroqApi` in `src/services/groq.ts` with a valid API key via Replit secrets.
- PWA with offline-first caching via localforage; content is cached per chapter key (`nst_content_*`).
- Port 5000 is the Vite dev server port (configured via `PORT` env var).

## Product

- Student dashboard with study timer, performance tracker, level/reward system
- Subject content (notes, MCQs, PDFs) served from Firebase RTDB
- Smart School Ecosystem: attendance, fees, exams, teacher/admin panels
- Admin dashboard for content management and AI-assisted tools

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Firebase Firestore shows `permission-denied` for unauthenticated reads — this is expected and handled gracefully; the app falls back to RTDB.
- `StudentDashboard.tsx` exceeds 500KB — Babel deoptimises styling. Consider splitting if performance becomes an issue.
- Always run `pnpm install` from the workspace root after pulling new changes.
