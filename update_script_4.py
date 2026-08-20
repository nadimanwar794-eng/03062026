with open('./artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'r') as f:
    content = f.read()

# Add WallpaperInput component at the top, just above ColorRow
color_row_search = "const ColorRow: React.FC<ColorRowProps> ="
wallpaper_input_code = """
const WallpaperInput = ({ label, value, onChange, desc }: { label: string, value: string, onChange: (v: string) => void, desc: string }) => {
    return (
        <div className="flex flex-col gap-2 bg-[#0d0f1a] rounded-2xl p-3 border border-white/5">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
                <span className="text-[9px] text-white/40">{desc}</span>
            </div>
            <div className="flex gap-2 items-center mt-1">
                <input
                    type="text"
                    placeholder="Image URL..."
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-white/20"
                />
                <label className="shrink-0 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[11px] font-bold text-white cursor-pointer hover:bg-white/15 active:scale-95 transition-all">
                    Upload
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                                alert('File size must be < 2MB.');
                                e.target.value = '';
                                return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                                const res = String(reader.result || '');
                                if (res.startsWith('data:image/')) {
                                    onChange(res);
                                }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>
            {value && (
                <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 h-24 bg-slate-900">
                    <img src={value} className="w-full h-full object-cover opacity-60" alt="Wallpaper preview" />
                    <button
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md active:scale-90"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

"""

if "const WallpaperInput = (" not in content:
    content = content.replace(color_row_search, wallpaper_input_code + color_row_search)


# Add the new sections in `sectionColors` map
section_colors_search = """        NAVIGATION: (
            <div className="space-y-2">
                <ColorRow label="Nav Background" sub="Bottom bar ki back color" value={theme.navBg} onChange={setColor('navBg')} accent={theme.btnStart} />
                <ColorRow label="Nav Active Tab" sub="Jo tab open hai uska color" value={theme.navActive} onChange={setColor('navActive')} accent={theme.btnStart} />
                <ColorRow label="Nav Border" sub="Bottom bar ki border color" value={theme.navBorder} onChange={setColor('navBorder')} accent={theme.btnStart} />
            </div>
        ),"""

section_colors_add = """        NAVIGATION: (
            <div className="space-y-2">
                <ColorRow label="Nav Background" sub="Bottom bar ki back color" value={theme.navBg} onChange={setColor('navBg')} accent={theme.btnStart} />
                <ColorRow label="Nav Active Tab" sub="Jo tab open hai uska default color (kisi specific tab ka na ho to)" value={theme.navActive} onChange={setColor('navActive')} accent={theme.btnStart} />
                <ColorRow label="Nav Border" sub="Bottom bar ki border color" value={theme.navBorder} onChange={setColor('navBorder')} accent={theme.btnStart} />
            </div>
        ),
        TAB_COLORS: (
            <div className="space-y-2">
                <ColorRow label="Home Tab Color" sub="Sirf Home tab ke liye" value={theme.homeTabColor || theme.navActive} onChange={setColor('homeTabColor')} accent={theme.btnStart} />
                <ColorRow label="Revision Tab Color" sub="Sirf Revision tab ke liye" value={theme.revisionTabColor || theme.navActive} onChange={setColor('revisionTabColor')} accent={theme.btnStart} />
                <ColorRow label="Routine Tab Color" sub="Sirf Routine tab ke liye" value={theme.routineTabColor || theme.navActive} onChange={setColor('routineTabColor')} accent={theme.btnStart} />
                <ColorRow label="Community Tab Color" sub="Sirf Community tab ke liye" value={theme.communityTabColor || theme.navActive} onChange={setColor('communityTabColor')} accent={theme.btnStart} />
                <ColorRow label="Profile Tab Color" sub="Sirf Profile tab ke liye" value={theme.profileTabColor || theme.navActive} onChange={setColor('profileTabColor')} accent={theme.btnStart} />
            </div>
        ),
        WALLPAPERS: (
            <div className="space-y-3">
                <WallpaperInput label="Home Wallpaper (Default)" desc="Har jagah yahi dikhega agar baki set nahi hain" value={theme.homeWallpaper || ''} onChange={setColor('homeWallpaper')} />
                <WallpaperInput label="Revision Wallpaper" desc="Sirf Revision Hub ke liye" value={theme.revisionWallpaper || ''} onChange={setColor('revisionWallpaper')} />
                <WallpaperInput label="Routine Wallpaper" desc="Sirf Routine Page ke liye" value={theme.routineWallpaper || ''} onChange={setColor('routineWallpaper')} />
                <WallpaperInput label="Community Wallpaper" desc="Sirf Community Chat ke liye" value={theme.communityWallpaper || ''} onChange={setColor('communityWallpaper')} />
                <WallpaperInput label="Profile Wallpaper" desc="Sirf Profile Page ke liye" value={theme.profileWallpaper || ''} onChange={setColor('profileWallpaper')} />
            </div>
        ),"""

content = content.replace(section_colors_search, section_colors_add)

with open('./artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'w') as f:
    f.write(content)
