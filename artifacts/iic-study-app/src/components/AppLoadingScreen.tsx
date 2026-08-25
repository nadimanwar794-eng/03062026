// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Video, 
  Headphones, 
  BrainCircuit, 
  BarChart2, 
  WifiOff, 
  Zap, 
  Check, 
  Terminal,
  FileCheck,
  TrendingUp,
  CalendarCheck,
  RotateCcw
} from 'lucide-react';
import { APP_VERSION } from '../constants';

interface AppLoadingScreenProps {
  onComplete: () => void;
  isPremium?: boolean;
  subscriptionLevel?: 'FREE' | 'BASIC' | 'ULTRA';
}

interface BlockItem {
  id: number;
  val: number;
  slot: number;
  isLifted: boolean;
  isSorted: boolean;
  isComparing: boolean;
}

const STORAGE_KEY = 'nst_splash_style_idx';

const PYTHON_CODE_ROWS = [
  { num: 1, kw: 'def', rest: ' bubble_sort(a):' },
  { num: 2, kw: '    n =', rest: ' len(a)' },
  { num: 3, kw: '    for', rest: ' p in range(n - 1):' },
  { num: 4, kw: '        swapped =', rest: ' False' },
  { num: 5, kw: '        for', rest: ' i in range(n - 1 - p):' },
  { num: 6, kw: '            if', rest: ' a[i] > a[i + 1]:' },
  { num: 7, kw: '                a[i], a[i + 1] =', rest: ' a[i + 1], a[i]' },
  { num: 8, kw: '                swapped =', rest: ' True' },
  { num: 9, kw: '        if not', rest: ' swapped:' },
  { num: 10, kw: '            break', rest: '' },
];

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ 
  onComplete, 
  isPremium = false, 
  subscriptionLevel = 'FREE' 
}) => {
  // ── Alternate Style Selection (1, 2, 3, 4, 5) ──
  const [styleVariant] = useState<number>(() => {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '1', 10);
      const current = isNaN(saved) || saved < 1 || saved > 5 ? 1 : saved;
      const next = current === 5 ? 1 : current + 1;
      localStorage.setItem(STORAGE_KEY, String(next));
      return current;
    } catch {
      return 1;
    }
  });

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Loading Your Learning Journey...');
  const [stepPhase1, setStepPhase1] = useState(-1);
  const [stepPhase2, setStepPhase2] = useState(-1);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // ── 6 Orbit Nodes Config (For Variant 5) ──
  const orbitNodes = [
    { id: 'notes', label: 'Smart Notes', icon: BookOpen, color: '#38bdf8', angleDeg: 270 },
    { id: 'mcq', label: 'MCQ Practice', icon: FileCheck, color: '#60a5fa', angleDeg: 330 },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, color: '#34d399', angleDeg: 30 },
    { id: 'routine', label: 'Daily Routine', icon: CalendarCheck, color: '#f472b6', angleDeg: 90 },
    { id: 'revision', label: 'Revision Hub', icon: RotateCcw, color: '#fbbf24', angleDeg: 150 },
    { id: 'ai', label: 'AI Study Assistant', icon: BrainCircuit, color: '#c084fc', angleDeg: 210 },
  ];

  // ── Bubble Sort & Crane Engine States (for Variant 2 & 4) ──
  const [blocks, setBlocks] = useState<BlockItem[]>([
    { id: 0, val: 3, slot: 0, isLifted: false, isSorted: false, isComparing: false },
    { id: 1, val: 2, slot: 1, isLifted: false, isSorted: false, isComparing: false },
    { id: 2, val: 7, slot: 2, isLifted: false, isSorted: false, isComparing: false },
    { id: 3, val: 5, slot: 3, isLifted: false, isSorted: false, isComparing: false },
    { id: 4, val: 8, slot: 4, isLifted: false, isSorted: false, isComparing: false },
    { id: 5, val: 4, slot: 5, isLifted: false, isSorted: false, isComparing: false },
    { id: 6, val: 1, slot: 6, isLifted: false, isSorted: false, isComparing: false },
    { id: 7, val: 6, slot: 7, isLifted: false, isSorted: false, isComparing: false },
  ]);

  const [craneSlot, setCraneSlot] = useState<number>(0);
  const [wireHeight, setWireHeight] = useState<number>(10);
  const [isClawClosed, setIsClawClosed] = useState<boolean>(false);
  const [actionPrompt, setActionPrompt] = useState<string>('a[0] > a[1] ?');
  const [activeCodeLine, setActiveCodeLine] = useState<number>(6);

  const developerName = 'Nadim Anwar';
  const isSortMode = styleVariant === 2 || styleVariant === 4;

  const statusMilestones = [
    { at: 0, text: 'Initializing App Modules...' },
    { at: 20, text: 'Loading Your Learning Journey...' },
    { at: 55, text: 'Syncing Study Routine & Daily Goals...' },
    { at: 80, text: 'Preparing Fast Revision Engine...' },
    { at: 96, text: 'Welcome to NSTA!' }
  ];

  // ── Engine 1: Linear Timer Progress (Variant 1, 3 & 5) ──
  useEffect(() => {
    if (isSortMode) return;

    const duration = styleVariant === 1 ? 3000 : 3800;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.floor((currentStep / steps) * 100), 100);
      setProgress(currentProgress);

      // Phase updates for 8-feature grid in Variant 1
      if (currentProgress < 50) {
        if (currentProgress >= 10) setStepPhase1(0);
        if (currentProgress >= 20) setStepPhase1(1);
        if (currentProgress >= 30) setStepPhase1(2);
        if (currentProgress >= 40) setStepPhase1(3);
      } else {
        setStepPhase1(-1);
        if (currentProgress >= 50) setStepPhase2(0);
        if (currentProgress >= 60) setStepPhase2(1);
        if (currentProgress >= 70) setStepPhase2(2);
        if (currentProgress >= 80) setStepPhase2(3);
      }

      for (let s = statusMilestones.length - 1; s >= 0; s--) {
        if (currentProgress >= statusMilestones[s].at) {
          setStatusText(statusMilestones[s].text);
          break;
        }
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => onCompleteRef.current(), 350);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [styleVariant, isSortMode]);

  // ── Engine 2: Real-time Algorithm Sort Progress (Variant 2 & 4) ──
  useEffect(() => {
    if (!isSortMode) return;
    let isCancelled = false;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const runSortEngine = async () => {
      let state = [
        { id: 0, val: 3 },
        { id: 1, val: 2 },
        { id: 2, val: 7 },
        { id: 3, val: 5 },
        { id: 4, val: 8 },
        { id: 5, val: 4 },
        { id: 6, val: 1 },
        { id: 7, val: 6 },
      ];

      const n = state.length;
      const totalComparisons = (n * (n - 1)) / 2;
      let stepsCompleted = 0;

      const syncBlocks = (overrides = {}) => {
        setBlocks(prev =>
          prev.map(b => {
            const currentSlot = state.findIndex(s => s.id === b.id);
            return {
              ...b,
              slot: currentSlot,
              ...overrides[b.id],
            };
          })
        );
      };

      for (let p = 0; p < n - 1; p++) {
        let swappedAny = false;

        for (let i = 0; i < n - 1 - p; i++) {
          if (isCancelled) return;

          const itemA = state[i];
          const itemB = state[i + 1];

          // 1. Crane arrives & compares
          setCraneSlot(i);
          setWireHeight(10);
          setIsClawClosed(false);
          setActiveCodeLine(6);
          setActionPrompt(`a[${i}] > a[${i + 1}] ?`);

          syncBlocks({
            [itemA.id]: { isComparing: true, isLifted: false },
            [itemB.id]: { isComparing: true, isLifted: false },
          });

          await sleep(75);
          if (isCancelled) return;

          // 2. Swap sequence
          if (itemA.val > itemB.val) {
            setActiveCodeLine(7);
            setActionPrompt(`swap a[${i}], a[${i + 1}]`);

            // Cable descends over Block A
            setWireHeight(58);
            await sleep(55);
            if (isCancelled) return;

            // Claws grip
            setIsClawClosed(true);
            await sleep(40);
            if (isCancelled) return;

            // Lift Block A
            setWireHeight(10);
            syncBlocks({
              [itemA.id]: { isLifted: true, isComparing: false },
              [itemB.id]: { isComparing: false },
            });
            await sleep(85);
            if (isCancelled) return;

            // Crane moves to next slot
            setCraneSlot(i + 1);

            const temp = state[i];
            state[i] = state[i + 1];
            state[i + 1] = temp;

            syncBlocks({
              [itemA.id]: { isLifted: true, isComparing: false },
              [itemB.id]: { isComparing: false, isLifted: false },
            });
            await sleep(100);
            if (isCancelled) return;

            // Cable lowers down
            setWireHeight(58);
            await sleep(55);
            if (isCancelled) return;

            // Release claw
            setIsClawClosed(false);
            syncBlocks({
              [itemA.id]: { isLifted: false, isComparing: false },
              [itemB.id]: { isComparing: false, isLifted: false },
            });
            await sleep(35);
            if (isCancelled) return;

            setWireHeight(10);
            swappedAny = true;
          } else {
            syncBlocks({
              [itemA.id]: { isComparing: false },
              [itemB.id]: { isComparing: false },
            });
            await sleep(30);
          }

          stepsCompleted++;
          const pct = Math.min(Math.floor((stepsCompleted / totalComparisons) * 98), 98);
          setProgress(pct);

          for (let s = statusMilestones.length - 1; s >= 0; s--) {
            if (pct >= statusMilestones[s].at) {
              setStatusText(statusMilestones[s].text);
              break;
            }
          }
        }

        const sortedId = state[n - 1 - p].id;
        setBlocks(prev =>
          prev.map(b => (b.id === sortedId ? { ...b, isSorted: true } : b))
        );

        if (!swappedAny) break;
      }

      // Finish state
      setBlocks(prev => prev.map(b => ({ ...b, isSorted: true, isComparing: false, isLifted: false })));
      setActionPrompt('OPTIMAL_SORT_COMPLETE ✅');
      setActiveCodeLine(10);
      setStatusText('Welcome to NSTA!');
      setCraneSlot(3.5);
      setWireHeight(10);
      setProgress(100);

      await sleep(350);
      if (!isCancelled) onCompleteRef.current();
    };

    runSortEngine();
    return () => { isCancelled = true; };
  }, [isSortMode]);

  return (
    <div 
      className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex flex-col items-center justify-between px-6 pt-9 pb-7 select-none overflow-hidden font-sans"
      style={{
        background: 'radial-gradient(circle at 50% 18%, #1e1b4b 0%, #0c1033 40%, #030717 100%)',
      }}
    >
      <style>{`
        @keyframes shineSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* Ambient Lights & Circular Background Track */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)', filter: 'blur(70px)' }}
      />
      <div 
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, transparent 70%)', filter: 'blur(70px)' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-sky-400/10 pointer-events-none"
      />

      {/* Academic Background Watermarks */}
      <svg className="absolute top-[8%] left-[8%] text-white/[0.04] pointer-events-none" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
      <svg className="absolute top-[19%] left-[10%] text-white/[0.04] pointer-events-none" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      <svg className="absolute top-[31%] left-[8%] text-white/[0.04] pointer-events-none" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/></svg>
      <svg className="absolute top-[8%] right-[8%] text-white/[0.04] pointer-events-none" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/></svg>
      <svg className="absolute top-[19%] right-[10%] text-white/[0.04] pointer-events-none" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
      <svg className="absolute top-[31%] right-[8%] text-white/[0.04] pointer-events-none" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>

      {/* ── TOP NSTA BRANDING & FEATURE BADGES ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="w-40 h-28 flex items-center justify-center">
          <svg className="w-full h-full drop-shadow-[0_0_24px_rgba(56,189,248,0.65)]" viewBox="0 0 220 180" fill="none">
            <defs>
              <linearGradient id="mainPageLeft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="mainPageRight" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="60%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="glowBase" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            <path d="M110 148 C65 125 25 138 12 110 C50 102 85 118 110 138 Z" fill="#0369a1" opacity="0.6" />
            <path d="M110 148 C155 125 195 138 208 110 C170 102 135 118 110 138 Z" fill="#7e22ce" opacity="0.6" />
            <path d="M110 140 C70 115 32 124 20 100 C56 94 90 108 110 128 Z" fill="url(#mainPageLeft)" />
            <path d="M110 140 C150 115 188 124 200 100 C164 94 130 108 110 128 Z" fill="url(#mainPageRight)" />
            <path d="M110 130 C75 105 45 112 35 90 C68 84 95 98 110 118 Z" fill="#e0f2fe" opacity="0.95" />
            <path d="M110 130 C145 105 175 112 185 90 C152 84 125 98 110 118 Z" fill="#f3e8ff" opacity="0.95" />
            <path d="M108 152 L112 152 L111 65 L109 65 Z" fill="url(#glowBase)" filter="drop-shadow(0 0 8px #38bdf8)" />

            <path d="M110 40 L160 58 L110 76 L60 58 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <path d="M88 68 L88 84 C88 94 132 94 132 84 L132 68 Z" fill="#0f172a" />
            <path d="M160 58 L170 82 L166 84 L156 60 Z" fill="#fbbf24" />
          </svg>
        </div>

        <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_4px_18px_rgba(255,255,255,0.25)]">
          NSTA
        </h1>

        <div className="flex items-center gap-1.5 mt-1 text-slate-100 text-sm font-bold">
          <span className="text-sky-400 text-xs">✦</span>
          <span>National Study & Tracking App</span>
          <span className="text-sky-400 text-xs">✦</span>
        </div>

        {/* 4 Badges */}
        <div className="flex items-center justify-center gap-2.5 mt-2.5 text-xs font-bold flex-wrap">
          <div className="flex items-center gap-1 text-sky-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.5 8.5 0 0 1 13 0"/></svg>
            <span>Self Study</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="flex items-center gap-1 text-emerald-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Discipline</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="flex items-center gap-1 text-amber-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <span>Routine</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="flex items-center gap-1 text-purple-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Revision</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE DYNAMIC CONTENT (STYLE 1, 2, 3, 4, 5) ── */}
      {styleVariant === 1 && (
        /* VARIANT 1: 8 Feature Grid Flip Cards */
        <div className="relative z-10 w-full max-w-[340px] h-[210px] perspective-1000 flex items-center justify-center">
          <div className={`absolute inset-0 grid grid-cols-2 gap-3 transition-all duration-500 ${progress < 50 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase1 >= 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <BookOpen size={28} className="text-blue-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Notes Hub</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase1 >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <HelpCircle size={28} className="text-purple-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">MCQ Practice</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase1 >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <Video size={28} className="text-rose-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Video Classes</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase1 >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <Headphones size={28} className="text-emerald-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Audio TTS</span>
            </div>
          </div>

          <div className={`absolute inset-0 grid grid-cols-2 gap-3 transition-all duration-500 ${progress >= 50 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase2 >= 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <BrainCircuit size={28} className="text-amber-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Smart Revision</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase2 >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <BarChart2 size={28} className="text-indigo-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Leaderboard</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase2 >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <WifiOff size={28} className="text-teal-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Offline Mode</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg transition-all duration-500 transform ${stepPhase2 >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <Zap size={28} className="text-orange-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Level System</span>
            </div>
          </div>
        </div>
      )}

      {styleVariant === 2 && (
        /* VARIANT 2: Mechanical Gantry Crane Bubble Sort Box */
        <div className="relative z-10 w-full max-w-[345px] h-[210px] rounded-2xl bg-gradient-to-b from-[#080f24]/90 to-[#040817]/95 border border-cyan-500/35 shadow-[0_0_35px_rgba(6,182,212,0.2)] p-2.5 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

          <div className="relative w-full h-full pt-1 overflow-hidden">
            <div className="absolute top-3 left-3 right-3 h-1.5 bg-slate-900 rounded-full border border-cyan-500/40 shadow-inner flex items-center">
              <div 
                className="absolute -top-1.5 w-10 h-5 rounded-md bg-gradient-to-b from-cyan-400 to-cyan-700 border border-white shadow-[0_0_15px_#06b6d4] transition-all duration-120 ease-out flex flex-col items-center z-40 -ml-1"
                style={{ transform: `translateX(${14 + craneSlot * 38}px)` }}
              >
                <div className="absolute top-5 w-7 h-28 bg-gradient-to-b from-cyan-400/20 to-transparent pointer-events-none blur-[2px]" />
                <div className="w-3.5 flex justify-between transition-all duration-100 ease-out" style={{ height: `${wireHeight}px` }}>
                  <div className="w-0.5 bg-cyan-200 shadow-[0_0_6px_#22d3ee] h-full" />
                  <div className="w-0.5 bg-cyan-200 shadow-[0_0_6px_#22d3ee] h-full" />
                </div>
                <div className="relative -mt-0.5 flex items-center justify-center">
                  <div className={`w-8 h-2.5 rounded-t border ${isClawClosed ? 'bg-amber-400 border-amber-100 scale-95' : 'bg-cyan-500 border-cyan-200'} transition-all flex justify-between px-0.5 shadow-md`}>
                    <div className={`w-1 h-5 rounded-b ${isClawClosed ? 'bg-amber-300 rotate-[18deg] shadow-[0_0_8px_#fbbf24]' : 'bg-cyan-300 -rotate-[16deg]'} transition-all origin-top-left`} />
                    <div className={`w-1 h-5 rounded-b ${isClawClosed ? 'bg-amber-300 -rotate-[18deg] shadow-[0_0_8px_#fbbf24]' : 'bg-cyan-300 rotate-[16deg]'} transition-all origin-top-right`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-2 right-2 h-2.5 rounded-full bg-slate-950 border-t border-cyan-900/50 blur-[1px]" />

            <div className="relative w-full h-full pt-10 px-1">
              {blocks.map((block) => {
                const barHeight = block.val * 9 + 18;
                const posX = 14 + block.slot * 38;

                let colorClass = 'bg-slate-800/90 border-slate-700 text-slate-300 shadow-md';
                if (block.isSorted) {
                  colorClass = 'bg-emerald-500 border-emerald-300 text-black font-black shadow-[0_0_16px_rgba(16,185,129,0.9)]';
                } else if (block.isLifted) {
                  colorClass = 'bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-200 border-yellow-100 text-black font-black shadow-[0_0_24px_rgba(245,158,11,1)] scale-105';
                } else if (block.isComparing) {
                  colorClass = 'bg-cyan-500 border-cyan-300 text-black font-black shadow-[0_0_14px_rgba(6,182,212,0.9)] -translate-y-1';
                }

                return (
                  <React.Fragment key={block.id}>
                    {block.isLifted && (
                      <div 
                        className="absolute bottom-7 w-6 h-1.5 rounded-full bg-cyan-950 border border-cyan-500/40 blur-[1px] transition-all duration-120"
                        style={{ left: `${posX}px` }}
                      />
                    )}
                    <div
                      className={`absolute bottom-7 w-6 rounded-t-md border flex flex-col items-center justify-start pt-0.5 font-mono text-[11px] font-bold transition-all duration-120 ease-out ${colorClass}`}
                      style={{
                        left: `${posX}px`,
                        height: `${barHeight}px`,
                        transform: block.isLifted ? 'translateY(-58px)' : 'translateY(0px)',
                        zIndex: block.isLifted ? 50 : 10,
                      }}
                    >
                      <span>{block.val}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="w-full text-center pb-0.5 font-mono text-[11px] text-cyan-300 font-bold tracking-wide">
            {actionPrompt}
          </div>
        </div>
      )}

      {styleVariant === 3 && (
        /* VARIANT 3: 3D Study Desk Illustration (Books, Cap, Routine Clock) */
        <div className="relative z-10 w-72 h-44 flex items-center justify-center">
          <svg className="w-full h-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.75)]" viewBox="0 0 280 180" fill="none">
            <ellipse cx="140" cy="155" rx="100" ry="20" fill="#000000" opacity="0.65" />
            <path d="M50 135 L140 156 L230 135 L140 114 Z" fill="#1e1b4b" />
            <path d="M50 135 L50 148 L140 170 L140 156 Z" fill="#312e81" />
            <path d="M230 135 L230 148 L140 170 L140 156 Z" fill="#4338ca" />
            <path d="M58 118 L140 138 L222 118 L140 98 Z" fill="#2563eb" />
            <path d="M58 118 L58 130 L140 150 L140 138 Z" fill="#1d4ed8" />
            <path d="M222 118 L222 130 L140 150 L140 138 Z" fill="#3b82f6" />
            <path d="M140 60 L200 80 L140 100 L80 80 Z" fill="#1e293b" />
            <path d="M115 90 L115 106 C115 115 165 115 165 106 L165 90 Z" fill="#0f172a" />
            <path d="M200 80 L214 108 L210 110 L196 82 Z" fill="#f59e0b" />
            <rect x="170" y="60" width="56" height="76" rx="6" fill="#f8fafc" transform="rotate(10 170 60)" />
            <rect x="184" y="56" width="28" height="9" rx="3" fill="#cbd5e1" transform="rotate(10 184 56)" />
            <path d="M182 80 L186 85 L196 74" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M186 100 L190 105 L200 94" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M190 120 L194 125 L204 114" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="150" cy="140" r="24" fill="#1e293b" stroke="#38bdf8" strokeWidth="3.5" />
            <circle cx="150" cy="140" r="20" fill="#ffffff" />
            <path d="M150 126 L150 140 L160 140" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M42 130 C38 112 56 102 62 120 Z" fill="#10b981" />
            <path d="M50 135 C46 122 64 118 66 130 Z" fill="#34d399" />
            <path d="M38 130 L60 130 L56 144 L42 144 Z" fill="#f8fafc" />
          </svg>
        </div>
      )}

      {styleVariant === 4 && (
        /* VARIANT 4: Mini Crane Stage + Python Code Terminal Window */
        <div className="relative z-10 w-full max-w-[345px] flex flex-col gap-2">
          <div className="relative w-full h-[145px] rounded-xl bg-[#080f24]/90 border border-cyan-500/35 p-2 overflow-hidden shadow-md">
            <div className="absolute top-2 left-2 right-2 h-1 bg-slate-900 rounded-full border border-cyan-500/30 flex items-center">
              <div 
                className="absolute -top-1 w-8 h-4 rounded bg-cyan-500 border border-white flex flex-col items-center z-40"
                style={{ transform: `translateX(${12 + craneSlot * 38}px)` }}
              >
                <div className="w-2.5 flex justify-between" style={{ height: `${wireHeight * 0.6}px` }}>
                  <div className="w-0.5 bg-cyan-200 h-full" />
                  <div className="w-0.5 bg-cyan-200 h-full" />
                </div>
              </div>
            </div>
            <div className="relative w-full h-full pt-6">
              {blocks.map((block) => {
                const posX = 12 + block.slot * 38;
                return (
                  <div
                    key={block.id}
                    className={`absolute bottom-2 w-5 rounded-t font-mono text-[10px] flex items-center justify-center font-bold ${block.isSorted ? 'bg-emerald-500 text-black' : block.isLifted ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-300'}`}
                    style={{
                      left: `${posX}px`,
                      height: `${block.val * 6 + 12}px`,
                      transform: block.isLifted ? 'translateY(-35px)' : 'translateY(0px)',
                    }}
                  >
                    {block.val}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full rounded-xl bg-[#020512] border border-cyan-950/90 shadow-lg overflow-hidden font-mono text-[9.5px]">
            <div className="flex items-center justify-between px-2.5 py-1 bg-[#070d22] border-b border-cyan-950/80 text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1">
                <Terminal size={10} className="text-cyan-400" />
                <span>bubble_sort.py</span>
              </div>
              <span className="text-cyan-400 font-bold">Python</span>
            </div>
            <div className="p-1.5 space-y-0.5">
              {PYTHON_CODE_ROWS.slice(4, 9).map((line) => {
                const isActive = activeCodeLine === line.num;
                return (
                  <div key={line.num} className={`flex items-center gap-2 px-1.5 py-0.5 rounded ${isActive ? 'bg-cyan-950/90 text-cyan-300 font-bold' : 'text-slate-500'}`}>
                    <span className="text-slate-600">{line.num}</span>
                    <span className={isActive ? 'text-cyan-200' : 'text-slate-400'}>
                      <span className="text-pink-400">{line.kw}</span>
                      <span>{line.rest}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {styleVariant === 5 && (
        /* VARIANT 5: Satellite Orbital System with 6 Study Hubs */
        <div className="relative z-10 w-[295px] h-[295px] rounded-2xl bg-[#080f24]/85 border border-cyan-500/35 shadow-[0_0_35px_rgba(6,182,212,0.2)] p-2 flex items-center justify-center overflow-hidden my-auto">
          <div className="absolute inset-3 rounded-full border border-sky-400/20 pointer-events-none" />
          <div className="absolute inset-7 rounded-full border border-dashed border-indigo-400/15 pointer-events-none" />

          {/* Center Hub */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-2" style={{ animation: 'floatSlow 4s infinite ease-in-out' }}>
            <div className="w-24 h-14 relative flex items-center justify-center">
              <div className="absolute -top-3 w-16 h-16 bg-gradient-to-t from-sky-400/30 to-transparent rounded-full blur-md pointer-events-none" />
              <svg className="w-full h-full drop-shadow-[0_0_16px_rgba(56,189,248,0.9)]" viewBox="0 0 160 110" fill="none">
                <defs>
                  <linearGradient id="orbBookLeft" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="orbBookRight" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <path d="M80 88 C48 70 20 80 8 60 C36 54 62 66 80 80 Z" fill="#0284c7" opacity="0.7" />
                <path d="M80 88 C112 70 140 80 152 60 C124 54 98 66 80 80 Z" fill="#7c3aed" opacity="0.7" />
                <path d="M80 82 C52 65 24 72 14 54 C40 50 64 60 80 74 Z" fill="url(#orbBookLeft)" />
                <path d="M80 82 C108 65 136 72 146 54 C120 50 96 60 80 74 Z" fill="url(#orbBookRight)" />
                <path d="M80 76 C55 60 32 64 24 50 C46 47 67 56 80 68 Z" fill="#e0f2fe" opacity="0.9" />
                <path d="M80 76 C105 60 128 64 136 50 C114 47 93 56 80 68 Z" fill="#f3e8ff" opacity="0.9" />
                <line x1="80" y1="88" x2="80" y2="35" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              </svg>
            </div>
            <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5 leading-tight">Your All-in-One</p>
            <p className="text-[11px] font-bold text-sky-400 leading-tight">Study Partner</p>
          </div>

          {/* 6 Surrounding Orbit Nodes */}
          {orbitNodes.map((node) => {
            const rad = (node.angleDeg * Math.PI) / 180;
            const x = Math.round(102 * Math.cos(rad));
            const y = Math.round(102 * Math.sin(rad));
            const IconComp = node.icon;

            return (
              <div
                key={node.id}
                className="absolute flex flex-col items-center justify-center text-center"
                style={{ transform: `translate(${x}px, ${y}px)`, width: '68px' }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
                    border: `1.5px solid ${node.color}90`,
                    boxShadow: `0 0 10px ${node.color}40, inset 0 0 5px ${node.color}20`,
                  }}
                >
                  <IconComp size={15} style={{ color: node.color }} />
                </div>
                <span 
                  className="text-[8px] font-bold text-slate-200 mt-0.5 leading-tight text-center whitespace-normal"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LOADING PROGRESS SECTION ── */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-2 px-3">
        <div className="text-xs font-semibold text-slate-200">{statusText}</div>
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-slate-950/80 rounded-full p-[1.5px] border border-white/10 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 relative shadow-[0_0_16px_rgba(99,102,241,0.9)]"
              style={{ width: `${progress}%` }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ animation: 'shineSweep 1.4s infinite' }}
              />
            </div>
          </div>
          <span className="text-sm font-extrabold text-slate-100 tabular-nums min-w-9 text-right">
            {progress}%
          </span>
        </div>
      </div>

      {/* ── DEVELOPER CREDIT FOOTER ── */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <svg className="w-10 h-7 drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]" viewBox="0 0 60 40" fill="none">
          <line x1="30" y1="2" x2="30" y2="7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
          <line x1="16" y1="8" x2="20" y2="12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
          <line x1="44" y1="8" x2="40" y2="12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
          <path d="M30 14 L30 36 M30 36 C20 31 10 33 5 37 L5 16 C10 12 20 10 30 14 C40 10 50 12 55 16 L55 37 C50 33 40 31 30 36 Z" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2.2"/>
        </svg>

        <div className="flex items-center gap-2">
          <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-slate-400" />
          <span className="text-[11px] font-semibold text-slate-400">Developed & Managed by</span>
          <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-slate-400" />
        </div>

        <div className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          {developerName}
        </div>

        <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
          <span className="text-indigo-400">♥</span>
          <span>Built for Students, Designed for Success</span>
        </div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;

