import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Remove the duplicate _activeWallpaper block
dup_block = """  const _activeWallpaper = (() => {
    if (activeTab === 'LESSON' || activeTab === 'NOTES' || activeTab === 'PDF' || activeTab === 'VIDEO') return undefined;

    const t = tierTheme as any;
    const fallBack = t.wallpaperHome || undefined;
    if (activeTab === 'HOME' && t.wallpaperHome) return t.wallpaperHome;
    if (activeTab === 'REVISION_HUB' && t.wallpaperRevision) return t.wallpaperRevision;
    if (activeTab === 'ROUTINE' && t.wallpaperRoutine) return t.wallpaperRoutine;
    if (activeTab === 'COMMUNITY_SUPPORT' && t.wallpaperCommunity) return t.wallpaperCommunity;
    if (activeTab === 'PROFILE' && t.wallpaperProfile) return t.wallpaperProfile;
    return fallBack;
  })();"""

content = content.replace(dup_block, "")

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)
