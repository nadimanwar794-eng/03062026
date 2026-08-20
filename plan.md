1.  **Update Types for New Theme Features**:
    *   Add new properties to `UserCustomTheme` (in `src/types.ts`) for per-tab active colors: `navHomeActive`, `navRevisionActive`, `navRoutineActive`, `navCommunityActive`, `navProfileActive`, `navAppsActive`.
    *   Add new properties for wallpaper features: `pageWallpaperUrl` (for url-based wallpaper), `pageWallpaperBase64` (for logo-style upload wallpaper), and a general page background color `pageBgColor`.

2.  **Update `ThemeState` and Defaults**:
    *   In `src/components/ThemeCustomizer.tsx`, update the `ThemeState` interface to include these new properties.
    *   Update `DEFAULT_THEME` and the initial state mapping to handle these new fields.
    *   Ensure old themes don't break by falling back to `navActive` for the new button-specific colors if they are not defined.

3.  **Update ThemeStudio UI (`ThemeCustomizer.tsx`)**:
    *   Add UI sections to customize the individual button colors in the "Navigation" section or a new specific section for these bottoms nav tabs.
    *   Add a new section for "Page Wallpaper & Background" allowing users to set a `pageBgColor`, upload an image (which converts to base64 `pageWallpaperBase64`), or provide a `pageWallpaperUrl`.
    *   Make sure the save logic includes these new fields.

4.  **Implement New Theme Logic in App (`StudentDashboard.tsx`)**:
    *   Pass the new active colors to the navigation buttons. The `MeniscusNavIndicator` or the individual buttons themselves need to use `theme.navHomeActive` when Home is selected, `theme.navRoutineActive` when Routine is selected, etc.
    *   Update the `activeColor` logic in `StudentDashboard` bottom nav rendering so the active glow/indicator uses the correct color based on the selected tab.
    *   Use the `pageWallpaperUrl` or `pageWallpaperBase64` or `pageBgColor` to style the main content area/background for all pages *except* the Lesson/Notes view, ensuring the default (no custom wallpaper) falls back to the home page's default or the existing global app background.

5.  **Pre-commit checks**:
    *   Run type checking, linting, and build commands using the `pre_commit_instructions` tool to verify the changes.
