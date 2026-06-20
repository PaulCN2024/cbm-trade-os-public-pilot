# Supabase CLI NPM Repair Report

## Purpose

Record the safe npm-based Supabase CLI repair attempt for Paul's Mac.

This report belongs to `CBM-CODEX-SUPABASE-CLI-NPM-REPAIR-001`.

The goal was only to restore a usable `supabase --version` command. This task did not run SQL, migrations, seed data, Supabase login, Supabase link, database commands, or deployment commands.

## Initial State

Pre-flight status:

- Working tree: clean
- Branch: `main`
- Local branch: synced with `origin/main`
- Latest relevant commit: `0d7e310 docs: record knowledge base sql application`

Current known context:

- Homebrew-installed Supabase CLI previously failed with macOS invalid signature / `SIGKILL`.
- Official Supabase Homebrew tap installation previously did not complete.
- Knowledge Base SQL was already applied successfully through the approved Supabase Dashboard SQL Editor path.
- This task was CLI repair only, not database execution.

## Node / NPM Diagnostics

Safe local diagnostics showed:

- `supabase`: not available in PATH before npm global install
- `node`: `/opt/homebrew/bin/node`
- `node --version`: `v26.3.0`
- `npm`: `/opt/homebrew/bin/npm`
- `npm --version`: `11.16.0`
- `npx`: `/opt/homebrew/bin/npx`
- `npx --version`: `11.16.0`
- npm prefix: `/opt/homebrew`
- global npm root: `/opt/homebrew/lib/node_modules`
- architecture: `arm64`
- macOS: `27.0`, build `26A5353q`

`npm bin -g` is not supported by the installed npm version and returned:

```text
Unknown command: "bin"
```

## NPX Test Result

Temporary npx tests were run from temporary directories, not from the project root.

Result:

- `npx -y supabase@latest --version`: timed out after 90 seconds without returning a version.
- `npx -y supabase@2.107.0 --version`: failed quickly with npm `ENOENT`, reporting a missing `package.json` under the npm `_npx` temporary cache directory.

No project files were created or modified by these npx tests.

## NPM Global Install Result

Paul approved the npm global install step by replying exactly:

```text
APPROVED
```

Approved commands:

```bash
npm install -g supabase
which supabase
supabase --version
```

Result:

- `npm install -g supabase` completed after approximately 9 minutes.
- npm reported `added 2 packages`.
- `which supabase` returned:

```text
/opt/homebrew/bin/supabase
```

- `supabase --version` failed.
- The wrapper attempted to run:

```text
/opt/homebrew/lib/node_modules/supabase/node_modules/@supabase/cli-darwin-arm64/bin/supabase --version
```

- The underlying darwin-arm64 binary was terminated with `SIGKILL`.
- Node reported the command failure from the npm package wrapper.

Conclusion:

The npm global install path installed the wrapper but did not restore a usable Supabase CLI on this Mac.

## Local NPM Prefix Fallback Result

The local user npm prefix fallback was not used.

Reason:

- The npm global install did not fail due to file permission.
- It installed successfully but the packaged darwin-arm64 Supabase binary still failed with `SIGKILL`.
- A different npm prefix would likely install the same underlying binary and would not address the observed binary execution failure.

No `~/.npmrc`, `~/.npm-global`, shell profile, or PATH configuration was changed.

## Final CLI Status

Final status:

- Supabase CLI wrapper exists at `/opt/homebrew/bin/supabase`.
- `supabase --version` is still not usable.
- CLI status: Supabase CLI still unavailable for safe automation.

Usable command:

```text
none
```

## What Was Not Done

This repair task did not:

- Execute SQL.
- Run migrations.
- Apply seed data.
- Touch the remote database.
- Run `supabase login`.
- Run `supabase link`.
- Run `supabase db push`.
- Run `psql`.
- Deploy.
- Print or request secrets.
- Read browser cookies, localStorage, or sessionStorage.
- Modify project code.
- Modify Admin UI code.
- Modify API files.
- Modify schema SQL files.
- Modify `package.json`.
- Modify `package-lock.json`.
- Install project dependencies.
- Change shell profile files.
- Use `sudo`.
- Disable Gatekeeper.
- Remove quarantine attributes.
- Bypass macOS security controls.

## Recommended Next Task

Because the Supabase CLI remains unavailable after Homebrew core, Homebrew tap, temporary npx, and npm global install attempts, do not rely on Supabase CLI automation for database work on this Mac yet.

Recommended next options:

1. `CBM-CODEX-KNOWLEDGE-POST-SQL-VERIFY-001` - verify Knowledge Base production API/UI behavior after the already-applied SQL.
2. `CBM-CODEX-SPRINT-KNOWLEDGE-RLS-PLAN-001` - plan Knowledge Base RLS/read policy safety before real confidential data.
3. Use Supabase Dashboard SQL Editor for future approved manual SQL operations.
4. If CLI automation is still required later, investigate the macOS binary `SIGKILL` / signature issue separately, or configure a secure `psql` path with explicit approval and no credential printing.
