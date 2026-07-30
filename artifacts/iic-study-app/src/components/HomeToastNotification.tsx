/**
 * HomeToastNotification — CreditToast style, 2 lines
 * XP aur Credits earn hone pe top-right corner mein dono alag-alag lines mein dikhata hai.
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

  const showXp = data.xpEarned > 0;
  const showCr = data.creditsEarned > 0;
  if (!showXp && !showCr) return null;

  const baseStyle: React.CSSProperties = {
    fontWeight: 900,
    fontSize: 15,
    letterSpacing: '-0.01em',
    textShadow: '0 1px 4px rgba(0,0,0,0.45)',
    userSelect: 'none',
    transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 16px))',
    transition: 'transform 0.3s cubic-bezier(.34,1.4,.64,1)',
  };

  return (
    <div
      className="fixed z-[99999] flex flex-col items-end gap-1.5 pointer-events-none"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', right: 12 }}
    >
      {showXp && (
        <div style={{ ...baseStyle, color: '#facc15' }}>
          +{data.xpEarned.toLocaleString('en-IN')} ⭐ XP
        </div>
      )}
      {showCr && (
        <div style={{ ...baseStyle, color: '#10b981', transitionDelay: showXp ? '60ms' : '0ms' }}>
          +{data.creditsEarned.toLocaleString('en-IN')} 🪙 CR
        </div>
      )}
    </div>
  );
};
