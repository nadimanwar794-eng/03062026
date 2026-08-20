const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// The bottom nav renders the icons. Let's find where we map over the tabs array for the nav.
// Usually something like: `const tabs: Array<{ id: LogicalTab, label: string, Icon: any ... }>`

const tabsRegex = /id: "HOME",[\s\S]*?id: "PROFILE"/;
if (content.match(tabsRegex)) {
  console.log("Found tabs declaration.");
}

// In the rendering block:
// <span key={tab.isActive ? ...
// We need to pass the dynamic color for each tab.
// Let's modify the tabs definition to include their activeColor and glowColor from tierTheme.

const tabsDefStart = `            const tabs: Array<{
              id: LogicalTab;
              label: string;
              Icon: any;
              featureId?: string;
              filledOnActive?: boolean;
              isActive: boolean;
              onClick: () => void;
            }> = [`;

const tabsDefReplace = `            const tabs: Array<{
              id: LogicalTab;
              label: string;
              Icon: any;
              featureId?: string;
              filledOnActive?: boolean;
              isActive: boolean;
              onClick: () => void;
              activeColor?: string;
              glowColor?: string;
            }> = [`;

content = content.replace(tabsDefStart, tabsDefReplace);

const homeBlock = `              {
                id: "HOME",
                label: "Home",
                Icon: Home,
                featureId: "NAV_HOME",
                filledOnActive: true,
                // When the Important Notes overlay is open, Home should NOT
                // appear active — only ONE bottom-nav tab can be active at a
                // time. Same rule applies to all sibling tabs below.
                isActive: !showStarredPage && !showChat && !showRevisionHubScreen && !showMyRoutine && !showDailyEventPage && !showProgressDashboard && currentLogicalTab === "HOME",
                onClick: () => switchToLogicalTab("HOME"),
              },`;
const homeReplace = homeBlock.replace('onClick: () => switchToLogicalTab("HOME"),', 'onClick: () => switchToLogicalTab("HOME"),\n                activeColor: (tierTheme as any).navHomeActive || \'#22c55e\',\n                glowColor: (tierTheme as any).navHomeGlow || \'#22c55e\',');

content = content.replace(homeBlock, homeReplace);

const revisionBlock = `              {
                id: "REVISION_HUB" as any,
                label: "Revision",
                Icon: BrainCircuit,
                filledOnActive: true,
                isActive: showRevisionHubScreen,
                onClick: () => {
                  if (activeTab === "REVISION_HUB") return;
                  switchToLogicalTab("REVISION_HUB");
                }
              },`;
const revisionReplace = revisionBlock.replace('switchToLogicalTab("REVISION_HUB");\n                }', 'switchToLogicalTab("REVISION_HUB");\n                },\n                activeColor: (tierTheme as any).navRevisionActive || \'#06b6d4\',\n                glowColor: (tierTheme as any).navRevisionGlow || \'#06b6d4\',');

content = content.replace(revisionBlock, revisionReplace);

const routineBlock = `              {
                id: "MY_ROUTINE" as any,
                label: "Routine",
                Icon: CheckSquare,
                filledOnActive: true,
                isActive: showMyRoutine,
                onClick: () => {
                  if (activeTab === "MY_ROUTINE") return;
                  switchToLogicalTab("MY_ROUTINE");
                }
              },`;
const routineReplace = routineBlock.replace('switchToLogicalTab("MY_ROUTINE");\n                }', 'switchToLogicalTab("MY_ROUTINE");\n                },\n                activeColor: (tierTheme as any).navRoutineActive || \'#f59e0b\',\n                glowColor: (tierTheme as any).navRoutineGlow || \'#f59e0b\',');

content = content.replace(routineBlock, routineReplace);

const communityBlock = `              {
                id: "COMMUNITY_SUPPORT" as any,
                label: "Community",
                Icon: Users,
                featureId: "COMMUNITY_SUPPORT",
                filledOnActive: true,
                isActive: currentLogicalTab === "COMMUNITY_SUPPORT",
                onClick: () => {
                  switchToLogicalTab("COMMUNITY_SUPPORT");
                }
              },`;
const communityReplace = communityBlock.replace('switchToLogicalTab("COMMUNITY_SUPPORT");\n                }', 'switchToLogicalTab("COMMUNITY_SUPPORT");\n                },\n                activeColor: (tierTheme as any).navCommunityActive || \'#ec4899\',\n                glowColor: (tierTheme as any).navCommunityGlow || \'#ec4899\',');

content = content.replace(communityBlock, communityReplace);

const profileBlock = `              {
                id: "PROFILE",
                label: "Profile",
                Icon: UserCircle,
                filledOnActive: true,
                isActive: currentLogicalTab === "PROFILE",
                onClick: () => switchToLogicalTab("PROFILE"),
              }`;
const profileReplace = profileBlock.replace('onClick: () => switchToLogicalTab("PROFILE"),', 'onClick: () => switchToLogicalTab("PROFILE"),\n                activeColor: (tierTheme as any).navProfileActive || \'#8b5cf6\',\n                glowColor: (tierTheme as any).navProfileGlow || \'#8b5cf6\',');

content = content.replace(profileBlock, profileReplace);

// Now apply these colors to the render block
// Replace tierTheme.navActive and tierTheme.navGlow with tab.activeColor and tab.glowColor

const renderSpanRegex = /style=\{\{\s*color: tab\.isActive \? \(isDarkMode \? 'white' : tierTheme\.navActive\) : _navInactive,\s*\}\}/;
const renderSpanReplace = `style={{ color: tab.isActive ? (isDarkMode ? 'white' : tab.activeColor) : _navInactive }}`;

content = content.replace(renderSpanRegex, renderSpanReplace);
content = content.replace(renderSpanRegex, renderSpanReplace); // in case there are multiple matches (there shouldn't be for this specific line though)

// Update the active indicator glow
// Look for `<div ... background: tierTheme.navActive ... boxShadow: \`0 8px 32px 4px \${tierTheme.navGlow}\` ... >`
// Actually, it uses a calculated absolute position pill for the background pill sliding effect.
// Let's find it.
const activeIndicatorRegex = /<div\s+className="absolute top-1\/2 -translate-y-1\/2 h-\[42px\] rounded-full transition-all duration-500 \[transition-timing-function:cubic-bezier\(0\.34,1\.56,0\.64,1\)\] \!pointer-events-none z-0"\s+style=\{\{\s*left: \`\$\{activeTabX\}px\`,\s*width: \`\$\{activeTabWidth\}px\`,\s*background: tierTheme\.navActive,\s*boxShadow: \`0 8px 32px 4px \$\{tierTheme\.navGlow\}\`,\s*\}\}\s*\/>/;

// The sliding pill needs the active tab's color. Let's find out how active tab color can be retrieved.
const newIndicatorBlock = `                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-[42px] rounded-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] !pointer-events-none z-0"
                    style={{
                      left: \`\${activeTabX}px\`,
                      width: \`\${activeTabWidth}px\`,
                      background: tabs.find(t => t.isActive)?.activeColor || tierTheme.navActive,
                      boxShadow: \`0 8px 32px 4px \${tabs.find(t => t.isActive)?.glowColor || tierTheme.navGlow}\`,
                    }}
                  />`;
content = content.replace(activeIndicatorRegex, newIndicatorBlock);

fs.writeFileSync(filepath, content);
console.log("StudentDashboard phase 2 updated.");
