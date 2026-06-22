# Follow-up Assistant Priority And Timing Rules

## Purpose

This document defines future priority, timing, trigger, and risk-adjustment rules for AI Follow-up Assistant.

These rules support review and planning only. They do not authorize automatic reminders, recurring automation, message sending, or task creation.

## Priority Levels

### Low

Low-priority signals:

- unclear need
- low relevance
- missing company info
- dormant/low-value
- risky without urgent project

Recommended behavior: display as low priority, request identity or project clarification if useful, and avoid high-effort follow-up until context improves.

### Medium

Medium-priority signals:

- verified enough
- product interest clear
- missing some specs
- quote may be possible after clarification

Recommended behavior: ask for missing information and prepare a draft follow-up for Paul review.

### High

High-priority signals:

- serious project
- clear product/spec/quantity
- verified customer
- fast timeline
- quote/order opportunity

Recommended behavior: show prominently in the workbench, explain why it matters, and prepare a draft only after missing information and risk checks are visible.

## Timing Rules

Example timing guidance:

- first inquiry: same day / within 24 hours
- missing info request: within 24 hours
- quotation follow-up: 2-3 business days
- sample discussion: 1-2 days
- dormant lead: 30-60 days
- risk/unclear customer: wait for identity clarification

Timing suggestions should remain advisory. They should not create recurring automations or scheduled sends in the first implementation.

## Follow-up Triggers

Future triggers may include:

- new inquiry
- customer verified
- missing info detected
- quote sent but no reply
- customer asked technical question
- payment/proforma later
- dormant customer
- complaint/after-sales later

Payment, proforma, complaint, and after-sales triggers require extra safety review before any real workflow execution.

## Risk Adjustments

Risk rules:

- high risk lowers automation level
- possible duplicate requires review first
- unclear buyer role requires information request
- competitor signal requires hold

High-risk or possible-duplicate records should not become automatic sends, automatic tasks, or quotation actions.

## Non-goals

This plan does not authorize:

- automatic scheduled reminders now
- recurring automation now
- auto-send
- auto-task creation
- customer mutation
- quote/PI/order/payment/production/shipment action
