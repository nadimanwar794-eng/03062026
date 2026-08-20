const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/types.ts';
let content = fs.readFileSync(filepath, 'utf8');

const replacement = `  themeName?: string;
  themeEmoji?: string;
  globalWallpaper?: string;
  homeWallpaper?: string;
  revisionWallpaper?: string;
  routineWallpaper?: string;
  communityWallpaper?: string;
  profileWallpaper?: string;
  navHomeActive?: string;
  navRevisionActive?: string;
  navRoutineActive?: string;
  navCommunityActive?: string;
  navProfileActive?: string;
  navHomeGlow?: string;
  navRevisionGlow?: string;
  navRoutineGlow?: string;
  navCommunityGlow?: string;
  navProfileGlow?: string;
  createdAt: string;`;

content = content.replace(/  themeName\?: string;\n  themeEmoji\?: string;\n  createdAt: string;/, replacement);

fs.writeFileSync(filepath, content);
console.log("Types updated.");
