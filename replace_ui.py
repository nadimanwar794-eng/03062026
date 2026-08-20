import re

filepath = "artifacts/iic-study-app/src/components/ThemeCustomizer.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add new sections to ColorSection
search_pattern_section = r"(type ColorSection = 'BACKGROUND' \| 'TOPBAR' \| 'NAVIGATION' \| 'CARDS' \| 'BUTTONS' \| 'TEXT' \| 'ACCENTS' \| 'FLASHCARD' \| 'CHAPTERS' \| 'MCQ_TABS';\n)"
replace_pattern_section = r"type ColorSection = 'BACKGROUND' | 'TOPBAR' | 'NAVIGATION' | 'CARDS' | 'BUTTONS' | 'TEXT' | 'ACCENTS' | 'FLASHCARD' | 'CHAPTERS' | 'MCQ_TABS' | 'BOTTOM_NAV_COLORS' | 'WALLPAPERS';\n"
content = re.sub(search_pattern_section, replace_pattern_section, content)

search_pattern_sections_list = r"(    { id: 'MCQ_TABS',   label: 'MCQ Tabs',   icon: <CheckCircle size={13} />,  desc: 'MCQ practice screen colors' },\n)"
replace_pattern_sections_list = r"\1    { id: 'BOTTOM_NAV_COLORS', label: 'Bottom Nav Colors', icon: <Navigation size={13} />, desc: 'Per-tab active & glow colors' },\n    { id: 'WALLPAPERS', label: 'Wallpapers', icon: <Globe size={13} />, desc: 'Per-tab background images' },\n"
content = re.sub(search_pattern_sections_list, replace_pattern_sections_list, content)

# 2. Find rendering area
content_to_insert = """
                                {activeSection === 'BOTTOM_NAV_COLORS' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Home Active Color</label>
                                                <input type="color" value={theme.navActiveHome} onChange={(e) => setColor('navActiveHome')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Home Glow Color</label>
                                                <input type="color" value={theme.navGlowHome} onChange={(e) => setColor('navGlowHome')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Revision Active Color</label>
                                                <input type="color" value={theme.navActiveRevision} onChange={(e) => setColor('navActiveRevision')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Revision Glow Color</label>
                                                <input type="color" value={theme.navGlowRevision} onChange={(e) => setColor('navGlowRevision')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Routine Active Color</label>
                                                <input type="color" value={theme.navActiveRoutine} onChange={(e) => setColor('navActiveRoutine')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Routine Glow Color</label>
                                                <input type="color" value={theme.navGlowRoutine} onChange={(e) => setColor('navGlowRoutine')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Community Active Color</label>
                                                <input type="color" value={theme.navActiveCommunity} onChange={(e) => setColor('navActiveCommunity')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Community Glow Color</label>
                                                <input type="color" value={theme.navGlowCommunity} onChange={(e) => setColor('navGlowCommunity')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Profile Active Color</label>
                                                <input type="color" value={theme.navActiveProfile} onChange={(e) => setColor('navActiveProfile')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block">Profile Glow Color</label>
                                                <input type="color" value={theme.navGlowProfile} onChange={(e) => setColor('navGlowProfile')(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeSection === 'WALLPAPERS' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                                )}
"""

search_pattern_render = r"(                                \)\}\n                            </div>\n                        </div>\n                    </div>\n                \)\}\n\n                \{\/\* ── RENDER PREVIEW ── \*\/\} )"
content = re.sub(search_pattern_render, content_to_insert + r"\1", content)


with open(filepath, "w") as f:
    f.write(content)
