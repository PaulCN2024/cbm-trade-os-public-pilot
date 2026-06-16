# Phase 0A: Localized Admin UI Read-only Browser Preview Checklist

## 1. Purpose

This checklist defines how to review the localized Chinese read-only admin UI before any further UI implementation.

The goal is to verify readability, layout safety, read-only boundaries, and technical value preservation.

## 2. Scope

This checklist covers localized read-only admin UI sections:

- AI Drafts
- Customer CRM
- Inquiry Center
- Products
- Companies
- Capabilities / Manufacturing Capabilities
- Common Review Panel metadata labels

## 3. What This Checklist Is Not

- Not a UI implementation task
- Not a schema/API task
- Not a write-action task
- Not an approval workflow task
- Not an AI integration task
- Not a full i18n framework

## 4. Preview Environment

Likely preview entry:

- `admin/ui-foundation/index.html`

Use the existing local preview method already used for `admin/ui-foundation`.

If a local dev server is already running, open the existing admin UI foundation URL. Do not introduce a new preview command during this checklist unless a separate approved task defines it.

## 5. Global Visual Checks

Check that:

- Chinese labels display without garbled text.
- Labels do not overflow cards or tables.
- Sidebar still fits.
- Badges remain readable.
- Table headers remain aligned.
- Empty states are understandable.
- Fallback preview data remains clearly marked.
- No horizontal overflow appears on ordinary desktop width.

## 6. Read-only Safety Checks

Confirm no visible UI suggests enabled actions for:

- Create
- Update
- Delete
- Send
- Approve
- Reject
- Quote
- PI generation
- Order confirmation
- Payment action
- Production confirmation
- Shipment confirmation

## 7. API/Value Preservation Checks

Confirm technical values remain unchanged and visible where appropriate:

- `GET /api/companies`
- `GET /api/customers`
- `GET /api/inquiries`
- `GET /api/products`
- `GET /api/manufacturing-capabilities`
- `GET /api/ai-inquiry-analyses`

Also confirm:

- API route values remain English technical values.
- Record counts display as numbers.
- Internal enum values such as `A_ARCHITECTURAL`, `B_INDUSTRIAL`, and `UNKNOWN` are not translated unless a future mapping task explicitly approves it.

## 8. Section Checklist: AI Drafts

Check that:

- `AI 草稿` title is clear.
- 草稿 / 人工审核 / 未发送 meaning is clear.
- No send / approve / reject buttons appear.
- Safety text clearly says no price, delivery, payment, or bank information confirmation.

## 9. Section Checklist: Customer CRM

Check that:

- `客户管理` title is clear.
- Customer fields are understandable.
- Customer API status panel is readable.
- No create / import / update / delete action appears as enabled.

## 10. Section Checklist: Inquiry Center

Check that:

- `询盘中心` title is clear.
- `原始消息 / 摘要` and `缺失信息` are readable.
- No AI auto-processing or outbound action appears enabled.
- No quote / PI / order action appears.

## 11. Section Checklist: Products

Check that:

- `产品管理` title is clear.
- `产品名称` / `业务线` / `分类` / `材质` / `表面处理` are readable.
- Product review remains read-only.
- No create / update / delete action appears enabled.

## 12. Section Checklist: Companies

Check that:

- `公司管理` title is clear.
- `公司` / `国家` / `类型` / `来源` / `备注` are readable.
- Safety boundary remains clear.
- No send or commitment action appears.

## 13. Section Checklist: Capabilities / Manufacturing Capabilities

Check that:

- `制造能力` title is clear.
- `能力线` / `设备` / `数量` / `最大长度` / `月产能` are readable.
- Wording does not imply confirmed production feasibility.
- Wording does not imply confirmed price.
- Wording does not imply confirmed delivery time.
- Wording does not imply supplier commitment.

## 14. Common Review Panel Checklist

Check that these labels display correctly:

- `API 路由`
- `记录数量`
- `写入动作`
- `未连接`

Also confirm:

- Values remain unchanged.
- Layout remains consistent across sections.

## 15. Language Quality Checklist

Check that:

- Chinese labels are natural for business operators.
- English is retained for technical values and brand/channel names where appropriate.
- No confusing mixture changes business meaning.
- No Chinese translation creates accidental business commitment.

## 16. Issue Recording Template

| Section | Issue | Severity | Screenshot needed? | Suggested fix | Safe to fix now? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  |  | Low / Medium / High | Yes / No |  | Yes / No |  |

## 17. Pass/Fail Criteria

Pass only if:

- No layout break exists.
- No misleading action appears.
- No write path is exposed.
- No API value changed.
- No commitment wording was introduced.
- Chinese labels are understandable.

## 18. Recommended Next Steps

- Run browser preview manually.
- Record issues only.
- Do not modify UI during preview.
- Create separate small polish tasks only after issues are listed.
