const fs = require('fs');
let code = fs.readFileSync('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'utf8');

const tabColorsUI = `
        TAB_COLORS: (
            <>
                <ColorRow label="Home Active" sub="Emerald / Lime" value={theme.navHomeActive} onChange={setColor('navHomeActive')} accent={theme.btnStart} />
                <ColorRow label="Home Glow" sub="Emerald / Lime glow" value={theme.navHomeGlow} onChange={setColor('navHomeGlow')} accent={theme.btnStart} />
                <ColorRow label="Revision Hub Active" sub="Cyber Cyan" value={theme.navRevisionActive} onChange={setColor('navRevisionActive')} accent={theme.btnStart} />
                <ColorRow label="Revision Hub Glow" sub="Cyber Cyan glow" value={theme.navRevisionGlow} onChange={setColor('navRevisionGlow')} accent={theme.btnStart} />
                <ColorRow label="My Routine Active" sub="Warm Amber" value={theme.navRoutineActive} onChange={setColor('navRoutineActive')} accent={theme.btnStart} />
                <ColorRow label="My Routine Glow" sub="Warm Amber glow" value={theme.navRoutineGlow} onChange={setColor('navRoutineGlow')} accent={theme.btnStart} />
                <ColorRow label="Community Active" sub="Neon Rose" value={theme.navCommunityActive} onChange={setColor('navCommunityActive')} accent={theme.btnStart} />
                <ColorRow label="Community Glow" sub="Neon Rose glow" value={theme.navCommunityGlow} onChange={setColor('navCommunityGlow')} accent={theme.btnStart} />
                <ColorRow label="Profile Active" sub="Royal Purple" value={theme.navProfileActive} onChange={setColor('navProfileActive')} accent={theme.btnStart} />
                <ColorRow label="Profile Glow" sub="Royal Purple glow" value={theme.navProfileGlow} onChange={setColor('navProfileGlow')} accent={theme.btnStart} />
            </>
        ),
`;

code = code.replace("        BACKGROUND: isAdmin ? (", tabColorsUI + "        BACKGROUND: isAdmin ? (");

const wallpaperUI = `
        WALLPAPERS: (
            <div className="flex flex-col gap-4">
                {[
                    { key: 'wallpaperHome', label: 'Home (Default) Wallpaper' },
                    { key: 'wallpaperRevision', label: 'Revision Hub Wallpaper' },
                    { key: 'wallpaperRoutine', label: 'My Routine Wallpaper' },
                    { key: 'wallpaperCommunity', label: 'Community Wallpaper' },
                    { key: 'wallpaperProfile', label: 'Profile Wallpaper' },
                ].map((item) => (
                    <div key={item.key} className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <label className="text-xs font-bold text-white mb-2 block">{item.label}</label>
                        <input
                            type="text"
                            placeholder="Direct URL (https://...)"
                            className="w-full bg-black/40 text-white text-xs p-2 rounded-xl border border-white/20 mb-2 focus:outline-none focus:border-white/50 transition-colors"
                            value={theme[item.key as keyof ThemeState] as string || ''}
                            onChange={(e) => setColor(item.key as keyof ThemeState)(e.target.value)}
                        />
                        <div className="relative overflow-hidden bg-white/10 p-2 rounded-xl text-center text-xs text-white/70 font-semibold cursor-pointer hover:bg-white/20 transition-colors">
                            <span>Or Upload File (~700KB max)</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 800 * 1024) {
                                            alert('File is too large! Please select an image under 700KB to ensure it saves correctly.');
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const base64 = ev.target?.result;
                                            if (typeof base64 === 'string') {
                                                setColor(item.key as keyof ThemeState)(base64);
                                            }
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                        {theme[item.key as keyof ThemeState] && (
                            <div className="mt-2 text-right">
                                <button
                                    onClick={() => setColor(item.key as keyof ThemeState)('')}
                                    className="text-red-400 text-[10px] font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ),
`;

code = code.replace("        TAB_COLORS: (", wallpaperUI + "        TAB_COLORS: (");

fs.writeFileSync('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', code);
console.log('Patched sections!');
