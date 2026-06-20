# Phase UI-2 Static Disabled Action Registry Module Plan

## Purpose

Plan a future static JavaScript registry module that the Admin UI can use to consistently render disabled actions and tooltips without enabling execution.

This is planning-only. It does not create code, modify Admin UI files, modify API files, modify schema, install packages, deploy, enable actions, or execute business workflows.

## Current Baseline

Existing baseline:

- The Disabled Action Registry Plan exists.
- The Disabled Action / Write Approval Architecture Plan exists.
- UI disabled action remediation is deployed and production-smoke verified.
- Preview regions remain action-free or show disabled/mock controls only.
- Admin-read surfaces remain read-only.

Current disabled/mock examples:

- `导出视图 - 未连接`
- `新增 - 稍后开放`
- `创建草稿 - 仅模拟`
- `筛选 - 稍后开放`
- disabled capability chips such as `不可发送`, `不可报价`, `不可生成 PI`, `不可确认订单`

The registry module should reduce label drift later, but it must not become an execution switch.

## Proposed Module Location

Future candidate file:

```text
admin/ui-foundation/disabled-actions.js
```

Alternative safe location:

```text
admin/ui-foundation/static-disabled-actions.js
```

Do not create either file now.

The first implementation should keep the module browser-safe and static. It should not import `lib/services/*`, call API routes, read environment variables, or execute helpers.

## Proposed Export Shape

Future static object shape:

```js
{
  action_key: {
    label_cn: "...",
    label_en: "...",
    module: "...",
    current_status: "disabled",
    disabled_reason: "...",
    risk_level: "high",
    required_phase: "S6",
    required_role: "manager",
    future_endpoint: null,
    audit_required: true
  }
}
```

Recommended field rules:

| Field | Rule |
| --- | --- |
| `action_key` | English internal key, stable, unique. |
| `label_cn` | Chinese operator-facing label. |
| `label_en` | English reference label. |
| `module` | Owning UI/business module. |
| `current_status` | Current phase status. No enabled status in this phase. |
| `disabled_reason` | Human-readable tooltip/copy. |
| `risk_level` | Conservative risk level. |
| `required_phase` | Future phase required before implementation. |
| `required_role` | Human role required before activation. |
| `future_endpoint` | `null` for now unless a future planning task approves a namespace. |
| `audit_required` | `true` for every business-risk action. |

## Initial Static Registry Categories

### Send actions

Examples:

- `send_customer_reply`
- `send_supplier_rfq`
- `send_quote`
- `send_pi`
- `send_after_sales_message`

Current policy:

- disabled or prohibited current phase
- high or critical risk
- audit required

### Approve/reject actions

Examples:

- `approve_ai_suggestion`
- `reject_ai_suggestion`
- `approve_quote`
- `reject_quote`
- `approve_order`

Current policy:

- disabled until approval schema, role gate, and audit exist
- cannot be represented as an active button in the current Admin UI

### RFQ actions

Examples:

- `draft_supplier_rfq`
- `send_supplier_rfq`
- `confirm_supplier_selection`

Current policy:

- draft-only planning may be allowed later
- sending and supplier commitment remain disabled

### Quotation/PI actions

Examples:

- `calculate_price`
- `generate_quote`
- `send_quote`
- `generate_pi`
- `send_pi`

Current policy:

- no price calculation
- no official quotation generation
- no PI generation or sending
- all require future approval/audit workflow

### Order/payment actions

Examples:

- `confirm_order`
- `request_payment`
- `confirm_payment`
- `issue_receipt`

Current policy:

- critical risk
- disabled until role-gated approval and audit execution architecture exists

### Production/shipping actions

Examples:

- `start_production`
- `update_production_status`
- `arrange_shipment`
- `confirm_shipment`

Current policy:

- critical risk
- must not imply production feasibility, delivery confirmation, or shipment commitment

### File operations

Examples:

- `upload_file`
- `download_file`
- `delete_file`
- `parse_file`
- `run_ocr`
- `archive_file`

Current policy:

- disabled until storage, retention, access control, redaction, and audit plans are approved
- must never expose raw file paths, signed URLs, private bucket names, or raw content in UI labels

### Settings/user role actions

Examples:

- `update_system_settings`
- `manage_user_roles`
- `change_bank_configuration`

Current policy:

- critical risk
- disabled until role, audit, environment/config safety, and production rollout plans exist

## UI Consumption Rules

Future UI must:

- import the registry only for display labels/tooltips
- not use the registry to execute anything
- disable all non-read-only actions
- render consistent labels and tooltip text
- show `disabled_reason`
- keep disabled capability chips informational
- never trust frontend state as backend authorization
- never make a registry item clickable by default
- never infer action availability from `future_endpoint`

Future UI must not:

- call a backend mutation because an action exists in the registry
- turn a disabled chip into a button
- store override state in `localStorage`
- hide execution handlers behind text labels
- show `enabled` status in the current phase

## Safety Rules

- No enabled status in current phase.
- No execution handlers.
- No endpoint calls.
- No form submit.
- No hidden actions.
- No backend mutation.
- No `localStorage` action override.
- No helper or display adapter execution.
- No API/schema coupling in the first static module.
- No price, delivery, payment, supplier, quotation, PI, order, production, shipment, or liability commitment wording.

## Future Implementation Phases

| Phase | Scope | Boundary |
| --- | --- | --- |
| R2 | Create static registry module. | No UI changes. No execution. |
| R3 | Wire UI labels/tooltips to registry. | No execution. No active controls. |
| R4 | Add read-only docs/testing. | No business actions. |
| R5 | Plan staged action creation only after approval schema exists. | Planning only until separately approved. |

## Validation Checklist For Future Code Task

Future implementation must check:

- no active buttons
- no write calls
- no route/data-section change
- tests/build pass
- browser smoke active controls = 0
- registry includes required action keys
- all disabled reasons visible
- disabled chips are non-clickable
- no `enabled` statuses
- no hidden endpoint calls
- no package changes unless separately approved

## Non-goals

- No code now.
- No UI change now.
- No API now.
- No schema now.
- No action execution now.
- No approval execution now.
- No business workflow enablement now.

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-UI-SAFETY-005` - Create Static Disabled Action Registry Module
2. `CBM-CODEX-SPRINT-UI-SAFETY-006` - Wire Disabled Tooltips To Registry
3. `CBM-CODEX-SPRINT-TRIAL-002` - Paul Manual Trial Feedback Incorporation
4. `CBM-CODEX-SPRINT-API-READONLY-011` - Extend Admin Read Dispatcher For Quotation Metadata
5. `CBM-CODEX-RELEASE-013` - Authenticated Admin API Smoke Test Execution if safe token exists

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 91% -> 92% if all three docs are completed and pushed
- Static Disabled Action Registry Module Planning: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [█████████░] 92%
- Current module: [██████████] 100%
