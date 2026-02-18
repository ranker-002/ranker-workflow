#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const VERSION = "0.8.0";
const TEMPLATE_NAME = "minimal";
const DEFAULT_AGENTS = ["codex", "claude", "opencode"];
const DEFAULT_PACKS = ["backend", "data", "security"];
const SUPPORTED_AGENTS = ["codex", "claude", "opencode", "generic"];
const SUPPORTED_PROFILES = ["minimal", "strict", "speed"];
const SUPPORTED_PACKS = ["frontend", "backend", "data", "security", "performance", "all"];
const REQUIRED_SKILLS = [
  "oneshot-feature",
  "debug",
  "pr",
  "commit",
  "security-audit",
  "brainstorming",
  "requirements-clarification",
  "implementation-plan",
  "test-design",
  "refactor-safe",
  "review-fix",
  "docs-update",
  "rollback-readiness",
  "api-contract",
  "db-migration-safe",
  "observability",
  "performance-check"
];
const REQUIRED_TASK_TEMPLATES = [
  "feature.yml",
  "bugfix.yml",
  "release.yml",
  "feature-api.yml",
  "feature-data.yml",
  "feature-ui.yml",
  "feature-performance.yml",
  "incident-hotfix.yml"
];

function color(text, code, enabled) {
  if (!enabled) {
    return text;
  }
  return `\x1b[${code}m${text}\x1b[0m`;
}

function banner(enabled) {
  const top = "+--------------------------------------------------------------+";
  const mid = "|                  RANKER AGENTIC WORKFLOW                     |";
  const bot = "+--------------------------------------------------------------+";
  console.log(color(top, "36", enabled));
  console.log(color(mid, "1;37", enabled));
  console.log(color(bot, "36", enabled));
}

function printHelp(noColor = false) {
  const enabled = !noColor;
  banner(enabled);
  console.log(`ranker-agentic-workflow v${VERSION}\n`);
  console.log("Usage:");
  console.log("  ranker-agentic-workflow init [target-dir] [--force] [--agents codex,claude,opencode] [--profile minimal|strict|speed] [--packs backend,data,security] [--interactive] [--yes] [--no-color]");
  console.log("  ranker-agentic-workflow feature <slug> [--title \"Feature title\"] [--type standard|api|data|ui|performance] [--wizard] [--project-dir .] [--force]");
  console.log("  ranker-agentic-workflow run <task-file> [--project-dir .] [--review-approved] [--docs-updated] [--strict-manual-gates] [--plan-only] [--auto] [--no-color]");
  console.log("  ranker-agentic-workflow validate [task-file-or-dir]");
  console.log("  ranker-agentic-workflow doctor [project-dir] [--fix]");
  console.log("  ranker-agentic-workflow ci-check [project-dir] [--task <task-file>] [--review-approved] [--docs-updated] [--strict-manual-gates]");
  console.log("  ranker-agentic-workflow benchmark [project-dir]");
  console.log("  ranker-agentic-workflow migrate [project-dir] [--force] [--dry-run]");
  console.log("  ranker-agentic-workflow status [project-dir]");
  console.log("  ranker-agentic-workflow autopilot <task-file> [--project-dir .] [--max-iterations 3] [--strict-manual-gates]");
  console.log("  ranker-agentic-workflow index [project-dir]");
  console.log("  ranker-agentic-workflow risk <task-file> [--project-dir .]");
  console.log("  ranker-agentic-workflow tune [project-dir] [--apply]");
  console.log("  ranker-agentic-workflow --help");
  console.log("\nExamples:");
  console.log("  npx ranker-agentic-workflow init my-project --agents codex,claude --profile strict --packs backend,data");
  console.log("  npx ranker-agentic-workflow feature auth-hardening --type api --title \"Harden login API\"");
  console.log("  npx ranker-agentic-workflow feature --wizard");
  console.log("  npx ranker-agentic-workflow run .ultra-workflow/tasks/feature-api.yml --review-approved --docs-updated");
  console.log("  npx ranker-agentic-workflow run .ultra-workflow/tasks/feature-api.yml --strict-manual-gates");
  console.log("  npx ranker-agentic-workflow run --auto --plan-only");
  console.log("  npx ranker-agentic-workflow run --auto --review-approved --docs-updated");
  console.log("  npx ranker-agentic-workflow doctor . --fix");
  console.log("  npx ranker-agentic-workflow ci-check . --task .ultra-workflow/tasks/feature.yml --strict-manual-gates");
  console.log("  npx ranker-agentic-workflow benchmark .");
  console.log("  npx ranker-agentic-workflow migrate .");
  console.log("  npx ranker-agentic-workflow migrate . --dry-run");
  console.log("  npx ranker-agentic-workflow status .");
  console.log("  npx ranker-agentic-workflow autopilot .ultra-workflow/tasks/feature.yml --strict-manual-gates");
  console.log("  npx ranker-agentic-workflow index .");
  console.log("  npx ranker-agentic-workflow risk .ultra-workflow/tasks/feature-api.yml");
  console.log("  npx ranker-agentic-workflow tune . --apply");
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) {
    return { cmd: "help", flags: {} };
  }

  const cmd = args[0];
  const flags = {};
  const positionals = [];

  for (let i = 1; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    if (token === "--force" || token === "--no-color" || token === "--interactive" || token === "--yes" || token === "--review-approved" || token === "--docs-updated" || token === "--auto" || token === "--strict-manual-gates" || token === "--fix" || token === "--plan-only" || token === "--dry-run" || token === "--apply") {
      flags[token.slice(2)] = true;
      continue;
    }

    const key = token.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    i += 1;
  }

  const parsed = { cmd, positionals, flags };
  if (args.includes("--help") || args.includes("-h")) {
    parsed.cmd = "help";
  }
  return parsed;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  ensureDir(dest);
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyTemplateSelective(src, dest, overwrite, stats, dryRun = false) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  ensureDir(dest);
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTemplateSelective(srcPath, destPath, overwrite, stats, dryRun);
      continue;
    }
    if (fs.existsSync(destPath) && !overwrite) {
      stats.skipped += 1;
      continue;
    }
    if (!dryRun) {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
    }
    stats.copied += 1;
  }
}

function isDirectoryEmpty(dir) {
  const items = fs.readdirSync(dir).filter((item) => item !== ".git");
  return items.length === 0;
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function appendText(filePath, content) {
  fs.appendFileSync(filePath, content, "utf8");
}

function hasKey(content, key) {
  return new RegExp(`^${key}:`, "m").test(content);
}

function nowStamp() {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function parseAgents(rawAgents) {
  if (!rawAgents) {
    return [...DEFAULT_AGENTS];
  }
  const list = String(rawAgents).split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  const unique = [...new Set(list)];
  if (unique.includes("all")) {
    return [...DEFAULT_AGENTS];
  }
  const unsupported = unique.filter((v) => !SUPPORTED_AGENTS.includes(v));
  if (unsupported.length > 0) {
    console.error(`Unsupported agent(s): ${unsupported.join(", ")}`);
    process.exit(1);
  }
  return unique.length > 0 ? unique : [...DEFAULT_AGENTS];
}

function parsePacks(rawPacks) {
  if (!rawPacks) {
    return [...DEFAULT_PACKS];
  }
  const list = String(rawPacks).split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  const unique = [...new Set(list)];
  if (unique.includes("all")) {
    return SUPPORTED_PACKS.filter((v) => v !== "all");
  }
  const unsupported = unique.filter((v) => !SUPPORTED_PACKS.includes(v));
  if (unsupported.length > 0) {
    console.error(`Unsupported pack(s): ${unsupported.join(", ")}`);
    process.exit(1);
  }
  return unique.length > 0 ? unique : [...DEFAULT_PACKS];
}

function parseProfile(rawProfile) {
  const value = (rawProfile || "strict").toString().toLowerCase();
  if (!SUPPORTED_PROFILES.includes(value)) {
    console.error(`Unsupported profile: ${value}`);
    process.exit(1);
  }
  return value;
}

function parseAgentSelectionInput(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return [...DEFAULT_AGENTS];
  }
  const map = { "1": "codex", "2": "claude", "3": "opencode", "4": "generic", "5": "all" };
  const picked = trimmed.split(",").map((v) => v.trim()).filter(Boolean).map((v) => map[v] || v);
  return parseAgents(picked.join(","));
}

function parsePackSelectionInput(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return [...DEFAULT_PACKS];
  }
  const map = { "1": "backend", "2": "data", "3": "frontend", "4": "security", "5": "performance", "6": "all" };
  const picked = trimmed.split(",").map((v) => v.trim()).filter(Boolean).map((v) => map[v] || v);
  return parsePacks(picked.join(","));
}

function parseProfileSelectionInput(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return "strict";
  }
  const map = { "1": "strict", "2": "minimal", "3": "speed" };
  return parseProfile(map[trimmed] || trimmed);
}

