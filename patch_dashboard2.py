import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Replace _appBg definition again with correct tabs logic
old_app_bg = """  // ── App background: personalTheme bgColor → tier appBg → admin override → dark mode → white ──
  const _appBg = (() => {
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
  })();"""

new_app_bg = """  // ── App background: personalTheme bgColor → tier appBg → admin override → dark mode → white ──
  const _appBg = (() => {
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

  const _activeWallpaper = (() => {
    // If we're reading a lesson, don't show wallpaper (keep it clean)
    if (contentViewStep === 'PLAYER' && selectedChapter) return undefined;

    const t = tierTheme as any;
    const fallBack = t.wallpaperHome || undefined;

    if (activeTab === 'HOME' && t.wallpaperHome) return t.wallpaperHome;
    if (activeTab === 'REVISION_V2' && t.wallpaperRevision) return t.wallpaperRevision;
    if (activeTab === 'HOMEWORK' && t.wallpaperRoutine) return t.wallpaperRoutine;
    if (activeTab === 'COMMUNITY_SUPPORT' && t.wallpaperCommunity) return t.wallpaperCommunity;
    if (activeTab === 'PROFILE' && t.wallpaperProfile) return t.wallpaperProfile;

    return fallBack;
  })();"""

content = content.replace(old_app_bg, new_app_bg)

old_div = """  return (
  <ThemeProvider theme={_extendedTheme}>
    <div data-tier={tierTheme.tier} className="min-h-[100dvh] pb-0" style={{ background: _appBg }}>"""

new_div = """  return (
  <ThemeProvider theme={_extendedTheme}>
    <div
      data-tier={tierTheme.tier}
      className="min-h-[100dvh] pb-0"
      style={{
        background: _activeWallpaper ? `url(${_activeWallpaper}) center/cover fixed` : _appBg,
        backgroundColor: _activeWallpaper ? 'transparent' : _appBg
      }}
    >"""

content = content.replace(old_div, new_div)

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)
