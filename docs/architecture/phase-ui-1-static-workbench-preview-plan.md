# Phase UI-1 Static Workbench Preview Plan

## 1. Title

Phase UI-1 Static Workbench Preview Plan

## 2. Purpose

This document plans the first static `工作台` preview before implementation.

The Workbench should become the future operator-first dashboard that answers:

- 今天有什么要处理？
- 哪些询盘需要看？
- 哪些 AI 草稿需要复核？
- 哪些客户需要跟进？
- 哪些信息缺失？
- 哪些风险需要注意？

This is planning only. It does not implement the Workbench preview and does not modify Admin UI files.

## 3. Current UI Starting Point

Current starting point:

- current Admin UI is localized and read-only
- current UI is module-centric
- existing Dashboard is still static/mock-oriented
- current sections are useful but too separated
- operators need a work queue, not only module pages

The current Dashboard proves layout primitives, but it does not yet behave like an operations dashboard. It shows generic foundation cards and static metrics rather than today's work, review needs, missing information, or risks.

## 4. Workbench Design Goal

Goal:

A calm Chinese workflow-first operations dashboard for daily foreign trade work.

It should prioritize:

- 待处理
- 需要复核
- 新询盘
- 缺失信息
- 客户跟进
- AI 草稿
- 风险提醒
- 只读安全状态

The Workbench should help operators decide what to review first without scanning all modules.

## 5. What the Workbench Is NOT

The Workbench is not:

- a write-action dashboard
- an approval execution page
- a quote/PI/order/payment/shipment page
- an AI sending panel
- a live integration page yet
- a replacement for schema/API planning

The first preview is only a safe static UI concept.

## 6. First Static Preview Principle

The first Workbench preview should use static local preview data only.

It must not:

- call APIs
- import service helpers
- execute display adapters
- write data
- send messages
- approve drafts
- create tasks
- create quotations
- generate PI
- create orders
- trigger payment/production/shipment

The preview should prove the workflow-first layout direction, not business execution.

## 7. Proposed Workbench Page Sections

### A. Header / 状态区

- Purpose: orient the operator and show the page is a static read-only preview
- Content: title `工作台`, short subtitle, compact chips such as `静态预览`, `只读`, `人工复核优先`
- Visible by default: yes
- Safety notes: must not include active business actions

### B. 今日概览 Cards

- Purpose: summarize today's review workload
- Content: static counts for new inquiries, review needs, missing info, follow-ups, risk alerts, AI drafts
- Visible by default: yes
- Safety notes: counts are static preview only and must not imply live API data

### C. 待处理队列

- Purpose: show a prioritized sample work queue
- Content: static work queue cards with customer/company, source, risk, missing information, recommended operator action, age, disabled capabilities
- Visible by default: yes
- Safety notes: queue items are not clickable workflow actions in the first preview

### D. 需要复核

- Purpose: highlight records that require human judgment
- Content: subset of queue items or compact cards with `需要人工复核`
- Visible by default: yes
- Safety notes: must not expose approve/reject buttons

### E. 缺失信息

- Purpose: highlight missing drawing/spec/quantity/contact/context information
- Content: static list of missing information categories
- Visible by default: yes
- Safety notes: advisory only; no automatic customer message

### F. 风险提醒

- Purpose: show sensitive topics or high-risk records
- Content: price mentioned, delivery question, supplier capability question, payment/complaint risk flags
- Visible by default: yes
- Safety notes: no confirmation of price, delivery, payment, production, quotation, PI, or order

### G. AI 草稿待审

- Purpose: show AI draft review needs
- Content: static draft review item with `仅草稿`, `不可发送`, `需要人工复核`
- Visible by default: yes
- Safety notes: no AI execution and no send action

### H. 右侧只读复核预览 / Detail Panel

- Purpose: show one selected/fixed sample review summary
- Content: summary, warnings, disabled capabilities, recommended operator action, collapsed technical detail placeholder
- Visible by default: yes on desktop
- Safety notes: preview panel must be display-only

### I. 技术 / Fallback 状态

- Purpose: show static/fallback context without dominating the UI
- Content: `静态预览数据`, `非实时数据`, `不调用 API`
- Visible by default: compact only
- Safety notes: technical details should remain secondary

## 8. Today Overview Cards

Proposed static cards:

