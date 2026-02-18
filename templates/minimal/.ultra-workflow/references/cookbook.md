# Cookbook

## Add New API Endpoint

1. Start from `tasks/feature-api.yml`.
2. Use skills: `requirements-clarification`, `api-contract`, `oneshot-feature`.
3. Run gates with `run` command.

## Ship Data Migration

1. Start from `tasks/feature-data.yml`.
2. Use `db-migration-safe` and `rollback-readiness`.
3. Validate integrity and rollback before merge.

## Handle Production Incident

1. Start from `tasks/incident-hotfix.yml`.
2. Reproduce with `debug`.
3. Patch + regression test + rollback plan.
