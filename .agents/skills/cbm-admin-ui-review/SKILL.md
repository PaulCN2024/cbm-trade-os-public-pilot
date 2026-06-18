---
name: cbm-admin-ui-review
description: Use this skill when reviewing the CBM Trade OS Admin UI for information architecture, visual hierarchy, Chinese operator experience, read-only safety, SaaS dashboard usability, clutter reduction, and next-step UI recommendations. Review only unless the task explicitly allows implementation.
---

# CBM Admin UI Review Skill

## When to use this skill

Use this skill when the task asks to:
- review Admin UI quality
- explain why the UI feels cluttered
- evaluate information architecture
- evaluate visual hierarchy
- evaluate Chinese operator experience
- evaluate SaaS dashboard usability
- recommend UI redesign direction
- identify safe next UI tasks
- review browser preview results
- assess whether UI is workflow-centric or module-centric

## Core goal

Review the CBM Trade OS Admin UI like a product/UI designer, not only like a code editor.

The goal is to identify why the UI feels confusing, text-heavy, static, or unpolished, and recommend a staged path toward a clearer Chinese B2B SaaS admin experience.

## CBM Trade OS UI context

CBM Trade OS is an AI-first foreign trade operating system.

The Admin UI is currently a localized Chinese read-only internal admin shell.

The UI must help Chinese-speaking operators review:
- customers
- inquiries
- AI drafts
- products
- companies
- manufacturing capabilities
- review summary helpers
- future supplier RFQs
- future quotations
- future orders
- future documents and attachments

## Review mindset

Always separate:

1. Information architecture issues
2. Visual hierarchy issues
3. Layout density issues
4. Component consistency issues
5. Chinese wording issues
6. Read-only safety issues
7. Static/mock state issues
8. Code implementation issues

Do not mix these into one vague “UI is bad” statement.

## Current known UI problem pattern

The current UI may feel cluttered because it can act as:
- a safety checkpoint
- a static prototype
- a read-only dashboard shell
- an API fallback display
- a business admin interface

When reviewing, identify which role is dominating the screen.

## Hard restrictions

Unless the task explicitly allows implementation:
- Do NOT modify files.
- Do NOT create files.
- Do NOT commit.
- Do NOT add UI implementation.
- Do NOT change API/schema/package/tests.
- Do NOT add write actions.
- Do NOT add send/approve/reject/quote/PI/order/payment/shipment/production actions.
- Do NOT add OpenAI/Gmail/WhatsApp integration.

## Review checklist

When reviewing UI, check:

- Is the page too text-heavy?
- Are primary workflows obvious?
- Does the dashboard answer: “What needs my attention today?”
- Are primary records separated from safety/debug metadata?
- Are read-only states clear but not overwhelming?
- Are disabled/mock actions visually safe?
- Are tables readable?
- Are cards overloaded?
- Are badges meaningful?
- Is the right review panel useful or just noisy?
- Are Chinese labels natural?
- Are English technical values retained only where appropriate?
- Does any wording imply business commitment?
- Is there horizontal overflow?
- Are sections grouped by user task instead of by database module only?
- Is the UI too module-centric rather than workflow-centric?

## Operator roles to consider

Think from the perspective of:
- business owner
- salesperson
- merchandiser / follow-up operator
- supplier coordinator
- future finance reviewer
- future admin / manager

## Output format for review tasks

Use:

1. Files inspected
2. Preview method used, if any
3. Current UI problem summary
4. Information architecture issues
5. Visual hierarchy issues
6. Text density / copy issues
7. Component consistency issues
8. Chinese operator experience assessment
9. Read-only safety assessment
10. Suggested target layout
11. What to keep
12. What to redesign later
13. Lowest-risk next UI task
14. What must not be changed
15. Final recommendation
16. Final git status

## Preferred recommendation style

Prefer:
- review first
- design plan second
- small implementation later

Do not recommend broad UI rewrite as the first step.
Recommend staged UI work.
