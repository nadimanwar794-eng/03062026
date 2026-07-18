/**
 * ReadingScoreHUD — Smart minimal HUD for reading/writing sessions.
 *
 * Default:  Hidden — only a small floating icon (📖 / ✍️) at bottom-right.
 * Tap icon: Shows info popup for 3 s, then auto-hides.
 * Reward:   Auto-shows green reward popup for 2 s.
 * Warning:  Auto-shows warning popup for 3 s.
 * All popups slide up from the icon and fade out automatically.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ReadingScoreState, WarningLevel } from '../utils/readingScoreEngine';

interface Props {
  state: ReadingScoreState;
  visible: boolean;
  levelColor?: string;
  levelLabel?: string;
  hideFloatingButton?: boolean;
}

type PopupKind = 'none' | 'info' | 'reward' | 'warning' | 'touch';

const fmt2 = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export const ReadingScoreHUD: React.FC<Props> = ({
  state,
  visible,
  levelColor = '#6366f1',
  levelLabel,
  hideFloatingButton = false,
}) => {
  const [popup, setPopup]         = useState<PopupKind>('none');
  const [rewardPts, setRewardPts] = useState(0);
  const [mounted, setMounted]     = useState(false);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevScore    = useRef(0);
  const prevWarning  = useRef<WarningLevel>(0);

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const showFor = useCallback((kind: PopupKind, ms: number) => {
    clearTimer();
    setMounted(true);
    setPopup(kind);
    timerRef.current = setTimeout(() => {
      setPopup('none');
    }, ms);
  }, []);

  /* Reward: no popup — score is shown live in the top bar instead */
  useEffect(() => {
    prevScore.current = state.totalSessionScore;
  }, [state.totalSessionScore]);

  /* Warning auto-popup (3 s) */
  useEffect(() => {
    if (state.warningLevel > 0 && state.warningLevel !== prevWarning.current) {
      prevWarning.current = state.warningLevel;
      showFor('warning', 3000);
    }
    if (state.warningLevel === 0) prevWarning.current = 0;
  }, [state.warningLevel, showFor]);

  /* Touch protection indicator — stays visible while countdown is active */
  const prevTouchProtection = useRef(false);
  useEffect(() => {
    if (state.touchProtectionActive && !prevTouchProtection.current) {
      // Became active → switch to touch popup and keep it open
      clearTimer();
      setMounted(true);
      setPopup('touch');
    }
    if (!state.touchProtectionActive && prevTouchProtection.current) {
      // Countdown ended → hide touch popup
      setPopup(p => (p === 'touch' ? 'none' : p));
    }
    prevTouchProtection.current = state.touchProtectionActive;
  }, [state.touchProtectionActive]);

  /* Cleanup on unmount */
  useEffect(() => { return () => clearTimer(); }, []);

  if (!visible || state.isWindowClosed) return null;

  const isReading  = state.mode === 'reading';
  const isVideo    = state.mode === 'video';
  const isAudio    = state.mode === 'audio';
  const isPdf      = state.mode === 'pdf';
  const isQa       = state.mode === 'qa';
  const modeIcon   = isVideo ? '🎬' : isAudio ? '🎧' : isPdf ? '📄' : isQa ? '💬' : isReading ? '📖' : '✍️';
  // Only Video still earns credits (60s ticker); all others earn pts now
  const isCreditMode = isVideo;
  const rewardLabel = isVideo ? '+1 pts / 6s · +10cr / 1min'
                    : isPdf   ? '+5 pts / 30s (≥5% scroll/1min)'
                    : isQa    ? '+5 pts / 30s (≥5% scroll/30s)'
                    : state.mode === 'writing' ? '+10 pts / 1min (≥5% scroll/1min)'
                    : isAudio ? '+5 pts / 30s'
                    : '+5 pts / 30s';
  const intervalLabel = isVideo ? '1min' : '30s';
  const remaining  = Math.max(0, state.maxWindowSec - state.sessionElapsedSec);
  const remMin     = Math.floor(remaining / 60);
  const remSec     = fmt2(remaining % 60);
  const progress   = Math.min(100, Math.round(state.progressPercent));

  const handleIconTap = () => {
    if (popup === 'info') { clearTimer(); setPopup('none'); }
    else showFor('info', 3000);
  };

  /* shared popup wrapper style */
  const popupBase: React.CSSProperties = {
    position:        'absolute',
    bottom:          '100%',
    right:           0,
    marginBottom:    10,
    borderRadius:    16,
    backdropFilter:  'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow:       '0 8px 32px rgba(0,0,0,0.5)',
    animation:       'rshud-slide 0.18s ease',
  };

  return (
    <>
      <style>{`
        @keyframes rshud-slide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div
        style={{
          position:       'fixed',
          bottom:         80,
          right:          16,
          zIndex:         55,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'flex-end',
          pointerEvents:  'none',
        }}
      >
        {/* ── INFO POPUP ── */}
        {popup === 'info' && (
          <div
            style={{
              ...popupBase,
              background:  'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
              border:      `1.5px solid ${levelColor}55`,
              padding:     '12px 14px',
              minWidth:    200,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 15 }}>{modeIcon}</span>
              <span style={{ color: '#475569', fontSize: 10, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Score Session
              </span>
              {state.isPaused && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>
                  PAUSED
                </span>
              )}
            </div>

            {/* Score + Progress row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Score</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: levelColor, lineHeight: 1.3 }}>+{state.totalSessionScore}</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Progress</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#16a34a', lineHeight: 1.3 }}>{progress}%</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: 3, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: levelColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>

            {/* Next reward + time left */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, alignItems: 'center' }}>
              {state.isPermanentlyStopped ? (
                <span style={{ color: '#ef4444', fontWeight: 700 }}>⛔ Scroll karo resume ke liye</span>
              ) : !state.isPaused ? (
                <span style={{ color: '#f59e0b', fontWeight: 900 }}>
                  Next: +pts in {state.nextRewardInSec}s
                </span>
              ) : (
                <span style={{ color: '#ef4444', fontWeight: 700 }}>Score paused</span>
              )}
              <span style={{ color: '#94a3b8', fontSize: 9 }}>{remMin}:{remSec} left</span>
            </div>

            {/* Credits earned this session */}
            {isCreditMode && state.totalCreditsEarned > 0 && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                <span style={{ color: '#64748b' }}>Credits earned</span>
                <span style={{ color: '#16a34a', fontWeight: 900 }}>+{state.totalCreditsEarned} CR</span>
              </div>
            )}

            {/* Level badge */}
            {levelLabel && (
              <div style={{ marginTop: 8, paddingTop: 7, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: levelColor, fontSize: 9, fontWeight: 800 }}>{levelLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* ── TOUCH PROTECTION POPUP ── hidden when floating button is hidden (top bar handles it) */}
        {popup === 'touch' && !hideFloatingButton && (
          <div
            style={{
              ...popupBase,
              background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
              border: '1.5px solid rgba(99,102,241,0.35)',
              padding: '12px 14px',
              minWidth: 200,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🛡️</span>
              <span style={{ color: '#4338ca', fontSize: 11, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Touch Protection
              </span>
            </div>
            <div style={{ color: '#475569', fontSize: 10, marginBottom: 8, lineHeight: 1.5 }}>
              Ek topic par <span style={{ color: '#1e293b', fontWeight: 700 }}>10 sec</span> ruko<br />
              aur <span style={{ color: '#16a34a', fontWeight: 700 }}>+2 reward</span> pao
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  flex: 1,
                  height: 4,
                  background: '#e2e8f0',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.round(((10 - state.touchProtectionCooldownSec) / 10) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                    borderRadius: 99,
                    transition: 'width 0.9s linear',
                  }}
                />
              </div>
              <span style={{ color: '#6366f1', fontWeight: 900, fontSize: 12, minWidth: 24, textAlign: 'right' }}>
                {fmt2(state.touchProtectionCooldownSec)}s
              </span>
            </div>
          </div>
        )}

        {/* ── WARNING POPUP ── */}
        {popup === 'warning' && (
          <div
            style={{
              ...popupBase,
              background:  state.isPermanentlyStopped ? 'linear-gradient(135deg,#fff1f2,#ffe4e6)' : state.isPaused ? 'linear-gradient(135deg,#fff1f2,#ffe4e6)' : 'linear-gradient(135deg,#fff7ed,#ffedd5)',
              border:      `1.5px solid ${state.isPermanentlyStopped ? '#fca5a5' : state.isPaused ? '#fca5a5' : '#fdba74'}`,
              padding:     '10px 13px',
              minWidth:    182,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 16, lineHeight: 1.3 }}>
                {state.isPermanentlyStopped ? '🛑' : state.isPaused ? '⏸️' : '⚠️'}
              </span>
              <div>
                <div style={{ color: '#7f1d1d', fontSize: 11, fontWeight: 900 }}>
                  {state.isPermanentlyStopped
                    ? 'Credits Ruk Gaye'
                    : state.isPaused
                    ? 'Score Paused'
                    : 'Scroll Kam Hai'}
                </div>
                <div style={{ color: '#92400e', fontSize: 9, marginTop: 3 }}>
                  {state.isPermanentlyStopped
                    ? 'Scroll karo — credits resume ho jayenge'
                    : state.isPaused
                    ? 'Padhna jaari rakho, resume ho jayega'
                    : isCreditMode
                    ? `Thoda aur scroll karo (${state.scrollFailStreak}/2 fail)`
                    : '10% reading progress chahiye'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FLOATING ICON BUTTON — hidden when moved to top bar ── */}
        {!hideFloatingButton && <button
          onClick={handleIconTap}
          aria-label="Reading score"
          style={{
            pointerEvents:   'auto',
            width:           40,
            height:          40,
            borderRadius:    '50%',
            border:          `1.5px solid ${levelColor}55`,
            background:      popup === 'info'
              ? levelColor
              : 'rgba(10,10,20,0.82)',
            backdropFilter:  'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        18,
            cursor:          'pointer',
            boxShadow:       popup === 'info'
              ? `0 0 12px ${levelColor}66`
              : '0 2px 12px rgba(0,0,0,0.4)',
            transition:      'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {modeIcon}
        </button>}
      </div>
    </>
  );
};
