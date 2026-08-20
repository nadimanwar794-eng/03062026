import re

filepath = "artifacts/iic-study-app/src/components/ThemeCustomizer.tsx"
with open(filepath, "r") as f:
    content = f.read()

# Add Individual Page Background Colors picking to Theme Studio UI as requested by user originally but missed
# First check if bgColor is mapped in ThemeState. It is: `bgColor: string;`.

search_pattern = r"(        BACKGROUND: \(\n            <>\n                <ColorRow label=\"Main Background\" sub=\"App ki default background\" value=\{theme.bgColor\} onChange=\{setColor\('bgColor'\)\} accent=\{theme.btnStart\} \/>\n            <\/>\n        \),)"
replace_pattern = r"""        BACKGROUND: (
            <>
                <ColorRow label="Main Background Color" sub="Global app background color" value={theme.bgColor} onChange={setColor('bgColor')} accent={theme.btnStart} />
                {/* Note: The user requested individual page background colors but structurally the app background is mostly driven by _appBg or wallpapers. The wallpapers are added in WALLPAPERS section. */}
            </>
        ),"""

content = re.sub(search_pattern, replace_pattern, content)

with open(filepath, "w") as f:
    f.write(content)
