import re

file_path = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx'
with open(file_path, 'r') as f:
    content = f.read()

editor_find = """        NAVIGATION: (
            <>
                {isAdmin && (
                    <ColorRow label="Nav Background" sub="Bottom bar ka background (Admin only)" value={theme.navBg} onChange={setColor('navBg')} accent={theme.btnStart} />
                )}
                <ColorRow label="Active Tab Color" sub="Selected tab color + underline" value={theme.navActive} onChange={setColor('navActive')} accent={theme.btnStart} />
                <ColorRow label="Nav Border"       sub="Top border line ka color"       value={theme.navBorder} onChange={setColor('navBorder')} accent={theme.btnStart} />
            </>
        ),"""

editor_replace = """        NAVIGATION: (
            <>
                {isAdmin && (
                    <ColorRow label="Nav Background" sub="Bottom bar ka background (Admin only)" value={theme.navBg} onChange={setColor('navBg')} accent={theme.btnStart} />
                )}
                <ColorRow label="Global Active Tab" sub="Default active color" value={theme.navActive} onChange={setColor('navActive')} accent={theme.btnStart} />
                <ColorRow label="Home Active" sub="Home icon glow" value={theme.navHomeActive || theme.navActive} onChange={setColor('navHomeActive')} accent={theme.btnStart} />
                <ColorRow label="Revision Active" sub="Revision icon glow" value={theme.navRevisionActive || theme.navActive} onChange={setColor('navRevisionActive')} accent={theme.btnStart} />
                <ColorRow label="Routine Active" sub="Routine icon glow" value={theme.navRoutineActive || theme.navActive} onChange={setColor('navRoutineActive')} accent={theme.btnStart} />
                <ColorRow label="Community Active" sub="Community icon glow" value={theme.navCommunityActive || theme.navActive} onChange={setColor('navCommunityActive')} accent={theme.btnStart} />
                <ColorRow label="Apps Active" sub="Apps icon glow" value={theme.navAppsActive || theme.navActive} onChange={setColor('navAppsActive')} accent={theme.btnStart} />
                <ColorRow label="Profile Active" sub="Profile icon glow" value={theme.navProfileActive || theme.navActive} onChange={setColor('navProfileActive')} accent={theme.btnStart} />
                <ColorRow label="Nav Border"       sub="Top border line ka color"       value={theme.navBorder} onChange={setColor('navBorder')} accent={theme.btnStart} />
            </>
        ),
        WALLPAPER: (
            <>
                <ColorRow label="Page Bg Color" sub="Background for all pages" value={theme.pageBgColor || theme.bgColor} onChange={setColor('pageBgColor')} accent={theme.btnStart} />
                <div className="mt-4 p-2 bg-white/5 rounded-xl">
                    <p className="text-xs font-bold text-white mb-2">Wallpaper URL</p>
                    <input
                        type="text"
                        value={theme.pageWallpaperUrl || ''}
                        onChange={(e) => setColor('pageWallpaperUrl')(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-white/30 transition-colors"
                    />
                </div>
                <div className="mt-2 p-2 bg-white/5 rounded-xl">
                    <p className="text-xs font-bold text-white mb-2">Upload Wallpaper</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                const b64 = ev.target?.result as string;
                                setColor('pageWallpaperBase64')(b64);
                            };
                            reader.readAsDataURL(file);
                        }}
                        className="w-full text-xs text-white/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20"
                    />
                    {theme.pageWallpaperBase64 && (
                        <button
                            onClick={() => setColor('pageWallpaperBase64')('')}
                            className="mt-2 text-[10px] text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded-md"
                        >
                            Clear Upload
                        </button>
                    )}
                </div>
            </>
        ),"""

content = content.replace(editor_find, editor_replace)

with open(file_path, 'w') as f:
    f.write(content)
