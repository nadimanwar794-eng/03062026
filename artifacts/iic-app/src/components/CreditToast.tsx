import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onCreditNotify, CreditNotifyPayload } from '../utils/creditNotify';

/**
 * CreditToast — thin top-banner for coin earn/deduct events.
 *
 * Rules (per user request):
 *  • Only ONE banner visible at a time — new event replaces the old one instantly.
 *  • EARN  → green banner  (🪙 +X Coins mile — reading/writing/mcq)
 *  • DEDUCTION → amber/brown banner (🪙 -X Credits kate)
 *  • FREE_LIMIT → indigo banner (warning)
 *  • Auto-hides: DEDUCTION 4s, EARN 3.5s, FREE_LIMIT 3.5s
 */
export const CreditToast: React.FC = () => {
  const [toast, setToast] = useState<CreditNotifyPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const unsub = onCreditNotify((payload) => {
      // Replace any existing toast immediately
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(payload);

      const delay =
        payload.type === 'DEDUCTION' ? 4000 :
        payload.type === 'EARN'      ? 3500 :
        3500;

      timerRef.current = setTimeout(() => setToast(null), delay);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss]);

  if (!toast) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto cursor-pointer animate-in slide-in-from-top-2 fade-in duration-300"
      onClick={dismiss}
    >
      {toast.type === 'EARN' && (
        <div
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2"
          style={{
            background: 'linear-gradient(90deg, #064e3b, #059669, #064e3b)',
            color: '#d1fae5',
          }}
        >
          <span className="text-sm shrink-0">🪙</span>
          <p className="text-xs font-black leading-tight">
            +{toast.amount} Coins Mile!
            {toast.source && (
              <span className="font-normal opacity-80">
                {' '}· {toast.source === 'reading' ? 'Reading se' : toast.source === 'writing' ? 'Writing se' : 'MCQ se'}
              </span>
            )}
            {toast.pts !== undefined && toast.pts > 0 && (
              <span className="font-bold opacity-90" style={{ color: '#86efac' }}> · ⭐ +{toast.pts} pts</span>
            )}
            {toast.remaining !== undefined && (
              <span className="font-normal opacity-80"> · Balance: {toast.remaining} coins</span>
            )}
          </p>
        </div>
      )}

      {toast.type === 'DEDUCTION' && (
        <div
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2"
          style={{
            background: 'linear-gradient(90deg, #92400e, #b45309, #92400e)',
            color: '#fef3c7',
          }}
        >
          <span className="text-sm shrink-0">🪙</span>
          <p className="text-xs font-black leading-tight">
            -{toast.amount} Credits Kate
            {toast.remaining !== undefined && (
              <span className="font-normal opacity-80"> · Balance: {toast.remaining} CR</span>
            )}
          </p>
        </div>
      )}

      {toast.type === 'FREE_LIMIT' && (
        <div
          className="w-full flex items-center justify-center gap-2 px-4 py-2"
          style={{
            background: 'linear-gradient(90deg, #3730a3, #4338ca, #3730a3)',
            color: '#e0e7ff',
          }}
        >
          <span className="text-sm shrink-0">⚠️</span>
          <p className="text-xs font-bold leading-tight">
            {toast.message || 'Free limit khatam'}
          </p>
        </div>
      )}
    </div>
  );
};
