# Phase UI-1 Admin UI Information Architecture Plan

## 1. Title

Phase UI-1 Admin UI Information Architecture Plan

## 2. Purpose

This document defines the future information architecture for the CBM Trade OS Admin UI before visual redesign or implementation.

The goal is to move the Admin UI from a module-centric static shell toward a workflow-first Chinese B2B SaaS operations dashboard. This plan does not implement navigation changes, UI changes, API changes, schema changes, helper execution, write actions, or business workflows.

## 3. Current IA Problem

The current Admin UI is mostly module-centric:

- Dashboard
- Customers
- Inquiries
- Products
- Companies
- Capabilities
- AI Drafts

This structure is safe, but it does not yet answer the operator's main question:

> What needs my attention today?

The current structure is useful for validating read-only sections and safety boundaries, but it makes operators scan separate modules to understand priority, risk, missing information, follow-up needs, and review tasks.

## 4. Target IA Principle

The target IA should be workflow-first, not purely module-first.

The Admin UI should help operators quickly see:

- what needs review
- what needs follow-up
- what has missing information
- what is risky
- what is waiting on customer
- what is waiting on supplier
- what is ready for human decision
- what is blocked

Module pages should still exist, but they should support workflows rather than define the whole experience.

## 5. Operator Roles and Primary Jobs

### Business Owner / Manager

Top jobs:

- see today's operating risks
- review high-risk AI drafts or communications
- monitor inquiry and customer follow-up health
- identify overdue or blocked work
- avoid unauthorized commitments on price, delivery, payment, production, quotation, PI, order, shipment, or supplier capability

### Salesperson

Top jobs:

- review new inquiries
- identify missing customer information
- follow up with customers
- review AI draft suggestions before sending
- understand customer/project status
- avoid sending unapproved price, delivery, payment, quotation, PI, order, or shipment commitments

### Merchandiser / Follow-up Operator

Top jobs:

- track inquiry progress
- collect missing drawings, quantities, finishes, tolerances, and delivery needs
- follow up customer and supplier waiting states
- keep records organized
- prepare work for human review

### Supplier Coordinator

Top jobs:

- understand which supplier quotes are waiting
- review product/capability context
- track supplier communication risks
- distinguish supplier ability information from confirmed production feasibility
- avoid implying confirmed price, lead time, or production commitment

### Future Document Operator

Top jobs:

- review customer files and attachments
- identify files that need archiving
- identify documents that may later become quotation, PI, invoice, packing list, production order, or cutting list material
- keep file/document actions read-only until implementation is separately approved

### Future Finance Reviewer

Top jobs:

- review payment-related risk flags
- review finance-sensitive drafts or communications
- avoid exposing internal cost, margin, exchange rate, bank detail, or payment confirmation incorrectly
- preserve human approval for payment, bank, invoice, and commercial document actions

## 6. Main Dashboard Question

The future dashboard should answer:

- 今天有什么要处理？
- 哪些询盘需要看？
- 哪些 AI 草稿需要复核？
- 哪些客户需要跟进？
- 哪些信息缺失？
- 哪些沟通或附件有风险？
- 哪些供应商报价等待中？
- 哪些事项即将超时？

The dashboard should make priority visible without requiring the operator to open every module.

## 7. Proposed Top-level Navigation

Recommended future top-level IA:

- 工作台
- 询盘
- 客户
- 供应商
- 产品与能力
- AI 复核
- 文件中心
- 报价与订单
- 系统设置

This is design planning only.

Do not implement navigation changes yet. Navigation changes require a separate approved implementation task with explicit allowed files, browser preview requirements, and rollback criteria.

## 8. Navigation Mapping From Current Modules

| Current module | Future IA destination | Notes |
|---|---|---|
| Dashboard | 工作台 | Should become workflow-first and answer today's attention needs |
| Customers | 客户 | Customer records, follow-up, relationship state, customer context |
| Inquiries | 询盘 | Inquiry intake, missing information, review queue, routing |
| Products | 产品与能力 | Product catalog and product context |
| Companies | 客户 / 供应商 | Companies may later merge into Customer/Supplier context depending on schema and business model |
| Capabilities | 产品与能力 | Manufacturing capability review, not production commitment |
| AI Drafts | AI 复核 | Draft-only review queue, risk, approval requirements, disabled actions |

Future IA should keep business workflows visible even when underlying data still comes from current module structures.

## 9. Dashboard IA

Future dashboard sections:

### A. 今日待处理

- Purpose: show the most urgent operator work for today
- Data source later: inquiry status, AI draft risk, customer follow-up, communication risk, document/attachment status
- Current possible static preview source: static local preview data
- Risk level: low if read-only/static
- Visible by default: yes

### B. 需要人工复核

- Purpose: show records that require human judgment
- Data source later: AI draft review summaries, communication review summaries, inquiry review summaries
- Current possible static preview source: display adapter preview data or static mock view models
- Risk level: low to medium depending on wording
- Visible by default: yes

### C. 新询盘

- Purpose: show newly received inquiries needing triage
- Data source later: inquiries API/read model
- Current possible static preview source: inquiry fallback preview rows
- Risk level: low if read-only
- Visible by default: yes

