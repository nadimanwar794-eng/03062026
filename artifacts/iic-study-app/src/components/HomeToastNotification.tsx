/**
 * HomeToastNotification — Top-bar style, 2 rows
 * Row 1: old credits → +earned CR = new credits
 * Row 2: old XP → +earned XP = new XP
 */

import React, { useEffect, useState } from 'react';

export interface HomeToastData {
  xpBefore: number;
  xpEarned: number;
  xpAfter: number;
  creditsBefore: number;
  creditsEarned: number;
  creditsAfter: number;
}

interface Props {
  data: HomeToastData;
  onDismiss: () => void;
}

export const HomeToastNotification: React.FC<Props> = ({ data, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showT = setTimeout(() => setVisible(true), 40);
    const hideT = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, 3500);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showXp = data.xpEarned > 0;
  const showCr = data.creditsEarned > 0;
  if (!showXp && !showCr) return null;

  const pillStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(10px)',
    borderRadius: 999,
    padding: '5px 12px',
    userSelect: 'none',
    transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 20px))',
    transition: 'transform 0.35s cubic-bezier(.34,1.4,.64,1)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
    whiteSpace: 'nowrap' as const,
  };

  const muted: React.CSSProperties = { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700 };
  const arrow: React.CSSProperties = { color: 'rgba(255,255,255,0.35)', fontSize: 11 };
  const old: React.CSSProperties  = { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums' };
  const cur: React.CSSProperties  = { color: '#ffffff', fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums' };

  return (
    <div
      className="fixed z-[99999] flex flex-col items-end gap-2 pointer-events-none"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)', right: 10 }}
    >
      {/* Row 1 — Credits */}
      {showCr && (
        <div style={pillStyle}>
          <span style={old}>{data.creditsBefore.toLocaleString('en-IN')}🪙</span>
          <span style={arrow}>→</span>
          <span style={{ ...muted, color: '#34d399', fontSize: 13, fontWeight: 900 }}>
            +{data.creditsEarned} CR
          </span>
          <span style={arrow}>=</span>
          <span style={cur}>{data.creditsAfter.toLocaleString('en-IN')}🪙</span>
        </div>
      )}

      {/* Row 2 — XP */}
      {showXp && (
        <div style={{ ...pillStyle, transitionDelay: showCr ? '70ms' : '0ms' }}>
          <span style={old}>{data.xpBefore.toLocaleString('en-IN')} XP</span>
          <span style={arrow}>→</span>
          <span style={{ ...muted, color: '#a78bfa', fontSize: 13, fontWeight: 900 }}>
            +{data.xpEarned} XP
          </span>
          <span style={arrow}>=</span>
          <span style={cur}>{data.xpAfter.toLocaleString('en-IN')} XP</span>
        </div>
      )}
    </div>
  );
};
