# Knowledge Base Read-only SQL Operator Guide

## Purpose

Guide safe application of the Knowledge Base read-only foundation SQL.

This guide is operational documentation only. Remote database execution requires Paul approval in the active Codex session before any command can be run.

## Files

- Migration SQL: `supabase/migrations/20260620_knowledge_base_readonly_foundation.sql`
- Demo seed SQL: `docs/ops/knowledge-base-demo-seed-readonly.sql`

## What SQL Does

The migration creates new read-only foundation tables:

- `knowledge_categories`
- `knowledge_items`
- `knowledge_sources`
- `knowledge_links`
- `knowledge_reviews`
- `knowledge_versions`
- `knowledge_usage_logs`

The seed file inserts safe `DEMO_` categories, demo knowledge items, demo source metadata, and demo review rows.

The SQL does not implement RAG, embeddings, vector storage, file ingestion, OCR, AI answer generation, or business execution.

## Safety Checklist

Before remote execution, confirm:

- SQL safety scan passed.
- Migration creates new `knowledge_*` tables only.
- Seed data is `DEMO_` sample data only.
- No production customer confidential data is included.
- No supplier promise is included.
- No price, payment, delivery, quotation, PI, order, production, or shipment commitment is included.
- No secrets will be printed.
- The target Supabase project is correct.

## Automatic Execution Gate

Codex may execute remote database SQL only after Paul replies exactly:

```text
APPROVED
```

The approval request must include:

- task step
- reason approval is needed
- exact commands
- SQL files
- safety scan result
- expected database impact
- tables affected
- destructive SQL status
- secret-printing status
- mitigation note

## Manual Fallback Execution Order

If Paul chooses to apply manually:

1. Review the migration SQL.
2. Review the demo seed SQL.
3. Confirm the Supabase project target.
4. Apply the migration first.
5. Apply the demo seed second.
6. Verify row counts.

Do not paste secrets into chat or committed files.

## Row Count Verification

Expected minimum row counts after successful seed application:

- `knowledge_categories >= 7`
- `knowledge_items >= 12`

Optional supporting rows:

- `knowledge_sources >= 12`
- `knowledge_reviews >= 12`

## Rollback Note

If a problem is found, pause and create a separate reviewed remediation task. Do not run ad hoc destructive cleanup from this guide. Prefer leaving the new tables unused until a reviewed remediation plan is approved.

## Do Not Paste Secrets

Do not paste or print:

- Supabase access token
- database password
- database connection string
- service-role key
- bearer token
- cookies, localStorage, sessionStorage, or request headers
