# Skill Selection Guide

Use this quick map to select the right skill for each stage of feature implementation.

## Stage-to-Skill

- Idea exploration: `brainstorming`
- Requirement hardening: `requirements-clarification`
- Plan creation: `implementation-plan`
- API contract definition: `api-contract`
- Database migration safety: `db-migration-safe`
- Delivery: `oneshot-feature`
- Test strategy: `test-design`
- Observability readiness: `observability`
- Performance validation: `performance-check`
- Defect triage/fix: `debug`
- Review feedback resolution: `review-fix`
- Safe restructuring: `refactor-safe`
- Security gate: `security-audit`
- PR preparation: `pr`
- Commit hygiene: `commit`
- Docs alignment: `docs-update`
- Release rollback strategy: `rollback-readiness`

## Default Path for New Feature

1. `brainstorming`
2. `requirements-clarification`
3. `implementation-plan`
4. `api-contract` (if API impact exists)
5. `db-migration-safe` (if data model changes)
6. `oneshot-feature`
7. `test-design`
8. `observability`
9. `performance-check` (if perf-sensitive path)
10. `review-fix`
11. `security-audit`
12. `pr` + `commit`
13. `docs-update`
14. `rollback-readiness` (if release risk is medium/high)
