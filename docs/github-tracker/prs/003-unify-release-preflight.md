# Add unified release preflight guard for local + CI

## Linked issue
- Closes #003 (missing release preflight guard)

## What changed
- Added `scripts/release-preflight.sh`.
- Added `npm run release:preflight`.
- Updated GitHub Actions `ci.yml` and `release.yml` to use the same preflight command.

## Why
A single source of truth for release checks reduces drift and prevents avoidable publish failures.

## Validation
- `npm run release:preflight` exits 0.
- CI/release workflows execute the same command.
