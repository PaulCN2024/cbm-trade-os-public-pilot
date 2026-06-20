# Supabase Execution Channel Setup Report

## Purpose

Record the attempt to restore a safe Supabase CLI execution channel for applying the Knowledge Base read-only foundation SQL.

This report belongs to `CBM-CODEX-SUPABASE-EXECUTION-CHANNEL-001`.

## Starting State

- Working tree was clean.
- Current branch was `main`.
- Local `main` was synced with `origin/main`.
- Latest history included:
  - `cf31494 docs: add knowledge base readonly production checkpoint`
  - `9d4791c feat: add knowledge base read-only data foundation`
- `supabase` CLI was initially unavailable.

## Approved Install Attempt

Paul approved the Supabase CLI install step by replying exactly:

```text
APPROVED
```

Approved commands:

```bash
brew install supabase
supabase --version
```

Result:

- Homebrew installed `supabase` version `2.107.0`.
- Homebrew linked `/opt/homebrew/bin/supabase`.
- `supabase --version` failed.
- The underlying arm64 Supabase binary was terminated with `Killed: 9`.
- `spctl` reported the installed binary as `invalid signature`.

No project files, database objects, Supabase settings, or secrets were changed by this install attempt.

## Approved Npx Fallback Attempt

Paul approved the npx fallback version check by replying exactly:

```text
APPROVED
```

Approved command:

```bash
npx -y supabase@2.107.0 --version
```

Result:

- The command produced no version output.
- The command remained stuck for about 90 seconds.
- The hung `npm exec supabase@2.107.0 --version` process was terminated.

No login, project link, SQL execution, database write, or secret handling was attempted.

## Current Execution Channel Status

Supabase execution channel is still not usable from this Codex shell.

Known blockers:

- Homebrew-installed Supabase CLI binary fails with `Killed: 9`.
- macOS reports the installed binary signature as invalid.
- npx fallback did not return a CLI version and timed out.
- No local Supabase project link files were present:
  - `supabase/config.toml` was missing.
  - `.supabase/project-ref` was missing.

## SQL Safety Status

The prepared SQL files were rescanned:

- `supabase/migrations/20260620_knowledge_base_readonly_foundation.sql`
- `docs/ops/knowledge-base-demo-seed-readonly.sql`

Result:

- Safety scan passed.
- No blocked executable SQL was found.
- No destructive SQL was executed.

## Database Execution Status

- Migration applied: no
- Demo seed applied: no
- Row counts verified: no
- Login attempted: no
- Project link attempted: no
- SQL executed: no
- Secrets requested or printed: no

## Recommended Next Step

Resolve the Supabase CLI execution issue outside this task before attempting database SQL.

Safe next options:

1. Paul manually opens or approves the Homebrew Supabase binary in macOS security settings, then Codex reruns `supabase --version`.
2. Paul installs or provides an official Supabase CLI binary that runs successfully on this macOS version.
3. Paul applies the migration and demo seed manually in Supabase SQL Editor using the prepared SQL files.
4. A future Codex task performs only project link and SQL apply after the CLI is confirmed working and Paul gives exact `APPROVED` approval.

Do not run SQL until the target Supabase project is confirmed and Paul approves the exact commands.

## Safety Confirmation

This setup attempt did not:

- Modify application code.
- Modify Admin UI code.
- Modify API files.
- Modify package files.
- Modify migrations.
- Run SQL.
- Apply seed data.
- Change Supabase auth or settings.
- Print secrets.
- Enable RAG, embeddings, upload, OCR, AI answer generation, or business execution.
