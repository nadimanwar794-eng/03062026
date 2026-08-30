---
name: MCQ structure tracking
description: The durable shape needed to keep statement-based MCQs consistent across study and revision flows.
---

Statement-based MCQs must travel through the app as one structured record: question number, labeled Roman/numeric statements, options A–D, correct option, and explanation.

**Why:** Revision Hub previously stored only the question text and correct option, so statement content could disappear from mistake practice and different MCQ surfaces rendered different shapes.

**How to apply:** Reuse the shared MCQ normalization and display helpers whenever adding an MCQ parser, save path, mistake bank, revision view, homework view, or projector view. Preserve existing statement labels instead of generating a second label.