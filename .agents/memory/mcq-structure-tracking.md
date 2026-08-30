---
name: MCQ structure tracking
description: The durable shape needed to keep statement-based MCQs consistent across study and revision flows.
---

Statement-based MCQs must travel through the app as one structured record: question number, labeled Roman/numeric statements, options A–D, correct option, and explanation.

**Why:** Revision Hub previously stored only the question text and correct option, so statement content could disappear from mistake practice and different MCQ surfaces rendered different shapes.

**How to apply:** Reuse the shared MCQ normalization and display helpers whenever adding an MCQ parser, save path, mistake bank, revision view, homework view, or projector view. Preserve existing statement labels instead of generating a second label.

All interactive MCQ surfaces should follow one visual contract: question number first, then stem/statements, then the shared option cards. Revision Hub has no Skip action; sequential non-Hub modes keep their existing Skip action.

**Why:** Students move between many MCQ sources, so a consistent card reduces confusion while Skip remains a deliberate flow-specific control.

**How to apply:** Use the shared practice-card component for question and option rendering, and keep navigation/Skip buttons outside it so each source can preserve its own navigation rules.