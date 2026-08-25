---
name: Imported artifact paths
description: Preview path behavior when an imported Vercel project is retained under the migration backup.
---

An imported artifact retained under `.migration-backup/` can remain registered and reserve its preview path even after the workspace scaffold is created. The active migrated copy must use a unique preview path unless the old registration is explicitly removed.

**Why:** Creating a second active web artifact at `/` failed with a service-path conflict while the imported backup artifact was still registered at `/`.

**How to apply:** Check registered artifacts before creating the active copy. Preserve the backup, choose a unique path for the active artifact, and verify that workflow directly.