---
name: security-audit
description: Run practical application security checks and provide remediations. Use before release, after auth/data changes, or when touching sensitive code paths.
---

# security-audit

## Checklist

- Validate all external inputs.
- Confirm auth/authz checks on sensitive actions.
- Ensure secrets are never logged or hardcoded.
- Check dependency vulnerabilities.
- Verify safe defaults and error handling.

## Output

- Severity-ranked findings
- Recommended fix per finding
- Blocker decision for release
