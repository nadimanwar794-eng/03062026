// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

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

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Loading Your Learning Journey...');
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Initial sequence: [3, 2, 7, 5, 8, 4, 1, 6]
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

  // Crane Mechanics States
  const [craneSlot, setCraneSlot] = useState<number>(0);
  const [wireHeight, setWireHeight] = useState<number>(10);
  const [isClawClosed, setIsClawClosed] = useState<boolean>(false);
  const [actionPrompt, setActionPrompt] = useState<string>('a[0] > a[1] ?');

  const SLOT_WIDTH = 38; 
  const RIG_LEFT_PAD = 14;

  const statusMilestones = [
    { at: 0, text: 'Initializing App Modules...' },
    { at: 20, text: 'Loading Your Learning Journey...' },
    { at: 55, text: 'Syncing Study Routine & Daily Goals...' },
    { at: 80, text: 'Preparing Fast Revision Engine...' },
    { at: 96, text: 'Welcome to NSTA!' }
  ];

  useEffect(() => {
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
          setActionPrompt(`a[${i}] > a[${i + 1}] ?`);

          syncBlocks({
            [itemA.id]: { isComparing: true, isLifted: false },
            [itemB.id]: { isComparing: true, isLifted: false },
          });

          await sleep(75);
          if (isCancelled) return;

          // 2. Swap sequence
          if (itemA.val > itemB.val) {
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
      setStatusText('Welcome to NSTA!');
      setCraneSlot(3.5);
      setWireHeight(10);
      setProgress(100);

      await sleep(350);
      if (!isCancelled) onCompleteRef.current();
    };

    runSortEngine();
    return () => { isCancelled = true; };
  }, []);

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
      `}</style>

      {/* Ambient Glows & Circular Background Track */}
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
        {/* 3D Glowing Open Book Logo with Graduation Cap */}
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

            {/* Graduation Cap */}
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

      {/* ── MECHANICAL 3D GANTRY CRANE STAGE (BUBBLE SORT BOX) ── */}
      <div className="relative z-10 w-full max-w-[345px] h-[210px] rounded-2xl bg-gradient-to-b from-[#080f24]/90 to-[#040817]/95 border border-cyan-500/35 shadow-[0_0_35px_rgba(6,182,212,0.2)] p-2.5 overflow-hidden flex flex-col justify-between">
        
        {/* Corner Tech Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Steel Track & Crane System */}
        <div className="relative w-full h-full pt-1 overflow-hidden">
          {/* Track Line */}
          <div className="absolute top-3 left-3 right-3 h-1.5 bg-slate-900 rounded-full border border-cyan-500/40 shadow-inner flex items-center">
            {/* Crane Trolley & Claws */}
            <div 
              className="absolute -top-1.5 w-10 h-5 rounded-md bg-gradient-to-b from-cyan-400 to-cyan-700 border border-white shadow-[0_0_15px_#06b6d4] transition-all duration-120 ease-out flex flex-col items-center z-40 -ml-1"
              style={{ 
                transform: `translateX(${RIG_LEFT_PAD + craneSlot * SLOT_WIDTH}px)` 
              }}
            >
              {/* Laser Target Beam */}
              <div className="absolute top-5 w-7 h-28 bg-gradient-to-b from-cyan-400/20 to-transparent pointer-events-none blur-[2px]" />

              {/* Cables */}
              <div 
                className="w-3.5 flex justify-between transition-all duration-100 ease-out"
                style={{ height: `${wireHeight}px` }}
              >
                <div className="w-0.5 bg-cyan-200 shadow-[0_0_6px_#22d3ee] h-full" />
                <div className="w-0.5 bg-cyan-200 shadow-[0_0_6px_#22d3ee] h-full" />
              </div>

              {/* Claw Head */}
              <div className="relative -mt-0.5 flex items-center justify-center">
                <div className={`w-8 h-2.5 rounded-t border ${isClawClosed ? 'bg-amber-400 border-amber-100 scale-95' : 'bg-cyan-500 border-cyan-200'} transition-all flex justify-between px-0.5 shadow-md`}>
                  <div className={`w-1 h-5 rounded-b ${isClawClosed ? 'bg-amber-300 rotate-[18deg] shadow-[0_0_8px_#fbbf24]' : 'bg-cyan-300 -rotate-[16deg]'} transition-all origin-top-left`} />
                  <div className={`w-1 h-5 rounded-b ${isClawClosed ? 'bg-amber-300 -rotate-[18deg] shadow-[0_0_8px_#fbbf24]' : 'bg-cyan-300 rotate-[16deg]'} transition-all origin-top-right`} />
                </div>
              </div>
            </div>
          </div>

          {/* 3D Floor Shadow */}
          <div className="absolute bottom-6 left-2 right-2 h-2.5 rounded-full bg-slate-950 border-t border-cyan-900/50 blur-[1px]" />

          {/* Blocks */}
          <div className="relative w-full h-full pt-10 px-1">
            {blocks.map((block) => {
              const barHeight = block.val * 9 + 18;
              const posX = RIG_LEFT_PAD + block.slot * SLOT_WIDTH;

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

        {/* Dynamic Action Prompt */}
        <div className="w-full text-center pb-0.5 font-mono text-[11px] text-cyan-300 font-bold tracking-wide">
          {actionPrompt}
        </div>
      </div>

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
          Nadim Anwar
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
