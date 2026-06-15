# Phase 0A: Business Object Relationship Map

## 1. Purpose

Define the future relationship map between core CBM Trade OS business objects before implementing schema, API, UI, or AI model changes.

This document is planning only. It does not create tables, migrations, API routes, UI pages, or AI integrations.

## 2. Why CBM Trade OS Needs A Business Object Relationship Map

CBM Trade OS is intended to become an AI-first foreign trade operating system, not a generic CRM.

AI can only assist reliably if each draft, message, document, task, quote, order, and attachment is linked to the correct business object. A clear relationship map helps prevent scattered data, duplicate records, unsafe automation, and unreviewable AI output.

## 3. Core Business Object Chain

Recommended core objects:

- Customer Company
- Customer Contact
- Inquiry
- Project
- Supplier Company
- Supplier Contact
- Supplier RFQ
- Supplier Quote
- Customer Quotation
- PI
- Order
- Purchase Order
- Shipment
- Payment
- After-sales Case
- Communication Thread
- Communication Message
- Communication Attachment
- Document
- Task
- Knowledge Article
- AI Task
- AI Draft
- Approval Review

## 4. Recommended Primary Relationships

- Customer Company has many Customer Contacts.
- Customer Company has many Inquiries.
- Inquiry may become one Project.
- Project may have many Supplier RFQs.
- Supplier Company has many Supplier Contacts.
- Supplier RFQ may receive many Supplier Quotes.
- Supplier Quote may support one or more Customer Quotation drafts.
- Customer Quotation may become one PI.
- PI may become one Order.
- Order may generate one or more Purchase Orders.
- Order may have one or more Shipments.
- Order may have one or more Payments.
- Shipment may have one or more Documents.
- Customer Company, Inquiry, Project, Order, Shipment, and After-sales Case may have Communication Threads.
- Communication Thread has many Communication Messages.
- Communication Message may have many Communication Attachments.
- Document may link to Inquiry, Project, Quotation, PI, Order, Shipment, Payment, or After-sales Case.
- Task may link to Customer Company, Customer Contact, Inquiry, Project, Quotation, PI, Order, Shipment, or After-sales Case.
- AI Task may link to any source business object.
- AI Draft belongs to one AI Task.
- Approval Review belongs to one AI Draft and may also reference the related business object.

## 5. Recommended Optional Relationships

- Inquiry may link to multiple Customer Contacts when several people are involved.
- Project may link to multiple Inquiries if a customer sends follow-up requirements.
- Customer Quotation may reference multiple Supplier Quotes.
- PI may reference one or more Customer Quotations.
- Order may reference multiple PIs only when business rules explicitly allow it.
- Shipment may reference multiple Orders only when combined shipping is used.
- Payment may reference PI, Order, or Customer Company depending on accounting workflow.
- Knowledge Article may reference Inquiry, Project, Supplier Quote, Document, After-sales Case, or AI Draft.
- Attachment may be attached directly to a business object even when no communication thread exists.

## 6. Relationship Examples

### Platform Inquiry From A New Customer

```text
Customer Company -> Customer Contact -> Inquiry -> Task
Inquiry -> AI Task -> AI Draft -> Approval Review
```

The inquiry is stored first. AI may summarize and detect missing information, but the output stays draft-only until reviewed.

### Customer Sends Drawing Attachment

```text
Customer Company -> Communication Thread -> Communication Message -> Communication Attachment
Communication Attachment -> Inquiry or Project
Attachment -> AI Task -> Document Summary Draft -> Approval Review
```

The drawing should be linked to both the original message and the relevant inquiry/project.

### Inquiry Converted To Supplier RFQ

```text
Inquiry -> Project -> Supplier RFQ
Supplier RFQ -> Supplier Company / Supplier Contact
Supplier RFQ -> AI Draft -> Approval Review
```

AI may draft the supplier RFQ, but the user must review before sending.

### Supplier Quote Converted To Customer Quotation Draft

