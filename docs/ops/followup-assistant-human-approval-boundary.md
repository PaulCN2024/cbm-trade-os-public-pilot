# Follow-up Assistant Human Approval Boundary

## Purpose

This document defines the human approval boundary for the future AI Follow-up Assistant.

The assistant may help Paul prepare follow-up decisions and drafts. It must not contact customers, create official tasks, mutate records, or trigger business actions without approval.

## AI May Do

AI may:

- identify follow-up candidates
- summarize context
- list missing info
- suggest next action
- draft message
- estimate priority
- flag risk
- prepare task proposal

These are internal, reviewable, and non-executing actions.

## AI Must Not Do

AI must not:

- send email/WhatsApp
- create official quotation
- promise price/delivery/payment
- update customer status automatically
- create order/PI/payment/shipment
- mark customer verified automatically
- merge customers
- contact customer without approval

AI must also not present unverified customer identity, duplicate status, supplier capability, price, delivery time, or payment terms as confirmed facts.

## Approval Required For

Paul approval is required before:

- sending any message
- creating official customer follow-up task
- using customer verification result in external message
- formal quote/PI/order/payment/production/shipment action
- marking customer as risky/duplicate in permanent record

Approval should occur before the action, not after.

## Audit Needs Later

Future audit logs should capture:

- AI recommendation
- draft content
- approver
- approval time
- send status
- final content sent
- channel

Future controlled-write workflow should also record source context, risk flags, missing information, and rollback/cancel status.

## Safety Language

UI should use:

- 草稿
- 未发送
- 需人工确认
- AI 建议
- 不自动执行

Avoid wording that implies the system has already contacted the customer, approved the task, confirmed a quote, or executed a business action.
