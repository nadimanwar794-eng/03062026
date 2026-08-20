import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update _appBg to support image logic but keeping it simple by not returning URL here, but creating a new _appBgImage variable
app_bg_image_logic = """
  // ── App background image: tab-specific -> home fallback -> app global fallback ──
  const _appBgImage = (() => {
    // We only apply wallpapers to main generic views, not reading modes.
    if (view === 'LESSON' || view === 'NOTES' || view === 'UNIVERSAL_CHAT' || view === 'UNIVERSAL_VIDEO') {
       return null;
    }
    const tt = tierTheme as any;
    // Map active tab to potential background image
    let currentTabBg = null;
    if (activeTab === 'HOME') currentTabBg = tt.homeBgImage;
    else if (activeTab === 'REVISION') currentTabBg = tt.revisionBgImage;
    else if (activeTab === 'ROUTINE') currentTabBg = tt.routineBgImage;
    else if (activeTab === 'COMMUNITY') currentTabBg = tt.communityBgImage;
    else if (activeTab === 'PROFILE') currentTabBg = tt.profileBgImage;

    // Fallback logic: 1. Current tab, 2. Home tab bg, 3. Global App bg
    return currentTabBg || tt.homeBgImage || tt.appBgImage || null;
  })();
"""

# Insert _appBgImage calculation right after _appBg definition
content = re.sub(
    r'(  const _appBg = \(\(\) => \{.*?\n  \}\)\(\);\n)',
    r'\1' + app_bg_image_logic,
    content,
    flags=re.DOTALL
)

# Replace all `<div className={`min-h-[100dvh] ...`} style={{ background: _appBg }}>` with style having background image too
def replace_style(m):
    # Only replace if background image isn't already there
    if 'backgroundImage' in m.group(0):
        return m.group(0)
    return m.group(0).replace('style={{ background: _appBg }}', 'style={{ background: _appBg, backgroundImage: _appBgImage ? `url(${_appBgImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}')

content = re.sub(r'<div[^>]*?style=\{\{ background: _appBg \}\}[^>]*?>', replace_style, content)

# 2. Update MeniscusNavIndicator logic to use per-tab colors
# Find the rendering of MeniscusNavIndicator
meniscus_replacement = """
                <MeniscusNavIndicator
                  activeIndex={activeIndex}
                  totalTabs={totalVisible}
                  navBg={tierTheme.navBg}
                  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                  activeColor={(() => {
                     const currentId = visibleTabs[activeIndex]?.id;
                     const tt = tierTheme as any;
                     if (currentId === 'HOME') return tt.navHomeActive || tt.navActive || tierTheme.primary;
                     if (currentId === 'REVISION') return tt.navRevisionActive || tt.navActive || tierTheme.primary;
                     if (currentId === 'ROUTINE') return tt.navRoutineActive || tt.navActive || tierTheme.primary;
                     if (currentId === 'COMMUNITY' || currentId === 'UNIVERSAL_CHAT') return tt.navCommunityActive || tt.navActive || tierTheme.primary;
                     if (currentId === 'PROFILE') return tt.navProfileActive || tt.navActive || tierTheme.primary;
                     return _isNavDark ? (tt.navActive || '#7dd3fc') : tierTheme.primary;
                  })()}
                  ActiveIcon={visibleTabs[activeIndex]?.Icon}
                />
"""
content = re.sub(
    r'<MeniscusNavIndicator\s*activeIndex=\{activeIndex\}\s*totalTabs=\{totalVisible\}\s*navBg=\{tierTheme\.navBg\}\s*navBorderColor=\{\(tierTheme as any\)\.navBorderColor \|\| tierTheme\.primary \+ \'22\'\}\s*activeColor=\{_isNavDark \? \(\(tierTheme as any\)\.navActive \|\| \'#7dd3fc\'\) : tierTheme\.primary\}\s*ActiveIcon=\{visibleTabs\[activeIndex\]\?\.Icon\}\s*/>',
    meniscus_replacement,
    content,
    flags=re.DOTALL
)

# And inside visibleTabs.map, when setting color of text/icon for active tab
tab_color_replacement = """
                    <p className={`text-[9px] font-bold mt-[3px] leading-none text-center truncate w-[110%] ml-[-5%] transition-colors duration-300 ${tab.isActive ? "" : _isNavDark ? "text-slate-400" : "text-slate-500"}`}
                       style={{ color: tab.isActive ? (
                         tab.id === 'HOME' ? (tierTheme as any).navHomeActive :
                         tab.id === 'REVISION' ? (tierTheme as any).navRevisionActive :
                         tab.id === 'ROUTINE' ? (tierTheme as any).navRoutineActive :
                         (tab.id === 'COMMUNITY' || tab.id === 'UNIVERSAL_CHAT') ? (tierTheme as any).navCommunityActive :
                         tab.id === 'PROFILE' ? (tierTheme as any).navProfileActive :
                         ((tierTheme as any).navActive || tierTheme.primary)
                       ) : undefined }}>
"""
content = re.sub(
    r'<p className=\{`text-\[9px\] font-bold mt-\[3px\] leading-none text-center truncate w-\[110%\] ml-\[-5%\] transition-colors duration-300 \$\{tab\.isActive \? "" : _isNavDark \? "text-slate-400" : "text-slate-500"\} `\}\s*style=\{\{ color: tab\.isActive \? \(\(tierTheme as any\)\.navActive \|\| tierTheme\.primary\) : undefined \}\}>',
    tab_color_replacement,
    content,
    flags=re.DOTALL
)

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)

print("Dashboard Updated")
