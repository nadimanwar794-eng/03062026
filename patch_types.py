import re

file_path = 'artifacts/iic-study-app/src/types.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """  navActive?: string;
  navHomeActive?: string;
  navRevisionActive?: string;
  navRoutineActive?: string;
  navCommunityActive?: string;
  navProfileActive?: string;
  navAppsActive?: string;
  pageWallpaperUrl?: string;
  pageWallpaperBase64?: string;
  pageBgColor?: string;"""

content = content.replace("  navActive?: string;", replacement)

with open(file_path, 'w') as f:
    f.write(content)
