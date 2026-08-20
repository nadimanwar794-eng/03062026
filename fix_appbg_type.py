import re

filepath = "artifacts/iic-study-app/src/types.ts"
with open(filepath, "r") as f:
    content = f.read()

type_fields = """  bgHome?: string;
  bgRevision?: string;
  bgRoutine?: string;
  bgCommunity?: string;
  bgProfile?: string;
"""

search_pattern = r"(  wallpaperProfile\?: string;\n)"
replace_pattern = r"\1" + type_fields
content = re.sub(search_pattern, replace_pattern, content)

with open(filepath, "w") as f:
    f.write(content)
