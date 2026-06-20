# Phase UI-3 Knowledge Base Data Model Plan

## Purpose

Define the future data model for the CBM Trade OS Knowledge Base.

This document is a schema plan only. It does not create migrations, run SQL, modify Supabase, modify API code, modify UI code, or seed data.

## Core Design Principles

- Source-tracked: every knowledge item should identify where it came from.
- Human-verifiable: AI-generated or imported knowledge should not become trusted automatically.
- Versioned: business knowledge changes over time and needs traceable revisions.
- Multilingual: records may be Chinese, English, Spanish, or mixed.
- Linked to business objects: knowledge can relate to products, suppliers, customers, inquiries, quotations, files, capabilities, countries, ports, and trade terms.
- Safe for future RAG: taxonomy, verification, visibility, risk, and freshness must exist before embeddings.
- Tenant/company scoped later: future multi-company use should not require a redesign.
- Read-only first: the first UI/API implementation should only read and display records.

## Proposed Tables

### A. `knowledge_categories`

Planned fields:

- `id uuid primary key`
- `slug text unique`
- `name_zh text`
- `name_en text`
- `description text`
- `parent_category_id uuid nullable`
- `sort_order integer`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Purpose:

Store the taxonomy for product knowledge, supplier knowledge, quotation rules, file knowledge, communication templates, trade SOP, and compliance/safety rules.

### B. `knowledge_items`

Planned fields:

- `id uuid primary key`
- `title text`
- `category_id uuid`
- `subcategory text nullable`
- `language text`
- `summary text`
- `content text`
- `source_type text`
- `source_reference text nullable`
- `confidence_level text`
- `human_verified boolean`
- `verification_status text`
- `risk_level text`
- `visibility_scope text`
- `effective_from date nullable`
- `expires_at date nullable`
- `owner_name text nullable`
- `tags text[] nullable`
- `created_at timestamptz`
- `updated_at timestamptz`
- `archived_at timestamptz nullable`

Purpose:

Store the core business knowledge records. The first implementation should project only safe display fields through `admin-read`.

### C. `knowledge_sources`

Planned fields:

- `id uuid primary key`
- `knowledge_item_id uuid`
- `source_type text`
- `source_title text`
- `source_url text nullable`
- `source_file_id uuid nullable`
- `source_notes text nullable`
- `captured_at timestamptz`
- `created_at timestamptz`

Purpose:

Track where knowledge came from. For private files, the UI should show only safe source labels and must not expose storage paths, private bucket names, signed URLs, or raw file content.

### D. `knowledge_links`

Planned fields:

- `id uuid primary key`
- `knowledge_item_id uuid`
- `linked_entity_type text`
- `linked_entity_id uuid nullable`
- `linked_entity_label text nullable`
- `relationship_type text`
- `created_at timestamptz`

Linked entity types:

- `product`
- `supplier`
- `customer`
- `inquiry`
- `quotation`
- `file`
- `capability`
- `country`
- `port`
- `trade_term`

Purpose:

Connect knowledge items to existing and future business records without duplicating private record data.

### E. `knowledge_reviews`

Planned fields:

- `id uuid primary key`
- `knowledge_item_id uuid`
- `review_status text`
- `reviewer_name text nullable`
- `review_notes text nullable`
- `reviewed_at timestamptz nullable`
- `created_at timestamptz`

Purpose:

Record human review state. First implementation can read this data later, but should not create approve/reject UI execution.

### F. `knowledge_versions`

Planned fields:

- `id uuid primary key`
- `knowledge_item_id uuid`
- `version_number integer`
- `title text`
- `summary text`
- `content text`
- `change_reason text nullable`
- `created_by text nullable`
- `created_at timestamptz`

Purpose:

Track changes to knowledge content and support future freshness/review workflows.

### G. `knowledge_usage_logs`

Planned fields:

- `id uuid primary key`
- `knowledge_item_id uuid`
- `used_by_module text`
- `used_for text`
- `output_type text`
- `user_confirmed boolean nullable`
- `created_at timestamptz`

Purpose:

Plan future auditability for AI Copilot, inquiry analysis, quotation pre-review, and RAG usage. This table should not be used until a controlled logging policy is approved.

## Enumerations / Allowed Values

### `language`

- `zh`
- `en`
- `es`
- `mixed`

### `source_type`

- `manual_sop`
- `supplier_record`
- `customer_inquiry`
- `quotation_note`
- `product_catalog`
- `installation_manual`
- `email_template`
- `ai_draft`
- `external_public_reference`
- `file_metadata`

### `confidence_level`

- `low`
- `medium`
- `high`

### `verification_status`

- `draft`
- `needs_review`
- `verified`
- `outdated`
- `archived`

### `risk_level`

- `low`
- `medium`
- `high`

### `visibility_scope`

- `internal_only`
- `ai_reference_only`
- `customer_safe_after_review`
- `confidential`

## Index Strategy

Future migration should consider indexes for:

- `knowledge_items.category_id`
- `knowledge_items.language`
- `knowledge_items.verification_status`
- `knowledge_items.risk_level`
- `knowledge_items.human_verified`
- `knowledge_items.source_type`
- `knowledge_items.expires_at`
- `knowledge_items.tags`
- `knowledge_links.linked_entity_type` + `knowledge_links.linked_entity_id`

Indexes should be added conservatively and only after table definitions are accepted.

## RLS / Access-control Plan

Future RLS should support:

- company or tenant scoping later
- read-only admin trial access
- no public anonymous access
- no direct customer-facing access
- protected confidential/internal-only rules
- future role separation for operator, manager, finance, and admin review

The first implementation should keep knowledge resources behind the existing admin auth gate.

## Migration Safety

Future migration must:

- create new knowledge tables only
- avoid destructive SQL
- not use `DELETE`, `DROP`, or `ALTER` against existing production tables
- use safe default values
- add check constraints carefully
- keep seed data clearly prefixed with `DEMO_`
- be reviewed separately before any SQL is run

## Seed Data Relationship

Plan 8-12 demo knowledge items across:

- product knowledge
- supplier knowledge
- quotation rules
- customer communication
- file knowledge
- compliance rules

Demo data should be safe, non-confidential, clearly labeled, and not mistaken for live customer or supplier commitments.

## UI Mapping

- Category cards map to `knowledge_categories`.
- Knowledge list cards map to `knowledge_items`.
- Verification queue maps to `knowledge_reviews` plus `knowledge_items.verification_status`.
- AI usage panel maps to `visibility_scope`, `confidence_level`, `human_verified`, and `risk_level`.
- RAG roadmap remains static until RAG architecture is separately approved.
- Source pills map to `knowledge_sources.source_type`, `source_title`, and safe labels only.

## Non-goals

- No embedding columns now unless later needed.
- No vector extension now.
- No file content table now.
- No AI answer cache now.
- No write UI now.
- No customer-facing output now.
