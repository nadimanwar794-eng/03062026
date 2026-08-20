1. **Update `UserCustomTheme` interface**:
   - Modify `artifacts/iic-study-app/src/types.ts` to add fields for individual tab active colors and glow colors for each bottom navigation button: Home, Revision Hub, My Routine, Community, Profile.
     - `navHomeActive?: string; navHomeGlow?: string;`
     - `navRevisionActive?: string; navRevisionGlow?: string;`
     - `navRoutineActive?: string; navRoutineGlow?: string;`
     - `navCommunityActive?: string; navCommunityGlow?: string;`
     - `navProfileActive?: string; navProfileGlow?: string;`
   - Add fields for per-tab wallpapers (both URL and base64 strings support) as required.
     - `wallpaperHome?: string; wallpaperRevision?: string; wallpaperRoutine?: string; wallpaperCommunity?: string; wallpaperProfile?: string;`
   - Verify changes using `read_file`.

2. **Update `ThemeState` in `ThemeCustomizer.tsx`**:
   - Modify `artifacts/iic-study-app/src/components/ThemeCustomizer.tsx` to align `ThemeState` interface with the updated `UserCustomTheme` fields to manage the state while editing.
     - Add fields corresponding to the newly added fields in `UserCustomTheme`.
   - Update `ColorSection` type (around line 501) and `SECTIONS` array (around line 503) to include a new section `WALLPAPERS` and update `NAVIGATION` for the specific button colors.
   - Verify changes using `read_file`.

3. **Update `ThemeCustomizer` UI logic**:
   - In `artifacts/iic-study-app/src/components/ThemeCustomizer.tsx`: Update the `stateFromTheme` (line 605) and `buildThemeObj` (line 838) functions to map over the new fields.
   - Expand the `sectionColors` block mapping (around line 1189) by editing the `NAVIGATION` section to include `ColorRow` components for the active colors and glow colors of the home, revision hub, my routine, community support, and profile buttons.
   - Add a new `WALLPAPERS` section to `sectionColors` mapping, incorporating UI elements (e.g. text inputs for URLs and file inputs that convert images to Base64 using a `FileReader` logic similar to `FileReader` used for other image uploads) for the 5 tab wallpapers. Provide a small custom component for the wallpaper inputs within `ThemeCustomizer` since `ColorRow` doesn't fit this.
   - Verify changes using `read_file`.

4. **Update `tierTheme.ts`**:
   - Modify `artifacts/iic-study-app/src/utils/tierTheme.ts` to map the new properties in `buildGranularTierTheme` to apply the customized styles to the active tabs.
     - Ensure properties are passed down correctly into the returned theme object (cast as `any` since they might not be part of the base `TIER_THEME`).
   - Verify changes using `read_file`.

5. **Update `StudentDashboard.tsx` background logic**:
   - Modify `artifacts/iic-study-app/src/components/StudentDashboard.tsx` to adjust `_appBg` background image logic in `StudentDashboard` to pull from the new per-tab specific wallpaper logic, checking the current active tab and bypassing for LESSON / NOTES view.
     - Update the main background div logic to apply the specific wallpaper image depending on `state.view` and the currently active bottom nav tab (derived from `state.view` mapped to the corresponding bottom nav button), with `wallpaperHome` acting as the fallback.
   - Verify changes using `read_file`.

6. **Update `MeniscusNavIndicator` in `StudentDashboard.tsx`**:
   - Modify `artifacts/iic-study-app/src/components/StudentDashboard.tsx` to modify the bottom nav to read its active color and glow from the new `tierTheme` dynamically for each specific tab button.
     - In `MeniscusNavIndicator` and the corresponding tab rendering logic, check for the specific tab ID and pass the custom color/glow if available. Use the default values specified in the prompt as fallbacks if not customized.
   - Verify changes using `read_file`.

7. **Run Tests and Checks**:
   - Run project-wide verification commands (`pnpm -F @workspace/iic-study-app run typecheck` and `build`).

8. **Complete pre-commit steps**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
