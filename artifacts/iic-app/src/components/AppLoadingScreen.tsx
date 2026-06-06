import React, { useState, useEffect, useRef, useMemo } from 'react';
import { APP_VERSION } from '../constants';
import { getSplashFontById, ensureGoogleFontLoaded } from '../utils/splashFonts';

interface AppLoadingScreenProps {
  onComplete: () => void;
  isPremium?: boolean;
  subscriptionLevel?: 'FREE' | 'BASIC' | 'ULTRA';
}

// ─── PER-TIER THEME TOKENS ──────────────────────────────────────────────────
const TIER_THEMES = {
  FREE: {
    // Sky — fresh, bright, aspirational
    bg: 'linear-gradient(160deg,#bae6fd 0%,#e0f2fe 40%,#f0f9ff 70%,#dbeafe 100%)',
    starColor: 'rgba(14,165,233,0.55)',
    shootColor: 'linear-gradient(90deg,transparent,#38bdf8,#fff)',
    auroraTop: 'linear-gradient(180deg,rgba(56,189,248,0.38) 0%,rgba(147,197,253,0.18) 50%,transparent 100%)',
    auroraBot: 'linear-gradient(0deg,rgba(99,102,241,0.18) 0%,rgba(56,189,248,0.10) 40%,transparent 100%)',
    ambientGlow: 'radial-gradient(ellipse 70% 60% at 50% 38%,rgba(56,189,248,0.32) 0%,rgba(99,102,241,0.14) 50%,transparent 75%)',
    ring1: 'conic-gradient(from 0deg,transparent 0deg,rgba(14,165,233,0.85) 45deg,transparent 90deg,transparent 360deg)',
    ring2: 'conic-gradient(from 120deg,transparent 0deg,rgba(99,102,241,0.65) 35deg,transparent 70deg,transparent 360deg)',
    ring3: 'conic-gradient(from 240deg,transparent 0deg,rgba(56,189,248,0.50) 30deg,transparent 60deg,transparent 360deg)',
    sweep: 'conic-gradient(from 0deg,rgba(14,165,233,0.22),transparent 65deg)',
    burstBorder1: 'rgba(14,165,233,0.85)',
    burstBorder2: 'rgba(99,102,241,0.60)',
    orbitColors: ['#0ea5e9','#818cf8','#38bdf8'] as const,
    orbitShadows: ['rgba(14,165,233,0.85)','rgba(129,140,248,0.85)','rgba(56,189,248,0.85)'] as const,
    logoGlowKeyframe: '0%,100%{filter:drop-shadow(0 0 18px rgba(14,165,233,0.6)) drop-shadow(0 0 36px rgba(14,165,233,0.25))} 50%{filter:drop-shadow(0 0 48px rgba(14,165,233,0.95)) drop-shadow(0 0 80px rgba(14,165,233,0.40)) drop-shadow(0 0 20px rgba(99,102,241,0.30))}',
    logoGlowStatic: 'drop-shadow(0 0 18px rgba(14,165,233,0.60))',
    nameGrad: 'linear-gradient(90deg,#0369a1,#0ea5e9,#6366f1,#0369a1)',
    devGrad: 'linear-gradient(90deg,#0369a1,#0ea5e9,#38bdf8,#0369a1)',
    msgColor: 'rgba(15,23,42,0.55)',
    barGrad: 'linear-gradient(90deg,#0ea5e9,#38bdf8,#818cf8)',
    barGlowKf: '0%,100%{box-shadow:0 0 6px rgba(14,165,233,0.55)} 50%{box-shadow:0 0 20px rgba(14,165,233,0.90),0 0 40px rgba(14,165,233,0.35)}',
    percentColor: 'rgba(7,89,133,0.85)',
    cornerColor: 'rgba(14,165,233,0.42)',
    cornerDot: 'rgba(14,165,233,0.70)',
    separatorGrad: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.55),transparent)',
    devByColor: 'rgba(15,23,42,0.38)',
    taglineColor: 'rgba(14,165,233,0.70)',
    dotColors: ['#0ea5e9','#6366f1','#38bdf8'] as const,
    dotShadows: ['rgba(14,165,233,0.80)','rgba(99,102,241,0.80)','rgba(56,189,248,0.80)'] as const,
    radialBehind: 'radial-gradient(circle,rgba(14,165,233,0.18) 0%,rgba(99,102,241,0.10) 50%,transparent 75%)',
    badge: '☁️ SKY',
    badgeColor: '#0ea5e9',
  },
  BASIC: {
    // Electric Blue — professional, cool, confident
    bg: 'linear-gradient(160deg,#080f2e 0%,#0f1b3d 40%,#0c1a35 70%,#071028 100%)',
    starColor: 'rgba(96,165,250,0.60)',
    shootColor: 'linear-gradient(90deg,transparent,#60a5fa,rgba(147,197,253,0.9))',
    auroraTop: 'linear-gradient(180deg,rgba(59,130,246,0.35) 0%,rgba(96,165,250,0.18) 50%,transparent 100%)',
    auroraBot: 'linear-gradient(0deg,rgba(67,56,202,0.28) 0%,rgba(59,130,246,0.12) 40%,transparent 100%)',
    ambientGlow: 'radial-gradient(ellipse 70% 60% at 50% 38%,rgba(59,130,246,0.22) 0%,rgba(96,165,250,0.10) 50%,transparent 75%)',
    ring1: 'conic-gradient(from 0deg,transparent 0deg,rgba(59,130,246,0.90) 45deg,transparent 90deg,rgba(59,130,246,0.45) 200deg,transparent 245deg,transparent 360deg)',
    ring2: 'conic-gradient(from 130deg,transparent 0deg,rgba(147,197,253,0.65) 35deg,transparent 70deg,transparent 360deg)',
    ring3: 'conic-gradient(from 250deg,transparent 0deg,rgba(99,102,241,0.55) 30deg,transparent 60deg,transparent 360deg)',
    sweep: 'conic-gradient(from 0deg,rgba(59,130,246,0.28),transparent 65deg)',
    burstBorder1: 'rgba(59,130,246,0.90)',
    burstBorder2: 'rgba(147,197,253,0.60)',
    orbitColors: ['#3b82f6','#93c5fd','#6366f1'] as const,
    orbitShadows: ['rgba(59,130,246,0.90)','rgba(147,197,253,0.85)','rgba(99,102,241,0.85)'] as const,
    logoGlowKeyframe: '0%,100%{filter:drop-shadow(0 0 18px rgba(59,130,246,0.55)) drop-shadow(0 0 36px rgba(59,130,246,0.20))} 50%{filter:drop-shadow(0 0 50px rgba(59,130,246,1.0)) drop-shadow(0 0 90px rgba(59,130,246,0.40)) drop-shadow(0 0 22px rgba(147,197,253,0.35))}',
    logoGlowStatic: 'drop-shadow(0 0 18px rgba(59,130,246,0.60))',
    nameGrad: 'linear-gradient(90deg,#bfdbfe,#60a5fa,#818cf8,#bfdbfe)',
    devGrad: 'linear-gradient(90deg,#93c5fd,#60a5fa,#3b82f6,#93c5fd)',
    msgColor: 'rgba(191,219,254,0.55)',
    barGrad: 'linear-gradient(90deg,#1d4ed8,#3b82f6,#93c5fd,#6366f1)',
    barGlowKf: '0%,100%{box-shadow:0 0 6px rgba(59,130,246,0.55)} 50%{box-shadow:0 0 20px rgba(59,130,246,0.95),0 0 40px rgba(59,130,246,0.40)}',
    percentColor: 'rgba(147,197,253,0.85)',
    cornerColor: 'rgba(59,130,246,0.45)',
    cornerDot: 'rgba(96,165,250,0.70)',
    separatorGrad: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.55),transparent)',
    devByColor: 'rgba(147,197,253,0.35)',
    taglineColor: 'rgba(147,197,253,0.60)',
    dotColors: ['#3b82f6','#93c5fd','#6366f1'] as const,
    dotShadows: ['rgba(59,130,246,0.80)','rgba(147,197,253,0.80)','rgba(99,102,241,0.80)'] as const,
    radialBehind: 'radial-gradient(circle,rgba(59,130,246,0.18) 0%,rgba(99,102,241,0.08) 50%,transparent 75%)',
    badge: '💎 BASIC',
    badgeColor: '#60a5fa',
  },
  ULTRA: {
    // Navy Dark Gold — ultra premium, exclusive, luxury
    bg: 'linear-gradient(160deg,#020510 0%,#040812 35%,#06091a 65%,#030610 100%)',
    starColor: 'rgba(253,230,138,0.65)',
    shootColor: 'linear-gradient(90deg,transparent,#fde68a,rgba(249,200,70,0.90))',
    auroraTop: 'linear-gradient(180deg,rgba(167,139,250,0.30) 0%,rgba(249,200,70,0.12) 50%,transparent 100%)',
    auroraBot: 'linear-gradient(0deg,rgba(249,200,70,0.25) 0%,rgba(251,146,60,0.12) 40%,transparent 100%)',
    ambientGlow: 'radial-gradient(ellipse 70% 60% at 50% 38%,rgba(249,200,70,0.16) 0%,rgba(167,139,250,0.09) 50%,transparent 75%)',
    ring1: 'conic-gradient(from 0deg,transparent 0deg,rgba(249,200,70,0.95) 40deg,transparent 80deg,rgba(249,200,70,0.45) 195deg,transparent 235deg,transparent 360deg)',
    ring2: 'conic-gradient(from 130deg,transparent 0deg,rgba(226,232,240,0.60) 30deg,transparent 60deg,transparent 360deg)',
    ring3: 'conic-gradient(from 250deg,transparent 0deg,rgba(167,139,250,0.55) 35deg,transparent 70deg,transparent 360deg)',
    sweep: 'conic-gradient(from 0deg,rgba(249,200,70,0.28),transparent 60deg)',
    burstBorder1: 'rgba(249,200,70,0.90)',
    burstBorder2: 'rgba(226,232,240,0.55)',
    orbitColors: ['#f9c846','#e2e8f0','#a78bfa'] as const,
    orbitShadows: ['rgba(249,200,70,0.95)','rgba(226,232,240,0.80)','rgba(167,139,250,0.90)'] as const,
    logoGlowKeyframe: '0%,100%{filter:drop-shadow(0 0 20px rgba(249,200,70,0.55)) drop-shadow(0 0 8px rgba(245,158,11,0.40))} 50%{filter:drop-shadow(0 0 55px rgba(249,200,70,1.0)) drop-shadow(0 0 100px rgba(249,200,70,0.45)) drop-shadow(0 0 25px rgba(167,139,250,0.35))}',
    logoGlowStatic: 'drop-shadow(0 0 20px rgba(249,200,70,0.60))',
    nameGrad: 'linear-gradient(90deg,#fde68a,#e2e8f0,#c4b5fd,#fbbf24,#fde68a)',
    devGrad: 'linear-gradient(90deg,#fde68a,#fbbf24,#f9c846,#fde68a)',
    msgColor: 'rgba(253,230,138,0.48)',
    barGrad: 'linear-gradient(90deg,#b45309,#f59e0b,#fbbf24,#fde68a,#a78bfa)',
    barGlowKf: '0%,100%{box-shadow:0 0 6px rgba(249,200,70,0.60)} 50%{box-shadow:0 0 22px rgba(249,200,70,1.0),0 0 44px rgba(249,200,70,0.40)}',
    percentColor: 'rgba(253,230,138,0.85)',
    cornerColor: 'rgba(249,200,70,0.40)',
    cornerDot: 'rgba(249,200,70,0.70)',
    separatorGrad: 'linear-gradient(90deg,transparent,rgba(249,200,70,0.55),transparent)',
    devByColor: 'rgba(253,230,138,0.30)',
    taglineColor: 'rgba(167,139,250,0.65)',
    dotColors: ['#f9c846','#e2e8f0','#a78bfa'] as const,
    dotShadows: ['rgba(249,200,70,0.85)','rgba(226,232,240,0.75)','rgba(167,139,250,0.85)'] as const,
    radialBehind: 'radial-gradient(circle,rgba(249,200,70,0.14) 0%,rgba(167,139,250,0.08) 50%,transparent 75%)',
    badge: '👑 ULTRA',
    badgeColor: '#f9c846',
  },
} as const;

