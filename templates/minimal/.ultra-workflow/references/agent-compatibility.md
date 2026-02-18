# Agent Compatibility Matrix

This workflow is designed to remain consistent across multiple coding agents.

## Contracts by Agent

- `AGENTS.md`: primary contract for Codex-like workflows
- `CLAUDE.md`: execution contract for Claude Code style setups
- `OPENCODE.md`: execution contract for OpenCode setups
- `AI-WORKFLOW.md`: fallback generic contract

## Compatibility Rules

- Keep one active task as the source of truth.
- Keep one primary skill per task.
- Keep quality-gate checks mandatory before completion.
- Keep handoff evidence explicit (tests, security, review).

## Profile Behavior

- `strict`: maximum safeguards
- `minimal`: balanced speed and reliability
- `speed`: reduced friction for low-risk iteration
