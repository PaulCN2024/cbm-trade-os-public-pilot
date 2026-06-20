# AI Command Center Workflow Router Plan

## Purpose

The workflow router converts Paul’s natural language instruction into a safe, reviewable workflow. It should identify intent, determine which modules are relevant, gather context, show confidence and missing information, and produce a read-only recommendation.

This document is planning only. It does not implement AI calls, API routes, schema changes, UI code, write actions, sending, approval execution, or business execution.

## Intent Detection Model

Initial internal intent keys:

- `inquiry_processing`
- `quotation_readiness`
- `supplier_matching`
- `customer_followup`
- `prospecting`
- `content_marketing`
- `knowledge_lookup`
- `file_analysis`
- `aftersales_complaint`
- `order_tracking_later`
- `business_review`
- `risk_check`

## Input Examples And Routing Table

| User instruction | Detected intent | Required modules | Required context | Safe output | Approval needed |
| --- | --- | --- | --- | --- | --- |
| 帮我处理这个秘鲁客户的轻钢龙骨询盘 | `inquiry_processing` | Inquiry, Customer, Knowledge, Supplier, File | inquiry details, customer profile, product knowledge, supplier capability, file metadata | missing info list, recommended workflow, draft questions | Yes, before sending or RFQ |
| 帮我看看这个客户能不能报价 | `quotation_readiness` | Customer, Inquiry, Quotation Pre-review, Knowledge | specs, quantity, drawings, price rules, risk rules | quotation readiness summary | Yes, before formal quote |
| 帮我找类似 Caribbean Green Construction 的客户 | `prospecting` | Customer, Prospecting, Knowledge | reference customer profile, target market notes, compliance rules | lookalike criteria and search plan | Yes, before outreach |
| 给这个产品生成一周 LinkedIn 内容选题 | `content_marketing` | Knowledge, Product, Social Content | product knowledge, audience, safety rules | topic ideas and draft angles | Yes, before publishing |
| 帮我跟进这个 7 天没回复的客户 | `customer_followup` | Customer, Communication, Inquiry | last contact, status, previous messages | follow-up suggestion and draft | Yes, before sending |
| 帮我分析这个客户投诉 | `aftersales_complaint` | Customer, Inquiry, Order later, File, Knowledge | complaint text, files, order context, risk rules | complaint summary and response options | Yes, before responsibility or compensation |
| 帮我从这个 PDF 里提取报价需要的信息 | `file_analysis` | File, Knowledge, Inquiry, Quotation Pre-review | file metadata, extracted fields later, quote requirements | extraction checklist and missing fields | Yes, before quote |
| 帮我今天排一下最值得处理的客户 | `business_review` | Dashboard, Customer, Inquiry, Follow-up, Risk | active queues, due dates, risk flags | priority briefing | No for review; yes before actions |

## Module Routing

### Inquiry

- When route there: inquiry processing, quotation readiness, missing information, customer questions.
- Data needed: inquiry title, customer, product, quantity, specs, drawings, status, risk flags, created time.
- Output: inquiry summary, missing fields, next best action, safe draft questions.
- Cannot execute: send reply, create quote, approve quote, create order.

### Customer

- When route there: customer follow-up, customer risk review, prospect similarity, priority briefing.
- Data needed: customer profile, country, status, last contact, linked inquiries, notes, communication history.
- Output: customer summary, follow-up recommendation, risk notes.
- Cannot execute: update customer, send message, create task unless future approval workflow allows it.

### Supplier

- When route there: supplier matching, capability review, supplier RFQ preparation.
- Data needed: supplier capability, manufacturing capacity, product fit, previous notes.
- Output: supplier shortlist, capability questions, RFQ draft.
- Cannot execute: send RFQ, commit delivery, confirm production.

### Knowledge

- When route there: product explanation, quote rules, risk rules, supplier/product facts, policy lookup.
- Data needed: verified knowledge records, source, confidence, status.
- Output: cited knowledge summary and confidence.
- Cannot execute: invent facts, overwrite knowledge, expose confidential data.

### File

- When route there: document analysis, drawing/PDF checklist, file metadata review.
- Data needed: safe file metadata, linked business record, document type, status.
- Output: extraction checklist, missing information list, source references.
- Cannot execute: upload, download, delete, parse, OCR, expose storage paths, expose signed URLs.

### Quotation Pre-review

- When route there: quotation readiness, price/delivery/payment risk, missing quote inputs.
- Data needed: specs, quantity, drawings, supplier data, pricing rules, risk rules.
- Output: readiness score, blockers, review checklist.
- Cannot execute: generate formal quote, commit price, issue PI, confirm payment terms.

### Prospecting

- When route there: lookalike customer research, target market planning, outreach preparation.
- Data needed: reference customers, target market, compliance rules, public source plan.
- Output: prospecting criteria, research plan, draft-only outreach.
- Cannot execute: scraping, unauthorized platform access, customer creation, outreach sending.

### Social Content

- When route there: LinkedIn or marketing content planning.
- Data needed: product knowledge, target audience, safety/compliance rules.
- Output: content topics, draft copy, source notes.
- Cannot execute: publish posts, claim unsupported performance, use confidential customer facts.

### Follow-up

- When route there: no-reply customers, overdue communication, next contact planning.
- Data needed: last contact date, customer status, linked inquiry, prior messages.
- Output: follow-up priority and message draft.
- Cannot execute: send message or create task until controlled approval exists.

### Risk

- When route there: price, delivery, quality, payment, complaint, responsibility, compliance concerns.
- Data needed: risk rules, current record, source evidence.
- Output: risk explanation and safe wording.
- Cannot execute: approve, reject, promise, compensate, or commit responsibility.

### Approval Later

- When route there: any external or irreversible action.
- Data needed: exact action, exact output, data involved, external party, risk, rollback.
- Output: approval request.
- Cannot execute: the action itself until Paul explicitly approves in the future controlled workflow.

## Context Priority

1. active customer/inquiry context
2. knowledge base
3. supplier capability
4. documents/files
5. quotation rules
6. previous communications
7. risk/compliance rules

## Fallback Behavior

When context is missing or confidence is low, the router must:

- ask a clarification question
- list missing fields
- suggest the next data entry or review step
- avoid inventing customer, supplier, price, delivery, payment, file, or quote details
- avoid creating official drafts that imply a commitment

## Confidence Model

Every routed output should include:

- confidence: `high`, `medium`, or `low`
- reason
- missing data
- source

Suggested interpretation:

- `high`: strong record match, enough required data, no major risk gap.
- `medium`: likely match, some missing data, recommendation is still useful.
- `low`: ambiguous instruction, missing core context, or high-risk assumptions.

## Future Implementation Notes

Future schema/API planning may define:

- `command_templates`
- `workflow_intents`
- `workflow_steps`
- `workflow_context_links`
- `approval_requests`

These should be planned separately before any schema migration or write route is implemented.
