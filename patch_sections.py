import re

file_path = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Update ColorSection type
section_find = "type ColorSection = 'BACKGROUND' | 'TOPBAR' | 'NAVIGATION' | 'CARDS' | 'BUTTONS' | 'TEXT' | 'ACCENTS' | 'FLASHCARD' | 'CHAPTERS' | 'MCQ_TABS';"
section_replace = "type ColorSection = 'BACKGROUND' | 'TOPBAR' | 'NAVIGATION' | 'CARDS' | 'BUTTONS' | 'TEXT' | 'ACCENTS' | 'FLASHCARD' | 'CHAPTERS' | 'MCQ_TABS' | 'WALLPAPER';"
content = content.replace(section_find, section_replace)

# Add to SECTIONS array
sections_array_find = """    { id: 'NAVIGATION', label: 'Navigation', icon: <Navigation size={13} />, desc: 'Bottom nav — 3 colors alag' },"""
sections_array_replace = """    { id: 'WALLPAPER', label: 'Wallpaper', icon: <Square size={13} />, desc: 'Page background & wallpaper' },
    { id: 'NAVIGATION', label: 'Navigation', icon: <Navigation size={13} />, desc: 'Bottom nav colors (per tab)' },"""
content = content.replace(sections_array_find, sections_array_replace)

with open(file_path, 'w') as f:
    f.write(content)
