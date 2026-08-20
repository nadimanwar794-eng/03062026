import re

filepath = "artifacts/iic-study-app/src/components/StudentDashboard.tsx"
with open(filepath, "r") as f:
    content = f.read()

# Try another search pattern because the previous one might have failed due to whitespace/formatting mismatch

# Let's find _appBg definition
search_pattern_appBg = r"  // ── App background: personalTheme bgColor → tier appBg → admin override → dark mode → white ──\n  const _appBg = \(\(\) => \{\n[\s\S]*?  \}\)\(\);\n"

replace_pattern_bg = """  // ── App background & Wallpapers ──
  const logicalActiveMainTab = (() => {
    if (showRevisionHubScreen) return 'REVISION_HUB';
    if (showMyRoutine) return 'MY_ROUTINE';
    if (showChat) return 'COMMUNITY_SUPPORT';
    if (currentLogicalTab === 'PROFILE') return 'PROFILE';
    return 'HOME';
  })();

  const isReadingView = (contentViewStep === 'PLAYER' || !!hwActiveHwId || !!lucentNoteViewer || !!showHomeworkHistory);

  const _appWallpaper = (() => {
    if (isReadingView) return null; // No wallpaper in reading view
    const t = tierTheme as any;
    if (!t) return null;
    let customWp = null;
    if (logicalActiveMainTab === 'REVISION_HUB') customWp = t.wallpaperRevision;
    else if (logicalActiveMainTab === 'MY_ROUTINE') customWp = t.wallpaperRoutine;
    else if (logicalActiveMainTab === 'COMMUNITY_SUPPORT') customWp = t.wallpaperCommunity;
    else if (logicalActiveMainTab === 'PROFILE') customWp = t.wallpaperProfile;

    return customWp || t.wallpaperHome || null;
  })();

  // ── App background: personalTheme bgColor → tier appBg → admin override → dark mode → white ──
  const _appBg = (() => {
    const themeBg = (tierTheme as any).appBgColor as string | null | undefined;
    if (themeBg && themeBg !== '#ffffff' && themeBg !== '#f8fafc' && themeBg !== '#f1f5f9') return themeBg;
    const manual = (settings as any)?.appBackground;
    if (manual && manual !== '#ffffff') return manual;
    return isDarkMode ? '#050505' : (tierTheme.appBg || '#ffffff');
  })();
"""

if not 'logicalActiveMainTab =' in content:
    content = re.sub(search_pattern_appBg, replace_pattern_bg, content)
    content = content.replace("style={{ background: _appBg }}", "style={{ background: _appWallpaper ? `url(${_appWallpaper}) center/cover no-repeat fixed` : _appBg }}")

search_pattern_nav = r"                  navBorderColor=\{\(tierTheme as any\)\.navBorderColor \|\| tierTheme\.primary \+ '22'\}\n                  activeColor=\{_isNavDark \? \(\(tierTheme as any\)\.navActive \|\| '#7dd3fc'\) : tierTheme\.primary\}\n                  ActiveIcon=\{visibleTabs\[activeIndex\]\?\.Icon\}"

replace_pattern_nav = """                  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                  activeColor={(() => {
                    const t = tierTheme as any;
                    const defaultActive = _isNavDark ? (t.navActive || '#7dd3fc') : tierTheme.primary;
                    const activeTabId = visibleTabs[activeIndex]?.id;
                    if (activeTabId === 'HOME' && t.navActiveHome) return t.navActiveHome;
                    if (activeTabId === 'REVISION_HUB' && t.navActiveRevision) return t.navActiveRevision;
                    if (activeTabId === 'MY_ROUTINE' && t.navActiveRoutine) return t.navActiveRoutine;
                    if (activeTabId === 'COMMUNITY_SUPPORT' && t.navActiveCommunity) return t.navActiveCommunity;
                    if (activeTabId === 'PROFILE' && t.navActiveProfile) return t.navActiveProfile;
                    return defaultActive;
                  })()}
                  ActiveIcon={visibleTabs[activeIndex]?.Icon}"""

if 'if (activeTabId === \'HOME\' && t.navActiveHome) return t.navActiveHome;' not in content:
    content = re.sub(search_pattern_nav, replace_pattern_nav, content)


with open(filepath, "w") as f:
    f.write(content)
