# Phase UI-3 Knowledge Admin-read API Plan

## Purpose

Plan future read-only Admin API resources for the Knowledge Base.

This is an API plan only. It does not modify `api/admin-read.js`, create routes, add schema, run SQL, or deploy.

## Existing API Constraint

Vercel Hobby routable function count is strict for this project.

Do not create new physical API files for Knowledge Base read-only resources if the current limit remains tight. Prefer extending the existing dispatcher:

`api/admin-read.js`

The current dispatcher already supports:

- GET-only behavior
- protected resources behind the admin auth gate
- stable JSON 404 for unknown resources
- 405 `Allow: GET` for non-GET requests
- explicit safe projection functions
- no write behavior

Knowledge resources should follow the same pattern.

## Future Routes

Plan routes under the Admin Read Dispatcher:

- `GET /api/admin-read/knowledge-summary`
- `GET /api/admin-read/knowledge-categories`
- `GET /api/admin-read/knowledge-items`
- `GET /api/admin-read/knowledge-review-queue`
- `GET /api/admin-read/knowledge-linked-context`

These routes are future targets only.

## Route Behavior

All knowledge routes should be:

- GET only
- auth-gated using the existing admin auth pattern
- stable JSON 404 for unknown resources
- 405 with `Allow: GET` for non-GET requests
- safe fallback if the database is unavailable
- no writes
- no service-role exposure in normal read resources
- no secret logging
- no raw file content
- no storage path or signed URL exposure

## Response Shapes

### `knowledge-summary`

Example shape:

```json
{
  "meta": {
    "source": "admin_read",
    "resource": "knowledge-summary",
    "is_fallback": false
  },
  "summary": {
    "total_items": 12,
    "verified_items": 5,
    "needs_review_items": 4,
    "outdated_items": 1,
    "high_risk_items": 2,
    "categories_count": 7
  },
  "safety": {
    "human_review_required": true,
    "disabled_actions": ["create", "update", "delete", "run_rag", "generate_answer", "send"]
  },
  "warnings": []
}
```

### `knowledge-categories`

Example `records[]` fields:

- `id`
- `slug`
- `name_zh`
- `name_en`
- `description`
- `sort_order`
- `item_count`
- `verified_count`
- `needs_review_count`

### `knowledge-items`

Example `records[]` fields:

- `id`
- `title`
- `category`
- `language`
- `summary`
- `source_type`
- `confidence_level`
- `human_verified`
- `verification_status`
- `risk_level`
- `visibility_scope`
- `tags`
- `updated_at`

Do not expose:

- raw confidential content
- storage paths
- signed URLs
- private bucket names
- customer private details beyond safe linked labels
- internal price/margin/cost rules unless scoped as confidential/internal-only

### `knowledge-review-queue`

Example `records[]` fields:

- `id`
- `title`
- `reason`
- `verification_status`
- `risk_level`
- `source_type`
- `last_updated`

This endpoint is display-only. It must not approve, reject, edit, archive, or publish knowledge.

### `knowledge-linked-context`

Example `records[]` fields:

- `knowledge_item_id`
- `linked_entity_type`
- `linked_entity_label`
- `relationship_type`

The first implementation should avoid returning full linked records. It should expose only safe labels needed for context.

## SQL / Select Strategy

Future implementation should:

- use explicit column lists
- avoid `select *`
- limit records
- sort records stably
- use safe joins or separate lookups only when needed
- avoid exposing private fields from linked tables

Recommended limits:

- summary: aggregate only
- categories: up to 50
- items: up to 80
- review queue: up to 20
- linked context: up to 100

## Fallback Strategy

If the database is unavailable, the route may return clearly marked fallback demo data.

Fallback payloads must include:

- `source: "fallback_demo"`
- `safety: "read_only_preview"`
- `is_fallback: true`
- `warnings[]` explaining which source was unavailable

Fallback content must not imply real production knowledge.

## UI Consumption

Future `admin/ui-foundation/app.js` should consume these read-only resources through local fetch helpers such as:

- `fetchKnowledgeSummary`
- `fetchKnowledgeCategories`
- `fetchKnowledgeItems`
- `fetchKnowledgeReviewQueue`

No implementation is included in this plan.

## Tests

Future tests should cover:

- GET returns 401 without auth
- unknown resource returns JSON 404
- POST returns 405
- fallback shape is stable
- route count stays within Vercel limit by using the existing dispatcher
- response does not expose forbidden file fields
- no write behavior exists

## Implementation Restrictions

- No new physical API files unless separately approved.
- No write routes.
- No secret logging.
- No service role exposure for normal admin-read knowledge resources.
- No RAG execution.
- No embedding generation.
- No file parsing or OCR.
- No business execution.
