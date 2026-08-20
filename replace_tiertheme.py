import re

filepath = "artifacts/iic-study-app/src/utils/tierTheme.ts"
with open(filepath, "r") as f:
    content = f.read()

# Expand the accepted type to include new fields
type_fields = """
    navActiveHome?: string; navActiveRevision?: string; navActiveRoutine?: string; navActiveCommunity?: string; navActiveProfile?: string;
    navGlowHome?: string; navGlowRevision?: string; navGlowRoutine?: string; navGlowCommunity?: string; navGlowProfile?: string;
    wallpaperHome?: string; wallpaperRevision?: string; wallpaperRoutine?: string; wallpaperCommunity?: string; wallpaperProfile?: string;
"""

search_pattern_type = r"(    accentGlow\?: string; progressColor\?: string;\n  })"
replace_pattern_type = r"    accentGlow?: string; progressColor?: string;" + type_fields + "  }"
content = re.sub(search_pattern_type, replace_pattern_type, content)

# Return the new fields from buildGranularTierTheme using `as any` type assertion trick already used in this file for additional properties
new_fields_return = """    navActiveHome:   t.navActiveHome,
    navActiveRevision: t.navActiveRevision,
    navActiveRoutine: t.navActiveRoutine,
    navActiveCommunity: t.navActiveCommunity,
    navActiveProfile: t.navActiveProfile,
    navGlowHome:     t.navGlowHome,
    navGlowRevision: t.navGlowRevision,
    navGlowRoutine:  t.navGlowRoutine,
    navGlowCommunity: t.navGlowCommunity,
    navGlowProfile:  t.navGlowProfile,
    wallpaperHome:   t.wallpaperHome,
    wallpaperRevision: t.wallpaperRevision,
    wallpaperRoutine: t.wallpaperRoutine,
    wallpaperCommunity: t.wallpaperCommunity,
    wallpaperProfile: t.wallpaperProfile,
"""
search_pattern_return = r"(    appBgColor:      t\.bgColor      \|\| null,\n  \};\n)"
replace_pattern_return = r"    appBgColor:      t.bgColor      || null,\n" + new_fields_return + "  } as any;\n"
content = re.sub(search_pattern_return, replace_pattern_return, content)

with open(filepath, "w") as f:
    f.write(content)
