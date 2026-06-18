# Phase UI-1 Admin UI Design System Plan

## 1. Title

Phase UI-1 Admin UI Design System Plan

## 2. Purpose

This document defines the future design system for the CBM Trade OS Admin UI before implementation.

The design system should guide future layout, components, visual hierarchy, Chinese operator wording, read-only safety display, static preview behavior, and browser validation. It does not implement UI changes, CSS changes, API changes, schema changes, helper execution, or business workflows.

## 3. Current UI Diagnosis

The current Admin UI is safe but cluttered.

Current issues:

- too many repeated text blocks
- components have similar visual weight
- right review panel is heavy
- dashboard does not yet feel workflow-first
- current UI is useful for validation but not yet productized
- safety copy is correct but repeated too often
- mock/disabled actions make the shell feel unfinished
- technical/debug information often competes with business data

The existing UI has done its job as a safe localized validation shell. The next step is to define a design system before implementing more UI.

## 4. Design System Goal

Target:

A calm, Chinese, B2B SaaS admin interface for foreign trade operations.

It should support:

- fast review
- clear work queues
- human approval
- AI-assisted summaries
- read-only safety
- future controlled workflows

The system should help operators understand what needs attention, what needs human review, what is blocked, and what cannot be acted on yet.

## 5. Design Principles

Core principles:

- workflow-first
- Chinese operator-first
- business data first
- safety visible but compact
- technical details secondary
- progressive disclosure
- no misleading actions
- no business commitment wording
- consistent density and spacing

Design decisions should be judged against these principles before implementation.

## 6. Layout System

Preferred layout:

- left navigation
- compact top header
- main content area
- optional right detail/review drawer
- summary cards above work queue
- table/list in main area
- collapsible technical/safety details

Recommended proportions:

- sidebar width: stable and compact, around the current width unless a later navigation plan changes it
- content max width: allow dense internal admin work, but avoid unlimited line length
- right drawer width: wide enough for review summaries, not so wide that it competes with the main queue
- card grid behavior: 2 to 4 cards on desktop depending on priority; stack or wrap on smaller widths
- desktop-first layout: internal admin work should optimize for laptop/desktop first
- responsive fallback: drawer can stack below content on narrow screens later

Do not implement CSS in this document.

## 7. Page Structure Template

Standard page structure:

### A. Page Header

Shows page title, short purpose, and current read-only or environment status.

### B. Status / Environment Chip

Shows whether the page is live, static preview, fallback preview, or read-only.

### C. Primary Summary Cards

Shows the most important status or queue counts. Cards should be few and purposeful.

### D. Main Work Queue or Table

Shows the records the operator should review first.

### E. Right Detail / Review Drawer

Shows selected record details, review summary, warnings, disabled capabilities, and collapsed technical information.

### F. Collapsed Technical Details

Shows API route, endpoint, record count, fallback source, internal keys, or enum values only when needed.

### G. Empty / Loading / Error / Fallback States

Shows clear states without long repeated paragraphs.

## 8. Dashboard Structure

Future dashboard blocks:

| Block | Purpose | Component type | Default state | Risk level | Possible static preview first |
|---|---|---|---|---|---|
| 今日待处理 | Show today's most important operator work | work queue card group | visible | low | yes |
| 需要人工复核 | Show items requiring human judgment | review queue | visible | low/medium | yes |
| 新询盘 | Show newly received inquiries | queue/table | visible | low | yes |
| 缺失信息 | Show records missing required details | warning queue | visible | low | yes |
| 客户跟进 | Show customers requiring follow-up | queue/card list | visible | low | yes |
| AI 草稿待审 | Show AI drafts waiting for review | review queue | visible | medium | yes, static only |
| 沟通/附件风险 | Show risky communication or attachment signals | warning/review list | visible or collapsed | medium | later |
| 供应商等待 | Show supplier quote/response waiting states | queue list | collapsed initially | medium | later |
| 系统状态 | Show read-only/fallback/integration state | compact status card | visible but compact | low | yes |

The first dashboard preview should not attempt to show every block at once. Start with the smallest useful set.

