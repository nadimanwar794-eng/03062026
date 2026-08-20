import re

file_path = 'artifacts/iic-study-app/src/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Make sure we use user's personal theme for the background image if provided
bg_image_find = """  const bgImageStyle = (state.settings?.appBackgroundImage && state.view !== 'LESSON') ? `url(${state.settings.appBackgroundImage})` : undefined;

  return (
    <ErrorBoundary>
    <div className="min-h-[100dvh] flex flex-col font-sans relative pt-[env(safe-area-inset-top,24px)] pb-[env(safe-area-inset-bottom,0px)]" style={{
      background: `var(--app-bar-color, ${state.settings?.appBackground || '#ffffff'})`,"""

bg_image_replace = """  const customTheme = state.user?.personalTheme;

  let bgImageStyle = undefined;
  let customBgColor = undefined;

  if (state.view !== 'LESSON') {
    if (customTheme?.pageWallpaperBase64) {
      bgImageStyle = `url(${customTheme.pageWallpaperBase64})`;
    } else if (customTheme?.pageWallpaperUrl) {
      bgImageStyle = `url(${customTheme.pageWallpaperUrl})`;
    } else if (state.settings?.appBackgroundImage) {
      bgImageStyle = `url(${state.settings.appBackgroundImage})`;
    }

    if (customTheme?.pageBgColor) {
      customBgColor = customTheme.pageBgColor;
    }
  }

  return (
    <ErrorBoundary>
    <div className="min-h-[100dvh] flex flex-col font-sans relative pt-[env(safe-area-inset-top,24px)] pb-[env(safe-area-inset-bottom,0px)]" style={{
      background: customBgColor ? `var(--app-bar-color, ${customBgColor})` : `var(--app-bar-color, ${state.settings?.appBackground || '#ffffff'})`,"""

content = content.replace(bg_image_find, bg_image_replace)

with open(file_path, 'w') as f:
    f.write(content)
