import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Update MeniscusNavIndicator component signature and usage
old_meniscus = """const MeniscusNavIndicator = ({ activeIndex, totalTabs, navBg, navBorderColor, activeColor, ActiveIcon }: { activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, ActiveIcon?: React.ElementType }) => {"""
new_meniscus = """const MeniscusNavIndicator = ({ activeIndex, totalTabs, navBg, navBorderColor, activeColor, glowColor, ActiveIcon }: { activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, glowColor: string, ActiveIcon?: React.ElementType }) => {"""

content = content.replace(old_meniscus, new_meniscus)

old_bead = """        {/* Glow Bead */}
        <div
          ref={beadRef}
          className="absolute top-1 left-0 w-12 h-12 rounded-full pointer-events-none transition-colors duration-300"
          style={{
            background: `radial-gradient(circle at center, ${activeColor} 0%, transparent 60%)`,
            opacity: 0.15
          }}
        />"""

new_bead = """        {/* Glow Bead */}
        <div
          ref={beadRef}
          className="absolute top-1 left-0 w-12 h-12 rounded-full pointer-events-none transition-colors duration-300"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 60%)`,
            opacity: 0.15
          }}
        />"""

content = content.replace(old_bead, new_bead)


# Find the MeniscusNavIndicator instantiation and update props
old_usage = """                <MeniscusNavIndicator
                  activeIndex={activeIndex}
                  totalTabs={totalVisible}
                  navBg={tierTheme.navBg}
                  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                  activeColor={_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary}
                  ActiveIcon={visibleTabs[activeIndex]?.Icon}
                />
                {visibleTabs.map((tab) => {"""

new_usage = """                <MeniscusNavIndicator
                  activeIndex={activeIndex}
                  totalTabs={totalVisible}
                  navBg={tierTheme.navBg}
                  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                  activeColor={(() => {
                    const t = tierTheme as any;
                    const def = _isNavDark ? (t.navActive || '#7dd3fc') : tierTheme.primary;
                    if (visibleTabs[activeIndex]?.id === 'HOME') return t.navHomeActive || '#22c55e';
                    if (visibleTabs[activeIndex]?.id === 'REVISION_V2') return t.navRevisionActive || '#06b6d4';
                    if (visibleTabs[activeIndex]?.id === 'HOMEWORK') return t.navRoutineActive || '#f59e0b';
                    if (visibleTabs[activeIndex]?.id === 'COMMUNITY_SUPPORT') return t.navCommunityActive || '#ec4899';
                    if (visibleTabs[activeIndex]?.id === 'PROFILE') return t.navProfileActive || '#8b5cf6';
                    return def;
                  })()}
                  glowColor={(() => {
                    const t = tierTheme as any;
                    const def = _isNavDark ? (t.navActive || '#7dd3fc') : tierTheme.primary;
                    if (visibleTabs[activeIndex]?.id === 'HOME') return t.navHomeGlow || '#22c55e';
                    if (visibleTabs[activeIndex]?.id === 'REVISION_V2') return t.navRevisionGlow || '#06b6d4';
                    if (visibleTabs[activeIndex]?.id === 'HOMEWORK') return t.navRoutineGlow || '#f59e0b';
                    if (visibleTabs[activeIndex]?.id === 'COMMUNITY_SUPPORT') return t.navCommunityGlow || '#ec4899';
                    if (visibleTabs[activeIndex]?.id === 'PROFILE') return t.navProfileGlow || '#8b5cf6';
                    return def;
                  })()}
                  ActiveIcon={visibleTabs[activeIndex]?.Icon}
                />
                {visibleTabs.map((tab) => {"""

content = content.replace(old_usage, new_usage)

old_tab_style = """                      <span
                        className="relative z-10 flex flex-col items-center justify-center h-full w-full gap-0.5"
                        style={tab.isActive ? { color: _isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary } : { color: _isNavDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}
                      >"""

new_tab_style = """                      <span
                        className="relative z-10 flex flex-col items-center justify-center h-full w-full gap-0.5"
                        style={tab.isActive ? { color: (() => {
                          const t = tierTheme as any;
                          const def = _isNavDark ? (t.navActive || '#7dd3fc') : tierTheme.primary;
                          if (tab.id === 'HOME') return t.navHomeActive || '#22c55e';
                          if (tab.id === 'REVISION_V2') return t.navRevisionActive || '#06b6d4';
                          if (tab.id === 'HOMEWORK') return t.navRoutineActive || '#f59e0b';
                          if (tab.id === 'COMMUNITY_SUPPORT') return t.navCommunityActive || '#ec4899';
                          if (tab.id === 'PROFILE') return t.navProfileActive || '#8b5cf6';
                          return def;
                        })() } : { color: _isNavDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}
                      >"""

content = content.replace(old_tab_style, new_tab_style)

old_icon_style = """                          <Icon
                            size={22}
                            strokeWidth={tab.isActive ? 2.5 : 2}
                            className={`transition-all duration-300 ${
                              tab.isActive ? "nav-icon-pop scale-110 -translate-y-2" : "scale-100"
                            }`}
                            style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}
                            fill={"""

new_icon_style = """                          <Icon
                            size={22}
                            strokeWidth={tab.isActive ? 2.5 : 2}
                            className={`transition-all duration-300 ${
                              tab.isActive ? "nav-icon-pop scale-110 -translate-y-2" : "scale-100"
                            }`}
                            style={{ color: tab.isActive ? (() => {
                              const t = tierTheme as any;
                              const def = _isNavDark ? (t.navActive || '#7dd3fc') : tierTheme.primary;
                              if (tab.id === 'HOME') return t.navHomeActive || '#22c55e';
                              if (tab.id === 'REVISION_V2') return t.navRevisionActive || '#06b6d4';
                              if (tab.id === 'HOMEWORK') return t.navRoutineActive || '#f59e0b';
                              if (tab.id === 'COMMUNITY_SUPPORT') return t.navCommunityActive || '#ec4899';
                              if (tab.id === 'PROFILE') return t.navProfileActive || '#8b5cf6';
                              return def;
                            })() : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}
                            fill={"""

content = content.replace(old_icon_style, new_icon_style)

old_ripple_style = """                          <div
                            key={`ripple-${tab.id}-${navTapKeys[tab.id]}`}
                            className="nav-ripple-burst pointer-events-none absolute inset-0 m-auto rounded-full"
                            style={{ color: tab.isActive ? (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary) : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}
                          />"""

new_ripple_style = """                          <div
                            key={`ripple-${tab.id}-${navTapKeys[tab.id]}`}
                            className="nav-ripple-burst pointer-events-none absolute inset-0 m-auto rounded-full"
                            style={{ color: tab.isActive ? (() => {
                              const t = tierTheme as any;
                              const def = _isNavDark ? (t.navActive || '#7dd3fc') : tierTheme.primary;
                              if (tab.id === 'HOME') return t.navHomeActive || '#22c55e';
                              if (tab.id === 'REVISION_V2') return t.navRevisionActive || '#06b6d4';
                              if (tab.id === 'HOMEWORK') return t.navRoutineActive || '#f59e0b';
                              if (tab.id === 'COMMUNITY_SUPPORT') return t.navCommunityActive || '#ec4899';
                              if (tab.id === 'PROFILE') return t.navProfileActive || '#8b5cf6';
                              return def;
                            })() : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}
                          />"""

content = content.replace(old_ripple_style, new_ripple_style)


with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)