## 9. Component System

### App Shell

- Purpose: provide global layout and navigation.
- Use when: every Admin UI page.
- Do not use when: creating isolated prototypes outside the Admin UI.
- Safety notes: shell must not add global write actions.

### Sidebar Item

- Purpose: navigate to major workflow or module areas.
- Use when: moving between top-level sections.
- Do not use when: representing record actions.
- Safety notes: no send/approve/write behavior.

### Topbar Status Chip

- Purpose: show environment, read-only, static preview, or fallback state.
- Use when: page state needs compact visibility.
- Do not use when: long policy text is needed.
- Safety notes: should not look clickable unless it really opens a safe detail view.

### Page Header

- Purpose: orient the operator.
- Use when: each top-level page or major section.
- Do not use when: repeated inside every card.
- Safety notes: avoid business commitment wording.

### Metric Card

- Purpose: summarize a key operational count.
- Use when: count supports decision-making.
- Do not use when: count is decorative or stale.
- Safety notes: avoid implying completion or approval.

### Work Queue Card

- Purpose: show an item requiring review or follow-up.
- Use when: operator needs to prioritize work.
- Do not use when: data is only technical/debug detail.
- Safety notes: include disabled capabilities when action is not available.

### Record Table

- Purpose: scan larger record sets.
- Use when: list density matters.
- Do not use when: a small queue would be clearer.
- Safety notes: no inline write actions until approved.

### Review Drawer

- Purpose: show selected record detail and review state.
- Use when: record has warnings, summaries, disabled capabilities, or technical details.
- Do not use when: no record is selected, unless showing an empty/guide state.
- Safety notes: no send/approve/quote/PI/order buttons unless future workflow is explicitly approved.

### Safety Banner

- Purpose: show global safety boundary.
- Use when: page or phase has broad read-only constraints.
- Do not use when: repeating full policy inside every card.
- Safety notes: keep compact and consistent.

### Safety Badge

- Purpose: show short safety state.
- Use when: compact boundary is enough.
- Do not use when: a full explanation is required.
- Safety notes: examples include `只读`, `需要复核`, `不可发送`.

### Disabled Capability Chip

- Purpose: show unavailable actions as information.
- Use when: an operator might otherwise expect an action.
- Do not use when: it could be mistaken for a toggle or button.
- Safety notes: never clickable.

### Warning Row

- Purpose: show risk, missing information, blocked state, or review need.
- Use when: operator must notice a risk.
- Do not use when: normal status is enough.
- Safety notes: warning text must not create commitment.

### Technical Detail Row

- Purpose: show route, endpoint, fallback source, record count, or internal key.
- Use when: debug/admin information is useful.
- Do not use when: it competes with business content.
- Safety notes: keep collapsed or secondary.

### Empty State

- Purpose: explain no records available.
- Use when: record list is empty.
- Do not use when: data is still loading.
- Safety notes: do not invite create actions unless create flow exists and is approved.

### Loading State

- Purpose: show waiting state.
- Use when: data is being requested.
- Do not use when: fallback/static preview is already rendered.
- Safety notes: keep short.

### Error State

- Purpose: show load failure clearly.
- Use when: API/read request fails.
- Do not use when: expected static fallback is working.
- Safety notes: do not suggest risky actions to fix.

### Fallback Preview Indicator

- Purpose: show static/local fallback source.
- Use when: live data is unavailable.
- Do not use when: data is truly live.
- Safety notes: visible but not dominant.

## 10. Card System

Card categories:

- metric cards
- work queue cards
- record summary cards
- review cards
- safety cards

Rules:

- cards should not all have equal visual weight
- only primary cards should use strong emphasis
- secondary cards should use lighter treatment
- safety cards should be compact unless expanded
- review cards should be tied to selected records where possible

Avoid adding more cards to solve every content problem. Use cards when grouping helps scanning.

## 11. Table System

Table rules:

- default compact table
- fewer columns by default
- row click selects detail drawer later
- long notes hidden or truncated
- technical values secondary
- no inline write actions until approved

