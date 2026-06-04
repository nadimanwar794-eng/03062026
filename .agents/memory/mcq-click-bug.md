---
name: MCQ click bug pattern
description: trackDailyMcqAnswer must return true in all non-blocking code paths
---

## Rule
Any function used as `onTrackAnswer` callback (e.g. `trackDailyMcqAnswer`) must
explicitly `return true` in every non-blocking code path. A bare `return;`
returns `undefined` (falsy) which callers treat as "blocked".

**Why:** TodayMcqSession and other MCQ components guard with:
```js
if (!onTrackAnswer(isCorrect)) return;
```
If the callback returns `undefined`, `!undefined === true` → click is blocked
silently with no user feedback.

**How to apply:** In `trackDailyMcqAnswer` (StudentDashboard.tsx), the
prize-checking early exits (minMcq threshold, rewardKey already set,
no applicableRule) must all say `return true;` not `return;`.
