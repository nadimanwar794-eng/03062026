/**
 * HomeToastNotification — Top-bar mein chota sa notification
 * Home pe aane pe XP + Credits dono ek notification mein dikhata hai.
 * 3 seconds baad auto-hide ho jaata hai.
 * Format: ⭐ 1000 + 300 = 1300 XP  |  🪙 1200 + 75 = 1275 CR
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
    // Slide in
    const showT = setTimeout(() => setVisible(true), 40);
    // Auto-hide after 3s
    const hideT = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, 3000);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showXp = data.xpEarned > 0;
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
        className="w-full flex items-center justify-center gap-3 px-4 rounded-xl shadow-lg"
        style={{
          height: '44px',
          background: 'linear-gradient(90deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          border: '1px solid rgba(251,191,36,0.4)',
        }}
      >
        {/* XP pill */}
        {showXp && (
          <div className="flex items-center gap-1 text-[12px] font-black whitespace-nowrap">
            <span>⭐</span>
            <span className="text-slate-400">{data.xpBefore.toLocaleString()}</span>
            <span className="text-slate-500">+</span>
            <span className="text-yellow-400">{data.xpEarned.toLocaleString()}</span>
            <span className="text-slate-500">=</span>
            <span className="text-white">{data.xpAfter.toLocaleString()}</span>
            <span className="text-slate-400 text-[10px] font-semibold ml-0.5">XP</span>
          </div>
        )}

        {/* Divider */}
        {showXp && showCr && (
          <div className="h-4 w-px bg-slate-600 shrink-0" />
        )}

        {/* Credits pill */}
        {showCr && (
          <div className="flex items-center gap-1 text-[12px] font-black whitespace-nowrap">
            <span>🪙</span>
            <span className="text-slate-400">{data.creditsBefore.toLocaleString()}</span>
            <span className="text-slate-500">+</span>
            <span className="text-amber-400">{data.creditsEarned.toLocaleString()}</span>
            <span className="text-slate-500">=</span>
            <span className="text-white">{data.creditsAfter.toLocaleString()}</span>
            <span className="text-slate-400 text-[10px] font-semibold ml-0.5">CR</span>
          </div>
        )}
      </div>
    </div>
  );
};