Tables should show primary business fields. Notes, debug details, disabled actions, and long safety text should move into detail drawers or collapsed areas.

## 12. Review Drawer System

The review drawer should later replace the always-noisy right panel pattern.

It should show:

- selected record detail
- warnings
- disabled capabilities
- review summary
- technical details collapsed
- safety policy collapsed

It should not show:

- send buttons
- approve/reject buttons
- quote buttons
- PI/order buttons
- payment/production/shipment buttons

No send/approve/quote/PI/order buttons should appear unless a future approved workflow explicitly permits them.

## 13. Badge System

Badge categories:

### Status

- Tone: neutral or success
- Meaning: current record/page state
- Examples: `待处理`, `已加载`, `草稿`

### Risk

- Tone: warning or danger
- Meaning: requires attention
- Examples: `高风险`, `缺失信息`, `需要人工判断`

### Review

- Tone: warning/info
- Meaning: requires human review
- Examples: `需要复核`, `人工复核优先`

### Source / Channel

- Tone: neutral/info
- Meaning: source of data or channel
- Examples: `API`, `Email`, `WhatsApp`, `静态预览`

### Disabled Capability

- Tone: disabled/neutral
- Meaning: unavailable action
- Examples: `不可发送`, `不可审批`, `不可生成 PI`

### Fallback / Static Preview

- Tone: preview/info
- Meaning: data is not live
- Examples: `仅预览`, `静态预览数据`, `本地预览`

### Read-only

- Tone: stable/neutral
- Meaning: no write actions
- Examples: `只读`, `不可编辑`, `未连接写入`

Badges must be meaningful. Do not use many badges with identical emphasis.

## 14. Disabled Capability Chip System

Disabled capabilities are informational chips, not controls.

Examples:

- 不可发送
- 不可审批
- 不可创建任务
- 不可报价
- 不可生成 PI
- 不可下单
- 不可触发付款
- 不可生产
- 不可发货

Never render these as buttons or toggles.

They should communicate system boundaries, not invite interaction.

## 15. Safety Display System

Safety display should use three layers.

### Level 1: Compact Global Safety Status

- 只读
- 人工复核优先

### Level 2: Contextual Disabled Capability Chips

Examples:

- 不可发送
- 不可报价
- 不可生成 PI
- 不可下单

### Level 3: Expandable Safety Details

Examples:

- no API write
- no schema write
- no approval execution
- no production/payment/shipment actions

Avoid:

- repeating long safety paragraphs everywhere
- making safety text dominate business data
- hiding safety entirely

The interface should feel safe because boundaries are structured, not because every card repeats the full policy.

## 16. Technical Detail System

Technical info should be available but secondary.

Examples:

- API route
- record count
- fallback source
- endpoint
- internal enum

Recommended display:

- `技术信息` collapsed area
- secondary text
- never visually primary
- keep API routes and internal keys in English

Technical details should help debugging and review, but should not drive the operator experience.

## 17. Chinese Wording System

Rules:

- use Chinese for operator-facing labels
- preserve English API routes and internal keys
- Email / WhatsApp / API may remain English
- avoid wording that implies business commitment
- use concise operational Chinese

Good wording examples:

- 需要人工复核
- 仅预览
- 不可发送
- 暂无实时数据
- 静态预览数据

Avoid wording examples:

- 已确认交期
- 已批准报价
- 可直接发送
- 已确认生产
- 已确认付款

Chinese copy should be short, direct, and business-operator friendly.

## 18. Typography Hierarchy

Conceptual typography levels:

- page title
- section title
- card title
- table header
- body text
- helper text
- technical text
- badge text

Typography should clarify hierarchy. Do not implement font changes yet.

Recommended direction:

- page title: clear and concise
- section title: supports scanability
- card title: action or state oriented
- table header: compact
- body text: readable
- helper text: short
- technical text: secondary
- badge text: compact and consistent

## 19. Spacing and Density Rules

Density direction:

- compact but breathable spacing
- avoid stacked large paragraphs
- use grouped rows
- use consistent card padding
- avoid many cards with identical emphasis

