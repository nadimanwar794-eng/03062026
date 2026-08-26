---
name: Workspace dependency restore
description: Dependency installation behavior for imported pnpm workspaces.
---

For imported pnpm monorepos, restore the existing lockfile with a frozen workspace install rather than using a generic package add flow.

**Why:** The package installer may interpret a requested package as a root dependency and stop at the workspace-root guard, while the app still has no node_modules.

**How to apply:** Preserve package manifests and the lockfile; use the workspace's pnpm restore path only when dependencies are missing, then restart the managed app workflow.