plan = """
1. **Extend `UserCustomTheme` Interface (src/types.ts):**
   - Add new properties to `UserCustomTheme` to store per-tab colors and wallpapers:
     - `navHomeActive?: string;`
     - `navRevisionActive?: string;`
     - `navRoutineActive?: string;`
     - `navCommunityActive?: string;`
     - `navProfileActive?: string;`
     - `appBgImage?: string;`
     - `homeBgImage?: string;` // Fallback wallpaper
     - `revisionBgImage?: string;`
     - `routineBgImage?: string;`
     - `communityBgImage?: string;`
     - `profileBgImage?: string;`

2. **Update `ThemeCustomizer` (src/components/ThemeCustomizer.tsx):**
   - Add the new per-tab color properties to `ThemeState`.
   - Update `DEFAULT_THEME` with default per-tab active colors specified in instructions.
   - Update `stateFromTheme` and `doApply` to map these new fields.
   - Add new sections in `SECTIONS` for Per-Tab Colors and Wallpapers.
   - Implement `ColorRow` components for Home, Revision Hub, My Routine, Community, and Profile active colors under the newly added section.
   - Implement Image Upload logic (with FileReader converting to base64) and URL input for App Background, and per-tab backgrounds. Add logic to ensure base64 strings don't exceed size limits (or handle warning).

3. **Update Theme Context and Utilities (src/utils/tierTheme.ts, src/utils/themeContext.tsx):**
   - Ensure these new properties (like `navHomeActive`) are safely passed around in `TierThemeObj`.
   - Update `buildGranularTierTheme` to extract and supply these per-tab colors. If a specific tab color is not defined, fall back to `navActive` or the global accent color.
   - Also pass wallpaper base64/URLs through `buildGranularTierTheme`.

4. **Update Application Logic to Read Wallpaper and Tab Colors (src/components/StudentDashboard.tsx):**
   - In `_appBg`, if the current view is not 'LESSON' or 'NOTES', determine the active wallpaper logic: check if the current active tab has a custom wallpaper set (`tierTheme.revisionBgImage`, etc.); if so, use it. Otherwise, fallback to the Home/Global wallpaper (`tierTheme.homeBgImage` or `tierTheme.appBgImage`).
   - Use CSS `background-image: url(...)` on the main container where `_appBg` is set, or append it to `_appBg`. Exempt LESSON/NOTES views by maintaining the default clean background there.
   - Modify the bottom navigation rendering logic. Currently, `MeniscusNavIndicator` uses `activeColor={_isNavDark ? ((tierTheme as any).navActive || '#7dd3fc') : tierTheme.primary}`. We will adjust this to dynamically choose the correct color based on the `activeIndex` or tab `id`. The tabs loop rendering needs to pass its specific active color when it's the active tab.

5. **Pre Commit**
   - Ensure proper testing, verification, review, and reflection are done using `pre_commit_instructions` tool.
6. **Submit**
   - Submit the change.
"""
print("plan setup successful")
