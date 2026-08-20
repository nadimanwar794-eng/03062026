const fs = require('fs');
let code = fs.readFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'utf8');

const targetStr = `const MeniscusNavIndicator = ({ activeIndex, totalTabs, navBg, navBorderColor, activeColor, ActiveIcon }: { activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, ActiveIcon?: React.ElementType }) => {`;

const newTargetStr = `const MeniscusNavIndicator = ({ activeIndex, totalTabs, navBg, navBorderColor, activeColor, glowColor, ActiveIcon }: { activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, glowColor?: string, ActiveIcon?: React.ElementType }) => {`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newTargetStr);
  console.log('Patched MeniscusNavIndicator props');
}

const renderStr = `<div
          ref={beadRef}
          className="absolute top-0 left-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-none z-10"
          style={{
            background: \`radial-gradient(circle at top, \${activeColor}, \${activeColor}dd)\`,
            boxShadow: \`0 -4px 16px \${activeColor}80, inset 0 2px 4px rgba(255,255,255,0.4)\`,
            transform: \`translateX(-100px)\` // hidden until mount
          }}
        >`;

const newRenderStr = `<div
          ref={beadRef}
          className="absolute top-0 left-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-none z-10"
          style={{
            background: \`radial-gradient(circle at top, \${activeColor}, \${activeColor}dd)\`,
            boxShadow: \`0 -4px 16px \${glowColor || activeColor}80, inset 0 2px 4px rgba(255,255,255,0.4)\`,
            transform: \`translateX(-100px)\` // hidden until mount
          }}
        >`;

if (code.includes(renderStr)) {
  code = code.replace(renderStr, newRenderStr);
  console.log('Patched MeniscusNavIndicator render');
}

const navUsage = `<MeniscusNavIndicator
                      activeIndex={activeIndex}
                      totalTabs={totalVisible}
                      navBg={tierTheme.navBg}
                      navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                      activeColor={customColor || fallbackColor}
                      ActiveIcon={visibleTabs[activeIndex]?.Icon}
                    />`;

const newNavUsage = `<MeniscusNavIndicator
                      activeIndex={activeIndex}
                      totalTabs={totalVisible}
                      navBg={tierTheme.navBg}
                      navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                      activeColor={customColor || fallbackColor}
                      glowColor={getTabColor(activeTabId, 'glow') || fallbackColor}
                      ActiveIcon={visibleTabs[activeIndex]?.Icon}
                    />`;

if (code.includes(navUsage)) {
  code = code.replace(navUsage, newNavUsage);
  console.log('Patched MeniscusNavIndicator usage');
}

fs.writeFileSync('artifacts/iic-study-app/src/components/StudentDashboard.tsx', code);
