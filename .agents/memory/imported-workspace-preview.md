---
name: Imported workspace preview setup
description: Imported pnpm workspaces may need dependency installation and should use the registered artifact workflow for proxied previews.
---

Imported repositories can arrive without node_modules, even when the lockfile is complete. The registered artifact workflow is the reliable preview route; an older custom workflow may serve on an internal port without being reachable through the artifact proxy.

**Why:** Validation initially failed only because dependencies were absent, and the legacy imported workflow was not the route used by the artifact screenshot proxy.

**How to apply:** Install from the existing lockfile before typecheck/build, then restart the artifact-managed workflow and use the artifact preview path for runtime checks.

When the package installer cannot accept a lockfile command as a package token, use the repository's existing package-manager lockfile command directly rather than changing dependency manifests.

**Why:** The workspace needed a frozen-lockfile install, while the package installer only accepts individual package names.

**How to apply:** Preserve the lockfile and package manifests; only use the direct install command as a fallback for bootstrapping missing workspace dependencies.