### D. 缺失信息

- Purpose: show inquiries or projects missing drawing, quantity, finish, tolerance, application, delivery, or contact information
- Data source later: inquiry review helper output or normalized inquiry fields
- Current possible static preview source: existing inquiry/AI draft fallback missing information
- Risk level: low if advisory only
- Visible by default: yes

### E. 客户跟进

- Purpose: show customers needing next follow-up
- Data source later: customer records, communication records, task/follow-up records
- Current possible static preview source: customer fallback next follow-up fields
- Risk level: low if read-only
- Visible by default: yes

### F. 沟通/附件风险

- Purpose: show communications or attachments with sensitive topics, unknown classification, or human-review needs
- Data source later: communication review summaries and attachment classification
- Current possible static preview source: static communication review preview cards
- Risk level: medium because wording can imply communication action if unclear
- Visible by default: yes, but with clear read-only label

### G. AI 草稿待审

- Purpose: show AI draft outputs requiring operator review
- Data source later: AI draft review summaries
- Current possible static preview source: existing AI draft fallback records and display adapter examples
- Risk level: medium because it is close to future sending/approval workflows
- Visible by default: yes, with `仅草稿` and `不可发送`

### H. 供应商等待

- Purpose: show supplier quote or supplier response waiting states
- Data source later: supplier RFQ, supplier quote, communication, and task records
- Current possible static preview source: none or static placeholder only
- Risk level: medium because supplier quote and capability language can imply commitment
- Visible by default: later, not first implementation

### I. 系统状态 / 只读边界

- Purpose: show current read-only status, fallback status, and integration boundaries
- Data source later: app state, API read model status, permissions
- Current possible static preview source: existing static status/fallback indicators
- Risk level: low
- Visible by default: yes, but compact

## 10. Work Queue Model

The main work queue pattern should reduce the need to scan multiple modules.

A work queue item should show:

- title
- related customer/company
- source/channel
- priority/risk
- missing info
- next recommended operator action
- status
- age/time

Recommended behavior:

- keep queue rows compact
- show the next review need clearly
- keep disabled actions informational
- open detail/review drawer for secondary data
- keep technical metadata collapsed by default

Work queues should eventually become the main operational surface for CBM Trade OS.

## 11. Detail / Review Drawer Model

The future right-side detail/review drawer should be context-sensitive.

It should show:

- selected record summary
- review summary
- warnings
- disabled capabilities
- technical details collapsed
- read-only safety details collapsed

The right panel should not always be a noisy static panel. It should respond to the selected work queue item or selected record.

Recommended drawer areas:

- Summary
- Review notes
- Risk and missing information
- Disabled capabilities
- Technical details
- Safety boundary

The drawer must never expose send, approve, reject, quote, PI, order, payment, production, shipment, upload, archive, or helper execution as active controls unless a later approved workflow explicitly permits it.

## 12. What Belongs on Dashboard vs Module Pages

| Information | Dashboard? | Module page? | Detail drawer? | Notes |
|---|---:|---:|---:|---|
| new inquiry | Yes | Yes | Yes | Dashboard should show newest or urgent items |
| customer record | Partial | Yes | Yes | Dashboard shows follow-up needs, module page shows full list |
| product catalog | No | Yes | Yes | Usually reference data, not dashboard priority |
| manufacturing capability | Partial | Yes | Yes | Dashboard only if relevant to inquiry/risk |
| AI draft review | Yes | Yes | Yes | Dashboard should show high-risk or pending drafts |
| communication review | Yes | Yes | Yes | Dashboard should show risk or waiting states |
| missing information | Yes | Yes | Yes | Core workflow signal |
| risk flags | Yes | Yes | Yes | Core workflow signal |
| API route/debug data | No | Secondary | Collapsed | Keep available but not visually primary |
| fallback preview status | Compact | Yes | Collapsed | Useful but should not dominate |
| disabled capabilities | Compact | Yes | Yes | Group as chips, not repeated paragraphs |
| long safety policy text | No | Secondary | Collapsed | Avoid repeating full safety copy in every card |

## 13. Safety Information Hierarchy

Safety information should be layered.

### Level 1: Compact Persistent Status

- 只读
- 需要人工复核
- 不可发送

### Level 2: Disabled Capability Chips

- 不可报价
- 不可生成 PI
- 不可下单

### Level 3: Expandable Safety Details

- no API write
- no schema write
- no production/payment/shipment actions

Avoid repeating full safety paragraphs in every card.

Safety must be visible, but it should not overpower the business queue.

## 14. Technical / Debug Information Hierarchy

Technical values should be available but secondary.

Examples:

- API route
- record count
- fallback source
- endpoint
- internal enum

Recommendation:

- show in collapsed `技术信息` area
- keep technical values in English where appropriate
- do not make technical details compete with business data
- keep API routes and internal keys unchanged

Technical/debug information helps developers and admins, but it is not the primary operator workflow.

## 15. Content Density Strategy

Recommended content density strategy:

