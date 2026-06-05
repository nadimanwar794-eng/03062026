---
name: Daily score limit boost bug
description: How scoreLimitBoostPercent flows from redeem codes to the daily limit check in scoreSystem.ts
---

## The rule
`scoreLimitBoostPercent` (stored on the user object via `SCORE_LIMIT_BOOST` redeem codes) must be explicitly forwarded as an argument at every layer of the score pipeline for it to actually raise the daily limit.

**Why:** `getDailyScoreLimit`, `getRemainingDailyScore`, `tryEarnScore`, and `awardMilestone` are all pure functions that receive the boost as a parameter — they do not read from Firebase themselves. If any caller omits it, the limit check silently ignores the boost and users hit their base limit regardless of their redeemed code.

**How to apply:**
- When calling `tryEarnScore` from any component, pass `(user as any).scoreLimitBoostPercent` as the 7th argument.
- When constructing a `ReadingScoreConfig`, include `scoreLimitBoostPercent: (user as any).scoreLimitBoostPercent`.
- When passing props to `<PdfViewer>`, include `scoreLimitBoostPercent={(user as any).scoreLimitBoostPercent}`.
- `eventExtraPoints` (from `dailyLimitBoostEvent` in settings) is a separate 8th param used for admin-controlled event bonuses.

## Files updated in the fix
- `scoreSystem.ts` — `tryEarnScore` and `awardMilestone` now accept and forward `scoreLimitBoostPercent`
- `readingScoreEngine.ts` — `ReadingScoreConfig` has `scoreLimitBoostPercent`; all 3 `tryEarnScore` calls forward it
- `StudentDashboard.tsx` — all 5 `tryEarnScore` calls pass `(freshUser/freshU as any).scoreLimitBoostPercent`
- `PdfViewer.tsx` — `Props` has `scoreLimitBoostPercent`; the milestone `tryEarnScore` call forwards it