| Card | Mock/static value | Subtitle | Allowed meaning | Must not imply |
|---|---:|---|---|---|
| 新询盘 | 5 | 今日待初步查看 | Static count only | Live API data unless clearly marked |
| 需要人工复核 | 8 | AI 草稿、沟通和询盘风险 | Human review preview count | Approval has happened |
| 缺失信息 | 6 | 图纸、数量、规格或交期信息缺失 | Missing information needs operator review | Automatic customer message |
| 今日跟进 | 4 | 客户或供应商等待回复 | Follow-up reminder preview | Task creation or message sending |
| 高风险提醒 | 3 | 价格、交期、付款或生产相关 | Risk awareness | Confirmed risk judgment or commitment |
| AI 草稿待审 | 2 | 仅草稿，发送前人工复核 | Draft review preview | AI output can be sent |

All values must be visibly static preview values.

## 9. Main Work Queue Model

Static queue item shape:

- title
- type
- related customer/company
- source/channel
- priority/risk
- missing info indicator
- recommended operator action
- status
- age/time label
- disabled capabilities

Queue items are read-only preview cards, not actionable workflow items yet.

The queue should make the operator understand what to review, not provide buttons to act.

## 10. Suggested Static Queue Examples

### 1. Peru Customer Inquiry - Missing Drawing/Spec

- Title: Peru facade inquiry needs drawing/spec confirmation
- Category: 新询盘 / 缺失信息
- Visible tags: `新询盘`, `缺失信息`, `只读预览`
- Risk/safety flags: missing drawing, missing profile spec, no quotation
- Operator should understand: collect missing drawing/spec before quotation review
- System must not do: send customer message, quote price, generate PI, create order

### 2. AI Draft Reply - Price Mentioned, Needs Review

- Title: AI draft mentions price-sensitive topic
- Category: AI 草稿待审
- Visible tags: `AI 草稿`, `需要人工复核`, `不可发送`
- Risk/safety flags: price-related, approval required
- Operator should understand: review draft manually before any customer communication
- System must not do: send, approve, confirm price, create quotation

### 3. Supplier Quote Attachment - Manual Review Needed

- Title: Supplier quote attachment requires manual review
- Category: 沟通/附件风险
- Visible tags: `附件`, `供应商报价`, `需要复核`
- Risk/safety flags: quote attachment, supplier-side information
- Operator should understand: review attachment content before using it
- System must not do: upload/archive/promote file, create task, create quotation

### 4. Customer Follow-up - Overdue Follow-up

- Title: Customer follow-up overdue
- Category: 客户跟进
- Visible tags: `客户跟进`, `即将超时`, `只读`
- Risk/safety flags: follow-up overdue
- Operator should understand: customer needs manual follow-up planning
- System must not do: auto-send email/WhatsApp, create task, confirm commitment

### 5. Manufacturing Capability Question - No Delivery Commitment

- Title: Manufacturing capability question needs careful wording
- Category: 风险提醒 / 产品与能力
- Visible tags: `制造能力`, `不可确认交期`, `不可确认生产`
- Risk/safety flags: production feasibility, delivery time
- Operator should understand: capability information is reference only
- System must not do: confirm feasibility, delivery time, supplier commitment, quotation, PI, order, production

## 11. Right Detail / Review Preview Concept

When a queue item is selected in the future, the right drawer may show:

- summary
- risk/warnings
- disabled capabilities
- recommended operator action
- technical details collapsed

The first static preview may show one fixed sample detail panel only.

Recommended fixed sample:

- selected item: AI draft reply with price-sensitive content
- warning: price mention requires manual review
- disabled capabilities: `不可发送`, `不可审批`, `不可报价`, `不可生成 PI`
- recommended operator action: manually review draft and confirm missing data before any response
- technical detail: static preview only, no API/helper execution

## 12. Safety Display in Workbench

Safety display pattern:

- compact global badge: `只读预览`
- section chips: `不发送` / `不审批` / `不生成报价` / `不生成 PI` / `不下单`
- expandable details later

Avoid:

- long repeated safety paragraphs in every card
- making disabled capabilities look clickable

Safety should be visible and calm. It should not dominate every work queue item.

## 13. Static Data Rules

Static preview data must be clearly labeled:

- 静态预览
- 仅用于界面验证
- 非实时数据
- 不代表真实客户/询盘状态

Static data must not imply:

- live customer state
- live inquiry state
- real supplier status
- real AI analysis result
- real approval state
- real quote/PI/order/payment/shipment/production state

