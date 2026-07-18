---
name: Score/Credit separation
description: How pts (totalScore) and credits are intentionally kept separate in the reward engine
---

## Rule
Credits earned from video/pdf/writing/qa activity must NOT update `totalScore` (pts). Only reading/MCQ activity updates pts.

## Why
User requirement: "credit katne ya earn pe pts na badhega, bas pts study se badhega"

## How to apply
- `ReadingScoreConfig.onScoreEarned` → called for pts events → parent updates `totalScore`
- `ReadingScoreConfig.onCreditsEarned` → called for credit events → parent updates `user.credits` only (no totalScore change)
- Writing mode config in LessonView: `onScoreEarned: undefined, onCreditsEarned: handleCreditsEarned`
- PDF mode: `onScoreEarned: undefined, onCreditsEarned: (cr, act) => onCreditsEarned?.(cr, act)`
- Video mode gets BOTH: `onScoreEarned` (6s → +1 pts) AND `onCreditsEarned` (60s → +10 credits)
- Q&A mode: credits only, `onScoreEarned` not set
- MCQ/reading: pts only via `onScoreEarned`; fractional pts-to-coins conversion still happens for reading in LessonView
