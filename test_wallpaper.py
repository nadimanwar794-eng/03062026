import re

with open('artifacts/iic-study-app/src/types.ts', 'r') as f:
    types_content = f.read()

print("UserCustomTheme struct details:")
match = re.search(r'export interface UserCustomTheme \{.*?\n\}', types_content, re.DOTALL)
if match:
    print(match.group(0))
