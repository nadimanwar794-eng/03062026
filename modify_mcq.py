import re

with open('artifacts/iic-study-app/src/components/TodayMcqSession.tsx', 'r') as f:
    content = f.read()

# 1. Update handleAnswer to allow changing answers
search_handle = """    // ── Answer handler ────────────────────────────────────────────────────
    const handleAnswer = (optionIdx: number) => {
        if (answers[qIndex] !== undefined) return;

        // Today Revision Hub MCQs — NO daily MCQ limit applies here
        const isCorrect = interleavedQuestions[qIndex]?.correctAnswer === optionIdx;
        if (onTrackAnswer) {
            if (!onTrackAnswer(isCorrect)) return;
        }

        // ── MCQ Scoring: +2 correct, -1 wrong, streak bonuses ─────────────────"""

replace_handle = """    // ── Answer handler ────────────────────────────────────────────────────
    const handleAnswer = (optionIdx: number) => {
        // Today Revision Hub MCQs — NO daily MCQ limit applies here
        const isCorrect = interleavedQuestions[qIndex]?.correctAnswer === optionIdx;
        const isFirstTime = answers[qIndex] === undefined;

        if (isFirstTime && onTrackAnswer) {
            if (!onTrackAnswer(isCorrect)) return;
        }

        // ── MCQ Scoring: +2 correct, -1 wrong, streak bonuses ─────────────────"""

if search_handle in content:
    content = content.replace(search_handle, replace_handle)
else:
    print("search_handle not found")


search_handle_pt2 = """            }
        }

        const newAnswers = { ...answers, [qIndex]: optionIdx };
        setAnswers(newAnswers);

        setTimeout(() => {
            if (qIndex < interleavedQuestions.length - 1) {
                setQIndex(prev => prev + 1);
            } else {
                finishSession(newAnswers);
            }
        }, 500);
    };"""

replace_handle_pt2 = """            }
        }

        const newAnswers = { ...answers, [qIndex]: optionIdx };
        setAnswers(newAnswers);

        // Auto-submit if all questions are answered and this was the last pending one.
        if (Object.keys(newAnswers).length === interleavedQuestions.length) {
            setTimeout(() => {
                finishSession(newAnswers);
            }, 800);
        } else if (isFirstTime && qIndex < interleavedQuestions.length - 1) {
            // Only auto-advance on the first selection for this question, if not the last question
            setTimeout(() => {
                setQIndex(prev => prev + 1);
            }, 500);
        }
    };"""

if search_handle_pt2 in content:
    content = content.replace(search_handle_pt2, replace_handle_pt2)
else:
    print("search_handle_pt2 not found")

# 2. Remove Submit Button from top right
search_submit_btn = """                    <button
                        onClick={() => finishSession(answers)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-green-700"
                    >
                        Submit
                    </button>
                </div>
            </div>"""

replace_submit_btn = """                </div>
            </div>"""

if search_submit_btn in content:
    content = content.replace(search_submit_btn, replace_submit_btn)
else:
    print("search_submit_btn not found")

# 3. Remove disabled={answered} from radio button
search_radio = """                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={answered}
                                className={`w-full px-4 py-3 rounded-xl border text-left font-medium transition-all flex items-center gap-3 ${bg} ${border} ${text}`}
                            >"""

replace_radio = """                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`w-full px-4 py-3 rounded-xl border text-left font-medium transition-all flex items-center gap-3 ${bg} ${border} ${text}`}
                            >"""

if search_radio in content:
    content = content.replace(search_radio, replace_radio)
else:
    print("search_radio not found")


# 4. Add "Pichla" and "Agla" bottom navigation buttons in normal mode.
search_footer = """                    })}
                </div>
            </div>

            {/* ── Projector Mode Overlay ── */}
            {isProjectorMode && interleavedQuestions.length > 0 && createPortal((() => {"""

replace_footer = """                    })}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-4 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => setQIndex(p => Math.max(0, p - 1))}
                    disabled={qIndex === 0}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${qIndex === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white shadow-md active:scale-95'}`}
                >
                    <ChevronLeft size={18} /> Pichla
                </button>
                <button
                    onClick={() => setQIndex(p => Math.min(interleavedQuestions.length - 1, p + 1))}
                    disabled={qIndex === interleavedQuestions.length - 1}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${qIndex === interleavedQuestions.length - 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white shadow-md active:scale-95'}`}
                >
                    Agla <ChevronRight size={18} />
                </button>
            </div>

            {/* ── Projector Mode Overlay ── */}
            {isProjectorMode && interleavedQuestions.length > 0 && createPortal((() => {"""

if search_footer in content:
    content = content.replace(search_footer, replace_footer)
else:
    print("search_footer not found")


with open('artifacts/iic-study-app/src/components/TodayMcqSession.tsx', 'w') as f:
    f.write(content)