const MESSAGES_BY_TIER: Record<string, string[]> = {
  FREE: [
    '☁️ Apka safar shuru ho raha hai...',
    '📚 Lessons load ho rahe hain...',
    '✨ Aaj kuch naya seekhein!',
    '🌤️ Gyan ki roshni aa rahi hai...',
    '🎯 Aapka swagat hai!',
    '💡 Seekhna hi asli kamyabi hai',
    '🌱 Har din thoda aur seekho',
    '🚀 Chalo, shuru karte hain!',
  ],
  BASIC: [
    '💎 Blue plan active — premium experience!',
    '📘 Apke lessons ready hain...',
    '🔵 Smart learners choose Blue!',
    '⚡ Fast access loading...',
    '📊 Aapki progress sync ho rahi hai',
    '🎯 Premium content aa raha hai',
    '💡 Seekhte raho, badhte raho!',
    '🌀 Sabse best experience ke liye tayyar ho!',
  ],
  ULTRA: [
    '👑 Ultra plan — sabse premium experience!',
    '⚡ Exclusive content loading...',
    '🏆 Aap IIC ke top learner hain!',
    '✨ Unlimited access — your kingdom awaits',
    '💎 Ultra members ke liye special content',
    '🌟 Premium features unlock ho rahe hain',
    '👑 Royalty-level learning shuru hota hai',
    '🔥 The best just got better — welcome back!',
  ],
};

