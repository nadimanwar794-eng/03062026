import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  } catch { return 'black'; }
}

const MESSAGES = [
  '✨ Apka swagat hai...',
  '📚 Lessons load ho rahe hain...',
  '🚀 Tayar ho jao seekhne ke liye!',
  '🌟 Aaj kuch naya seekhte hain',
  '💡 Gyan ki roshni aa rahi hai...',
  '🎯 Aapka safar shuru hone wala hai',
  '🏆 Success ka raasta yahan se shuru hota hai',
  '🔥 Chalo, aaj bhi kuch naya seekhein!',
];

function readSettings() {
  try {
    const s = localStorage.getItem('nst_system_settings');
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete }) => {
  const settings = useMemo(readSettings, []);

  const appName: string = settings.appShortName || settings.appName || 'IIC';
  const developerName: string = (settings.developerName || 'Nafim Anwar').toString().trim() || 'Nafim Anwar';
  const appTagline: string = (settings.appTagline || '').toString().trim();
  const appNameSize: number = (() => {
    const r = Number(settings.appShortNameSize);
    return Number.isFinite(r) && r > 0 ? Math.min(96, Math.max(28, r)) : 52;
  })();
  const splashFontId: string = settings.splashFontId || localStorage.getItem('nst_splash_font_id') || 'default';
  const logoEnabled: boolean = settings.splashLogoEnabled !== false;
  const logoUrl: string = settings.splashLogoUrl || '/splash-logo.png';
  const logoSize: number = (() => {
    const r = Number(settings.splashLogoSize);
    return Number.isFinite(r) && r > 0 ? Math.min(220, Math.max(60, r)) : 130;
  })();

  const activeFont = getSplashFontById(splashFontId);
  useEffect(() => {
    if (activeFont.gfontParam) ensureGoogleFontLoaded(activeFont.gfontParam);
  }, [activeFont.gfontParam]);

  const [themeVariant] = useState<ThemeVariant>(detectTheme);
  const isDark = themeVariant !== 'light';

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0=init 1=burst 2=full
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Phase timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 520);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Progress over 10s
  useEffect(() => {
    const TOTAL = 10000;
    const TICK = 50;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += TICK;
      const t = Math.min(elapsed / TOTAL, 1);
      // Ease-in-out curve so it doesn't feel linear
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setProgress(Math.floor(eased * 100));
      if (elapsed >= TOTAL) {
        clearInterval(id);
        setTimeout(() => onCompleteRef.current(), 200);
      }
    }, TICK);
    return () => clearInterval(id);
  }, []);

  // Rotating messages
  useEffect(() => {
    const cycle = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 400);
    }, 1600);
    return () => clearInterval(cycle);
  }, []);

  // Stars
  const stars = useMemo(() =>
    Array.from({ length: 55 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 0.8 + Math.random() * 1.8,
      dur: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 3,
      opacity: 0.25 + Math.random() * 0.55,
    })), []);

  // Shooting stars
  const [shootIdx, setShootIdx] = useState(-1);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setShootIdx(i => (i + 1) % 3);
        setTimeout(() => setShootIdx(-1), 800);
        schedule();
      }, 2200 + Math.random() * 1800);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const shoots = useMemo(() => [
    { x: 15, y: 20, angle: 35 },
    { x: 60, y: 10, angle: 25 },
    { x: 80, y: 35, angle: 40 },
  ], []);

  const bg = themeVariant === 'blue' ? '#02081a' : themeVariant === 'black' ? '#06060a' : '#e8eef9';
  const accentGold = '#f9c846';
  const accentCyan = '#67e8f9';
  const accentPurple = '#a78bfa';
  const fontStyle = activeFont.family ? { fontFamily: activeFont.family } : {};
  const lsStyle = activeFont.letterSpacing ? { letterSpacing: activeFont.letterSpacing } : {};

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
      background: bg, touchAction: 'none', userSelect: 'none',
    }}>
      <style>{`
        @keyframes _sl_twinkle {
          0%,100% { opacity: var(--so); transform: scale(1); }
          50%      { opacity: calc(var(--so) * 0.25); transform: scale(0.6); }
        }
        @keyframes _sl_shoot {
          0%   { transform: translateX(0) translateY(0) scaleX(0); opacity: 0; }
          10%  { opacity: 1; transform: translateX(0) translateY(0) scaleX(1); }
          100% { transform: translateX(160px) translateY(100px) scaleX(1); opacity: 0; }
        }
        @keyframes _sl_aurora_t {
          0%,100% { transform: translateX(-15%) scaleY(1); opacity: 0.55; }
          50%      { transform: translateX(15%)  scaleY(1.3); opacity: 0.80; }
        }
        @keyframes _sl_aurora_b {
          0%,100% { transform: translateX(10%) scaleY(1); opacity: 0.45; }
          50%      { transform: translateX(-10%) scaleY(1.4); opacity: 0.70; }
        }
        @keyframes _sl_logo_in {
          0%   { transform: scale(0.18) rotate(-12deg); opacity: 0; filter: blur(28px) brightness(0.1); }
          55%  { transform: scale(1.12) rotate(3deg);  opacity: 1; filter: blur(0) brightness(2); }
          78%  { transform: scale(0.97) rotate(-1deg); opacity: 1; filter: blur(0) brightness(1.1); }
          100% { transform: scale(1)    rotate(0deg);  opacity: 1; filter: blur(0) brightness(1); }
        }
        @keyframes _sl_logo_glow {
          0%,100% { filter: drop-shadow(0 0 18px rgba(249,200,70,0.55)) drop-shadow(0 0 40px rgba(249,200,70,0.20)); }
          50%      { filter: drop-shadow(0 0 50px rgba(249,200,70,1.00)) drop-shadow(0 0 90px rgba(249,200,70,0.45)) drop-shadow(0 0 22px rgba(103,232,249,0.30)); }
        }
        @keyframes _sl_ring1 {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes _sl_ring2 {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes _sl_ring3 {
          from { transform: translate(-50%,-50%) rotate(20deg); }
          to   { transform: translate(-50%,-50%) rotate(380deg); }
        }
        @keyframes _sl_burst {
          0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(3.5); opacity: 0; }
        }
        @keyframes _sl_burst2 {
          0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.65; }
          100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
        }
        @keyframes _sl_orbit {
          from { transform: rotate(var(--oa)) translateX(var(--od)) rotate(calc(-1*var(--oa))); }
          to   { transform: rotate(calc(var(--oa)+360deg)) translateX(var(--od)) rotate(calc(-360deg - var(--oa))); }
        }
        @keyframes _sl_name_in {
          0%   { opacity: 0; transform: translateY(22px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes _sl_dev_in {
          0%   { opacity: 0; transform: translateY(14px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes _sl_shimmer {
          0%   { background-position: 300% center; }
          100% { background-position: -300% center; }
        }
        @keyframes _sl_msg_in  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _sl_msg_out { from { opacity:1; transform:translateY(0); }   to { opacity:0; transform:translateY(-8px); } }
        @keyframes _sl_bar_glow {
          0%,100% { box-shadow: 0 0 6px rgba(249,200,70,0.6); }
          50%      { box-shadow: 0 0 20px rgba(249,200,70,1), 0 0 40px rgba(249,200,70,0.35); }
        }
        @keyframes _sl_corner_in {
          from { opacity:0; transform:scale(0.7); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes _sl_dot_bounce {
          0%,100% { transform:translateY(0); opacity:0.5; }
          50%      { transform:translateY(-5px); opacity:1; }
        }
        @keyframes _sl_hud_pulse {
          0%,100% { opacity:0.18; }
          50%      { opacity:0.45; }
        }
        @keyframes _sl_sweep {
          0%   { transform:translate(-50%,-50%) rotate(0deg); }
          100% { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes _sl_radial_pulse {
          0%,100% { opacity:0.10; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:0.22; transform:translate(-50%,-50%) scale(1.08); }
        }
      `}</style>

      {/* ═══════════════════════════════════════ BACKGROUND LAYERS */}

      {/* Stars */}
      {isDark && stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.r * 2}px`, height: `${s.r * 2}px`,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: `0 0 ${s.r * 4}px rgba(255,255,255,0.8)`,
          animation: `_sl_twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          ['--so' as any]: s.opacity,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Shooting stars */}
      {isDark && shoots.map((sh, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${sh.x}%`, top: `${sh.y}%`,
          width: '90px', height: '2px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff, rgba(249,200,70,0.8))',
          borderRadius: '999px',
          transform: `rotate(${sh.angle}deg)`,
          transformOrigin: 'left center',
          animation: shootIdx === i ? '_sl_shoot 0.75s ease-out forwards' : 'none',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      ))}

      {/* Aurora — top */}
      <div style={{
        position: 'absolute', top: 0, left: '-20%', right: '-20%', height: '180px',
        background: isDark
          ? 'linear-gradient(180deg, rgba(167,139,250,0.28) 0%, rgba(103,232,249,0.18) 50%, transparent 100%)'
          : 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
        filter: 'blur(18px)',
        animation: '_sl_aurora_t 7s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Aurora — bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: '-20%', right: '-20%', height: '160px',
        background: isDark
          ? 'linear-gradient(0deg, rgba(249,200,70,0.22) 0%, rgba(251,146,60,0.12) 40%, transparent 100%)'
          : 'linear-gradient(0deg, rgba(245,158,11,0.12) 0%, transparent 100%)',
        filter: 'blur(18px)',
        animation: '_sl_aurora_b 9s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Radial ambient glow behind logo */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: '380px', height: '380px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(249,200,70,0.14) 0%, rgba(167,139,250,0.08) 45%, transparent 70%)'
          : 'radial-gradient(circle, rgba(249,200,70,0.10) 0%, transparent 70%)',
        animation: '_sl_radial_pulse 5s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* HUD corner SVGs */}
      {phase > 0 && [
        { top: 18, left: 18, r: 0 },
        { top: 18, right: 18, r: 90 },
        { bottom: 18, right: 18, r: 180 },
        { bottom: 18, left: 18, r: 270 },
      ].map((c, i) => (
        <svg key={i} width="32" height="32" style={{
          position: 'absolute', ...c,
          transform: `rotate(${c.r}deg)`,
          animation: `_sl_corner_in 0.5s ease ${0.25 + i * 0.07}s both`,
          pointerEvents: 'none', zIndex: 3,
        }}>
          <path d="M3 29 L3 3 L29 3" fill="none"
            stroke={isDark ? 'rgba(249,200,70,0.38)' : 'rgba(99,102,241,0.28)'}
            strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="3" cy="3" r="2" fill={isDark ? 'rgba(249,200,70,0.6)' : 'rgba(99,102,241,0.5)'}/>
        </svg>
      ))}

      {/* ═══════════════════════════════════════ LOGO AREA */}

      {/* Burst halos */}
      {phase > 0 && <>
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: `${logoSize + 10}px`, height: `${logoSize + 10}px`, borderRadius: '50%',
          border: `2px solid ${isDark ? 'rgba(249,200,70,0.85)' : 'rgba(245,158,11,0.7)'}`,
          animation: '_sl_burst 1.2s ease-out 0.1s forwards',
          pointerEvents: 'none', zIndex: 4,
        }} />
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: `${logoSize + 10}px`, height: `${logoSize + 10}px`, borderRadius: '50%',
          border: `1.5px solid ${isDark ? 'rgba(103,232,249,0.65)' : 'rgba(99,102,241,0.5)'}`,
          animation: '_sl_burst2 1.5s ease-out 0.25s forwards',
          pointerEvents: 'none', zIndex: 4,
        }} />
      </>}

      {/* Spinning ring 1 — gold arcs */}
      {phase === 2 && <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: `${logoSize + 52}px`, height: `${logoSize + 52}px`, borderRadius: '50%',
        background: isDark
          ? 'conic-gradient(from 0deg, transparent 0deg, rgba(249,200,70,0.9) 40deg, transparent 80deg, transparent 160deg, rgba(249,200,70,0.5) 200deg, transparent 240deg, transparent 360deg)'
          : 'conic-gradient(from 0deg, transparent 0deg, rgba(245,158,11,0.7) 50deg, transparent 100deg, transparent 360deg)',
        WebkitMask: `radial-gradient(circle, transparent ${(logoSize + 52) / 2 - 3}px, black ${(logoSize + 52) / 2 - 1}px)`,
        mask: `radial-gradient(circle, transparent ${(logoSize + 52) / 2 - 3}px, black ${(logoSize + 52) / 2 - 1}px)`,
        animation: '_sl_ring1 2.8s linear infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />}

      {/* Spinning ring 2 — cyan arcs, counter-clockwise */}
      {phase === 2 && <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: `${logoSize + 84}px`, height: `${logoSize + 84}px`, borderRadius: '50%',
        background: isDark
          ? 'conic-gradient(from 90deg, transparent 0deg, rgba(103,232,249,0.65) 30deg, transparent 60deg, transparent 360deg)'
          : 'conic-gradient(from 90deg, transparent 0deg, rgba(99,102,241,0.5) 40deg, transparent 80deg, transparent 360deg)',
        WebkitMask: `radial-gradient(circle, transparent ${(logoSize + 84) / 2 - 3}px, black ${(logoSize + 84) / 2 - 1}px)`,
        mask: `radial-gradient(circle, transparent ${(logoSize + 84) / 2 - 3}px, black ${(logoSize + 84) / 2 - 1}px)`,
        animation: '_sl_ring2 4.5s linear infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />}

      {/* Spinning ring 3 — purple arcs */}
      {phase === 2 && <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: `${logoSize + 120}px`, height: `${logoSize + 120}px`, borderRadius: '50%',
        background: isDark
          ? 'conic-gradient(from 200deg, transparent 0deg, rgba(167,139,250,0.5) 35deg, transparent 70deg, transparent 360deg)'
          : 'conic-gradient(from 200deg, transparent 0deg, rgba(139,92,246,0.35) 45deg, transparent 90deg, transparent 360deg)',
        WebkitMask: `radial-gradient(circle, transparent ${(logoSize + 120) / 2 - 3}px, black ${(logoSize + 120) / 2 - 1}px)`,
        mask: `radial-gradient(circle, transparent ${(logoSize + 120) / 2 - 3}px, black ${(logoSize + 120) / 2 - 1}px)`,
        animation: '_sl_ring3 6.5s linear infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />}

      {/* Sweeping radar line */}
      {phase === 2 && <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: `${logoSize + 84}px`, height: `${logoSize + 84}px`, borderRadius: '50%',
        background: isDark
          ? 'conic-gradient(from 0deg, rgba(249,200,70,0.25), transparent 60deg)'
          : 'conic-gradient(from 0deg, rgba(245,158,11,0.18), transparent 60deg)',
        WebkitMask: `radial-gradient(circle, transparent ${(logoSize + 84) / 2 - 44}px, black ${(logoSize + 84) / 2 - 1}px)`,
        mask: `radial-gradient(circle, transparent ${(logoSize + 84) / 2 - 44}px, black ${(logoSize + 84) / 2 - 1}px)`,
        animation: '_sl_sweep 3.5s linear infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />}

      {/* Orbiting dots */}
      {phase === 2 && [
        { angle: 0,   dist: logoSize / 2 + 28, color: accentGold,   shadow: 'rgba(249,200,70,0.9)',   dur: 2.8 },
        { angle: 120, dist: logoSize / 2 + 44, color: accentCyan,   shadow: 'rgba(103,232,249,0.9)',  dur: 4.5 },
        { angle: 240, dist: logoSize / 2 + 62, color: accentPurple, shadow: 'rgba(167,139,250,0.9)',  dur: 6.5 },
      ].map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `calc(38% - 6px)`, left: 'calc(50% - 6px)',
          width: '12px', height: '12px', borderRadius: '50%',
          background: d.color,
          boxShadow: `0 0 10px 4px ${d.shadow}`,
          animation: `_sl_orbit ${d.dur}s linear infinite`,
          ['--oa' as any]: `${d.angle}deg`,
          ['--od' as any]: `${d.dist}px`,
          pointerEvents: 'none', zIndex: 5,
        }} />
      ))}

      {/* ═══════════════════════════════════════ CENTER CONTENT */}

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 0, marginTop: '10px',
      }}>

        {/* Logo */}
        <div style={{
          animation: phase > 0 ? '_sl_logo_in 0.85s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
          opacity: phase === 0 ? 0 : undefined,
        }}>
          <div style={{
            animation: phase === 2 ? '_sl_logo_glow 3.5s ease-in-out infinite 0.5s' : 'none',
            filter: `drop-shadow(0 0 18px rgba(249,200,70,0.55))`,
          }}>
            {logoEnabled && logoUrl ? (
              <img
                src={logoUrl} alt={appName} draggable={false}
                onError={e => { const t = e.currentTarget as HTMLImageElement; if (!t.src.includes('/splash-logo.png')) t.src = '/splash-logo.png'; }}
                style={{ width: logoSize, height: logoSize, maxWidth: '68vw', objectFit: 'contain', borderRadius: '24px', display: 'block' }}
              />
            ) : (
              <h1 style={{
                fontSize: appNameSize, fontWeight: 900, margin: 0,
                background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#fde68a,#fbbf24)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                animation: '_sl_shimmer 3s linear infinite',
                ...fontStyle, ...lsStyle,
              }}>{appName}</h1>
            )}
          </div>
        </div>

        {/* Developer credit — below logo */}
        {phase === 2 && (
          <div style={{
            marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: '_sl_dev_in 0.65s cubic-bezier(0.34,1.3,0.64,1) 0.3s both',
          }}>
            {/* Separator line */}
            <div style={{
              width: '48px', height: '1px', marginBottom: '8px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(249,200,70,0.5), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
            }} />
            <span style={{
              fontSize: '8px', fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)',
              display: 'block', marginBottom: '3px',
            }}>Developed by</span>
            <span style={{
              fontSize: '17px', fontWeight: 800, letterSpacing: '0.05em',
              background: isDark
                ? 'linear-gradient(90deg,#fde68a,#fbbf24,#f9c846,#fde68a,#fbbf24)'
                : 'linear-gradient(90deg,#b45309,#d97706,#f59e0b,#d97706)',
              backgroundSize: '250% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: '_sl_shimmer 3.5s linear infinite',
              display: 'block',
            }}>{developerName}</span>
          </div>
        )}

        {/* App name below developer */}
        {phase === 2 && (
          <div style={{
            marginTop: '18px', textAlign: 'center',
            animation: '_sl_name_in 0.6s ease 0.45s both',
          }}>
            <p style={{
              margin: 0, fontSize: Math.min(appNameSize * 0.55, 22), fontWeight: 900,
              letterSpacing: '0.06em',
              background: isDark
                ? 'linear-gradient(90deg,#f1f5f9,#c4b5fd,#a5f3fc,#fbbf24,#f1f5f9)'
                : 'linear-gradient(90deg,#1e293b,#6366f1,#4f46e5,#1e293b)',
              backgroundSize: '280% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: '_sl_shimmer 4.5s linear infinite 0.3s',
              ...fontStyle, ...lsStyle,
            }}>{appName}</p>
            {appTagline ? (
              <p style={{
                margin: '5px 0 0', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.24em', textTransform: 'uppercase',
                color: isDark ? 'rgba(103,232,249,0.55)' : 'rgba(99,102,241,0.60)',
              }}>{appTagline}</p>
            ) : null}
          </div>
        )}

        {/* Rotating message */}
        {phase === 2 && (
          <div style={{
            marginTop: '22px', height: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', minWidth: '220px',
          }}>
            <p style={{
              margin: 0, fontSize: '12px', fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.48)',
              textAlign: 'center',
              animation: msgVisible ? '_sl_msg_in 0.4s ease both' : '_sl_msg_out 0.35s ease both',
            }}>
              {MESSAGES[msgIndex]}
            </p>
          </div>
        )}

        {/* 3 bouncing dots loader */}
        {phase === 2 && (
          <div style={{ display: 'flex', gap: '7px', marginTop: '14px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: [accentGold, accentCyan, accentPurple][i],
                boxShadow: `0 0 8px ${['rgba(249,200,70,0.8)','rgba(103,232,249,0.8)','rgba(167,139,250,0.8)'][i]}`,
                animation: `_sl_dot_bounce 0.9s ease-in-out ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════ BOTTOM PROGRESS */}
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0,
        padding: '0 28px', zIndex: 10,
      }}>
        {/* Progress percentage */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
          <span style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: isDark ? 'rgba(249,200,70,0.55)' : 'rgba(245,158,11,0.65)',
          }}>Loading</span>
          <span style={{
            fontSize: '11px', fontWeight: 900, fontFamily: 'monospace',
            color: isDark ? 'rgba(249,200,70,0.80)' : 'rgba(180,83,9,0.85)',
          }}>{progress}%</span>
        </div>

        {/* Segmented progress bar */}
        <div style={{
          width: '100%', height: '4px',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
          borderRadius: '999px', overflow: 'hidden',
          boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.04)' : 'inset 0 0 0 1px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: isDark
              ? 'linear-gradient(90deg,#f59e0b,#fbbf24 30%,#fde68a 55%,#a78bfa 80%,#67e8f9)'
              : 'linear-gradient(90deg,#d97706,#f59e0b,#6366f1)',
            borderRadius: '999px',
            transition: 'width 80ms linear',
            animation: '_sl_bar_glow 2.2s ease-in-out infinite',
            position: 'relative',
          }}>
            {/* Shimmer on bar */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
              backgroundSize: '60% 100%',
              animation: '_sl_shimmer 1.6s linear infinite',
              borderRadius: '999px',
            }} />
          </div>
        </div>

        {/* Version */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <span style={{
            fontSize: '8px', fontFamily: 'monospace', fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.20)',
            letterSpacing: '0.03em',
          }}>v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};
