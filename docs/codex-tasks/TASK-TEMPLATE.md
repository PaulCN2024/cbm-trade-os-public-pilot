# Task ID

`CBM-CODEX-TASK-XXX`

# Title

Short task title.

# Purpose

Explain why this task exists.

# Action Type

Examples:

- Review only
- Documentation only
- Small code implementation
- Git commit only
- Verification only

# Risk Level

Examples:

- Low
- Medium
- High

# Autopilot

State one:

- Allowed
- Not Allowed

# Auto-commit

State one:

- Allowed
- Not Allowed

# Commit Message

Required only when auto-commit is allowed.

Example:

`feat: add small utility`

# Approval Requirement

State whether Codex must wait for approval before editing.

Examples:

- Plan first and wait for approval.
- Low-risk Autopilot allowed; no approval plan required.

# Autopilot Safety Conditions

Autopilot is allowed only when all are true:

- Risk Level is Low.
- Action Type is Small code implementation or documentation-only.
- Allowed files are explicitly listed.
- Forbidden files are explicitly listed.
- No schema/API/UI/Supabase/OpenAI/package.json changes are allowed.
- Codex modifies only allowed files.
- Codex does not inspect or modify forbidden files.
- Codex does not scan the whole repository.
- Codex runs only the test command required by this task card.
- Codex reports files changed, test result, final git status, and warnings.

Autopilot must never be used for:

- database schema changes
- migrations
- API behavior changes
- UI behavior changes
- auth/permission changes
- approval workflow changes
- OpenAI/AI SDK integration
- Supabase access
- email/WhatsApp sending
- quotation, PI, order, payment, shipment, or production logic

# Allowed Files

Files Codex may create or modify:

- `path/to/file`

# Allowed Reads

Files Codex may inspect:

- `path/to/file`

# Forbidden Files

Files or areas Codex must not touch:

- `api/*`
- `supabase/migrations/*`
- `admin/*`
- `trade-website/*`
- `trade-os-prototype/*`

# Context

Relevant background for this task.

# Goal

Concrete target outcome.

# Implementation Requirements

Detailed implementation requirements.

# Test Requirements

Commands or checks to run.

If no tests should be run, state:

`Do not run tests.`

# Before Editing

Codex must first report:

1. understanding of the task
2. files expected to touch
3. short implementation plan
4. risks or assumptions
5. questions only if blocking

Codex must wait for approval before editing.

# After Editing

Codex must report:

1. files changed
2. exact changes made
3. tests run and result
4. final git status
5. warnings

# Commit Rule

State one:

- Do not commit.
- Commit only after approval.
- Commit immediately with this message: `...`

# Acceptance Criteria

List the exact conditions that make this task complete.
