import re

with open("artifacts/iic-study-app/src/components/StudentDashboard.tsx", "r") as f:
    content = f.read()

# Let's extract the repetitive mapping to a helper function.
# In the StudentDashboard component body, we can add:
# const getTabKey = (tabId?: string) => {
#    switch (tabId) {
#      case 'HOME': return 'Home';
#      case 'ROUTINE': return 'Routine';
#      case 'REVISION': return 'Revision';
#      case 'COMMUNITY': return 'Community';
#      case 'PROFILE': return 'Profile';
#      default: return 'Home';
#    }
#  }

# And then we replace the long ternaries.

helper_func = """
  const getTabKey = (tabId?: string) => {
    switch (tabId) {
      case 'HOME': return 'Home';
      case 'ROUTINE': return 'Routine';
      case 'REVISION': return 'Revision';
      case 'COMMUNITY': return 'Community';
      case 'PROFILE': return 'Profile';
      default: return 'Home';
    }
  };
"""

content = content.replace("const activeTab = visibleTabs[activeIndex]?.id;", "const activeTab = visibleTabs[activeIndex]?.id;\n" + helper_func)

# Replace the specific ternaries. We need to be careful with regex here.

# _appBg = activeTab === 'HOME' ? tierTheme[`pageHomeBgColor` as keyof typeof tierTheme] : ...
app_bg_regex = r"const _appBg = activeTab === 'HOME' \? tierTheme\[`pageHomeBgColor` as keyof typeof tierTheme\] : activeTab === 'ROUTINE' \? tierTheme\[`pageRoutineBgColor` as keyof typeof tierTheme\] : activeTab === 'REVISION' \? tierTheme\[`pageRevisionBgColor` as keyof typeof tierTheme\] : activeTab === 'COMMUNITY' \? tierTheme\[`pageCommunityBgColor` as keyof typeof tierTheme\] : activeTab === 'PROFILE' \? tierTheme\[`pageProfileBgColor` as keyof typeof tierTheme\] : undefined;"
content = re.sub(app_bg_regex, "const _appBg = tierTheme[`page${getTabKey(activeTab)}BgColor` as keyof typeof tierTheme];", content)

app_bg_img_regex = r"const _appBgImage = activeTab === 'HOME' \? tierTheme\[`pageHomeWallpaper` as keyof typeof tierTheme\] : activeTab === 'ROUTINE' \? tierTheme\[`pageRoutineWallpaper` as keyof typeof tierTheme\] : activeTab === 'REVISION' \? tierTheme\[`pageRevisionWallpaper` as keyof typeof tierTheme\] : activeTab === 'COMMUNITY' \? tierTheme\[`pageCommunityWallpaper` as keyof typeof tierTheme\] : activeTab === 'PROFILE' \? tierTheme\[`pageProfileWallpaper` as keyof typeof tierTheme\] : undefined;"
content = re.sub(app_bg_img_regex, "const _appBgImage = tierTheme[`page${getTabKey(activeTab)}Wallpaper` as keyof typeof tierTheme];", content)

nav_color_regex = r"const currentNavColor = \(activeTab === 'HOME' \? tierTheme\[`navHomeColor` as keyof typeof tierTheme\] : activeTab === 'ROUTINE' \? tierTheme\[`navRoutineColor` as keyof typeof tierTheme\] : activeTab === 'REVISION' \? tierTheme\[`navRevisionColor` as keyof typeof tierTheme\] : activeTab === 'COMMUNITY' \? tierTheme\[`navCommunityColor` as keyof typeof tierTheme\] : activeTab === 'PROFILE' \? tierTheme\[`navProfileColor` as keyof typeof tierTheme\] : undefined\) as string \| undefined;"
content = re.sub(nav_color_regex, "const currentNavColor = tierTheme[`nav${getTabKey(activeTab)}Color` as keyof typeof tierTheme] as string | undefined;", content)

nav_glow_regex = r"const currentNavGlow = \(activeTab === 'HOME' \? tierTheme\[`navHomeGlow` as keyof typeof tierTheme\] : activeTab === 'ROUTINE' \? tierTheme\[`navRoutineGlow` as keyof typeof tierTheme\] : activeTab === 'REVISION' \? tierTheme\[`navRevisionGlow` as keyof typeof tierTheme\] : activeTab === 'COMMUNITY' \? tierTheme\[`navCommunityGlow` as keyof typeof tierTheme\] : activeTab === 'PROFILE' \? tierTheme\[`navProfileGlow` as keyof typeof tierTheme\] : undefined\) as string \| undefined;"
content = re.sub(nav_glow_regex, "const currentNavGlow = tierTheme[`nav${getTabKey(activeTab)}Glow` as keyof typeof tierTheme] as string | undefined;", content)


with open("artifacts/iic-study-app/src/components/StudentDashboard.tsx", "w") as f:
    f.write(content)
