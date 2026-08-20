import re

file_path = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx'
with open(file_path, 'r') as f:
    content = f.read()

preview_find = """                        {/* NAVIGATION preview */}
                        {activeSection === 'NAVIGATION' && ("""
preview_replace = """                        {/* WALLPAPER preview */}
                        {activeSection === 'WALLPAPER' && (
                            <div className="p-4" style={{
                                background: theme.pageBgColor || theme.bgColor,
                                backgroundImage: theme.pageWallpaperBase64 ? `url(${theme.pageWallpaperBase64})` : (theme.pageWallpaperUrl ? `url(${theme.pageWallpaperUrl})` : 'none'),
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '0.75rem'
                            }}>
                                <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl text-center">
                                    <h3 className="text-white font-black text-lg mb-1">Page Wallpaper</h3>
                                    <p className="text-white/80 text-xs">This applies to all pages except lesson notes.</p>
                                </div>
                            </div>
                        )}

                        {/* NAVIGATION preview */}
                        {activeSection === 'NAVIGATION' && ("""
content = content.replace(preview_find, preview_replace)

with open(file_path, 'w') as f:
    f.write(content)
