const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/utils/tierTheme.ts';
let content = fs.readFileSync(filepath, 'utf8');

const searchBlock = `  return {
    ...base,
    primary:         accent,
    mid:             t.accentGlow || accent,`;

const replaceBlock = `  return {
    ...base,
    primary:         accent,
    mid:             t.accentGlow || accent,
    globalWallpaper: (t as any).globalWallpaper || null,
    homeWallpaper:   (t as any).homeWallpaper || null,
    revisionWallpaper: (t as any).revisionWallpaper || null,
    routineWallpaper: (t as any).routineWallpaper || null,
    communityWallpaper: (t as any).communityWallpaper || null,
    profileWallpaper: (t as any).profileWallpaper || null,
    navHomeActive: (t as any).navHomeActive || '#22c55e',
    navRevisionActive: (t as any).navRevisionActive || '#06b6d4',
    navRoutineActive: (t as any).navRoutineActive || '#f59e0b',
    navCommunityActive: (t as any).navCommunityActive || '#ec4899',
    navProfileActive: (t as any).navProfileActive || '#8b5cf6',
    navHomeGlow: (t as any).navHomeGlow || '#22c55e',
    navRevisionGlow: (t as any).navRevisionGlow || '#06b6d4',
    navRoutineGlow: (t as any).navRoutineGlow || '#f59e0b',
    navCommunityGlow: (t as any).navCommunityGlow || '#ec4899',
    navProfileGlow: (t as any).navProfileGlow || '#8b5cf6',`;

content = content.replace(searchBlock, replaceBlock);
fs.writeFileSync(filepath, content);
console.log("tierTheme.ts updated.");
