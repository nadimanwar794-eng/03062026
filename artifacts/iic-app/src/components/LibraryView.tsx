// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Loader, FileText, Plus, Trash2 } from 'lucide-react';
import { getCustomSyllabus, getChapterData, getLibraryCustomBooks } from '../firebase';
import { LessonView } from './LessonView';

const FIXED_BOARDS = [
  {
    id: 'LUCENT', emoji: '📖', label: 'Lucent GK', classLevel: 'BOOK',
    grad: 'from-blue-600 to-indigo-600', soft: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600',
    subjects: [
      { id: 'history',     name: 'History / इतिहास' },
      { id: 'geography',   name: 'Geography / भूगोल' },
      { id: 'polity',      name: 'Polity / राजनीति' },
      { id: 'economy',     name: 'Economy / अर्थशास्त्र' },
      { id: 'science',     name: 'Science / विज्ञान' },
      { id: 'art_culture', name: 'Art & Culture / कला' },
    ],
  },
  {
    id: 'COMPBOOK', emoji: '🚀', label: 'Competition Books', classLevel: 'BOOK',
    grad: 'from-orange-500 to-amber-500', soft: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500',
    subjects: [
      { id: 'sar_sangrah',    name: 'Sar Sangrah / सार संग्रह' },
      { id: 'speedy_science', name: 'Speedy Science' },
      { id: 'speedy_social',  name: 'Speedy Social Science' },
    ],
  },
  {
    id: 'GK', emoji: '🌍', label: 'Daily GK', classLevel: 'DAILY',
    grad: 'from-emerald-600 to-teal-500', soft: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600',
    subjects: [
      { id: 'general_knowledge', name: 'General Knowledge / सामान्य ज्ञान' },
      { id: 'current_affairs',   name: 'Current Affairs / करंट अफेयर्स' },
    ],
  },
  {
    id: 'HOMEWORK', emoji: '📝', label: 'Homework / Notes', classLevel: 'COMPETITION',
    grad: 'from-purple-600 to-fuchsia-500', soft: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-600',
    subjects: [
      { id: 'mcq_practice', name: 'MCQ Practice' },
      { id: 'class_notes',  name: 'Class Notes / कक्षा नोट्स' },
    ],
  },
];

