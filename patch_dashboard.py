import re

file_path = 'artifacts/iic-study-app/src/components/StudentDashboard.tsx'
with open(file_path, 'r') as f:
    content = f.read()


# Get custom colors setup for the menicus indicator
dashboard_active_color_find = """  navBg={tierTheme.navBg}
  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + "22"}
  activeColor="#22c55e"
  ActiveIcon={visibleTabs[activeIndex]?.icon}"""

dashboard_active_color_replace = """  navBg={tierTheme.navBg}
  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + "22"}
  activeColor={(() => {
    const actId = visibleTabs[activeIndex]?.id;
    const pt = user.personalTheme;
    if (actId === 'HOME') return pt?.navHomeActive || pt?.navActive || "#22c55e";
    if (actId === 'REVISION_HUB') return pt?.navRevisionActive || pt?.navActive || "#22c55e";
    if (actId === 'MY_ROUTINE') return pt?.navRoutineActive || pt?.navActive || "#22c55e";
    if (actId === 'COMMUNITY_SUPPORT') return pt?.navCommunityActive || pt?.navActive || "#22c55e";
    if (actId === 'APP_STORE') return pt?.navAppsActive || pt?.navActive || "#22c55e";
    if (actId === 'PROFILE') return pt?.navProfileActive || pt?.navActive || "#22c55e";
    return pt?.navActive || "#22c55e";
  })()}
  ActiveIcon={visibleTabs[activeIndex]?.icon}"""
content = content.replace(dashboard_active_color_find, dashboard_active_color_replace)

# Update individual tabs logic
tab_glow_find = """                            style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}
                          />
                        )}
                        <Icon
                          className={`w-6 h-6 z-10 transition-transform duration-300 ${
                            tab.isActive ? "nav-icon-pop scale-110 -translate-y-2" : "scale-100"
                          }`}
                        />
                        {tab.id !== 'HOME' && (navTapKeys[tab.id] || 0) > 0 && (
                          <div
                            key={`ripple-${tab.id}-${navTapKeys[tab.id]}`}
                            className="nav-ripple-burst pointer-events-none absolute inset-0 m-auto rounded-full"
                            style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.65)' : '#64748b') }}
                          />
                        )}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold tracking-tight z-10 leading-[1.1] transition-all duration-300 delay-75 ${
                          tab.isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>"""

tab_glow_replace = """                            style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}
                          />
                        )}
                        <Icon
                          className={`w-6 h-6 z-10 transition-transform duration-300 ${
                            tab.isActive ? "nav-icon-pop scale-110 -translate-y-2" : "scale-100"
                          }`}
                          style={(() => {
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
                            return {};
                          })()}
                        />
                        {tab.id !== 'HOME' && (navTapKeys[tab.id] || 0) > 0 && (
                          <div
                            key={`ripple-${tab.id}-${navTapKeys[tab.id]}`}
                            className="nav-ripple-burst pointer-events-none absolute inset-0 m-auto rounded-full"
                            style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.65)' : '#64748b') }}
                          />
                        )}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold tracking-tight z-10 leading-[1.1] transition-all duration-300 delay-75 ${
                          tab.isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                        }`}
                        style={(() => {
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
                            return {};
                          })()}
                      >
                        {tab.label}
                      </span>
                    </button>"""
content = content.replace(tab_glow_find, tab_glow_replace)


with open(file_path, 'w') as f:
    f.write(content)
