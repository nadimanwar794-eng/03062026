---
name: Challenge scheduling and format
description: Daily/weekly challenge period rules and the stricter Challenge 2.0 MCQ contract.
---

Manual challenges are published through shared system settings so every student sees the same period challenge; if none is valid, the client deterministically builds an automatic set from available content. Daily uses the local calendar date, while weekly uses the Monday-start local week and runs once per week.

**Why:** Browser-only challenge storage made admin-created challenges invisible on student devices, and timestamp-based weekly generation could create duplicate or missed weekly tests.

**How to apply:** Keep manual and automatic selection keyed by the same local period. Challenge 2.0 accepts exactly four concise options and rejects statement/matching or paragraph-option questions; the shared MCQ renderer may still support legacy structured questions elsewhere.