/**
 * HomeToastNotification — Top-bar mein chota sa notification
 * Home pe aane pe XP aur Credits alag-alag rows mein dikhata hai.
 * 3 seconds baad auto-hide ho jaata hai.
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
    }, 3000);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showXp = data.xpAfter > 0 || data.xpEarned > 0;
  const showCr = data.creditsEarned > 0;
  if (!showXp && !showCr) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9995] px-3 pt-1"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.35s cubic-bezier(.34,1.4,.64,1)',
        pointerEvents: 'none',
      }}
    >
      <div
        className="w-full flex flex-col justify-center px-4 py-1.5 rounded-xl shadow-lg gap-0.5"
        style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          border: '1px solid rgba(251,191,36,0.4)',
        }}
      >
        {/* Row 1: XP */}
        {showXp && (
          <div className="flex items-center gap-1 text-[11px] font-black whitespace-nowrap">
            <span className="text-[10px]">⭐</span>
            {data.xpEarned > 0 ? (
              <>
                <span className="text-slate-400">{data.xpBefore.toLocaleString('en-IN')}</span>
                <span className="text-slate-500">+</span>
                <span className="text-yellow-400">{data.xpEarned.toLocaleString('en-IN')}</span>
                <span className="text-slate-500">=</span>
                <span className="text-white">{data.xpAfter.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-white">{data.xpAfter.toLocaleString('en-IN')}</span>
            )}
            <span className="text-slate-400 text-[9px] font-semibold ml-0.5">XP</span>
          </div>
        )}

        {/* Row 2: Credits */}
        {showCr && (
          <div className="flex items-center gap-1 text-[11px] font-black whitespace-nowrap">
            <span className="text-[10px]">🪙</span>
            <span className="text-slate-400">{data.creditsBefore.toLocaleString('en-IN')}</span>
            <span className="text-slate-500">+</span>
            <span className="text-amber-400">{data.creditsEarned.toLocaleString('en-IN')}</span>
            <span className="text-slate-500">=</span>
            <span className="text-white">{data.creditsAfter.toLocaleString('en-IN')}</span>
            <span className="text-slate-400 text-[9px] font-semibold ml-0.5">CR</span>
          </div>
        )}
      </div>
    </div>
  );
};
