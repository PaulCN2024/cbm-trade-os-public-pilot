# Customer Verification Confidence And Risk Rules

## Purpose

This document defines future confidence, risk, scoring, and recommended next-action rules for AI Customer Verification.

The rules are advisory only. They do not authorize automatic customer creation, customer mutation, sending, quotation, PI, order, payment, production, shipment, external lookup, scraping, or AI provider calls.

## Confidence Levels

### `low`

Use `low` confidence when the record has sparse or weak identity evidence.

Typical signals:

- sparse information
- no website or email domain
- no company details
- only personal contact
- unclear source channel
- unclear buyer role
- no product/project context

Recommended behavior:

- request more information
- hold before follow-up if risk is also high
- do not prepare quote or formal commercial response

### `medium`

Use `medium` confidence when the record has useful but incomplete business context.

Typical signals:

- company and country provided
- product interest clear
- some missing verification fields
- role or website not fully confirmed
- no strong conflict signals

Recommended behavior:

- continue gentle information collection
- ask for website, project location, quantity, drawings, or buyer role
- keep follow-up draft internal until Paul approves

### `high`

Use `high` confidence when identity and business context are consistent and source-backed.

Typical signals:

- company, website, email domain, product interest, buyer role, and project details are consistent
- no duplicate conflict
- reasonable quantity and timeline
- source evidence is reviewed

Recommended behavior:

- continue follow-up after Paul review
- prepare internal next-step suggestions
- still do not send, quote, or update records automatically

## Risk Levels

### `low`

Use `low` risk when the record has clear business context and no obvious conflict.

Typical signals:

- clear business context
- reasonable product need
- company info provided
- no duplicate conflict
- no suspicious timeline or price-only pressure

### `medium`

Use `medium` risk when information is incomplete or ambiguous.

Typical signals:

- some missing info
- website/email not verified
- unclear role
- possible duplicate
- incomplete project context
- source channel needs review

### `high`

Use `high` risk when there are suspicious, conflicting, or commercially sensitive patterns.

Typical signals:

- suspicious patterns
- conflict between country/email/website
- competitor signals
- repeated vague inquiries
- refuses identity/company info
- asks for sensitive quote without project details
- unrealistic quantity/timeline
- pressure for price, payment terms, delivery time, or bank details without enough context

High risk does not automatically reject a lead. It means Paul must review before reply, quote preparation, customer status change, or any external action.

## Suggested Scoring Model

Plan only. Do not implement scoring without a separate testable helper/API task.

- `credibility_score`: 0-100
- `relevance_score`: 0-100
- `risk_score`: 0-100
- `duplicate_score`: 0-100
- `followup_priority_score`: 0-100

Suggested interpretation:

- 0-39: weak or insufficient evidence
- 40-69: mixed or incomplete evidence
- 70-100: stronger evidence, still review-required

Important:

- A high score is not permission to send or create a customer.
- A high score is not a verified legal identity.
- A low score is not automatic rejection.
- Score explanations are required.

## Recommended Next Action Rules

Examples:

| Condition | Recommended next action | Boundary |
| --- | --- | --- |
| high credibility + high relevance + low risk | continue follow-up | Paul approves before any message is sent |
| medium credibility + missing company website | request more info | draft only, no auto-send |
| duplicate score high | mark possible duplicate | no auto-merge or archive |
| high risk | hold/review before reply | no quote or customer mutation |
| low relevance | low priority | no automatic rejection |
| high relevance + missing drawings/specs/quantity | request project details | no quote readiness claim |
| conflict between website/country/email | manual review | no trust decision |

## Human Approval Boundary

AI can recommend.

Paul decides.

No automatic status changes.

No automatic send.

No automatic quote.

No customer creation, merge, archive, or rejection without approval.

No payment, order, production, or shipment workflow from verification scores.

## Safe Output Labels

Preferred labels:

- `建议继续跟进`
- `建议补充信息`
- `疑似重复，待人工确认`
- `风险较高，暂停自动动作`
- `低优先级，待人工判断`
- `证据不足，不能确认`

Avoid labels that imply finality:

- `真实客户`
- `已验证无风险`
- `可以直接报价`
- `可以自动发送`
- `可以自动创建客户`
- `可以直接下单`

## Audit Expectations

Future implementation should preserve:

- input evidence snapshot
- score values
- score explanation
- reviewer decision
- reviewer notes
- timestamp
- source record links

This makes later customer-status changes explainable and reversible.
