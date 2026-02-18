---
name: db-migration-safe
description: Execute schema and data migrations with low-risk rollout and rollback strategy. Use for any database schema change or data backfill.
---

# db-migration-safe

## Procedure

1. Classify migration risk (low/medium/high).
2. Prefer backward-compatible, phased migrations.
3. Define pre-checks and post-checks.
4. Define rollback or recovery plan.
5. Validate migration on representative dataset.
