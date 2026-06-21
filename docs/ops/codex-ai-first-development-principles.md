# Codex AI-first Development Principles

## Purpose

This document tells Codex how to think before implementing new CBM Trade OS features.

CBM Trade OS should be developed as an AI-first foreign trade operating system, not as a traditional CRM with occasional AI widgets.

## Do Not Build Static Pages For Their Own Sake

A page is not enough.

Every module must define:

- business purpose
- AI role
- data source
- knowledge dependency
- safety boundary
- human approval point
- future workflow connection

Static previews are useful only when they clarify future product direction or de-risk a workflow. They should not become the product goal.

## Required Questions Before Coding A New Module

Before implementing a new module, Codex must answer:

- What business task does this module help Paul complete?
- How will AI participate?
- What data does AI need?
- What knowledge base records does AI use?
- What can AI suggest?
- What can AI draft?
- What must AI never do?
- What requires human approval?
- What fallback/demo mode is safe?
- What production smoke proves it works?

If these questions are not answered, the task should become a planning task first.

## AI-first UI Principles

- AI instruction box should be prominent.
- AI Copilot panel should explain context and risk.
- workflow should show next steps.
- reduce clicking.
- show source/confidence/risk.
- show disabled actions clearly.
- do not create misleading active controls.

The UI should answer:

```text
What does AI understand?
What evidence did AI use?
What is missing?
What is risky?
What should Paul review next?
What is blocked until approval?
```

### Visual Direction Guidance

Future Admin UI work should follow `docs/architecture/ai-first-admin-ui-visual-design-system-v2.md`.

The target direction is a premium AI operations console for foreign trade work, not a plain CRUD admin page.

Codex should:

- make daily priorities and AI recommendations easier to scan
- separate business records from safety/debug details
- keep source, confidence, risk, freshness, and approval state visible
- keep disabled actions informational, not clickable
- avoid copying third-party UI, brand, text, icons, or proprietary flows
- avoid adding active controls before the approval workflow exists

## Read-only First Principle

For every risky business area:

1. start with read-only data
2. add static preview
3. add admin-read
4. add real data binding
5. add approval workflow
6. only then add controlled writes

Read-only first is not slowness. It is how CBM Trade OS protects real customers, suppliers, quotations, files, payments, orders, production, and shipments while the AI layer matures.

## Safety-first Principle

Never implement:

- auto-send
- auto-post
- auto-quote
- auto-approve
- auto-order
- unauthorized scraping
- hidden AI decisions
- uncited customer-facing claims

AI may prepare drafts and recommendations. It must not silently perform external or irreversible business actions.

## Documentation Requirements

Each major feature should include:

- architecture plan
- UI storyboard
- data model plan
- API plan
- safety plan
- production checkpoint

For high-risk modules, add:

- approval boundary
- audit log plan
- RLS/permission plan
- denied action tests or smoke checks
- fallback behavior

## Progress Update Rules

- Do not inflate Internal MVP beyond 100%.
- Full product vision should increase only when meaningful capability is planned or implemented.
- Document progress changes clearly.
- Planning completion can move full product vision slightly when it clarifies product direction.
- Read-only UI previews should not be treated as business execution.
- Controlled write, AI provider, RAG, channel sending, quotation generation, and production workflows require separate milestones.

## Final Instruction To Codex

Before writing code, Codex must align with:

```text
AI is the entrance.
Knowledge is the brain.
Human approval is the safety boundary.
```

When a task conflicts with this principle, pause and turn it into a safety/design review before implementation.
