import React, { useEffect, useState } from 'react';
import { BarChart3, Clock3, Timer } from 'lucide-react';
import {
  formatActivityDuration,
  getStudyActivity,
  type StudyActivityMode,
  type StudyActivityRecord,
  type McqScoreAttempt,
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

const get = (stats: Partial<Record<StudyActivityMode, StudyActivityRecord>>, mode: StudyActivityMode): StudyActivityRecord =>
  stats[mode] || {
    seconds: 0, sessions: 0, opens: 0, activityCount: 0, questionsSeen: 0,
    questionsAttempted: 0, correctAnswers: 0, cardsSeen: 0, knownCards: 0,
    unknownCards: 0, attempts: [], scoreHistory: [], lastOpenedAt: undefined,
  };

const pct = (c: number, t: number) => t > 0 ? Math.round((c / t) * 100) : 0;

const ScorePill: React.FC<{ label: string; score: McqScoreAttempt; color: string }> = ({ label, score, color }) => (
  <span className={`text-[9px] font-black px-1.5 py-[2px] rounded-full ${color}`}>
    {label}: {score.correct}/{score.total} ({pct(score.correct, score.total)}%)
  </span>
);

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
            const scoreHistory: McqScoreAttempt[] = item.scoreHistory || [];
            const latest = scoreHistory.at(-1);
            const best = scoreHistory.length > 0
              ? scoreHistory.reduce((b, s) => pct(s.correct, s.total) > pct(b.correct, b.total) ? s : b, scoreHistory[0])
              : undefined;
            const bestPct = best ? pct(best.correct, best.total) : 0;
            const latestPct = latest ? pct(latest.correct, latest.total) : 0;
            const timings = item.attempts || [];

            return (
              <div key={mode.mode} className="rounded-xl bg-white border border-slate-100 px-2.5 py-2">
                {/* Mode header */}
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-700">
                  <span>{mode.emoji}</span>{mode.label}
                </div>

                {/* Time + count */}
                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-slate-500">
                  <Clock3 size={10} />
                  {item.seconds > 0 ? formatActivityDuration(item.seconds) : '—'}
                  {mode.mode === 'FLASHCARD' && item.cardsSeen > 0 ? ` · ${item.cardsSeen} cards` : ''}
                  {mode.mode === 'QA' && item.questionsSeen > 0 ? ` · ${item.questionsSeen} Q` : ''}
                </div>

                {/* Sessions + last opened */}
                <div className="text-[9px] text-slate-400 mt-0.5">
                  {item.sessions || 0} session{item.sessions === 1 ? '' : 's'}
                  {item.lastOpenedAt
                    ? ` · ${new Date(item.lastOpenedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : ''}
                </div>

                {/* MCQ: Latest & Best scores from score history */}
                {mode.mode === 'MCQ' && scoreHistory.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex flex-wrap gap-1">
                      {latest && (
                        <ScorePill
                          label="Last"
                          score={latest}
                          color={latestPct >= 70 ? 'bg-emerald-50 text-emerald-700' : latestPct >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'}
                        />
                      )}
                      {best && latest && best !== latest && (
                        <ScorePill label="Best" score={best} color="bg-indigo-50 text-indigo-700" />
                      )}
                      {best && (!latest || best === latest) && (
                        <ScorePill
                          label="Best"
                          score={best}
                          color={bestPct >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
                        />
                      )}
                    </div>
                    {scoreHistory.length > 1 && (
                      <div className="text-[8px] text-slate-400">{scoreHistory.length} attempts total</div>
                    )}
                  </div>
                )}

                {/* MCQ: Last 5 individual question timings (green=correct, red=wrong) */}
                {mode.mode === 'MCQ' && timings.length > 0 && (
                  <div className="mt-1 flex items-center gap-[3px] flex-wrap">
                    <Timer size={8} className="text-slate-400 shrink-0" />
                    {timings.slice(-5).map((a, i) => (
                      <span
                        key={i}
                        title={a.correct ? `Q${i + 1}: ${a.seconds}s — सही` : `Q${i + 1}: ${a.seconds}s — गलत`}
                        className={`text-[8px] font-bold px-1 py-[1px] rounded ${
                          a.correct ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                        }`}
                      >
                        {a.seconds}s
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
