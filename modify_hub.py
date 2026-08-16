import re

with open('artifacts/iic-study-app/src/components/RevisionHub.tsx', 'r') as f:
    content = f.read()

# Replace Pending Notes rendering
search_notes = """                                <div>
                                    <h4 className="text-lg font-black text-slate-800 mb-2">Today's Tasks</h4>
                                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                                        {pendingNotes.map((t, i) => {"""

replace_notes = """                                <div>
                                    <h4 className="text-lg font-black text-slate-800 mb-2">Today's Tasks</h4>
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                        {Object.entries(pendingNotes.reduce((acc, t) => {
                                            const sub = t.subjectName || 'General';
                                            if (!acc[sub]) acc[sub] = [];
                                            acc[sub].push(t);
                                            return acc;
                                        }, {} as Record<string, typeof pendingNotes>)).map(([subject, subNotes]) => (
                                            <div key={subject} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-sm">
                                                <h5 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-200/60 uppercase tracking-wide flex items-center gap-2">
                                                    <BookOpen size={14} className="text-indigo-500" /> {subject} <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 ml-auto">{subNotes.length} Topics</span>
                                                </h5>
                                                <div className="space-y-2">
                                                    {subNotes.map((t, i) => {"""

if search_notes in content:
    content = content.replace(search_notes, replace_notes)
else:
    print("search_notes not found")


search_notes_end = """                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="w-full pt-2">"""

replace_notes_end = """                                                    }
                                                </div>
                                            );
                                        })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full pt-2">"""

if search_notes_end in content:
    content = content.replace(search_notes_end, replace_notes_end)
else:
    print("search_notes_end not found")

# Replace Pending MCQs rendering
search_mcqs = """                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 mb-3">Practice List</h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {pendingMcqs.map((t, i) => {
                                                return (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                                                        <div>
                                                            <h5 className="font-bold text-slate-700 text-sm">{getCleanDisplayName(t.name, t.chapterName, t.subjectName)}</h5>
                                                            <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">{t.chapterName}</p>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-1 rounded-md">
                                                            MCQ Set
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="w-full pt-2">
                                        <button
                                            onClick={() => {
                                                if (user.subscriptionLevel === 'BASIC' && now.getDay() !== 0) {
                                                    setAlertConfig({isOpen: true, type: 'INFO', title: 'Sunday Only', message: 'Basic Plan allows revision sessions only on Sundays.'});
                                                } else {
                                                    mcqChapterRef.current = {
                                                        name: pendingMcqs[0]?.chapterName || pendingMcqs[0]?.name || 'MCQ Session',
                                                        subject: pendingMcqs[0]?.subjectName || '',
                                                    };
                                                    setShowTodayMcqSession(true);
                                                }
                                            }}
                                            className="w-full py-3 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                        >
                                            <PlayCircle size={18} /> Start MCQ Session
                                        </button>
                                    </div>
                                </div>"""

replace_mcqs = """                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                    {Object.entries(pendingMcqs.reduce((acc, t) => {
                                        const sub = t.subjectName || 'General';
                                        if (!acc[sub]) acc[sub] = [];
                                        acc[sub].push(t);
                                        return acc;
                                    }, {} as Record<string, typeof pendingMcqs>)).map(([subject, subMcqs]) => (
                                        <div key={subject} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                            <h5 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-200/60 uppercase tracking-wide flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckSquare size={14} className="text-purple-500" /> {subject}
                                                </div>
                                                <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">{subMcqs.length} Topics</span>
                                            </h5>
                                            <div className="space-y-2">
                                                {subMcqs.map((t, i) => (
                                                    <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-100 hover:shadow-sm transition-shadow">
                                                        <div>
                                                            <h5 className="font-bold text-slate-700 text-xs">{getCleanDisplayName(t.name, t.chapterName, t.subjectName)}</h5>
                                                            <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">{t.chapterName}</p>
                                                        </div>
                                                        <div className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">
                                                            MCQ
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (user.subscriptionLevel === 'BASIC' && now.getDay() !== 0) {
                                                        setAlertConfig({isOpen: true, type: 'INFO', title: 'Sunday Only', message: 'Basic Plan allows revision sessions only on Sundays.'});
                                                    } else {
                                                        mcqChapterRef.current = {
                                                            name: subMcqs[0]?.chapterName || subMcqs[0]?.name || 'MCQ Session',
                                                            subject: subject,
                                                        };
                                                        setActiveMcqTopics(subMcqs);
                                                        setShowTodayMcqSession(true);
                                                    }
                                                }}
                                                className="w-full mt-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-purple-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                            >
                                                <PlayCircle size={14} /> Start {subject} Session
                                            </button>
                                        </div>
                                    ))}
                                </div>"""

if search_mcqs in content:
    content = content.replace(search_mcqs, replace_mcqs)
else:
    print("search_mcqs not found")

with open('artifacts/iic-study-app/src/components/RevisionHub.tsx', 'w') as f:
    f.write(content)
