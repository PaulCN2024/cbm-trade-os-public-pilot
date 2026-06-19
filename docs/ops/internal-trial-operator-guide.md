# Internal Trial Operator Guide

## Purpose

This guide is for internal read-only trial use of the CBM Trade OS Admin UI.

The current production baseline is an internal trial surface for reviewing Admin UI layout, read-only data clarity, fallback behavior, and safety wording. It is not yet a production business execution system.

Testers should treat the system as:

- read-only
- human-review oriented
- safe for UI and data-display review
- not safe for real send, approval, quotation, PI, order, payment, production, shipment, or file operation execution

## Access

- Production URL: https://project-7vo99.vercel.app
- Admin UI trial URL: https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1

Production admin-read APIs are auth-gated. If a tester is not authenticated, some sections may show static fallback or preview data instead of live read-only data.

Authenticated JSON smoke is deferred unless a safe admin bearer token is provided. Do not paste, print, or share tokens in issue reports.

## Current Read-only Baseline

Current production read-only/admin-read sections:

| Section | Read-only path | Trial expectation |
| --- | --- | --- |
| 工作台 | `/api/admin-read/dashboard-summary` | Summary cards and workflow queues should display clearly. |
| 询盘 | `/api/admin-read/inquiries` | Inquiry records and missing information should be readable. |
| 客户 | `/api/admin-read/customers` | Customer cards and follow-up context should be readable. |
| AI 复核 | `/api/admin-read/ai-review` | AI review risk and human-review wording should be clear. |
| 供应商 | `/api/admin-read/supplier-capabilities` | Supplier capability status should be display-only. |
| 制造能力 | `/api/admin-read/supplier-capabilities` | Manufacturing capability wording must not imply confirmed feasibility or delivery. |
| 文件中心 | `/api/admin-read/documents` | Metadata-only document display should avoid unsafe paths, URLs, or raw content. |
| 报价前复核 | `/api/admin-read/pre-quotation-review` | Readiness, missing information, supplier, and document signals should stay conservative. |

Current future/static sections:

- 报价
- 订单
- 生产
- 发货
- 售后
- 设置

These future/static sections should not be treated as implemented business workflows.

## Section-by-section Trial Checklist

### A. 工作台

Check:

- dashboard summary layout
- overall status cards
- whether fallback/live state label is clear
- whether no action button appears executable
- whether the page answers: what needs attention today?

### B. 询盘

Check:

- inquiry list and read-only preview clarity
- customer and request information clarity
- missing information display
- risk labels and review wording
- no send, quote, or action execution

### C. 客户

Check:

- customer read-only data display
- customer card clarity
- follow-up and stage wording
- no edit, create, export, or task execution

### D. AI 复核

Check:

- AI review display
- risk and review wording
- draft-only wording
- no approve, reject, apply, or send execution

### E. 供应商 / 制造能力

Check:

- capability data display
- supplier status clarity
- no RFQ, send, supplier selection, feasibility confirmation, price, or delivery commitment
- manufacturing wording does not imply confirmed production feasibility

### F. 文件中心

Check:

- metadata-only display
- no unsafe file paths, storage URLs, signed URLs, private bucket names, or raw file content
- no upload, download, delete, OCR, parse, or archive execution
- fallback/live state label remains understandable

### G. 报价前复核

Check:

- conservative readiness labels
- missing information clarity
- supplier and document status clarity
- no price calculation
- no quote, PI, send, order, payment, production, or shipment action

### H. 报价 / 订单 / 生产 / 发货 / 售后 / 设置

Check:

- section is clearly static, future, fallback, or mock-only
- no business execution is available
- labels clearly indicate coming-later or disabled behavior
- no wording implies confirmed quotation, order, payment, production, shipment, liability, or settings execution

## Actions That Must Not Be Treated As Real Execution

During this internal trial, do not test or treat any of the following as real execution:

