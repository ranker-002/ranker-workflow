# 05 - npm Publish Guide

Use this guide to publish `ranker-agentic-workflow` so `npx ranker-agentic-workflow ...` works from npm.

## Preconditions
- You are logged in to npm: `npm whoami`
- You have publish rights on the package name
- `NPM_TOKEN` is configured in GitHub repository secrets

## Local preflight

```bash
npm run lint
npm test
npm pack --dry-run --cache /tmp/npm-cache
```

## Version

```bash
npm version patch
# or npm version minor
```

## Publish

```bash
npm publish --access public --provenance
```

## Git tag + push

```bash
git push origin main --tags
```

## Smoke tests

```bash
npx ranker-agentic-workflow --help
npx ranker-agentic-workflow init my-project
```

## Release pipeline guard

The GitHub release workflow also verifies:
- package visibility on npm registry after publish
- public `npx` smoke execution on the released version

## If package is not yet published
Use GitHub fallback temporarily:

```bash
npx github:ranker-002/ranker-workflow init my-project
```
