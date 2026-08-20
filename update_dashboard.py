import re

with open('./artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Add getTabColor function and _activeMainTabId / _wallpaperBg
add_before = "const _appBg = (() => {"
code_to_add = """
  const _activeMainTabId = (() => {
    if (showRevisionHubScreen) return 'REVISION_HUB';
    if (showMyRoutine) return 'ROUTINE';
    if (showChat) return 'CHAT';
    if (currentLogicalTab === 'PROFILE') return 'PROFILE';
    return 'HOME';
  })();

  const getTabColor = (tabId: string) => {
    const tt = tierTheme as any;
    if (tabId === 'HOME') return tt.homeTabColor || tt.navActive || tt.primary;
    if (tabId === 'REVISION_HUB') return tt.revisionTabColor || tt.navActive || tt.primary;
    if (tabId === 'ROUTINE') return tt.routineTabColor || tt.navActive || tt.primary;
    if (tabId === 'COMMUNITY' || tabId === 'CHAT') return tt.communityTabColor || tt.navActive || tt.primary;
    if (tabId === 'PROFILE') return tt.profileTabColor || tt.navActive || tt.primary;
    return tt.navActive || tt.primary;
  };

  const _wallpaperBg = (() => {
    if (lucentNoteViewer || hwActiveHwId || isFullScreenContent || (activeTab === 'MCQ' || activeTab === 'VIDEO' || activeTab === 'PDF' || activeTab === 'AUDIO')) {
      return null;
    }
    const tt = tierTheme as any;
    let wp = tt.homeWallpaper || null;
    if (_activeMainTabId === 'REVISION_HUB' && tt.revisionWallpaper) wp = tt.revisionWallpaper;
    if (_activeMainTabId === 'ROUTINE' && tt.routineWallpaper) wp = tt.routineWallpaper;
    if (_activeMainTabId === 'CHAT' && tt.communityWallpaper) wp = tt.communityWallpaper;
    if (_activeMainTabId === 'PROFILE' && tt.profileWallpaper) wp = tt.profileWallpaper;
    if (_activeMainTabId === 'HOME' && tt.homeWallpaper) wp = tt.homeWallpaper;
    return wp;
  })();

"""

if "const _activeMainTabId" not in content:
    content = content.replace(add_before, code_to_add + add_before)

# Update MeniscusNavIndicator properties
meniscus_search = """                <MeniscusNavIndicator
  activeIndex={activeIndex}
  totalTabs={totalVisible}
  navBg={tierTheme.navBg}
  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + "22"}
  activeColor="#22c55e"
  ActiveIcon={visibleTabs[activeIndex]?.icon}
/>"""
meniscus_replace = """                <MeniscusNavIndicator
  activeIndex={activeIndex}
  totalTabs={totalVisible}
  navBg={tierTheme.navBg}
  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + "22"}
  activeColor={visibleTabs[activeIndex] ? getTabColor(visibleTabs[activeIndex].id) : "#22c55e"}
  ActiveIcon={visibleTabs[activeIndex]?.icon}
/>"""
content = content.replace(meniscus_search, meniscus_replace)

# Update Tab Button Color
tab_color_search = """style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}"""
tab_color_replace = """style={{ color: tab.isActive ? getTabColor(tab.id) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}"""
content = content.replace(tab_color_search, tab_color_replace)

# Apply wallpaper style to the main wrapper
main_wrapper_search = """<div data-tier={tierTheme.tier} className="min-h-[100dvh] pb-0" style={{ background: _appBg }}>"""
main_wrapper_replace = """<div data-tier={tierTheme.tier} className="min-h-[100dvh] pb-0 bg-cover bg-center bg-no-repeat bg-fixed" style={{ background: _appBg, backgroundImage: _wallpaperBg ? `url(${_wallpaperBg})` : undefined }}>"""
content = content.replace(main_wrapper_search, main_wrapper_replace)

with open('./artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)
