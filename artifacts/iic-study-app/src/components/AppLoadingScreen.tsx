// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { APP_VERSION } from '../constants';
import { getSplashFontById, ensureGoogleFontLoaded } from '../utils/splashFonts';
import { Cpu, Terminal, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface AppLoadingScreenProps {
  onComplete: () => void;
  isPremium?: boolean;
  subscriptionLevel?: 'FREE' | 'BASIC' | 'ULTRA';
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete, subscriptionLevel = 'FREE' }) => {
  const [progress, setProgress] = useState(0);
  const [logoTapped, setLogoTapped] = useState(false);

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
      return Number.isFinite(raw) && raw > 0 ? Math.min(120, Math.max(24, raw)) : 32;
    } catch { return 32; }
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
      const size = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(260, Math.max(60, rawSize)) : 75;
      return { enabled, url, size };
    } catch { return { enabled: true, url: '/splash-logo.png', size: 75 }; }
  });

  useEffect(() => {
    if (activeFont.gfontParam) ensureGoogleFontLoaded(activeFont.gfontParam);
  }, [activeFont.gfontParam]);

  // ── 2X Fast Animated Bubble Sort Sequence ──────────────────────────────────
  useEffect(() => {
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
  }, [appName]);

  const handleLogoTap = () => {
    if (logoTapped) return;
    try { if (navigator.vibrate) navigator.vibrate(40); } catch {}
    setLogoTapped(true);
    setTimeout(() => setLogoTapped(false), 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030611] text-white overflow-hidden w-full h-full px-4 py-4 select-none">
      
      {/* ── 1. BACKGROUND FUTURISTIC ENVIRONMENT ── */}
      {/* Deep Cyber Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))]" />

      {/* Rotating Radar / Cyber Scan Beam */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-sky-500/10 pointer-events-none animate-[spin_20s_linear_infinite]">
        <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(56,189,248,0.12)_360deg)]" />
      </div>

      {/* Cyber Grid Lines (Top & Bottom Perspective) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70d_1px,transparent_1px),linear-gradient(to_bottom,#0284c70d_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/6 left-1/4 w-72 h-72 bg-cyan-600/15 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/6 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── 2. GLASSMORPHIC HUD CARD ── */}
      <div className="w-full max-w-[365px] flex flex-col items-center relative z-10 p-5 rounded-[2.2rem] bg-slate-950/70 border border-sky-500/25 shadow-[0_0_60px_rgba(2,132,199,0.25)] backdrop-blur-2xl">
        
        {/* Futuristic Target Corner Crosshairs */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 rounded-br-sm pointer-events-none" />

        {/* ── Header Branding ── */}
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

        {/* ── 3D Visualizer Hologram Stage ── */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full h-44 bg-[#050915]/95 border border-cyan-500/30 rounded-2xl relative overflow-hidden flex flex-col justify-end p-3.5 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]">
            
            {/* Tech Scan Line Moving Down */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-12 w-full animate-[bounce_3s_linear_infinite] pointer-events-none opacity-40" />

            {/* Subtle Grid Inside Box */}
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

        {/* ── Progress Bar & Footer Details ── */}
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
