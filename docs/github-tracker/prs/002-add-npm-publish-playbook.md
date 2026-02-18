# Add npm publish playbook to prevent E404 installs

## Linked issue
- Closes #002 (missing npm publish playbook)

## What changed
- Added `docs/go-to-production/05-npm-publish.md` with:
  - preconditions
  - local preflight
  - version bump and publish steps
  - tag push
  - smoke tests
  - temporary GitHub fallback command

## Why
The package must be published to npm for `npx ranker-agentic-workflow` to resolve.

## Validation
- Doc includes exact commands for publish and post-publish verification.
