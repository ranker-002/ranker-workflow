---
name: oneshot-feature
description: Deliver a requested feature in one controlled pass with planning, implementation, verification, and release readiness checks. Use for net-new features, major enhancements, and high-confidence delivery with minimal iterations.
---

# oneshot-feature

## Procedure

1. Read the task contract and extract non-negotiable acceptance criteria.
2. Design the smallest implementation that satisfies all criteria.
3. Implement with tests in the same pass.
4. Run quality checks (tests, lint, security checks required by project).
5. Produce a concise delivery note: what changed, what was tested, what risks remain.

## Failure Policy

- If a criterion is ambiguous, propose a strict default and document it.
- If tests fail, do not proceed to release artifacts.
- If scope grows, split into a follow-up task instead of expanding the current one.
