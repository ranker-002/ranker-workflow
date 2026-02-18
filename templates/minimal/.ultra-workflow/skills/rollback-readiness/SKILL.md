---
name: rollback-readiness
description: Prepare safe rollback strategy and release fallback procedures for risky changes. Use before merge/release of medium-to-high risk features.
---

# rollback-readiness

## Procedure

1. Identify reversible boundaries (flags, migrations, deploy units).
2. Define rollback trigger conditions.
3. Define rollback commands and owner responsibilities.
4. Validate monitoring signals for rollback decisions.
5. Store rollback plan in release task artifacts.
