---
name: Bottom navigation dimensions
description: The established navigation geometry and its visual customization boundary.
---

The bottom navigation must retain its existing full-width footer geometry and 64px content row. Visual updates may change the active indicator, glow, border, and label treatment, but must not resize or reposition the navigation.

**Why:** The user explicitly requested that the navigation look change without any size change, after comparing it with a floating reference design.

**How to apply:** Keep layout dimensions and safe-area behavior unchanged when iterating on the bottom nav; use Theme Studio's existing `navBg`, `navActive`, and `navBorder` values for visual customization.