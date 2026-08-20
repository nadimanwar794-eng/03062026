import re

with open('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'r') as f:
    content = f.read()

navigation_block = """        NAVIGATION: (
            <>
                {isAdmin && (
                    <ColorRow label="Nav Background" sub="Bottom bar ka background (Admin only)" value={theme.navBg} onChange={setColor('navBg')} accent={theme.btnStart} />
                )}
                <ColorRow label="Default Active Tab Color" sub="Selected tab default color + underline" value={theme.navActive} onChange={setColor('navActive')} accent={theme.btnStart} />
                <ColorRow label="Nav Border"       sub="Top border line ka color"       value={theme.navBorder} onChange={setColor('navBorder')} accent={theme.btnStart} />
                <div className="h-px bg-white/10 my-4" />
                <p className="text-white/60 text-xs font-bold mb-3 px-1">Per-Button Active & Glow Colors</p>
                <ColorRow label="Home Active Color" sub="Emerald / Lime (Default)" value={theme.navHomeActive || '#22c55e'} onChange={setColor('navHomeActive')} accent={theme.btnStart} />
                <ColorRow label="Home Glow Color" sub="" value={theme.navHomeGlow || '#22c55e'} onChange={setColor('navHomeGlow')} accent={theme.btnStart} />
                <ColorRow label="Revision Active Color" sub="Cyber Cyan (Default)" value={theme.navRevisionActive || '#06b6d4'} onChange={setColor('navRevisionActive')} accent={theme.btnStart} />
                <ColorRow label="Revision Glow Color" sub="" value={theme.navRevisionGlow || '#06b6d4'} onChange={setColor('navRevisionGlow')} accent={theme.btnStart} />
                <ColorRow label="Routine Active Color" sub="Warm Amber (Default)" value={theme.navRoutineActive || '#f59e0b'} onChange={setColor('navRoutineActive')} accent={theme.btnStart} />
                <ColorRow label="Routine Glow Color" sub="" value={theme.navRoutineGlow || '#f59e0b'} onChange={setColor('navRoutineGlow')} accent={theme.btnStart} />
                <ColorRow label="Community Active Color" sub="Neon Rose (Default)" value={theme.navCommunityActive || '#ec4899'} onChange={setColor('navCommunityActive')} accent={theme.btnStart} />
                <ColorRow label="Community Glow Color" sub="" value={theme.navCommunityGlow || '#ec4899'} onChange={setColor('navCommunityGlow')} accent={theme.btnStart} />
                <ColorRow label="Profile Active Color" sub="Royal Purple (Default)" value={theme.navProfileActive || '#8b5cf6'} onChange={setColor('navProfileActive')} accent={theme.btnStart} />
                <ColorRow label="Profile Glow Color" sub="" value={theme.navProfileGlow || '#8b5cf6'} onChange={setColor('navProfileGlow')} accent={theme.btnStart} />
            </>
        ),"""

wallpaper_block = """        WALLPAPERS: (
            <div className="space-y-4">
                <p className="text-white/60 text-xs font-bold px-1 mb-2">Tab Wallpapers (URL ya Base64 Image)</p>

                {[
                    { key: 'wallpaperHome', label: 'Home Wallpaper', desc: 'Main fallback wallpaper' },
                    { key: 'wallpaperRevision', label: 'Revision Hub', desc: 'Revision Hub tab wallpaper' },
                    { key: 'wallpaperRoutine', label: 'My Routine', desc: 'My Routine tab wallpaper' },
                    { key: 'wallpaperCommunity', label: 'Community', desc: 'Community tab wallpaper' },
                    { key: 'wallpaperProfile', label: 'Profile', desc: 'Profile tab wallpaper' },
                ].map(({ key, label, desc }) => (
                    <div key={key} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
                        <div>
                            <p className="text-xs font-bold text-white/90">{label}</p>
                            <p className="text-[10px] text-white/50 leading-tight">{desc}</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Image URL dalo..."
                            value={((theme as any)[key]) || ''}
                            onChange={(e) => setColor(key as any)(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white outline-none"
                        />
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-[9px] text-white/40">Ya phir device se upload karo:</span>
                            <label className="bg-white/10 hover:bg-white/20 transition-all text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer border border-white/10">
                                Upload File
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 700 * 1024) {
                                                alert('File size bahut badi hai! Please 700KB se choti image chunein taaki sync mein dikkat na aaye.');
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const res = ev.target?.result as string;
                                                setColor(key as any)(res);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        {((theme as any)[key]) && (
                             <div className="mt-2 h-16 w-full rounded-xl overflow-hidden relative">
                                <img src={((theme as any)[key])} alt={label} className="w-full h-full object-cover opacity-80" />
                                <button onClick={() => setColor(key as any)('')} className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[10px]">✕</button>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        ),"""

content = re.sub(
    r'        NAVIGATION: \(\s*<>\s*\{isAdmin && \(\s*<ColorRow label="Nav Background" sub="Bottom bar ka background \(Admin only\)" value=\{theme.navBg\} onChange=\{setColor\(\'navBg\'\)\} accent=\{theme.btnStart\} />\s*\)\}\s*<ColorRow label="Active Tab Color" sub="Selected tab color \+ underline" value=\{theme.navActive\} onChange=\{setColor\(\'navActive\'\)\} accent=\{theme.btnStart\} />\s*<ColorRow label="Nav Border"       sub="Top border line ka color"       value=\{theme.navBorder\} onChange=\{setColor\(\'navBorder\'\)\} accent=\{theme.btnStart\} />\s*</>\s*\),',
    navigation_block,
    content,
    flags=re.MULTILINE
)

content = re.sub(
    r'        CARDS: \(',
    wallpaper_block + '\n        CARDS: (',
    content,
    flags=re.MULTILINE
)

with open('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'w') as f:
    f.write(content)
