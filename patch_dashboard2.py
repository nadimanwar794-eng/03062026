import re

file_path = 'artifacts/iic-study-app/src/components/StudentDashboard.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Update the glow that appears underneath the active icon
glow_find = """                            style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}"""

glow_replace = """                            style={(() => {
                              const pt = user.personalTheme;
                              if (tab.isActive && pt) {
                                if (tab.id === 'HOME' && pt.navHomeActive) return { color: pt.navHomeActive };
                                if (tab.id === 'REVISION_HUB' && pt.navRevisionActive) return { color: pt.navRevisionActive };
                                if (tab.id === 'MY_ROUTINE' && pt.navRoutineActive) return { color: pt.navRoutineActive };
                                if (tab.id === 'COMMUNITY_SUPPORT' && pt.navCommunityActive) return { color: pt.navCommunityActive };
                                if (tab.id === 'APP_STORE' && pt.navAppsActive) return { color: pt.navAppsActive };
                                if (tab.id === 'PROFILE' && pt.navProfileActive) return { color: pt.navProfileActive };
                                if (pt.navActive) return { color: pt.navActive };
                              }
                              return { color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') };
                            })()}"""

content = content.replace(glow_find, glow_replace, 1)

with open(file_path, 'w') as f:
    f.write(content)
