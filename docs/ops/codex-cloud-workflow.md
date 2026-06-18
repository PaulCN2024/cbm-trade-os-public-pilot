# Codex Cloud Workflow

## Purpose

Use Codex Web / Cloud as the primary development execution method for CBM Trade OS while keeping GitHub as the source of truth and production systems protected.

This workflow is for development changes only. Codex Cloud must not directly modify production data, production environment variables, real customer files, or production runtime configuration.

## Recommended Workflow

1. ChatGPT task
   - Paul and ChatGPT define the next small task.
   - The task should include scope, allowed files, forbidden files, test expectations, and commit rules.

2. Codex Cloud execution
   - Codex Cloud checks out the GitHub repository.
   - Codex works on a dedicated branch.
   - Codex makes only the approved change.

3. GitHub branch / pull request
   - Codex pushes the branch.
   - Codex opens or updates a pull request.
   - GitHub remains the source of truth.

4. Review Package
   - Codex outputs a concise Review Package.
   - Paul copies only the Review Package back to ChatGPT.

5. ChatGPT review
   - ChatGPT reviews the Review Package in audit mode.
   - ChatGPT recommends approve, revise, or reject.

6. Human approval
   - Paul reviews the PR, checks the diff, and approves only if safe.

7. Merge and deploy
   - Merge only after review.
   - Deploy through the normal Vercel / Supabase process.
   - Production changes remain controlled by explicit human approval.

## When To Use Codex Cloud

Use Codex Cloud for:

- documentation updates
- low-risk utility implementation
- test additions
- static UI preview work
- refactors with explicit scope
- GitHub branch and PR workflows
- work that can continue while Paul's Mac is offline

Codex Cloud is best when the task can be reviewed through GitHub diff, tests, and a Review Package.

## What Codex Cloud Should Not Do

Codex Cloud must not:

- change production database data directly
- change production environment variables
- delete or move real customer files
- send customer messages
- approve AI drafts
- create official quotations
- create or send PI / CI / packing list documents
- create orders
- confirm payment
- trigger production
- trigger shipment
- modify Supabase production settings without explicit approval
- run production deployment commands unless separately approved

## Branch Naming Convention

Use short, traceable branches:

```text
codex/<task-id-short-title>
```

Examples:

```text
codex/ui-008-static-workbench-preview
codex/doc-codex-cloud-workflow
codex/phase-0b-display-adapter-docs
```

Rules:

- use lowercase
- use hyphens
- include task id when available
- keep one task per branch
- do not reuse stale branches for unrelated work

## Pull Request Description Template

```markdown
## Summary

- What changed
- Why it changed
- Scope boundary

## Files Changed

- path/to/file
- path/to/file

## Safety Boundary

- No production database changes
- No production environment variable changes
- No write/send/approve/order/production actions
- No schema changes unless explicitly approved

## Verification

- Command run:
- Result:
- Browser preview, if applicable:

## Review Package

Paste the Codex Review Package here or link to the task comment.

## Risks / Open Questions

- ...
```

## Review Checklist

Before merge, confirm:

- branch name matches the task
- PR diff contains only expected files
- no business logic changed unless explicitly approved
- no API/schema/env/package changes unless explicitly approved
- no production data or real customer files touched
- tests or docs validation completed
- browser preview completed for UI work
- Review Package reviewed by ChatGPT if needed
- Paul gives final approval before merge

## Production Runtime Boundary

Vercel and Supabase remain the production runtime for CBM Trade OS.

Codex Cloud may prepare code, docs, tests, and PRs. It must not bypass GitHub review or directly operate production data.
