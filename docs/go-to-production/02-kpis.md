# KPI Framework

## Primary Product KPIs

- Lead Time to Green (LTG): request to all gates passing.
- First-Pass Gate Rate (FPGR): tasks passing on first `run`.
- Post-Merge Defect Rate (PMDR): defects found after merge per 100 tasks.
- Rollback Rate (RBR): releases requiring rollback per 100 releases.

## Reliability KPIs

- Doctor Health Rate: projects with `doctor` pass / total runs.
- Migration Success Rate: successful `migrate` executions / attempts.
- Cache Hit Rate: cache hits / total executable checks.

## Adoption KPIs

- Weekly Active Repositories.
- Tasks Executed per Week.
- CI Integration Rate (repos using provider templates).

## UX KPIs

- Time to First Successful Run (TTFSR).
- Wizard Completion Rate.
- Error-to-Resolution Time.

## KPI Targets (first 90 days)

- FPGR >= 75%
- PMDR <= 3 per 100 tasks
- RBR <= 1 per 100 releases
- Doctor Health Rate >= 95%
- TTFSR <= 15 minutes
