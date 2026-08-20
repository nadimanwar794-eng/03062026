const fs = require('fs');
const filepath = 'artifacts/iic-study-app/src/components/ThemeCustomizer.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Update SECTIONS array
const sectionsBlock = `const SECTIONS: Array<{ id: ColorSection; label: string; icon: React.ReactNode; desc: string }> = [`;
const sectionsReplace = `const SECTIONS: Array<{ id: ColorSection; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'NAV_COLORS', label: 'Nav Buttons', icon: <Navigation size={13} />, desc: 'Per-tab nav active/glow colors' },
    { id: 'WALLPAPERS', label: 'Wallpapers', icon: <Globe size={13} />, desc: 'Global and per-tab wallpapers' },`;
content = content.replace(sectionsBlock, sectionsReplace);

// 2. Add to sectionColors switch
const sectionColorsBlock = `const sectionColors: Record<ColorSection, React.ReactNode> = {`;
const sectionColorsReplace = `const sectionColors: Record<ColorSection, React.ReactNode> = {
        NAV_COLORS: (
            <div className="space-y-4">
                <ColorRow label="Home Active" value={theme.navHomeActive || '#22c55e'} onChange={(v) => { setTheme(prev => ({...prev, navHomeActive: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Home Glow" value={theme.navHomeGlow || '#22c55e'} onChange={(v) => { setTheme(prev => ({...prev, navHomeGlow: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Revision Active" value={theme.navRevisionActive || '#06b6d4'} onChange={(v) => { setTheme(prev => ({...prev, navRevisionActive: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Revision Glow" value={theme.navRevisionGlow || '#06b6d4'} onChange={(v) => { setTheme(prev => ({...prev, navRevisionGlow: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Routine Active" value={theme.navRoutineActive || '#f59e0b'} onChange={(v) => { setTheme(prev => ({...prev, navRoutineActive: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Routine Glow" value={theme.navRoutineGlow || '#f59e0b'} onChange={(v) => { setTheme(prev => ({...prev, navRoutineGlow: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Community Active" value={theme.navCommunityActive || '#ec4899'} onChange={(v) => { setTheme(prev => ({...prev, navCommunityActive: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Community Glow" value={theme.navCommunityGlow || '#ec4899'} onChange={(v) => { setTheme(prev => ({...prev, navCommunityGlow: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Profile Active" value={theme.navProfileActive || '#8b5cf6'} onChange={(v) => { setTheme(prev => ({...prev, navProfileActive: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
                <ColorRow label="Profile Glow" value={theme.navProfileGlow || '#8b5cf6'} onChange={(v) => { setTheme(prev => ({...prev, navProfileGlow: v})); setHasUnsavedChanges(true); }} accent={theme.navActive} />
            </div>
        ),
        WALLPAPERS: (
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Global / Home Wallpaper</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-indigo-400" placeholder="Image URL (https://...)" value={theme.globalWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, globalWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                        <label className="block text-xs font-medium text-slate-500 mb-1">Or Upload (Max 700KB)</label>
                        <input type="file" accept="image/*" className="text-xs w-full" onChange={handleFileUpload('globalWallpaper')} />
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Revision Hub Wallpaper</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-indigo-400" placeholder="Image URL" value={theme.revisionWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, revisionWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                        <label className="block text-xs font-medium text-slate-500 mb-1">Or Upload (Max 700KB)</label>
                        <input type="file" accept="image/*" className="text-xs w-full" onChange={handleFileUpload('revisionWallpaper')} />
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <label className="block text-sm font-medium text-slate-700 mb-1">My Routine Wallpaper</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-indigo-400" placeholder="Image URL" value={theme.routineWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, routineWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                        <label className="block text-xs font-medium text-slate-500 mb-1">Or Upload (Max 700KB)</label>
                        <input type="file" accept="image/*" className="text-xs w-full" onChange={handleFileUpload('routineWallpaper')} />
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Community Wallpaper</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-indigo-400" placeholder="Image URL" value={theme.communityWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, communityWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                        <label className="block text-xs font-medium text-slate-500 mb-1">Or Upload (Max 700KB)</label>
                        <input type="file" accept="image/*" className="text-xs w-full" onChange={handleFileUpload('communityWallpaper')} />
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Wallpaper</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-indigo-400" placeholder="Image URL" value={theme.profileWallpaper || ''} onChange={(e) => { setTheme(prev => ({...prev, profileWallpaper: e.target.value})); setHasUnsavedChanges(true); }} />
                        <label className="block text-xs font-medium text-slate-500 mb-1">Or Upload (Max 700KB)</label>
                        <input type="file" accept="image/*" className="text-xs w-full" onChange={handleFileUpload('profileWallpaper')} />
                    </div>
                </div>
            </div>
        ),`;

content = content.replace(sectionColorsBlock, sectionColorsReplace);

fs.writeFileSync(filepath, content);
console.log("ThemeCustomizer UI phase updated.");
