# [Ops] Missing explicit npm publish playbook leads to install failures

## Summary
Repository was pushed to GitHub, but npm package was not published, causing users to hit:

`npm ERR! 404 Not Found - ranker-agentic-workflow`

## Impact
- Public install path does not work.
- Confusion between "GitHub hosted" and "npm published" states.

## Proposed fix
- Add a dedicated, step-by-step npm publish guide in go-to-production docs.
- Include local preflight, publish command, tag push, and smoke tests.

## Acceptance criteria
- New production doc exists for npm release process.
- README/go-to-production references the new doc.
