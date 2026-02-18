# Operator Guide

## 5-Minute Setup

1. `npx ranker-agentic-workflow init . --force --yes`
2. Pick a task template in `.ultra-workflow/tasks/`
3. Fill acceptance criteria and plan.
4. Run: `npx ranker-agentic-workflow run <task-file> --strict-manual-gates`
5. Verify: `npx ranker-agentic-workflow ci-check .`
6. View dashboard: `npx ranker-agentic-workflow status .`

## Daily Loop

- Create or update task contract.
- Implement through selected skill path.
- Run automated gates.
- Capture run log under `.ultra-workflow/runs/`.
- Merge only when all gates pass.
- Use `run --plan-only` to preview checks before execution.

## Team CI Loop

- Run `ci-check` on each PR.
- Prefer `--strict-manual-gates` and keep review/docs evidence in task files.
- Block merge on non-zero exit.
