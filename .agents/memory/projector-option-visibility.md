---
name: Projector option visibility
description: The display distinction between Projector Mode and Q&A/Flashcard study views
---

Projector Mode must always render all MCQ options because it is used as an interactive question presentation and answering surface. Statement questions additionally render their parsed statements above the options.

**Why:** A normal question in Projector Mode still needs its answer choices visible; applying the Q&A/Flashcard conditional rule there made the projector show only the question.

**How to apply:** Keep Projector's option list gated only by whether options exist. Use the shared qualifying-question rule only for Q&A and non-projector Flashcard views where normal questions intentionally hide choices until answer reveal.