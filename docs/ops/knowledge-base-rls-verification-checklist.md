# Knowledge Base RLS Verification Checklist

## Purpose

Verify that Knowledge Base RLS/read policies were applied safely after Paul runs the approved manual SQL pack.

This checklist is for post-execution verification only. It does not approve write behavior, RAG, file processing, or business execution.

## Expected DB Result

Expected database state after manual SQL execution:

- all `knowledge_*` tables have `rowsecurity = true`
- each `knowledge_*` table has an authenticated `SELECT` policy
- no write policies exist for the first-stage Knowledge Base RLS pack

Tables to verify:

- `knowledge_categories`
- `knowledge_items`
- `knowledge_sources`
- `knowledge_links`
- `knowledge_reviews`
- `knowledge_versions`
- `knowledge_usage_logs`

## Expected API Behavior

Expected production behavior after RLS is applied:

- unauthenticated admin-read knowledge routes continue returning `401`
- unknown admin-read route remains stable JSON `404`
- non-GET requests remain `405`
- authenticated routes should return `200` if a safe token/session is available

Knowledge routes to verify:

- `GET /api/admin-read/knowledge-summary`
- `GET /api/admin-read/knowledge-categories`
- `GET /api/admin-read/knowledge-items`
- `GET /api/admin-read/knowledge-review-queue`
- `GET /api/admin-read/knowledge-linked-context`

## Expected UI Behavior

Expected Admin UI behavior:

- unauthenticated/fallback behavior remains safe
- authenticated UI should show real DEMO knowledge records if login/session works
- no active controls
- no visible `undefined` or `null`
- no upload behavior
- no RAG behavior
- no write behavior
- no AI answer generation
- no quote, PI, order, payment, production, or shipment behavior

## Deferred

Deferred beyond this first-stage RLS pack:

- tenant-scoped RLS
- role-based policies
- `visibility_scope` DB enforcement
- reviewer role policies
- controlled write approval workflow
- audit-log-backed knowledge usage workflow
- RAG, embedding, retrieval, or AI answer generation

## Next Codex Task

`CBM-CODEX-KNOWLEDGE-RLS-POST-VERIFY-001`

