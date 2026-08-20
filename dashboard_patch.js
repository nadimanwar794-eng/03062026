const fs = require('fs');
let code = fs.readFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'utf8');

const _appBgRegex = /const _appBg = \(\(\) => \{[\s\S]*?\}\)\(\);/m;

const replacement = `const _appBg = (() => {
    // Check if a specific tab wallpaper exists and we are not in LESSON/NOTES reading mode
    const isLessonView = state.view === 'LESSON' || state.view === 'NOTES'; // Exemption for reading view
    const pTheme = user?.personalTheme || user?.customTheme;

    if (pTheme && !isLessonView) {
      if (activeTab === 'HOME' && pTheme.wallpaperHome) return \`url(\${pTheme.wallpaperHome})\`;
      if (activeTab === 'REVISION_HUB' && pTheme.wallpaperRevision) return \`url(\${pTheme.wallpaperRevision})\`;
      if (activeTab === 'MY_ROUTINE' && pTheme.wallpaperRoutine) return \`url(\${pTheme.wallpaperRoutine})\`;
      if (activeTab === 'COMMUNITY_SUPPORT' && pTheme.wallpaperCommunity) return \`url(\${pTheme.wallpaperCommunity})\`;
      if (activeTab === 'PROFILE' && pTheme.wallpaperProfile) return \`url(\${pTheme.wallpaperProfile})\`;
      // Global Fallback
      if (pTheme.wallpaperHome) return \`url(\${pTheme.wallpaperHome})\`;
      if (pTheme.pageBgColor) return pTheme.pageBgColor;
      if (pTheme.appBgColor) return pTheme.appBgColor;
    }

    const themeBg = (tierTheme as any).appBgColor as string | null | undefined;
    if (themeBg && themeBg !== '#ffffff' && themeBg !== '#f8fafc' && themeBg !== '#f1f5f9') return themeBg;
    const manual = (settings as any)?.appBackground;
    if (manual && manual !== '#ffffff') return manual;
    if (isDarkMode) {
      const themeType = localStorage.getItem('nst_dark_theme_type') || 'black';
      return themeType === 'blue' ? '#050d1f' : '#000000';
    }
    // Use tier's own appBg (e.g. Ultra = #f8fafc light grey, others = white)
    const tierAppBg = (tierTheme as any).appBg as string | undefined;
    return manual || tierAppBg || '#ffffff';
  })();

  const isBgImage = _appBg.startsWith('url(');`;

code = code.replace(_appBgRegex, replacement);

// Add bg size properties if image
const styleRegex = /style=\{\{ background: _appBg \}\}/g;
code = code.replace(styleRegex, "style={{ background: _appBg, backgroundSize: isBgImage ? 'cover' : undefined, backgroundPosition: isBgImage ? 'center' : undefined, backgroundAttachment: isBgImage ? 'fixed' : undefined }}");

fs.writeFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', code);
console.log('Patched dashboard backgrounds!');
