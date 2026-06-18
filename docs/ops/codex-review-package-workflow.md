# Codex Review Package Workflow

## Purpose

The Review Package workflow keeps ChatGPT, Codex, and Paul aligned without copying full Codex conversations back and forth.

Codex executes the task. ChatGPT reviews the concise Review Package. Paul makes the final decision.

## Roles

### ChatGPT

- helps define tasks
- reviews Codex's Review Package
- identifies risks, missing tests, unclear scope, and next prompts

### Codex

- executes the approved task
- changes only allowed files
- validates the work
- creates a concise Review Package

### Paul

- approves scope
- reviews PRs and diffs
- decides whether to merge, revise, or stop
- controls production deployment and production secrets

## Standard Review Package Format

Use this exact structure:

```markdown
## 1. Original Task

Summarize the task Codex executed.

## 2. Scope

- Allowed files:
- Forbidden files:
- What was intentionally not changed:

## 3. Files Changed

- path/to/file: short reason

## 4. Key Implementation

- Main change 1
- Main change 2
- Main change 3

## 5. Database / Env / Dependency Changes

- Database schema changes: None / describe
- Environment variable changes: None / describe
- Dependency changes: None / describe

## 6. Verification

- Command:
- Result:
- Browser preview, if applicable:

## 7. Risks and Open Questions

- Risk:
- Open question:

## 8. Suggested ChatGPT Review Focus

- Check scope boundary
- Check safety boundary
- Check tests or preview evidence
- Check wording or business risk

## 9. Recommended Next Step

- Approve and commit / merge
- Request revision
- Create next Codex task
- Stop and investigate
```

## What Paul Should Copy To ChatGPT

Copy only the Review Package back to ChatGPT.

Do not copy:

- the full Codex conversation
- long terminal logs unless needed
- unrelated debugging details
- private secrets
- customer files

## Short ChatGPT Prompt

Use this prompt with ChatGPT:

```text
这是 Codex 的 Review Package，按审核包模式帮我审核，并生成下一步 Codex 提示词。
```

## Review Package Rules For Codex

Codex should include:

- exact files changed
- validation commands and results
- browser preview result for UI changes
- whether git status is clean
- warnings such as known package warnings
- any skipped validation and why

Codex should not hide:

- failed commands
- browser preview problems
- unexpected file changes
- uncertainty about production risk

## Recommended Review Loop

1. ChatGPT creates or refines a task.
2. Paul sends task to Codex.
3. Codex executes in branch.
4. Codex returns Review Package.
5. Paul sends Review Package to ChatGPT.
6. ChatGPT reviews and recommends next step.
7. Paul approves merge, asks Codex for revision, or pauses.

## Safety Boundary

Review Package approval is not production approval.

Production deployment, environment variables, database migrations, external channel actions, official quotations, PI, orders, payment, production, and shipment still require separate explicit human approval.
