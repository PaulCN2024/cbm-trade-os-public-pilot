# Codex Safety Rules

## Purpose

These rules define the safety boundary for using Codex as a 24/7 AI development assistant for CBM Trade OS.

Codex may help develop, test, document, and prepare reviewable changes. Codex must not bypass human approval for production data, production configuration, customer files, or business-risk actions.

## Production Safety Rules

Codex must not directly:

- deploy to production unless explicitly approved
- change production environment variables
- change production runtime settings
- modify production Vercel project settings
- modify production Supabase settings
- run production migrations
- run destructive production commands

Production changes must go through:

1. GitHub branch
2. pull request
3. Review Package
4. human approval
5. controlled deployment process

## Database Safety Rules

Codex must not:

- write directly to production database tables
- delete production records
- run schema migrations without explicit approval
- run SQL against production without human review
- change Supabase Row Level Security policies without explicit approval
- change auth or permission behavior without explicit approval

Preferred workflow:

- plan schema first
- review migration scripts
- test in local or staging first
- apply production only after human approval

## File Storage Safety Rules

Codex must not:

- delete real customer files
- move real customer folders without approval
- overwrite customer-adjusted templates
- overwrite exported quotation, PI, invoice, packing list, production order, or cutting list files
- change archive base paths without approval

When file operations are needed:

- use dry-run first
- create backups or ZIP output when appropriate
- preserve user-adjusted templates
- ask before destructive operations

## AI Automation Safety Rules

AI may:

- summarize
- classify
- draft
- compare
- flag risk
- prepare review notes
- suggest next actions

AI must not automatically:

- send customer messages
- send supplier messages
- approve drafts
- confirm price
- confirm delivery time
- confirm payment terms
- confirm bank details
- promise compensation
- judge responsibility
- create official quotation
- create or send PI
- create order
- trigger payment
- trigger production
- trigger shipment

## Approval-Before-Action Policy

Human approval is required before:

- merge to main
- production deployment
- production database migration
- production environment variable change
- external customer/supplier communication
- official commercial document generation or sending
- quotation / PI / order / payment / production / shipment action
- destructive file operation
- permission/auth/security change

Approval must be explicit, task-specific, and recorded in the task or PR.

## Forbidden Actions Unless Explicitly Approved

Codex must not do these by default:

- modify `api/*` for production behavior
- modify `supabase/migrations/*`
- modify `.env` or production secrets
- install new dependencies
- run deploy commands
- run production SQL
- add send/approve/reject buttons
- add create/update/delete actions
- add OpenAI / Gmail / WhatsApp production integration
- add quotation / PI / order / payment / shipment / production execution
- delete files outside the approved task scope

## Git And Review Rules

Use branches for all development work:

```text
codex/<task-id-short-title>
```

Before merge:

- inspect diff
- run tests or relevant checks
- produce Review Package
- review with ChatGPT when helpful
- get Paul approval

Do not merge or deploy because a task "looks simple." Keep the same review discipline for low-risk tasks.

## Environment Rules

Codex environments should be separated:

- Codex Cloud / GitHub branch for primary development
- optional Ubuntu dev server for backup execution
- Vercel / Supabase for production runtime

Development environments must not be given uncontrolled production write access.

## Emergency Stop Rule

Stop and ask Paul before continuing if a task requires:

- production credentials
- production database access
- production environment variables
- destructive file operations
- business commitment
- customer/supplier sending
- schema migration
- dependency installation
- broad rewrite

When unsure, stop and report the exact risk.
