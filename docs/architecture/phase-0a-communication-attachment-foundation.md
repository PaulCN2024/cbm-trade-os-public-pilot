# Phase 0A: Communication + Attachment Foundation

## 1. Purpose

Define the future Communication + Attachment Foundation for CBM Trade OS before implementing database tables, API routes, UI pages, file upload, Gmail, WhatsApp, OCR, or AI SDK integration.

This document is planning only.

## 2. Why Communication + Attachment Foundation Matters For CBM Trade OS

Future AI drafts, inquiry analysis, document organization, customer follow-up, supplier RFQ, project knowledge, and after-sales review all depend on reliable communication and attachment boundaries.

Without a clear foundation, messages, drawings, quotations, PI, supplier files, and customer requirements become scattered and hard to audit.

## 3. Core Principle

Communication and attachments are business memory, not simple notes or files.

Every important customer or supplier interaction should preserve:

- source context
- related business object
- original message or file
- visibility and sensitivity
- AI draft/review relationship when AI is involved

## 4. Core Future Objects

- `communication_thread`
- `communication_message`
- `communication_attachment`
- `document`
- `task`
- `ai_task`
- `ai_draft`
- `approval_review`

## 5. Communication Thread Concept

`communication_thread` is a business conversation container.

It may relate to:

- customer company
- customer contact
- supplier company
- supplier contact
- inquiry
- project
- quotation
- order
- document
- task

Examples:

- website inquiry thread
- WhatsApp project discussion
- email quotation negotiation
- supplier RFQ discussion
- shipment update thread
- after-sales issue thread

## 6. Communication Message Concept

`communication_message` is a single inbound, outbound, internal, system, or AI-draft message inside a thread.

It should preserve:

- direction
- channel
- sender/recipient context
- message body or summary
- timestamp
- related business object links
- attachments if present

## 7. Communication Direction

Suggested values:

- `inbound`
- `outbound`
- `internal`
- `system`
- `ai_draft`

## 8. Communication Channels

Suggested values:

- `email`
- `whatsapp`
- `wechat`
- `phone`
- `meeting`
- `website`
- `alibaba`
- `made_in_china`
- `manual_note`
- `system_note`
- `ai_command`

## 9. Attachment Concept

`communication_attachment` is an attachment received or created during a communication event.

It should preserve:

- original source message
- filename
- attachment type
- visibility and sensitivity
- related business object
- whether it is original, generated, exported, or archived

## 10. Attachment Type Suggestions

- `drawing`
- `photo`
- `quotation`
- `supplier_quote`
- `pi`
- `invoice`
- `payment_slip`
- `product_spec`
- `packing_info`
- `video`
- `certificate`
- `screenshot`
- `other`

## 11. Visibility And Sensitivity

Suggested values:

- `normal`
- `internal`
- `confidential`
- `owner_only`
- `finance_only`
- `supplier_sensitive`
- `customer_sensitive`

Visibility rules should protect sensitive information such as supplier cost, internal notes, finance documents, payment slips, bank information, and customer-private files.

## 12. Relationship Rules

Communication and attachments should be linkable to:

- customer
- supplier
- inquiry
- project
- quotation
- PI
- order
- document
- task
- `ai_draft`
- `approval_review`

Attachments should preserve both:

- original communication context
- current business usage context

Example:

```text
communication_thread -> communication_message -> communication_attachment
communication_attachment -> inquiry/project/document
communication_attachment -> ai_task -> ai_draft -> approval_review
```

## 13. AI Usage Rules

AI may:

- summarize communication
- extract customer requirements
- identify missing information
- classify attachments
- suggest business links
- draft customer replies
- draft supplier RFQs
- create follow-up task suggestions
- suggest knowledge base drafts

AI must not:

- send messages automatically
- make price / delivery / payment / compensation commitments
- delete communication history
- overwrite confirmed attachments
- publish knowledge without approval

## 14. Human Review Rules

Human review is required when:

- communication contains price, delivery, payment, compensation, or quality responsibility
- attachment may affect quotation or order
- AI is uncertain about attachment classification
- duplicate or conflicting documents are detected
- a customer-facing or supplier-facing message is ready to send

Human review should record:

- reviewer
- decision
- note
- risk level
- related business object
- whether anything was manually sent later

## 15. Attachment-To-Document Relationship

Important attachments may later be promoted into Document Center.

Examples:

- customer drawing -> project document
- supplier quotation -> supplier quote record
- PI PDF -> official document record
- packing photo -> shipment document
- certificate -> product or shipment document

Phase 0A should only define this relationship. It should not implement promotion.

## 16. Versioning Relationship

Future attachments may create document versions.

Examples:

- revised drawing
- updated quotation
- corrected PI
- new packing list
- replacement certificate

Phase 0A should not implement file versioning yet.

## 17. What Should NOT Be Implemented In Phase 0A

Do not implement:

- database tables
- migrations
- API changes
- UI changes
- Gmail integration
- WhatsApp integration
- file upload implementation
- OCR
- AI SDK
- auto-send
- real attachment storage changes

## 18. Recommended Low-Risk Roadmap

Recommended order:

1. communication/attachment architecture doc
2. communication constants
3. attachment constants
4. pure classification helper stub
5. relationship planning
6. later schema planning
7. later API planning
8. later UI read-only preview

## 19. Acceptance Criteria For Future Implementation

Future implementation should be accepted only if:

- communication objects are clearly separated from documents
- attachments can be linked to business objects
- AI actions remain draft-only
- human approval is required for sensitive actions
- no auto-send behavior exists
- all future actions can be audited
