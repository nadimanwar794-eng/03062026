import re

with open('artifacts/iic-study-app/src/utils/themeContext.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'(export type TierThemeObj = typeof TIER_THEME\[keyof typeof TIER_THEME\] & \{.*?)(appBgColor\?: string \| null;)(\n\};)',
    r'\1\2\n  navHomeActive?: string;\n  navRevisionActive?: string;\n  navRoutineActive?: string;\n  navCommunityActive?: string;\n  navProfileActive?: string;\n  appBgImage?: string;\n  homeBgImage?: string;\n  revisionBgImage?: string;\n  routineBgImage?: string;\n  communityBgImage?: string;\n  profileBgImage?: string;\3',
    content,
    flags=re.DOTALL
)

with open('artifacts/iic-study-app/src/utils/themeContext.tsx', 'w') as f:
    f.write(content)

with open('artifacts/iic-study-app/src/utils/tierTheme.ts', 'r') as f:
    content2 = f.read()

content2 = re.sub(
    r'(export const buildGranularTierTheme = \(\n  base: typeof TIER_THEME\[UserTier\],\n  t: \{.*?)(accentGlow\?: string; progressColor\?: string;)(\n  \})',
    r'\1\2\n    navHomeActive?: string; navRevisionActive?: string; navRoutineActive?: string; navCommunityActive?: string; navProfileActive?: string;\n    appBgImage?: string; homeBgImage?: string; revisionBgImage?: string; routineBgImage?: string; communityBgImage?: string; profileBgImage?: string;\3',
    content2,
    flags=re.DOTALL
)

content2 = re.sub(
    r'(    // Granular extras — accessible via \(tierTheme as any\)\.xxx.*?)(appBgColor:      t\.bgColor      \|\| null,)(\n  \};)',
    r'\1\2\n    navHomeActive: t.navHomeActive || t.navActive || accent,\n    navRevisionActive: t.navRevisionActive || t.navActive || accent,\n    navRoutineActive: t.navRoutineActive || t.navActive || accent,\n    navCommunityActive: t.navCommunityActive || t.navActive || accent,\n    navProfileActive: t.navProfileActive || t.navActive || accent,\n    appBgImage: t.appBgImage,\n    homeBgImage: t.homeBgImage,\n    revisionBgImage: t.revisionBgImage,\n    routineBgImage: t.routineBgImage,\n    communityBgImage: t.communityBgImage,\n    profileBgImage: t.profileBgImage,\3',
    content2,
    flags=re.DOTALL
)


with open('artifacts/iic-study-app/src/utils/tierTheme.ts', 'w') as f:
    f.write(content2)

print("Updates completed")
