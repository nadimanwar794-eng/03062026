---
name: Firebase account persistence
description: Durable account-state storage and fresh-device recovery strategy for the study app.
---

Use Firebase as the canonical account backend because authentication and the existing user-data flows already use Firebase. Keep account-sensitive fields duplicated in both Firestore user data and the RTDB user record so mobile/UID recovery can still load credits, subscriptions, rewards, and redemptions when Firestore access is unavailable before the real auth session is restored.

**Why:** Introducing a parallel PostgreSQL account system would split identity and create a second source of truth, while the app already has Firebase-backed users and recovery behavior.

**How to apply:** Treat localStorage as a cache only. Account-critical mutations must confirm a successful Firebase write before reporting success or updating the device cache; preserve RTDB mirroring when changing the account schema.