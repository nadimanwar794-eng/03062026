---
name: Challenge scheduling and format
description: Daily/weekly challenge period rules and the stricter Challenge 2.0 MCQ contract.
---

Manual challenges are published through shared system settings so every student sees the same period challenge; if none is valid, the client deterministically builds and persists an automatic set from all available content pools. Daily uses the local calendar date, remains visible until the next local midnight, while weekly uses the Monday-start local week and runs once per week.

**Why:** Browser-only challenge storage made admin-created challenges invisible on student devices, and timestamp-based weekly generation could create duplicate or missed weekly tests.

**How to apply:** Keep manual and automatic selection keyed by the same local period, include centrally uploaded class/book/competition/homework/Lucent pools, and retain the challenge record after completion. Challenge 2.0 uses the Class 6–12 structured MCQ shape: four valid options plus question number, statements, answer, and explanation when present. Normalize mixed Lucent question markers before parsing so a paste cannot merge or drop later questions. Matching/paragraph-option questions remain excluded.