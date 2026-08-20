import re

with open('./artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Replace getTabColor function
search = """  const getTabColor = (tabId: string) => {
    const tt = tierTheme as any;
    if (tabId === 'HOME') return tt.homeTabColor || tt.navActive || tt.primary;
    if (tabId === 'REVISION_HUB') return tt.revisionTabColor || tt.navActive || tt.primary;
    if (tabId === 'ROUTINE') return tt.routineTabColor || tt.navActive || tt.primary;
    if (tabId === 'COMMUNITY' || tabId === 'CHAT') return tt.communityTabColor || tt.navActive || tt.primary;
    if (tabId === 'PROFILE') return tt.profileTabColor || tt.navActive || tt.primary;
    return tt.navActive || tt.primary;
  };"""

replace = """  const getTabColor = (tabId: string) => {
    const tt = tierTheme as any;
    let defaultForTab = tt.navActive || tt.primary;
    if (tabId === 'HOME') defaultForTab = '#10b981';
    if (tabId === 'REVISION_HUB') defaultForTab = '#8b5cf6';
    if (tabId === 'ROUTINE') defaultForTab = '#f59e0b';
    if (tabId === 'COMMUNITY' || tabId === 'CHAT') defaultForTab = '#3b82f6';
    if (tabId === 'PROFILE') defaultForTab = '#ec4899';

    if (tabId === 'HOME') return tt.homeTabColor || defaultForTab;
    if (tabId === 'REVISION_HUB') return tt.revisionTabColor || defaultForTab;
    if (tabId === 'ROUTINE') return tt.routineTabColor || defaultForTab;
    if (tabId === 'COMMUNITY' || tabId === 'CHAT') return tt.communityTabColor || defaultForTab;
    if (tabId === 'PROFILE') return tt.profileTabColor || defaultForTab;
    return tt.navActive || tt.primary;
  };"""

content = content.replace(search, replace)

with open('./artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)
