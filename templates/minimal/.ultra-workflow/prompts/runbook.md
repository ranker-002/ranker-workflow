# Ranker Agentic Runbook

## Mandatory Execution Protocol

1. Read the active task file in `.ultra-workflow/tasks/` before any code change.
2. Use the skill declared by the task (`skill:` field) as the execution method.
3. Do not mark task complete until all quality gates and Definition-of-Done checks pass.
4. If task criteria are missing or ambiguous, stop and update task contract first.
5. Every handoff must include concrete evidence (test output, scan output, review decision).

## Fast Execution Loop

1. Select one task template from `tasks/`.
2. Assign one lead agent and one core skill.
3. Execute in this order:
   - Plan
   - Implement
   - Verify
   - Review
   - Release
4. Run Definition-of-Done gates.
5. Close task only when all gates pass.

## Skill Routing (Baseline)

- Discovery options: `brainstorming`
- Requirement hardening: `requirements-clarification`
- Execution planning: `implementation-plan`
- API shape/version safety: `api-contract`
- Database evolution safety: `db-migration-safe`
- Feature delivery: `oneshot-feature`
- Debugging and failures: `debug`
- Test strategy and coverage: `test-design`
- Runtime visibility and alerts: `observability`
- Performance budget checks: `performance-check`
- Review iteration: `review-fix`
- Safe cleanup/refactor: `refactor-safe`
- Security gate: `security-audit`
- PR and commit prep: `pr`, `commit`
- Documentation updates: `docs-update`
- Release fallback: `rollback-readiness`

## Tool Use Policy (Minimal and Powerful)

- Use tools for facts, not assumptions.
- Prefer deterministic scripts for repeated operations.
- Keep tool outputs short and decision-oriented.
- Never proceed after a failed gate.

## Agent Handoff Contract

Every handoff must include:

- Goal and scope
- Exact acceptance criteria
- What changed
- Evidence (tests/checks)
- Remaining risks