async function promptInstallOptions(noColor) {
  const enabled = !noColor;
  banner(enabled);
  console.log(color("Interactive installation", "1;35", enabled));
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("\nAgents:");
    console.log("  1. Codex");
    console.log("  2. Claude Code");
    console.log("  3. OpenCode");
    console.log("  4. Generic");
    console.log("  5. All defaults");
    const agentInput = await rl.question("Choose agents [1,2,3 default]: ");

    console.log("\nPacks:");
    console.log("  1. backend");
    console.log("  2. data");
    console.log("  3. frontend");
    console.log("  4. security");
    console.log("  5. performance");
    console.log("  6. all");
    const packInput = await rl.question("Choose packs [1,2,4 default]: ");

    console.log("\nProfile:");
    console.log("  1. strict (recommended)");
    console.log("  2. minimal");
    console.log("  3. speed");
    const profileInput = await rl.question("Choose profile [1 default]: ");

    return {
      agents: parseAgentSelectionInput(agentInput),
      packs: parsePackSelectionInput(packInput),
      profile: parseProfileSelectionInput(profileInput)
    };
  } finally {
    rl.close();
  }
}

function sanitizeSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function toTitleFromSlug(slug) {
  return slug.split("-").filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
}

function detectNextFeatureId(tasksDir) {
  const files = fs.existsSync(tasksDir) ? fs.readdirSync(tasksDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml")) : [];
  const ids = [];
  for (const name of files) {
    const match = readText(path.join(tasksDir, name)).match(/^id:\s*FEAT-(\d+)/m);
    if (match) {
      ids.push(Number(match[1]));
    }
  }
  const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  return `FEAT-${String(next).padStart(3, "0")}`;
}

function buildFeatureTaskYaml(id, slug, title, type) {
  const resolvedTitle = title || `Implement ${toTitleFromSlug(slug)} feature`;
  const skillByType = {
    standard: "oneshot-feature",
    api: "api-contract",
    data: "db-migration-safe",
    ui: "oneshot-feature",
    performance: "performance-check"
  };
  const skill = skillByType[type] || "oneshot-feature";
  return `id: ${id}\ntitle: "${resolvedTitle}"\nowner_agent: implementer\nsupporting_agents:\n  - reviewer\n  - security-auditor\nskill: ${skill}\ncontext:\n  business_goal: "Deliver ${toTitleFromSlug(slug)} with measurable value and reliability."\n  technical_scope: "Implement ${slug} end-to-end with tests and release-safe behavior."\nacceptance_criteria:\n  - "Core user path for ${slug} works as expected."\n  - "Edge cases and invalid inputs are handled safely."\n  - "Automated tests cover success and failure paths."\n  - "Security and review quality gates pass without blockers."\nimplementation_plan:\n  - "Design minimal implementation satisfying acceptance criteria."\n  - "Implement feature and required tests."\n  - "Run validation and resolve findings."\n  - "Prepare concise delivery notes and residual risks."\nquality_gates:\n  tests: required\n  security: required\n  review: required\nstatus: todo\n`;
}

function profileToGateValues(profile) {
  if (profile === "speed") {
    return { testsRequired: true, securityRequired: false, reviewRequired: true, docsRequired: false };
  }
  if (profile === "minimal") {
    return { testsRequired: true, securityRequired: true, reviewRequired: true, docsRequired: false };
  }
  return { testsRequired: true, securityRequired: true, reviewRequired: true, docsRequired: true };
}

function patchConfigProfile(targetDir, profile) {
  const configPath = path.join(targetDir, ".ultra-workflow", "config.yml");
  if (!fs.existsSync(configPath)) {
    return;
  }
  const gates = profileToGateValues(profile);
  let cfg = readText(configPath);
  cfg = cfg.replace(/^version:\s*\d+/m, "version: 7");
  cfg = cfg.replace(/^workflow_name:\s*.*/m, "workflow_name: ranker-agentic");
  cfg = cfg.replace(/^  tests_required:\s*.*/m, `  tests_required: ${gates.testsRequired}`);
  cfg = cfg.replace(/^  security_scan_required:\s*.*/m, `  security_scan_required: ${gates.securityRequired}`);
  cfg = cfg.replace(/^  review_required:\s*.*/m, `  review_required: ${gates.reviewRequired}`);
  cfg = cfg.replace(/^  docs_update_required:\s*.*/m, `  docs_update_required: ${gates.docsRequired}`);
  if (!/^risk_policy:/m.test(cfg)) {
    cfg += "\nrisk_policy:\n  high_risk_threshold: 70\n  require_strict_manual_gates: true\n";
  }
  if (!/^reliability:/m.test(cfg)) {
    cfg += "\nreliability:\n  max_autopilot_iterations: 3\n  auto_fix_enabled: true\n";
  }
  if (!/high_risk_threshold:/m.test(cfg)) {
    cfg += "high_risk_threshold: 70\n";
  }
  if (!/require_strict_manual_gates:/m.test(cfg)) {
    cfg += "require_strict_manual_gates: true\n";
  }
  if (!/max_autopilot_iterations:/m.test(cfg)) {
    cfg += "max_autopilot_iterations: 3\n";
  }
  if (!/auto_fix_enabled:/m.test(cfg)) {
    cfg += "auto_fix_enabled: true\n";
  }
  writeText(configPath, cfg);
}

function writeInstallManifest(targetDir, agents, profile, packs) {
  const manifestPath = path.join(targetDir, ".ultra-workflow", "install.json");
  const manifest = {
    name: "ranker-agentic-workflow",
    version: VERSION,
    installed_at: new Date().toISOString(),
    agents,
    profile,
    packs
  };
  writeText(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

function writePackConfig(targetDir, packs) {
  const packsDir = path.join(targetDir, ".ultra-workflow", "packs");
  ensureDir(packsDir);
  const enabledPath = path.join(packsDir, "enabled.yml");
  writeText(enabledPath, `enabled:\n${packs.map((p) => `  - ${p}`).join("\n")}\n`);
}

function writeRootFiles(targetDir, agents, profile, packs) {
  const readmePath = path.join(targetDir, "WORKFLOW.md");
  const contracts = [];

  if (!fs.existsSync(readmePath)) {
    writeText(readmePath, `# Ranker Agentic Workflow\n\n- Workflow config: \.ultra-workflow/\n- Install profile: ${profile}\n- Enabled packs: ${packs.join(", ")}\n\n## Start\n\n1. Open \.ultra-workflow/prompts/runbook.md\n2. Generate a feature task\n3. Run quality gates\n`);
  }

  if (agents.includes("codex")) {
    writeText(path.join(targetDir, "AGENTS.md"), `# AGENTS.md\n\nAll AI agents MUST use \.ultra-workflow tasks, skills, and gates before any merge/release action.\n`);
    contracts.push("AGENTS.md (Codex)");
  }
  if (agents.includes("claude")) {
    writeText(path.join(targetDir, "CLAUDE.md"), `# CLAUDE.md\n\nUse task-first execution with mandatory gates from \.ultra-workflow/.\n`);
    contracts.push("CLAUDE.md (Claude Code)");
  }
  if (agents.includes("opencode")) {
    writeText(path.join(targetDir, "OPENCODE.md"), `# OPENCODE.md\n\nFollow Ranker Agentic tasks, selected skills, and gates for all changes.\n`);
    contracts.push("OPENCODE.md (OpenCode)");
  }
  if (agents.includes("generic")) {
    writeText(path.join(targetDir, "AI-WORKFLOW.md"), `# AI-WORKFLOW.md\n\nAny coding agent must execute task-first with quality gates from \.ultra-workflow/.\n`);
    contracts.push("AI-WORKFLOW.md (Generic)");
  }

  return contracts;
}

function collectTaskFiles(target) {
  const resolved = path.resolve(process.cwd(), target || ".ultra-workflow/tasks");
  if (!fs.existsSync(resolved)) {
    return [];
  }
  const stat = fs.statSync(resolved);
  if (stat.isFile()) {
    return [resolved];
  }
  return fs.readdirSync(resolved)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .map((name) => path.join(resolved, name));
}

function validateTaskFile(filePath) {
  const content = readText(filePath);
  const required = ["id", "title", "owner_agent", "status"];
  const missing = required.filter((k) => !hasKey(content, k));

  const basename = path.basename(filePath);
  const isFeature = basename.startsWith("feature");
  if (isFeature && !hasKey(content, "acceptance_criteria")) {
    missing.push("acceptance_criteria");
  }
  if (basename.includes("bugfix") && !hasKey(content, "root_cause")) {
    missing.push("root_cause");
  }
  if (basename.includes("release") && !hasKey(content, "release_checks")) {
    missing.push("release_checks");
  }
  if (basename.includes("incident-hotfix")) {
    if (!hasKey(content, "root_cause")) {
      missing.push("root_cause");
    }
    if (!hasKey(content, "mitigation_plan")) {
      missing.push("mitigation_plan");
    }
  }

  return { filePath, ok: missing.length === 0, missing };
}

function validate(targetArg) {
  const files = collectTaskFiles(targetArg);
  if (files.length === 0) {
    console.error("No task files found to validate.");
    process.exit(1);
  }
  const results = files.map(validateTaskFile);
  const failed = results.filter((r) => !r.ok);
  for (const result of results) {
    if (result.ok) {
      console.log(`OK   ${result.filePath}`);
    } else {
      console.log(`FAIL ${result.filePath} -> missing: ${result.missing.join(", ")}`);
    }
  }
  if (failed.length > 0) {
    process.exit(1);
  }
}

function checkExists(errors, p) {
  if (!fs.existsSync(p)) {
    errors.push(`Missing: ${p}`);
  }
}

function parseInstallManifest(root, errors) {
  const manifestPath = path.join(root, ".ultra-workflow", "install.json");
  if (!fs.existsSync(manifestPath)) {
    errors.push(`Missing: ${manifestPath}`);
    return null;
  }
  try {
    return JSON.parse(readText(manifestPath));
  } catch {
    errors.push(`Invalid JSON: ${manifestPath}`);
    return null;
  }
}

function checkAgentContract(root, agent, errors) {
  const map = { codex: "AGENTS.md", claude: "CLAUDE.md", opencode: "OPENCODE.md", generic: "AI-WORKFLOW.md" };
  const filename = map[agent];
  if (filename) {
    checkExists(errors, path.join(root, filename));
  }
}

function collectDoctorErrors(root) {
  const wf = path.join(root, ".ultra-workflow");
  const errors = [];

  checkExists(errors, wf);
  checkExists(errors, path.join(wf, "config.yml"));
  checkExists(errors, path.join(wf, "agents"));
  checkExists(errors, path.join(wf, "skills"));
  checkExists(errors, path.join(wf, "tasks"));
  checkExists(errors, path.join(wf, "checklists", "definition-of-done.md"));
  checkExists(errors, path.join(wf, "prompts", "runbook.md"));
  checkExists(errors, path.join(wf, "references", "skill-selection.md"));
  checkExists(errors, path.join(wf, "benchmark", "scenarios.yml"));
  checkExists(errors, path.join(wf, "packs", "enabled.yml"));

  for (const skill of REQUIRED_SKILLS) {
    checkExists(errors, path.join(wf, "skills", skill, "SKILL.md"));
  }
  for (const task of REQUIRED_TASK_TEMPLATES) {
    checkExists(errors, path.join(wf, "tasks", task));
  }

  const manifest = parseInstallManifest(root, errors);
  if (manifest && Array.isArray(manifest.agents)) {
    for (const agent of manifest.agents) {
      checkAgentContract(root, agent, errors);
    }
  }

  const taskFiles = fs.existsSync(path.join(wf, "tasks")) ? collectTaskFiles(path.join(wf, "tasks")) : [];
  for (const result of taskFiles.map(validateTaskFile).filter((r) => !r.ok)) {
    errors.push(`Invalid task file ${result.filePath}: missing ${result.missing.join(", ")}`);
  }

  const configPath = path.join(wf, "config.yml");
  if (fs.existsSync(configPath)) {
    const cfg = readText(configPath);
    const gateKeys = [
      "tests_required:",
      "security_scan_required:",
      "review_required:",
      "docs_update_required:",
      "high_risk_threshold:",
      "require_strict_manual_gates:",
      "max_autopilot_iterations:",
      "auto_fix_enabled:"
    ];
    for (const gate of gateKeys) {
      if (!cfg.includes(gate)) {
        errors.push(`Config gate key missing: ${gate}`);
      }
    }
  }

  return errors;
}

function commandExists(binary, cwd) {
  const probe = spawnSync("bash", ["-lc", `command -v ${binary}`], { cwd, encoding: "utf8" });
  return probe.status === 0;
}

function runShellCommand(cmd, cwd) {
  const result = spawnSync("bash", ["-lc", cmd], { cwd, encoding: "utf8" });
  return {
    cmd,
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim()
  };
}

function hasNpmScript(root, scriptName) {
  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(packagePath)) {
    return false;
  }
  try {
    const pkg = JSON.parse(readText(packagePath));
    return Boolean(pkg && pkg.scripts && pkg.scripts[scriptName]);
  } catch {
    return false;
  }
}

function isCandidateConfigured(root, cmd) {
  const npmRun = cmd.match(/^npm\s+run(?:\s+-s)?\s+([a-zA-Z0-9:_-]+)/);
  if (npmRun) {
    return hasNpmScript(root, npmRun[1]);
  }
  return true;
}

function runShellCommandAsync(cmd, cwd) {
  return new Promise((resolve) => {
    const child = spawn("bash", ["-lc", cmd], { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      resolve({
        cmd,
        ok: code === 0,
        status: code ?? 1,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

function detectStacks(root) {
  const stacks = [];
  if (fs.existsSync(path.join(root, "package.json"))) {
    stacks.push("node");
  }
  if (fs.existsSync(path.join(root, "pyproject.toml")) || fs.existsSync(path.join(root, "requirements.txt"))) {
    stacks.push("python");
  }
  if (fs.existsSync(path.join(root, "go.mod"))) {
    stacks.push("go");
  }
  if (fs.existsSync(path.join(root, "Cargo.toml"))) {
    stacks.push("rust");
  }
  return stacks;
}

function getStackCommands(stack) {
  if (stack === "node") {
    return {
      tests: ["npm test --silent", "npm run -s test"],
      security: ["npm audit --audit-level=high --omit=dev", "npm audit --audit-level=high"]
    };
  }
  if (stack === "python") {
    return {
      tests: ["pytest -q"],
      security: ["pip-audit", "bandit -q -r ."]
    };
  }
  if (stack === "go") {
    return {
      tests: ["go test ./..."],
      security: ["go vet ./..."]
    };
  }
  if (stack === "rust") {
    return {
      tests: ["cargo test --quiet"],
      security: ["cargo audit", "cargo clippy --quiet -- -D warnings"]
    };
  }
  return { tests: [], security: [] };
}

function tryCommandCandidates(candidates, root) {
  for (const cmd of candidates) {
    const binary = cmd.split(/\s+/)[0];
    if (!commandExists(binary, root)) {
      continue;
    }
    return runShellCommand(cmd, root);
  }
  return { cmd: candidates.join(" || "), ok: false, status: -1, stdout: "", stderr: "No compatible command available" };
}

async function tryCommandCandidatesAsync(candidates, root) {
  for (const cmd of candidates) {
    const binary = cmd.split(/\s+/)[0];
    if (!commandExists(binary, root)) {
      continue;
    }
    return runShellCommandAsync(cmd, root);
  }
  return { cmd: candidates.join(" || "), ok: false, status: -1, stdout: "", stderr: "No compatible command available" };
}

function parseBooleanConfig(content, key, fallback) {
  const match = content.match(new RegExp(`^\\s*${key}:\\s*(true|false)`, "m"));
  if (!match) {
    return fallback;
  }
  return match[1] === "true";
}

function parseNumberConfig(content, key, fallback) {
  const match = content.match(new RegExp(`^\\s*${key}:\\s*([0-9]+)`, "m"));
  if (!match) {
    return fallback;
  }
  return Number(match[1]);
}

function taskGateRequired(taskContent, gateName) {
  return new RegExp(`^\\s*${gateName}:\\s*required`, "m").test(taskContent);
}

function computeFingerprint(root, _taskFile, cmd) {
  const files = [
    path.join(root, "package.json"),
    path.join(root, "package-lock.json"),
    path.join(root, "pnpm-lock.yaml"),
    path.join(root, "yarn.lock"),
    path.join(root, "requirements.txt"),
    path.join(root, "pyproject.toml"),
    path.join(root, "go.mod"),
    path.join(root, "go.sum"),
    path.join(root, "Cargo.toml"),
    path.join(root, "Cargo.lock")
  ];
  const chunks = [cmd];
  for (const f of files) {
    if (!fs.existsSync(f)) {
      continue;
    }
    const st = fs.statSync(f);
    chunks.push(`${f}:${st.mtimeMs}:${st.size}`);
  }
  return createHash("sha1").update(chunks.join("|")).digest("hex");
}

function readCheckCache(root) {
  const cacheDir = path.join(root, ".ultra-workflow", "cache");
  const cachePath = path.join(cacheDir, "checks.json");
  if (!fs.existsSync(cachePath)) {
    return { path: cachePath, data: {} };
  }
  try {
    return { path: cachePath, data: JSON.parse(readText(cachePath)) };
  } catch {
    return { path: cachePath, data: {} };
  }
}

function writeCheckCache(cachePath, data) {
  ensureDir(path.dirname(cachePath));
  writeText(cachePath, JSON.stringify(data, null, 2) + "\n");
}

function extractYamlBlock(content, key) {
  const match = content.match(new RegExp(`^${key}:\\n((?:\\s{2}.+\\n?)*)`, "m"));
  return match ? match[1] : "";
}

function yamlScalarNonEmpty(block, key) {
  const match = block.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"));
  if (!match) {
    return false;
  }
  const value = match[1].trim();
  return value !== "" && value !== "\"\"" && value !== "''";
}

function yamlListHasNonEmptyItem(block, key) {
  const listStart = block.match(new RegExp(`^\\s*${key}:\\s*$`, "m"));
  if (!listStart) {
    return false;
  }
  const lines = block.split("\n");
  let inList = false;
  for (const line of lines) {
    if (!inList) {
      if (new RegExp(`^\\s*${key}:\\s*$`).test(line)) {
        inList = true;
      }
      continue;
    }
    if (/^\s*[a-z_]+:\s*/.test(line)) {
      break;
    }
    const item = line.match(/^\s*-\s*(.+)\s*$/);
    if (!item) {
      continue;
    }
    const value = item[1].trim();
    if (value !== "" && value !== "\"\"" && value !== "''") {
      return true;
    }
  }
  return false;
}

function evaluateManualEvidence(taskContent) {
  const reviewBlock = extractYamlBlock(taskContent, "review_evidence");
  const docsBlock = extractYamlBlock(taskContent, "docs_evidence");
  return {
    review: yamlScalarNonEmpty(reviewBlock, "approver") && yamlScalarNonEmpty(reviewBlock, "reference"),
    docs: yamlListHasNonEmptyItem(docsBlock, "updated_files")
  };
}

function ensureRunLog(root, taskFilePath) {
  const runsDir = path.join(root, ".ultra-workflow", "runs");
  ensureDir(runsDir);
  const taskName = path.basename(taskFilePath).replace(/\.ya?ml$/, "");
  const logPath = path.join(runsDir, `${nowStamp()}-${taskName}.md`);
  writeText(logPath, `# Run Log\n\n- Task: ${taskFilePath}\n- Started: ${new Date().toISOString()}\n\n## Steps\n`);
  return logPath;
}

function logRunStep(logPath, title, result) {
  appendText(logPath, `\n### ${title}\n\n- Command: \`${result.cmd}\`\n- Status: ${result.ok ? "PASS" : "FAIL"}\n`);
  if (result.stdout) {
    appendText(logPath, `- Stdout:\n\n\`\`\`text\n${result.stdout.slice(0, 5000)}\n\`\`\`\n`);
  }
  if (result.stderr) {
    appendText(logPath, `- Stderr:\n\n\`\`\`text\n${result.stderr.slice(0, 5000)}\n\`\`\`\n`);
  }
}

function updateTaskStatus(taskFile, status) {
  if (!fs.existsSync(taskFile)) {
    return;
  }
  const content = readText(taskFile);
  if (/^status:\s*/m.test(content)) {
    writeText(taskFile, content.replace(/^status:\s*.*/m, `status: ${status}`));
  }
}

function resolveTaskPath(taskArg, root) {
  if (!taskArg) {
    console.error("run requires a task file argument.");
    process.exit(1);
  }
  const candidate = path.isAbsolute(taskArg) ? taskArg : path.resolve(root, taskArg);
  if (!fs.existsSync(candidate)) {
    console.error(`Task file not found: ${candidate}`);
    process.exit(1);
  }
  return candidate;
}

function taskStatus(taskFile) {
  const content = readText(taskFile);
  const match = content.match(/^status:\s*([a-z_]+)/m);
  return match ? match[1].trim().toLowerCase() : "";
}

function detectTaskType(taskFile, taskContent) {
  const base = path.basename(taskFile);
  if (base.includes("hotfix")) {
    return "hotfix";
  }
  if (base.includes("api")) {
    return "api";
  }
  if (base.includes("data")) {
    return "data";
  }
  if (base.includes("performance")) {
    return "performance";
  }
  if (base.includes("ui")) {
    return "ui";
  }
  const skill = taskContent.match(/^skill:\s*([a-z0-9-]+)/m)?.[1] || "";
  if (skill === "api-contract") {
    return "api";
  }
  if (skill === "db-migration-safe") {
    return "data";
  }
  if (skill === "performance-check") {
    return "performance";
  }
  return "standard";
}

function computeRisk(taskFile, taskContent) {
  let score = 20;
  const base = path.basename(taskFile).toLowerCase();
  const title = (taskContent.match(/^title:\s*"?(.*?)"?$/m)?.[1] || "").toLowerCase();
  const scope = (taskContent.match(/technical_scope:\s*"?(.*?)"?$/m)?.[1] || "").toLowerCase();
  const text = `${base} ${title} ${scope} ${taskContent.toLowerCase()}`;

  const add = (cond, points) => {
    if (cond) {
      score += points;
    }
  };

  add(base.includes("hotfix"), 35);
  add(base.includes("release"), 20);
  add(text.includes("auth") || text.includes("authorization"), 15);
  add(text.includes("security"), 20);
  add(text.includes("migration") || text.includes("schema") || text.includes("db"), 20);
  add(text.includes("payment") || text.includes("billing"), 20);
  add(text.includes("performance") || text.includes("latency"), 10);
  add(text.includes("public api") || base.includes("api"), 15);

  if (score > 100) {
    score = 100;
  }
  const level = score >= 80 ? "critical" : score >= 60 ? "high" : score >= 40 ? "medium" : "low";
  return { score, level };
}

function getTypeSpecificChecks(taskType, stack) {
  const checks = [];
  if (taskType === "api") {
    if (stack === "node") {
      checks.push({ name: "api-contract", candidates: ["npm run -s test:contract", "npm run -s test:api"] });
    }
    if (stack === "python") {
      checks.push({ name: "api-contract", candidates: ["pytest -q tests/contract", "pytest -q tests/api"] });
    }
  }
  if (taskType === "data") {
    if (stack === "node") {
      checks.push({ name: "migration-safety", candidates: ["npm run -s migration:check", "npm run -s db:check"] });
    }
    if (stack === "python") {
      checks.push({ name: "migration-safety", candidates: ["alembic check", "pytest -q tests/migrations"] });
    }
  }
  if (taskType === "performance") {
    if (stack === "node") {
      checks.push({ name: "performance", candidates: ["npm run -s bench", "npm run -s test:perf"] });
    }
    if (stack === "go") {
      checks.push({ name: "performance", candidates: ["go test -bench=. ./..."] });
    }
    if (stack === "rust") {
      checks.push({ name: "performance", candidates: ["cargo bench"] });
    }
  }
  if (taskType === "ui" && stack === "node") {
    checks.push({ name: "ui-quality", candidates: ["npm run -s test:a11y", "npm run -s lint"] });
  }
  return checks;
}

function getAdvancedOracleChecks(stack) {
  if (stack === "node") {
    return [
      { name: "oracle-mutation", candidates: ["npm run -s test:mutation"] },
      { name: "oracle-fuzz", candidates: ["npm run -s test:fuzz"] },
      { name: "oracle-snapshot", candidates: ["npm run -s test:snapshot"] }
    ];
  }
  if (stack === "python") {
    return [
      { name: "oracle-mutation", candidates: ["mutmut run"] },
      { name: "oracle-fuzz", candidates: ["pytest -q tests/fuzz"] }
    ];
  }
  if (stack === "go") {
    return [
      { name: "oracle-fuzz", candidates: ["go test ./... -fuzz=Fuzz"] }
    ];
  }
  return [];
}

function selectAutoTask(root) {
  const tasksDir = path.join(root, ".ultra-workflow", "tasks");
  if (!fs.existsSync(tasksDir)) {
    console.error(`Missing workflow tasks directory: ${tasksDir}`);
    process.exit(1);
  }

  const files = collectTaskFiles(tasksDir);
  const templateSet = new Set(REQUIRED_TASK_TEMPLATES);
  const todo = files.filter((file) => taskStatus(file) === "todo");
  if (todo.length === 0) {
    console.error("No task with status: todo found.");
    process.exit(1);
  }

  const custom = todo.filter((file) => !templateSet.has(path.basename(file)));
  const picked = (custom.length > 0 ? custom : todo).sort((a, b) => a.localeCompare(b))[0];
  return picked;
}

async function runCandidateWithCache(root, taskFile, cache, gate, stack, title, candidates) {
  const available = [];
  for (const cmd of candidates) {
    const binary = cmd.split(/\s+/)[0];
    if (commandExists(binary, root)) {
      if (isCandidateConfigured(root, cmd)) {
        available.push(cmd);
      }
    }
  }
  if (available.length === 0) {
    return { gate, stack, title, result: { cmd: candidates.join(" || "), ok: false, status: -1, stdout: "", stderr: "No compatible command available" }, fromCache: false, runnable: false };
  }

  const cmd = available[0];
  const key = `${gate}:${stack}:${cmd}`;
  const fingerprint = computeFingerprint(root, taskFile, cmd);
  const cached = cache[key];
  if (cached && cached.fingerprint === fingerprint && cached.result && cached.result.ok) {
    return { gate, stack, title, result: { ...cached.result }, fromCache: true, runnable: true };
  }

  const result = await runShellCommandAsync(cmd, root);
  cache[key] = {
    fingerprint,
    ts: new Date().toISOString(),
    result
  };
  return { gate, stack, title, result, fromCache: false, runnable: true };
}

async function executeQualityChecks(root, taskFile, taskType, gates, logPath) {
  const stacks = detectStacks(root);
  const pending = [];
  const immediateResults = [];
  const cacheObj = readCheckCache(root);
  const cache = cacheObj.data;

  if (gates.tests) {
    if (stacks.length === 0) {
      const r = { cmd: "stack-detection", ok: false, status: 1, stdout: "", stderr: "No supported stack detected for tests" };
      immediateResults.push({ gate: "tests", result: r });
      logRunStep(logPath, "tests (stack-detection)", r);
    } else {
      for (const stack of stacks) {
        pending.push(runCandidateWithCache(root, taskFile, cache, "tests", stack, `tests (${stack})`, getStackCommands(stack).tests));
      }
    }
  }

  if (gates.security) {
    if (stacks.length === 0) {
      const r = { cmd: "stack-detection", ok: false, status: 1, stdout: "", stderr: "No supported stack detected for security checks" };
      immediateResults.push({ gate: "security", result: r });
      logRunStep(logPath, "security (stack-detection)", r);
    } else {
      for (const stack of stacks) {
        pending.push(runCandidateWithCache(root, taskFile, cache, "security", stack, `security (${stack})`, getStackCommands(stack).security));
      }
    }
  }

  if (stacks.length > 0) {
    for (const stack of stacks) {
      for (const check of getTypeSpecificChecks(taskType, stack)) {
        pending.push(runCandidateWithCache(root, taskFile, cache, "type-specific", stack, `${check.name} (${stack})`, check.candidates));
      }
      for (const check of getAdvancedOracleChecks(stack)) {
        pending.push(runCandidateWithCache(root, taskFile, cache, "oracle", stack, `${check.name} (${stack})`, check.candidates));
      }
    }
  }

  const parallelResults = await Promise.all(pending);
  for (const r of parallelResults) {
    const title = `${r.title}${r.fromCache ? " [cache-hit]" : ""}`;
    logRunStep(logPath, title, r.result);
  }
  writeCheckCache(cacheObj.path, cache);
  return [...immediateResults, ...parallelResults];
}

function allGateChecksPassed(results, gateName) {
  const scoped = results.filter((r) => r.gate === gateName);
  if (scoped.length === 0) {
    return false;
  }
  return scoped.every((r) => r.result.ok);
}

async function runTask(taskArg, projectDirRaw, reviewApproved, docsUpdated, strictManualGates, planOnly, noColor) {
  const startedAt = new Date();
  const startedMs = Date.now();
  const enabled = !noColor;
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const taskFile = taskArg ? resolveTaskPath(taskArg, root) : selectAutoTask(root);
  const taskValidation = validateTaskFile(taskFile);

  if (!taskValidation.ok) {
    console.error(`Task is invalid: missing ${taskValidation.missing.join(", ")}`);
    process.exit(1);
  }

  const doctorErrors = collectDoctorErrors(root);
  if (doctorErrors.length > 0) {
    console.error("Doctor checks failed. Run `doctor` first.");
    for (const e of doctorErrors) {
      console.error(`- ${e}`);
    }
    process.exit(1);
  }

  const taskContent = readText(taskFile);
  const configContent = readText(path.join(root, ".ultra-workflow", "config.yml"));
  const configGates = {
    tests: parseBooleanConfig(configContent, "tests_required", true),
    security: parseBooleanConfig(configContent, "security_scan_required", true),
    review: parseBooleanConfig(configContent, "review_required", true),
    docs: parseBooleanConfig(configContent, "docs_update_required", false)
  };

  const gates = {
    tests: configGates.tests,
    security: configGates.security,
    review: configGates.review,
    docs: configGates.docs
  };
  const manualEvidence = evaluateManualEvidence(taskContent);
  const taskType = detectTaskType(taskFile, taskContent);
  const risk = computeRisk(taskFile, taskContent);
  const riskThreshold = parseNumberConfig(configContent, "high_risk_threshold", 70);
  const requireStrictForHighRisk = parseBooleanConfig(configContent, "require_strict_manual_gates", true);

  const logPath = ensureRunLog(root, taskFile);
  updateTaskStatus(taskFile, "in_progress");

  banner(enabled);
  console.log(color("Running task", "1;34", enabled));
  console.log(`Task: ${taskFile}`);
  console.log(`Risk: ${risk.level} (${risk.score})`);

  if (!planOnly && requireStrictForHighRisk && risk.score >= riskThreshold && !strictManualGates) {
    console.error(`Risk policy failed: score ${risk.score} >= ${riskThreshold}. Use --strict-manual-gates.`);
    updateTaskStatus(taskFile, "blocked");
    appendText(logPath, `\n## Risk Policy\n\n- score: ${risk.score}\n- threshold: ${riskThreshold}\n- strict_required: true\n- result: FAIL\n`);
    process.exit(1);
  }

  if (planOnly) {
    console.log("Plan-only mode enabled. No checks executed.");
    console.log(`Planned gates: tests=${gates.tests}, security=${gates.security}, review=${gates.review}, docs=${gates.docs}, type=${taskType}`);
    appendText(logPath, `\n## Plan Only\n\n- tests: ${gates.tests}\n- security: ${gates.security}\n- review: ${gates.review}\n- docs: ${gates.docs}\n- task_type: ${taskType}\n- manual_mode: ${strictManualGates}\n`);
    updateTaskStatus(taskFile, "todo");
    console.log(`Run log: ${logPath}`);
    return;
  }

  const checkResults = await executeQualityChecks(root, taskFile, taskType, gates, logPath);

  let ok = true;
  if (gates.tests && !allGateChecksPassed(checkResults, "tests")) {
    ok = false;
    console.error("Tests gate failed.");
  }
  if (gates.security && !allGateChecksPassed(checkResults, "security")) {
    ok = false;
    console.error("Security gate failed.");
  }
  const typeSpecificFailures = checkResults.filter((r) => r.gate === "type-specific" && r.runnable && !r.result.ok);
  if (typeSpecificFailures.length > 0) {
    ok = false;
    console.error(`Type-specific checks failed (${taskType}).`);
  }
  const oracleFailures = checkResults.filter((r) => r.gate === "oracle" && r.runnable && !r.result.ok);
  if (oracleFailures.length > 0) {
    ok = false;
    console.error("Oracle checks failed.");
  }
  if (gates.review) {
    if (strictManualGates) {
      if (!manualEvidence.review) {
        ok = false;
        console.error("Review gate failed. Missing task review_evidence.approver/reference.");
      }
    } else if (!reviewApproved) {
      ok = false;
      console.error("Review gate failed. Use --review-approved when reviewer approval exists.");
    }
  }
  if (gates.docs) {
    if (strictManualGates) {
      if (!manualEvidence.docs) {
        ok = false;
        console.error("Docs gate failed. Missing task docs_evidence.updated_files entries.");
      }
    } else if (!docsUpdated) {
      ok = false;
      console.error("Docs gate failed. Use --docs-updated after documentation update.");
    }
  }

  const reviewPass = strictManualGates ? manualEvidence.review : reviewApproved;
  const docsPass = strictManualGates ? manualEvidence.docs : docsUpdated;
  const typeSpecificExecuted = checkResults.filter((r) => r.gate === "type-specific" && r.runnable);
  const typeSpecificPass = typeSpecificExecuted.length === 0 ? "SKIPPED" : (typeSpecificFailures.length === 0 ? "PASS" : "FAIL");
  const oracleExecuted = checkResults.filter((r) => r.gate === "oracle" && r.runnable);
  const oraclePass = oracleExecuted.length === 0 ? "SKIPPED" : (oracleFailures.length === 0 ? "PASS" : "FAIL");
  appendText(logPath, `\n## Gate Summary\n\n- Task type: ${taskType}\n- Risk: ${risk.level} (${risk.score})\n- Tests: ${gates.tests ? (allGateChecksPassed(checkResults, "tests") ? "PASS" : "FAIL") : "SKIPPED"}\n- Security: ${gates.security ? (allGateChecksPassed(checkResults, "security") ? "PASS" : "FAIL") : "SKIPPED"}\n- Type-specific: ${typeSpecificPass}\n- Oracle: ${oraclePass}\n- Review: ${gates.review ? (reviewPass ? "PASS" : "FAIL") : "SKIPPED"}\n- Docs: ${gates.docs ? (docsPass ? "PASS" : "FAIL") : "SKIPPED"}\n- Manual gate mode: ${strictManualGates ? "ENABLED" : "DISABLED"}\n`);
  appendText(logPath, `\n- Completed: ${new Date().toISOString()}\n- Result: ${ok ? "PASS" : "FAIL"}\n`);

  const metricsPath = path.join(root, ".ultra-workflow", "runs", "metrics.jsonl");
  const durationMs = Date.now() - startedMs;
  const cacheHits = checkResults.filter((r) => r.fromCache).length;
  const metrics = {
    ts: startedAt.toISOString(),
    task: path.basename(taskFile),
    task_type: taskType,
    risk_score: risk.score,
    result: ok ? "pass" : "fail",
    duration_ms: durationMs,
    cache_hits: cacheHits,
    tests_gate: gates.tests ? (allGateChecksPassed(checkResults, "tests") ? "pass" : "fail") : "skipped",
    security_gate: gates.security ? (allGateChecksPassed(checkResults, "security") ? "pass" : "fail") : "skipped",
    type_specific_gate: typeSpecificPass.toLowerCase(),
    oracle_gate: oraclePass.toLowerCase()
  };
  appendText(metricsPath, JSON.stringify(metrics) + "\n");

  if (!ok) {
    updateTaskStatus(taskFile, "blocked");
    console.log(`Run log: ${logPath}`);
    process.exit(1);
  }

  updateTaskStatus(taskFile, "done");
  console.log(color("Task gates passed.", "1;32", enabled));
  console.log(`Run log: ${logPath}`);
}

function renderInitSummary(targetDir, agents, profile, packs, contracts, enabledColor) {
  console.log("");
  banner(enabledColor);
  console.log(color("Installation complete", "1;32", enabledColor));
  console.log(`Location: ${targetDir}`);
  console.log(`Profile: ${profile}`);
  console.log(`Agents: ${agents.join(", ")}`);
  console.log(`Packs: ${packs.join(", ")}`);
  console.log("Contracts:");
  for (const c of contracts) {
    console.log(`  - ${c}`);
  }
  console.log("Next:");
  console.log("  1. Open .ultra-workflow/prompts/runbook.md");
  console.log("  2. Generate a task: npx ranker-agentic-workflow feature <slug>");
  console.log("  3. Execute gates: npx ranker-agentic-workflow run <task-file>");
  console.log("  4. CI check: npx ranker-agentic-workflow ci-check .");
}

async function init(targetDirRaw, force, rawAgents, rawProfile, rawPacks, noColor, forceInteractive, yesMode) {
  const cwd = process.cwd();
  const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
  const targetDir = path.resolve(cwd, targetDirRaw || ".");
  const templateDir = path.resolve(currentFileDir, "../templates", TEMPLATE_NAME);

  const canPrompt = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (forceInteractive && !canPrompt) {
    console.error("Interactive mode requires a TTY terminal.");
    process.exit(1);
  }

  let agents;
  let profile;
  let packs;
  const shouldPrompt = !rawAgents && !rawProfile && !rawPacks && !yesMode && (forceInteractive || canPrompt);

  if (shouldPrompt) {
    const picked = await promptInstallOptions(noColor);
    agents = picked.agents;
    profile = picked.profile;
    packs = picked.packs;
  } else {
    agents = parseAgents(rawAgents);
    profile = parseProfile(rawProfile);
    packs = parsePacks(rawPacks);
  }

  ensureDir(targetDir);
  if (!force && !isDirectoryEmpty(targetDir)) {
    console.error(`Refusing to initialize in non-empty directory: ${targetDir}`);
    console.error("Use --force to override.");
    process.exit(1);
  }

  copyDir(templateDir, targetDir);
  patchConfigProfile(targetDir, profile);
  writePackConfig(targetDir, packs);
  const contracts = writeRootFiles(targetDir, agents, profile, packs);
  writeInstallManifest(targetDir, agents, profile, packs);

  renderInitSummary(targetDir, agents, profile, packs, contracts, !noColor);
}

function resolveFeatureType(rawType) {
  const type = (rawType || "standard").toLowerCase();
  const supported = ["standard", "api", "data", "ui", "performance"];
  if (!supported.includes(type)) {
    console.error(`Unsupported feature type: ${type}`);
    process.exit(1);
  }
  return type;
}

async function promptFeatureWizard(defaultProjectDir) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("Feature Wizard");
    const slug = (await rl.question("Slug (example: auth-hardening): ")).trim();
    const typeInput = (await rl.question("Type [standard/api/data/ui/performance] (default: standard): ")).trim().toLowerCase();
    const title = (await rl.question("Title (optional): ")).trim();
    const projectDir = (await rl.question(`Project dir (default: ${defaultProjectDir || "."}): `)).trim();
    const overwriteInput = (await rl.question("Overwrite if exists? [y/N]: ")).trim().toLowerCase();
    return {
      slug,
      type: typeInput || "standard",
      title: title || undefined,
      projectDir: projectDir || defaultProjectDir || ".",
      force: overwriteInput === "y" || overwriteInput === "yes"
    };
  } finally {
    rl.close();
  }
}

async function feature(slugRaw, title, typeRaw, wizard, projectDirRaw, force) {
  let slugInput = slugRaw;
  let typeInput = typeRaw;
  let titleInput = title;
  let projectDirInput = projectDirRaw;
  let forceInput = force;

  if (wizard) {
    const canPrompt = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    if (!canPrompt) {
      console.error("Feature wizard requires a TTY terminal.");
      console.error("Use non-interactive flags: feature <slug> --type <type> --title \"...\"");
      process.exit(1);
    }
    const picked = await promptFeatureWizard(projectDirRaw || ".");
    slugInput = picked.slug;
    typeInput = picked.type;
    titleInput = picked.title;
    projectDirInput = picked.projectDir;
    forceInput = picked.force;
  }

  if (!slugInput) {
    console.error("feature command requires a slug.");
    process.exit(1);
  }
  const type = resolveFeatureType(typeInput);
  const slug = sanitizeSlug(slugInput);
  if (!slug) {
    console.error("Invalid slug.");
    process.exit(1);
  }

  const root = path.resolve(process.cwd(), projectDirInput || ".");
  const tasksDir = path.join(root, ".ultra-workflow", "tasks");
  if (!fs.existsSync(tasksDir)) {
    console.error(`Missing workflow tasks directory: ${tasksDir}`);
    process.exit(1);
  }

  const filePath = path.join(tasksDir, `feature-${slug}.yml`);
  if (fs.existsSync(filePath) && !forceInput) {
    console.error(`Task already exists: ${filePath}`);
    process.exit(1);
  }

  const id = detectNextFeatureId(tasksDir);
  const yaml = buildFeatureTaskYaml(id, slug, titleInput, type);
  writeText(filePath, yaml);

  const result = validateTaskFile(filePath);
  if (!result.ok) {
    console.error(`Generated task invalid: missing ${result.missing.join(", ")}`);
    process.exit(1);
  }

  console.log(`Feature task created: ${filePath}`);
  console.log(`Task id: ${id}`);
  console.log(`Task type: ${type}`);
}

async function ciCheck(projectDirRaw, taskArg, reviewApproved, docsUpdated, strictManualGates) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const errors = collectDoctorErrors(root);
  if (errors.length > 0) {
    console.log("CI check: FAIL (doctor)");
    for (const e of errors) {
      console.log(`- ${e}`);
    }
    process.exit(1);
  }

  const taskDir = path.join(root, ".ultra-workflow", "tasks");
  const invalid = collectTaskFiles(taskDir).map(validateTaskFile).filter((r) => !r.ok);
  if (invalid.length > 0) {
    console.log("CI check: FAIL (task validation)");
    for (const r of invalid) {
      console.log(`- ${r.filePath}: ${r.missing.join(", ")}`);
    }
    process.exit(1);
  }

  const selectedTask = taskArg || process.env.RANKER_TASK || null;
  if (selectedTask) {
    await runTask(selectedTask, root, reviewApproved, docsUpdated, strictManualGates, false, true);
    return;
  }
  console.log("CI check: PASS (doctor + validation). No task specified, run gates skipped.");
}

function benchmark(projectDirRaw) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const wf = path.join(root, ".ultra-workflow");
  const reportDir = path.join(wf, "benchmark");
  ensureDir(reportDir);
  const reportPath = path.join(reportDir, "last-report.md");

  const doctorErrors = collectDoctorErrors(root);
  const doctorPass = doctorErrors.length === 0;

  const taskDir = path.join(wf, "tasks");
  const validation = fs.existsSync(taskDir)
    ? collectTaskFiles(taskDir).map(validateTaskFile).filter((r) => !r.ok)
    : [{ filePath: "(missing tasks dir)", missing: ["tasks"] }];
  const validatePass = validation.length === 0;

  const specializedTemplatesPresent = REQUIRED_TASK_TEMPLATES.every((name) => fs.existsSync(path.join(taskDir, name)));
  const commandScore = commandExists("bash", root) ? 10 : 0;

  const tools = ["npm", "pytest", "go", "cargo"];
  const availableTools = tools.filter((tool) => commandExists(tool, root)).length;
  const toolScore = Math.round((availableTools / tools.length) * 20);

  let score = 0;
  score += doctorPass ? 40 : 0;
  score += validatePass ? 20 : 0;
  score += specializedTemplatesPresent ? 10 : 0;
  score += commandScore;
  score += toolScore;

  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "E";

  let content = "# Benchmark Report\n\n";
  content += `- Generated: ${new Date().toISOString()}\n`;
  content += `- Score: ${score}/100\n`;
  content += `- Grade: ${grade}\n\n`;
  content += "## Dimensions\n\n";
  content += `- Doctor: ${doctorPass ? "PASS (40)" : "FAIL (0)"}\n`;
  content += `- Task validation: ${validatePass ? "PASS (20)" : "FAIL (0)"}\n`;
  content += `- Specialized templates: ${specializedTemplatesPresent ? "PASS (10)" : "FAIL (0)"}\n`;
  content += `- CLI readiness: ${commandScore}/10\n`;
  content += `- Tool availability: ${toolScore}/20\n`;

  if (!doctorPass) {
    content += "\n## Doctor Findings\n\n";
    for (const e of doctorErrors) {
      content += `- ${e}\n`;
    }
  }
  if (!validatePass) {
    content += "\n## Validation Findings\n\n";
    for (const v of validation) {
      content += `- ${v.filePath}: ${v.missing.join(", ")}\n`;
    }
  }

  writeText(reportPath, content);
  console.log(`Benchmark score: ${score}/100 (${grade})`);
  console.log(`Report: ${reportPath}`);
}

function status(projectDirRaw, noColor) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const wf = path.join(root, ".ultra-workflow");
  const errors = collectDoctorErrors(root);
  const healthy = errors.length === 0;
  const tasksDir = path.join(wf, "tasks");
  const taskFiles = fs.existsSync(tasksDir) ? collectTaskFiles(tasksDir) : [];

  const counters = { todo: 0, in_progress: 0, blocked: 0, done: 0, other: 0 };
  for (const file of taskFiles) {
    const s = taskStatus(file);
    if (Object.prototype.hasOwnProperty.call(counters, s)) {
      counters[s] += 1;
    } else {
      counters.other += 1;
    }
  }

  const runsDir = path.join(wf, "runs");
  const lastRun = fs.existsSync(runsDir)
    ? fs.readdirSync(runsDir).filter((n) => n.endsWith(".md")).sort().slice(-1)[0] || null
    : null;

  const benchmarkPath = path.join(wf, "benchmark", "last-report.md");
  let benchmarkScore = "n/a";
  if (fs.existsSync(benchmarkPath)) {
    const match = readText(benchmarkPath).match(/- Score:\s*([0-9]+\/100)/);
    if (match) {
      benchmarkScore = match[1];
    }
  }

  banner(!noColor);
  console.log("Status Dashboard");
  console.log(`Project: ${root}`);
  console.log(`Doctor: ${healthy ? "PASS" : "FAIL"}`);
  console.log(`Tasks: total=${taskFiles.length}, todo=${counters.todo}, in_progress=${counters.in_progress}, blocked=${counters.blocked}, done=${counters.done}, other=${counters.other}`);
  console.log(`Last run log: ${lastRun ? path.join(".ultra-workflow", "runs", lastRun) : "none"}`);
  console.log(`Benchmark: ${benchmarkScore}`);

  if (!healthy) {
    console.log("Top issues:");
    for (const e of errors.slice(0, 5)) {
      console.log(`- ${e}`);
    }
    console.log("Try: npx ranker-agentic-workflow doctor . --fix");
    process.exit(1);
  }
}

function performMigrate(root, forceOverwrite, dryRun) {
  const wf = path.join(root, ".ultra-workflow");
  if (!fs.existsSync(wf)) {
    return { ok: false, errors: [`No existing workflow found at: ${wf}`], copied: 0, skipped: 0 };
  }

  const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
  const templateDir = path.resolve(currentFileDir, "../templates", TEMPLATE_NAME);
  const stats = { copied: 0, skipped: 0 };
  if (dryRun) {
    copyTemplateSelective(templateDir, root, false, stats, true);
  } else {
    copyTemplateSelective(templateDir, root, Boolean(forceOverwrite), stats, false);
  }

  const manifestErrors = [];
  const existingManifest = parseInstallManifest(root, manifestErrors) || {};
  const agents = Array.isArray(existingManifest.agents) && existingManifest.agents.length > 0 ? existingManifest.agents : [...DEFAULT_AGENTS];
  const profile = existingManifest.profile || "strict";
  const packs = Array.isArray(existingManifest.packs) && existingManifest.packs.length > 0 ? existingManifest.packs : [...DEFAULT_PACKS];

  if (!dryRun) {
    patchConfigProfile(root, profile);
    writePackConfig(root, packs);
    writeRootFiles(root, agents, profile, packs);
    writeInstallManifest(root, agents, profile, packs);

    const installPath = path.join(root, ".ultra-workflow", "install.json");
    const installObj = JSON.parse(readText(installPath));
    installObj.migrated_at = new Date().toISOString();
    installObj.migration_overwrite = Boolean(forceOverwrite);
    writeText(installPath, JSON.stringify(installObj, null, 2) + "\n");
  }

  const errors = dryRun ? [] : collectDoctorErrors(root);
  if (errors.length > 0) {
    return { ok: false, errors, copied: stats.copied, skipped: stats.skipped };
  }
  return { ok: true, errors: [], copied: stats.copied, skipped: stats.skipped, dryRun };
}

function migrate(projectDirRaw, forceOverwrite, dryRun) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const result = performMigrate(root, forceOverwrite, dryRun);
  if (!result.ok) {
    console.log("Migration completed with validation failures:");
    for (const e of result.errors) {
      console.log(`- ${e}`);
    }
    process.exit(1);
  }

  if (dryRun) {
    console.log("Migration dry-run completed.");
    console.log(`Would copy files: ${result.copied}`);
    console.log(`Would skip files: ${result.skipped}`);
    return;
  }
  console.log("Migration completed successfully.");
  console.log(`Copied files: ${result.copied}`);
  console.log(`Skipped files: ${result.skipped}`);
  console.log(`Workflow version: ${VERSION}`);
}

function indexProject(projectDirRaw) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const wf = path.join(root, ".ultra-workflow");
  const contextDir = path.join(wf, "context");
  ensureDir(contextDir);

  const ignores = new Set([".git", "node_modules", ".ultra-workflow/runs", ".ultra-workflow/cache"]);
  const files = [];
  const exts = {};

  function walk(current) {
    const rel = path.relative(root, current);
    if (rel && [...ignores].some((prefix) => rel === prefix || rel.startsWith(`${prefix}${path.sep}`))) {
      return;
    }
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const fileRel = path.relative(root, full);
        files.push(fileRel);
        const ext = path.extname(entry.name) || "(noext)";
        exts[ext] = (exts[ext] || 0) + 1;
      }
    }
  }

  walk(root);
  const topExt = Object.entries(exts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const keyFiles = files.filter((f) => /readme|package\.json|pyproject|go\.mod|cargo\.toml|docker|compose|config|schema/i.test(path.basename(f))).slice(0, 80);
  const index = {
    generated_at: new Date().toISOString(),
    root,
    file_count: files.length,
    top_extensions: topExt.map(([ext, count]) => ({ ext, count })),
    key_files: keyFiles
  };

  writeText(path.join(contextDir, "index.json"), JSON.stringify(index, null, 2) + "\n");
  let md = "# Project Context Index\n\n";
  md += `- Generated: ${index.generated_at}\n`;
  md += `- File count: ${index.file_count}\n\n`;
  md += "## Top Extensions\n\n";
  for (const item of index.top_extensions) {
    md += `- ${item.ext}: ${item.count}\n`;
  }
  md += "\n## Key Files\n\n";
  for (const file of index.key_files) {
    md += `- ${file}\n`;
  }
  writeText(path.join(contextDir, "index.md"), md);
  console.log(`Context index generated: ${path.join(".ultra-workflow", "context", "index.json")}`);
}

function risk(taskArg, projectDirRaw) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const taskFile = resolveTaskPath(taskArg, root);
  const content = readText(taskFile);
  const r = computeRisk(taskFile, content);
  const configPath = path.join(root, ".ultra-workflow", "config.yml");
  const cfg = fs.existsSync(configPath) ? readText(configPath) : "";
  const threshold = parseNumberConfig(cfg, "high_risk_threshold", 70);
  const requiresStrict = parseBooleanConfig(cfg, "require_strict_manual_gates", true);

  console.log(`Task: ${taskFile}`);
  console.log(`Risk score: ${r.score}`);
  console.log(`Risk level: ${r.level}`);
  console.log(`Policy threshold: ${threshold}`);
  console.log(`Strict required on high risk: ${requiresStrict}`);
  if (r.score >= threshold && requiresStrict) {
    console.log("Policy decision: strict-manual-gates required.");
  } else {
    console.log("Policy decision: normal run allowed.");
  }
}

