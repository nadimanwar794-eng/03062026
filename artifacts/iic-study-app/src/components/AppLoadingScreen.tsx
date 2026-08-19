// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { APP_VERSION } from '../constants';

interface AppLoadingScreenProps {
  onComplete: () => void;
  isPremium?: boolean;
  subscriptionLevel?: 'FREE' | 'BASIC' | 'ULTRA';
}

interface BarItem {
  id: number;
  val: number;
  slot: number; // 0 to 7
  isLifted: boolean;
  isSorted: boolean;
  isComparing: boolean;
  isUnderSwapping: boolean;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Initial array: [3, 8, 2, 7, 5, 4, 1, 6]
  const [items, setItems] = useState<BarItem[]>([
    { id: 0, val: 3, slot: 0, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
    { id: 1, val: 8, slot: 1, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
    { id: 2, val: 2, slot: 2, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
    { id: 3, val: 7, slot: 3, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
    { id: 4, val: 5, slot: 4, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
    { id: 5, val: 4, slot: 5, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
    { id: 6, val: 1, slot: 6, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
    { id: 7, val: 6, slot: 7, isLifted: false, isSorted: false, isComparing: false, isUnderSwapping: false },
  ]);

  // Crane & Cable Physics
  const [craneSlot, setCraneSlot] = useState<number>(0);
  const [wireLength, setWireLength] = useState<number>(18);
  const [clawGripped, setClawGripped] = useState<boolean>(false);
  const [actionLabel, setActionLabel] = useState<string>('a[0] > a[1] ?');
  const [activeCodeLine, setActiveCodeLine] = useState<number>(6);

  const developerName = 'Nadim Anwar';
  const appVersion = APP_VERSION || 'v1.0.1';

  // Slot spacing constant (px)
  const SLOT_WIDTH = 38; 
  const RIG_OFFSET = 12;

  useEffect(() => {
    let isCancelled = false;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const runCraneBubbleSort = async () => {
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
      const totalSteps = (n * (n - 1)) / 2;
      let completedSteps = 0;

      const syncUI = (extraProps = {}) => {
        setItems(prev =>
          prev.map(item => {
            const currentIdx = state.findIndex(s => s.id === item.id);
            return {
              ...item,
              slot: currentIdx,
              ...extraProps[item.id],
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

          // ── 1. MOVE CRANE TO POSITION & COMPARE ──
          setCraneSlot(i);
          setWireLength(18);
          setClawGripped(false);
          setActiveCodeLine(6);
          setActionLabel(`a[${i}] > a[${i + 1}] ?`);

          syncUI({
            [itemA.id]: { isComparing: true, isLifted: false, isUnderSwapping: false },
            [itemB.id]: { isComparing: true, isLifted: false, isUnderSwapping: false },
          });

          await sleep(350);
          if (isCancelled) return;

          // ── 2. IF SWAP NEEDED ──
          if (itemA.val > itemB.val) {
            setActiveCodeLine(7);
            setActionLabel(`swap a[${i}], a[${i + 1}]`);

            // Drop wire down to grab bar A
            setWireLength(46);
            await sleep(180);
            if (isCancelled) return;

            // Grab claw
            setClawGripped(true);
            await sleep(120);
            if (isCancelled) return;

            // LIFT BAR A UP IN THE AIR
            setWireLength(18);
            syncUI({
              [itemA.id]: { isLifted: true, isComparing: false, isUnderSwapping: false },
              [itemB.id]: { isComparing: false, isUnderSwapping: true },
            });
            await sleep(240);
            if (isCancelled) return;

            // MOVE CRANE TO NEXT SLOT (CARRYING BAR A IN AIR)
            // Simultaneously, Bar B moves to the left slot
            setCraneSlot(i + 1);

            // Swap in logic state array
            const temp = state[i];
            state[i] = state[i + 1];
            state[i + 1] = temp;

            // Render horizontal motion
            syncUI({
              [itemA.id]: { isLifted: true, isComparing: false, isUnderSwapping: false },
              [itemB.id]: { isComparing: false, isUnderSwapping: false },
            });
            await sleep(320);
            if (isCancelled) return;

            // LOWER BAR A DOWN AT NEW POSITION
            setWireLength(46);
            await sleep(180);
            if (isCancelled) return;

            // RELEASE CLAW & SETTLE
            setClawGripped(false);
            syncUI({
              [itemA.id]: { isLifted: false, isComparing: false, isUnderSwapping: false },
              [itemB.id]: { isComparing: false, isUnderSwapping: false },
            });
            await sleep(100);
            if (isCancelled) return;

            setWireLength(18);
            swappedAny = true;
          } else {
            // Reset comparing colors if no swap
            syncUI({
              [itemA.id]: { isComparing: false },
              [itemB.id]: { isComparing: false },
            });
          }

          completedSteps++;
          setProgress(Math.min(Math.floor((completedSteps / totalSteps) * 94), 94));
          await sleep(150);
        }

        // Mark the sorted bar at end of this pass as GREEN
        const sortedItemId = state[n - 1 - p].id;
        setItems(prev =>
          prev.map(it => (it.id === sortedItemId ? { ...it, isSorted: true } : it))
        );

        if (!swappedAny) break;
      }

      // Final Completion
      setItems(prev => prev.map(it => ({ ...it, isSorted: true, isComparing: false, isLifted: false })));
      setActionLabel('sorted!');
      setActiveCodeLine(10);
      setCraneSlot(3.5);
      setWireLength(18);
      setProgress(100);

      await sleep(650);
      if (!isCancelled) onCompleteRef.current();
    };

    runCraneBubbleSort();
    return () => { isCancelled = true; };
  }, []);

  const codeSnippet = [
    { num: 1, code: 'def bubble_sort(a):' },
    { num: 2, code: '    n = len(a)' },
    { num: 3, code: '    for p in range(n - 1):' },
    { num: 4, code: '        swapped = False' },
    { num: 5, code: '        for i in range(n - 1 - p):' },
    { num: 6, code: '            if a[i] > a[i + 1]:' },
    { num: 7, code: '                a[i], a[i + 1] = a[i + 1], a[i]' },
    { num: 8, code: '                swapped = True' },
    { num: 9, code: '        if not swapped:' },
    { num: 10, code: '            break' },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#040814] text-white select-none px-4 py-5 font-sans overflow-hidden">
      
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 210, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 210, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── HEADER ── */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center mt-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
          BUBBLE SORT
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium max-w-[320px] mt-1 leading-relaxed">
          Repeatedly swaps adjacent out-of-order pairs, letting larger values bubble toward the end.
        </p>

        {/* Complexity Badges */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <span className="text-cyan-500">TIME:</span>
            <span>O(n²)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <span className="text-emerald-500">SPACE:</span>
            <span>O(1)</span>
          </div>
        </div>
      </div>

      {/* ── CRANE RIG & BARS (REAL LIFTING PHYSICS) ── */}
      <div className="relative z-10 w-full max-w-[350px] flex flex-col items-center my-auto">
        
        <div className="relative w-full h-[230px] rounded-2xl bg-[#070e22]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(2,132,199,0.25)] p-2.5 overflow-hidden">
          
          {/* Tech Corner Accents */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

          {/* Pillars */}
          <div className="absolute top-3 left-2.5 bottom-6 w-1 bg-slate-700/80 rounded-full" />
          <div className="absolute top-3 right-2.5 bottom-6 w-1 bg-slate-700/80 rounded-full" />

          {/* Top Crane Girder Rail */}
          <div className="absolute top-4 left-3 right-3 h-2 bg-slate-800 rounded-full border border-cyan-500/40">
            
            {/* MOVING CRANE TROLLEY */}
            <div 
              className="absolute -top-1.5 w-8 h-4 rounded bg-gradient-to-b from-cyan-400 to-cyan-600 border border-white/60 shadow-[0_0_12px_#06b6d4] transition-all duration-300 ease-out flex flex-col items-center"
              style={{ 
                transform: `translateX(${RIG_OFFSET + craneSlot * SLOT_WIDTH}px)` 
              }}
            >
              {/* Cable Wire */}
              <div 
                className="w-0.5 bg-cyan-200 transition-all duration-180 ease-out shadow-[0_0_6px_#22d3ee]"
                style={{ height: `${wireLength}px` }}
              />

              {/* Claw Gripper */}
              <div className="relative -mt-0.5 flex items-center justify-center">
                <div className={`w-5 h-2 rounded-t-sm border border-cyan-300 ${clawGripped ? 'bg-amber-400 border-amber-200 scale-95' : 'bg-cyan-500'} transition-all flex justify-between px-0.5`}>
                  <div className={`w-0.5 h-3 ${clawGripped ? 'bg-amber-300 rotate-12' : 'bg-cyan-300 -rotate-12'} transition-all rounded-b`} />
                  <div className={`w-0.5 h-3 ${clawGripped ? 'bg-amber-300 -rotate-12' : 'bg-cyan-300 rotate-12'} transition-all rounded-b`} />
                </div>
              </div>
            </div>

          </div>

          {/* ABSOLUTELY POSITIONED BARS (ACCURATE X/Y COORDINATES) */}
          <div className="relative w-full h-full pt-16 px-3">
            {items.map((item) => {
              const barHeight = item.val * 11 + 22;
              const posX = RIG_OFFSET + item.slot * SLOT_WIDTH;
              
              // Color styles
              let colorClass = 'bg-slate-700/80 border-slate-600 text-slate-300';
              if (item.isSorted) {
                colorClass = 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_16px_rgba(16,185,129,0.8)] font-black';
              } else if (item.isLifted) {
                colorClass = 'bg-gradient-to-t from-amber-500 to-yellow-300 border-yellow-100 text-black shadow-[0_0_22px_rgba(245,158,11,1)] font-black';
              } else if (item.isComparing) {
                colorClass = 'bg-cyan-500 border-cyan-300 text-black shadow-[0_0_14px_rgba(6,182,212,0.8)] font-black';
              }

              return (
                <div
                  key={item.id}
                  className={`absolute bottom-5 w-7 rounded-t-lg border flex flex-col items-center justify-start pt-1 font-mono text-xs font-bold transition-all duration-300 ease-out ${colorClass}`}
                  style={{
                    left: `${posX}px`,
                    height: `${barHeight}px`,
                    // LIFT UP IN THE AIR ATTACHED TO CRANE
                    transform: item.isLifted ? 'translateY(-65px)' : 'translateY(0px)',
                    zIndex: item.isLifted ? 50 : 10,
                  }}
                >
                  <span>{item.val}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Dynamic Action Prompt */}
        <div className="mt-3 flex items-center justify-center gap-1.5 h-6">
          {actionLabel === 'sorted!' ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm tracking-wider animate-pulse">
              <Check size={16} className="text-emerald-400" />
              <span>sorted!</span>
            </div>
          ) : (
            <span className="font-mono text-xs text-cyan-300 font-bold tracking-wide">
              {actionLabel}
            </span>
          )}
        </div>

      </div>

      {/* ── CODE SNIPPET BOX (DYNAMIC HIGHLIGHTS) ── */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-[#02050f]/95 border border-cyan-950/80 p-2.5 shadow-inner">
        <div className="font-mono text-[11px] leading-snug space-y-0.5">
          {codeSnippet.map((line) => {
            const isActive = activeCodeLine === line.num;
            return (
              <div 
                key={line.num} 
                className={`flex items-center gap-3 px-2 py-0.5 rounded transition-all duration-150 ${
                  isActive 
                    ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                    : 'text-slate-500'
                }`}
              >
                <span className="w-4 text-right text-slate-600 select-none text-[10px]">{line.num}</span>
                <span className={isActive ? 'text-cyan-200' : 'text-slate-400'}>{line.code}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER PROGRESS & METADATA ── */}
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
