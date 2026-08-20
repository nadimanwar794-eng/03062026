with open('./artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'r') as f:
    content = f.read()

sections_search = """const SECTIONS: Array<{ id: ColorSection; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'BACKGROUND', label: 'Background', icon: <Layers size={13} />,      desc: 'App ki main background color' },
    { id: 'TOPBAR',     label: 'Top Bar',    icon: <ChevronRight size={13} />, desc: 'Header gradient — dono colors alag' },
    { id: 'NAVIGATION', label: 'Navigation', icon: <Navigation size={13} />,   desc: 'Bottom nav — 3 colors alag' },"""

sections_replace = """const SECTIONS: Array<{ id: ColorSection; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'BACKGROUND', label: 'Background', icon: <Layers size={13} />,      desc: 'App ki main background color' },
    { id: 'WALLPAPERS', label: 'Wallpapers', icon: <ImageIcon size={13} />,    desc: 'Har page ka alag background wallpaper' },
    { id: 'TOPBAR',     label: 'Top Bar',    icon: <ChevronRight size={13} />, desc: 'Header gradient — dono colors alag' },
    { id: 'NAVIGATION', label: 'Navigation', icon: <Navigation size={13} />,   desc: 'Bottom nav — 3 colors alag' },
    { id: 'TAB_COLORS', label: 'Tab Colors', icon: <Palette size={13} />,      desc: 'Har tab ka alag glow color' },"""

content = content.replace(sections_search, sections_replace)

with open('./artifacts/iic-study-app/src/components/ThemeCustomizer.tsx', 'w') as f:
    f.write(content)
