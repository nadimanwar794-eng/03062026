import re

file_path = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add to SECTIONS array since my previous patch failed
sections_array_find = """    { id: 'NAVIGATION', label: 'Navigation', icon: <Navigation size={13} />,   desc: 'Bottom nav — 3 colors alag' },"""
sections_array_replace = """    { id: 'WALLPAPER', label: 'Wallpaper', icon: <Square size={13} />, desc: 'Page background & wallpaper' },
    { id: 'NAVIGATION', label: 'Navigation', icon: <Navigation size={13} />, desc: 'Bottom nav colors (per tab)' },"""
content = content.replace(sections_array_find, sections_array_replace)

with open(file_path, 'w') as f:
    f.write(content)
