---
name: performance-check
description: Validate feature performance against target budgets and prevent regressions. Use for latency-sensitive, high-throughput, or resource-intensive features.
---

# performance-check

## Procedure

1. Set explicit performance budgets (latency, throughput, memory).
2. Benchmark critical paths before and after changes.
3. Investigate bottlenecks and optimize highest impact first.
4. Add regression guardrails where possible.
5. Record results and residual tradeoffs.
