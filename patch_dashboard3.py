import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("style={{ background: _appBg }}", "style={{ background: _activeWallpaper ? `url(${_activeWallpaper}) center/cover fixed` : _appBg }}")

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)
