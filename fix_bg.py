with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

import re
matches = re.findall(r'<div[^>]*?style=\{\{ background: _appBg[^}]*?\}\}[^>]*?>', content)
print("Found: ", len(matches))
if len(matches) > 0:
    print(matches[0])
