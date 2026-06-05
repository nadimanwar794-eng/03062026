---
name: IIC App Score System
description: Daily limits, tier routing, and getDailyScoreLimit API details for IIC app
---

# IIC Score System — Key Facts

## getDailyScoreLimit signature
```ts
getDailyScoreLimit(subscriptionLevel?, isPremium?, scoreLimitBoostPercent?, eventExtraPoints?)
```
- NOT (userId, tier) — always pass subscriptionLevel as first arg
- Free users: isPremium=false → tierKey='FREE' → 5000 pts
- Basic: isPremium=true, subscriptionLevel='BASIC' → 7000 pts
- Ultra: isPremium=true, subscriptionLevel='ULTRA' → 10000 pts

## getDailyScoreEarned signature
```ts
getDailyScoreEarned(userId: string): number
```

**Why:** A previous implementation had `const base = isPremium ? DAILY_TIER_LIMITS[...] : 1500` which hard-coded 1500 for free users instead of using DAILY_TIER_LIMITS['FREE']=5000. Fixed by routing through tierKey.

**How to apply:** Any new call site must pass subscriptionLevel as first arg, not userId.
