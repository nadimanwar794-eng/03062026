import re

filepath = "artifacts/iic-study-app/src/components/ThemeCustomizer.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add fields to ThemeState
new_fields_state = """    bgHome?: string;
    bgRevision?: string;
    bgRoutine?: string;
    bgCommunity?: string;
    bgProfile?: string;
"""
search_pattern_state = r"(    wallpaperProfile\?: string;\n)"
content = re.sub(search_pattern_state, r"\1" + new_fields_state, content)

# 2. Add to stateFromTheme
new_fields_from = """        bgHome: t.bgHome,
        bgRevision: t.bgRevision,
        bgRoutine: t.bgRoutine,
        bgCommunity: t.bgCommunity,
        bgProfile: t.bgProfile,
"""
search_pattern_from = r"(        wallpaperProfile: t.wallpaperProfile,\n)"
content = re.sub(search_pattern_from, r"\1" + new_fields_from, content)

# 3. Add to buildThemeObj
new_fields_build = """        bgHome: theme.bgHome,
        bgRevision: theme.bgRevision,
        bgRoutine: theme.bgRoutine,
        bgCommunity: theme.bgCommunity,
        bgProfile: theme.bgProfile,
"""
search_pattern_build = r"(        wallpaperProfile: theme.wallpaperProfile,\n)"
content = re.sub(search_pattern_build, r"\1" + new_fields_build, content)


search_pattern_bg_ui = r"(                <ColorRow label=\"Main Background Color\" sub=\"Global app background color\" value=\{theme.bgColor\} onChange=\{setColor\('bgColor'\)\} accent=\{theme.btnStart\} \/>\n                \{\/\* Note: The user requested individual page background colors but structurally the app background is mostly driven by _appBg or wallpapers. The wallpapers are added in WALLPAPERS section. \*\/\}\n)"

replace_pattern_bg_ui = """                <ColorRow label="Main Background Color" sub="Global fallback background color" value={theme.bgColor} onChange={setColor('bgColor')} accent={theme.btnStart} />
                <ColorRow label="Home Background" value={theme.bgHome || ''} onChange={setColor('bgHome')} accent={theme.btnStart} />
                <ColorRow label="Revision Hub Background" value={theme.bgRevision || ''} onChange={setColor('bgRevision')} accent={theme.btnStart} />
                <ColorRow label="My Routine Background" value={theme.bgRoutine || ''} onChange={setColor('bgRoutine')} accent={theme.btnStart} />
                <ColorRow label="Community Background" value={theme.bgCommunity || ''} onChange={setColor('bgCommunity')} accent={theme.btnStart} />
                <ColorRow label="Profile Background" value={theme.bgProfile || ''} onChange={setColor('bgProfile')} accent={theme.btnStart} />
"""
content = re.sub(search_pattern_bg_ui, replace_pattern_bg_ui, content)

with open(filepath, "w") as f:
    f.write(content)
