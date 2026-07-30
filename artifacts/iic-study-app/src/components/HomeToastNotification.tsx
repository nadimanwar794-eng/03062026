/**
 * HomeToastNotification — Full-width top-bar overlay, single row
 * Left: credit change  |  Right: XP change
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Safe area */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Single row */}
      <div className="flex items-center px-3 py-1.5">

        {/* LEFT — Credits */}
        {showCr && (
          <div className="flex items-center gap-[5px] flex-1 justify-center">
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {data.creditsBefore.toLocaleString('en-IN')}🪙
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>→</span>
            <span style={{ color: '#34d399', fontSize: 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              +{data.creditsEarned} CR
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>=</span>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {data.creditsAfter.toLocaleString('en-IN')}🪙
            </span>
          </div>
        )}

        {/* Divider */}
        {showCr && showXp && (
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.18)', flexShrink: 0, margin: '0 4px' }} />
        )}

        {/* RIGHT — XP */}
        {showXp && (
          <div className="flex items-center gap-[5px] flex-1 justify-center">
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {data.xpBefore.toLocaleString('en-IN')} XP
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>→</span>
            <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              +{data.xpEarned} XP
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>=</span>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {data.xpAfter.toLocaleString('en-IN')} XP
            </span>
          </div>
        )}

      </div>

      {/* Progress bar */}
      <div className="h-[2px] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div
          className="h-full absolute left-0 top-0"
          style={{
            background: 'rgba(255,255,255,0.65)',
            animation: `credit-toast-bar ${DISPLAY_MS}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};
