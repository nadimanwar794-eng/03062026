/**
 * GroupedSessionBanner — HOME tab pe dikhne wala grouped summary card.
 * Jab user ek se zyada activities (Reading + Writing + MCQ) karke HOME pe aata hai,
 * yeh ek SINGLE card dikhta hai jisme:
 *   • Total Points | Total Coins | Total Time (top row)
 *   • "More ▾" button → expand hone pe har activity ki row dikhti hai
 *   • X close button
 */

import React, { useEffect, useState } from 'react';
import { SessionCompletePayload } from '../utils/sessionNotify';
import { X, ChevronDown, ChevronUp, Clock, Star, Trophy } from 'lucide-react';

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
};

const ACTIVITY_LABEL: Record<string, string> = {
  MCQ: 'MCQ',
  Reading: 'Reading Notes',
  Writing: 'Writing Notes',
  LESSON: 'Lesson',
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

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Totals
  const totalPts = sessions.reduce((s, sess) => s + (sess.sessionScore ?? 0), 0);
  const totalCoins = sessions.reduce((s, sess) => s + (sess.coinsEarned ?? 0), 0);
  const totalSecs = sessions.reduce((s, sess) => s + (sess.timeSecs ?? 0), 0);
  const count = sessions.length;

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
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.35)' }}
            >
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest leading-none mb-0.5">
                Session Complete! 🎯
              </p>
              <p className="text-[13px] font-bold text-white leading-tight">
                {count} activities padhe aaj
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 mt-0.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-90"
          >
            <X size={15} />
          </button>
        </div>

        {/* Total stats row */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {/* Total Points */}
          <div
            className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Star size={12} className="opacity-80" />
              <span className="text-[9px] font-semibold uppercase tracking-wider">Total Pts</span>
            </div>
            <span className="text-base font-black text-yellow-400">
              {totalPts > 0 ? `+${totalPts >= 1000 ? `${(totalPts / 1000).toFixed(1)}k` : totalPts}` : '—'}
            </span>
            <p className="text-[9px] text-slate-500 leading-none">⭐ earned</p>
          </div>

          {/* Total Coins */}
          <div
            className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <span className="text-[12px] opacity-80">🪙</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider">Coins Mile</span>
            </div>
            <span className="text-base font-black text-amber-400">
              {totalCoins > 0 ? `+${totalCoins}` : '—'}
            </span>
            <p className="text-[9px] text-slate-500 leading-none">coins earned</p>
          </div>

          {/* Total Time */}
          <div
            className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Clock size={12} className="opacity-80" />
              <span className="text-[9px] font-semibold uppercase tracking-wider">Total Time</span>
            </div>
            <span className="text-base font-black text-sky-300">
              {formatTime(totalSecs)}
            </span>
            <p className="text-[9px] text-slate-500 leading-none">padha aaj</p>
          </div>
        </div>

        {/* More / Less toggle button */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/08 transition active:scale-95"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {expanded ? (
            <>
              <ChevronUp size={13} />
              Less
            </>
          ) : (
            <>
              <ChevronDown size={13} />
              More — activity breakdown dekho
            </>
          )}
        </button>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="mt-2 flex flex-col gap-1.5">
            {sessions.map((sess, idx) => {
              const key = getActivityKey(sess);
              const emoji = ACTIVITY_EMOJI[key] || '📖';
              const label = ACTIVITY_LABEL[key] || key;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-base shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white leading-none truncate">
                      {label}
                    </p>
                    {sess.chapter && (
                      <p className="text-[9px] text-slate-400 leading-none mt-0.5 truncate">
                        {sess.chapter}
                      </p>
                    )}
                  </div>
                  {/* Mini stats */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(sess.sessionScore ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-yellow-400">
                        +{sess.sessionScore}⭐
                      </span>
                    )}
                    {(sess.coinsEarned ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-amber-400">
                        +{sess.coinsEarned}🪙
                      </span>
                    )}
                    {sess.timeSecs > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {formatTime(sess.timeSecs)}
                      </span>
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
