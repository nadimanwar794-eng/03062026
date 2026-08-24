<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NSTA - National Study & Tracking App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    body {
      background: #020617;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    /* Main Container */
    .splash-card {
      position: relative;
      width: 100%;
      max-width: 410px;
      height: 100vh;
      max-height: 870px;
      background: radial-gradient(circle at 50% 18%, #1e1b4b 0%, #0c1033 40%, #030717 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 34px 20px 22px;
      overflow: hidden;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.9);
    }

    /* Ambient Glows */
    .ambient-glow-top {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 340px;
      height: 340px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
      filter: blur(50px);
      pointer-events: none;
    }

    .ambient-glow-bottom {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      width: 420px;
      height: 220px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, transparent 70%);
      filter: blur(50px);
      pointer-events: none;
    }

    .neon-arc-1 {
      position: absolute;
      width: 480px;
      height: 480px;
      border-radius: 50%;
      border: 1px solid rgba(56, 189, 248, 0.12);
      top: 52%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* Watermark Icons */
    .watermark {
      position: absolute;
      color: rgba(255, 255, 255, 0.04);
      pointer-events: none;
    }
    .wm-pencil { top: 8%; left: 8%; }
    .wm-target { top: 19%; left: 10%; }
    .wm-bulb   { top: 31%; left: 8%; }
    .wm-book   { top: 8%; right: 8%; }
    .wm-chart  { top: 19%; right: 10%; }
    .wm-brain  { top: 31%; right: 8%; }

    /* Top Logo & Branding */
    .brand-section {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .logo-container {
      position: relative;
      width: 160px;
      height: 125px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
    }

    .logo-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 24px rgba(56, 189, 248, 0.65));
    }

    .main-title {
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 4px;
      line-height: 1;
      background: linear-gradient(180deg, #ffffff 0%, #dbeafe 55%, #93c5fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 4px 18px rgba(255, 255, 255, 0.25));
    }

    .sub-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
    }

    .sparkle {
      color: #38bdf8;
      font-size: 10px;
      text-shadow: 0 0 8px #38bdf8;
    }

    .sub-title {
      font-size: 14px;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: 0.4px;
    }

    /* 4 Feature Tags Row */
    .features-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 12px;
      width: 100%;
    }

    .feat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      font-weight: 700;
    }

    .feat-item svg {
      width: 14px;
      height: 14px;
    }

    .c-self { color: #38bdf8; }
    .c-disc { color: #34d399; }
    .c-rout { color: #fbbf24; }
    .c-rev  { color: #c084fc; }

    .bullet-dot {
      width: 3.5px;
      height: 3.5px;
      border-radius: 50%;
      background: #475569;
    }

    /* Center 3D Illustration */
    .center-illustration {
      position: relative;
      z-index: 10;
      width: 250px;
      height: 165px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .center-illustration svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 35px rgba(56, 189, 248, 0.3));
    }

    /* Loading Progress Area */
    .progress-section {
      position: relative;
      z-index: 10;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
    }

    .status-text {
      font-size: 13px;
      font-weight: 600;
      color: #e2e8f0;
      letter-spacing: 0.3px;
    }

    .progress-bar-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-track {
      flex: 1;
      height: 10px;
      background: rgba(10, 15, 35, 0.85);
      border-radius: 99px;
      padding: 1.5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.8);
      position: relative;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      width: 0%;
      border-radius: 99px;
      background: linear-gradient(90deg, #38bdf8 0%, #818cf8 55%, #c084fc 100%);
      box-shadow: 0 0 18px 2px rgba(99, 102, 241, 0.9);
      transition: width 60ms linear;
      position: relative;
    }

    .progress-fill::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
      animation: shineSweep 1.4s infinite;
    }

    @keyframes shineSweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .percent-label {
      font-size: 13.5px;
      font-weight: 800;
      color: #f8fafc;
      min-width: 36px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* Footer Developer Credit */
    .footer-section {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .dev-badge-icon {
      width: 44px;
      height: 32px;
      filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.7));
    }

    .dev-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .line-accent {
      width: 26px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.7), transparent);
    }

    .dev-title {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.3px;
    }

    .dev-name {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1.4px;
      background: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 14px rgba(99, 102, 241, 0.5));
    }

    .dev-tagline {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 9.5px;
      font-weight: 600;
      color: #64748b;
      margin-top: 2px;
    }

    .heart-symbol {
      color: #818cf8;
      font-size: 8px;
    }
  </style>
