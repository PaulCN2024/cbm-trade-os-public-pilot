# Knowledge Base RLS Read Policy Plan

## Purpose

Supabase Advisor reports that the new `knowledge_*` tables have Row Level Security disabled.

Before real business knowledge is stored, these tables must be protected at the database level, not only at the Admin Read API layer.

This plan defines the first safe RLS/read policy step for the Knowledge Base foundation.

## Current State

- 7 `knowledge_*` tables exist.
- DEMO knowledge data has been inserted and verified.
- Supabase Advisor reports `RLS Disabled in Public` for the new knowledge tables.
- No real confidential customer, supplier, quotation, SOP, file, or operational knowledge should be stored yet.
- Admin-read knowledge routes are currently protected at the application/API level through an authenticated Bearer token gate.

The current row counts verified after SQL execution are:

| Table | Count |
| --- | ---: |
| `knowledge_categories` | 7 |
| `knowledge_items` | 12 |
| `knowledge_sources` | 12 |
| `knowledge_reviews` | 12 |

Knowledge item status distribution:

| Status | Count |
| --- | ---: |
| `draft` | 2 |
| `needs_review` | 6 |
| `verified` | 4 |

## Existing Security Pattern Findings

Existing migrations show two relevant patterns:

- Early CRM pilot tables used `auth.uid()` ownership checks for read/write policies.
- Later pilot/admin-read tables use broad authenticated read policies with `USING (true)` and write policies guarded by authenticated ownership checks.

The current `api/_supabase.js` Admin API pattern requires an authenticated Bearer token before creating a Supabase client with the publishable key. This means admin-read routes are already application-auth gated.

DB-level RLS is still needed because:

- Supabase tables should not remain public even if API routes are protected.
- RLS gives a database-level safety backstop for future direct Supabase access paths.
- Supabase Advisor correctly flags unprotected public tables as a security risk.
- Future real knowledge may include confidential supplier, quotation, customer, document, SOP, pricing, and compliance material.

## Security Goal

The first-stage RLS policy should:

- enable RLS on all `knowledge_*` tables
- allow authenticated read only
- block public/anonymous direct table reads
- add no write policies
- not affect existing non-knowledge tables
- not enable RAG, embeddings, file parsing, or business execution

## Tables Covered

- `knowledge_categories`
- `knowledge_items`
- `knowledge_sources`
- `knowledge_links`
- `knowledge_reviews`
- `knowledge_versions`
- `knowledge_usage_logs`

## Proposed First-stage Policy

For each table:

1. Run `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY`.
2. Create one `FOR SELECT TO authenticated` policy.
3. Use `USING (true)` for this first internal trial policy.
4. Add no `INSERT`, `UPDATE`, or `DELETE` policy.

This is intentionally simple and matches the current internal authenticated admin-read model.

## Why Authenticated Read Only

Internal authenticated users/admin flows can read knowledge records through approved admin-read paths, while public or anonymous users cannot directly read the tables.

This is the smallest safe database-level improvement before real knowledge is stored.

## Limitations

This first-stage model is not final.

Known limitations:

- not tenant-scoped yet
- not role-scoped yet
- does not enforce `visibility_scope` at DB level yet
- does not define reviewer-only or manager-only access
- acceptable only for the current single-project/internal trial baseline
- must evolve before multi-tenant, customer-facing, supplier-facing, or sensitive production knowledge usage

## Future Stricter Model

Later policy design should consider:

- `company_id` / `tenant_id`
- role-based access
- `visibility_scope` filtering
- confidential internal-only restrictions
- reviewer role
- manager/admin role
- audit logs for knowledge usage
- write approval workflow for knowledge creation and verification
- stricter policies for quotations, supplier data, pricing rules, and customer-specific knowledge

## Safety Boundary

This plan does not allow:

- writes
- service-role exposure
- public anonymous read
- existing non-knowledge table changes
- destructive SQL
- RAG execution
- embeddings/vector storage
- AI answer generation
- file upload, parsing, OCR, or download
- quotation, PI, order, payment, production, shipment, or any business execution

