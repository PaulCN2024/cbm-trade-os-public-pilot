# Phase UI-3 AI-first Admin UI Redesign Blueprint

## Purpose

The current Admin UI is safe and functionally useful, but visually and structurally it still resembles a static admin/CRM page. The next UI direction should be AI-first, workflow-first, and human-in-the-loop.

The purpose of this blueprint is to define the target Admin UI direction before implementation. It should help Paul review the intended product shape before Codex changes UI code.

This document is planning only. It does not modify UI code, API routes, schema, package files, environment variables, production data, or business execution.

## Design Diagnosis

Current strengths:

- read-only boundaries are clear
- Chinese operator wording is much better than the earlier English prototype
- admin-read production surfaces are deployed and auth-gated
- fallback/demo data keeps the internal trial usable
- disabled controls are consistently non-executable
- quotation/pre-quotation safety wording is conservative

Current problems:

- too much static text is visible at once
- too many cards share similar visual weight
- the page still feels like a traditional admin panel rather than an AI-driven operating system
- AI assistance is described in text, but not felt as a persistent product surface
- there is no persistent AI Copilot panel
- there is no workflow canvas that connects inquiry, customer, file, supplier, AI review, and quotation readiness
- there is no AI reasoning or explainability layer beside each recommendation
- there is no strong command-center feeling
- read-only safety is present, but it is not visually integrated into an AI workflow
- modules still feel like isolated pages instead of one connected foreign-trade business process

The key design shift is not simply making the current cards prettier. The UI needs to feel like a human-reviewed AI operations cockpit for foreign trade.

## Target Product Metaphor

CBM Trade OS should feel like:

- AI 外贸业务驾驶舱
- AI Copilot command center
- Human-in-the-loop workflow cockpit
- Inquiry-to-quotation intelligence board
- A modern SaaS operating system for real foreign-trade workflows

It should not feel like:

- ordinary CRM
- static admin dashboard
- document list
- text-heavy report
- generic module CRUD shell

The mental model should be:

```text
Business data enters the system
-> AI reads, summarizes, flags risk, and suggests next steps
-> human operator reviews and decides
-> future approved workflows may stage actions
-> execution stays blocked until explicit approval architecture exists
```

## New Layout Architecture

The recommended target is a three-zone layout.

### A. Left Zone: Workflow Navigation

Purpose:

- keep orientation stable
- show the business workflow order
- make modules feel like stages in one process

Suggested navigation groups:

- 工作台
- 询盘
- 客户
- AI 复核
- 供应商
- 文件
- 报价前复核
- 报价元数据
- future execution modules
  - 订单
  - 生产
  - 发货
  - 售后
  - 设置

Design direction:

- keep left nav compact
- group active read-only modules separately from future locked modules
- show small status hints, such as `只读`, `需登录`, or `稍后开放`
- do not add action buttons inside the nav

### B. Center Zone: Business Workflow Canvas

Purpose:

- make the main area feel like a live business canvas, not a static report
- show the selected business object and related workflow state
- connect queues, timeline, status cards, risks, and missing data

Center zone should contain:

- active business object
- work queue cards
- inquiry-to-quotation workflow timeline
- status/risk cards
- read-only detail cards
- source state, such as live admin-read, auth-gated, or static fallback

Default canvas questions:

- What needs human attention?
- What is missing?
- Which supplier/customer/file is involved?
- What did AI infer?
- Why is the next step blocked?
- What cannot be done yet?

### C. Right Zone: AI Copilot / Review Panel

Purpose:

- make AI assistance persistent
- explain the recommendation
- show safety and human-review boundaries
- separate AI reasoning from raw business records

Right zone should contain:

- AI sees
- AI suggests
- Risk detected
- Missing info
- Human next step
- Disabled actions
- Confidence / safety
- Why this recommendation

Current phase rule:

- panel is read-only
- no send/apply/approve buttons
- no helper execution
- no real AI calls
- no business action

## AI Copilot Panel Design

The right-side AI Copilot panel should become a persistent review surface.

Required sections:

### AI 摘要

Short business summary in Chinese.

Example:

```text
客户询盘涉及幕墙铝型材和五金配件，但缺少图纸、规格和目标数量。当前只适合补充资料，不适合进入报价判断。
```

### 风险提示

Risk chips and short explanations.

Examples:

- 高风险: 涉及价格或交期
- 信息不足: 缺少图纸
- 供应商待确认: 能力和交期未确认
- 文件待核对: CAD/PDF 未人工查看

### 缺失信息

Show missing fields as chips or rows:

- 图纸
- 产品规格
- 目标数量
- 表面处理
- 包装要求
- 交期目标
- 供应商有效期