Spacing should support fast scanning. Dense internal admin UI is acceptable, but clutter is not.

Future implementation should define a spacing scale before touching broad CSS.

## 20. Color and Tone Direction

Conceptual tones:

- neutral
- success
- warning
- danger
- info
- disabled
- preview

Do not implement color tokens yet.

Avoid overusing red/yellow. High-risk states should stand out, but ordinary read-only or preview states should feel calm and neutral.

## 21. Empty / Loading / Error / Fallback States

Rules:

- empty state should explain what is missing
- loading state should be short
- error state should be clear
- fallback preview should be visible but not dominant
- API 404 in local static preview should be understood as fallback behavior

Avoid turning fallback state into the main visual story. The operator should understand the page is safe and readable, then move on.

## 22. Static Preview Data Rules

For future static UI previews:

- mark as `静态预览` / `仅预览`
- no live helper execution
- no API calls
- no write actions
- no false business result

Static preview data should prove layout and comprehension only. It must not imply real customer, supplier, quote, PI, order, payment, production, shipment, or approval status.

## 23. Responsive Rules

Responsive direction:

- desktop-first for internal admin
- avoid horizontal overflow
- tables may scroll internally if necessary
- drawer may stack below content on narrow widths later
- badges should wrap

Responsive behavior should preserve readability first. Mobile is secondary for this internal admin phase.

## 24. Accessibility and Readability Notes

Include:

- sufficient contrast
- readable Chinese labels
- avoid tiny dense text
- avoid color-only meaning
- keyboard/focus can be future concern

Accessibility should be introduced pragmatically. The first priority is readable, safe, predictable internal operations UI.

## 25. Relationship With Existing Admin UI

The current `admin/ui-foundation` should not be broadly rewritten immediately.

Use this design system to guide future static dashboard preview work. Then gradually replace old module-heavy patterns with accepted workflow-first patterns.

Current UI patterns worth preserving:

- localized labels
- read-only boundaries
- browser preview workflow
- fallback preview labels
- table/list plus review concept
- static preview before live wiring

Current UI patterns to reduce over time:

- repeated long safety paragraphs
- prominent mock buttons
- always-heavy right review panel
- many equal-weight cards
- visible technical/debug content in primary areas

## 26. Relationship With Display Adapter Layer

Display adapters produce view models.

The design system defines how view models should be shown.

Rules:

- UI must not execute helpers
- UI must not mutate payload
- disabledCapabilities must be informational only
- rawReference and technicalDetails should remain secondary
- nestedReviewModels must remain read-only

Display adapter output is display data, not workflow permission.

## 27. First Implementation Candidate After This Plan

Recommended first implementation candidate:

- Static Workbench / 工作台 Preview

Reason:

- aligns with IA plan
- helps shift from module-centric to workflow-first
- can use static data only
- no API/schema/write actions
- can prove new layout direction

This should be planned separately before implementation.

## 28. Implementation Roadmap

Recommended roadmap:

1. Design System Plan accepted
2. Static Workbench Preview Plan
3. Static Workbench Preview Implementation
4. Browser preview
5. Polish
6. Decide whether to replace Dashboard
7. Later redesign individual modules

Each implementation should have explicit allowed files, no write/API/schema changes, and a browser preview checklist.

## 29. What Should NOT Happen Next

Do not do next:

- no broad UI rewrite
- no immediate navigation overhaul
- no React/Next migration
- no API/schema changes
- no live helper execution
- no write actions
- no business execution

The current Admin UI should remain stable while the first static preview is planned.

## 30. Acceptance Criteria Before Implementation

Implementation should begin only when:

- design system plan accepted
- static preview target approved
- allowed files explicit
- no API/schema/write actions confirmed
- browser preview checklist defined
- rollback plan clear
- user explicitly approves

Implementation must remain small, reversible, and read-only until a later approved phase changes the boundary.

## 31. Final Recommendation

Move next to Static Workbench Preview Plan, not direct implementation yet.

The correct next move is to plan one small `工作台` static preview that demonstrates workflow-first layout without changing navigation, API behavior, schema, helper execution, or business workflows.