function readSettings() {
  try { const s = localStorage.getItem('nst_system_settings'); return s ? JSON.parse(s) : {}; }
  catch { return {}; }
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  onComplete,
  subscriptionLevel = 'FREE',
}) => {
  const settings = useMemo(readSettings, []);

  const tier = subscriptionLevel === 'ULTRA' ? 'ULTRA' : subscriptionLevel === 'BASIC' ? 'BASIC' : 'FREE';
  const T = TIER_THEMES[tier];
  const MESSAGES = MESSAGES_BY_TIER[tier];

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
  useEffect(() => { if (activeFont.gfontParam) ensureGoogleFontLoaded(activeFont.gfontParam); }, [activeFont.gfontParam]);

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 520);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const TOTAL = 10000;
    const TICK = 50;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += TICK;
      const t = Math.min(elapsed / TOTAL, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setProgress(Math.floor(eased * 100));
      if (elapsed >= TOTAL) { clearInterval(id); setTimeout(() => onCompleteRef.current(), 200); }
    }, TICK);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => { setMsgIndex(i => (i + 1) % MESSAGES.length); setMsgVisible(true); }, 380);
    }, 1600);
    return () => clearInterval(id);
  }, [MESSAGES.length]);

  // Stars — more stars for ULTRA, medium for BASIC, fewer for FREE
  const starCount = tier === 'ULTRA' ? 65 : tier === 'BASIC' ? 50 : 35;
  const stars = useMemo(() => Array.from({ length: starCount }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    r: (tier === 'FREE' ? 0.6 : 0.8) + Math.random() * 1.8,
    dur: 1.4 + Math.random() * 2.8, delay: Math.random() * 3.5,
    opacity: tier === 'FREE' ? 0.20 + Math.random() * 0.40 : 0.25 + Math.random() * 0.55,
  })), [starCount, tier]);

  const [shootIdx, setShootIdx] = useState(-1);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const sch = () => { t = setTimeout(() => { setShootIdx(i => (i + 1) % 3); setTimeout(() => setShootIdx(-1), 800); sch(); }, 1800 + Math.random() * 2200); };
    sch();
    return () => clearTimeout(t);
  }, []);

  const shoots = useMemo(() => [
    { x: 12, y: 15, angle: 32 }, { x: 62, y: 8, angle: 24 }, { x: 78, y: 30, angle: 38 },
  ], []);

  const fontStyle = activeFont.family ? { fontFamily: activeFont.family } : {};
  const lsStyle = activeFont.letterSpacing ? { letterSpacing: activeFont.letterSpacing } : {};

  // ring mask helper
  const ringMask = (sz: number) => `radial-gradient(circle,transparent ${sz / 2 - 3}px,black ${sz / 2 - 1}px)`;
  const R1 = logoSize + 52, R2 = logoSize + 86, R3 = logoSize + 122;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden', background: T.bg, touchAction: 'none', userSelect: 'none' }}>
      <style>{`
        @keyframes _twinkle { 0%,100%{opacity:var(--so);transform:scale(1)} 50%{opacity:calc(var(--so)*0.18);transform:scale(0.55)} }
        @keyframes _shoot { 0%{transform:translateX(0) translateY(0) scaleX(0);opacity:0} 10%{opacity:1;transform:translateX(0) translateY(0) scaleX(1)} 100%{transform:translateX(170px) translateY(105px) scaleX(1);opacity:0} }
        @keyframes _aurora_t { 0%,100%{transform:translateX(-18%) scaleY(1);opacity:0.6} 50%{transform:translateX(18%) scaleY(1.4);opacity:0.9} }
        @keyframes _aurora_b { 0%,100%{transform:translateX(12%) scaleY(1);opacity:0.5} 50%{transform:translateX(-12%) scaleY(1.5);opacity:0.75} }
        @keyframes _logo_in { 0%{transform:scale(0.18) rotate(-12deg);opacity:0;filter:blur(28px) brightness(0.1)} 55%{transform:scale(1.13) rotate(3deg);opacity:1;filter:blur(0) brightness(2.2)} 78%{transform:scale(0.97) rotate(-1deg);opacity:1;filter:blur(0) brightness(1.1)} 100%{transform:scale(1) rotate(0deg);opacity:1;filter:blur(0) brightness(1)} }
        @keyframes _logo_glow { ${T.logoGlowKeyframe} }
        @keyframes _ring1 { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes _ring2 { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(-360deg)} }
        @keyframes _ring3 { from{transform:translate(-50%,-50%) rotate(20deg)} to{transform:translate(-50%,-50%) rotate(380deg)} }
        @keyframes _burst1 { 0%{transform:translate(-50%,-50%) scale(0.3);opacity:0.9} 100%{transform:translate(-50%,-50%) scale(3.8);opacity:0} }
        @keyframes _burst2 { 0%{transform:translate(-50%,-50%) scale(0.3);opacity:0.65} 100%{transform:translate(-50%,-50%) scale(3.0);opacity:0} }
        @keyframes _orbit { from{transform:rotate(var(--oa)) translateX(var(--od)) rotate(calc(-1*var(--oa)))} to{transform:rotate(calc(var(--oa)+360deg)) translateX(var(--od)) rotate(calc(-360deg - var(--oa)))} }
        @keyframes _sweep { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes _pulse_ring { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.12} 50%{transform:translate(-50%,-50%) scale(1.06);opacity:0.28} }
        @keyframes _name_in { from{opacity:0;transform:translateY(22px);filter:blur(8px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
        @keyframes _dev_in { from{opacity:0;transform:translateY(14px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes _shimmer { from{background-position:300% center} to{background-position:-300% center} }
        @keyframes _msg_in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _msg_out { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-8px)} }
        @keyframes _bar_glow { ${T.barGlowKf} }
        @keyframes _corner_in { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes _dot_bounce { 0%,100%{transform:translateY(0);opacity:0.5} 50%{transform:translateY(-6px);opacity:1} }
        @keyframes _radial_pulse { 0%,100%{opacity:0.10;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.22;transform:translate(-50%,-50%) scale(1.09)} }
        @keyframes _badge_in { from{opacity:0;transform:translateY(-10px) scale(0.85)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes _grid_move { from{transform:translateY(0)} to{transform:translateY(40px)} }
      `}</style>

      {/* ─── ULTRA: faint grid lines ─── */}
      {tier === 'ULTRA' && (
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(249,200,70,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(249,200,70,0.6) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
          animation: '_grid_move 8s linear infinite',
        }} />
      )}

      {/* ─── Stars ─── */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.r * 2, height: s.r * 2, borderRadius: '50%',
          background: tier === 'FREE' ? `rgba(14,165,233,${s.opacity})` : '#fff',
          boxShadow: `0 0 ${s.r * 4}px ${T.starColor}`,
          animation: `_twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          ['--so' as any]: s.opacity, pointerEvents: 'none', zIndex: 1,
        }} />
      ))}

      {/* ─── Shooting stars ─── */}
      {shoots.map((sh, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${sh.x}%`, top: `${sh.y}%`,
          width: 100, height: 2,
          background: T.shootColor,
          borderRadius: 999,
          transform: `rotate(${sh.angle}deg)`,
          transformOrigin: 'left center',
          animation: shootIdx === i ? '_shoot 0.75s ease-out forwards' : 'none',
          pointerEvents: 'none', zIndex: 2,
        }} />
      ))}

      {/* ─── Aurora top ─── */}
      <div style={{
        position: 'absolute', top: 0, left: '-20%', right: '-20%', height: 190,
        background: T.auroraTop, filter: 'blur(20px)',
        animation: '_aurora_t 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 1,
      }} />
      {/* ─── Aurora bottom ─── */}
      <div style={{
        position: 'absolute', bottom: 0, left: '-20%', right: '-20%', height: 165,
        background: T.auroraBot, filter: 'blur(18px)',
        animation: '_aurora_b 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ─── Radial ambient glow behind logo ─── */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: 400, height: 400, borderRadius: '50%',
        background: T.radialBehind,
        animation: '_radial_pulse 5s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ─── HUD corners ─── */}
      {phase > 0 && [
        { top: 18, left: 18, r: 0 }, { top: 18, right: 18, r: 90 },
        { bottom: 18, right: 18, r: 180 }, { bottom: 18, left: 18, r: 270 },
      ].map((c, i) => (
        <svg key={i} width="34" height="34" style={{
          position: 'absolute', ...c, transform: `rotate(${c.r}deg)`,
          animation: `_corner_in 0.5s ease ${0.25 + i * 0.07}s both`,
          pointerEvents: 'none', zIndex: 3,
        }}>
          <path d="M3 31 L3 3 L31 3" fill="none" stroke={T.cornerColor} strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="3" cy="3" r="2.5" fill={T.cornerDot}/>
        </svg>
      ))}

      {/* ─── Tier badge (top-center) ─── */}
      {phase === 2 && (
        <div style={{
          position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
          animation: '_badge_in 0.5s ease 0.8s both',
          zIndex: 10, pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
            color: T.badgeColor,
            padding: '2px 10px', borderRadius: 999,
            border: `1px solid ${T.badgeColor}44`,
            background: `${T.badgeColor}10`,
          }}>{T.badge}</span>
        </div>
      )}

      {/* ─── Burst halos ─── */}
      {phase > 0 && <>
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: logoSize + 12, height: logoSize + 12, borderRadius: '50%',
          border: `2px solid ${T.burstBorder1}`,
          animation: '_burst1 1.2s ease-out 0.1s forwards',
          pointerEvents: 'none', zIndex: 4,
        }} />
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: logoSize + 12, height: logoSize + 12, borderRadius: '50%',
          border: `1.5px solid ${T.burstBorder2}`,
          animation: '_burst2 1.5s ease-out 0.25s forwards',
          pointerEvents: 'none', zIndex: 4,
        }} />
      </>}

      {/* ─── Spinning arc rings ─── */}
      {phase === 2 && <>
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: R1, height: R1, borderRadius: '50%',
          background: T.ring1,
          WebkitMask: ringMask(R1), mask: ringMask(R1),
          animation: '_ring1 2.8s linear infinite',
          pointerEvents: 'none', zIndex: 4,
        }} />
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: R2, height: R2, borderRadius: '50%',
          background: T.ring2,
          WebkitMask: ringMask(R2), mask: ringMask(R2),
          animation: '_ring2 4.6s linear infinite',
          pointerEvents: 'none', zIndex: 4,
        }} />
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: R3, height: R3, borderRadius: '50%',
          background: T.ring3,
          WebkitMask: ringMask(R3), mask: ringMask(R3),
          animation: '_ring3 6.8s linear infinite',
          pointerEvents: 'none', zIndex: 4,
        }} />

        {/* Radar sweep */}
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: R2, height: R2, borderRadius: '50%',
          background: T.sweep,
          WebkitMask: `radial-gradient(circle,transparent ${R2 / 2 - 46}px,black ${R2 / 2 - 1}px)`,
          mask: `radial-gradient(circle,transparent ${R2 / 2 - 46}px,black ${R2 / 2 - 1}px)`,
          animation: '_sweep 3.5s linear infinite',
          pointerEvents: 'none', zIndex: 4,
        }} />

        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          width: R3 + 38, height: R3 + 38, borderRadius: '50%',
          border: `1px solid ${T.burstBorder1}28`,
          animation: '_pulse_ring 4s ease-in-out infinite 1s',
          pointerEvents: 'none', zIndex: 4,
        }} />
      </>}

      {/* ─── Orbiting dots ─── */}
      {phase === 2 && [
        { angle: 0,   dist: logoSize / 2 + 28, dur: 2.8 },
        { angle: 120, dist: logoSize / 2 + 45, dur: 4.5 },
        { angle: 240, dist: logoSize / 2 + 63, dur: 6.6 },
      ].map((d, i) => (
        <div key={i} style={{
          position: 'absolute', top: 'calc(38% - 6px)', left: 'calc(50% - 6px)',
          width: 12, height: 12, borderRadius: '50%',
          background: T.orbitColors[i], boxShadow: `0 0 10px 4px ${T.orbitShadows[i]}`,
          animation: `_orbit ${d.dur}s linear infinite`,
          ['--oa' as any]: `${d.angle}deg`, ['--od' as any]: `${d.dist}px`,
          pointerEvents: 'none', zIndex: 5,
        }} />
      ))}

      {/* ─── CENTER CONTENT ─── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginTop: 10,
      }}>
        {/* Logo */}
        <div style={{ animation: phase > 0 ? '_logo_in 0.85s cubic-bezier(0.34,1.56,0.64,1) both' : 'none', opacity: phase === 0 ? 0 : undefined }}>
          <div style={{ animation: phase === 2 ? '_logo_glow 3.5s ease-in-out infinite 0.5s' : 'none', filter: T.logoGlowStatic }}>
            {logoEnabled && logoUrl ? (
              <img src={logoUrl} alt={appName} draggable={false}
                onError={e => { const t = e.currentTarget as HTMLImageElement; if (!t.src.includes('/splash-logo.png')) t.src = '/splash-logo.png'; }}
                style={{ width: logoSize, height: logoSize, maxWidth: '68vw', objectFit: 'contain', borderRadius: 24, display: 'block' }}
              />
            ) : (
              <h1 style={{
                fontSize: appNameSize, fontWeight: 900, margin: 0,
                background: T.nameGrad, backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                animation: '_shimmer 3s linear infinite', ...fontStyle, ...lsStyle,
              }}>{appName}</h1>
            )}
          </div>
        </div>

        {/* Developer credit */}
        {phase === 2 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: '_dev_in 0.65s cubic-bezier(0.34,1.3,0.64,1) 0.3s both' }}>
            <div style={{ width: 52, height: 1, marginBottom: 8, background: T.separatorGrad }} />
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.devByColor, display: 'block', marginBottom: 3 }}>Developed by</span>
            <span style={{
              fontSize: 18, fontWeight: 800, letterSpacing: '0.05em',
              background: T.devGrad, backgroundSize: '250% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: '_shimmer 3.5s linear infinite', display: 'block',
            }}>{developerName}</span>
          </div>
        )}

        {/* App name */}
        {phase === 2 && (
          <div style={{ marginTop: 18, textAlign: 'center', animation: '_name_in 0.6s ease 0.45s both' }}>
            <p style={{
              margin: 0, fontSize: Math.min(appNameSize * 0.55, 22), fontWeight: 900, letterSpacing: '0.06em',
              background: T.nameGrad, backgroundSize: '280% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: '_shimmer 4.5s linear infinite 0.3s',
              ...fontStyle, ...lsStyle,
            }}>{appName}</p>
            {appTagline ? (
              <p style={{ margin: '5px 0 0', fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.taglineColor }}>{appTagline}</p>
            ) : null}
          </div>
        )}

        {/* Rotating message */}
        {phase === 2 && (
          <div style={{ marginTop: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minWidth: 240 }}>
            <p style={{
              margin: 0, fontSize: 12, fontWeight: 600,
              color: T.msgColor, textAlign: 'center',
              animation: msgVisible ? '_msg_in 0.4s ease both' : '_msg_out 0.35s ease both',
            }}>{MESSAGES[msgIndex]}</p>
          </div>
        )}

        {/* Bouncing dots */}
        {phase === 2 && (
          <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: T.dotColors[i], boxShadow: `0 0 8px ${T.dotShadows[i]}`,
                animation: `_dot_bounce 0.9s ease-in-out ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* ─── BOTTOM PROGRESS ─── */}
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, padding: '0 28px', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.taglineColor }}>Loading</span>
          <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'monospace', color: T.percentColor }}>{progress}%</span>
        </div>

        {/* Bar */}
        <div style={{ width: '100%', height: 4, background: tier === 'FREE' ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: T.barGrad, borderRadius: 999,
            transition: 'width 80ms linear',
            animation: '_bar_glow 2.2s ease-in-out infinite',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.38) 50%,transparent 100%)',
              backgroundSize: '60% 100%', animation: '_shimmer 1.6s linear infinite', borderRadius: 999,
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <span style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, color: T.devByColor, letterSpacing: '0.03em' }}>v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};
