import re

filepath = "artifacts/iic-study-app/src/utils/tierTheme.ts"
with open(filepath, "r") as f:
    content = f.read()

new_fields = """    bgHome: t.bgHome,
    bgRevision: t.bgRevision,
    bgRoutine: t.bgRoutine,
    bgCommunity: t.bgCommunity,
    bgProfile: t.bgProfile,
"""
search_pattern = r"(    wallpaperProfile: t.wallpaperProfile,\n)"
content = re.sub(search_pattern, r"\1" + new_fields, content)

with open(filepath, "w") as f:
    f.write(content)


filepath_db = "artifacts/iic-study-app/src/components/StudentDashboard.tsx"
with open(filepath_db, "r") as f:
    content = f.read()

search_pattern_appbg = r"(  const _appBg = \(\(\) => \{\n    const themeBg = \(tierTheme as any\)\.appBgColor as string \| null \| undefined;\n    if \(themeBg && themeBg !== '#ffffff' && themeBg !== '#f8fafc' && themeBg !== '#f1f5f9'\) return themeBg;\n    const manual = \(settings as any\)\?\.appBackground;\n    if \(manual && manual !== '#ffffff'\) return manual;\n    return isDarkMode \? '#050505' : \(tierTheme\.appBg \|\| '#ffffff'\);\n  \}\)\(\);)"

replace_pattern_appbg = """  const _appBg = (() => {
    const t = tierTheme as any;
    let customBg = null;
    if (logicalActiveMainTab === 'REVISION_HUB') customBg = t.bgRevision;
    else if (logicalActiveMainTab === 'MY_ROUTINE') customBg = t.bgRoutine;
    else if (logicalActiveMainTab === 'COMMUNITY_SUPPORT') customBg = t.bgCommunity;
    else if (logicalActiveMainTab === 'PROFILE') customBg = t.bgProfile;
    else if (logicalActiveMainTab === 'HOME') customBg = t.bgHome;

    const themeBg = customBg || t.appBgColor;
    if (themeBg && themeBg !== '#ffffff' && themeBg !== '#f8fafc' && themeBg !== '#f1f5f9') return themeBg;
    const manual = (settings as any)?.appBackground;
    if (manual && manual !== '#ffffff') return manual;
    return isDarkMode ? '#050505' : (tierTheme.appBg || '#ffffff');
  })();"""

content = re.sub(search_pattern_appbg, replace_pattern_appbg, content)

with open(filepath_db, "w") as f:
    f.write(content)
