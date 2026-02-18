import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const CLI = path.join(ROOT, "bin", "ranker-agentic.js");

function mkTmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function run(args, cwd = ROOT) {
  return spawnSync("node", [CLI, ...args], {
    cwd,
    encoding: "utf8"
  });
}

function writeNodeProject(dir) {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "tmp-proj",
    version: "1.0.0",
    scripts: {
      test: "echo test-ok"
    }
  }, null, 2) + "\n");
}

test("init + doctor passes", () => {
  const dir = mkTmp("ranker-cli-init-");
  const init = run(["init", dir, "--yes", "--no-color"]);
  assert.equal(init.status, 0, init.stderr);

  const doctor = run(["doctor", dir, "--no-color"]);
  assert.equal(doctor.status, 0, doctor.stdout + doctor.stderr);
});

test("feature generation with type creates typed task", () => {
  const dir = mkTmp("ranker-cli-feature-");
  assert.equal(run(["init", dir, "--yes", "--no-color"]).status, 0);

  const gen = run(["feature", "auth-hardening", "--type", "api", "--project-dir", dir]);
  assert.equal(gen.status, 0, gen.stdout + gen.stderr);

  const taskPath = path.join(dir, ".ultra-workflow", "tasks", "feature-auth-hardening.yml");
  const content = fs.readFileSync(taskPath, "utf8");
  assert.match(content, /^skill:\s*api-contract/m);
});

test("run --plan-only keeps task todo", () => {
  const dir = mkTmp("ranker-cli-plan-");
  assert.equal(run(["init", dir, "--yes", "--profile", "speed", "--no-color"]).status, 0);

  const task = path.join(dir, ".ultra-workflow", "tasks", "feature.yml");
  const out = run(["run", task, "--project-dir", dir, "--plan-only", "--no-color"]);
  assert.equal(out.status, 0, out.stdout + out.stderr);

  const content = fs.readFileSync(task, "utf8");
  assert.match(content, /^status:\s*todo/m);
});

test("strict manual gates fail without evidence, pass with evidence", () => {
  const dir = mkTmp("ranker-cli-strict-");
  assert.equal(run(["init", dir, "--yes", "--profile", "speed", "--no-color"]).status, 0);
  writeNodeProject(dir);

  const task = path.join(dir, ".ultra-workflow", "tasks", "feature.yml");
  const fail = run(["run", task, "--project-dir", dir, "--strict-manual-gates", "--no-color"]);
  assert.notEqual(fail.status, 0);

  const updated = fs.readFileSync(task, "utf8")
    .replace('approver: ""', 'approver: "qa"')
    .replace('reference: ""', 'reference: "PR-1"');
  fs.writeFileSync(task, updated);

  const pass = run(["run", task, "--project-dir", dir, "--strict-manual-gates", "--no-color"]);
  assert.equal(pass.status, 0, pass.stdout + pass.stderr);
});

test("doctor --fix restores missing template", () => {
  const dir = mkTmp("ranker-cli-fix-");
  assert.equal(run(["init", dir, "--yes", "--no-color"]).status, 0);

  const missing = path.join(dir, ".ultra-workflow", "tasks", "feature-api.yml");
  fs.rmSync(missing);

  const before = run(["doctor", dir, "--no-color"]);
  assert.notEqual(before.status, 0);

  const fixed = run(["doctor", dir, "--fix", "--no-color"]);
  assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr);
  assert.ok(fs.existsSync(missing));
});

test("migrate --dry-run reports changes without applying", () => {
  const dir = mkTmp("ranker-cli-dry-");
  assert.equal(run(["init", dir, "--yes", "--no-color"]).status, 0);

  const missing = path.join(dir, ".ultra-workflow", "tasks", "feature-api.yml");
  fs.rmSync(missing);

  const dry = run(["migrate", dir, "--dry-run"]);
  assert.equal(dry.status, 0, dry.stdout + dry.stderr);
  assert.equal(fs.existsSync(missing), false);

  const real = run(["migrate", dir]);
  assert.equal(real.status, 0, real.stdout + real.stderr);
  assert.equal(fs.existsSync(missing), true);
});

test("status command prints dashboard", () => {
  const dir = mkTmp("ranker-cli-status-");
  assert.equal(run(["init", dir, "--yes", "--no-color"]).status, 0);

  const status = run(["status", dir, "--no-color"]);
  assert.equal(status.status, 0, status.stdout + status.stderr);
});

test("run uses cache on second execution", () => {
  const dir = mkTmp("ranker-cli-cache-");
  assert.equal(run(["init", dir, "--yes", "--profile", "speed", "--no-color"]).status, 0);
  writeNodeProject(dir);

  const task = path.join(dir, ".ultra-workflow", "tasks", "feature.yml");
  const content = fs.readFileSync(task, "utf8")
    .replace('approver: ""', 'approver: "qa"')
    .replace('reference: ""', 'reference: "PR-2"');
  fs.writeFileSync(task, content);

  const first = run(["run", task, "--project-dir", dir, "--strict-manual-gates", "--no-color"]);
  assert.equal(first.status, 0, first.stdout + first.stderr);

  const beforeRuns = fs.readdirSync(path.join(dir, ".ultra-workflow", "runs")).filter((f) => f.endsWith(".md")).sort();
  const second = run(["run", task, "--project-dir", dir, "--strict-manual-gates", "--no-color"]);
  assert.equal(second.status, 0, second.stdout + second.stderr);

  const afterRuns = fs.readdirSync(path.join(dir, ".ultra-workflow", "runs")).filter((f) => f.endsWith(".md")).sort();
  const latest = afterRuns.filter((f) => !beforeRuns.includes(f)).sort().slice(-1)[0] || afterRuns.slice(-1)[0];
  assert.ok(latest);
  const logContent = fs.readFileSync(path.join(dir, ".ultra-workflow", "runs", latest), "utf8");
  assert.match(logContent, /cache-hit/);
});