- fewer visible paragraphs
- more structured cards
- compact badges
- summary first, details later
- table rows with expandable detail
- no long repeated safety warnings unless needed

The UI should prioritize scanability. Operators should be able to see the next thing to review without reading multiple paragraphs.

## 16. Future Page Structure

### A. 工作台

- Primary purpose: daily operating command surface
- Default view: work queues and review cards
- Main queue/table: 今日待处理, 需要人工复核, 缺失信息, 高风险草稿
- Right drawer content: selected queue item summary, warning, disabled capabilities, technical details
- Safety notes: compact global read-only state, expandable boundary details

### B. 询盘

- Primary purpose: inquiry intake and review
- Default view: inquiry queue grouped by new, missing information, waiting customer, high risk
- Main queue/table: inquiry rows with customer, source, business line, missing info, risk, age
- Right drawer content: inquiry summary, communication context, AI draft review, missing information, disabled actions
- Safety notes: no AI auto-processing, no sending, no quote/PI/order actions

### C. 客户

- Primary purpose: customer follow-up and relationship review
- Default view: customer list with next follow-up and status
- Main queue/table: customers needing follow-up, inactive customers, recent inquiry customers
- Right drawer content: customer summary, contact context, follow-up notes, related inquiries
- Safety notes: no import/create/edit/delete unless future approved workflow exists

### D. 产品与能力

- Primary purpose: product reference and manufacturing capability review
- Default view: product and capability reference lists
- Main queue/table: product catalog, capability line, equipment, public description
- Right drawer content: product/capability details, related inquiry context, limitations
- Safety notes: no confirmed production feasibility, price, delivery time, supplier commitment, quotation, PI, or order commitment

### E. AI 复核

- Primary purpose: AI draft and review-summary oversight
- Default view: AI drafts requiring human review
- Main queue/table: draft title, risk level, action boundary, approval required, warnings
- Right drawer content: review summary, sensitivity flags, disabled capabilities, recommended operator action
- Safety notes: draft-only, no auto-send, no auto-approve, no customer commitment

### F. 文件中心

- Primary purpose: future file/document review and archive coordination
- Default view: pending attachment/document review queue
- Main queue/table: files needing classification, archive decision, or document promotion
- Right drawer content: file summary, attachment type, related customer/inquiry/project, safety notes
- Safety notes: no upload/archive/promotion until separately implemented and approved

## 17. Current Admin UI Changes Not Recommended Yet

Do not do these immediately:

- do not immediately change navigation
- do not immediately remove existing read-only safety copy
- do not wire live helpers into UI
- do not redesign all sections at once
- do not add write buttons
- do not change API/schema

The existing UI is safe. The next step should be planning and one small static preview, not a broad rewrite.

## 18. Recommended First Implementation After IA / Design System

After this IA plan and a design system plan, implement only one static dashboard preview section:

- `工作台静态预览`

or:

- `今日待处理` static cards

Requirements:

- do not connect API
- do not add actions
- do not add helper execution
- do not add write buttons
- do not change schema
- do not imply business commitments

The first implementation should prove the IA pattern, not build a complete dashboard.

## 19. Relationship With Display Adapter Layer

Display adapters can later feed read-only view models into:

- AI 复核
- 沟通复核
- 询盘复核
- helper metadata panels

But IA should decide where those previews belong before UI wiring expands.

Display adapter outputs are view data, not workflow permission. They should not become buttons, commands, approvals, sends, quotations, PI generation, order creation, or task creation.

## 20. Future IA Validation Checklist

Future browser/UI review should check:

- can operator understand what to do first?
- are critical review items visible?
- are safety messages compact but clear?
- is technical info secondary?
- does layout reduce text overload?
- are disabled capabilities clearly non-clickable?
- no business commitments are implied

The review should confirm that the UI feels more workflow-first without weakening read-only safety.

## 21. Next Recommended UI Task

Recommended next task:

- Admin UI Design System Plan

Reason:

After IA, define visual and component rules before implementation.

The design system plan should define component hierarchy, dashboard card rules, work queue row rules, badge types, safety display rules, table density, drawer behavior, spacing, and Chinese wording standards.

## 22. What Should NOT Happen Next

Do not do next:

- no broad UI rewrite
- no React/Next migration
- no API changes
- no schema changes
- no write actions
- no live AI integration
- no Gmail/WhatsApp integration
- no quotation/PI/order/payment/shipment/production actions

The current static HTML/CSS/JS Admin UI should remain stable until a specific approved implementation task changes it.

## 23. Acceptance Criteria Before UI Implementation

Implementation should begin only when:

- IA plan is accepted
- design system plan is accepted
- exact first preview section is selected
- allowed files are explicit
- browser preview checklist is defined
- rollback plan is clear
- user explicitly approves implementation

Implementation should remain small, reversible, browser-previewed, and read-only until a separate approved phase changes the boundary.

## 24. Final Recommendation

Move next to Admin UI Design System Plan, then build a small static dashboard preview rather than continuing to patch the current module pages.

The IA target is clear: keep module pages available, but make the Admin UI feel like an operations workspace focused on today's work, risk, review, follow-up, and missing information.
