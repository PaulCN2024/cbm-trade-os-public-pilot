# Knowledge Base Post-SQL Verification Checklist

## Purpose

Define what Paul should report after manually applying the Knowledge Base SQL in Supabase Dashboard SQL Editor, and what Codex should verify afterward.

## What Paul Should Report After Manual SQL Execution

Paul should provide:

- Migration success or failure.
- DEMO seed success or failure.
- `knowledge_categories_count`.
- `knowledge_items_count`.
- Any SQL error text.
- Optional screenshots, only if they contain no secrets.

Paul should not provide:

- Supabase access tokens.
- Database URLs.
- Database passwords.
- Service-role keys.
- Request headers.
- Cookies.
- Browser localStorage or sessionStorage.

## Codex Verification After Paul Executes SQL

Future Codex should verify:

- Production knowledge routes are still deployed and not 404:
  - `GET /api/admin-read/knowledge-summary`
  - `GET /api/admin-read/knowledge-categories`
  - `GET /api/admin-read/knowledge-items`
  - `GET /api/admin-read/knowledge-review-queue`
  - `GET /api/admin-read/knowledge-linked-context`
- Unauthenticated access remains safely auth-gated or fallback-compatible.
- Authenticated JSON works if Paul provides a safe login/session method.
- AI Knowledge Center UI renders knowledge data if auth is available.
- Static/fallback behavior still works when unauthenticated.
- No visible `undefined` or `null` appears.
- Knowledge section still has no active write controls.
- No write, upload, RAG, embedding, OCR, AI answer generation, or business execution behavior was introduced.

## Future Task

```text
CBM-CODEX-KNOWLEDGE-POST-SQL-VERIFY-001
```

Goal:

Verify Knowledge Base real data after manual SQL execution.

Suggested scope:

1. Inspect Paul's reported row counts and SQL result.
2. Verify production admin-read knowledge routes remain deployed.
3. If safe authenticated access exists, verify JSON shape and real DEMO records.
4. Verify AI Knowledge Center UI behavior.
5. Update SQL application report and project progress only after evidence.

## Safety

Future verification must preserve:

- No token extraction.
- No secrets.
- No destructive SQL.
- No database writes.
- No Supabase CLI requirement.
- No file upload, download, parsing, OCR, or storage mutation.
- No RAG or embedding generation.
- No send, approve, reject, RFQ, quotation, PI, order, payment, production, or shipment execution.
