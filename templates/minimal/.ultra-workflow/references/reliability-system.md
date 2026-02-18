# Reliability System

This workflow includes a reliability layer designed to help weaker models complete complex features safely.

## Components

- Formal task contracts (`tasks/*.yml`)
- Atomic execution with strict gates (`run`)
- Risk policy and strict manual evidence on high-risk tasks
- Type-specific + oracle checks when toolchain support exists
- Autopilot loop with optional auto-fix between iterations
- Run metrics and tuning recommendations
- Project context index for local RAG usage

## Commands

- `ranker-agentic-workflow run ...`
- `ranker-agentic-workflow autopilot ...`
- `ranker-agentic-workflow risk ...`
- `ranker-agentic-workflow index ...`
- `ranker-agentic-workflow tune ...`
