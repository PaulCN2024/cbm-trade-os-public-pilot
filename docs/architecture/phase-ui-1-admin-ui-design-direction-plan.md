# Phase UI-1 Admin UI Design Direction Plan

## 1. Title

Phase UI-1 Admin UI Design Direction Plan

## 2. Purpose

This document defines the future design direction for the CBM Trade OS Admin UI before any broad UI redesign implementation.

The goal is to move from a safe localized validation shell toward a calmer, workflow-first, Chinese B2B SaaS admin dashboard without changing API behavior, schema, business logic, helper execution, or approval boundaries.

This is planning only. It does not implement UI changes.

## 3. Current UI Status

Current status:

- localized read-only Admin UI exists
- localized sections include customers, inquiries, products, companies, manufacturing capabilities, AI drafts, and common review panel metadata labels
- display adapter preview panel exists
- registry metadata read-only preview is visible in the AI Drafts area
- browser preview workflow has been used for recent UI safety checks
- current UI is safe but cluttered
- current UI still feels like a static internal validation shell, not a mature SaaS dashboard

The Admin UI has done useful safety groundwork. It now needs product design direction before more UI implementation is added.

## 4. Core UI Problem

The current UI is trying to be three things at once:

- safety checkpoint
- static prototype
- admin dashboard shell

This makes the interface safe but visually noisy.

The safety language is correct, but it appears too often and competes with business data. The static prototype elements prove layout and states, but they also make the product feel unfinished. The dashboard shell gives structure, but it does not yet answer the operator's most important question: what needs attention today?

## 5. Product Design Goal

CBM Trade OS Admin should become a calm, Chinese, B2B SaaS-style foreign trade operations dashboard focused on:

- 今日待处理
- 需要人工复核
- 新询盘
- 缺失信息
- AI 草稿待审
- 客户跟进
- 供应商等待
- 文件/附件待处理
- 风险提醒

The product should feel practical and operational. It should help a Chinese-speaking trade operator decide what to review, what to follow up, and what needs human judgment.

## 6. Workflow-first Principle

The Admin UI should gradually shift from module-centric to workflow-centric.

Current module-centric examples:

- Customers
- Inquiries
- Products
- Companies
- Capabilities
- AI Drafts

Future workflow-centric examples:

- 今日待处理
- 待复核
- 待跟进
- 询盘处理
- 客户推进
- 供应商协同
- 文件归档
- 风险与审批

Module pages can still exist, but the first dashboard experience should prioritize work queues and review needs rather than database object categories.

## 7. Information Architecture Direction

Recommended future top-level structure:

- 工作台
- 询盘
- 客户
- 供应商
- 产品与能力
- AI 复核
- 文件中心
- 报价与订单
- 系统设置

Do not implement this navigation yet.

This is design direction only. A separate Admin UI Information Architecture Plan should decide exact labels, grouping, order, section behavior, and migration from the current sidebar.

## 8. Dashboard Direction

The future dashboard should answer:

- 今天有哪些询盘要看？
- 哪些 AI 草稿需要复核？
- 哪些客户需要跟进？
- 哪些资料缺失？
- 哪些沟通/附件有风险？
- 哪些供应商报价等待中？
- 哪些事项即将超时？

The dashboard should not primarily show generic totals. Totals are useful, but the first screen should emphasize action-oriented review queues.

Recommended dashboard emphasis:

- today's work
- overdue or near-deadline items
- missing information
- high-risk drafts
- follow-up reminders
- supplier waiting states
- file and attachment review needs
- read-only safety state

## 9. Layout Direction

Recommended layout direction:

- left sidebar
- compact top header
- dashboard summary cards
- primary work queue
- right-side detail/review drawer
- collapsible safety details
- fewer always-visible long text blocks

The top header should explain the current page, not compete with the work queue. The right-side review area should become a detail drawer or contextual review panel, not an always-heavy column. Safety information should remain visible, but detailed policy text should be expandable or secondary.

## 10. Visual Hierarchy Direction

Visual hierarchy should follow these priorities:

- business data should be primary
- safety status should be visible but compact
- technical/debug details should be secondary
- API route/status details should be collapsible or lower priority
- disabled capabilities should be grouped, not scattered

Current issues to address later:

- repeated cards have similar visual weight
- mock buttons appear too prominently
- review panel content competes with table content
- long safety copy appears in multiple places
- status/debug text is often as visible as business records

The future UI should make the main work item obvious within a few seconds.

## 11. Component Direction

Future component groups:

- page header
- metric card
- work queue card
- status badge
- risk badge
- disabled capability chip
- review summary panel
- read-only detail drawer
- compact table
- empty/loading/error state
- fallback preview indicator
- safety boundary disclosure

Component usage should be disciplined:

