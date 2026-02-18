# [Bug] npx install fails with E404 when package is not yet on npm

## Summary
Running:

```bash
npx ranker-agentic-workflow init my-project
```

fails with:

`npm ERR! 404 Not Found - GET https://registry.npmjs.org/ranker-agentic-workflow`

## Impact
- Blocks first-time users from testing the workflow.
- Creates confusion because repository is available on GitHub but install command fails.

## Expected
- Users should have a clear fallback install path before npm publish.

## Proposed fix
- Add explicit "Install from GitHub" command in README.
- Add troubleshooting section for E404 with direct fallback command.

## Acceptance criteria
- README shows npm install and GitHub fallback side-by-side.
- README has troubleshooting note for E404.
