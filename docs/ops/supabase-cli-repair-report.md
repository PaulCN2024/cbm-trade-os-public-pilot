# Supabase CLI Repair Report

## Purpose

Record the safe local toolchain repair attempt for the Supabase CLI execution channel.

This report belongs to `CBM-CODEX-SUPABASE-CLI-REPAIR-001`.

## Initial Issue

The Knowledge Base read-only SQL files are prepared, but remote SQL application remains deferred because the local Supabase CLI execution channel is not usable.

Known starting issue:

- Homebrew-installed Supabase CLI `2.107.0` existed at `/opt/homebrew/bin/supabase`.
- `supabase --version` failed.
- The underlying Supabase binary was terminated with `Killed: 9`.
- macOS `spctl` reported the binary as invalid or unusably signed.
- `npx -y supabase@2.107.0 --version` previously timed out.
- No SQL had been applied.
- No database had been touched.

## Diagnostics

Pre-flight status:

- Working tree was clean.
- Branch was `main`.
- Local `main` was synced with `origin/main`.
- Latest history included:
  - `ee9b28e docs: record knowledge base sql application status`
  - `cf31494 docs: add knowledge base readonly production checkpoint`
  - `9d4791c feat: add knowledge base read-only data foundation`

CLI path diagnostics:

- `which supabase` returned `/opt/homebrew/bin/supabase` before repair.
- `/opt/homebrew/bin/supabase` pointed to the Homebrew Cellar install.
- The wrapper was a Node script.
- The underlying Supabase binary was a Mach-O arm64 executable.

Signature diagnostics:

- `spctl -a -vv /opt/homebrew/bin/supabase` reported the wrapper as rejected with no usable signature.
- The underlying arm64 binary was reported as having an invalid signature.
- `codesign` reported the underlying binary as ad hoc / linker-signed with no TeamIdentifier.

Homebrew diagnostics:

- `brew info supabase` reported Homebrew core `supabase 2.107.0`.
- `brew doctor` warned that macOS 27 is a Homebrew Tier 2 configuration.
- `brew doctor` also reported unrelated PATH and local library warnings.

Alternative source diagnostics:

- `brew search supabase` found the Homebrew core formula.
- `brew info supabase/tap/supabase` required tapping `supabase/tap`.
- `npm view supabase` reported latest version `2.107.0`.

## Repair Attempts

### Attempt 1: Reinstall Homebrew Core Formula

Paul approved the Homebrew core reinstall by replying exactly:

```text
APPROVED
```

Approved commands:

```bash
brew update
brew reinstall supabase
supabase --version
which supabase
spctl -a -vv "$(which supabase)" || true
```

Result:

- Homebrew reinstalled `supabase 2.107.0`.
- `supabase --version` still failed.
- The underlying binary was still terminated with `SIGKILL`.
- `spctl` still reported no usable signature.

### Attempt 2: Use Official Supabase Homebrew Tap

Paul approved the tap install path by replying exactly:

```text
APPROVED
```

Approved commands:

```bash
brew uninstall supabase
brew tap supabase/tap
brew install supabase/tap/supabase
supabase --version
which supabase
spctl -a -vv "$(which supabase)" || true
```

Result:

- Homebrew core `supabase` was uninstalled.
- `supabase/tap` was added.
- `brew install supabase/tap/supabase` started downloading the official tap release artifact.
- The download remained incomplete after an extended wait and was terminated.
- The local `supabase` command is currently not available.

No login, project link, SQL execution, seed execution, database write, or secret handling was attempted.

## Result

CLI still blocked.

Current status:

- `supabase` command is not available after the interrupted tap install.
- Homebrew core reinstall did not repair the signature / `SIGKILL` issue.
- Supabase tap installation did not complete because the release artifact download remained incomplete.
- No safe local Supabase CLI execution channel is available from this Codex shell.

## What Was Not Done

This repair task did not:

- Execute SQL.
- Run migrations.
- Apply seed data.
- Touch the production database.
- Login to Supabase.
- Link a Supabase project.
- Use `psql`.
- Print or request secrets.
- Modify project code.
- Modify Admin UI code.
- Modify API files.
- Modify package files.
- Deploy.
- Disable Gatekeeper.
- Remove quarantine attributes.
- Use `sudo`.
- Run unsigned or invalid-signature binaries after macOS reported signature problems.

## Recommended Next Task

Because the local Supabase CLI remains blocked, the recommended next step is not automatic SQL execution.

Recommended options:

1. Paul manually applies the prepared SQL files in the Supabase Dashboard SQL Editor:
   - `supabase/migrations/20260620_knowledge_base_readonly_foundation.sql`
   - `docs/ops/knowledge-base-demo-seed-readonly.sql`
2. Paul resolves the macOS/Homebrew download and signature issue outside Codex, then runs a fresh CLI verification task.
3. Create a separate approved task to configure a secure `psql` execution path, without printing credentials.

If CLI later works, the next Codex task should be:

```text
CBM-CODEX-SUPABASE-KNOWLEDGE-SQL-APPLY-001
```

That future task must still require Paul approval before any remote SQL execution.
