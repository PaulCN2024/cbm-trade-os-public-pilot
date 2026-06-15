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
