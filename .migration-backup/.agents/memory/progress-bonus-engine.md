---
name: Midnight Progress Bonus Engine
description: L4–L8 bracket bonuses and L9+ limit-touch multipliers applied at app open on new day
---

# Progress Bonus Engine

## Location
`artifacts/iic-app/src/utils/progressBonusEngine.ts`

## Two systems
- **L4–L8**: PROGRESS_BONUS_TABLE[level] = array of {progressPct, bonusPct} brackets. Highest reached wins. bonus = ceil(earned × bonusPct/100)
- **L9+**: LIMIT_TOUCH_MULTIPLIERS[level] = multiplier. Only if 100% limit reached. bonus = floor(earned × (mult-1))

## L9+ multipliers: 9=1.5×, 10=2.0×, 11=2.5×, 12=3.2×, 13=4.0×, 14=5.0×

## getTodayBonusPreview returns
{ currentBonusPct, currentBonusScore, nextBracketPct, nextBonusPct, scoreToNextBracket, isMultiplierLevel, multiplier, progressPct }

## App.tsx midnight useEffect
Line ~718 in App.tsx. Runs on [user.id, user.lastLoginDate, originalAdmin] change. Guard: localStorage `nst_pb_{userId}_{yesterday}` + user.lastProgressBonusDate field.

## UI Widget
In StudentDashboard.tsx Profile tab, after stats row (Credits/Streak/XP). Only shown for L4+ non-admin users.

**Why:** Bonus is applied once per day when user opens the app on a new day. Firebase + localStorage dual guard prevents double application.
