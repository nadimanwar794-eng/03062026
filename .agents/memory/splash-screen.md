---
name: Cinematic Splash Screen
description: AppLoadingScreen.tsx - cinematic logo reveal with particles, orbiting dots, halo burst
---
3-phase: hidden(0-120ms) → burst(120-500ms halo+particles) → reveal(500ms+ orbiting dots+name).
Logo: scale(0.3)→scale(1.14)→scale(1) with blur+brightness. 24 burst particles, 3 orbiting dots.
Progress still 2200ms, calls onComplete same as before.
**Why:** User wanted "video jaisa" cinematic splash.
