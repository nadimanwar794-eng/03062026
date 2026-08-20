import re

filepath = "artifacts/iic-study-app/src/types.ts"
with open(filepath, "r") as f:
    content = f.read()

# Add new fields to UserCustomTheme
new_fields = """  navActiveHome?: string;
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

search_pattern = r"(  mcqTabActive\?: string;\n  topBarEffect\?: string;\n)"
replace_pattern = r"\1" + new_fields

new_content = re.sub(search_pattern, replace_pattern, content)

with open(filepath, "w") as f:
    f.write(new_content)
