/**
 * HomeToastNotification — Full-width top-bar overlay style
 * Theme ke saath color change hota hai (--nst-top-bar-grad CSS variable)
 * Row 1: old credits → +earned CR = new credits
 * Row 2: old XP     → +earned XP = new XP
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

const DISPLAY_MS = 3500;

export const HomeToastNotification: React.FC<Props> = ({ data, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showT = setTimeout(() => setVisible(true), 40);
    const hideT = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, DISPLAY_MS);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showXp = data.xpEarned > 0;
  const showCr = data.creditsEarned > 0;
  if (!showXp && !showCr) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[99999] pointer-events-none"
      style={{
        top: 0,
        background: 'var(--nst-top-bar-grad)',
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.35s cubic-bezier(.34,1.4,.64,1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
      }}
    >
      {/* Safe area spacer */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Content */}
      <div className="flex items-center justify-between px-3 py-2 gap-3">

        {/* LEFT: coin icon */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
        >
          <span style={{ fontSize: 16 }}>🪙</span>
        </div>

        {/* RIGHT: two rows */}
        <div className="flex flex-col items-end gap-1 flex-1">

          {/* Row 1 — Credits */}
          {showCr && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-[3px] self-end"
              style={{ background: 'rgba(0,0,0,0.28)' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {data.creditsBefore.toLocaleString('en-IN')}🪙
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>→</span>
              <span style={{ color: '#34d399', fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                +{data.creditsEarned} CR
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>=</span>
              <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                {data.creditsAfter.toLocaleString('en-IN')}🪙
              </span>
            </div>
          )}

          {/* Row 2 — XP */}
          {showXp && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-[3px] self-end"
              style={{ background: 'rgba(0,0,0,0.20)' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {data.xpBefore.toLocaleString('en-IN')} XP
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>→</span>
              <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                +{data.xpEarned} XP
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>=</span>
              <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                {data.xpAfter.toLocaleString('en-IN')} XP
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="h-[2px] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div
          className="h-full absolute left-0 top-0"
          style={{
            background: 'rgba(255,255,255,0.7)',
            animation: `credit-toast-bar ${DISPLAY_MS}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};
