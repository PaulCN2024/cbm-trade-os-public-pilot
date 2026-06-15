# Phase 0A: API Service Boundary Plan

## 1. Purpose

Define how CBM Trade OS should gradually refactor the current API layer into a cleaner service-layer architecture in future phases.

This document is planning only. It does not modify API files, database schema, UI, service code, or AI integrations.

## 2. Why CBM Trade OS Needs A Service Layer

CBM Trade OS is evolving into an AI-first foreign trade operating system. Future AI tools will need to analyze inquiries, draft replies, prepare supplier RFQs, draft quotations, organize documents, generate archive paths, and propose follow-ups.

AI tools should not directly touch raw API files or database queries. They should call controlled business services with clear safety rules, validation, audit records, and manual approval boundaries.

A service layer will make the system easier to test, safer to automate, and easier to migrate from mock/localStorage flows to Supabase-backed workflows.

## 3. Current API Boundary Issues

### api/inquiries.js responsibilities

Current `api/inquiries.js` has multiple responsibilities in one route file:

- read inquiries
- read leads
- read attachments
- read follow-up tasks
- create inquiry-related records
- normalize website inquiry input
- run rule-based inquiry analysis
- create customer/lead/inquiry/follow-up records
- convert lead to customer
- update lead status
- manage attachment metadata

This is workable for the pilot, but too broad for long-term AI-first workflows.

### api/customers.js responsibilities

Current `api/customers.js` handles customers and also dispatches several Step 2 resources because of Vercel Hobby function limits:

- customers
- companies
- products
- manufacturing capabilities
- AI inquiry analyses

This is acceptable as a deployment compatibility layer, but long-term business logic should move into services.

### Vercel serverless constraints

The current Vercel Hobby plan limits the number of Serverless Functions. This means API route consolidation may be necessary for deployment, but consolidation should not force business logic to remain mixed together.

Future structure should allow a small number of route files to call well-separated services.

## 4. Service-Layer Principles

- API routes should handle HTTP method routing, auth checks, request parsing, response formatting, and coarse validation.
- Services should handle business logic and workflow decisions.
- Repositories or data helpers should handle Supabase access.
- AI tools should call controlled services, not raw database logic.
- High-risk actions must always pass through approval-aware services.
- Services should be small, testable, and business-focused.
- Service outputs should be structured, not UI-specific.
- Customer-facing and factory-facing data boundaries should be enforced before output is exposed.

## 5. Suggested Future Folder Structure

```text
lib/services/customers/
lib/services/inquiries/
lib/services/suppliers/
lib/services/documents/
lib/services/communications/
lib/services/attachments/
lib/services/ai-drafts/
lib/services/approvals/
lib/services/numbering/
```

Possible supporting folders:

```text
lib/repositories/
lib/validators/
lib/policies/
lib/audit/
```

These folders are suggestions only and are not implemented in Phase 0A.

## 6. Suggested Future Service Responsibilities

### customers service

- read customer profiles
- summarize customer context
- link customer contacts
- prepare customer conversion preview
- avoid direct message sending

### inquiries service

- read inquiry lists and details
- normalize inquiry input
- classify business line
- detect missing information
- create inquiry analysis drafts
- prepare follow-up task drafts

### suppliers service

- manage supplier company/contact context
- prepare supplier RFQ drafts
- compare supplier quote inputs
- avoid automatic supplier communication

### documents service

- prepare customer-facing and factory-facing document drafts
- enforce hidden-field rules
- prepare archive and file naming previews
- avoid official export or sending without review

### communications service

- link messages to business objects
- summarize communication threads
- prepare reply drafts
- avoid automatic sending

### attachments service

- store attachment metadata
- link attachments to messages, inquiries, projects, orders, and documents
- prepare document summary tasks

### ai-drafts service

- create AI task records
- store AI draft outputs
- enforce draft-only status
- assign risk level
- require approval where needed

### approvals service

- record human review decisions
- distinguish internal approval from manual sending
- block high-risk automation

### numbering service

- generate future business codes such as inquiry, RFQ, quotation, PI, order, document, attachment, and AI task codes
- avoid overwriting existing exported files

## 7. Suggested Future API Route Responsibilities

API routes should:

- verify authentication and authorization
- parse request body and query parameters
- call the appropriate service function
- return structured JSON responses
- map service errors to safe HTTP errors
- avoid embedding business workflow logic directly
- avoid sending customer-facing output automatically

API routes should not:

- directly contain multi-step business workflows
- directly construct official documents
- directly send emails or WhatsApp messages
- directly confirm prices, delivery times, payment terms, bank information, orders, or shipment actions

## 8. Suggested Future AI Tool Integration Boundary

Future AI tools should call service-layer functions such as:

- `inquiries.analyzeInquiryDraftOnly(...)`
- `communications.createReplyDraft(...)`
- `suppliers.createSupplierRfqDraft(...)`
- `documents.createDocumentDraft(...)`
- `numbering.previewBusinessCode(...)`
- `approvals.requireManualReview(...)`

AI tools must receive structured service results and should not directly update Supabase tables.

All AI-generated customer-facing or supplier-facing output should be saved as draft-only and linked to an approval review workflow.

## 9. What Should Stay Unchanged In Phase 0A

- Existing API files should remain unchanged.
- Existing Supabase schema should remain unchanged.
- Existing Admin UI should remain unchanged.
- Existing Command Center behavior should remain unchanged.
- Existing Document Center services should remain unchanged.
- Existing Vercel routing should remain unchanged.
- Current safety boundaries should remain unchanged.

## 10. What Should NOT Be Implemented Yet

Do not implement yet:

- service folders or service files
- repository layer
- new migrations
- new API routes
- API route refactors
- OpenAI or model gateway calls
- email sending
- WhatsApp sending
- quotation sending
- PI sending
- supplier RFQ sending
- official document export workflow
- automatic approval or rejection
- automatic order, production, shipment, payment, compensation, or responsibility decisions

## 11. Low-Risk Future Refactoring Roadmap

Recommended sequence:

1. Document service boundaries and expected responsibilities.
2. Identify one low-risk read-only workflow, such as customer summary or inquiry summary.
3. Extract pure mapping/formatting logic into a service without changing API behavior.
4. Add tests around the extracted service.
5. Update the API route to call the service while preserving response shape.
6. Repeat for inquiry analysis, customer context, and document draft preparation.
7. Add AI draft persistence only after service boundaries are stable.
8. Add model gateway only after approval and audit flows are stable.

## 12. Acceptance Criteria For Future Implementation

Future service-layer implementation should be accepted only if:

- public API response shapes remain stable unless explicitly approved
- API routes become thinner and easier to inspect
- business logic is testable outside HTTP handlers
- AI tools call controlled services instead of raw database logic
- all high-risk actions remain blocked or approval-required
- draft-only behavior is preserved for AI-generated output
- no automatic customer or supplier messages are sent
- no official quotation or PI is issued automatically
- no price, delivery, payment, bank, order, production, shipment, compensation, or responsibility commitment is made automatically
- changes can be shipped incrementally without rebuilding the whole system
