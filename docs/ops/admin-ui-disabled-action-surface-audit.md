# Admin UI Disabled Action Surface Audit

## Purpose

Audit the current CBM Trade OS Admin UI for visible buttons, links, filters, form fields, clickable controls, and action-like labels that could imply write or business execution.

This audit is documentation only. It does not change UI code, API code, schema, package files, deployment settings, environment variables, or production data.

## Current Read-only Baseline

Current production Admin UI surfaces are intended to remain read-only or static-preview only:

- 工作台
- 询盘
- 客户
- AI 复核
- 供应商
- 制造能力
- 文件中心
- 报价前复核 / 报价
- 订单
- 生产
- 发货
- 售后
- 设置

Current safety principle:

- no send
- no approve or reject execution
- no task creation
- no supplier RFQ send
- no quotation generation or send
- no PI, contract, order, payment, production, or shipment execution
- no after-sales liability or compensation conclusion

Current read-only/admin-read coverage:

| Surface | Read path |
| --- | --- |
| 工作台 | `/api/admin-read/dashboard-summary` |
| 客户中心 | `/api/admin-read/customers` |
| 询盘中心 | `/api/admin-read/inquiries` |
| AI 复核中心 | `/api/admin-read/ai-review` |
| 供应商中心 | `/api/admin-read/supplier-capabilities` |
| 制造能力中心 | `/api/admin-read/supplier-capabilities` |
| 文件中心 | `/api/admin-read/documents` |
| 报价前复核 | `/api/admin-read/pre-quotation-review` |

## Source Audit Method

