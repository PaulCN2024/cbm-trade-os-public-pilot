# Phase UI-3 Knowledge Base Functional Foundation Plan

## Purpose

This plan defines how the current static AI Knowledge Center preview becomes a real read-only business knowledge base.

The goal is to turn the preview into a safe, source-tracked, human-verifiable foundation for future AI-assisted foreign trade workflows without adding writes, RAG, embeddings, file ingestion, AI answer generation, or business execution in the first functional stage.

## Current State

- The Admin UI has a static AI Knowledge Center preview.
- There are no knowledge database tables.
- There are no `admin-read` knowledge routes.
- There is no real data binding for knowledge records.
- There is no RAG implementation.
- There is no embedding pipeline or vector database.
- There is no file ingestion, file parsing, OCR, or raw content extraction.
- There is no human verification workflow implemented.

## Target State

The first real functional stage should support:

- structured knowledge records
- knowledge categories
- source tracking
- human verification status
- linked products, suppliers, customers, inquiries, files, quotations, capabilities, countries, ports, and trade terms
- read-only API resources under the existing Admin Read Dispatcher
- read-only UI binding
- safe demo seed data
- safety labels and risk levels
- future RAG readiness through taxonomy, source metadata, verification state, freshness, and visibility scope

## Why Read-only First

The knowledge base should first become trustworthy before AI uses it for recommendations or later RAG.

Read-only first is safer because:

- operators can inspect real knowledge records without editing them from the UI
- source and verification metadata can be reviewed before any AI retrieval
- unverified records can be clearly separated from verified knowledge
- confidential/internal-only rules can be labeled before any customer-facing workflow exists
- fallback/demo data can be tested without implying real production knowledge

AI-first does not mean AI-trusted by default. In CBM Trade OS, business-risk knowledge must remain human-reviewed before it can influence quotations, customer replies, supplier matching, or operational decisions.

## Functional Scope

In scope for the first implementation:

- read-only knowledge items
- read-only categories
- read-only sources
- read-only verification status
- demo seed records
- `admin-read` route planning and later GET-only resources
- UI data rendering from read-only resources
- static fallback data
- no write action

Out of scope for the first implementation:

- create, edit, delete, approve, reject, or archive knowledge from UI
- file upload
- file download
- OCR
- file parsing
- RAG
- embeddings
- vector database
- AI answer generation
- customer-facing output
- auto-send
- pricing commitment
- supplier commitment
- quotation, PI, order, payment, production, or shipment execution

## Primary User Workflows

### A. Paul Checks Product Knowledge

Paul opens AI Knowledge Center, reviews product knowledge such as aluminum window inquiry checklists, curtain wall quote readiness, ceiling system comparisons, and product-specific safety notes.

The UI should show whether each item is verified, what source it came from, and whether it is safe for internal reference only.

### B. Paul Checks Quotation Rule Knowledge

Paul reviews quotation rules such as FOB/CIF notes, tax-inclusive versus non-tax quotes, price validity reminders, and manual-confirmation boundaries.

The knowledge base must not generate or confirm prices. It only explains rules and reminders for human review.

### C. Paul Checks Supplier Knowledge

Paul reviews supplier capability notes, process limits, MOQ, lead-time notes, packaging constraints, quality notes, and risk comments.

Supplier knowledge must never imply confirmed production feasibility, delivery time, price, or supplier commitment without current manual confirmation.

### D. Paul Checks Communication Templates

Paul reviews English, Spanish, WhatsApp, supplier inquiry, clarification, complaint, or delay-explanation templates.

Templates remain draft guidance only. They must not be auto-sent.

### E. Paul Reviews Unverified AI-generated Summaries Later

In a later phase, AI may draft summaries from records or documents. Those summaries must enter a `needs_review` queue before becoming trusted knowledge.

Unverified AI summaries must not be shown as confirmed facts or safe customer-facing statements.

### F. AI Copilot References Verified Knowledge Later

In a future AI Copilot phase, AI can retrieve verified knowledge with citations, confidence, risk level, freshness, and visibility scope.

If knowledge is weak, missing, outdated, unverified, or confidential, the Copilot must warn or refuse instead of inventing.

## Role In The Whole OS

The knowledge base connects to:

- Inquiry analysis: identify missing information, product category, risk, and next human step.
- Supplier matching: reference supplier capabilities and constraints without making commitments.
- Quotation pre-review: show checklist rules and quote-readiness boundaries.
- AI prospecting: provide safe product/category language and compliance rules.
- File Center: link document metadata to extracted or manually entered knowledge later without exposing raw private files.
- Customer communication: support draft-only templates and tone guidance.
- Future AI Copilot: provide cited, source-tracked knowledge for internal operator assistance.

## Functional Milestones

- KBF-1: data model plan
- KBF-2: schema migration
- KBF-3: demo seed data
- KBF-4: admin-read route
- KBF-5: UI real data binding
- KBF-6: human verification queue preview
- KBF-7: source/version tracking
- KBF-8: RAG architecture later

## Success Criteria

- knowledge data can be stored
- knowledge data can be read safely
- UI can show real records
- each item has source, confidence, and verification state
- no unverified knowledge is shown as safe for customer commitment
- tests and build pass in implementation tasks
- deployment smoke passes after implementation tasks

## Recommended Next Task

Recommended next executable task:

`CBM-CODEX-COMBO-KNOWLEDGE-DATA-READONLY-001 - Implement Knowledge Base Read-only Data Foundation`

This task should not start until Paul approves the schema and read-only implementation boundaries.
