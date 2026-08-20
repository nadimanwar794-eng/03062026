import re

with open('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'r') as f:
    content = f.read()

# 1. Update ThemeState interface
content = re.sub(
    r'(interface ThemeState \{.*?)(themeEmoji\?: string;)(\n\})',
    r'\1\2\n    navHomeActive?: string;\n    navRevisionActive?: string;\n    navRoutineActive?: string;\n    navCommunityActive?: string;\n    navProfileActive?: string;\n    appBgImage?: string;\n    homeBgImage?: string;\n    revisionBgImage?: string;\n    routineBgImage?: string;\n    communityBgImage?: string;\n    profileBgImage?: string;\3',
    content,
    flags=re.DOTALL
)

# 2. Update DEFAULT_THEME
content = re.sub(
    r'(const DEFAULT_THEME: ThemeState = \{.*?)(mcqTabActive: \'#3b82f6\',)(\n\};)',
    r"\1\2\n    navHomeActive: '#22c55e',\n    navRevisionActive: '#06b6d4',\n    navRoutineActive: '#f59e0b',\n    navCommunityActive: '#ec4899',\n    navProfileActive: '#8b5cf6',\3",
    content,
    flags=re.DOTALL
)

# 3. Update stateFromTheme
content = re.sub(
    r'(const stateFromTheme = \(t: UserCustomTheme \| undefined\): ThemeState => \{.*?)(themeEmoji:    t\.themeEmoji,)(\n    \};)',
    r'\1\2\n        navHomeActive: t.navHomeActive,\n        navRevisionActive: t.navRevisionActive,\n        navRoutineActive: t.navRoutineActive,\n        navCommunityActive: t.navCommunityActive,\n        navProfileActive: t.navProfileActive,\n        appBgImage:    t.appBgImage,\n        homeBgImage:   t.homeBgImage,\n        revisionBgImage: t.revisionBgImage,\n        routineBgImage:  t.routineBgImage,\n        communityBgImage: t.communityBgImage,\n        profileBgImage:  t.profileBgImage,\3',
    content,
    flags=re.DOTALL
)

# 4. Update SECTIONS list
content = re.sub(
    r'(const SECTIONS: Array<\{ id: ColorSection; label: string; icon: React\.ReactNode; desc: string \}> = \[.*?)(\];)',
    r"\1    { id: 'TABS',       label: 'Tab Colors', icon: <Navigation size={13} />,   desc: 'Individual tab active colors' },\n    { id: 'WALLPAPERS', label: 'Wallpapers', icon: <Globe size={13} />,        desc: 'App & Tab Wallpapers' },\n\2",
    content,
    flags=re.DOTALL
)

# 5. Update ColorSection type
content = re.sub(
    r'(type ColorSection = \'BACKGROUND\' \| \'TOPBAR\' \| \'NAVIGATION\' \| \'CARDS\' \| \'BUTTONS\' \| \'TEXT\' \| \'ACCENTS\' \| \'FLASHCARD\' \| \'CHAPTERS\' \| \'MCQ_TABS\';)',
    r"type ColorSection = 'BACKGROUND' | 'TOPBAR' | 'NAVIGATION' | 'CARDS' | 'BUTTONS' | 'TEXT' | 'ACCENTS' | 'FLASHCARD' | 'CHAPTERS' | 'MCQ_TABS' | 'TABS' | 'WALLPAPERS';",
    content
)

# 6. Update doApply logic in ThemeCustomizer component
# Find the doApply definition and buildThemeObj
content = re.sub(
    r'(const themeObj: UserCustomTheme = \{.*?)(themeEmoji:    theme\.themeEmoji,)(\n            createdAt:     new Date\(\)\.toISOString\(\),)',
    r'\1\2\n            navHomeActive: theme.navHomeActive,\n            navRevisionActive: theme.navRevisionActive,\n            navRoutineActive: theme.navRoutineActive,\n            navCommunityActive: theme.navCommunityActive,\n            navProfileActive: theme.navProfileActive,\n            appBgImage:    theme.appBgImage,\n            homeBgImage:   theme.homeBgImage,\n            revisionBgImage: theme.revisionBgImage,\n            routineBgImage:  theme.routineBgImage,\n            communityBgImage: theme.communityBgImage,\n            profileBgImage:  theme.profileBgImage,\3',
    content,
    flags=re.DOTALL
)

# Update buildThemeObj definition
content = re.sub(
    r'(const buildThemeObj = \(\): UserCustomTheme => \(\{.*?)(themeEmoji:    theme\.themeEmoji,)(\n        createdAt:     new Date\(\)\.toISOString\(\),)',
    r'\1\2\n        navHomeActive: theme.navHomeActive,\n        navRevisionActive: theme.navRevisionActive,\n        navRoutineActive: theme.navRoutineActive,\n        navCommunityActive: theme.navCommunityActive,\n        navProfileActive: theme.navProfileActive,\n        appBgImage:    theme.appBgImage,\n        homeBgImage:   theme.homeBgImage,\n        revisionBgImage: theme.revisionBgImage,\n        routineBgImage:  theme.routineBgImage,\n        communityBgImage: theme.communityBgImage,\n        profileBgImage:  theme.profileBgImage,\3',
    content,
    flags=re.DOTALL
)

# 7. Add the actual sections inside sectionColors dictionary
section_additions = """
        TABS: (
            <>
                <ColorRow label="Home Active" sub="HOME tab color" value={theme.navHomeActive || '#22c55e'} onChange={setColor('navHomeActive')} accent={theme.btnStart} />
                <ColorRow label="Revision Active" sub="REVISION_HUB tab color" value={theme.navRevisionActive || '#06b6d4'} onChange={setColor('navRevisionActive')} accent={theme.btnStart} />
                <ColorRow label="My Routine Active" sub="MY_ROUTINE tab color" value={theme.navRoutineActive || '#f59e0b'} onChange={setColor('navRoutineActive')} accent={theme.btnStart} />
                <ColorRow label="Community Active" sub="COMMUNITY_SUPPORT tab color" value={theme.navCommunityActive || '#ec4899'} onChange={setColor('navCommunityActive')} accent={theme.btnStart} />
                <ColorRow label="Profile Active" sub="PROFILE tab color" value={theme.navProfileActive || '#8b5cf6'} onChange={setColor('navProfileActive')} accent={theme.btnStart} />
            </>
        ),
        WALLPAPERS: (
            <div className="space-y-4">
                <p className="text-[10px] text-white/50 mb-2">Maximum file size: ~700KB. Global/Home wallpaper acts as fallback.</p>
                {[
                    { key: 'appBgImage', label: 'App Background (Global)' },
                    { key: 'homeBgImage', label: 'Home Wallpaper (Global Fallback)' },
                    { key: 'revisionBgImage', label: 'Revision Hub Wallpaper' },
                    { key: 'routineBgImage', label: 'My Routine Wallpaper' },
                    { key: 'communityBgImage', label: 'Community Wallpaper' },
                    { key: 'profileBgImage', label: 'Profile Wallpaper' }
                ].map(({ key, label }) => (
                    <div key={key} className="p-3 border rounded-xl border-white/10 bg-white/5">
                        <p className="text-xs font-bold text-white mb-2">{label}</p>
                        {theme[key as keyof ThemeState] && (
                           <div className="mb-2 w-full h-24 rounded-lg overflow-hidden relative">
                              <img src={theme[key as keyof ThemeState] as string} alt={label} className="w-full h-full object-cover" />
                              <button onClick={() => setColor(key as keyof ThemeState)('')} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-md text-[10px] hover:bg-red-500">Remove</button>
                           </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="Paste image URL here..."
                                value={((theme[key as keyof ThemeState] as string) || '').startsWith('http') ? (theme[key as keyof ThemeState] as string) : ''}
                                onChange={(e) => setColor(key as keyof ThemeState)(e.target.value)}
                                className="w-full text-[10px] p-2 rounded-lg bg-black/30 text-white border border-white/10 outline-none"
                            />
                            <div className="relative overflow-hidden inline-block w-full">
                                <button className="w-full text-[10px] py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/20">Upload Image File</button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 700 * 1024) {
                                                alert("File size exceeds 700KB limit.");
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setColor(key as keyof ThemeState)(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ),
"""

# Insert inside sectionColors
content = re.sub(
    r'(const sectionColors: Record<ColorSection, React\.ReactNode> = \{.*?)(    \};)',
    r'\1' + section_additions + r'\2',
    content,
    flags=re.DOTALL
)

with open('artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'w') as f:
    f.write(content)

print("ThemeCustomizer updated")