Inspected files:

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/app.js`
- `admin/ui-foundation/styles.css`
- `docs/architecture/phase-ui-2-disabled-action-write-approval-plan.md`
- related `docs/ops/*` and `docs/architecture/*` context

Static source search looked for:

- `button`
- `a href`
- `input`
- `textarea`
- `select`
- `form`
- `onclick`
- `role="button"`
- `data-action`
- `disabled`
- `aria-disabled`
- `filter`
- `export`
- `add`
- `create`
- `approve`
- `reject`
- `send`
- `quote`
- `quotation`
- `RFQ`
- `PI`
- `order`
- `payment`
- `production`
- `shipment`
- `confirm`
- `submit`
- `save`
- `upload`
- `delete`
- `edit`
- `review`

Static findings:

- `admin/ui-foundation/index.html:39` has `导出视图 - 未连接`, disabled.
- `admin/ui-foundation/index.html:40` has `新增 - 稍后开放`, disabled.
- `admin/ui-foundation/index.html:80` has an active `Filter` button.
- `admin/ui-foundation/index.html:81` has `创建草稿 - 仅模拟`, disabled.
- `admin/ui-foundation/app.js:1767` and `admin/ui-foundation/app.js:1772` render read-only company review inputs.
- `admin/ui-foundation/app.js:2978` and `admin/ui-foundation/app.js:2983` render read-only product review inputs.
- `admin/ui-foundation/app.js:3731` and `admin/ui-foundation/app.js:3736` render read-only AI draft safety inputs.
- `admin/ui-foundation/app.js:4707` defines `renderFormCard()`, an unused static form sample that includes input/textarea controls and `Cancel` / `Save Draft` buttons.
- No `onclick` handlers, `data-action` actions, or role-button business execution controls were found.
- The active JavaScript event flow remains section navigation and read-only fetch/display refresh behavior.

## UI Section Action Surface Matrix

| Section | Visible controls/actions found | Control type | Current state | Safe? | Risk level | Notes | Recommended remediation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 工作台 | `导出视图 - 未连接`; `新增 - 稍后开放`; `Filter`; `创建草稿 - 仅模拟` | Buttons | export/add/create disabled; Filter active but harmless | Mostly safe | Low-medium | Workbench preview containers have no controls. The active Filter is shared shell chrome and has no business handler, but it looks executable. | Disable or relabel Filter in next UI safety cleanup. |
| 询盘 | Shared shell controls only; inquiry table/review area has no action controls | Buttons outside content; read-only content | disabled/misleading shell Filter | Mostly safe | Low-medium | Inquiry content remains read-only and admin-read/fallback only. | Disable or relabel shared Filter; keep inquiry content unchanged. |
| 客户 | Shared shell controls only; customer workflow/table/review area has no action controls | Buttons outside content; read-only content | disabled/misleading shell Filter | Mostly safe | Low-medium | Customer content remains read-only. | Disable or relabel shared Filter. |
| AI 复核 | Shared shell controls only; AI review preview and review cards have no action controls | Buttons outside content; read-only content | disabled/misleading shell Filter | Mostly safe | Low-medium | AI review copy says draft/review only. | Disable or relabel shared Filter; keep draft-only wording. |
| 供应商 | Shared shell controls only; supplier preview/review cards have no action controls | Buttons outside content; read-only content | disabled/misleading shell Filter | Mostly safe | Medium | Supplier RFQ and capability actions are disabled in copy. | Disable or relabel shared Filter; future RFQ actions need approval workflow. |
| 制造能力 | Shared shell controls only; capability preview/review cards have no action controls | Buttons outside content; read-only content | disabled/misleading shell Filter | Mostly safe | Medium | Wording avoids confirmed production feasibility. | Disable or relabel shared Filter; preserve no-commitment language. |
| 文件中心 | Shared shell controls only; file preview/review cards have no action controls | Buttons outside content; read-only metadata | disabled/misleading shell Filter | Mostly safe | Medium | File Center has no upload/download/delete controls in preview region. | Disable or relabel shared Filter; keep no file operation boundary. |
| 报价前复核 / 报价 | Shared shell controls only; quote preview/review containers have no action controls | Buttons outside content; read-only quote review | disabled/misleading shell Filter | Mostly safe | Medium-high | Quote preview region has no buttons, links, inputs, or textareas. No price/cost/payment execution labels found in preview region. | Disable or relabel shared Filter; keep no quote/PI/order/payment execution wording. |
| 订单 | Shared shell controls only; commercial workflow cards have no action controls | Buttons outside content; static preview | disabled/misleading shell Filter | Mostly safe | High | Order section stays static; disabled chips block order confirmation/payment/production. | Disable or relabel shared Filter; no order actions before approval architecture. |
| 生产 | Shared shell controls only; commercial workflow cards have no action controls | Buttons outside content; static preview | disabled/misleading shell Filter | Mostly safe | High | Production section stays static; disabled chips block production release and delivery commitment. | Disable or relabel shared Filter; no production action before approval architecture. |
| 发货 | Shared shell controls only; commercial workflow cards have no action controls | Buttons outside content; static preview | disabled/misleading shell Filter | Mostly safe | High | Shipping section stays static; disabled chips block shipment confirmation and customer notification. | Disable or relabel shared Filter; no shipment action before approval architecture. |
| 售后 | Shared shell controls only; commercial workflow cards have no action controls | Buttons outside content; static preview | disabled/misleading shell Filter | Mostly safe | High | After-sales section stays static; disabled chips block liability and compensation commitments. | Disable or relabel shared Filter; no after-sales conclusion before approval architecture. |
| 设置 | Shared shell controls only; settings preview has no action controls | Buttons outside content; static preview | disabled/misleading shell Filter | Mostly safe | High | Settings placeholders state no AI/channel/account connection. | Disable or relabel shared Filter; do not activate settings without separate plan. |

## Risky Or Misleading Surfaces Found

| Surface | File location | Section | Exact label | Why risky or safe | Safety classification | Recommended future handling |
| --- | --- | --- | --- | --- | --- | --- |
| Topbar export | `admin/ui-foundation/index.html:39` | Global shell | `导出视图 - 未连接` | Disabled, has disabled attribute and title. Not risky today. | OK: disabled and clearly labeled | Keep or add clearer `aria-disabled` in future polish. |
| Topbar add | `admin/ui-foundation/index.html:40` | Global shell | `新增 - 稍后开放` | Disabled, has disabled attribute and title. Not risky today. | OK: disabled and clearly labeled | Keep disabled until create workflow is separately approved. |
| Panel filter | `admin/ui-foundation/index.html:80` | Global main panel | `Filter` | Active button, no business handler found, but visually looks executable and appears on every section. | Needs disabled attribute / needs copy improvement | Next task should disable it or relabel to `筛选 - 稍后开放`; add disabled/title/aria-disabled. |
| Panel draft | `admin/ui-foundation/index.html:81` | Global main panel | `创建草稿 - 仅模拟` | Disabled and labeled mock-only. It is safe today but still action-like. | OK: disabled and mock-only | Keep disabled; future draft creation needs approval/draft-only architecture. |
| Read-only company inputs | `admin/ui-foundation/app.js:1767`, `1772` | 公司/客户相关 review card | `只读查看`, `不自动发送或承诺` | Inputs are `readonly`; they are display-only but form styling can look editable. | OK: read-only but could improve visual clarity | Consider replacing with static rows/chips in later UI polish. |
| Read-only product inputs | `admin/ui-foundation/app.js:2978`, `2983` | 产品 review card | `只读产品查看`, `A_ARCHITECTURAL / B_INDUSTRIAL / UNKNOWN` | Inputs are `readonly`; internal enum values are preserved. | OK: read-only but could improve visual clarity | Consider static rows/chips later. |
| Read-only AI draft inputs | `admin/ui-foundation/app.js:3731`, `3736` | AI 复核 review card | `仅草稿 / 未发送`, `发送前需要人工审核` | Inputs are `readonly`; wording reinforces no send. | OK: read-only | Consider static rows/chips later. |
| Unused form renderer | `admin/ui-foundation/app.js:4707` | Source-only helper | `Cancel`, `Save Draft`, input/textarea sample | Not visible in browser audit, but if called later it would introduce active-looking controls. | Needs removal from read-only phase before use | Remove, disable, or convert to a read-only sample before any section calls it. |
| Preview cards | Browser smoke across all section-specific preview containers | All major sections | Disabled chips and text labels only | No buttons, links, inputs, textareas, forms, role-button, or data-action controls inside preview containers. | OK: read-only and not misleading | Preserve this pattern. |

No high-risk active business control was found in the current visible Admin UI.

## Safety Classification

| Category | Current findings |
| --- | --- |
| OK: read-only and not misleading | Section-specific workbench, inquiry, customer, AI review, supplier, capability, file, quotation, order, production, shipping, after-sales, and settings preview containers contain no active controls. |
| OK: disabled and clearly labeled | `导出视图 - 未连接`, `新增 - 稍后开放`, `创建草稿 - 仅模拟`. |
| OK: mock-only / coming later | Disabled topbar and panel mock actions. |
| Needs copy improvement | Active `Filter` is English and looks live despite having no business handler. |
| Needs disabled attribute | Active `Filter` should be disabled until safe local filtering is implemented. |
| Needs visual disabled state | Active `Filter` should match mock-only styling or be removed. |
| Needs removal from read-only phase | `renderFormCard()` source-only sample should not be used as-is in read-only sections. |
| Needs approval workflow before activation | Any draft creation, send, RFQ, quotation, PI, order, payment, production, shipment, delete, upload, or settings action. |
| High risk: must not ship active | No active high-risk business control found in current visible UI. |

## Browser Smoke Findings Or Limitation

Browser smoke was performed with existing Playwright availability. No packages were installed.

URL used:

```text
https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1
```

Sections checked:

- 工作台
- 询盘
- 客户
- AI 复核
- 供应商
- 制造能力
- 文件
- 报价
- 订单
- 生产
- 发货
- 售后
- 设置

Browser findings:

- All checked sections rendered.
- No horizontal overflow was observed.
- No fatal page errors were observed.
- Expected unauthenticated admin-read `401` resource console errors were observed.
- Each section showed the same global shell controls:
  - disabled `导出视图 - 未连接`
  - disabled `新增 - 稍后开放`
  - active `Filter`
  - disabled `创建草稿 - 仅模拟`
- Section-specific preview containers had zero buttons, links, inputs, textareas, selects, forms, role-button controls, or data-action controls.
- Pre-Quotation / 报价前复核 preview containers had zero active controls.

## Recommended Remediation Plan

Recommended next implementation task:

```text
CBM-CODEX-SPRINT-UI-SAFETY-004 - Disable Or Relabel Misleading Admin UI Controls
```

Suggested future scope:

1. Disable or relabel the global `Filter` button.
2. Add `disabled`, `title`, and `aria-disabled` where useful.
3. Convert active-looking shell controls to mock-only labels until safe local filtering exists.
4. Remove or hard-disable the unused `renderFormCard()` sample before it is ever called.
5. Consider converting read-only input-style cards into static rows/chips for clearer read-only UX.
6. Preserve all route IDs, data-section values, admin-read paths, and static fallback behavior.
7. Do not add execution behavior.

Recommended copy options:

- `筛选 - 稍后开放`
- `筛选 - 仅预览`
- `筛选未连接`
- `需要审批流程后开放`

## Non-goals

This audit does not:

- modify UI code
- modify API code
- modify schema or migrations
- modify package files
- deploy production
- add approval execution
- add write APIs
- add send actions
- add approve/reject actions
- add task creation
- add RFQ, quotation, PI, order, payment, production, shipment, or after-sales execution
- connect Gmail, WhatsApp, OpenAI, AI Gateway, or external channels

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-UI-SAFETY-004 - Disable Or Relabel Misleading Admin UI Controls
2. CBM-CODEX-SPRINT-SAFETY-003 - Disabled Action Registry Plan
3. CBM-CODEX-SPRINT-SCHEMA-PLAN-001 - Approval Audit Schema Plan
4. CBM-CODEX-SPRINT-DOCS-003 - Internal Trial Operator Guide Update
5. CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution if safe token exists

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 83% -> 83%
- Admin UI Disabled Action Surface Audit: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [████████░░] 83%
- Current module: [██████████] 100%
