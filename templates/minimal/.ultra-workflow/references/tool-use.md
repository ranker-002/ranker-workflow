# Tool Use Guidance (Anthropic/OpenAI Aligned)

This workflow follows the same core idea used by modern agent tool-use systems:

- The model reasons, then calls tools only when needed.
- Tool outputs are fed back into the model to continue execution.
- Reliability comes from explicit schemas, validation, and clear stop conditions.

## Practical Rules

- Define each task with a strict input/output contract.
- Keep tools narrowly scoped and deterministic.
- Validate every tool result before using it in critical decisions.
- Use retries only for transient failures; do not hide persistent errors.
- Record evidence from tools in task artifacts.

## Suggested Tool Categories

- `code_search`: fast codebase discovery
- `code_edit`: safe targeted edits
- `test_runner`: deterministic validation
- `security_scan`: vulnerability checks
- `git_ops`: branch, commit, PR preparation

## Why This Is Minimal

- One task, one lead agent, one main skill.
- Small mandatory gates.
- No heavy ceremony.
- Strong defaults for quality and security.
