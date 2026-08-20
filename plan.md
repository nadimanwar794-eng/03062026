1. **Update `UserCustomTheme` interface**: Add new properties to support per-tab wallpapers, global wallpaper, and bottom navigation custom colors.
    - `globalWallpaper?: string;`
    - `homeWallpaper?: string;`
    - `revisionWallpaper?: string;`
    - `routineWallpaper?: string;`
    - `communityWallpaper?: string;`
    - `profileWallpaper?: string;`
    - Nav button active colors: `navHomeActive?: string`, `navRevisionActive?: string`, `navRoutineActive?: string`, `navCommunityActive?: string`, `navProfileActive?: string`
    - Nav button glow colors: `navHomeGlow?: string`, `navRevisionGlow?: string`, `navRoutineGlow?: string`, `navCommunityGlow?: string`, `navProfileGlow?: string`

2. **Update `tierTheme.ts`**:
    - Modify `buildGranularTierTheme` to include the new properties so they can be accessed dynamically via `tierTheme`.

3. **Update `ThemeCustomizer.tsx`**:
    - Add color pickers for the new nav button active colors and glow colors. (Emerald, Cyber Cyan, Warm Amber, Neon Rose, Royal Purple). Set these as defaults if not provided.
    - Add input mechanisms for wallpapers (direct URL or file upload). Use FileReader for file uploads, converting images to Base64 strings (limit to ~700KB before setting, or handle size). Provide fields for global, and the specific tabs.
    - Add color pickers for main app background and individual page background colors if not already fully supported. (Currently `bgColor` and `cardColor`/`cardBg` seem to handle these, will verify).
    - Expose settings to user to set per tab wallpapers.

4. **Update `StudentDashboard.tsx`**:
    - Manage active tab detection (already handled by `currentLogicalTab` or `navStateRef.current.activeTab`).
    - Resolve the active wallpaper based on the current tab, falling back to home/global wallpaper.
    - Ensure LESSON / NOTES reading view bypasses wallpaper logic (e.g., if `view === 'LESSON'`).
    - Pass down the correct nav active and glow colors to the bottom navigation components dynamically instead of hardcoded ones, or handle it via CSS-in-JS inline styles in the nav bar rendering.
    - Render the background wallpaper using inline CSS or a background div on the main container based on the resolved wallpaper string.

5. **Run tests/pre-commit**.
6. **Submit**.
