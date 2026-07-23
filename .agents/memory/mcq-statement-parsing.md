---
name: MCQ statement parsing
description: Durable rule for coaching MCQ bulk-paste parsing and numbered statements
---

Numbered statements must be detected from their numbering and surrounding question structure, not from visual markers such as `[⚡]`. Coaching bulk paste may also contain markdown formatting and duplicate empty answer labels, so normalize those presentation artifacts before parsing.

**Why:** Users paste mixed Hindi/Markdown MCQs where some questions have `[⚡]` and statement questions do not. Treating the marker as semantic would make valid statement MCQs behave inconsistently.

**How to apply:** Keep statement extraction independent of difficulty/category emojis, and run shared paste normalization before `parseMCQText` in every editor path.