# Ranker Agentic Core

A complete minimal system for reliable feature implementation with AI agents.

## Main Areas

- `agents/`: responsibilities and handoff contracts
- `skills/`: reusable execution methods
- `tasks/`: standard and specialized delivery templates
- `prompts/`: mandatory workflow protocol
- `references/`: operator docs, cookbook, failure modes, packs, tool use
- `benchmark/`: scenario baseline and score reports
- `packs/`: enabled domain packs

## Required Flow

1. Select or generate task.
2. Execute with the mapped skills.
3. Run `ranker-agentic-workflow run <task-file>`.
4. Confirm with `doctor` and `ci-check`.
