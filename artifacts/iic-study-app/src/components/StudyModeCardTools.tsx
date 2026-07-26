import React, { useEffect, useState } from 'react';
import { BarChart3, Clock3 } from 'lucide-react';
import {
  formatActivityDuration,
  getStudyActivity,
  type StudyActivityMode,
  type StudyActivityRecord,
} from '../utils/activityTracker';

export interface StudyCardMode {
  mode: StudyActivityMode;
  label: string;
  emoji: string;
}

const MODE_STYLES: Record<StudyActivityMode, string> = {
  READING: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  WRITING: 'bg-teal-50 text-teal-700 border-teal-100',
  MCQ: 'bg-purple-50 text-purple-700 border-purple-100',
  FLASHCARD: 'bg-amber-50 text-amber-700 border-amber-100',
  QA: 'bg-sky-50 text-sky-700 border-sky-100',
  PDF: 'bg-blue-50 text-blue-700 border-blue-100',
  VIDEO: 'bg-rose-50 text-rose-700 border-rose-100',
  AUDIO: 'bg-violet-50 text-violet-700 border-violet-100',
};

const get = (stats: Partial<Record<StudyActivityMode, StudyActivityRecord>>, mode: StudyActivityMode) =>
  stats[mode] || {
    seconds: 0, sessions: 0, opens: 0, activityCount: 0, questionsSeen: 0,
    questionsAttempted: 0, correctAnswers: 0, cardsSeen: 0, knownCards: 0,
    unknownCards: 0, attempts: [],
  };

export const StudyModeButtons: React.FC<{
  modes: StudyCardMode[];
  onModeClick: (mode: StudyActivityMode) => void;
}> = ({ modes, onModeClick }) => (
  <div className="flex flex-wrap gap-1.5" aria-label="Available study modes">
    {modes.map(mode => (
      <button
        key={mode.mode}
        type="button"
        onClick={event => { event.stopPropagation(); onModeClick(mode.mode); }}
        className={`px-2 py-1 rounded-lg border text-[9px] font-black active:scale-95 transition-all ${MODE_STYLES[mode.mode]}`}
        title={`Open ${mode.label}`}
      >
        {mode.emoji} {mode.label}
      </button>
    ))}
  </div>
);

export const StudyStatsPanel: React.FC<{
  userId: string;
  contentId: string;
  modes: StudyCardMode[];
  open: boolean;
  onToggle: () => void;
}> = ({ userId, contentId, modes, open, onToggle }) => {
  const [stats, setStats] = useState(() => getStudyActivity(userId, contentId));
  useEffect(() => {
    if (open) setStats(getStudyActivity(userId, contentId));
  }, [open, userId, contentId]);
  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setStats(getStudyActivity(userId, contentId)), 1000);
    return () => window.clearInterval(timer);
  }, [open, userId, contentId]);

  return (
    <div className="border-t border-slate-100 bg-slate-50/80">
      <button
        type="button"
        onClick={event => { event.stopPropagation(); onToggle(); }}
        className="px-3 py-2 flex items-center gap-1.5 text-[10px] font-black text-slate-600 active:scale-95"
        aria-expanded={open}
      >
        <BarChart3 size={13} className="text-indigo-600" /> Stats
        <span className="text-[9px] font-bold text-slate-400">{open ? 'Hide' : 'View progress'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
          {modes.map(mode => {
            const item = get(stats, mode.mode);
            const score = mode.mode === 'MCQ' && item.questionsAttempted > 0
              ? ` · ${item.correctAnswers}/${item.questionsAttempted} सही`
              : '';
            const count = mode.mode === 'FLASHCARD'
              ? ` · ${item.cardsSeen} cards`
              : mode.mode === 'QA'
                ? ` · ${item.questionsSeen} questions`
                : '';
            return (
              <div key={mode.mode} className="rounded-xl bg-white border border-slate-100 px-2.5 py-2">
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-700">
                  <span>{mode.emoji}</span>{mode.label}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-slate-500">
                  <Clock3 size={10} /> {item.seconds > 0 ? formatActivityDuration(item.seconds) : '—'}
                  {score}{count}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  {item.sessions || 0} session{item.sessions === 1 ? '' : 's'}
                  {item.lastOpenedAt ? ` · ${new Date(item.lastOpenedAt).toLocaleDateString()}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};