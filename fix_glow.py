import re

filepath = "artifacts/iic-study-app/src/components/StudentDashboard.tsx"
with open(filepath, "r") as f:
    content = f.read()

# Update MeniscusNavIndicator props to accept glowColor
search_pattern_nav_def = r"const MeniscusNavIndicator = \(\{ activeIndex, totalTabs, navBg, navBorderColor, activeColor, ActiveIcon \}: \{ activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, ActiveIcon\?: React\.ElementType \}\) => \{"
replace_pattern_nav_def = "const MeniscusNavIndicator = ({ activeIndex, totalTabs, navBg, navBorderColor, activeColor, glowColor, ActiveIcon }: { activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, glowColor?: string, ActiveIcon?: React.ElementType }) => {"
content = re.sub(search_pattern_nav_def, replace_pattern_nav_def, content)

# Update the bead shadow
search_pattern_bead = r"(          className=\"absolute top-\[-14px\] left-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none\"\n          style=\{\{\n             backgroundColor: activeColor,\n             willChange: 'transform'\n          \}\})"
replace_pattern_bead = r"""          className="absolute top-[-14px] left-0 w-12 h-12 rounded-full flex items-center justify-center z-20 pointer-events-none"
          style={{
             backgroundColor: activeColor,
             boxShadow: `0 4px 14px ${glowColor || activeColor}80`,
             willChange: 'transform'
          }}"""
content = re.sub(search_pattern_bead, replace_pattern_bead, content)

# Pass glowColor to MeniscusNavIndicator
search_pattern_nav_call = r"(                  activeColor=\{[^}]*\}\n                  ActiveIcon=\{visibleTabs\[activeIndex\]\?\.Icon\}\n                \/>)"

replace_pattern_nav_call = """                  activeColor={(() => {
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
                  glowColor={(() => {
                    const t = tierTheme as any;
                    const activeTabId = visibleTabs[activeIndex]?.id;
                    if (activeTabId === 'HOME' && t.navGlowHome) return t.navGlowHome;
                    if (activeTabId === 'REVISION_HUB' && t.navGlowRevision) return t.navGlowRevision;
                    if (activeTabId === 'MY_ROUTINE' && t.navGlowRoutine) return t.navGlowRoutine;
                    if (activeTabId === 'COMMUNITY_SUPPORT' && t.navGlowCommunity) return t.navGlowCommunity;
                    if (activeTabId === 'PROFILE' && t.navGlowProfile) return t.navGlowProfile;
                    return _isNavDark ? (t.navActive || '#7dd3fc') : tierTheme.primary;
                  })()}
                  ActiveIcon={visibleTabs[activeIndex]?.Icon}
                />"""

# we already modified activeColor to have the logic inside the previous replace, we should replace that part too. Let's find exactly the call logic.
content = re.sub(r"                  activeColor=\{\(\(\) => \{[\s\S]*?\}\)\(\)\}\n                  ActiveIcon=\{visibleTabs\[activeIndex\]\?\.Icon\}\n                \/>", replace_pattern_nav_call, content)


with open(filepath, "w") as f:
    f.write(content)
