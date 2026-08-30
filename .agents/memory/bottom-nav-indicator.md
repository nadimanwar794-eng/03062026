---
name: Bottom navigation indicator
description: Visual rule for the student app's active bottom-navigation state.
---

The active bottom-navigation state should keep its spotlight in a separate, soft layer projected below the active button; removing outlines must not remove that light.

**Why:** The reference design needs both a borderless active control and a clearly visible downward glow. Combining the glow with the button outline caused one fix to undo the other.

**How to apply:** Keep active-button borders and inset/ring treatments disabled, and tune the dedicated below-button radial glow rather than restoring a border or circular cutout.