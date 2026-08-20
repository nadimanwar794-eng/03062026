with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Fix REVISION, ROUTINE, COMMUNITY logic to use REVISION_HUB, MY_ROUTINE, COMMUNITY_SUPPORT
content = content.replace("activeTab === 'REVISION'", "activeTab === 'REVISION_HUB'")
content = content.replace("activeTab === 'ROUTINE'", "activeTab === 'MY_ROUTINE'")
content = content.replace("activeTab === 'COMMUNITY'", "activeTab === 'COMMUNITY_SUPPORT'")

content = content.replace("currentId === 'REVISION'", "currentId === 'REVISION_HUB'")
content = content.replace("currentId === 'ROUTINE'", "currentId === 'MY_ROUTINE'")
content = content.replace("currentId === 'COMMUNITY'", "currentId === 'COMMUNITY_SUPPORT'")

content = content.replace("tab.id === 'REVISION'", "tab.id === 'REVISION_HUB'")
content = content.replace("tab.id === 'ROUTINE'", "tab.id === 'MY_ROUTINE'")
content = content.replace("tab.id === 'COMMUNITY'", "tab.id === 'COMMUNITY_SUPPORT'")

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)

print("Tabs fixed")