```text
Supplier Quote -> Customer Quotation
Customer Quotation -> AI Task -> Quotation Draft -> Approval Review
```

Supplier cost information should not leak into customer-facing documents unless explicitly allowed.

### Quotation Converted To PI

```text
Customer Quotation -> PI -> Approval Review
PI -> Document
```

PI generation must remain manual-review controlled and must not be sent automatically.

### Project Experience Converted To Knowledge Article Draft

```text
Project -> Knowledge Article Draft
Knowledge Article Draft -> AI Task -> AI Draft -> Approval Review
```

The article can capture reusable product, pricing, packaging, supplier, or communication lessons.

## 7. Business Code References

Recommended future code fields:

- `customer_code`
- `supplier_code`
- `inquiry_code`
- `rfq_code`
- `quotation_code`
- `pi_code`
- `order_code`
- `document_code`
- `attachment_code`
- `ai_task_code`

These codes should be human-readable, stable, and unique within their business scope.

They should not replace UUID primary keys. They should help users search, discuss, archive, export, and verify records.

## 8. How AI Agents Should Use These Relationships

AI agents should:

- read linked context before drafting
- cite the source business object in generated drafts
- avoid mixing unrelated customers, projects, suppliers, or documents
- create draft-only outputs linked to `ai_task` and `ai_draft`
- mark missing context when relationships are incomplete
- escalate high-risk drafts to human approval
- never bypass approval review for commercial actions

## 9. How Attachments And Documents Should Link To Business Objects

Attachments should preserve original source context:

- uploaded by whom
- received through which communication thread/message
- related customer, inquiry, project, order, or shipment
- file type and purpose
- whether the attachment is original, generated, exported, or archived

Documents should link to the business object they represent, such as quotation, PI, order, shipment, or production instruction.

Customer-facing documents must not expose internal cost, profit, uplift, exchange-rate details, or factory-only notes.

## 10. How Communications Should Link To Business Objects

Communication Thread should represent a conversation context, such as:

- website inquiry
- email thread
- WhatsApp thread
- supplier RFQ discussion
- project negotiation
- shipment update
- after-sales case

Communication Message should link to its thread and may also reference a specific inquiry, project, quotation, order, shipment, document, or task.

AI may summarize or draft replies, but must not send messages automatically.

## 11. How Approval Reviews Should Link To AI Drafts And Business Objects

Approval Review should always link to an AI Draft.

It should also retain enough source context to answer:

- what generated this draft
- which business object it relates to
- who reviewed it
- what decision was made
- whether it was only approved internally
- whether it was manually sent later
- what risks were identified

`approved_internal` must not mean sent to customer or officially issued.

## 12. What Should NOT Be Implemented Yet In Phase 0A

Do not implement yet:

- database schema changes
- migrations
- new API routes
- UI CRUD pages
- OpenAI or other model calls
- email sending
- WhatsApp sending
- supplier RFQ sending
- quotation sending
- PI sending
- order creation automation
- shipment arrangement automation
- automatic payment, delivery, bank, compensation, or responsibility confirmation

## 13. Future Implementation Roadmap

Recommended order:

1. Finalize relationship map and naming conventions.
2. Design future table fields for relationship references.
3. Define business code generation rules.
4. Add read-only relationship examples using mock data.
5. Add API-only relationship lookups.
6. Add admin read-only relationship views.
7. Add manual write flows for low-risk records.
8. Add AI Draft & Approval persistence.
9. Add AI Model Gateway only after approval review is stable.

## 14. Acceptance Criteria For Future Implementation

Future implementation should be accepted only if:

- every AI draft links to a source business object
- every approval review links to an AI draft
- attachments preserve original communication context
- documents link to the related business object
- customer-facing and factory-facing data boundaries are enforced
- business codes are stable and human-readable
- AI agents can trace context without guessing
- no AI action sends messages or business commitments automatically
- high-risk actions remain manual-review controlled
