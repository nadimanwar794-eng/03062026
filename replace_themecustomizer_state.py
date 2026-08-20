import re

filepath = "artifacts/iic-study-app/src/components/ThemeCustomizer.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add fields to ThemeState
new_fields_state = """    navActiveHome?: string;
    navActiveRevision?: string;
    navActiveRoutine?: string;
    navActiveCommunity?: string;
    navActiveProfile?: string;
    navGlowHome?: string;
    navGlowRevision?: string;
    navGlowRoutine?: string;
    navGlowCommunity?: string;
    navGlowProfile?: string;
    wallpaperHome?: string;
    wallpaperRevision?: string;
    wallpaperRoutine?: string;
    wallpaperCommunity?: string;
    wallpaperProfile?: string;
"""
search_pattern_state = r"(    mcqTabActive\?: string;\n    topBarEffect\?: string;\n)"
content = re.sub(search_pattern_state, r"\1" + new_fields_state, content)

# 2. Add default values to DEFAULT_THEME
new_fields_default = """    navActiveHome: '#22c55e',
    navActiveRevision: '#06b6d4',
    navActiveRoutine: '#f59e0b',
    navActiveCommunity: '#ec4899',
    navActiveProfile: '#8b5cf6',
    navGlowHome: '#22c55e',
    navGlowRevision: '#06b6d4',
    navGlowRoutine: '#f59e0b',
    navGlowCommunity: '#ec4899',
    navGlowProfile: '#8b5cf6',
"""
search_pattern_default = r"(    mcqTabActive: '#3b82f6',\n)"
content = re.sub(search_pattern_default, r"\1" + new_fields_default, content)

# 3. Add to stateFromTheme
new_fields_from = """        navActiveHome: t.navActiveHome || DEFAULT_THEME.navActiveHome,
        navActiveRevision: t.navActiveRevision || DEFAULT_THEME.navActiveRevision,
        navActiveRoutine: t.navActiveRoutine || DEFAULT_THEME.navActiveRoutine,
        navActiveCommunity: t.navActiveCommunity || DEFAULT_THEME.navActiveCommunity,
        navActiveProfile: t.navActiveProfile || DEFAULT_THEME.navActiveProfile,
        navGlowHome: t.navGlowHome || DEFAULT_THEME.navGlowHome,
        navGlowRevision: t.navGlowRevision || DEFAULT_THEME.navGlowRevision,
        navGlowRoutine: t.navGlowRoutine || DEFAULT_THEME.navGlowRoutine,
        navGlowCommunity: t.navGlowCommunity || DEFAULT_THEME.navGlowCommunity,
        navGlowProfile: t.navGlowProfile || DEFAULT_THEME.navGlowProfile,
        wallpaperHome: t.wallpaperHome,
        wallpaperRevision: t.wallpaperRevision,
        wallpaperRoutine: t.wallpaperRoutine,
        wallpaperCommunity: t.wallpaperCommunity,
        wallpaperProfile: t.wallpaperProfile,
"""
search_pattern_from = r"(        topBarEffect:  t.topBarEffect,\n)"
content = re.sub(search_pattern_from, r"\1" + new_fields_from, content)

# 4. Add to buildThemeObj
new_fields_build = """        navActiveHome: theme.navActiveHome,
        navActiveRevision: theme.navActiveRevision,
        navActiveRoutine: theme.navActiveRoutine,
        navActiveCommunity: theme.navActiveCommunity,
        navActiveProfile: theme.navActiveProfile,
        navGlowHome: theme.navGlowHome,
        navGlowRevision: theme.navGlowRevision,
        navGlowRoutine: theme.navGlowRoutine,
        navGlowCommunity: theme.navGlowCommunity,
        navGlowProfile: theme.navGlowProfile,
        wallpaperHome: theme.wallpaperHome,
        wallpaperRevision: theme.wallpaperRevision,
        wallpaperRoutine: theme.wallpaperRoutine,
        wallpaperCommunity: theme.wallpaperCommunity,
        wallpaperProfile: theme.wallpaperProfile,
"""
search_pattern_build = r"(        topBarEffect:  theme.topBarEffect,\n)"
content = re.sub(search_pattern_build, r"\1" + new_fields_build, content)

with open(filepath, "w") as f:
    f.write(content)
