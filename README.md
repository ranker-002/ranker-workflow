# Ranker Agentic Workflow

A minimal but complete agentic delivery system with strong defaults, real gates, and multi-agent compatibility.

## Core Capabilities

- Multi-agent contracts: `AGENTS.md`, `CLAUDE.md`, `OPENCODE.md`, `AI-WORKFLOW.md`
- Baseline + advanced skills for feature delivery
- Specialized task templates (API, data, UI, performance, incident hotfix)
- Real execution command with gates: `run`
- Team CI command: `ci-check`
- Workflow benchmark command: `benchmark`
- Upgrade command for existing repos: `migrate`
- Dashboard command: `status`
- Smart run cache for faster repeated checks
- Risk engine and policy enforcement
- Autopilot reliability loop for weaker models
- Project context indexing (local RAG-ready index)
- Auto-tuning from run metrics
- Installation profiles and domain packs

## Install

```bash
npx ranker-agentic-workflow init my-project
```

Interactive wizard:

```bash
npx ranker-agentic-workflow init my-project --interactive
```

Advanced install:

```bash
npx ranker-agentic-workflow init my-project \
  --agents codex,claude,opencode \
  --profile strict \
  --packs backend,data,security
```

## Commands

```bash
npx ranker-agentic-workflow feature auth-hardening --type api --title "Harden login API"
npx ranker-agentic-workflow feature --wizard
npx ranker-agentic-workflow run .ultra-workflow/tasks/feature-api.yml --review-approved --docs-updated
npx ranker-agentic-workflow run .ultra-workflow/tasks/feature-api.yml --strict-manual-gates
npx ranker-agentic-workflow run --auto --plan-only
npx ranker-agentic-workflow run --auto --review-approved --docs-updated
npx ranker-agentic-workflow validate .ultra-workflow/tasks
npx ranker-agentic-workflow doctor . --fix
npx ranker-agentic-workflow ci-check . --task .ultra-workflow/tasks/feature.yml
npx ranker-agentic-workflow benchmark .
npx ranker-agentic-workflow migrate .
npx ranker-agentic-workflow migrate . --dry-run
npx ranker-agentic-workflow status .
npx ranker-agentic-workflow autopilot .ultra-workflow/tasks/feature.yml --strict-manual-gates
npx ranker-agentic-workflow index .
npx ranker-agentic-workflow risk .ultra-workflow/tasks/feature-api.yml
npx ranker-agentic-workflow tune . --apply
```

## Strict Manual Gates

When using `--strict-manual-gates`, review/docs gates require evidence directly in task files:

```yaml
review_evidence:
  approver: "team-handle"
  reference: "PR-123 or review URL"
docs_evidence:
  updated_files:
    - "README.md"
```

## Packs

- `backend`
- `data`
- `frontend`
- `security`
- `performance`

## Operator Docs

- `.ultra-workflow/references/operator-guide.md`
- `.ultra-workflow/references/cookbook.md`
- `.ultra-workflow/references/failure-modes.md`
- `.ultra-workflow/references/packs.md`

## CI

Template workflow is provided at `.github/workflows/ranker-agentic-ci.yml`.
Additional templates:
- `.gitlab-ci.yml`
- `bitbucket-pipelines.yml`

## Go-To-Production

Operational launch pack:
- `docs/go-to-production/README.md`
- `docs/go-to-production/01-release-checklist.md`
- `docs/go-to-production/02-kpis.md`
- `docs/go-to-production/03-roadmap-30-days.md`
- `docs/go-to-production/04-oss-launch-plan.md`

## Demo Video (Remotion)

```bash
npm run video:preview
npm run video:render
npm run video:render:v2
npm run video:render:v3
npm run video:render:v3:vertical
```

Project files:
- `video/remotion/`

## License

MIT

## Release

- CI workflow: `.github/workflows/ci.yml`
- npm release workflow: `.github/workflows/release.yml`
- Required secret for publish: `NPM_TOKEN`
- Local preflight: `npm run release:preflight`
