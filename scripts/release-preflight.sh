#!/usr/bin/env bash
set -euo pipefail

echo "[preflight] lint"
npm run lint

echo "[preflight] test"
npm test

echo "[preflight] pack dry-run"
npm pack --dry-run --cache /tmp/npm-cache >/dev/null

echo "[preflight] package metadata"
node - <<'NODE'
const pkg = require('./package.json');
if (!pkg.name || !pkg.version) {
  console.error('package.json missing name/version');
  process.exit(1);
}
if (!pkg.bin || !pkg.bin['ranker-agentic-workflow']) {
  console.error('package.json missing ranker-agentic-workflow bin entry');
  process.exit(1);
}
console.log(`name=${pkg.name} version=${pkg.version}`);
NODE

echo "[preflight] OK"
