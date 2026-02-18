---
name: refactor-safe
description: Improve code structure without changing behavior, while preserving reliability and rollback safety. Use for preparatory cleanup before or after feature delivery.
---

# refactor-safe

## Rules

1. Preserve public behavior and contracts.
2. Keep commits small and reversible.
3. Run full relevant test suite before/after.
4. Reject refactor if it mixes scope with new feature logic.
