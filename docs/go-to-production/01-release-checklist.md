# Release Checklist

## Pre-release

- `npm test` passes.
- `node --check bin/ranker-agentic.js` passes.
- `doctor --fix` passes on a clean sample project.
- `run --plan-only` and `run --strict-manual-gates` validated on sample tasks.
- `migrate --dry-run` and `migrate` validated from previous scaffold state.

## Quality Gates

- CLI help output includes all shipped commands.
- Template tasks validate with `validate .ultra-workflow/tasks`.
- CI templates exist for GitHub, GitLab, Bitbucket.
- Core docs updated (`README`, operator guide, failure modes).

## Release Artifacts

- Version updated in `package.json`.
- Changelog/release notes prepared.
- Tagged release candidate tested in a fresh directory.

## Publish

- `npm publish --access public`.
- GitHub release with notes and migration guidance.

## Post-release

- Smoke test install from npm in a clean environment.
- Confirm issue templates/discussion channels are active.
