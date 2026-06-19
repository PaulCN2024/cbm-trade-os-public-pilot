# Phase UI-2 Data Wiring Roadmap

## Purpose

Plan the next phase: safely connecting read-only data and display adapters into the static workflow UI without adding write or business execution.

## Principle

UI-2 is not business execution.

UI-2 is read-only data wiring and display adapter integration.

All write, send, approve, quote, PI, order, payment, production, and shipment actions remain disabled.

## Why UI-2 is needed

The current UI is static and useful for validating structure, operator language, workflow order, safety copy, and the visual direction of the Admin UI.

The next product value comes from showing real read-only data where safe. That wiring must be controlled so the interface does not accidentally become a business action surface.

## Recommended UI-2 order

1. Static UI Component Pattern Consolidation
2. Read-only Inquiry Data Wiring
3. Read-only Customer Data Wiring
4. Read-only AI Review Data Wiring
5. Read-only Supplier/Capability Data Wiring
6. Read-only File Metadata Wiring
7. Read-only Quotation Pre-check Data Wiring
8. Cross-section Display Adapter Review
9. Approval Boundary Planning
10. Future write/action architecture plan

## Task 1: Static UI Component Pattern Consolidation

Reduce duplicated card, grid, queue, chip, and review panel patterns.

This task may create internal rendering helpers if safe, but it must not change behavior.

Scope boundaries:

- No API calls.
- No data mutation.
- No business logic.
- Preserve existing visual behavior.
- Allowed files should likely be `admin/ui-foundation/app.js` and `admin/ui-foundation/styles.css` only.
- High caution is required because refactoring shared patterns could break multiple sections.

## Task 2: Read-only Inquiry Data Wiring

Connect the existing read-only inquiries API if available.

If the API is unavailable, keep the static fallback preview.

Scope boundaries:

- No write actions.
- No quote generation.
- No customer send action.
- Display missing information and risk fields if available.
- If fields are unavailable, show a safe placeholder or static fallback.

## Task 3: Read-only Customer Data Wiring

Connect the existing read-only customers API if available.

Keep static fallback behavior when live data is unavailable.

Scope boundaries:

- No CRM write actions.
- No customer creation, update, deletion, import, or merge.
- No task creation.
- No Email or WhatsApp messaging.

## Task 4: Read-only AI Review Data Wiring

Connect an existing AI analyses API or read-only endpoint if available.

This means showing existing records only.

Scope boundaries:

- No AI calls.
- No OpenAI or AI Gateway integration.
- No generation.
- No approval execution.
- No send action.
- No quote, PI, order, payment, production, or shipment action.

## Task 5: Read-only Supplier/Capability Data Wiring

Connect the existing capabilities API if available.

Keep static fallback behavior when live data is unavailable.

Scope boundaries:

- No RFQ sending.
- No supplier messaging.
- No supplier commitment.
- No quotation confirmation.
- No production confirmation.

## Task 6: File Metadata Wiring

Show file metadata only.

This phase must not implement real file operations.

Scope boundaries:

- No file upload.
- No file download action unless separately planned and approved.
- No file deletion.
- No OCR.
- No parsing.
- No file archive or Document Center promotion.
- Future API and schema planning is required before a real file center.

## Task 7: Quotation Pre-check Data Wiring

Display read-only quotation pre-check information only.

Scope boundaries:

- No price calculation engine.
- No quotation generation.
- No PI generation.
- No contract generation.
- No order creation.
- No sending.

## Safety boundaries

The following actions remain forbidden across UI-2 unless a later task explicitly plans and approves them:

- Create, update, delete.
- Send.
- Approve or reject execution.
- Quote generation.
- Price calculation engine.
- PI or contract generation.
- Order confirmation.
- Payment confirmation.
- Production confirmation.
- Shipment confirmation.
- File upload, deletion, parsing, or OCR.
- AI provider execution.
- External integration execution.

## Recommended next 5 Codex tasks

1. `CBM-CODEX-SPRINT-UI-REF-001` - Static UI Pattern Consolidation Readiness And Minimal Refactor
2. `CBM-CODEX-SPRINT-DATA-001` - Read-only Inquiry Data Wiring Sprint
3. `CBM-CODEX-SPRINT-DATA-002` - Read-only Customer Data Wiring Sprint
4. `CBM-CODEX-SPRINT-DATA-003` - Read-only AI Review Data Wiring Sprint
5. `CBM-CODEX-SPRINT-DATA-004` - Read-only Supplier Capability Data Wiring Sprint

## Recommendation

Do not start with write actions.

Do not start with AI execution.

Start with read-only data wiring and fallback preservation.

The safest immediate next step is a readiness review and minimal consolidation task for repeated static UI component patterns before connecting more live data.
