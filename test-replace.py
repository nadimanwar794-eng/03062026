import re

with open("artifacts/iic-study-app/src/components/StudyModeCardTools.tsx", "r") as f:
    content = f.read()

print("StudyModeCardTools.tsx loaded")

# StudyModeCardTools.tsx contains:
# const MODE_STYLES: Record<StudyActivityMode, string> = { ... }
# Which determines the styling of mode buttons.
# And StudyModeButtons renders modes.map with `MODE_STYLES[mode.mode]`
