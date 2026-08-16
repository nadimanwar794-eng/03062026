# Execution Plan

1. **Update `RevisionHub.tsx`**
   - Import `TopicItem` if needed and group `pendingNotes` and `pendingMcqs` by `subjectName`.
   - Update the UI to render a separate list/box for each subject for Notes and MCQs.
   - For MCQs, add a separate "Start MCQ Session" button per subject. Add a new state `activeMcqTopics: TopicItem[]` to pass only the selected subject's MCQs to `<TodayMcqSession>`.

2. **Update `TodayMcqSession.tsx`**
   - Remove the `Submit` button from the top right (lines 859-864).
   - In the options rendering, remove `disabled={answered}` and let users select a different option. But if `isProjectorMode` is somehow affecting it, we'll ensure it works correctly (user said "projector mode bas chhor ke", but projector mode is a completely different render path starting at line 923, so we only remove `disabled` from the normal view).
   - Update `handleAnswer`:
     - Since they want to change the selected option, if they change the option, we should update `answers`. The logic in `handleAnswer` currently does `if (answers[qIndex] !== undefined) return;`. We need to remove this so it allows changing the answer.
     - However, we should only auto-advance if they are selecting an answer for the *first time*. If they are just changing their answer, we probably shouldn't auto-advance them, or we can just auto-advance anyway (it's fine). But to avoid frustration, let's keep auto-advance on the *first* selection. If `answers[qIndex]` was already defined, we just update it and don't auto-advance. Wait, no, we can just not auto-advance at all and add "Next" and "Previous" buttons at the bottom of the normal view!
     - Let's add "Previous" (`<button onClick={() => setQIndex(p => p - 1)}>`) and "Next" (`<button onClick={() => setQIndex(p => p + 1)}>`) buttons.
     - If it's the last question, auto-submit after a small delay once they select an answer.
     - Wait, if they must answer all questions, what if they skipped one and went to the next? The normal view has no "Skip" or "Next" button right now.
     - Let's add a navigation footer in normal mode:
       ```tsx
       <div className="flex gap-4 p-4 ...">
           <button onClick={() => setQIndex(p => p - 1)} disabled={qIndex === 0}>Previous</button>
           <button onClick={() => setQIndex(p => p + 1)} disabled={qIndex === interleavedQuestions.length - 1}>Next</button>
       </div>
       ```
     - And if they are on the last question, selecting an answer auto-submits, OR the Next button becomes Submit. The user explicitly said: "tab submite hoga apne aap jaise hi last question banega submite higa". So if they answer the last question, we auto-submit after 500ms. If they want to change it, they have 500ms, which is too short. Alternatively, we only auto-submit if ALL questions are answered and they just answered the last one. Let's just auto-submit when `Object.keys(answers).length === interleavedQuestions.length`. That perfectly meets "jaise hi last question banega submite higa".

3. **Run Pre-Commit Checks**
   - Run tests, typecheck, linting.

4. **Submit**

Does this look solid?