function runCliSelf(args, cwd) {
  const currentFile = fileURLToPath(import.meta.url);
  return spawnSync("node", [currentFile, ...args], { cwd, encoding: "utf8" });
}

function applyAutoFix(root) {
  const stacks = detectStacks(root);
  const candidates = [];
  if (stacks.includes("node")) {
    candidates.push("npm run -s fix", "npm run -s lint -- --fix");
  }
  if (stacks.includes("python")) {
    candidates.push("ruff check --fix .", "black .");
  }
  if (stacks.includes("go")) {
    candidates.push("gofmt -w .");
  }
  if (stacks.includes("rust")) {
    candidates.push("cargo fix --allow-dirty --allow-staged");
  }

  for (const cmd of candidates) {
    const bin = cmd.split(/\s+/)[0];
    if (!commandExists(bin, root)) {
      continue;
    }
    const result = runShellCommand(cmd, root);
    if (result.ok) {
      return { ok: true, cmd };
    }
  }
  return { ok: false, cmd: candidates[0] || "none" };
}

function autopilot(taskArg, projectDirRaw, strictManualGates, maxIterationsRaw) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const configPath = path.join(root, ".ultra-workflow", "config.yml");
  const cfg = fs.existsSync(configPath) ? readText(configPath) : "";
  const defaultMax = parseNumberConfig(cfg, "max_autopilot_iterations", 3);
  const maxIterations = Math.max(1, Number(maxIterationsRaw || defaultMax || 3));
  const autoFixEnabled = parseBooleanConfig(cfg, "auto_fix_enabled", true);

  for (let i = 1; i <= maxIterations; i += 1) {
    console.log(`Autopilot iteration ${i}/${maxIterations}`);
    const runArgs = ["run", taskArg, "--project-dir", root, "--no-color"];
    if (strictManualGates) {
      runArgs.push("--strict-manual-gates");
    } else {
      runArgs.push("--review-approved", "--docs-updated");
    }
    const result = runCliSelf(runArgs, root);
    if (result.status === 0) {
      console.log("Autopilot result: PASS");
      return;
    }
    console.log("Autopilot: run failed.");
    if (!autoFixEnabled || i === maxIterations) {
      console.log("Autopilot result: FAIL");
      process.exit(1);
    }
    const fix = applyAutoFix(root);
    if (!fix.ok) {
      console.log("Autopilot result: FAIL (no auto-fix command available)");
      process.exit(1);
    }
    console.log(`Auto-fix applied with: ${fix.cmd}`);
  }
}

