---
name: Revision tracker key consistency
description: How multi-topic Today MCQ sessions must address existing revision buckets.
---

The topic and page metadata that launch a Today MCQ session are authoritative when saving its revision result. Source question payloads may contain a different topic label or no topic label, and using those values can create a second scheduled bucket while the original remains due.

**Why:** A multi-topic session previously recorded answers under source-question labels and then scheduled a different key, so the visible original topics stayed incomplete even though a result existed.

**How to apply:** Carry the originating bucket's topic and page key through the session, use them for both per-question tracking and scheduling, and sync the resulting tracker map after the session.