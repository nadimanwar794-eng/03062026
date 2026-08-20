import re

file_path = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update ThemeState
theme_state_find = """    navActive: string;
    navBorder: string;"""
theme_state_replace = """    navActive: string;
    navHomeActive?: string;
    navRevisionActive?: string;
    navRoutineActive?: string;
    navCommunityActive?: string;
    navProfileActive?: string;
    navAppsActive?: string;
    pageWallpaperUrl?: string;
    pageWallpaperBase64?: string;
    pageBgColor?: string;
    navBorder: string;"""
content = content.replace(theme_state_find, theme_state_replace)

# 2. Update stateFromTheme
state_from_theme_find = """        navActive:     t.navActive     || accent || DEFAULT_THEME.navActive,
        navBorder:     t.navBorder     || DEFAULT_THEME.navBorder,"""
state_from_theme_replace = """        navActive:     t.navActive     || accent || DEFAULT_THEME.navActive,
        navHomeActive: t.navHomeActive,
        navRevisionActive: t.navRevisionActive,
        navRoutineActive: t.navRoutineActive,
        navCommunityActive: t.navCommunityActive,
        navProfileActive: t.navProfileActive,
        navAppsActive: t.navAppsActive,
        pageWallpaperUrl: t.pageWallpaperUrl,
        pageWallpaperBase64: t.pageWallpaperBase64,
        pageBgColor: t.pageBgColor,
        navBorder:     t.navBorder     || DEFAULT_THEME.navBorder,"""
content = content.replace(state_from_theme_find, state_from_theme_replace)

# 3. Update applySimpleTheme
apply_simple_theme_find = """            topBarEnd:     color,
            navActive:     color,"""
apply_simple_theme_replace = """            topBarEnd:     color,
            navActive:     color,
            navHomeActive: color,
            navRevisionActive: color,
            navRoutineActive: color,
            navCommunityActive: color,
            navProfileActive: color,
            navAppsActive: color,"""
content = content.replace(apply_simple_theme_find, apply_simple_theme_replace)

# 4. Update doApply (mapping theme -> UserCustomTheme payload)
do_apply_find = """            navActive: theme.navActive,
            navBorder: theme.navBorder,"""
do_apply_replace = """            navActive: theme.navActive,
            navHomeActive: theme.navHomeActive,
            navRevisionActive: theme.navRevisionActive,
            navRoutineActive: theme.navRoutineActive,
            navCommunityActive: theme.navCommunityActive,
            navProfileActive: theme.navProfileActive,
            navAppsActive: theme.navAppsActive,
            pageWallpaperUrl: theme.pageWallpaperUrl,
            pageWallpaperBase64: theme.pageWallpaperBase64,
            pageBgColor: theme.pageBgColor,
            navBorder: theme.navBorder,"""
content = content.replace(do_apply_find, do_apply_replace)


# 5. Add to DEFAULT_THEME just to be safe
default_theme_find = """    navActive: '#3b82f6',
    navBorder: '#e2e8f0',"""
default_theme_replace = """    navActive: '#3b82f6',
    navHomeActive: '#3b82f6',
    navRevisionActive: '#3b82f6',
    navRoutineActive: '#3b82f6',
    navCommunityActive: '#3b82f6',
    navProfileActive: '#3b82f6',
    navAppsActive: '#3b82f6',
    navBorder: '#e2e8f0',"""
content = content.replace(default_theme_find, default_theme_replace)

with open(file_path, 'w') as f:
    f.write(content)
