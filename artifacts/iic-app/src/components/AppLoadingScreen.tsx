import React, { useState, useEffect, useRef } from 'react';
import { APP_VERSION } from '../constants';
import { getSplashFontById, ensureGoogleFontLoaded } from '../utils/splashFonts';

interface AppLoadingScreenProps {
  onComplete: () => void;
  isPremium?: boolean;
  subscriptionLevel?: 'FREE' | 'BASIC' | 'ULTRA';
}

type ThemeVariant = 'black' | 'blue' | 'light';

function detectTheme(): ThemeVariant {
  try {
    const isDark = localStorage.getItem('nst_dark_mode') === 'true';
    if (!isDark) return 'light';
    const type = localStorage.getItem('nst_dark_theme_type') || 'black';
    return type === 'blue' ? 'blue' : 'black';
  } catch {
    return 'black';
  }
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  onComplete,
  subscriptionLevel = 'FREE',
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'hidden' | 'burst' | 'reveal'>('hidden');
  const [themeVariant] = useState<ThemeVariant>(detectTheme);

  const [appName] = useState(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const obj = s ? JSON.parse(s) : null;
      return obj?.appShortName || obj?.appName || 'IIC';
    } catch { return 'IIC'; }
  });

  const [developerName] = useState<string>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const obj = s ? JSON.parse(s) : null;
      const n = (obj?.developerName ?? '').toString().trim();
      return n || 'Nafim Anwar';
    } catch { return 'Nafim Anwar'; }
  });

  const [appTagline] = useState<string>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const obj = s ? JSON.parse(s) : null;
      return (obj?.appTagline ?? '').toString().trim();
    } catch { return ''; }
  });

  const [appNameSize] = useState<number>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const obj = s ? JSON.parse(s) : null;
      const raw = Number(obj?.appShortNameSize);
      if (Number.isFinite(raw) && raw > 0) return Math.min(120, Math.max(24, raw));
      return 52;
    } catch { return 52; }
  });

  const [splashFontId] = useState<string>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const obj = s ? JSON.parse(s) : null;
      const adminChoice = obj?.splashFontId;
      if (adminChoice) return adminChoice as string;
      return localStorage.getItem('nst_splash_font_id') || 'default';
    } catch { return 'default'; }
  });

  const [splashLogo] = useState<{ enabled: boolean; url: string; size: number }>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const obj = s ? JSON.parse(s) : null;
      const enabled = obj?.splashLogoEnabled !== false;
      const url = (obj?.splashLogoUrl as string) || '/splash-logo.png';
      const rawSize = Number(obj?.splashLogoSize);
      const size = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(260, Math.max(60, rawSize)) : 150;
      return { enabled, url, size };
    } catch { return { enabled: true, url: '/splash-logo.png', size: 150 }; }
  });

  const activeFont = getSplashFontById(splashFontId);

  useEffect(() => {
    if (activeFont.gfontParam) ensureGoogleFontLoaded(activeFont.gfontParam);
  }, [activeFont.gfontParam]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('burst'), 100);
    const t2 = setTimeout(() => setPhase('reveal'), 480);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const duration = 2400;
    const intervalTime = 40;
    const steps = duration / intervalTime;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const p = Math.min(Math.floor((currentStep / steps) * 100), 100);
      setProgress(p);
      if (currentStep >= steps) {
        clearInterval(timer);
        try {
          const utterance = new SpeechSynthesisUtterance('Welcome to ' + appName);
          utterance.lang = 'en-US'; utterance.rate = 1; utterance.pitch = 1;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } catch {}
        setTimeout(() => onCompleteRef.current(), 300);
      }
    }, intervalTime);
    return () => clearInterval(timer);
  }, []);

  const isDark = themeVariant !== 'light';

  const bg = themeVariant === 'blue' ? '#040c1a' : themeVariant === 'black' ? '#050507' : '#eef2ff';

  const particles = Array.from({ length: 32 }, (_, i) => ({
    angle: (i / 32) * 360,
    dist: 90 + (i % 5) * 22,
    size: 2.5 + (i % 4) * 1.5,
    delay: i * 0.035,
    dur: 1.1 + (i % 5) * 0.22,
    color: ['#fbbf24', '#f59e0b', '#a5f3fc', '#c4b5fd', '#f9a8d4', '#86efac', '#fb923c'][i % 7],
    opacity: 0.5 + (i % 3) * 0.18,
  }));

  const orbits = [
    { angle: 0,   dist: 100, color: '#fbbf24', shadow: 'rgba(251,191,36,0.9)',  dur: 3.0 },
    { angle: 120, dist: 96,  color: '#c4b5fd', shadow: 'rgba(196,181,253,0.9)', dur: 4.2 },
    { angle: 240, dist: 104, color: '#a5f3fc', shadow: 'rgba(165,243,252,0.9)', dur: 5.5 },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: bg, overflow: 'hidden', touchAction: 'none',
    }}>
      <style>{`
        @keyframes sl-logo {
          0%   { transform: scale(0.25) rotate(-8deg); opacity: 0; filter: blur(20px) brightness(0.2); }
          55%  { transform: scale(1.16) rotate(2deg);  opacity: 1; filter: blur(0) brightness(1.5); }
          78%  { transform: scale(0.96) rotate(0deg);  opacity: 1; filter: blur(0) brightness(1); }
          100% { transform: scale(1)    rotate(0deg);  opacity: 1; filter: blur(0) brightness(1); }
        }
        @keyframes sl-halo1 {
          0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 1; }
          70%  { opacity: 0.4; }
          100% { transform: translate(-50%,-50%) scale(4.5); opacity: 0; }
        }
        @keyframes sl-halo2 {
          0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(3.5); opacity: 0; }
        }
        @keyframes sl-halo3 {
          0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
        }
        @keyframes sl-particle {
          0%   { transform: rotate(var(--pa)) translateX(22px) scale(0); opacity: 0; }
          18%  { opacity: var(--po); }
          100% { transform: rotate(var(--pa)) translateX(var(--pd)) scale(1.2); opacity: 0; }
        }
        @keyframes sl-orbit {
          from { transform: rotate(var(--oa)) translateX(var(--od)) rotate(calc(-1 * var(--oa))); }
          to   { transform: rotate(calc(var(--oa) + 360deg)) translateX(var(--od)) rotate(calc(-1 * (var(--oa) + 360deg))); }
        }
        @keyframes sl-ring-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes sl-ring-spin-r {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes sl-pulse {
          0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.14; }
          50%      { transform: translate(-50%,-50%) scale(1.07); opacity: 0.30; }
        }
        @keyframes sl-pulse2 {
          0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.08; }
          50%      { transform: translate(-50%,-50%) scale(1.10); opacity: 0.20; }
        }
        @keyframes sl-name-in {
          0%   { transform: translateY(28px) scale(0.94); opacity: 0; filter: blur(6px); }
          100% { transform: translateY(0)    scale(1);    opacity: 1; filter: blur(0); }
        }
        @keyframes sl-dev-in {
          0%   { transform: translateY(18px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes sl-shimmer {
          0%   { background-position: 250% center; }
          100% { background-position: -250% center; }
        }
        @keyframes sl-glow {
          0%,100% { filter: drop-shadow(0 0 20px rgba(251,191,36,0.5)) drop-shadow(0 0 8px rgba(245,158,11,0.4)); }
          50%      { filter: drop-shadow(0 0 44px rgba(251,191,36,0.95)) drop-shadow(0 0 80px rgba(245,158,11,0.5)) drop-shadow(0 0 20px rgba(165,243,252,0.3)); }
        }
        @keyframes sl-bg-breath {
          0%,100% { opacity: 0.20; transform: scale(1); }
          50%      { opacity: 0.40; transform: scale(1.12); }
        }
        @keyframes sl-progress-glow {
          0%,100% { box-shadow: 0 0 8px rgba(251,191,36,0.5); }
          50%      { box-shadow: 0 0 22px rgba(251,191,36,0.95), 0 0 40px rgba(245,158,11,0.4); }
        }
        @keyframes sl-corner-in {
          0%   { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes sl-scan {
          0%   { transform: translateY(-100%); opacity: 0.06; }
          100% { transform: translateY(200%);  opacity: 0.06; }
        }
        @keyframes sl-tagline {
          0%   { opacity: 0; letter-spacing: 0.5em; }
          100% { opacity: 1; letter-spacing: 0.22em; }
        }
        @keyframes sl-percent {
          0%   { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ── Ambient radial glow ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isDark
          ? 'radial-gradient(ellipse 65% 55% at 50% 40%, rgba(245,158,11,0.18) 0%, rgba(99,102,241,0.10) 45%, transparent 75%)'
          : 'radial-gradient(ellipse 65% 55% at 50% 40%, rgba(245,158,11,0.12) 0%, rgba(99,102,241,0.08) 45%, transparent 75%)',
        animation: 'sl-bg-breath 5s ease-in-out infinite',
      }} />

      {/* ── Scanline beam ── */}
      {isDark && (
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '40%',
          background: 'linear-gradient(to bottom, transparent, rgba(251,191,36,0.04), transparent)',
          animation: 'sl-scan 4s linear infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── HUD corner decorations ── */}
      {phase !== 'hidden' && (() => {
        const corners = [
          { top: 20, left: 20, rot: 0 },
          { top: 20, right: 20, rot: 90 },
          { bottom: 20, right: 20, rot: 180 },
          { bottom: 20, left: 20, rot: 270 },
        ];
        const clr = isDark ? 'rgba(251,191,36,0.35)' : 'rgba(99,102,241,0.30)';
        return corners.map((c, i) => (
          <svg key={i} width="28" height="28" style={{
            position: 'absolute', ...c,
            transform: `rotate(${c.rot}deg)`,
            animation: `sl-corner-in 0.6s ease ${0.3 + i * 0.08}s both`,
            pointerEvents: 'none',
          }}>
            <path d="M2 26 L2 2 L26 2" fill="none" stroke={clr} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        ));
      })()}

      {/* ── Halo burst rings ── */}
      {phase !== 'hidden' && (<>
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${splashLogo.size * 0.9}px`, height: `${splashLogo.size * 0.9}px`,
          borderRadius: '50%', border: `2.5px solid ${isDark ? 'rgba(251,191,36,0.8)' : 'rgba(245,158,11,0.65)'}`,
          animation: 'sl-halo1 1.1s ease-out forwards', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${splashLogo.size * 0.9}px`, height: `${splashLogo.size * 0.9}px`,
          borderRadius: '50%', border: `1.5px solid ${isDark ? 'rgba(165,243,252,0.55)' : 'rgba(99,102,241,0.45)'}`,
          animation: 'sl-halo2 1.35s ease-out 0.1s forwards', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${splashLogo.size * 0.9}px`, height: `${splashLogo.size * 0.9}px`,
          borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(196,181,253,0.4)' : 'rgba(129,140,248,0.35)'}`,
          animation: 'sl-halo3 1.6s ease-out 0.22s forwards', pointerEvents: 'none',
        }} />
      </>)}

      {/* ── Spinning conic rings (after reveal) ── */}
      {phase === 'reveal' && (<>
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${splashLogo.size + 44}px`, height: `${splashLogo.size + 44}px`,
          borderRadius: '50%',
          background: isDark
            ? 'conic-gradient(from 0deg, transparent, rgba(251,191,36,0.7), transparent, rgba(245,158,11,0.4), transparent)'
            : 'conic-gradient(from 0deg, transparent, rgba(245,158,11,0.5), transparent)',
          animation: 'sl-ring-spin 3.5s linear infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${splashLogo.size + 72}px`, height: `${splashLogo.size + 72}px`,
          borderRadius: '50%',
          background: isDark
            ? 'conic-gradient(from 180deg, transparent, rgba(165,243,252,0.4), transparent, rgba(196,181,253,0.3), transparent)'
            : 'conic-gradient(from 180deg, transparent, rgba(99,102,241,0.3), transparent)',
          animation: 'sl-ring-spin-r 5.5s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Pulsing rings */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${splashLogo.size + 100}px`, height: `${splashLogo.size + 100}px`,
          borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(251,191,36,0.18)' : 'rgba(245,158,11,0.2)'}`,
          animation: 'sl-pulse 3.2s ease-in-out infinite 0.6s', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${splashLogo.size + 148}px`, height: `${splashLogo.size + 148}px`,
          borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(165,243,252,0.10)' : 'rgba(99,102,241,0.12)'}`,
          animation: 'sl-pulse2 4.5s ease-in-out infinite 1s', pointerEvents: 'none',
        }} />
      </>)}

      {/* ── Particle burst ── */}
      {phase !== 'hidden' && particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: '40%', left: '50%',
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%',
          background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `sl-particle ${p.dur}s ease-out ${p.delay}s both`,
          ['--pa' as any]: `${p.angle}deg`,
          ['--pd' as any]: `${p.dist}px`,
          ['--po' as any]: p.opacity,
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Orbiting dots ── */}
      {phase === 'reveal' && orbits.map((dot, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 'calc(40% - 5px)', left: 'calc(50% - 5px)',
          width: '10px', height: '10px', borderRadius: '50%',
          background: dot.color, boxShadow: `0 0 12px 4px ${dot.shadow}`,
          animation: `sl-orbit ${dot.dur}s linear infinite`,
          ['--oa' as any]: `${dot.angle}deg`,
          ['--od' as any]: `${dot.dist}px`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── LOGO + developer name block ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '28px',
      }}>
        {/* Logo */}
        <div style={{
          animation: phase !== 'hidden' ? 'sl-logo 0.90s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
          opacity: phase === 'hidden' ? 0 : undefined,
        }}>
          <div style={{
            animation: phase === 'reveal' ? 'sl-glow 3.5s ease-in-out infinite 0.6s' : 'none',
            filter: `drop-shadow(0 0 22px rgba(251,191,36,0.6))`,
          }}>
            {splashLogo.enabled && splashLogo.url ? (
              <img
                src={splashLogo.url}
                alt={appName}
                draggable={false}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (!img.src.includes('/splash-logo.png')) img.src = '/splash-logo.png';
                }}
                style={{
                  width: `${splashLogo.size}px`,
                  height: `${splashLogo.size}px`,
                  maxWidth: '70vw',
                  objectFit: 'contain',
                  borderRadius: '28px',
                  display: 'block',
                }}
              />
            ) : (
              <h1 style={{
                fontSize: `${appNameSize}px`,
                fontWeight: 900, margin: 0, padding: 0,
                background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#fde68a,#fbbf24)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'sl-shimmer 3s linear infinite',
                ...(activeFont.family ? { fontFamily: activeFont.family } : {}),
                ...(activeFont.letterSpacing ? { letterSpacing: activeFont.letterSpacing } : {}),
              }}>
                {appName}
              </h1>
            )}
          </div>
        </div>

        {/* ── Developer name — below logo, prominent ── */}
        {phase === 'reveal' && (
          <div style={{
            marginTop: '14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            animation: 'sl-dev-in 0.7s cubic-bezier(0.34,1.28,0.64,1) 0.4s both',
          }}>
            <p style={{
              margin: 0,
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.35)',
            }}>
              Developed by
            </p>
            <p style={{
              margin: 0,
              fontSize: '15px', fontWeight: 800, letterSpacing: '0.06em',
              background: isDark
                ? 'linear-gradient(90deg,#fbbf24,#fde68a,#f59e0b,#fbbf24)'
                : 'linear-gradient(90deg,#d97706,#f59e0b,#d97706)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'sl-shimmer 3.5s linear infinite 0.5s',
              textShadow: 'none',
            }}>
              {developerName}
            </p>
          </div>
        )}
      </div>

      {/* ── App name + optional tagline ── */}
      {phase === 'reveal' && (
        <div style={{
          textAlign: 'center', zIndex: 10, position: 'relative',
          animation: 'sl-name-in 0.7s cubic-bezier(0.34,1.28,0.64,1) 0.25s both',
          marginTop: '-8px',
        }}>
          <p style={{
            fontSize: `${Math.min(appNameSize, 26)}px`,
            fontWeight: 900, letterSpacing: '0.05em', margin: '0 0 6px',
            background: isDark
              ? 'linear-gradient(90deg,#e2e8f0,#c4b5fd,#a5f3fc,#fbbf24,#e2e8f0)'
              : 'linear-gradient(90deg,#1e293b,#6366f1,#818cf8,#1e293b)',
            backgroundSize: '250% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'sl-shimmer 4s linear infinite 0.3s',
            ...(activeFont.family ? { fontFamily: activeFont.family } : {}),
            ...(activeFont.letterSpacing ? { letterSpacing: activeFont.letterSpacing } : {}),
          }}>
            {appName}
          </p>

          {/* Tagline — only if set in admin settings */}
          {appTagline ? (
            <p style={{
              fontSize: '10px', fontWeight: 700, margin: 0,
              color: isDark ? 'rgba(165,243,252,0.55)' : 'rgba(99,102,241,0.65)',
              animation: 'sl-tagline 0.9s ease 0.6s both',
              textTransform: 'uppercase', letterSpacing: '0.22em',
            }}>
              {appTagline}
            </p>
          ) : null}
        </div>
      )}

      {/* ── Bottom: progress + version ── */}
      <div style={{
        position: 'absolute', bottom: '36px', left: 0, right: 0,
        padding: '0 32px', zIndex: 10,
      }}>
        {/* Percent */}
        {phase === 'reveal' && (
          <div style={{
            textAlign: 'center', marginBottom: '8px',
            animation: 'sl-percent 0.4s ease both',
          }}>
            <span style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'monospace',
              color: isDark ? 'rgba(251,191,36,0.75)' : 'rgba(245,158,11,0.80)',
            }}>
              {progress}%
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '3px',
          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
          borderRadius: '999px', overflow: 'hidden', marginBottom: '10px',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: isDark
              ? 'linear-gradient(90deg,#f59e0b,#fbbf24,#fde68a,#a78bfa)'
              : 'linear-gradient(90deg,#d97706,#f59e0b,#6366f1)',
            borderRadius: '999px',
            transition: 'width 60ms linear',
            animation: 'sl-progress-glow 2s ease-in-out infinite',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <p style={{
            fontSize: '9px', fontWeight: 700, fontFamily: 'monospace', margin: 0,
            color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
            letterSpacing: '0.04em',
          }}>
            v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
};
