import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Make sure _activeWallpaper relies on activeTab directly
# We also need to map ROUTINE -> MY_ROUTINE or COURSES since activeTab doesn't exactly map to "ROUTINE"
# Wait, let's grep activeTab usage to see what actual values it takes
