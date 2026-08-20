import re

with open('./artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'r') as f:
    content = f.read()

# Update ThemeState interface
if 'homeTabColor?: string;' not in content:
    content = content.replace('themeEmoji?: string;',
        'themeEmoji?: string;\n    homeTabColor?: string;\n    revisionTabColor?: string;\n    routineTabColor?: string;\n    communityTabColor?: string;\n    profileTabColor?: string;\n    homeWallpaper?: string;\n    revisionWallpaper?: string;\n    routineWallpaper?: string;\n    communityWallpaper?: string;\n    profileWallpaper?: string;')

# Update stateFromTheme
if 'homeTabColor:  t.homeTabColor,' not in content:
    content = content.replace('themeEmoji:    t.themeEmoji,',
        '''themeEmoji:    t.themeEmoji,
        homeTabColor:  t.homeTabColor,
        revisionTabColor: t.revisionTabColor,
        routineTabColor: t.routineTabColor,
        communityTabColor: t.communityTabColor,
        profileTabColor: t.profileTabColor,
        homeWallpaper: t.homeWallpaper,
        revisionWallpaper: t.revisionWallpaper,
        routineWallpaper: t.routineWallpaper,
        communityWallpaper: t.communityWallpaper,
        profileWallpaper: t.profileWallpaper,''')

# Update buildThemeObj
if 'homeTabColor: theme.homeTabColor,' not in content:
    content = content.replace('themeEmoji:    theme.themeEmoji,\n        createdAt:     new Date().toISOString(),\n        likes:         0,',
        '''themeEmoji:    theme.themeEmoji,
        homeTabColor: theme.homeTabColor,
        revisionTabColor: theme.revisionTabColor,
        routineTabColor: theme.routineTabColor,
        communityTabColor: theme.communityTabColor,
        profileTabColor: theme.profileTabColor,
        homeWallpaper: theme.homeWallpaper,
        revisionWallpaper: theme.revisionWallpaper,
        routineWallpaper: theme.routineWallpaper,
        communityWallpaper: theme.communityWallpaper,
        profileWallpaper: theme.profileWallpaper,
        createdAt:     new Date().toISOString(),
        likes:         0,''')

# Replace the specific occurrences in buildThemeObj - there are 2 places where it says `themeEmoji:    theme.themeEmoji,` followed by `createdAt:`
# Let's just use regex for better replacement

with open('./artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'w') as f:
    f.write(content)
