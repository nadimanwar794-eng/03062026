---
name: Unified content system
description: MULTI_TAB content type + virtual boards (LUCENT/COMPBOOK/GK/HOMEWORK) + LibraryView for student browsing
---

## Rule
Any content uploaded via virtual boards (LUCENT/COMPBOOK/GK/HOMEWORK) in AdminDashboard saves with `type: 'MULTI_TAB'`. LessonView renders it as a tabbed viewer (Notes/MCQ/Video/Audio/PDF). Students browse via LibraryView (HOME tab → Library card).

**Why:** Unified upload form for all content types — admin uploads once, student gets all tabs in one place.

## Key files
- `src/types.ts` — ClassLevel includes BOOK/DAILY; Board includes LUCENT/COMPBOOK/GK/HOMEWORK; ContentType includes MULTI_TAB; LessonContent has unified* fields
- `src/components/LessonView.tsx` — MULTI_TAB render block at ~line 521; multiTab prop + activeMultiTab state
- `src/components/AdminDashboard.tsx` — VIRTUAL_BOARD_CONFIG constant; handleSubjectClick uses getCustomSyllabus for virtual boards; saveChapterContent auto-sets type=MULTI_TAB
- `src/components/LibraryView.tsx` — NEW; full browse UI: Boards → Subjects → Chapters → LessonView
- `src/components/StudentDashboard.tsx` — showLibrary state; Library card in HOME tab; LibraryView overlay

## Storage key format
`nst_content_${board}_${classLevel}_${subjectName}_${chapterId}`
e.g. `nst_content_LUCENT_BOOK_History / इतिहास_chapter1`

## Custom syllabus key format
`${board}-${classLevel}-${subjectName}-English`
e.g. `LUCENT-BOOK-History / इतिहास-English`
