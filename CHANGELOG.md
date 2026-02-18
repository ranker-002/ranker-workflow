# Changelog

All notable changes to this project will be documented in this file.

## 0.8.0 - 2026-02-18

### Added
- Production-ready packaging controls with npm allowlist via `files` in `package.json`.
- `.npmignore` rules to exclude local runtime artifacts and non-CLI assets from publish.
- Remotion demo video module with V1/V2/V3 compositions and V3 vertical social format.
- Beat-synced industrial soundtrack for V3 demos.
- Root video scripts for preview/render variants.
- Release and CI automation workflows for GitHub Actions.

### Improved
- Workflow verification coverage across init, validation, gates, compatibility, and packaging.
- Package size and publish payload reduced to CLI-critical assets only.

### Fixed
- Prevented accidental inclusion of local root `.ultra-workflow` generated context artifacts in npm tarballs.
