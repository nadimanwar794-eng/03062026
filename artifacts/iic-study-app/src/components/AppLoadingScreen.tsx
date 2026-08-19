// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
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

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Initial sequence: [3, 8, 2, 7, 5, 4, 1, 6]
  const [blocks, setBlocks] = useState<BlockItem[]>([
    { id: 0, val: 3, slot: 0, isLifted: false, isSorted: false, isComparing: false },
    { id: 1, val: 8, slot: 1, isLifted: false, isSorted: false, isComparing: false },
    { id: 2, val: 2, slot: 2, isLifted: false, isSorted: false, isComparing: false },
    { id: 3, val: 7, slot: 3, isLifted: false, isSorted: false, isComparing: false },
    { id: 4, val: 5, slot: 4, isLifted: false, isSorted: false, isComparing: false },
    { id: 5, val: 4, slot: 5, isLifted: false, isSorted: false, isComparing: false },
    { id: 6, val: 1, slot: 6, isLifted: false, isSorted: false, isComparing: false },
    { id: 7, val: 6, slot: 7, isLifted: false, isSorted: false, isComparing: false },
  ]);

  // Crane Mechanics States
  const [craneSlot, setCraneSlot] = useState<number>(0);
  const [wireHeight, setWireHeight] = useState<number>(16); // 16px (retracted) -> 74px (down to block)
  const [isClawClosed, setIsClawClosed] = useState<boolean>(false);
  const [actionPrompt, setActionPrompt] = useState<string>('a[0] > a[1] ?');
  const [activeCodeLine, setActiveCodeLine] = useState<number>(6);

  const developerName = 'Nadim Anwar';
  const appVersion = APP_VERSION || 'v1.0.1';

  const SLOT_WIDTH = 40; 
  const RIG_LEFT_PAD = 14;

  useEffect(() => {
    let isCancelled = false;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const runLivePhysicsSort = async () => {
      let state = [
        { id: 0, val: 3 },
        { id: 1, val: 8 },
        { id: 2, val: 2 },
        { id: 3, val: 7 },
        { id: 4, val: 5 },
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

          // ── PHASE 1: CRANE ARRIVES & HIGHLIGHTS COMPARISON ──
          setCraneSlot(i);
          setWireHeight(16);
          setIsClawClosed(false);
          setActiveCodeLine(6);
          setActionPrompt(`a[${i}] > a[${i + 1}] ?`);

          syncBlocks({
            [itemA.id]: { isComparing: true, isLifted: false },
            [itemB.id]: { isComparing: true, isLifted: false },
          });

          await sleep(400);
          if (isCancelled) return;

          // ── PHASE 2: IF SWAP REQUIRED → VISIBLE LIFT & CARRY ──
          if (itemA.val > itemB.val) {
            setActiveCodeLine(7);
            setActionPrompt(`swap a[${i}], a[${i + 1}]`);

            // 1. Wire descends down to touch Block A
            setWireHeight(74);
            await sleep(260);
            if (isCancelled) return;

            // 2. Claw grabs Block A
            setIsClawClosed(true);
            await sleep(150);
            if (isCancelled) return;

            // 3. WIRE RETRACTS UP → BLOCK A VISIBLY LIFTS 80PX IN THE AIR
            setWireHeight(16);
            syncBlocks({
              [itemA.id]: { isLifted: true, isComparing: false },
              [itemB.id]: { isComparing: false },
            });
            await sleep(360); // Full smooth lift-up visible to eye
            if (isCancelled) return;

            // 4. CRANE MOVES RIGHT (Carrying airborne Block A to next slot)
            // Simultaneously, Block B smoothly slides left on the floor
            setCraneSlot(i + 1);

            const temp = state[i];
            state[i] = state[i + 1];
            state[i + 1] = temp;

            // Trigger horizontal sliding transition
            syncBlocks({
              [itemA.id]: { isLifted: true, isComparing: false },
              [itemB.id]: { isComparing: false, isLifted: false },
            });
            await sleep(420); // Mid-air carry visible
            if (isCancelled) return;

            // 5. WIRE DESCENDS DOWN → BLOCK A LOWERS INTO NEW POSITION
            setWireHeight(74);
            await sleep(260);
            if (isCancelled) return;

            // 6. CLAW OPENS & RELEASES BLOCK A ON THE FLOOR
            setIsClawClosed(false);
            syncBlocks({
              [itemA.id]: { isLifted: false, isComparing: false },
              [itemB.id]: { isComparing: false, isLifted: false },
            });
            await sleep(140);
            if (isCancelled) return;

            // 7. Wire retracts back to ceiling
            setWireHeight(16);
            await sleep(120);
            swappedAny = true;
          } else {
            // No swap, clear highlight
            syncBlocks({
              [itemA.id]: { isComparing: false },
              [itemB.id]: { isComparing: false },
            });
            await sleep(100);
          }

          stepsCompleted++;
          setProgress(Math.min(Math.floor((stepsCompleted / totalComparisons) * 95), 95));
          await sleep(120);
        }

        // Lock sorted element at end of pass as glowing GREEN
        const sortedId = state[n - 1 - p].id;
        setBlocks(prev =>
          prev.map(b => (b.id === sortedId ? { ...b, isSorted: true } : b))
        );

        if (!swappedAny) break;
      }

      // ── CELEBRATION FINISH ──
      setBlocks(prev => prev.map(b => ({ ...b, isSorted: true, isComparing: false, isLifted: false })));
      setActionPrompt('sorted!');
      setActiveCodeLine(10);
      setCraneSlot(3.5);
      setWireHeight(16);
      setProgress(100);

      await sleep(700);
      if (!isCancelled) onCompleteRef.current();
    };

    runLivePhysicsSort();
    return () => { isCancelled = true; };
  }, []);

  const codeRows = [
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

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#040813] text-white select-none px-4 py-5 font-sans overflow-hidden">
      
      {/* ── ISOMETRIC GRID BACKGROUND ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 229, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 229, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── TOP HEADER & BADGES ── */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center mt-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
          BUBBLE SORT
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium max-w-[320px] mt-1 leading-relaxed">
          Repeatedly swaps adjacent out-of-order pairs, letting larger values bubble toward the end.
        </p>

        {/* Complexity Badges */}
        <div className="flex items-center gap-2.5 mt-2.5">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <span className="text-cyan-500 font-black">TIME:</span>
            <span>O(n²)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <span className="text-emerald-500 font-black">SPACE:</span>
            <span>O(1)</span>
          </div>
        </div>
      </div>

      {/* ── MECHANICAL 3D GANTRY CRANE STAGE (EXTRA HEADROOM FOR LIFTING) ── */}
      <div className="relative z-10 w-full max-w-[360px] flex flex-col items-center my-auto">
        
        {/* Crane Stage Container */}
        <div className="relative w-full h-[265px] rounded-2xl bg-[#060c1d]/95 border border-cyan-500/35 shadow-[0_0_35px_rgba(2,132,199,0.25)] p-3 overflow-hidden">
          
          {/* Tech Corner Accents */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

          {/* Steel Support Pillars */}
          <div className="absolute top-3 left-2.5 bottom-6 w-1.5 bg-slate-700 rounded-full border border-slate-600 shadow-md" />
          <div className="absolute top-3 right-2.5 bottom-6 w-1.5 bg-slate-700 rounded-full border border-slate-600 shadow-md" />

          {/* Top Crane Track Rail */}
          <div className="absolute top-4 left-3 right-3 h-2.5 bg-slate-800 rounded-full border border-cyan-500/40 shadow-inner flex items-center">
            
            {/* MOVING CRANE TROLLEY */}
            <div 
              className="absolute -top-1.5 w-9 h-5 rounded bg-gradient-to-b from-cyan-400 to-cyan-600 border border-white/80 shadow-[0_0_16px_#06b6d4] transition-all duration-300 ease-out flex flex-col items-center z-40"
              style={{ 
                transform: `translateX(${RIG_LEFT_PAD + craneSlot * SLOT_WIDTH}px)` 
              }}
            >
              {/* Dual Steel Cables (Extending & Retracting) */}
              <div 
                className="w-2.5 flex justify-between transition-all duration-200 ease-out"
                style={{ height: `${wireHeight}px` }}
              >
                <div className="w-0.5 bg-cyan-200 shadow-[0_0_6px_#22d3ee] h-full" />
                <div className="w-0.5 bg-cyan-200 shadow-[0_0_6px_#22d3ee] h-full" />
              </div>

              {/* Crane Gripper Head & Claws */}
              <div className="relative -mt-0.5 flex items-center justify-center">
                <div className={`w-6 h-2.5 rounded-t-sm border ${isClawClosed ? 'bg-amber-400 border-amber-200 scale-95' : 'bg-cyan-500 border-cyan-300'} transition-all flex justify-between px-0.5 shadow-sm`}>
                  <div className={`w-0.5 h-4 ${isClawClosed ? 'bg-amber-300 rotate-12' : 'bg-cyan-300 -rotate-12'} transition-all rounded-b`} />
                  <div className={`w-0.5 h-4 ${isClawClosed ? 'bg-amber-300 -rotate-12' : 'bg-cyan-300 rotate-12'} transition-all rounded-b`} />
                </div>
              </div>
            </div>

          </div>

          {/* 3D Ground Floor Shadow */}
          <div className="absolute bottom-3.5 left-3 right-3 h-3.5 rounded-full bg-slate-900 border-t border-cyan-950/70 blur-[1px]" />

          {/* ── 3D NUMBERED BLOCK PILLARS (WITH VISIBLE AIR LIFT & GROUND SHADOWS) ── */}
          <div className="relative w-full h-full pt-16 px-1">
            {blocks.map((block) => {
              const barHeight = block.val * 11 + 22;
              const posX = RIG_LEFT_PAD + block.slot * SLOT_WIDTH;

              // Color styles
              let colorClass = 'bg-slate-700/90 border-slate-600 text-slate-300 shadow-md';
              if (block.isSorted) {
                colorClass = 'bg-emerald-500 border-emerald-300 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.95)]';
              } else if (block.isLifted) {
                colorClass = 'bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-200 border-yellow-100 text-black font-black shadow-[0_0_28px_rgba(245,158,11,1)] scale-105';
              } else if (block.isComparing) {
                colorClass = 'bg-cyan-500 border-cyan-300 text-black font-black shadow-[0_0_16px_rgba(6,182,212,0.9)] -translate-y-1';
              }

              return (
                <React.Fragment key={block.id}>
                  {/* Ground Shadow when block is in air */}
                  {block.isLifted && (
                    <div 
                      className="absolute bottom-4.5 w-7 h-2 rounded-full bg-cyan-950/80 border border-cyan-500/40 blur-[1px] transition-all duration-300"
                      style={{ left: `${posX}px` }}
                    />
                  )}

                  {/* 3D Block */}
                  <div
                    className={`absolute bottom-4.5 w-7 rounded-t-lg border flex flex-col items-center justify-start pt-1 font-mono text-xs font-bold transition-all duration-300 ease-out ${colorClass}`}
                    style={{
                      left: `${posX}px`,
                      height: `${barHeight}px`,
                      // VISIBLE LIFT: Ascends smoothly -80px up in the air
                      transform: block.isLifted ? 'translateY(-80px)' : 'translateY(0px)',
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
        <div className="mt-2.5 flex items-center justify-center gap-1.5 h-6">
          {actionPrompt === 'sorted!' ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm tracking-wider animate-pulse">
              <Check size={16} className="text-emerald-400" />
              <span>sorted!</span>
            </div>
          ) : (
            <span className="font-mono text-xs text-cyan-300 font-bold tracking-wide">
              {actionPrompt}
            </span>
          )}
        </div>

      </div>

      {/* ── PYTHON CODE SNIPPET BOX (ACTIVE HIGHLIGHT) ── */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-[#02050f]/95 border border-cyan-950/80 p-2.5 shadow-inner">
        <div className="font-mono text-[11px] leading-snug space-y-0.5">
          {codeRows.map((line) => {
            const isActive = activeCodeLine === line.num;
            return (
              <div 
                key={line.num} 
                className={`flex items-center gap-3 px-2 py-0.5 rounded transition-all duration-150 ${
                  isActive 
                    ? 'bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                    : 'text-slate-500'
                }`}
              >
                <span className="w-4 text-right text-slate-600 select-none text-[10px]">{line.num}</span>
                <span className={isActive ? 'text-cyan-200' : 'text-slate-400'}>
                  <span className="text-pink-400">{line.kw}</span>
                  <span>{line.rest}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER PROGRESS BAR & METADATA ── */}
      <div className="relative z-10 w-full max-w-sm mb-1">
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-950/50 mb-2">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-150 shadow-[0_0_10px_#22d3ee]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="text-cyan-400 font-bold">{progress}%</span>
          <span className="text-slate-500">Dev: {developerName}</span>
          <span className="text-slate-500">{appVersion}</span>
        </div>
      </div>

    </div>
  );
};

export default AppLoadingScreen;
