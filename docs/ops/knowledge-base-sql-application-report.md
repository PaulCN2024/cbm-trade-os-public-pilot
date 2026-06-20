# Knowledge Base SQL Application Report

## Purpose

Record whether the Knowledge Base read-only foundation SQL was applied during:

- `CBM-CODEX-COMBO-KNOWLEDGE-DATA-AUTO-APPROVAL-001`
- `CBM-CODEX-SUPABASE-EXECUTION-CHANNEL-001`

## Approval Status

Paul approval was not requested for remote database execution because the local Supabase CLI execution channel remained unavailable.

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

No Supabase login, project link, SQL apply, seed apply, or row count verification was attempted.

## SQL Application Status

- Migration applied: no
- Demo seed applied: no
- Method used: none
- Reason skipped: Supabase CLI could not be executed safely after the approved Homebrew install and npx fallback checks.

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

The migration would create these new tables if missing:

- `knowledge_categories`
- `knowledge_items`
- `knowledge_sources`
- `knowledge_links`
- `knowledge_reviews`
- `knowledge_versions`
- `knowledge_usage_logs`

The demo seed would insert:

- 7 `DEMO_` knowledge categories
- at least 12 `DEMO_` knowledge items
- demo source metadata
- demo review rows

## Row Counts

Row counts were not verified because SQL was not applied.

Expected minimum counts after a future approved apply:

- `knowledge_categories >= 7`
- `knowledge_items >= 12`

## Secrets

No secrets were printed, requested, written to files, or committed.

## Next Step

Resolve Supabase execution access in a separate approved step, then apply the prepared migration and seed files after Paul explicitly approves the exact database commands.

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
