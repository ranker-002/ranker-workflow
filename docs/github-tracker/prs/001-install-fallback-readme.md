# Fix install E404 onboarding with GitHub fallback

## Linked issue
- Closes #001 (npx E404 installation)

## What changed
- Updated `README.md` install section:
  - npm install command (published package path)
  - GitHub fallback install command (works before npm publish)
- Added troubleshooting section for npm 404 install error.

## Why
Users can immediately run the workflow even if npm publish is not done yet.

## Validation
- README contains executable fallback command:
  - `npx github:ranker-002/ranker-workflow init my-project`