### 建议下一步

One operator-facing recommendation.

Example:

```text
先补齐图纸、规格和目标数量，再由人工决定是否进入供应商询价或报价准备。
```

### 需要人工确认

List review gates:

- 客户需求是否清楚
- 文件是否可读
- 供应商能力是否匹配
- 是否允许进入报价前复核
- 是否存在商业承诺风险

### 暂不执行的动作

Disabled capability list:

- 不可发送
- 不可审批
- 不可报价
- 不可生成 PI
- 不可确认订单
- 不可触发付款 / 生产 / 发货

These must be informational chips, not clickable controls.

### 数据来源

Show source state:

- admin-read live data
- auth-gated, showing fallback
- static demo preview
- manually entered future state

### 置信度 / 可靠性提示

Show confidence as an explainable hint, not as authority.

Examples:

- 高: 来源字段完整，风险低
- 中: 需求较清楚，但仍缺少供应商确认
- 低: 关键信息缺失，只能作为人工复核提示

Confidence must never imply approval or execution permission.

## Workflow Canvas Design

For inquiry-to-quotation flow, the center canvas should represent:

```text
询盘收到
-> 客户资料复核
-> 文件核对
-> 供应商/制造能力匹配
-> AI 复核生成
-> 报价前准备度复核
-> 正式报价元数据查看
-> Future: quote generation / approval / send
```

Visual forms:

- horizontal timeline on desktop
- vertical timeline on narrower widths
- stepper with status dots
- status cards below each step
- risk chips per step
- missing info chips per step

Each step should show:

- status
- owner or source
- risk
- missing information
- whether the step is read-only or future-locked

Example step labels:

| Step | UI label | Status examples |
| --- | --- | --- |
| 1 | 询盘收到 | 新询盘 / 待查看 |
| 2 | 客户复核 | 已有关联客户 / 资料待补 |
| 3 | 文件核对 | CAD 待查看 / 截图已归类 |
| 4 | 供应商匹配 | 能力可参考 / 待确认 |
| 5 | AI 复核 | 需人工确认 / 风险提示 |
| 6 | 报价前复核 | 缺失信息 / 可进入人工准备 |
| 7 | 报价元数据 | 只读记录 / 不生成报价 |
| 8 | Future execution | 锁定 / 需审批流程 |

## Work Queue Design

The UI should replace many text blocks with queue surfaces.

Recommended queues:

- 待人工复核
- 信息待补充
- 供应商待确认
- 文件待核对
- 报价前复核草稿
- 高风险提示

Each queue item should show:

- object type
- customer or product
- status
- risk
- next step
- source state

Queue item shape:

| Field | Purpose |
| --- | --- |
| `object_type` | 询盘, 客户, 文件, AI 草稿, 供应商, 报价前复核 |
| `title` | Human-readable task title |
| `customer_or_product` | Main business context |
| `status` | Current read-only state |
| `risk` | Low, medium, high, blocked |
| `next_step` | Suggested human step |
| `source_state` | admin-read, fallback, auth-gated, static |
| `disabled_capabilities` | What cannot happen |

Do not use active buttons in the current phase.

## AI Explainability Design

Every AI recommendation should show:

- suggestion
- reason
- confidence
- source data used
- what is missing
- human decision required
- forbidden actions

No black-box AI output.

Recommended display pattern:

```text
AI 建议
  先补齐图纸和数量，再进入供应商询价准备。

为什么
  当前询盘文字提到门窗和五金，但没有可报价的规格、数量和交期目标。

置信度
  中。客户需求方向明确，但报价条件不足。

使用的数据
  询盘原文、客户资料、文件元数据、供应商能力标签。

缺失
  图纸、规格、数量、表面处理、包装要求。

人工决定
  是否联系客户补充资料。

暂不执行
  不发送、不报价、不生成 PI、不确认订单。
```

## Status / Risk Visual System

Status chips should have distinct meaning and consistent colors.

| Chip | Meaning | Visual direction |
| --- | --- | --- |
| 只读 | view-only surface | blue or neutral outline |
| fallback | static fallback or preview data | slate/amber neutral |
| 需登录 | auth-gated admin-read data | amber |
| 人工复核 | human review required | blue/amber |
| 信息待补充 | missing information | amber |
| 供应商待确认 | supplier confirmation needed | teal/amber |
| 文件待确认 | file metadata/manual review needed | indigo/amber |
| 高风险 | high risk business content | red |
| 中风险 | medium risk | amber |
| 低风险 | low risk | green |
| 稍后开放 | future module | neutral dashed |
| 禁用 | disabled capability | gray, non-clickable |

Rules:

- risk chips must not look like action buttons
- disabled chips must be visibly non-clickable
- `低风险` must not imply executable
- `只读` should be visible but not repeated as a long paragraph everywhere
- technical values like `GET /api/...` may appear in secondary details, not primary workflow cards

## Module Redesign Concepts

### 工作台

AI-first version:

- AI command center
- daily risk queue
- missing info queue
- supplier confirmation queue
- file review queue
- pre-quotation readiness queue
- persistent right-side AI Copilot summary

Primary question:

```text
今天哪些外贸事项需要我人工判断？
```

### 询盘

AI-first version:

- inquiry intelligence card
- AI extracted requirements
- missing fields
- next human question
- workflow timeline from inquiry to quotation readiness

Primary question:

```text
这个询盘现在缺什么，下一步该问客户什么？
```

### 客户

AI-first version:

- customer intelligence profile
- recent inquiries
- product interest
- risk/history notes
- follow-up context
- recommended human next step

Primary question:

```text
这个客户最近关心什么，是否需要跟进？
```

### AI 复核

AI-first version:

- AI review inbox
- confidence/risk/explanation
- human review queue
- draft-only reminder
- no send or apply action

Primary question:

```text
哪些 AI 输出需要我人工确认？
```

### 供应商 / 制造能力

AI-first version:

- capability matching board
- supplier fit score as read-only
- confirmation needed chips
- evidence fields
- no production feasibility commitment

Primary question:

```text
哪个供应商或制造能力可能匹配，但仍需要人工确认？
```

### 文件中心

AI-first version:

- file intelligence inbox
- metadata only
- document status
- missing/unclear file signals
- linked business object
- no file content, storage path, signed URL, upload, download, parse, OCR, or delete behavior

Primary question:

```text
哪些文件需要人工核对，是否能支持报价前复核？
```

### 报价前复核

AI-first version:

- readiness cockpit
- missing data
- supplier readiness
- document readiness
- risk summary
- no price calculation

Primary question:

```text
现在是否具备人工准备报价的条件？
```

### 正式报价元数据

AI-first version:

- quotation metadata archive
- draft/read-only status
- safe summary only
- no item-level hidden internal fields
- no send/generate action

Primary question:

```text
已有报价记录的安全摘要是什么？
```

### Future Modules

Order, production, shipping, after-sales, and settings should remain locked workflow stages until approved.

Future module display should show:

- stage name
- why it is locked
- what data model is missing
- what approval/audit gate is required
- no active controls

## Dynamic-but-safe Interactions

Allowed in future UI-only rounds:

- hover cards
- local expand/collapse
- safe tabs within a module if no business action
- read-only filters
- local sort
- skeleton loading
- timeline expansion
- AI explanation drawer
- local selection that changes read-only detail panel

Forbidden in current phase:

- send
- approve/reject
- generate quote
- calculate price
- create PI
- confirm order
- upload/download file
- delete file
- parse file
- OCR
- external integrations
- hidden action on page load
- helper execution without explicit approval
- backend write

## Visual References In Words

The target look and feel should combine:

- Linear-like command center density
- Notion-like calm document clarity
- Retool-like admin efficiency
- Salesforce/HubSpot-like business pipeline clarity
- Copilot-like right side assistant panel
- Intercom-like inbox queue
- modern SaaS polish, but not flashy

Do not copy brand assets, colors, logos, or proprietary UI. Use these as descriptive references only.

## Implementation Constraints

Because the current stack is static HTML/CSS/JS:

- implement with existing files first
- no framework migration yet
- no package install
- no chart library
- use CSS grids, flex, chips, timelines, cards, and simple local state
- use existing data and fallback models
- preserve tests and build
- keep Vercel function count unchanged
- preserve route IDs and `data-section` values unless a separate migration plan approves changes
- preserve admin-read endpoint strings
- preserve static fallback

## Success Criteria

The next UI implementation is successful if:

- user immediately understands AI is assisting
- less text-wall feeling
- visible work queues
- visible AI Copilot panel
- visible workflow timeline
- clear human-in-the-loop model
- AI suggestions explain why
- disabled actions are obvious but not visually overwhelming
- no active business controls
- no horizontal overflow
- all admin-read/fallback behavior preserved
- tests and build pass
- browser smoke confirms no enabled preview controls

## Non-goals

- no write actions
- no backend changes
- no schema changes
- no real AI calls
- no quote generation
- no PI generation
- no order confirmation
- no payment, production, or shipment execution
- no external channel integration
- no binary design assets

## Progress Report

- Full product vision: 36% -> 36%
- Internal MVP / foundation: 98% -> 98%
- AI-first Admin UI Redesign Blueprint: 0% -> 100%