</head>
<body>

  <div class="splash-card">
    <div class="ambient-glow-top"></div>
    <div class="ambient-glow-bottom"></div>
    <div class="neon-arc-1"></div>

    <!-- Watermarks -->
    <svg class="watermark wm-pencil" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
    <svg class="watermark wm-target" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    <svg class="watermark wm-bulb" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/></svg>
    <svg class="watermark wm-book" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/></svg>
    <svg class="watermark wm-chart" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    <svg class="watermark wm-brain" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>

    <!-- Top Branding -->
    <div class="brand-section">
      <div class="logo-container">
        <!-- 3D Open Glowing Educational Book with Graduation Cap (No 'N') -->
        <svg class="logo-svg" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mainPageLeft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0284c7"/>
              <stop offset="60%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#818cf8"/>
            </linearGradient>
            <linearGradient id="mainPageRight" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#9333ea"/>
              <stop offset="60%" stop-color="#c084fc"/>
              <stop offset="100%" stop-color="#818cf8"/>
            </linearGradient>
            <linearGradient id="glowBase" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>
          </defs>

          <!-- Outer Glow Base Layers -->
          <path d="M110 148 C65 125 25 138 12 110 C50 102 85 118 110 138 Z" fill="#0369a1" opacity="0.6"/>
          <path d="M110 148 C155 125 195 138 208 110 C170 102 135 118 110 138 Z" fill="#7e22ce" opacity="0.6"/>

          <!-- Mid Layer Pages -->
          <path d="M110 140 C70 115 32 124 20 100 C56 94 90 108 110 128 Z" fill="url(#mainPageLeft)"/>
          <path d="M110 140 C150 115 188 124 200 100 C164 94 130 108 110 128 Z" fill="url(#mainPageRight)"/>

          <!-- Top Glowing Inner Pages -->
          <path d="M110 130 C75 105 45 112 35 90 C68 84 95 98 110 118 Z" fill="#e0f2fe" opacity="0.95"/>
          <path d="M110 130 C145 105 175 112 185 90 C152 84 125 98 110 118 Z" fill="#f3e8ff" opacity="0.95"/>

          <!-- Glowing Spine Light Ray -->
          <path d="M108 152 L112 152 L111 65 L109 65 Z" fill="url(#glowBase)" filter="drop-shadow(0 0 8px #38bdf8)"/>

          <!-- Floating Graduation Cap Over the Book -->
          <path d="M110 40 L160 58 L110 76 L60 58 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <path d="M88 68 L88 84 C88 94 132 94 132 84 L132 68 Z" fill="#0f172a"/>
          <path d="M160 58 L170 82 L166 84 L156 60 Z" fill="#fbbf24"/>
        </svg>
      </div>

      <h1 class="main-title">NSTA</h1>
      
      <div class="sub-title-row">
        <span class="sparkle">✦</span>
        <span class="sub-title">National Study & Tracking App</span>
        <span class="sparkle">✦</span>
      </div>

      <div class="features-row">
        <div class="feat-item c-self">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.5 8.5 0 0 1 13 0"/></svg>
          <span>Self Study</span>
        </div>
        <div class="bullet-dot"></div>
        <div class="feat-item c-disc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Discipline</span>
        </div>
        <div class="bullet-dot"></div>
        <div class="feat-item c-rout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span>Routine</span>
        </div>
        <div class="bullet-dot"></div>
        <div class="feat-item c-rev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Revision</span>
        </div>
      </div>
    </div>

    <!-- Center 3D Illustration -->
    <div class="center-illustration">
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="140" cy="155" rx="100" ry="20" fill="#000000" opacity="0.65"/>
        
        <!-- Books Stack -->
        <path d="M50 135 L140 156 L230 135 L140 114 Z" fill="#1e1b4b"/>
        <path d="M50 135 L50 148 L140 170 L140 156 Z" fill="#312e81"/>
        <path d="M230 135 L230 148 L140 170 L140 156 Z" fill="#4338ca"/>
        
        <path d="M58 118 L140 138 L222 118 L140 98 Z" fill="#2563eb"/>
        <path d="M58 118 L58 130 L140 150 L140 138 Z" fill="#1d4ed8"/>
        <path d="M222 118 L222 130 L140 150 L140 138 Z" fill="#3b82f6"/>

        <!-- Cap on Books -->
        <path d="M140 60 L200 80 L140 100 L80 80 Z" fill="#1e293b"/>
        <path d="M115 90 L115 106 C115 115 165 115 165 106 L165 90 Z" fill="#0f172a"/>
        <path d="M200 80 L214 108 L210 110 L196 82 Z" fill="#f59e0b"/>

        <!-- Clipboard Checklist -->
        <rect x="170" y="60" width="56" height="76" rx="6" fill="#f8fafc" transform="rotate(10 170 60)"/>
        <rect x="184" y="56" width="28" height="9" rx="3" fill="#cbd5e1" transform="rotate(10 184 56)"/>
        <path d="M182 80 L186 85 L196 74" stroke="#3b82f6" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M186 100 L190 105 L200 94" stroke="#3b82f6" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M190 120 L194 125 L204 114" stroke="#3b82f6" stroke-width="2.8" stroke-linecap="round"/>

        <!-- Clock -->
        <circle cx="150" cy="140" r="24" fill="#1e293b" stroke="#38bdf8" stroke-width="3.5"/>
        <circle cx="150" cy="140" r="20" fill="#ffffff"/>
        <path d="M150 126 L150 140 L160 140" stroke="#1e293b" stroke-width="2.8" stroke-linecap="round"/>
        
        <!-- Plant -->
        <path d="M42 130 C38 112 56 102 62 120 Z" fill="#10b981"/>
        <path d="M50 135 C46 122 64 118 66 130 Z" fill="#34d399"/>
        <path d="M38 130 L60 130 L56 144 L42 144 Z" fill="#f8fafc"/>
      </svg>
    </div>

    <!-- Loading Bar -->
    <div class="progress-section">
      <div class="status-text" id="status-label">Loading Your Learning Journey...</div>
      
      <div class="progress-bar-wrapper">
        <div class="progress-track">
          <div class="progress-fill" id="progress-bar"></div>
        </div>
        <div class="percent-label" id="percent-label">0%</div>
      </div>
    </div>

    <!-- Developer Credit -->
    <div class="footer-section">
      <svg class="dev-badge-icon" viewBox="0 0 60 40" fill="none">
        <line x1="30" y1="2" x2="30" y2="7" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="8" x2="20" y2="12" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <line x1="44" y1="8" x2="40" y2="12" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <path d="M30 14 L30 36 M30 36 C20 31 10 33 5 37 L5 16 C10 12 20 10 30 14 C40 10 50 12 55 16 L55 37 C50 33 40 31 30 36 Z" fill="#38bdf8" fill-opacity="0.25" stroke="#38bdf8" stroke-width="2.2"/>
      </svg>
      
      <div class="dev-title-row">
        <div class="line-accent"></div>
        <span class="dev-title">Developed & Managed by</span>
        <div class="line-accent"></div>
      </div>

      <div class="dev-name">NADIM ANWAR</div>
      
      <div class="dev-tagline">
        <span class="heart-symbol">♥</span>
        <span>Built for Students, Designed for Success</span>
      </div>
    </div>
  </div>

  <script>
    const bar = document.getElementById('progress-bar');
    const label = document.getElementById('percent-label');
    const statusText = document.getElementById('status-label');

    const statusMilestones = [
      { at: 0, text: "Initializing App Modules..." },
      { at: 20, text: "Loading Your Learning Journey..." },
      { at: 55, text: "Syncing Study Routine & Daily Goals..." },
      { at: 80, text: "Preparing Fast Revision Engine..." },
      { at: 96, text: "Welcome to NSTA!" }
    ];

    let current = 0;
    const duration = 3800;
    const stepInterval = 25;
    const increment = 100 / (duration / stepInterval);

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
      }

      const p = Math.floor(current);
      bar.style.width = `${p}%`;
      label.innerText = `${p}%`;

      for (let i = statusMilestones.length - 1; i >= 0; i--) {
        if (p >= statusMilestones[i].at) {
          statusText.innerText = statusMilestones[i].text;
          break;
        }
      }
    }, stepInterval);
  </script>
</body>
</html>

