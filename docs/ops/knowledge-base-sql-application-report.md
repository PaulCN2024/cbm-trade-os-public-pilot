# Knowledge Base SQL Application Report

## Purpose

Record whether the Knowledge Base read-only foundation SQL was applied during:

- `CBM-CODEX-COMBO-KNOWLEDGE-DATA-AUTO-APPROVAL-001`
- `CBM-CODEX-SUPABASE-EXECUTION-CHANNEL-001`
- later approved Supabase Dashboard SQL Editor execution by Codex on Paul's logged-in browser session

## Approval Status

Initial Paul approval was not requested for remote database execution because the local Supabase CLI execution channel remained unavailable.

Later, Paul explicitly instructed Codex to operate the Supabase Dashboard SQL Editor directly after logging in, and confirmed execution with `APPROVED`.

Codex used the logged-in Supabase Dashboard browser session only after Paul confirmed the operation. No Supabase CLI, `psql`, database password, service-role key, browser cookies, localStorage, sessionStorage, or secret values were read or printed.

The command:

```text
supabase --version
```

initially returned:

```text
supabase: command not found
```

During `CBM-CODEX-SUPABASE-EXECUTION-CHANNEL-001`, Paul approved a Homebrew install attempt and an npx fallback version check.

Results:

- `brew install supabase` installed and linked Supabase CLI `2.107.0`.
- `supabase --version` failed because the underlying binary was terminated with `Killed: 9`.
- macOS `spctl` reported the Homebrew-installed binary as `invalid signature`.
- `npx -y supabase@2.107.0 --version` did not return a version and was terminated after timing out.

No Supabase login, project link, SQL apply, seed apply, or row count verification was attempted during the CLI execution-channel tasks.

The later Dashboard execution used:

- Organization: `PaulCN2024's Org`
- Project: `PaulCN2024's Project`
- Project ref: `zswtekjtkyvfagbudkia`
- Supabase project URL shown in Dashboard: `https://zswtekjtkyvfagbudkia.supabase.co`

## SQL Application Status

- Migration applied: yes
- Demo seed applied: yes
- Method used: Supabase Dashboard SQL Editor in the logged-in browser session, after Paul's explicit approval
- Execution result: `Success. No rows returned.`
- Verification result: passed

The combined SQL file executed was:

- `docs/ops/knowledge-base-manual-sql-combined.sql`

## SQL Files Prepared

- `supabase/migrations/20260620_knowledge_base_readonly_foundation.sql`
- `docs/ops/knowledge-base-demo-seed-readonly.sql`

## Safety Scan Result

Passed.

The executable SQL was scanned for:

- `DROP`
- `DELETE`
- `TRUNCATE`
- `ALTER`
- `UPDATE`
- `GRANT`
- `REVOKE`
- `SECURITY DEFINER`
- `CREATE EXTENSION vector`
- `vector`
- `embedding`
- `service_role`

No blocked executable SQL was found.

## Expected Database Impact If Applied Later

The migration created these new tables if missing:

- `knowledge_categories`
- `knowledge_items`
- `knowledge_sources`
- `knowledge_links`
- `knowledge_reviews`
- `knowledge_versions`
- `knowledge_usage_logs`

The demo seed inserted:

- 7 `DEMO_` knowledge categories
- at least 12 `DEMO_` knowledge items
- demo source metadata
- demo review rows

## Row Counts

Row counts were verified in Supabase Dashboard SQL Editor after execution:

- `knowledge_categories`: 7
- `knowledge_items`: 12
- `knowledge_sources`: 12
- `knowledge_reviews`: 12

Knowledge item verification status counts:

- `draft`: 2
- `needs_review`: 6
- `verified`: 4

Expected minimum counts were met:

- `knowledge_categories >= 7`: yes
- `knowledge_items >= 12`: yes

## Secrets

No secrets were printed, requested, written to files, or committed.

## Next Step

Proceed to post-SQL verification of production admin-read knowledge routes and AI Knowledge Center UI behavior.

Important security follow-up:

- Supabase Advisor now reports `RLS Disabled in Public` for the newly created `knowledge_*` tables.
- This was visible immediately after the Dashboard SQL execution.
- Treat this as a follow-up security planning/remediation task before storing real confidential customer, supplier, quotation, file, or SOP data in these tables.
- Do not insert real confidential knowledge data until RLS/read policy decisions are reviewed and approved.

Current channel status is documented in:

- `docs/ops/supabase-execution-channel-setup-report.md`

## Supabase CLI Repair Status

