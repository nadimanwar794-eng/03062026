const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Update ThemeState interface
content = content.replace(
  /    themeEmoji\?: string;\n\}/,
  `    themeEmoji?: string;\n    globalWallpaper?: string;\n    homeWallpaper?: string;\n    revisionWallpaper?: string;\n    routineWallpaper?: string;\n    communityWallpaper?: string;\n    profileWallpaper?: string;\n    navHomeActive?: string;\n    navRevisionActive?: string;\n    navRoutineActive?: string;\n    navCommunityActive?: string;\n    navProfileActive?: string;\n    navHomeGlow?: string;\n    navRevisionGlow?: string;\n    navRoutineGlow?: string;\n    navCommunityGlow?: string;\n    navProfileGlow?: string;\n}`
);

// 2. Update DEFAULT_THEME
content = content.replace(
  /    chapterAccent: '#1e3a5f',\n    mcqTabActive: '#1e3a5f',\n    topBarEffect: 'none',\n    animColor: '#2563eb',\n    animSpeed: 1,\n    themeName: '',\n    themeEmoji: '🎨',\n\};/,
  `    chapterAccent: '#1e3a5f',\n    mcqTabActive: '#1e3a5f',\n    topBarEffect: 'none',\n    animColor: '#2563eb',\n    animSpeed: 1,\n    themeName: '',\n    themeEmoji: '🎨',\n    globalWallpaper: '',\n    homeWallpaper: '',\n    revisionWallpaper: '',\n    routineWallpaper: '',\n    communityWallpaper: '',\n    profileWallpaper: '',\n    navHomeActive: '#22c55e',\n    navRevisionActive: '#06b6d4',\n    navRoutineActive: '#f59e0b',\n    navCommunityActive: '#ec4899',\n    navProfileActive: '#8b5cf6',\n    navHomeGlow: '#22c55e',\n    navRevisionGlow: '#06b6d4',\n    navRoutineGlow: '#f59e0b',\n    navCommunityGlow: '#ec4899',\n    navProfileGlow: '#8b5cf6',\n};`
);

fs.writeFileSync(filepath, content);
console.log("ThemeCustomizer phase 1 updated.");
