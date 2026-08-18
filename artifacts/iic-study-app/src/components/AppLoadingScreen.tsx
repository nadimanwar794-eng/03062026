// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, HelpCircle, Video, Headphones, BrainCircuit, BarChart2, WifiOff, Zap,
  Cpu, Terminal, ShieldCheck, Sparkles 
} from 'lucide-react';
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

const THEME_STYLES: Record<ThemeVariant, {
  bg: string; text: string; subtext: string; boxBg: string; boxBorder: string;
  trackBg: string; bar: string; badge: string;
}> = {
  black: {
    bg: 'bg-black',
    text: 'text-white',
    subtext: 'text-gray-500',
    boxBg: 'bg-gray-900',
    boxBorder: 'border-gray-800',
    trackBg: 'bg-gray-900',
    bar: 'from-indigo-500 via-violet-500 to-purple-600',
    badge: 'text-gray-500',
  },
  blue: {
    bg: 'bg-[#000000]',
    text: 'text-white',
    subtext: 'text-blue-400/70',
    boxBg: 'bg-blue-950/60',
    boxBorder: 'border-blue-900/60',
    trackBg: 'bg-blue-950',
    bar: 'from-blue-500 via-indigo-500 to-purple-500',
    badge: 'text-blue-400/60',
  },
  light: {
    bg: 'bg-white',
    text: 'text-slate-900',
    subtext: 'text-slate-500',
    boxBg: 'bg-slate-50',
    boxBorder: 'border-slate-200',
    trackBg: 'bg-slate-200',
    bar: 'from-blue-500 via-indigo-500 to-purple-500',
    badge: 'text-slate-400',
  },
};

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete, isPremium = false, subscriptionLevel = 'FREE' }) => {
  // ── Alternate Mode Switcher ────────────────────────────────────────────────
  const [variant] = useState<'FEATURE_CARDS' | 'BUBBLE_SORT'>(() => {
    try {
      const last = localStorage.getItem('nst_last_loading_variant');
      const next = last === 'FEATURE_CARDS' ? 'BUBBLE_SORT' : 'FEATURE_CARDS';
      localStorage.setItem('nst_last_loading_variant', next);
      return next;
    } catch {
      return 'FEATURE_CARDS';
    }
  });

  const [progress, setProgress] = useState(0);
  const [logoTapped, setLogoTapped] = useState(false);
  const [themeVariant] = useState<ThemeVariant>(detectTheme);

  // Feature Cards States
  const [stepPhase1, setStepPhase1] = useState(-1);
  const [stepPhase2, setStepPhase2] = useState(-1);

  // Bubble Sort States
  const [bars, setBars] = useState<number[]>([3, 8, 2, 7, 5, 4, 1, 6]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [craneX, setCraneX] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string>('Booting Neural Kernel...');
  const [activeCodeLine, setActiveCodeLine] = useState<number>(1);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const [appName] = useState(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const o = s ? JSON.parse(s) : null;
      return o?.appShortName || o?.appName || 'IIC';
    } catch { return 'IIC'; }
  });

  const developerName = 'Nadim Anwar';

  const [showFooter] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const o = s ? JSON.parse(s) : null;
      return o?.showFooter !== false;
    } catch { return true; }
  });

  const [appNameSize] = useState<number>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const o = s ? JSON.parse(s) : null;
      const raw = Number(o?.appShortNameSize);
      return Number.isFinite(raw) && raw > 0 ? Math.min(120, Math.max(24, raw)) : (variant === 'FEATURE_CARDS' ? 30 : 32);
    } catch { return variant === 'FEATURE_CARDS' ? 30 : 32; }
  });

  const [splashFontId] = useState<string>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const o = s ? JSON.parse(s) : null;
      return o?.splashFontId || localStorage.getItem('nst_splash_font_id') || 'default';
    } catch { return 'default'; }
  });
  const activeFont = getSplashFontById(splashFontId);

  const [splashLogo] = useState<{ enabled: boolean; url: string; size: number }>(() => {
    try {
      const s = localStorage.getItem('nst_system_settings');
      const o = s ? JSON.parse(s) : null;
      const enabled = o?.splashLogoEnabled !== false;
      const url = (o?.splashLogoUrl as string) || '/splash-logo.png';
      const rawSize = Number(o?.splashLogoSize);
      const defaultSize = variant === 'FEATURE_CARDS' ? 140 : 75;
      const size = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(260, Math.max(60, rawSize)) : defaultSize;
      return { enabled, url, size };
    } catch { return { enabled: true, url: '/splash-logo.png', size: variant === 'FEATURE_CARDS' ? 140 : 75 }; }
  });

  useEffect(() => {
    if (activeFont.gfontParam) ensureGoogleFontLoaded(activeFont.gfontParam);
  }, [activeFont.gfontParam]);

  const handleLogoTap = () => {
    if (logoTapped) return;
    try { if (navigator.vibrate) navigator.vibrate(40); } catch {}
    setLogoTapped(true);
    setTimeout(() => setLogoTapped(false), 600);
  };

  // ── SEQUENCE 1: FEATURE CARDS PROGRESS ────────────────────────────────────
  useEffect(() => {
    if (variant !== 'FEATURE_CARDS') return;

    const duration = 2000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.floor((currentStep / steps) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress < 50) {
        if (currentProgress >= 10) setStepPhase1(0);
        if (currentProgress >= 20) setStepPhase1(1);
        if (currentProgress >= 30) setStepPhase1(2);
        if (currentProgress >= 40) setStepPhase1(3);
      }
      if (currentProgress >= 50) {
        setStepPhase1(-1);
        if (currentProgress >= 50) setStepPhase2(0);
        if (currentProgress >= 60) setStepPhase2(1);
        if (currentProgress >= 70) setStepPhase2(2);
        if (currentProgress >= 80) setStepPhase2(3);
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        try {
          const utterance = new SpeechSynthesisUtterance('Welcome to ' + appName);
          utterance.lang = 'en-US';
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } catch {}
        setTimeout(() => onCompleteRef.current(), 300);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [variant, appName]);

  // ── SEQUENCE 2: 2X BUBBLE SORT ANIMATION ──────────────────────────────────
  useEffect(() => {
    if (variant !== 'BUBBLE_SORT') return;

    let isCancelled = false;
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runBubbleSort = async () => {
      let currentArr = [3, 8, 2, 7, 5, 4, 1, 6];
      const n = currentArr.length;
      const totalSteps = (n * (n - 1)) / 2;
      let completedSteps = 0;

      await sleep(200);

      for (let p = 0; p < n - 1; p++) {
        let swapped = false;
        setActiveCodeLine(3);
        await sleep(100);

        for (let i = 0; i < n - 1 - p; i++) {
          if (isCancelled) return;

          setCraneX(i * 35);
          setActiveIndices([i, i + 1]);
          setActiveCodeLine(6);
          setStatusMsg(`Comparing: arr[${i}] (${currentArr[i]}) > arr[${i + 1}] (${currentArr[i + 1]})`);
          await sleep(180);

          if (currentArr[i] > currentArr[i + 1]) {
            setActiveCodeLine(7);
            setStatusMsg(`Swapping: [${currentArr[i]}] ⇄ [${currentArr[i + 1]}]`);
            await sleep(90);

            const temp = currentArr[i];
            currentArr[i] = currentArr[i + 1];
            currentArr[i + 1] = temp;

            setBars([...currentArr]);
            swapped = true;
            setActiveCodeLine(8);
            await sleep(190);
          }

          completedSteps++;
          setProgress(Math.min(Math.floor((completedSteps / totalSteps) * 96), 96));
          await sleep(75);
        }

        setSortedIndices(prev => [...prev, n - 1 - p]);
        if (!swapped) break;
      }

      setSortedIndices([0, 1, 2, 3, 4, 5, 6, 7]);
      setActiveIndices([]);
      setActiveCodeLine(10);
      setStatusMsg('✦ Neural Engine Synced & Ready');
      setProgress(100);

      try {
        const utterance = new SpeechSynthesisUtterance('Welcome to ' + appName);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {}

      await sleep(500);
      if (!isCancelled) onCompleteRef.current();
    };

    runBubbleSort();

    return () => { isCancelled = true; };
  }, [variant, appName]);

  // ════════════════════════════════════════════════════════════════════════════
  // 1. FEATURE CARDS RENDER
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === 'FEATURE_CARDS') {
    const t = THEME_STYLES.black;
    const iconColor1 = 'text-blue-400';
    const iconColor2 = 'text-purple-400';
    const iconColor3 = 'text-rose-400';
    const iconColor4 = 'text-emerald-400';
    const iconColor5 = 'text-amber-400';
    const iconColor6 = 'text-indigo-400';
    const iconColor7 = 'text-teal-400';
    const iconColor8 = 'text-orange-400';

    return (
      <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white overflow-hidden w-full mx-auto`}>
        <div className="relative z-10 flex flex-col items-center w-full px-8">
          <button
            type="button"
            onClick={handleLogoTap}
            className="relative overflow-hidden mb-12 text-center animate-in slide-in-from-bottom-4 duration-700 fade-in focus:outline-none select-none rounded-2xl"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {splashLogo.enabled && splashLogo.url ? (
              <img
                src={splashLogo.url}
                alt={appName}
                draggable={false}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src.indexOf('/splash-logo.png') === -1) img.src = '/splash-logo.png';
                }}
                className={`mb-2 mx-auto object-contain transition-transform duration-300 ease-out drop-shadow-xl ${logoTapped ? 'scale-[2.2]' : 'scale-100'}`}
                style={{ width: `${splashLogo.size}px`, height: `${splashLogo.size}px`, maxWidth: '70vw' }}
              />
            ) : (
              <h1
                className={`font-black tracking-tight mb-2 uppercase text-center leading-tight transition-transform duration-300 ease-out bg-clip-text text-transparent ${
                  logoTapped ? 'scale-[2.2]' : 'scale-100'
                } ${
                  subscriptionLevel === 'ULTRA'
                    ? 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500'
                    : subscriptionLevel === 'BASIC'
                      ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700'
                      : themeVariant === 'light'
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-600'
                        : 'bg-gradient-to-r from-sky-400 to-cyan-500'
                }`}
                style={{
                  fontSize: `${appNameSize}px`,
                  ...(activeFont.family ? { fontFamily: activeFont.family } : {}),
                  ...(activeFont.letterSpacing ? { letterSpacing: activeFont.letterSpacing } : {}),
                }}
              >
                {appName}
              </h1>
            )}
            <p className={`text-xs font-bold tracking-widest ${t.subtext} uppercase mt-2 transition-opacity duration-300 ${logoTapped ? 'opacity-0' : 'opacity-100'}`}>
              Loading your experience...
            </p>
          </button>

          {/* Feature boxes */}
          <div className="relative w-full h-64 perspective-1000 mb-4">
            <div className={`absolute inset-0 grid grid-cols-2 gap-4 w-full transition-all duration-500 ${progress < 50 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase1 >= 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <BookOpen size={32} className={`${iconColor1} mb-3`} />
                <span className={`font-bold tracking-wide ${t.text}`}>Notes</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase1 >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <HelpCircle size={32} className={`${iconColor2} mb-3`} />
                <span className={`font-bold tracking-wide ${t.text}`}>MCQ</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase1 >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <Video size={32} className={`${iconColor3} mb-3`} />
                <span className={`font-bold tracking-wide ${t.text}`}>Video</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase1 >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <Headphones size={32} className={`${iconColor4} mb-3`} />
                <span className={`font-bold tracking-wide ${t.text}`}>Audio</span>
              </div>
            </div>

            <div className={`absolute inset-0 grid grid-cols-2 gap-4 w-full transition-all duration-500 ${progress >= 50 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase2 >= 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <BrainCircuit size={32} className={`${iconColor5} mb-3`} />
                <span className={`font-bold tracking-wide text-center leading-tight ${t.text}`}>Smart<br />Revision</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase2 >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <BarChart2 size={32} className={`${iconColor6} mb-3`} />
                <span className={`font-bold tracking-wide text-center leading-tight ${t.text}`}>Leader<br />board</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase2 >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <WifiOff size={32} className={`${iconColor7} mb-3`} />
                <span className={`font-bold tracking-wide text-center leading-tight ${t.text}`}>Offline<br />Mode</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${t.boxBg} border ${t.boxBorder} shadow-lg transition-all duration-500 transform ${stepPhase2 >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <Zap size={32} className={`${iconColor8} mb-3`} />
                <span className={`font-bold tracking-wide text-center leading-tight ${t.text}`}>Level<br />System</span>
              </div>
            </div>
          </div>

          {/* Progress section */}
          <div className="w-full flex flex-col items-center mt-8">
            <div className={`w-full h-[5px] ${t.trackBg} rounded-full overflow-hidden mb-3 shadow-inner`} style={{ position: 'relative' }}>
              <div
                className={`h-full bg-gradient-to-r ${t.bar} rounded-full`}
                style={{ width: `${progress}%`, transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)', position: 'relative', overflow: 'hidden' }}
              >
                <span
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                    animation: 'shimmer 1.4s infinite',
                    backgroundSize: '200% 100%',
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className={`text-[11px] font-semibold font-mono ${t.badge} opacity-70`}>
                {progress}%
              </span>
              {showFooter && (
                <>
                  <span className={`${t.badge} opacity-25 text-[10px]`}>·</span>
                  <span
                    className={`text-[10px] ${t.badge}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.05)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    <span style={{ opacity: 0.45, fontWeight: 400, fontSize: '9px' }}>Developed by</span>
                    <span style={{ opacity: 0.85, fontWeight: 600, fontSize: '10px' }}>{developerName}</span>
                  </span>
                </>
              )}
              <span className={`text-[11px] ${t.badge} font-mono opacity-50 tracking-widest`}>
                v{APP_VERSION}
              </span>
            </div>
          </div>

          <style>{`
            @keyframes shimmer {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. BUBBLE SORT RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030611] text-white overflow-hidden w-full h-full px-4 py-4 select-none">
      
      {/* Deep Cyber Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))]" />

      {/* Rotating Radar / Cyber Scan Beam */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-sky-500/10 pointer-events-none animate-[spin_20s_linear_infinite]">
        <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(56,189,248,0.12)_360deg)]" />
      </div>

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70d_1px,transparent_1px),linear-gradient(to_bottom,#0284c70d_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/6 left-1/4 w-72 h-72 bg-cyan-600/15 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/6 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Glassmorphic HUD Card */}
      <div className="w-full max-w-[365px] flex flex-col items-center relative z-10 p-5 rounded-[2.2rem] bg-slate-950/70 border border-sky-500/25 shadow-[0_0_60px_rgba(2,132,199,0.25)] backdrop-blur-2xl">
        
        {/* Futuristic Target Corner Crosshairs */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 rounded-br-sm pointer-events-none" />

        {/* Header Branding */}
        <div className="flex flex-col items-center w-full mb-3">
          <button
            type="button"
            onClick={handleLogoTap}
            className="relative overflow-hidden mb-1 text-center focus:outline-none select-none rounded-2xl"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {splashLogo.enabled && splashLogo.url ? (
              <img
                src={splashLogo.url}
                alt={appName}
                draggable={false}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src.indexOf('/splash-logo.png') === -1) img.src = '/splash-logo.png';
                }}
                className={`mx-auto object-contain transition-transform duration-300 ease-out drop-shadow-[0_0_25px_rgba(56,189,248,0.5)] ${logoTapped ? 'scale-[1.25]' : 'scale-100'}`}
                style={{ width: `${splashLogo.size}px`, height: `${splashLogo.size}px` }}
              />
            ) : (
              <h1
                className={`font-black tracking-tight uppercase text-center leading-none transition-transform duration-300 ease-out bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,189,248,0.6)] ${
                  logoTapped ? 'scale-[1.15]' : 'scale-100'
                } bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400`}
                style={{
                  fontSize: `${appNameSize}px`,
                  ...(activeFont.family ? { fontFamily: activeFont.family } : {}),
                  ...(activeFont.letterSpacing ? { letterSpacing: activeFont.letterSpacing } : {}),
                }}
              >
                {appName}
              </h1>
            )}
          </button>

          {/* Badges Bar */}
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[9px] font-mono tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Cpu size={10} className="animate-pulse text-cyan-400" /> BUBBLE SORT
            </span>
            <span className="text-[9px] font-mono tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-500/40">
              O(n²)
            </span>
          </div>
        </div>

        {/* 3D Visualizer Hologram Stage */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full h-44 bg-[#050915]/95 border border-cyan-500/30 rounded-2xl relative overflow-hidden flex flex-col justify-end p-3.5 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-12 w-full animate-[bounce_3s_linear_infinite] pointer-events-none opacity-40" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e910_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e910_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

            {/* Crane Rail & Claw Head */}
            <div className="absolute top-4 left-3 right-3 h-1.5 bg-slate-800/90 rounded-full border border-slate-700/80">
              <div
                className="absolute top-[-5px] w-10 h-4 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-md shadow-[0_0_15px_#38bdf8] transition-all duration-200 ease-out flex justify-center items-end"
                style={{ transform: `translateX(${craneX}px)` }}
              >
                <div className="w-1.5 h-6 bg-gradient-to-b from-sky-300 to-cyan-500 rounded-b shadow-[0_0_10px_#38bdf8]" />
              </div>
            </div>

            {/* Animated Sorting Bars */}
            <div className="flex items-end justify-center gap-2 h-28 w-full relative z-10">
              {bars.map((val, idx) => {
                const isActive = activeIndices.includes(idx);
                const isSorted = sortedIndices.includes(idx);

                return (
                  <div
                    key={idx}
                    className={`w-[26px] rounded-t-lg flex flex-col items-center justify-start pt-1 font-mono font-black text-[11px] transition-all duration-200 ${
                      isSorted
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-300 text-slate-950 shadow-[0_0_18px_rgba(45,212,191,0.7)] border-t border-teal-100'
                        : isActive
                        ? 'bg-gradient-to-t from-amber-500 to-yellow-200 text-slate-950 -translate-y-3 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.9)] border-t border-white'
                        : 'bg-gradient-to-t from-slate-800 to-slate-700 text-slate-300 border-t border-slate-600 shadow-md'
                    }`}
                    style={{ height: `${val * 12 + 14}px` }}
                  >
                    <span>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Console Status */}
          <div className="flex items-center gap-2 mt-2.5 mb-1.5 h-5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-[11px] font-mono text-cyan-300 tracking-tight truncate max-w-[280px]">
              {statusMsg}
            </p>
          </div>

          {/* Code Tracker Window */}
          <div className="w-full bg-[#030712] border border-cyan-900/40 rounded-xl p-2.5 font-mono text-[10px] text-slate-400 leading-relaxed shadow-inner">
            <div className={`px-2 py-0.5 rounded transition-all ${activeCodeLine === 3 ? 'bg-sky-500/25 text-sky-300 font-bold border-l-2 border-sky-400' : ''}`}>
              for p in range(n - 1):
            </div>
            <div className={`px-2 py-0.5 rounded transition-all ${activeCodeLine === 6 ? 'bg-amber-500/25 text-amber-300 font-bold border-l-2 border-amber-400' : ''}`}>
              &nbsp;&nbsp;if a[i] &gt; a[i + 1]:
            </div>
            <div className={`px-2 py-0.5 rounded transition-all ${activeCodeLine === 7 ? 'bg-cyan-500/25 text-cyan-300 font-bold border-l-2 border-cyan-400' : ''}`}>
              &nbsp;&nbsp;&nbsp;&nbsp;a[i], a[i+1] = a[i+1], a[i]
            </div>
            <div className={`px-2 py-0.5 rounded transition-all ${activeCodeLine === 10 ? 'bg-emerald-500/25 text-emerald-300 font-bold border-l-2 border-emerald-400' : ''}`}>
              &nbsp;&nbsp;return array_sorted
            </div>
          </div>
        </div>

        {/* Progress Bar & Footer */}
        <div className="w-full flex flex-col items-center mt-3.5">
          <div className="w-full h-2 bg-slate-900 border border-cyan-500/20 rounded-full overflow-hidden mb-2.5 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 rounded-full transition-all duration-150 shadow-[0_0_14px_rgba(56,189,248,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono px-1">
            <span className="font-bold text-cyan-400">{progress}%</span>
            {showFooter && (
              <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-300">
                Dev: {developerName}
              </span>
            )}
            <span className="opacity-70">v{APP_VERSION}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

