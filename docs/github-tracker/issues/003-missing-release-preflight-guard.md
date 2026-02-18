# [Reliability] Missing single release preflight guard can let publish blockers slip

## Summary
Release checks are present but duplicated in workflows and not exposed as one local command.

## Impact
- Inconsistent release validation between local and CI usage.
- Higher chance of missing a check before tagging/publishing.

## Proposed fix
- Add a single preflight script used both locally and in GitHub Actions.
- Include lint, tests, npm dry-run packaging, and package metadata checks.

## Acceptance criteria
- `npm run release:preflight` exists and passes locally.
- CI and Release workflows call the same preflight command.
