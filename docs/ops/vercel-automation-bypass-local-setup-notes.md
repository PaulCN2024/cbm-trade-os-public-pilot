# Vercel Automation Bypass Local Setup Notes

## Purpose

This note records the safe setup path for using Vercel Protection Bypass for Automation during production smoke tests.

It is for local automation and browser verification only. It must not be used to bypass application authentication, change production settings, or expose protected business data.

## Current Blocker

Production browser smoke is blocked by Vercel Security Checkpoint 403.

The current production alias is:

```text
https://project-7vo99.vercel.app
```

The next planned verification task is:

```text
CBM-CODEX-RELEASE-029 - Rerun AI Prospecting Production Smoke With Vercel Bypass
```

## CLI Capability Check Result

Checked locally on June 20, 2026.

Vercel CLI status:

- Vercel CLI version: 54.10.2
- Logged-in account checked: `paulchenchina-3750`
- Production project inspected: `project-7vo99`
- Production alias inspected: `https://project-7vo99.vercel.app`
- Deployment target: production
- Deployment status: Ready

Capability discovery result:

- `vercel --help` shows general Vercel commands.
- `vercel project --help` shows a `project protection` command for showing or toggling deployment protection settings.
- `vercel env --help` manages project environment variables, not protection bypass secrets.
- `vercel protection --help` is not a valid top-level command in the installed CLI.

No safe CLI command was found that clearly creates a Protection Bypass for Automation secret without exposing the secret or risking a deployment protection setting change.

Because of that, Codex should not create or rotate the bypass secret from CLI in this project. Use the Vercel dashboard manual path below.

## Manual Dashboard Setup Path

Use this path when Paul is ready to create the automation bypass secret:

1. Open the Vercel dashboard.
2. Select project:

```text
project-7vo99
```

3. Go to:

```text
Settings -> Deployment Protection
```

4. Find:

```text
Protection Bypass for Automation
```

5. Click:

```text
Create / Generate / Add Secret
```

6. Add a note such as:

```text
local-smoke-test
```

7. Copy the secret once.
8. Do not paste the secret into chat, docs, screenshots, Git-tracked files, or shell history examples.
9. Store it only in the current local terminal session as shown below.

## Local Environment Variable Setup

Run this manually in the terminal session that will execute the smoke test:

```bash
export VERCEL_AUTOMATION_BYPASS_SECRET="paste-secret-here"
test -n "$VERCEL_AUTOMATION_BYPASS_SECRET" && echo "VERCEL_AUTOMATION_BYPASS_SECRET is set"
```

Important notes:

- This export lasts only for the current terminal session.
- Do not paste the secret into git-tracked files.
- Do not paste the secret into chat.
- Do not commit the secret.
- Rotate or revoke the secret later if it is exposed.

## How Codex Should Use It Later

Future task `CBM-CODEX-RELEASE-029` should:

- Check that `VERCEL_AUTOMATION_BYPASS_SECRET` exists.
- Never print the value.
- Never echo the value.
- Never write the value to files.
- Stop if the environment variable is missing.
- Use the bypass header only for Vercel deployment protection:

```text
x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET
```

- Use the browser cookie helper if needed:

```text
x-vercel-set-bypass-cookie: true
```

The bypass secret is not an Admin API bearer token. It does not replace application authentication.

## Security Rules

- Do not print the bypass secret.
- Do not commit the bypass secret.
- Do not put the bypass secret in `.env` files unless the user explicitly approves a local-only untracked setup.
- Do not screenshot the bypass secret.
- Do not dump cookies.
- Do not dump localStorage or sessionStorage.
- Do not dump auth headers or tokens.
- Do not use a Supabase service-role key for browser or API smoke tests.
- Do not disable Vercel protection.
- Do not make the Vercel project public.
- Do not bypass application auth by unsafe means.
- Rotate or revoke the bypass secret if it is exposed.

## Next Task

```text
CBM-CODEX-RELEASE-029 - Rerun AI Prospecting Production Smoke With Vercel Bypass
```

That task should run only after Paul has created the Vercel automation bypass secret and exported it locally as `VERCEL_AUTOMATION_BYPASS_SECRET`.
