/**
 * GroupedSessionBanner — HOME tab pe dikhne wala session summary card.
 * 1 activity → mode-specific header + "More" pe per-mode breakdown
 * 2+ activities → "Session Complete" grouped header
 *
 * Expanded breakdown dikhata hai:
 *   Mode | Chapter | Time active | Pts | Bonus pts | Credits
 */

import React, { useEffect, useState } from 'react';
import { SessionCompletePayload } from '../utils/sessionNotify';
import { X, ChevronDown, ChevronUp, Clock, Star, Trophy, Zap } from 'lucide-react';

interface GroupedSessionBannerProps {
  sessions: SessionCompletePayload[];
  onDismiss: () => void;
}

function formatTime(secs: number): string {
  if (!secs || secs <= 0) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const ACTIVITY_EMOJI: Record<string, string> = {
  MCQ: '📝',
  Reading: '📖',
  Writing: '✍️',
  LESSON: '📚',
  PDF: '📄',
  Video: '🎬',
  Audio: '🎧',
  QA: '💬',
  Flashcard: '🃏',
};

const ACTIVITY_LABEL: Record<string, string> = {
  MCQ: 'MCQ Practice',
  Reading: 'Reading Notes',
  Writing: 'Writing Notes',
  LESSON: 'Lesson',
  PDF: 'PDF Reading',
  Video: 'Video Lecture',
  Audio: 'Audio / Podcast',
  QA: 'Q&A Review',
  Flashcard: 'Flashcards',
};

function getActivityKey(session: SessionCompletePayload): string {
  if (session.activityType) return session.activityType;
  return session.type === 'MCQ' ? 'MCQ' : 'LESSON';
}

export const GroupedSessionBanner: React.FC<GroupedSessionBannerProps> = ({
  sessions,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  const handleDismiss = () => {
    if (dismissing) return;
    setDismissing(true);
    setVisible(false);
    setTimeout(onDismiss, 350);
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    // Auto-hide after 3.5 seconds
    const autoHide = setTimeout(handleDismiss, 3500);
    return () => { clearTimeout(t); clearTimeout(autoHide); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Totals
  const totalPts     = sessions.reduce((s, sess) => s + (sess.sessionScore  ?? 0), 0);
  const totalBonus   = sessions.reduce((s, sess) => s + (sess.bonusPts      ?? 0), 0);
  const totalCoins   = sessions.reduce((s, sess) => s + (sess.coinsEarned   ?? 0), 0);
  const totalCredits = sessions.reduce((s, sess) => s + (sess.creditsEarned ?? 0), 0);
  const totalSecs    = sessions.reduce((s, sess) => s + (sess.timeSecs      ?? 0), 0);
  const count        = sessions.length;

  // single session convenience
  const solo = count === 1 ? sessions[0] : null;
  const soloKey = solo ? getActivityKey(solo) : '';
  const soloEmoji = solo ? (ACTIVITY_EMOJI[soloKey] || '📚') : '';
  const soloLabel = solo ? (ACTIVITY_LABEL[soloKey] || soloKey) : '';

  // Combined coin / credit display
  const totalCoinDisplay = totalCoins + totalCredits;

  return (
    <div
      className="mx-3 mt-3 mb-1 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2044 100%)',
        border: '1.5px solid rgba(250,204,21,0.35)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-18px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.3s ease',
      }}
    >
      {/* Gold shimmer top line */}
      <div
        className="h-[3px] w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }}
      >
        <span
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer-sweep 1.6s linear infinite',
          }}
        />
      </div>

      <div className="px-4 pt-3 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.35)' }}
            >
              {solo ? soloEmoji : <Trophy size={20} className="text-yellow-400" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest leading-none mb-0.5">
                {solo ? `${soloLabel} Complete! 🎯` : `Session Complete! 🎯`}
              </p>
              <p className="text-[13px] font-bold text-white leading-tight truncate" style={{ maxWidth: '200px' }}>
                {solo
                  ? (solo.chapter || solo.subject || soloLabel)
                  : `${count} modes padhe aaj`}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 mt-0.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-90"
          >
            <X size={15} />
          </button>
        </div>

        {/* Total stats row */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {/* Total Points */}
          <div
            className="rounded-xl px-2 py-2 flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <Star size={10} className="opacity-80 shrink-0" />
              <span className="text-[8px] font-semibold uppercase tracking-wide truncate">Pts</span>
            </div>
            <span className="text-[13px] font-black text-yellow-400 leading-none">
              {totalPts > 0 ? `+${totalPts >= 1000 ? `${(totalPts/1000).toFixed(1)}k` : totalPts}` : '—'}
            </span>
          </div>

          {/* Bonus Pts */}
          <div
            className="rounded-xl px-2 py-2 flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <Zap size={10} className="opacity-80 shrink-0" />
              <span className="text-[8px] font-semibold uppercase tracking-wide truncate">Bonus</span>
            </div>
            <span className="text-[13px] font-black text-purple-400 leading-none">
              {totalBonus > 0 ? `+${totalBonus}` : '—'}
            </span>
          </div>

          {/* Coins / Credits */}
          <div
            className="rounded-xl px-2 py-2 flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <span className="text-[10px] opacity-80 leading-none">🪙</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide truncate">Credit</span>
            </div>
            <span className="text-[13px] font-black text-amber-400 leading-none">
              {totalCoinDisplay > 0 ? `+${totalCoinDisplay}` : '—'}
            </span>
          </div>

          {/* Time */}
          <div
            className="rounded-xl px-2 py-2 flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <Clock size={10} className="opacity-80 shrink-0" />
              <span className="text-[8px] font-semibold uppercase tracking-wide truncate">Time</span>
            </div>
            <span className="text-[13px] font-black text-sky-300 leading-none">
              {formatTime(totalSecs)}
            </span>
          </div>
        </div>

        {/* More / Less toggle */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-white transition active:scale-95"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {expanded ? (
            <><ChevronUp size={13} /> Less</>
          ) : (
            <><ChevronDown size={13} /> More — mode-wise breakdown dekho</>
          )}
        </button>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="mt-2 flex flex-col gap-1.5">
            {sessions.map((sess, idx) => {
              const key   = getActivityKey(sess);
              const emoji = ACTIVITY_EMOJI[key]  || '📖';
              const label = ACTIVITY_LABEL[key]  || key;
              const pts     = sess.sessionScore   ?? 0;
              const bonus   = sess.bonusPts       ?? 0;
              const cr      = (sess.coinsEarned ?? 0) + (sess.creditsEarned ?? 0);
              const secs    = sess.timeSecs       ?? 0;

              return (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* Row top: emoji + labels */}
                  <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                    <span className="text-lg shrink-0">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-white leading-none">{label}</p>
                      {sess.chapter && (
                        <p className="text-[9px] text-slate-400 leading-none mt-0.5 truncate">{sess.chapter}</p>
                      )}
                    </div>
                    {/* Time badge */}
                    {secs > 0 && (
                      <span className="shrink-0 text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/08">
                        ⏱ {formatTime(secs)}
                      </span>
                    )}
                  </div>

                  {/* Row bottom: pts / bonus / credits pills */}
                  <div className="flex items-center gap-1.5 px-3 pb-2.5 flex-wrap">
                    {pts > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                        ⭐ +{pts} pts
                      </span>
                    )}
                    {bonus > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-full">
                        ⚡ +{bonus} bonus
                      </span>
                    )}
                    {cr > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        🪙 +{cr} cr
                      </span>
                    )}
                    {pts === 0 && bonus === 0 && cr === 0 && (
                      <span className="text-[10px] text-slate-500">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
