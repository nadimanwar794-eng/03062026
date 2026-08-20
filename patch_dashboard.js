const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// We need to resolve the active wallpaper and render it.
// Let's locate `const _appBg` inside StudentDashboard
const findAppBgRegex = /const _appBg = \(\(\) => \{[\s\S]*?\}\)\(\);/;
const appBgMatch = content.match(findAppBgRegex);

if (appBgMatch) {
    const afterAppBg = `
  // Resolve active wallpaper
  const activeWallpaper = (() => {
    // Check if we are in lesson/notes view. If so, return null to bypass wallpaper
    if (navStateRef.current.activeTab === 'MCQ' || navStateRef.current.activeTab === 'PDF' || navStateRef.current.activeTab === 'VIDEO' || state.view === 'LESSON') return null;

    const tTheme = tierTheme as any;
    let wallpaper = null;

    if (currentLogicalTab === 'REVISION_HUB') wallpaper = tTheme.revisionWallpaper;
    else if (currentLogicalTab === 'MY_ROUTINE') wallpaper = tTheme.routineWallpaper;
    else if (currentLogicalTab === 'COMMUNITY_SUPPORT') wallpaper = tTheme.communityWallpaper;
    else if (currentLogicalTab === 'PROFILE') wallpaper = tTheme.profileWallpaper;

    if (!wallpaper) wallpaper = tTheme.homeWallpaper || tTheme.globalWallpaper;
    return wallpaper || null;
  })();
`;
    content = content.replace(appBgMatch[0], appBgMatch[0] + '\n' + afterAppBg);
} else {
    console.log("Could not find _appBg block.");
}

// Next, let's locate the background style usage
// It's used in several places, but the main wrapper usually is: `<div className="min-h-[100dvh] pb-0" style={{ background: _appBg }}>`
const mainDivRegex = /<div data-tier=\{tierTheme.tier\} className="min-h-\[100dvh\] pb-0" style=\{\{ background: _appBg \}\}>/;
const mainDivReplace = `<div data-tier={tierTheme.tier} className="min-h-[100dvh] pb-0" style={{ background: activeWallpaper ? \`url(\${activeWallpaper}) center/cover no-repeat fixed\` : _appBg }}>`;

if (content.includes('<div data-tier={tierTheme.tier} className="min-h-[100dvh] pb-0" style={{ background: _appBg }}>')) {
    content = content.replace('<div data-tier={tierTheme.tier} className="min-h-[100dvh] pb-0" style={{ background: _appBg }}>', mainDivReplace);
} else {
    console.log("Could not find main wrapper div");
}

fs.writeFileSync(filepath, content);
console.log("StudentDashboard phase 1 updated.");
