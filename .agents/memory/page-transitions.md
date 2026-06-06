---
name: Page Transitions
description: iOS/Android-like slide animation between tabs in StudentDashboard
---
tabTransitionKey (increments each tab change) + tabTransitionDir (right/left/fade).
handleTabChangeWrapper sets direction based on TAB_ORDER index comparison.
renderMainContent() wrapped in keyed div with class tab-page-enter|tab-page-enter-left|tab-page-fade.
CSS in index.css: 240ms cubic-bezier(0.22, 1, 0.36, 1).
**Why:** User wanted Android/iPhone app-like page transitions.
