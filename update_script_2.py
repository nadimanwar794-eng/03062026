import re

with open('./artifacts/iic-study-app/src/utils/tierTheme.ts', 'r') as f:
    content = f.read()

# Add the new properties to `buildGranularTierTheme`
# 1. Update the signature:
sig_search = '''accentGlow?: string; progressColor?: string;
  }'''
sig_replace = '''accentGlow?: string; progressColor?: string;
    homeTabColor?: string; revisionTabColor?: string; routineTabColor?: string; communityTabColor?: string; profileTabColor?: string;
    homeWallpaper?: string; revisionWallpaper?: string; routineWallpaper?: string; communityWallpaper?: string; profileWallpaper?: string;
  }'''
content = content.replace(sig_search, sig_replace)

# 2. Update the return object:
ret_search = '''appBgColor:      t.bgColor      || null,
  };'''
ret_replace = '''appBgColor:      t.bgColor      || null,
    homeTabColor:    t.homeTabColor,
    revisionTabColor: t.revisionTabColor,
    routineTabColor: t.routineTabColor,
    communityTabColor: t.communityTabColor,
    profileTabColor: t.profileTabColor,
    homeWallpaper:   t.homeWallpaper,
    revisionWallpaper: t.revisionWallpaper,
    routineWallpaper: t.routineWallpaper,
    communityWallpaper: t.communityWallpaper,
    profileWallpaper: t.profileWallpaper,
  };'''
content = content.replace(ret_search, ret_replace)

with open('./artifacts/iic-study-app/src/utils/tierTheme.ts', 'w') as f:
    f.write(content)
