# Failure Modes

## Doctor Fails

- Cause: missing workflow files/skills.
- Action: run `npx ranker-agentic-workflow doctor . --fix` first, then rerun doctor.

## Run Fails on Tests Gate

- Cause: failing tests or test command unavailable.
- Action: fix tests or install stack toolchain.

## Run Fails on Security Gate

- Cause: security scan command missing/failing findings.
- Action: install scanner and remediate vulnerabilities.

## Run Fails on Review/Docs Gate

- Cause: missing review/docs evidence in task file when strict manual gates are enabled.
- Action: fill `review_evidence` and `docs_evidence` fields in task YAML, then rerun.

## Migration Fails

- Cause: repository has partial or broken workflow structure.
- Action: run `npx ranker-agentic-workflow migrate . --force` and then `doctor`.
