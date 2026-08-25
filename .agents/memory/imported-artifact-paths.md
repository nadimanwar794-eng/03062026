---
name: Imported artifact paths
description: Preview path behavior when an imported Vercel project is retained under the migration backup.
---

An imported artifact retained under `.migration-backup/` can remain registered and reserve its preview path even after the workspace scaffold is created. The active migrated copy must use a unique preview path unless the old registration is explicitly removed.

**Why:** Creating a second active web artifact at `/` failed with a service-path conflict while the imported backup artifact was still registered at `/`.

**How to apply:** Check registered artifacts before creating the active copy. Preserve the backup, choose a unique path for the active artifact, and verify that workflow directly.

If the migrated artifact directory exists but `listArtifacts()` is empty, the artifact-owned workflow may not be registered. In that case, bind the existing web package to a single preview workflow using its artifact port and base path.

**Why:** The imported workspace can retain the source files and artifact TOML without registering the artifact metadata in the current session.

**How to apply:** Prefer the managed artifact workflow when present; otherwise configure one fallback workflow for the existing package instead of creating another app.