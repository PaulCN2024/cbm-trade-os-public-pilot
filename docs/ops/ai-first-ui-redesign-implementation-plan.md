# AI-first UI Redesign Implementation Plan

## Purpose

Create an executable phased plan for Codex to implement the AI-first Admin UI redesign safely.

The goal is to move CBM Trade OS from a static read-only admin surface toward an AI-first, workflow-first, human-in-the-loop command center without changing backend behavior or enabling business actions too early.

This plan is documentation only. It does not modify UI code, API code, schema, package files, env vars, production data, or Vercel deployment.

## Preconditions

Before any UI implementation round:

- current read-only baseline is stable
- no write actions are enabled
- no API changes are included unless separately approved
- no schema changes are included
- no package installs are needed
- no helper/display-adapter import is added unless explicitly approved
- tests must pass
- build must pass
- browser smoke must pass
- production deploy happens only after smoke and explicit task approval
- all business-risk actions remain human-reviewed and disabled

## Implementation Strategy

Implement the redesign incrementally.

Recommended order:

1. Round A: layout shell with right AI Copilot panel
2. Round B: dashboard work queues
3. Round C: workflow timeline
4. Round D: section cards redesigned
5. Round E: safe local-only interactions
6. Round F: polish based on Paul feedback

This avoids a broad UI rewrite and protects the existing read-only production baseline.

## Round A Detailed Task

### Goal

Add an AI-first layout shell:

- left nav remains stable
- center work canvas remains current main area
- right AI Copilot panel becomes a persistent design pattern
- preserve all sections
- AI panel is read-only
- no business controls

### Files

Allowed future implementation files:

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/app.js`
- `admin/ui-foundation/styles.css`

These files should be allowed only in a specific implementation task. This plan does not modify them.

### Acceptance

- all sections render
- right panel visible
- no active controls are added
- no endpoint strings are changed
- no route IDs are changed
- no `data-section` values are changed
- no helper execution
- no AI calls
- `npm test` passes
- `npm run build` passes
- browser smoke passes with no horizontal overflow

## Round B Detailed Task

### Goal

Add work queues and visual priorities to the dashboard.

Dashboard should emphasize:

- 待人工复核
- 信息待补充
- 供应商待确认
- 文件待核对
- 报价前复核草稿
- 高风险提示

### Implementation Notes

- reuse existing dashboard/fallback data first
- keep queue cards informational
- show recommended human next step
- show disabled capability chips
- do not make queue cards execute actions
- local selection is allowed only if it updates read-only details

### Acceptance

- dashboard feels like a daily AI command center
- no enabled business controls
- no endpoint changes
- fallback remains clear
- no `undefined` or `null`

## Round C Detailed Task

### Goal

Add inquiry-to-quotation workflow timeline.

Timeline:

```text
询盘 -> 客户 -> 文件 -> 供应商 -> AI复核 -> 报价前复核 -> 报价元数据
```

### Implementation Notes

- start with static/fallback-safe timeline mapping
- each step shows status, risk, missing info, and source state
- future quote generation / approval / send remains locked
- timeline expansion can be local-only

### Acceptance

- timeline makes the business process obvious
- timeline does not imply execution readiness
- no quotation generation
- no PI/order/payment/production/shipment behavior

## Round D Detailed Task

### Goal

Redesign core section cards.

Priority sections:

1. 工作台
2. 询盘
3. 客户
4. AI 复核
5. 文件中心
6. 报价前复核
7. 正式报价元数据

### Implementation Notes

- convert text-heavy blocks into intelligence cards
- move technical metadata into secondary details
- keep safety visible but less repetitive
- separate business summary, AI suggestion, risk, missing info, source state, and disabled actions

### Acceptance

- sections feel AI-assisted
- cards are easier to scan
- safety language remains clear
- no route/data/API behavior changes

## Round E Detailed Task

### Goal

Add safe local-only expand/collapse or details toggles if needed.

Allowed interactions:

- expand/collapse local text
- local tabs inside one module
- local row selection that changes read-only detail panel
- local sort/filter for already loaded data
- AI explanation drawer

Forbidden interactions:

- send
- approve/reject
- generate quote
- calculate price
- create PI
- confirm order
- upload/download file
- delete file
- parse/OCR
- external integrations
- backend writes

### Acceptance

- local interactions do not call write APIs
- no active business controls
- disabled controls remain disabled
- active control count in preview/business regions remains safe

## Round F Detailed Task

### Goal

Polish based on Paul's manual trial feedback.

### Implementation Notes

- use actual feedback before changing more UI
- prioritize P0/P1 confusion or layout problems
- avoid speculative feature growth
- keep the AI-first shell stable unless feedback shows it is wrong

### Acceptance

- fixes map directly to feedback
- no broad rewrite
- no new business execution

## Safety Checklist For Every Round

Every future UI implementation round must confirm:

- no endpoint changes unless explicitly in scope
- no write actions
- no disabled control re-enabled
- active controls count remains `0` in preview/business regions
- no risky labels such as `可发送`, `可报价`, `已批准`, `可下单`, or `已确认生产`
- no unsafe fields
- no storage path, signed URL, raw file content, private bucket, token, password, or secret exposure
- no hidden business action on page load
- no helper execution unless explicitly approved
- no schema/migration/package change
- `npm test` passes
- `npm run build` passes
- browser smoke passes
- production deploy only after approved release task

## Suggested Next Codex Task

```text
CBM-CODEX-SPRINT-UI-AI-FIRST-001 - Add AI Copilot Layout Shell

Use cbm-trade-os-maintainer.
Use cbm-readonly-saas-ui-implementation.
Use cbm-admin-ui-review.
Use cbm-admin-design-system.

Goal:
Implement the first AI-first Admin UI layout shell by adding a persistent read-only AI Copilot panel pattern.

Allowed files:
- admin/ui-foundation/index.html
- admin/ui-foundation/app.js
- admin/ui-foundation/styles.css

Hard restrictions:
- no API changes
- no schema changes
- no package changes
- no endpoint changes
- no route ID changes
- no data-section changes
- no helper execution
- no AI calls
- no write/send/approve/reject/RFQ/quote/PI/order/payment/production/shipment actions

Acceptance:
- all sections still render
- AI Copilot panel visible and read-only
- no active business controls
- tests/build pass
- browser smoke passes
```

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-UI-AI-FIRST-001 - Add AI Copilot Layout Shell`
2. `CBM-CODEX-SPRINT-UI-AI-FIRST-002 - Add Dashboard Work Queues`
3. `CBM-CODEX-SPRINT-UI-AI-FIRST-003 - Add Inquiry-to-Quotation Workflow Timeline`
4. `CBM-CODEX-SPRINT-UI-AI-FIRST-004 - Redesign Core Section Cards`
5. `CBM-CODEX-RELEASE-030 - Deploy AI-first UI Redesign Round A`

## Progress Report

- Full product vision: 36% -> 37% if all docs are completed and pushed
- Internal MVP / foundation: 98% -> 98%
- AI-first UI Redesign Implementation Plan: 0% -> 100%
