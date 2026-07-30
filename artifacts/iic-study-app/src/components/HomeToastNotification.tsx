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

function StatRow({
  prev, delta, deltaLabel, curr, deltaColor,
}: {
  prev: string; delta: string; deltaLabel: string; curr: string; deltaColor: string;
}) {
  return (
    <div className="flex items-center justify-between w-full gap-2">
      {/* Previous value */}
      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {prev}
      </span>
      {/* Arrow */}
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, flexShrink: 0 }}>→</span>
      {/* Delta */}
      <span style={{ color: deltaColor, fontSize: 14, fontWeight: 900, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {delta} <span style={{ fontSize: 11, fontWeight: 700 }}>{deltaLabel}</span>
      </span>
      {/* Equals */}
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, flexShrink: 0 }}>=</span>
      {/* New total */}
      <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 900, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {curr}
      </span>
    </div>
  );
}

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

      {/* Rows */}
      <div className="flex flex-col gap-1.5 px-4 py-2.5">

        {/* Row 1 — Credits */}
        {showCr && (
          <StatRow
            prev={`${data.creditsBefore.toLocaleString('en-IN')}🪙`}
            delta={`+${data.creditsEarned}`}
            deltaLabel="CR"
            curr={`${data.creditsAfter.toLocaleString('en-IN')}🪙`}
            deltaColor="#34d399"
          />
        )}

        {/* Divider between rows */}
        {showCr && showXp && (
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />
        )}

        {/* Row 2 — XP */}
        {showXp && (
          <StatRow
            prev={`${data.xpBefore.toLocaleString('en-IN')} XP`}
            delta={`+${data.xpEarned}`}
            deltaLabel="XP"
            curr={`${data.xpAfter.toLocaleString('en-IN')} XP`}
            deltaColor="#a78bfa"
          />
        )}

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
