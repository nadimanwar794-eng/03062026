const fs = require('fs');
let code = fs.readFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'utf8');

const navCode = `<MeniscusNavIndicator
                  activeIndex={activeIndex}
                  totalTabs={totalVisible}
                  navBg={tierTheme.navBg}
                  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                  activeColor={_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary}
                  ActiveIcon={visibleTabs[activeIndex]?.Icon}
                />`;

const replacedNav = `{(() => {
                  const pTheme = user?.personalTheme || user?.customTheme;
                  const getTabColor = (tabId: string, type: 'active' | 'glow') => {
                    if (!pTheme) return null;
                    if (tabId === 'HOME') return type === 'active' ? pTheme.navHomeActive : pTheme.navHomeGlow;
                    if (tabId === 'REVISION_HUB') return type === 'active' ? pTheme.navRevisionActive : pTheme.navRevisionGlow;
                    if (tabId === 'MY_ROUTINE') return type === 'active' ? pTheme.navRoutineActive : pTheme.navRoutineGlow;
                    if (tabId === 'COMMUNITY_SUPPORT') return type === 'active' ? pTheme.navCommunityActive : pTheme.navCommunityGlow;
                    if (tabId === 'PROFILE') return type === 'active' ? pTheme.navProfileActive : pTheme.navProfileGlow;
                    return null;
                  };

                  const activeTabId = visibleTabs[activeIndex]?.id;
                  let customColor = getTabColor(activeTabId, 'active');
                  let fallbackColor = _isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary;

                  return (
                    <MeniscusNavIndicator
                      activeIndex={activeIndex}
                      totalTabs={totalVisible}
                      navBg={tierTheme.navBg}
                      navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                      activeColor={customColor || fallbackColor}
                      ActiveIcon={visibleTabs[activeIndex]?.Icon}
                    />
                  );
                })()}`;

if (code.includes(navCode)) {
  code = code.replace(navCode, replacedNav);
  fs.writeFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', code);
  console.log('Patched MeniscusNavIndicator!');
} else {
  console.log('Could not find nav component to patch.');
}