- metric cards summarize work, not decoration
- badges should communicate status or risk, not repeat full policy text
- tables should show primary record fields only
- detail drawers should hold secondary metadata and review notes
- disabled capabilities should look informational, never clickable
- fallback preview indicators should be visible but not dominant

## 12. Text Density Reduction Strategy

Recommended strategy:

- replace repeated long safety paragraphs with short badges
- move detailed safety policy into expandable section
- shorten fallback/debug text
- keep API route values available but secondary
- avoid repeating "no send / no quote / no PI / no order" in every card if a global safety banner exists

Safety copy should be strong, but not everywhere at full length.

Preferred pattern:

- global compact safety banner
- section-level read-only badge
- disabled capability chips
- expandable safety details for exact forbidden actions

## 13. Chinese Operator Experience

Chinese operator-facing UI should be Chinese-first.

Rules:

- operator-facing UI should use Chinese
- internal keys stay English
- route/API values stay English
- channel/brand names such as Email, WhatsApp, API can remain English
- Chinese wording must avoid accidental business commitment

Avoid wording that implies confirmed:

- price
- delivery
- payment
- production feasibility
- supplier commitment
- quotation
- PI
- order
- shipment
- approval

Recommended tone:

- concise
- operational
- business-like
- direct
- calm

## 14. Read-only Safety Display Strategy

Recommended read-only safety display:

- persistent compact read-only badge
- disabled capability chips
- expandable safety detail
- no active send/approve/reject/quote/PI/order buttons
- no wording that implies price/delivery/payment/production/shipment confirmation

Safety must remain visible, but it should become structured UI rather than repeated prose.

Example display model:

- Status: `只读`
- Boundary: `需要人工复核`
- Disabled capabilities: `不可发送`, `不可审批`, `不可生成报价`, `不可生成 PI`, `不可创建订单`
- Detail: expandable safety explanation

## 15. What Should Be Kept From Current UI

Keep:

- localized Chinese section labels
- read-only boundaries
- browser preview workflow
- fallback preview labeling
- registry metadata preview concept
- safety badge concept
- table + review panel concept, but redesigned later

These are valuable foundations. The problem is not that they exist; the problem is that they need clearer hierarchy and workflow grouping.

## 16. What Should Be Redesigned Later

Redesign later:

- dashboard overview
- topbar mock actions
- repeated safety copy
- right review panel density
- sidebar/navigation structure
- table column density
- state cards at bottom of sections
- static/debug-heavy wording
- global shell labels

These should not be changed randomly. Each redesign should be scoped, reviewed, browser-previewed, and kept read-only unless a separate approved task expands the boundary.

## 17. Design Phases

Recommended staged phases:

### Phase UI-1: Design Direction and Information Architecture

Define the target experience, workflow grouping, dashboard priorities, and navigation model.

### Phase UI-2: Design System and Component Rules

Define components, density rules, badge rules, safety display, table/detail patterns, spacing, typography, and responsive behavior.

### Phase UI-3: Static Dashboard Redesign Plan

Plan the first dashboard redesign in documentation before implementation.

### Phase UI-4: One Static Dashboard Preview Implementation

Implement one small static read-only dashboard preview only after the design direction, information architecture, and component rules are accepted.

### Phase UI-5: Browser Preview and Polish

Validate Chinese readability, layout, overflow, safety boundaries, and disabled capabilities in a browser.

### Phase UI-6: Expand Redesign to Key Read-only Sections

Apply the accepted pattern section by section. Do not redesign the whole Admin UI in one step.

## 18. First Recommended UI Task After This Document

Recommended next task:

- Admin UI Information Architecture Plan

Reason:

Before redesigning visuals, define what the operator should see first and how workflows should be grouped.

The next task should decide:

- future sidebar grouping
- dashboard work queues
- what belongs in 工作台
- what belongs in 询盘 / 客户 / 供应商 / AI 复核
- what should remain technical/debug detail
- which first static dashboard preview is safest

## 19. What Should NOT Happen Next

Do not do next:

- no broad UI rewrite
- no React/Next migration
- no API changes
- no schema changes
- no write actions
- no live AI integration
- no Gmail/WhatsApp integration
- no quotation/PI/order/payment/shipment/production actions

The current stack should remain static HTML/CSS/JS unless a separate approved architecture decision changes that.

## 20. Acceptance Criteria Before UI Implementation

Implementation should begin only when:

- design direction is accepted
- information architecture is accepted
- exact section is selected
- allowed files are explicit
- no write/API/schema changes are confirmed
- browser preview checklist is defined
- rollback plan is clear

Implementation tasks should remain small, reversible, and browser-validated.

## 21. Final Recommendation

Do not keep patching the current UI randomly.

Move next to Admin UI Information Architecture Plan, then Design System Plan, then one small static dashboard preview.

This path keeps the product moving toward a real Chinese SaaS admin dashboard without weakening CBM Trade OS safety boundaries.