`CBM-CODEX-SUPABASE-CLI-REPAIR-001` attempted to repair the local Supabase CLI execution channel without running SQL or touching the database.

Result:

- Homebrew core `supabase 2.107.0` was reinstalled after Paul approval.
- `supabase --version` still failed because the underlying binary was terminated with `SIGKILL`.
- macOS still reported no usable signature.
- The official `supabase/tap` was added after Paul approval.
- The Homebrew core formula was uninstalled before the tap attempt.
- `brew install supabase/tap/supabase` did not complete because the release artifact download remained incomplete and was terminated.
- The local `supabase` command is currently unavailable.

No Supabase login, project link, SQL execution, seed execution, row count verification, secret handling, code change, or deployment occurred.

Repair details are documented in:

- `docs/ops/supabase-cli-repair-report.md`

## Manual SQL Execution Pack Prepared

`CBM-CODEX-KNOWLEDGE-SQL-MANUAL-PACK-001` prepared a manual Supabase Dashboard SQL Editor execution path because the local Supabase CLI remains unavailable.

Prepared files:

- `docs/ops/knowledge-base-manual-sql-combined.sql`
- `docs/ops/knowledge-base-manual-sql-execution-pack.md`
- `docs/ops/knowledge-base-post-sql-verification-checklist.md`

Status:

- CLI remains unavailable.
- Manual SQL Editor path is selected.
- Combined SQL pack was created from the existing migration and DEMO seed SQL files.
- Paul later explicitly requested Codex to operate the browser SQL Editor directly and approved execution.
- Codex executed the combined SQL once in Supabase Dashboard SQL Editor.
- Row count verification passed.
- No secrets were read or printed.

## Post-SQL Production Verification

`CBM-CODEX-KNOWLEDGE-POST-SQL-VERIFY-001` verified the post-SQL production state without running additional SQL, modifying the database, reading secrets, changing code, or deploying.

Production route smoke confirmed:

- `GET /api/admin-read/knowledge-summary` returns the existing JSON auth gate (`401`) rather than `404`.
- `GET /api/admin-read/knowledge-categories` returns the existing JSON auth gate (`401`) rather than `404`.
- `GET /api/admin-read/knowledge-items` returns the existing JSON auth gate (`401`) rather than `404`.
- `GET /api/admin-read/knowledge-review-queue` returns the existing JSON auth gate (`401`) rather than `404`.
- `GET /api/admin-read/knowledge-linked-context` returns the existing JSON auth gate (`401`) rather than `404`.
- `GET /api/admin-read/unknown` returns stable JSON `404`.
- `POST /api/admin-read/knowledge-items` returns `405` with `Allow: GET`.

Production UI smoke confirmed:

- `https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1` loads.
- `AI 知识库` is visible and renders safely.
- The section falls back to safe static/auth-gated preview when unauthenticated.
- No upload, RAG execution, AI answer generation, create, edit, delete, send, approve, quote, PI, order, payment, production, or shipment control was observed.

Authenticated `200` JSON smoke remains deferred until a safe temporary admin bearer token or approved logged-in test path is available without exposing secrets.

## Knowledge Base RLS Policy Pack Prepared

`CBM-CODEX-SPRINT-KNOWLEDGE-RLS-PLAN-001` prepared the first-stage Knowledge Base RLS/read policy pack.

Reason:

- Supabase Advisor identified `RLS Disabled in Public` for the new `knowledge_*` tables.
- The current data is DEMO-only, but real business knowledge must not be stored until RLS/read policies are reviewed and applied.

Prepared files:

- `docs/architecture/knowledge-base-rls-read-policy-plan.md`
- `docs/ops/knowledge-base-rls-policy.sql`
- `docs/ops/knowledge-base-rls-manual-sql-pack.md`
- `docs/ops/knowledge-base-rls-verification-checklist.md`

SQL safety scan result:

- passed
- SQL only targets `public.knowledge_*` tables
- SQL enables RLS
- SQL creates authenticated `SELECT` policies only
- SQL adds no write policies
- SQL includes no service-role behavior
- SQL includes no RAG, embedding, vector, file, AI, or business execution behavior

Codex did not execute SQL, run Supabase CLI, run `psql`, touch the remote database, deploy, read secrets, or modify code.

Status:

- Waiting for Paul to review and manually execute `docs/ops/knowledge-base-rls-policy.sql` in Supabase Dashboard SQL Editor.
- Next verification task after manual execution: `CBM-CODEX-KNOWLEDGE-RLS-POST-VERIFY-001`.
