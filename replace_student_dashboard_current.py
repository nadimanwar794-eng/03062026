import sys

def main():
    try:
        with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r', encoding='utf-8') as f:
            content = f.read()

        search_block_wallpaper = """  const tabSpecificWallpaper = (() => {
    if (showRevisionHubScreen) return (tierTheme as any).revisionBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (showMyRoutine) return (tierTheme as any).routineBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (showChat) return (tierTheme as any).communityBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (activeTab === 'PROFILE') return (tierTheme as any).profileBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (activeTab === 'HOME') return (tierTheme as any).homeBackgroundImage || (tierTheme as any).appBackgroundImage;
    return (tierTheme as any).appBackgroundImage;
  })();"""

        replace_block_wallpaper = """  const tabSpecificWallpaper = (() => {
    if (showRevisionHubScreen) return (tierTheme as any).revisionBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (showMyRoutine) return (tierTheme as any).routineBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (showChat) return (tierTheme as any).communityBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (currentLogicalTab === 'PROFILE') return (tierTheme as any).profileBackgroundImage || (tierTheme as any).appBackgroundImage;
    if (currentLogicalTab === 'HOME') return (tierTheme as any).homeBackgroundImage || (tierTheme as any).appBackgroundImage;
    return (tierTheme as any).appBackgroundImage;
  })();"""

        if search_block_wallpaper in content:
            content = content.replace(search_block_wallpaper, replace_block_wallpaper)
            print("Successfully replaced wallpaper block.")
        else:
            print("Failed to find wallpaper block.")
            sys.exit(1)

        with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w', encoding='utf-8') as f:
            f.write(content)

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