// Color palettes for custom books
const CUSTOM_COLORS = [
  { grad: 'from-rose-500 to-pink-500',     soft: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   badge: 'bg-rose-500' },
  { grad: 'from-cyan-500 to-sky-500',      soft: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   badge: 'bg-cyan-500' },
  { grad: 'from-lime-500 to-green-500',    soft: 'bg-lime-50',   border: 'border-lime-200',   text: 'text-lime-700',   badge: 'bg-lime-600' },
  { grad: 'from-yellow-500 to-orange-400', soft: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-500' },
  { grad: 'from-violet-600 to-purple-500', soft: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-600' },
  { grad: 'from-teal-500 to-emerald-400',  soft: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   badge: 'bg-teal-500' },
];

type Step = 'BOARDS' | 'SUBJECTS' | 'CHAPTERS' | 'PLAYER';

interface Props {
  user: any;
  settings: any;
  onBack: () => void;
}

export const LibraryView: React.FC<Props> = ({ user, settings, onBack }) => {
  const [step, setStep]                     = useState<Step>('BOARDS');
  const [selBoardId, setSelBoardId]         = useState<string | null>(null);
  const [selSubject, setSelSubject]         = useState<{ id: string; name: string } | null>(null);
  const [chapters, setChapters]             = useState<any[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selChapter, setSelChapter]         = useState<any | null>(null);
  const [content, setContent]               = useState<any | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [customBooks, setCustomBooks]       = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks]     = useState(true);

  // Load custom books from Firebase on mount
  useEffect(() => {
    getLibraryCustomBooks()
      .then(books => setCustomBooks(Array.isArray(books) ? books : []))
      .catch(() => setCustomBooks([]))
      .finally(() => setLoadingBooks(false));
  }, []);

  // Merge fixed + custom boards
  const allBoards = [
    ...FIXED_BOARDS,
    ...customBooks.map((b, idx) => ({
      id: b.id,
      emoji: b.emoji || '📗',
      label: b.label,
      classLevel: b.classLevel || 'CUSTOM',
      subjects: (b.subjects || []).map((s: string) => ({ id: s.toLowerCase().replace(/[^a-z0-9]/g, '_'), name: s })),
      ...CUSTOM_COLORS[idx % CUSTOM_COLORS.length],
    })),
  ];

  const boardCfg = selBoardId ? allBoards.find(b => b.id === selBoardId) || null : null;

  const handleBoardSelect = (boardId: string) => {
    setSelBoardId(boardId);
    setSelSubject(null);
    setChapters([]);
    setStep('SUBJECTS');
  };

  const handleSubjectSelect = async (sub: { id: string; name: string }) => {
    if (!boardCfg || !selBoardId) return;
    setSelSubject(sub);
    setStep('CHAPTERS');
    setLoadingChapters(true);
    try {
      const ch = await getCustomSyllabus(`${selBoardId}-${boardCfg.classLevel}-${sub.name}-English`);
      setChapters(Array.isArray(ch) ? ch : []);
    } catch {
      setChapters([]);
    }
    setLoadingChapters(false);
  };

  const handleChapterSelect = async (ch: any) => {
    if (!boardCfg || !selBoardId || !selSubject) return;
    setSelChapter(ch);
    setStep('PLAYER');
    setLoadingContent(true);
    try {
      const key = `nst_content_${selBoardId}_${boardCfg.classLevel}_${selSubject.name}_${ch.id}`;
      let data: any = await getChapterData(key);
      if (!data) {
        try { const l = localStorage.getItem(key); if (l) data = JSON.parse(l); } catch {}
      }
      setContent(data
        ? { ...data, type: 'MULTI_TAB', title: ch.title || ch.name || 'Chapter', subtitle: `${boardCfg.label} · ${selSubject.name}` }
        : { type: 'MULTI_TAB', title: ch.title || ch.name || 'Chapter', subtitle: `${boardCfg.label} · ${selSubject.name}` }
      );
    } catch {
      setContent(null);
    }
    setLoadingContent(false);
  };

  const goBack = () => {
    if (step === 'PLAYER')   { setStep('CHAPTERS'); setContent(null); setSelChapter(null); return; }
    if (step === 'CHAPTERS') { setStep('SUBJECTS'); setChapters([]); setSelSubject(null); return; }
    if (step === 'SUBJECTS') { setStep('BOARDS'); setSelBoardId(null); return; }
    onBack();
  };

  const crumb = [
    '📚 Library',
    boardCfg ? `${boardCfg.emoji} ${boardCfg.label}` : null,
    selSubject ? selSubject.name : null,
    selChapter ? (selChapter.title || selChapter.name) : null,
  ].filter(Boolean).join(' › ');

  // ── PLAYER ──
  if (step === 'PLAYER') {
    if (loadingContent) return (
      <div className="fixed inset-0 z-[300] bg-white flex items-center justify-center flex-col gap-3 text-slate-400">
        <Loader size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm font-bold">Content load ho raha hai...</p>
      </div>
    );
    if (!content) return (
      <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center gap-4 p-8">
        <FileText size={48} className="text-slate-300" />
        <p className="text-slate-600 font-black text-center text-base">Content abhi upload nahi hua</p>
        <p className="text-slate-400 text-sm text-center">Admin is chapter mein content upload karein</p>
        <button onClick={goBack} className="mt-2 px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform">
          ← Wapas Jaao
        </button>
      </div>
    );
    return (
      <div className="fixed inset-0 z-[300] bg-white">
        <LessonView
          content={content}
          chapter={selChapter}
          subject={selSubject as any}
          user={user}
          settings={settings}
          multiTab
          onBack={goBack}
        />
      </div>
    );
  }

  // ── BROWSE UI ──
  return (
    <div className="min-h-full bg-slate-50 pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={goBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors active:scale-95">
          <ArrowLeft size={18} className="text-slate-700" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-black text-slate-800 truncate">{crumb}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {step === 'BOARDS' ? 'Category chunein' : step === 'SUBJECTS' ? 'Subject chunein' : 'Chapter chunein'}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">

        {/* ── BOARDS ── */}
        {step === 'BOARDS' && (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5 text-center">
              Kaunsa section dekhna chahte ho?
            </p>

            {loadingBooks ? (
              <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                <Loader size={20} className="animate-spin" />
                <span className="text-sm font-bold">Books load ho rahi hain...</span>
              </div>
            ) : (
              allBoards.map(cfg => (
                <button
                  key={cfg.id}
                  onClick={() => handleBoardSelect(cfg.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${cfg.soft} ${cfg.border} hover:shadow-lg active:scale-[0.98] transition-all text-left`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${cfg.grad} shadow-md shrink-0`}>
                    <span>{cfg.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-black ${cfg.text}`}>{cfg.label}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{cfg.subjects.length} subjects available</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 shrink-0" />
                </button>
              ))
            )}
          </>
        )}

        {/* ── SUBJECTS ── */}
        {step === 'SUBJECTS' && boardCfg && (
          <>
            <div className={`rounded-2xl p-4 bg-gradient-to-br ${boardCfg.grad} text-white mb-2`}>
              <p className="text-2xl mb-1">{boardCfg.emoji}</p>
              <p className="font-black text-lg leading-tight">{boardCfg.label}</p>
              <p className="text-xs text-white/80 font-medium mt-0.5">Subject chunein</p>
            </div>
            {boardCfg.subjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => handleSubjectSelect(sub)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-white ${boardCfg.border} hover:shadow-md active:scale-[0.98] transition-all text-left`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${boardCfg.badge} text-white shrink-0`}>
                  <BookOpen size={16} />
                </div>
                <p className="flex-1 font-black text-slate-800 text-sm">{sub.name}</p>
                <ChevronRight size={18} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </>
        )}

        {/* ── CHAPTERS ── */}
        {step === 'CHAPTERS' && (
          <>
            {loadingChapters ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader size={30} className="animate-spin text-indigo-400" />
                <p className="text-sm font-bold">Chapters load ho rahe hain...</p>
              </div>
            ) : chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl">📭</div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-600">Abhi koi chapter nahi hai</p>
                  <p className="text-xs text-slate-400 mt-1">Admin Dashboard se is subject mein chapters add karein</p>
                </div>
              </div>
            ) : (
              <>
                <div className={`rounded-2xl p-3 ${boardCfg?.soft || 'bg-slate-50'} ${boardCfg?.border || 'border-slate-200'} border-2 mb-2`}>
                  <p className={`text-xs font-black ${boardCfg?.text || 'text-slate-600'} uppercase tracking-wider`}>
                    {selSubject?.name} · {chapters.length} Chapters
                  </p>
                </div>
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id || i}
                    onClick={() => handleChapterSelect(ch)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-700 font-black text-sm border border-indigo-100 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm truncate">{ch.title || ch.name || `Chapter ${i + 1}`}</p>
                      {ch.subtitle && <p className="text-xs text-slate-500 truncate">{ch.subtitle}</p>}
                    </div>
                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                  </button>
                ))}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default LibraryView;
