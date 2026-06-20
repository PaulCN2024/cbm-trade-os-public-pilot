# Knowledge Base UI Data-binding Plan

## Purpose

Plan how the static AI Knowledge Center preview should later bind to read-only Knowledge Base data.

This document does not modify Admin UI code, add fetch calls, change API paths, or implement data binding.

## Current UI

The current AI Knowledge Center is a static preview only.

It shows:

- category cards
- knowledge cards
- verification queue
- AI usage panel
- RAG roadmap preview
- safety panel

It does not call knowledge APIs, execute helpers, run RAG, upload files, parse documents, or generate AI answers.

## Future Data Sources

Map UI areas to future admin-read resources:

- summary cards => `GET /api/admin-read/knowledge-summary`
- category cards => `GET /api/admin-read/knowledge-categories`
- item cards => `GET /api/admin-read/knowledge-items`
- verification queue => `GET /api/admin-read/knowledge-review-queue`
- linked context => `GET /api/admin-read/knowledge-linked-context`

## Loading States

Future UI should handle:

- loading skeleton
- auth required
- database unavailable fallback
- empty state
- error state

Loading and error states should be compact and should not crowd the primary work area.

## Fallback Data

Fallback data must be:

- clearly marked demo/fallback
- not confused with real knowledge
- safe and static
- free of customer secrets
- free of supplier promises
- free of pricing commitments

Suggested state labels:

- `实时只读数据`
- `静态预览 fallback`
- `API 暂不可用，显示静态预览`
- `需要登录后查看知识库数据`

## UI Safety

The first data-bound UI should include:

- no edit button
- no upload button
- no delete button
- no RAG answer button
- no send button
- no approve/reject execution
- no customer-facing output
- all future actions shown as disabled or "later"

The knowledge module should stay read-only until schema, approval, audit, and safety plans are accepted.

## Validation

Future UI tests/checks should confirm:

- records render
- no active controls
- no `undefined` or `null`
- fallback works
- 401 auth gate is handled
- unknown routes do not break the page
- no route ID changes
- no navigation regression
- no horizontal overflow
- no unsafe file fields appear

## Implementation Steps

- KUI-1: add fetch helpers
- KUI-2: bind summary/cards/items
- KUI-3: bind review queue
- KUI-4: add fallback state
- KUI-5: test/build/smoke
- KUI-6: checkpoint

Each step should be a separate small task unless Paul approves a combined read-only implementation package.
