const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// The activeSection state type is likely defined at the top. Let's see what it is.
const sectionTypeMatch = content.match(/type ColorSection = (.*);/);
if (sectionTypeMatch) {
    const newSectionType = sectionTypeMatch[1].replace(/'/g, '').split(' | ').concat(['NAV_COLORS', 'WALLPAPERS']).map(s => `'${s.trim()}'`).join(' | ');
    content = content.replace(/type ColorSection = (.*);/, `type ColorSection = ${newSectionType};`);
}

// Add the buttons to the sidebar/nav for sections
const sidebarBlock = `
                    <button
                        onClick={() => setActiveSection('TOPBAR')}
`;
// We will search for a place to add our new section buttons.
const menuSectionReplace = `<div className="flex gap-2 p-4 overflow-x-auto border-b border-slate-200 hide-scrollbar shrink-0">`;
if (content.includes(menuSectionReplace)) {
    // Looks like it uses a horizontal scroll bar
    console.log("Horizontal menu detected.");
}

const sectionRegex = /const sections: Array<\{ id: ColorSection, icon: any, label: string \}> = \[([\s\S]*?)\];/;
const sectionMatch = content.match(sectionRegex);
if (sectionMatch) {
    const inner = sectionMatch[1];
    const newInner = inner + `
        { id: 'NAV_COLORS', icon: Navigation, label: 'Nav Buttons' },
        { id: 'WALLPAPERS', icon: Globe, label: 'Wallpapers' },
`;
    content = content.replace(sectionRegex, `const sections: Array<{ id: ColorSection, icon: any, label: string }> = [${newInner}];`);
}

// Add the rendering logic for the new sections
const renderSwitchBlock = `                    {activeSection === 'META' && (`;

const newRenderBlocks = `
                    {activeSection === 'NAV_COLORS' && (
                        <div className="space-y-6">
                            <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Navigation Colors</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ColorPicker label="Home Active" value={theme.navHomeActive || '#22c55e'} onChange={handleColorChange('navHomeActive')} />
                                <ColorPicker label="Home Glow" value={theme.navHomeGlow || '#22c55e'} onChange={handleColorChange('navHomeGlow')} />
                                <ColorPicker label="Revision Active" value={theme.navRevisionActive || '#06b6d4'} onChange={handleColorChange('navRevisionActive')} />
                                <ColorPicker label="Revision Glow" value={theme.navRevisionGlow || '#06b6d4'} onChange={handleColorChange('navRevisionGlow')} />
                                <ColorPicker label="Routine Active" value={theme.navRoutineActive || '#f59e0b'} onChange={handleColorChange('navRoutineActive')} />
                                <ColorPicker label="Routine Glow" value={theme.navRoutineGlow || '#f59e0b'} onChange={handleColorChange('navRoutineGlow')} />
                                <ColorPicker label="Community Active" value={theme.navCommunityActive || '#ec4899'} onChange={handleColorChange('navCommunityActive')} />
                                <ColorPicker label="Community Glow" value={theme.navCommunityGlow || '#ec4899'} onChange={handleColorChange('navCommunityGlow')} />
                                <ColorPicker label="Profile Active" value={theme.navProfileActive || '#8b5cf6'} onChange={handleColorChange('navProfileActive')} />
                                <ColorPicker label="Profile Glow" value={theme.navProfileGlow || '#8b5cf6'} onChange={handleColorChange('navProfileGlow')} />
                            </div>
                        </div>
                    )}
                    {activeSection === 'WALLPAPERS' && (
                        <div className="space-y-6">
                            <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Wallpapers (URLs or Upload Base64)</h3>

                            <div className="space-y-4">
                                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Global / Home Wallpaper</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Image URL" value={theme.globalWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, globalWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                                    <input type="file" accept="image/*" className="text-xs" onChange={handleFileUpload('globalWallpaper')} />
                                </div>
                                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Revision Hub Wallpaper</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Image URL" value={theme.revisionWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, revisionWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                                    <input type="file" accept="image/*" className="text-xs" onChange={handleFileUpload('revisionWallpaper')} />
                                </div>
                                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">My Routine Wallpaper</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Image URL" value={theme.routineWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, routineWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                                    <input type="file" accept="image/*" className="text-xs" onChange={handleFileUpload('routineWallpaper')} />
                                </div>
                                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Community Wallpaper</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Image URL" value={theme.communityWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, communityWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                                    <input type="file" accept="image/*" className="text-xs" onChange={handleFileUpload('communityWallpaper')} />
                                </div>
                                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile Wallpaper</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Image URL" value={theme.profileWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, profileWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                                    <input type="file" accept="image/*" className="text-xs" onChange={handleFileUpload('profileWallpaper')} />
                                </div>
                            </div>
                        </div>
                    )}
`;

content = content.replace(renderSwitchBlock, newRenderBlocks + renderSwitchBlock);

fs.writeFileSync(filepath, content);
console.log("ThemeCustomizer phase 3 updated.");