## 14. Chinese Wording Rules

Recommended language:

- 今日待处理
- 需要人工复核
- 缺失信息
- 风险提醒
- 只读预览
- 不可发送
- 不可报价
- 不可生成 PI
- 不可下单

Avoid:

- 已确认报价
- 已确认交期
- 可直接发送
- 已批准
- 已下单
- 已安排生产
- 已发货

Chinese copy should be short, operational, and clearly human-review oriented.

## 15. Layout Direction for First Preview

Recommended direction:

- add a static Workbench preview area to existing `admin/ui-foundation`
- preferably as a new Dashboard/工作台 section later
- first implementation should be static and small
- avoid changing navigation globally unless explicitly approved
- avoid broad redesign of existing modules

The first preview should prove the workflow-first dashboard concept while preserving the current safe shell.

## 16. Candidate Implementation Locations

### Option A: Add Static Workbench Preview Inside Existing Dashboard Section

Pros:

- safest option
- no global navigation change
- uses existing `dashboard` rendering path
- easier rollback
- lower chance of breaking localized module pages

Cons:

- the sidebar may still say `Dashboard` until a separate navigation task changes it
- current dashboard shell may still carry old static/mock context

### Option B: Add New 工作台 Preview Section

Pros:

- better future IA alignment
- clearer Chinese operator label

Cons:

- touches navigation
- increases scope
- requires more browser review

### Option C: Replace Current Dashboard Content

Pros:

- visually direct
- removes some old static dashboard noise

Cons:

- higher risk than additive preview
- may hide old validation content before the new pattern is accepted

Preferred recommendation:

Option A first: add static Workbench preview inside existing Dashboard section or existing dashboard rendering path, because it is safer than changing navigation.

## 17. UI Component Plan for First Preview

Components needed:

- compact page header
- overview metric cards
- work queue cards
- disabled capability chips
- right sample detail panel
- fallback/static preview badge

These components can be local to the first preview implementation. They should not become a broad design-system rewrite in the first pass.

## 18. Styling Plan

Future implementation may need small CSS additions for:

- workbench grid
- queue cards
- compact metric cards
- right detail preview
- disabled chips
- responsive wrapping

This document must not implement CSS.

CSS changes should be limited to the static Workbench preview unless a later task explicitly expands scope.

## 19. Browser Preview Checklist for Future Implementation

Future implementation must check:

- no horizontal overflow
- Chinese labels readable
- no console errors caused by new section
- no active write/action buttons
- static preview labels visible
- disabled capabilities look informational
- layout still usable on normal desktop width

Browser preview should also confirm that the Workbench does not imply live business results or available business actions.

## 20. Future Implementation Allowed Files

For first implementation, recommend:

- `admin/ui-foundation/app.js`
- `admin/ui-foundation/styles.css`

Avoid:

- `admin/ui-foundation/index.html` unless separately approved
- API files
- schema files
- `package.json`
- `lib/services` files

## 21. Future Implementation Forbidden Changes

Forbidden changes:

- no API route changes
- no schema migrations
- no package changes
- no helper/adapter modifications
- no Gmail/WhatsApp/OpenAI
- no sending
- no approval execution
- no quotation/PI/order/payment/shipment/production

The first preview must remain static, read-only, and local to Admin UI.

## 22. Rollback Plan

Rollback should be simple:

- keep implementation in one commit
- static UI only
- no data changes
- no API/schema rollback needed
- revert single commit if browser preview fails

No database, API, helper, or business workflow rollback should be required.

## 23. First Implementation Acceptance Criteria

Future implementation can be accepted only if:

- static preview appears
- no active business action controls
- no helper execution
- no API changes
- npm test passes if run
- browser preview passes
- horizontal overflow absent
- Chinese text natural
- safety labels clear

If browser preview shows clutter, overflow, misleading wording, or action-like disabled chips, fix within the same small implementation scope before commit.

## 24. Recommended Next Task

Recommended next task:

- Static Workbench Preview Plan Readiness Review

Then:

- Static Workbench Preview Implementation

The readiness review should validate that Option A is still the safest first implementation path.

## 25. Final Recommendation

Proceed with review of this plan before implementation.

Do not directly redesign the full Admin UI.

The first implementation should be a small, static, read-only Workbench preview inside the existing Dashboard rendering path. It should prove workflow-first layout without changing navigation, API, schema, helper execution, or business workflows.
