# Phase 0A: AI Draft Usage Examples

## 1. Purpose

This document explains the safe standard flow for using the current AI Draft & Approval foundation in CBM Trade OS.

It is documentation only. It does not define database tables, API routes, UI pages, real AI model calls, approval workflow execution, email sending, WhatsApp sending, or auto-send behavior.

## 2. Why AI Draft Usage Examples Are Needed

AI Draft & Approval is the safety boundary for future AI-first workflows.

Examples help future services and AI agents create draft-only outputs, surface risk, and keep human users in control of commercial decisions.

## 3. Standard Safe Flow

1. Call `normalizeAiDraftInput(input)`.
2. Call `classifyAiDraftSafety(normalized or raw draft input)`.
3. Inspect `risk_level`, `action_boundary`, and `approval_required`.
4. Create a draft-only result.
5. Route to human review when required.
6. Never auto-send.

## 4. Core Safety Principle

AI may create drafts and suggestions.

AI must not directly:

- send messages
- approve drafts
- confirm price
- commit delivery
- commit compensation
- change financial data
- change permission data

## 5. UI Language Principle

Internal code identifiers stay English.

CBM Trade OS operator-facing UI should default to Chinese labels. Example mappings:

- `customer_reply_draft` -> 客户回复草稿
- `supplier_rfq_draft` -> 供应商询价草稿
- `quotation_draft` -> 报价草稿
- `approval_review` -> 人工审核
- `risk_level` -> 风险等级
- `needs_review` -> 需要审核

Customer-facing text should use the customer's language, such as English or Spanish.

## 6. Example 1: Low-Risk Internal Note Draft

Input example:

```js
{
  draft_type: "internal_note_draft",
  task_type: "document_summary",
  risk_level: "low",
  action_boundary: "auto_allowed",
  content: "Summarize internal project notes."
}
```

Expected safe interpretation:

- `risk_level`: `low`
- `action_boundary`: `auto_allowed`
- `approval_required` may be false only for internal low-risk notes
- no customer or supplier message is sent

## 7. Example 2: Customer Reply Draft Mentioning Price

Input example:

```js
{
  draft_type: "customer_reply_draft",
  task_type: "communication_summary",
  content: "Please reply with the updated unit price and FOB total amount."
}
```

Expected safe interpretation:

- `price_related`: true
- `risk_level`: `high`
- `action_boundary`: `review_required`
- `approval_required`: true
- no price confirmation is sent automatically

## 8. Example 3: Supplier RFQ Draft

Input example:

```js
{
  draft_type: "supplier_rfq_draft",
  task_type: "supplier_rfq_generation",
  target_channel: "email",
  content: "Draft an email to request supplier pricing for aluminum profiles."
}
```

Expected safe interpretation:

- `external_message_related` may be true
- `review_required` before sending
- no auto-send
- human user decides whether to send the RFQ

## 9. Example 4: Quotation Draft

Input example:

```js
{
  draft_type: "quotation_draft",
  task_type: "quotation_generation",
  content: "Prepare quotation explanation and offer sheet summary."
}
```

Expected safe interpretation:

- `quotation_related`: true
- high risk
- human approval required
- no official quotation is issued automatically

## 10. Example 5: PI Draft

Input example:

```js
{
  draft_type: "pi_draft",
  task_type: "quotation_generation",
  content: "Prepare PI and proforma invoice draft for review."
}
```

Expected safe interpretation:

- `pi_related`: true
- high risk
- human approval required
- no PI is sent automatically

## 11. Example 6: Finance Or Permission Related Draft

Input example:

```js
{
  draft_type: "internal_note_draft",
  task_type: "customer_summary",
  content: "Summarize profit margin and admin role permission changes."
}
```

Expected safe interpretation:

- `finance_related` or `permission_related`: true
- `risk_level`: `blocked`
- `action_boundary`: `blocked`
- `approval_required`: true
- no automatic execution is allowed

## 12. AI Agent Usage Rules

AI may:

- draft customer replies
- draft supplier RFQs
- draft quotation explanations
- draft internal notes
- suggest follow-up tasks
- surface warnings and sensitivity flags

AI must:

- route sensitive drafts to human review
- keep output draft-only until reviewed
- preserve safety warnings

AI must not:

- auto-send messages
- bypass approval
- issue official quotations
- issue PI
- confirm price
- confirm delivery
- confirm payment terms
- confirm bank information
- promise compensation
- judge responsibility

## 13. Human Review Rules

Human review is required when draft content involves:

- price
- delivery
- payment
- compensation
- quality responsibility
- order confirmation
- quotation
- PI
- customer-facing message
- supplier-facing message
- finance
- permissions

## 14. What Is Still Not Implemented

- database tables
- real AI model calls
- AI Gateway integration
- approval workflow execution
- API endpoints
- UI review panel
- email sending
- WhatsApp sending
- auto-send
- audit log integration

## 15. Recommended Next Steps

1. AI Draft Foundation readiness review.
2. AI Draft service integration plan.
3. Future schema field planning.
4. Future API planning.
5. Future Chinese UI label mapping plan.
