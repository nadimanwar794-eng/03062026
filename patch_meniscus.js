const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Update MeniscusNavIndicator definition to accept glowColor
content = content.replace(
  /const MeniscusNavIndicator = \(\{ activeIndex, totalTabs, navBg, navBorderColor, activeColor, ActiveIcon \}: \{ activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, ActiveIcon\?: React\.ElementType \}\) => \{/,
  'const MeniscusNavIndicator = ({ activeIndex, totalTabs, navBg, navBorderColor, activeColor, glowColor, ActiveIcon }: { activeIndex: number, totalTabs: number, navBg: string, navBorderColor: string, activeColor: string, glowColor: string, ActiveIcon?: React.ElementType }) => {'
);

// In MeniscusNavIndicator, update the bead render to use glowColor
// Search for `<div ref={beadRef}` ... `boxShadow: \`0 4px 20px 2px \${activeColor}99\``
const beadRegex = /<div\s+ref=\{beadRef\}\s+className="absolute top-\[-12px\] w-\[48px\] h-\[48px\] rounded-full shadow-lg flex items-center justify-center z-20"\s+style=\{\{\s*left: 0,\s*background: \`radial-gradient\(circle at top left, \$\{activeColor\}dd, \$\{activeColor\}\)\`,\s*boxShadow: \`0 4px 20px 2px \$\{activeColor\}99\`,\s*\}\}\s*>/;
const beadReplace = `<div ref={beadRef} className="absolute top-[-12px] w-[48px] h-[48px] rounded-full shadow-lg flex items-center justify-center z-20" style={{ left: 0, background: \`radial-gradient(circle at top left, \${activeColor}dd, \${activeColor})\`, boxShadow: \`0 4px 20px 2px \${glowColor}99\`, }}>`;
content = content.replace(beadRegex, beadReplace);

// Now update the call to MeniscusNavIndicator
// In the render loop:
const callRegex = /<MeniscusNavIndicator\s+activeIndex=\{activeIndex\}\s+totalTabs=\{totalVisible\}\s+navBg=\{tierTheme\.navBg\}\s+navBorderColor=\{\(tierTheme as any\)\.navBorderColor \|\| tierTheme\.primary \+ '22'\}\s+activeColor=\{_isNavDark \? \(\(tierTheme as any\)\.navActive \|\| '#7dd3fc'\) : tierTheme\.primary\}\s+ActiveIcon=\{visibleTabs\[activeIndex\]\?\.Icon\}\s*\/>/;

const callReplace = `<MeniscusNavIndicator
                  activeIndex={activeIndex}
                  totalTabs={totalVisible}
                  navBg={tierTheme.navBg}
                  navBorderColor={(tierTheme as any).navBorderColor || tierTheme.primary + '22'}
                  activeColor={visibleTabs[activeIndex]?.activeColor || (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary)}
                  glowColor={visibleTabs[activeIndex]?.glowColor || (_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary)}
                  ActiveIcon={visibleTabs[activeIndex]?.Icon}
                />`;

content = content.replace(callRegex, callReplace);


// Update the icon colors inside the button loop
const buttonIconRegex = /style=\{\{ color: tab\.isActive \? \(_isNavDark \? \(\(tierTheme as any\)\.navActive \|\| '#7dd3fc'\) : tierTheme\.primary\) : \(_isNavDark \? 'rgba\(255,255,255,0\.72\)' : '#64748b'\) \}\}/g;
const buttonIconReplace = `style={{ color: tab.isActive ? tab.activeColor : (_isNavDark ? 'rgba(255,255,255,0.72)' : '#64748b') }}`;
content = content.replace(buttonIconRegex, buttonIconReplace);

const buttonIconRegex2 = /style=\{tab\.isActive \? \{ color: _isNavDark \? \(\(tierTheme as any\)\.navActive \|\| '#7dd3fc'\) : tierTheme\.primary \} : \{ color: _isNavDark \? 'rgba\(255,255,255,0\.65\)' : '#64748b' \}\}/g;
const buttonIconReplace2 = `style={tab.isActive ? { color: tab.activeColor } : { color: _isNavDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}`;
content = content.replace(buttonIconRegex2, buttonIconReplace2);

fs.writeFileSync(filepath, content);
console.log("Meniscus updated.");
