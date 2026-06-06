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
  isPremium = false,
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
      return n || 'Nadim Anwar';
    } catch { return 'Nadim Anwar'; }
  });

  const [appNameSize] = useState<number>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const obj = s ? JSON.parse(s) : null;
      const raw = Number(obj?.appShortNameSize);
      if (Number.isFinite(raw) && raw > 0) return Math.min(120, Math.max(24, raw));
      return 30;
    } catch { return 30; }
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
      const size = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(260, Math.max(60, rawSize)) : 140;
      return { enabled, url, size };
    } catch { return { enabled: true, url: '/splash-logo.png', size: 140 }; }
  });

  const activeFont = getSplashFontById(splashFontId);

  useEffect(() => {
    if (activeFont.gfontParam) ensureGoogleFontLoaded(activeFont.gfontParam);
  }, [activeFont.gfontParam]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('burst'), 120);
    const t2 = setTimeout(() => setPhase('reveal'), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const duration = 2200;
    const intervalTime = 50;
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

  const bgColor = themeVariant === 'blue'
    ? '#050d1f'
    : themeVariant === 'black'
    ? '#060608'
    : '#f0f4ff';

  const accentColor = subscriptionLevel === 'ULTRA'
    ? '#94a3b8'
    : subscriptionLevel === 'BASIC'
    ? '#6366f1'
    : '#818cf8';

  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * 360,
    dist: 85 + (i % 4) * 25,
    size: 3 + (i % 3) * 1.5,
    delay: i * 0.04,
    dur: 1.2 + (i % 5) * 0.2,
    color: ['#a5f3fc', '#c4b5fd', '#fde68a', '#f9a8d4', '#86efac', '#fb923c'][i % 6],
    opacity: 0.4 + (i % 3) * 0.2,
  }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: bgColor, overflow: 'hidden', touchAction: 'none',
      }}
    >
      <style>{`
        @keyframes splashLogoReveal {
          0%   { transform: scale(0.3) rotate(-6deg); opacity: 0; filter: blur(16px) brightness(0.3); }
          55%  { transform: scale(1.14) rotate(1.5deg); opacity: 1; filter: blur(0) brightness(1.4); }
          75%  { transform: scale(0.97) rotate(0deg); opacity: 1; filter: blur(0) brightness(1); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0) brightness(1); }
        }
        @keyframes splashHaloBurst {
          0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 0.9; }
          60%  { opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(4); opacity: 0; }
        }
        @keyframes splashHaloBurst2 {
          0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
        }
        @keyframes splashParticle {
          0%   { transform: rotate(var(--pa)) translateX(20px) scale(0); opacity: 0; }
          20%  { opacity: var(--po); }
          100% { transform: rotate(var(--pa)) translateX(var(--pd)) scale(1); opacity: 0; }
        }
        @keyframes splashOrbit {
          0%   { transform: rotate(var(--oa)) translateX(var(--od)) rotate(calc(-1*var(--oa))); }
          100% { transform: rotate(calc(var(--oa) + 360deg)) translateX(var(--od)) rotate(calc(-1*(var(--oa)+360deg))); }
        }
        @keyframes splashRingPulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.18; }
          50%       { transform: translate(-50%,-50%) scale(1.06); opacity: 0.38; }
        }
        @keyframes splashRingPulse2 {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.10; }
          50%       { transform: translate(-50%,-50%) scale(1.09); opacity: 0.22; }
        }
        @keyframes splashNameIn {
          0%   { transform: translateY(22px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes splashShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes splashProgressGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(129,140,248,0.6); }
          50%       { box-shadow: 0 0 18px rgba(165,180,252,0.9), 0 0 32px rgba(196,181,253,0.5); }
        }
        @keyframes splashBgBreath {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(1.1); }
        }
        @keyframes splashLogoGlow {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(129,140,248,0.55)); }
          50%       { filter: drop-shadow(0 0 38px rgba(196,181,253,0.9)) drop-shadow(0 0 60px rgba(165,243,252,0.4)); }
        }
        @keyframes splashTaglineIn {
          0%   { opacity: 0; letter-spacing: 0.35em; }
          100% { opacity: 1; letter-spacing: 0.20em; }
        }
      `}</style>

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isDark
          ? 'radial-gradient(ellipse 70% 60% at 50% 42%, rgba(99,102,241,0.22) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 70% 60% at 50% 42%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        animation: 'splashBgBreath 5s ease-in-out infinite',
      }} />

      {/* Halo burst rings (appear once on logo burst) */}
      {phase !== 'hidden' && (
        <>
          <div style={{
            position: 'absolute', top: '42%', left: '50%',
            width: `${splashLogo.size * 0.85}px`, height: `${splashLogo.size * 0.85}px`,
            borderRadius: '50%',
            border: `2px solid ${isDark ? 'rgba(165,243,252,0.65)' : 'rgba(99,102,241,0.55)'}`,
            animation: 'splashHaloBurst 1.1s ease-out forwards',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '42%', left: '50%',
            width: `${splashLogo.size * 0.85}px`, height: `${splashLogo.size * 0.85}px`,
            borderRadius: '50%',
            border: `1.5px solid ${isDark ? 'rgba(196,181,253,0.5)' : 'rgba(129,140,248,0.4)'}`,
            animation: 'splashHaloBurst2 1.4s ease-out 0.15s forwards',
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Pulsing ambient rings */}
      {phase === 'reveal' && (
        <>
          <div style={{
            position: 'absolute', top: '42%', left: '50%',
            width: `${splashLogo.size + 70}px`, height: `${splashLogo.size + 70}px`,
            borderRadius: '50%',
            border: `1px solid ${isDark ? 'rgba(165,243,252,0.18)' : 'rgba(99,102,241,0.18)'}`,
            animation: 'splashRingPulse 3s ease-in-out infinite 0.8s',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '42%', left: '50%',
            width: `${splashLogo.size + 120}px`, height: `${splashLogo.size + 120}px`,
            borderRadius: '50%',
            border: `1px solid ${isDark ? 'rgba(196,181,253,0.12)' : 'rgba(129,140,248,0.12)'}`,
            animation: 'splashRingPulse2 3.8s ease-in-out infinite 1.2s',
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Particle burst */}
      {phase !== 'hidden' && particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '42%', left: '50%',
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          animation: `splashParticle ${p.dur}s ease-out ${p.delay}s both`,
          ['--pa' as any]: `${p.angle}deg`,
          ['--pd' as any]: `${p.dist}px`,
          ['--po' as any]: p.opacity,
          transform: `rotate(${p.angle}deg) translateX(20px) scale(0)`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* 3 orbiting dots */}
      {phase === 'reveal' && [
        { angle: 0, dist: 95, color: '#a5f3fc', shadow: 'rgba(165,243,252,0.8)', dur: 3.2 },
        { angle: 120, dist: 92, color: '#c4b5fd', shadow: 'rgba(196,181,253,0.8)', dur: 4.1 },
        { angle: 240, dist: 98, color: '#fde68a', shadow: 'rgba(253,230,138,0.8)', dur: 5.0 },
      ].map((dot, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 'calc(42% - 5px)', left: 'calc(50% - 5px)',
          width: '10px', height: '10px',
          borderRadius: '50%',
          background: dot.color,
          boxShadow: `0 0 10px 3px ${dot.shadow}`,
          animation: `splashOrbit ${dot.dur}s linear infinite`,
          ['--oa' as any]: `${dot.angle}deg`,
          ['--od' as any]: `${dot.dist}px`,
          transform: `rotate(${dot.angle}deg) translateX(${dot.dist}px) rotate(-${dot.angle}deg)`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Logo */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '36px',
      }}>
        <div style={{
          animation: phase !== 'hidden' ? 'splashLogoReveal 0.85s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
          opacity: phase === 'hidden' ? 0 : undefined,
        }}>
          <div style={{
            animation: phase === 'reveal' ? 'splashLogoGlow 3s ease-in-out infinite 0.8s' : 'none',
            filter: 'drop-shadow(0 0 18px rgba(129,140,248,0.55))',
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
                  maxWidth: '68vw',
                  objectFit: 'contain',
                  borderRadius: '24px',
                }}
              />
            ) : (
              <h1 style={{
                fontSize: `${appNameSize}px`,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #a5f3fc 0%, #c4b5fd 40%, #f9a8d4 80%, #fde68a 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'splashShimmer 3s linear infinite',
                margin: 0, padding: 0,
                ...(activeFont.family ? { fontFamily: activeFont.family } : {}),
                ...(activeFont.letterSpacing ? { letterSpacing: activeFont.letterSpacing } : {}),
              }}>
                {appName}
              </h1>
            )}
          </div>
        </div>
      </div>

      {/* App name + tagline */}
      {phase === 'reveal' && (
        <div style={{
          textAlign: 'center', zIndex: 10, position: 'relative',
          animation: 'splashNameIn 0.65s cubic-bezier(0.34,1.28,0.64,1) 0.35s both',
          marginTop: '-20px',
        }}>
          <p style={{
            fontSize: '20px', fontWeight: 800, letterSpacing: '0.04em', margin: '0 0 6px',
            background: isDark
              ? 'linear-gradient(90deg, #e2e8f0, #c4b5fd, #a5f3fc, #e2e8f0)'
              : 'linear-gradient(90deg, #1e293b, #6366f1, #818cf8, #1e293b)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'splashShimmer 4s linear infinite 0.5s',
          }}>
            {appName}
          </p>
          <p style={{
            fontSize: '10px', fontWeight: 700, margin: 0,
            color: isDark ? 'rgba(165,243,252,0.5)' : 'rgba(99,102,241,0.6)',
            animation: 'splashTaglineIn 0.8s ease 0.7s both',
            textTransform: 'uppercase',
          }}>
            Ideal Inspiration Classes
          </p>
        </div>
      )}

      {/* Bottom progress section */}
      <div style={{
        position: 'absolute', bottom: '44px', left: 0, right: 0,
        padding: '0 36px', zIndex: 10,
      }}>
        {/* Progress bar */}
        <div style={{
          width: '100%', height: '3px',
          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          borderRadius: '999px', overflow: 'hidden', marginBottom: '10px',
          position: 'relative',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: isDark
              ? 'linear-gradient(90deg, #6366f1, #a78bfa, #f9a8d4)'
              : 'linear-gradient(90deg, #6366f1, #818cf8, #a78bfa)',
            borderRadius: '999px',
            transition: 'width 80ms linear',
            animation: 'splashProgressGlow 2s ease-in-out infinite',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, margin: 0, letterSpacing: '0.06em',
            color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.38)',
          }}>
            Developed by {developerName}
          </p>
          <p style={{
            fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', margin: 0,
            color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.3)',
          }}>
            v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
};