function tune(projectDirRaw, apply) {
  const root = path.resolve(process.cwd(), projectDirRaw || ".");
  const metricsPath = path.join(root, ".ultra-workflow", "runs", "metrics.jsonl");
  if (!fs.existsSync(metricsPath)) {
    console.error("No metrics found. Run tasks first.");
    process.exit(1);
  }
  const lines = readText(metricsPath).split("\n").filter(Boolean);
  const rows = lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
  if (rows.length === 0) {
    console.error("No valid metrics rows found.");
    process.exit(1);
  }

  const total = rows.length;
  const pass = rows.filter((r) => r.result === "pass").length;
  const fail = total - pass;
  const avgDuration = Math.round(rows.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / total);
  const cacheHits = rows.reduce((sum, r) => sum + (r.cache_hits || 0), 0);
  const cacheRate = Math.round((cacheHits / Math.max(total, 1)) * 100);
  const highRiskFails = rows.filter((r) => (r.risk_score || 0) >= 70 && r.result === "fail").length;

  const rec = [];
  if (fail > pass) {
    rec.push("Increase strictness: enforce strict-manual-gates for all runs.");
  }
  if (avgDuration > 60000) {
    rec.push("Optimize run duration: add narrower test commands or split task scope.");
  }
  if (cacheRate < 30) {
    rec.push("Improve cache hit rate: avoid task file churn and stabilize lockfiles during runs.");
  }
  if (highRiskFails > 0) {
    rec.push("Lower high risk threshold to 60 and require strict-manual-gates on high risk tasks.");
  }
  if (rec.length === 0) {
    rec.push("Current tuning is healthy. Keep monitoring weekly.");
  }

  const recDir = path.join(root, ".ultra-workflow", "recommendations");
  ensureDir(recDir);
  let md = "# Auto-Tuning Recommendations\n\n";
  md += `- Generated: ${new Date().toISOString()}\n`;
  md += `- Runs analyzed: ${total}\n`;
  md += `- Pass: ${pass}\n`;
  md += `- Fail: ${fail}\n`;
  md += `- Avg duration (ms): ${avgDuration}\n`;
  md += `- Cache hit rate (%): ${cacheRate}\n\n`;
  md += "## Recommendations\n\n";
  for (const item of rec) {
    md += `- ${item}\n`;
  }
  writeText(path.join(recDir, "latest.md"), md);

  if (apply) {
    const configPath = path.join(root, ".ultra-workflow", "config.yml");
    if (fs.existsSync(configPath)) {
      let cfg = readText(configPath);
      if (highRiskFails > 0) {
        if (/^\s*high_risk_threshold:/m.test(cfg)) {
          cfg = cfg.replace(/^\s*high_risk_threshold:\s*\d+/m, "  high_risk_threshold: 60");
        } else {
          cfg += "\n  high_risk_threshold: 60\n";
        }
      }
      if (fail > pass) {
        if (/^\s*require_strict_manual_gates:/m.test(cfg)) {
          cfg = cfg.replace(/^\s*require_strict_manual_gates:\s*(true|false)/m, "  require_strict_manual_gates: true");
        } else {
          cfg += "\n  require_strict_manual_gates: true\n";
        }
      }
      writeText(configPath, cfg);
      console.log("Tune applied to config.yml");
    }
  }

  console.log(`Tune report: ${path.join(".ultra-workflow", "recommendations", "latest.md")}`);
}

