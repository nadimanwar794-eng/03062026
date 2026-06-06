---
name: Name Effect Customizer
description: Profile page bottom-sheet modal for choosing name text effect style, level-gated
---
## Rule
Name effects are stored in localStorage `nst_name_effect`. State: `nameEffectId`, `showProfileEffects`.
Defined in `utils/nameEffects.ts` (NAME_EFFECTS_LIST + getNameEffectStyle).

## How to apply
- `_nameStyle` checks nameEffectId BEFORE the auto level-based logic
- Button "🎨 Name Style" in profile settings (only visible when nameFxOff=false)
- Modal: bottom sheet, live preview at top, 2-col grid of effect cards
- Each card: emoji, name, desc, name preview in that style, lock badge if level insufficient

**Why:** User wanted gaming-app style profile where unlocked effects can be manually chosen.
