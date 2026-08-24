// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

interface AppLoadingScreenProps {
  onComplete: () => void;
  isPremium?: boolean;
  subscriptionLevel?: 'FREE' | 'BASIC' | 'ULTRA';
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Loading Your Learning Journey...');
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const statusMilestones = [
    { at: 0, text: 'Initializing App Modules...' },
    { at: 20, text: 'Loading Your Learning Journey...' },
    { at: 55, text: 'Syncing Study Routine & Daily Goals...' },
    { at: 80, text: 'Preparing Fast Revision Engine...' },
    { at: 96, text: 'Welcome to NSTA!' }
  ];

  useEffect(() => {
    let current = 0;
    const durationMs = 3800;
    const interval = 25;
    const increment = 100 / (durationMs / interval);

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setStatusText('Welcome to NSTA!');
        clearInterval(timer);
        setTimeout(() => {
          if (onCompleteRef.current) onCompleteRef.current();
        }, 350);
        return;
      }

      const p = Math.floor(current);
      setProgress(p);

      for (let i = statusMilestones.length - 1; i >= 0; i--) {
        if (p >= statusMilestones[i].at) {
          setStatusText(statusMilestones[i].text);
          break;
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#020617] text-white select-none overflow-hidden font-sans">
      <style>{`
        @keyframes shineSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Main Container Card */}
      <div 
        className="relative w-full max-w-[410px] h-screen max-h-[870px] flex flex-col items-center justify-between px-5 pt-8 pb-6 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 18%, #1e1b4b 0%, #0c1033 40%, #030717 100%)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Ambient Glows & Circular Track */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        <div 
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[420px] h-[220px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-sky-400/10 pointer-events-none"
        />

        {/* Academic Watermarks */}
        <svg className="absolute top-[8%] left-[8%] text-white/[0.04] pointer-events-none" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        <svg className="absolute top-[19%] left-[10%] text-white/[0.04] pointer-events-none" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        <svg className="absolute top-[31%] left-[8%] text-white/[0.04] pointer-events-none" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/></svg>
        <svg className="absolute top-[8%] right-[8%] text-white/[0.04] pointer-events-none" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/></svg>
        <svg className="absolute top-[19%] right-[10%] text-white/[0.04] pointer-events-none" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        <svg className="absolute top-[31%] right-[8%] text-white/[0.04] pointer-events-none" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>

        {/* Top Branding Section */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* 3D Glowing Open Book Logo with Graduation Cap */}
          <div className="w-40 h-32 flex items-center justify-center">
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

          <div className="flex items-center gap-1.5 mt-1.5 text-slate-100 text-sm font-bold">
            <span className="text-sky-400 text-xs">✦</span>
            <span>National Study & Tracking App</span>
            <span className="text-sky-400 text-xs">✦</span>
          </div>

          {/* 4 Feature Badges */}
          <div className="flex items-center justify-center gap-2.5 mt-3 text-xs font-bold flex-wrap">
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

        {/* Center 3D Study Illustration */}
        <div className="relative z-10 w-64 h-40 flex items-center justify-center">
          <svg className="w-full h-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.75)]" viewBox="0 0 280 180" fill="none">
            <ellipse cx="140" cy="155" rx="100" ry="20" fill="#000000" opacity="0.65" />
            
            {/* Book Stack */}
            <path d="M50 135 L140 156 L230 135 L140 114 Z" fill="#1e1b4b" />
            <path d="M50 135 L50 148 L140 170 L140 156 Z" fill="#312e81" />
            <path d="M230 135 L230 148 L140 170 L140 156 Z" fill="#4338ca" />
            <path d="M58 118 L140 138 L222 118 L140 98 Z" fill="#2563eb" />
            <path d="M58 118 L58 130 L140 150 L140 138 Z" fill="#1d4ed8" />
            <path d="M222 118 L222 130 L140 150 L140 138 Z" fill="#3b82f6" />

            {/* Cap on Books */}
            <path d="M140 60 L200 80 L140 100 L80 80 Z" fill="#1e293b" />
            <path d="M115 90 L115 106 C115 115 165 115 165 106 L165 90 Z" fill="#0f172a" />
            <path d="M200 80 L214 108 L210 110 L196 82 Z" fill="#f59e0b" />

            {/* Checklist Clipboard */}
            <rect x="170" y="60" width="56" height="76" rx="6" fill="#f8fafc" transform="rotate(10 170 60)" />
            <rect x="184" y="56" width="28" height="9" rx="3" fill="#cbd5e1" transform="rotate(10 184 56)" />
            <path d="M182 80 L186 85 L196 74" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M186 100 L190 105 L200 94" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M190 120 L194 125 L204 114" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />

            {/* Clock */}
            <circle cx="150" cy="140" r="24" fill="#1e293b" stroke="#38bdf8" strokeWidth="3.5" />
            <circle cx="150" cy="140" r="20" fill="#ffffff" />
            <path d="M150 126 L150 140 L160 140" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />

            {/* Potted Plant */}
            <path d="M42 130 C38 112 56 102 62 120 Z" fill="#10b981" />
            <path d="M50 135 C46 122 64 118 66 130 Z" fill="#34d399" />
            <path d="M38 130 L60 130 L56 144 L42 144 Z" fill="#f8fafc" />
          </svg>
        </div>

        {/* Progress Bar & Status */}
        <div className="relative z-10 w-full flex flex-col items-center gap-2.5 px-3">
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

        {/* Developer Credit Footer */}
        <div className="relative z-10 flex flex-col items-center gap-0.5">
          <svg className="w-11 h-8 drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]" viewBox="0 0 60 40" fill="none">
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
            NADIM ANWAR
          </div>

          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <span className="text-indigo-400">♥</span>
            <span>Built for Students, Designed for Success</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;