function doctor(projectDirArg, fix) {
  const root = path.resolve(process.cwd(), projectDirArg || ".");
  let errors = collectDoctorErrors(root);
  if (errors.length > 0 && fix) {
    const migrated = performMigrate(root, false, false);
    if (migrated.ok) {
      errors = collectDoctorErrors(root);
    } else {
      errors = migrated.errors;
    }
  }
  if (errors.length > 0) {
    console.log("Doctor report: FAIL");
    for (const e of errors) {
      console.log(`- ${e}`);
    }
    process.exit(1);
  }
  console.log(`Doctor report: PASS${fix ? " (auto-fix applied when needed)" : ""}`);
  console.log("Workflow structure, contracts, templates, tasks, skills, and quality gates are valid.");
}

async function main() {
  const parsed = parseArgs(process.argv);

  if (parsed.cmd === "help") {
    printHelp(parsed.flags?.["no-color"] || parsed.flags?.noColor);
    process.exit(0);
  }

  if (parsed.cmd === "init") {
    const target = parsed.positionals[0] || ".";
    await init(
      target,
      Boolean(parsed.flags.force),
      parsed.flags.agents,
      parsed.flags.profile,
      parsed.flags.packs,
      Boolean(parsed.flags["no-color"] || parsed.flags.noColor),
      Boolean(parsed.flags.interactive),
      Boolean(parsed.flags.yes)
    );
    process.exit(0);
  }

  if (parsed.cmd === "feature") {
    const slug = parsed.positionals[0];
    await feature(
      slug,
      parsed.flags.title,
      parsed.flags.type,
      Boolean(parsed.flags.wizard),
      parsed.flags["project-dir"],
      Boolean(parsed.flags.force)
    );
    process.exit(0);
  }

  if (parsed.cmd === "run") {
    const taskFile = parsed.flags.auto ? null : parsed.positionals[0];
    await runTask(
      taskFile,
      parsed.flags["project-dir"],
      Boolean(parsed.flags["review-approved"]),
      Boolean(parsed.flags["docs-updated"]),
      Boolean(parsed.flags["strict-manual-gates"]),
      Boolean(parsed.flags["plan-only"]),
      Boolean(parsed.flags["no-color"] || parsed.flags.noColor)
    );
    process.exit(0);
  }

  if (parsed.cmd === "validate") {
    const target = parsed.positionals[0] || ".ultra-workflow/tasks";
    validate(target);
    process.exit(0);
  }

  if (parsed.cmd === "doctor") {
    const target = parsed.positionals[0] || ".";
    doctor(target, Boolean(parsed.flags.fix));
    process.exit(0);
  }

  if (parsed.cmd === "ci-check") {
    const target = parsed.positionals[0] || ".";
    const reviewApproved = Boolean(parsed.flags["review-approved"]) || process.env.REVIEW_APPROVED === "1";
    const docsUpdated = Boolean(parsed.flags["docs-updated"]) || process.env.DOCS_UPDATED === "1";
    await ciCheck(target, parsed.flags.task, reviewApproved, docsUpdated, Boolean(parsed.flags["strict-manual-gates"]));
    process.exit(0);
  }

  if (parsed.cmd === "benchmark") {
    const target = parsed.positionals[0] || ".";
    benchmark(target);
    process.exit(0);
  }

  if (parsed.cmd === "migrate") {
    const target = parsed.positionals[0] || ".";
    migrate(target, Boolean(parsed.flags.force), Boolean(parsed.flags["dry-run"]));
    process.exit(0);
  }

  if (parsed.cmd === "status") {
    const target = parsed.positionals[0] || ".";
    status(target, Boolean(parsed.flags["no-color"] || parsed.flags.noColor));
    process.exit(0);
  }

  if (parsed.cmd === "autopilot") {
    const taskFile = parsed.positionals[0];
    autopilot(
      taskFile,
      parsed.flags["project-dir"],
      Boolean(parsed.flags["strict-manual-gates"]),
      parsed.flags["max-iterations"]
    );
    process.exit(0);
  }

  if (parsed.cmd === "index") {
    const target = parsed.positionals[0] || ".";
    indexProject(target);
    process.exit(0);
  }

  if (parsed.cmd === "risk") {
    const taskFile = parsed.positionals[0];
    risk(taskFile, parsed.flags["project-dir"]);
    process.exit(0);
  }

  if (parsed.cmd === "tune") {
    const target = parsed.positionals[0] || ".";
    tune(target, Boolean(parsed.flags.apply));
    process.exit(0);
  }

  console.error(`Unknown command: ${parsed.cmd}`);
  printHelp(parsed.flags?.["no-color"] || parsed.flags?.noColor);
  process.exit(1);
}

main().catch((error) => {
  const message = error && error.message ? error.message : String(error);
  console.error(`Unhandled error: ${message}`);
  process.exit(1);
});
