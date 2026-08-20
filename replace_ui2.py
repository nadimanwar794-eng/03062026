import re

filepath = "artifacts/iic-study-app/src/components/ThemeCustomizer.tsx"
with open(filepath, "r") as f:
    content = f.read()

# Make sure SECTIONS array is correct
search_pattern_sections = r"(    { id: 'ACCENTS',    label: 'Accents',    icon: <Star size={13} />,         desc: 'Glow aur progress bar alag' },\n)"
replace_pattern_sections = r"\1    { id: 'BOTTOM_NAV_COLORS', label: 'Bottom Nav Colors', icon: <Navigation size={13} />, desc: 'Per-tab active & glow colors' },\n    { id: 'WALLPAPERS', label: 'Wallpapers', icon: <Globe size={13} />, desc: 'Per-tab background images' },\n"
content = re.sub(search_pattern_sections, replace_pattern_sections, content)

# Add rendering cases to the switch/object mapping
content_to_insert = """        BOTTOM_NAV_COLORS: (
            <div className="space-y-4">
                <ColorRow label="Home Active Color" value={theme.navActiveHome || ''} onChange={setColor('navActiveHome')} accent={theme.btnStart} />
                <ColorRow label="Home Glow Color" value={theme.navGlowHome || ''} onChange={setColor('navGlowHome')} accent={theme.btnStart} />
                <ColorRow label="Revision Active Color" value={theme.navActiveRevision || ''} onChange={setColor('navActiveRevision')} accent={theme.btnStart} />
                <ColorRow label="Revision Glow Color" value={theme.navGlowRevision || ''} onChange={setColor('navGlowRevision')} accent={theme.btnStart} />
                <ColorRow label="Routine Active Color" value={theme.navActiveRoutine || ''} onChange={setColor('navActiveRoutine')} accent={theme.btnStart} />
                <ColorRow label="Routine Glow Color" value={theme.navGlowRoutine || ''} onChange={setColor('navGlowRoutine')} accent={theme.btnStart} />
                <ColorRow label="Community Active Color" value={theme.navActiveCommunity || ''} onChange={setColor('navActiveCommunity')} accent={theme.btnStart} />
                <ColorRow label="Community Glow Color" value={theme.navGlowCommunity || ''} onChange={setColor('navGlowCommunity')} accent={theme.btnStart} />
                <ColorRow label="Profile Active Color" value={theme.navActiveProfile || ''} onChange={setColor('navActiveProfile')} accent={theme.btnStart} />
                <ColorRow label="Profile Glow Color" value={theme.navGlowProfile || ''} onChange={setColor('navGlowProfile')} accent={theme.btnStart} />
            </div>
        ),
        WALLPAPERS: (
            <div className="space-y-6">
                {[
                    { key: 'wallpaperHome', label: 'Home (Global Fallback)' },
                    { key: 'wallpaperRevision', label: 'Revision Hub' },
                    { key: 'wallpaperRoutine', label: 'My Routine' },
                    { key: 'wallpaperCommunity', label: 'Community' },
                    { key: 'wallpaperProfile', label: 'Profile' }
                ].map(tab => (
                    <div key={tab.key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-wider">{tab.label} Wallpaper</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Image URL..."
                                value={theme[tab.key as keyof ThemeState] as string || ''}
                                onChange={(e) => setColor(tab.key as keyof ThemeState)(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-500"
                            />
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>OR</span>
                                <span className="text-[10px]">(Max ~700KB)</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 700 * 1024) {
                                            alert("File is too large! Please select an image under 700KB.");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setColor(tab.key as keyof ThemeState)(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                ))}
            </div>
        ),
"""

search_pattern_render = r"(        ACCENTS: \(\n            <>\n                <ColorRow label=\"Accent Glow\" sub=\"Cards aur buttons ki shadow color\" value=\{theme.accentGlow\} onChange=\{setColor\('accentGlow'\)\} accent=\{theme.btnStart\} \/>\n                <ColorRow label=\"Progress Bar\"  sub=\"Progress bars ka color\"        value=\{theme.progressColor\} onChange=\{setColor\('progressColor'\)\} accent=\{theme.btnStart\} \/>\n            <\/>\n        \),\n)"
content = re.sub(search_pattern_render, r"\1" + content_to_insert, content)


with open(filepath, "w") as f:
    f.write(content)