- customer email sending
- WhatsApp sending
- supplier RFQ sending
- quotation generation or sending
- price calculation or price confirmation
- PI generation or sending
- contract generation or sending
- order confirmation
- payment request or payment confirmation
- production start or production confirmation
- shipment arrangement or shipment confirmation
- file upload, download, delete, parse, OCR, or archive promotion
- approval, rejection, or AI suggestion application
- static or fallback data as real commercial commitment

Disabled and mocked controls are intentional. They are present only to communicate future direction and safety boundaries.

## Feedback Checklist

For each section, record:

- Section name
- What looked clear?
- What looked confusing?
- Was any button or control misleading?
- Was any data missing?
- Was any label too technical?
- Did layout overflow or feel crowded?
- Did fallback/live state make sense?
- Did any Chinese wording feel unnatural?
- Did any wording imply a business commitment?
- What should be improved next?

## Issue Reporting Format

Copy this format for each issue:

```text
Date/time:
Section:
Environment: production/local
URL:
What I expected:
What happened:
Screenshot/video if available:
Severity: low/medium/high
Suggested fix:
Business risk if not fixed:
```

Severity guidance:

- Low: wording, spacing, or minor clarity issue.
- Medium: confusing workflow, unclear fallback/live state, or misleading disabled state.
- High: UI appears to allow send, approve, quote, PI, order, payment, production, shipment, file operation, or other business execution.

## Trial Scoring Rubric

Score each category from 1 to 5.

| Score | Meaning |
| --- | --- |
| 5 | Ready for internal daily use. |
| 4 | Usable with minor UI wording issues. |
| 3 | Usable but confusing in places. |
| 2 | Not ready for real trial. |
| 1 | Blocking issue. |

Categories:

- data clarity
- workflow clarity
- safety clarity
- UI layout
- fallback behavior
- business usefulness

Recommended scoring summary:

```text
Section:
Data clarity:
Workflow clarity:
Safety clarity:
UI layout:
Fallback behavior:
Business usefulness:
Overall score:
Top 3 issues:
Recommended next fix:
```

## Known Limitations

- Unauthenticated admin-read routes return `401`, and the UI may use fallback or static preview data.
- Authenticated JSON smoke is deferred until a safe admin bearer token exists.
- No write or business execution is implemented.
- No file upload, download, delete, parse, OCR, or archive operation is implemented.
- No quotation, PI, order, payment, production, shipment, or after-sales execution is implemented.
- No approval schema or migration has been implemented yet.
- No approval execution workflow exists yet.
- No external AI, Gmail, WhatsApp, supplier channel, payment, production, or shipping integration is enabled.
- Static/fallback data may look demo-like and must not be treated as real commercial data.
- Vercel-routable function count remains tight, so future API expansion must stay planned and conservative.

## Recommended Trial Process

1. Open the production Admin UI trial URL.
2. Review each section in order:
   - 工作台
   - 询盘
   - 客户
   - AI 复核
   - 供应商
   - 制造能力
   - 文件中心
   - 报价前复核
   - 报价
   - 订单
   - 生产
   - 发货
   - 售后
   - 设置
3. Record issues using the issue reporting format.
4. Do not request or attempt business execution in this phase.
5. After one full trial pass, prioritize:
   - wording and layout fixes
   - missing read-only data
   - safety clarity
   - next admin-read resources
   - approval and audit implementation planning

## Recommended Next Development Tasks

1. CBM-CODEX-SPRINT-UI-POLISH-001 - Internal Trial UI Wording Polish
2. CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution if safe token exists
3. CBM-CODEX-SPRINT-API-PLAN-003 - Quotation Metadata Admin-read Safe Projection Plan
4. CBM-CODEX-SPRINT-SCHEMA-PLAN-002 - Approval Audit Migration Draft Plan
5. CBM-CODEX-SPRINT-UI-SAFETY-005 - Static Disabled Action Registry Module Plan

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 85% -> 86% if guide is completed and pushed
- Internal Trial Operator Guide: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [█████████░] 86%
- Current module: [██████████] 100%
