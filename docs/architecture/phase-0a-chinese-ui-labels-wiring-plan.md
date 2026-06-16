# Phase 0A: Chinese UI Labels Wiring Plan

## 1. Purpose

Define how Chinese UI labels should later be wired into the existing read-only admin UI without changing API contracts, database schema, or business behavior.

This document is planning only. It does not implement UI wiring.

## 2. Why UI Label Wiring Needs a Plan Before Implementation

CBM Trade OS operator-facing UI should feel natural for Chinese internal users, while code, API fields, enum values, tests, and constants remain English.

A wiring plan helps avoid repeated hardcoded labels, accidental business logic changes, and mixed-language UI behavior.

## 3. Current UI Status

`admin/ui-foundation` is a read-only internal admin shell. It currently demonstrates:

- sidebar navigation
- dashboard metrics
- Customers, Inquiries, Companies, Products, Manufacturing Capabilities, and AI Drafts read-only sections
- fallback preview states
- disabled or mock-only write actions
- manual review and safety boundaries

It should remain read-only until a later approved phase.

## 4. Core Rules

- English keys remain in code and data.
- Chinese labels display in operator-facing UI.
- No API or schema changes are needed for label display.
- UI label wiring must not change business logic.
- UI label wiring must not add create, update, delete, send, quote, PI, order, payment, shipment, or production actions.
- Customer-facing text should still use the customer's language, not this operator label map.

## 5. Suggested Wiring Approach

- Keep label dictionaries in `lib/services/ui-labels`.
- Create a small browser-safe label helper later if needed.
- Avoid hardcoding Chinese labels repeatedly in `admin/ui-foundation/app.js`.
- Map known enum, status, risk, draft type, communication, attachment, and numbering values to Chinese labels.
- Fallback to the original key when no label is found.
- Keep display mapping separate from API data loading.

Future display helper shape may be:

```js
getChineseLabel(group, key, fallback)
```

The helper should only return display text. It must not mutate records or make business decisions.

## 6. Candidate Read-only UI Areas for Future Label Wiring

- sidebar labels
- section titles
- table headers
- status badges
- empty states
- error states
- fallback preview labels
- AI draft type labels
- approval status labels
- risk level labels
- action boundary labels

## 7. Customer CRM Label Examples

- Customer => 客户
- Company => 公司
- Country => 国家
- Source => 来源
- Status => 状态
- Owner => 负责人
- Next Action => 下一步动作
- Created At => 创建时间

## 8. Inquiry Center Label Examples

- Inquiry => 询盘
- Product => 产品
- Business Line => 业务线
- Priority => 优先级
- Received At => 收到时间
- Waiting Customer Reply => 等待客户回复
- Supplier Quoting => 供应商报价中

## 9. Future AI Draft Label Examples

- Draft Type => 草稿类型
- Risk Level => 风险等级
- Approval Status => 审核状态
- Needs Review => 需要审核
- Blocked => 已阻止

Existing enum label groups can be reused:

- `ai_draft_types`
- `ai_task_types`
- `approval_statuses`
- `ai_risk_levels`
- `ai_decision_statuses`
- `ai_action_boundaries`

## 10. What Should NOT Be Implemented Yet

- no UI code changes
- no `admin/ui-foundation/app.js` changes
- no API changes
- no schema changes
- no i18n framework
- no translation service
- no dynamic customer-facing translation
- no AI-generated UI labels
- no write actions
- no approval workflow execution

## 11. Low-risk Future Implementation Roadmap

1. Review-only: identify safe label locations in `admin/ui-foundation`.
2. Small implementation: add a local display helper if browser usage needs a wrapper.
3. Small implementation: wire labels into one read-only section only.
4. Test in browser for readability, layout, and fallback behavior.
5. Expand to other read-only sections only after approval.

Recommended first wiring target: AI Drafts read-only labels, because approval and risk labels directly improve safety clarity.

## 12. Acceptance Criteria for Future Implementation

- UI displays Chinese labels for operators.
- Internal keys remain unchanged.
- API responses remain unchanged.
- Database schema remains unchanged.
- No business logic changes.
- No write actions are added.
- No send, quote, PI, order, payment, shipment, or production actions are added.
- Fallback behavior is safe and shows the original key when no Chinese label exists.
- Read-only state remains obvious to users.
