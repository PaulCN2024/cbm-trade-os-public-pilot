# Authenticated Admin-read Smoke Checklist

## Purpose

Provide a safe checklist for verifying authenticated Admin-read resources after Paul logs in normally or provides a safe temporary admin bearer token.

## Preconditions

- Use either a safe authenticated browser session or a safe temporary admin token.
- Do not print the token.
- Do not commit the token.
- Do not use a service-role key.
- Do not mutate production data.
- Do not dump cookies, localStorage, sessionStorage, or Authorization headers.
- Do not run SQL, migrations, deployment commands, or write actions.

## Routes To Check

- `/api/admin-read/dashboard-summary`
- `/api/admin-read/customers`
- `/api/admin-read/inquiries`
- `/api/admin-read/ai-review`
- `/api/admin-read/supplier-capabilities`
- `/api/admin-read/documents`
- `/api/admin-read/pre-quotation-review`
- `/api/admin-read/quotations`

## Expected Safe Response Shape

For each route, verify only the safe summary:

- HTTP status: 200
- Content type: JSON
- Top-level keys only
- Records array presence and count, when applicable
- Summary object presence, when applicable
- Safety object presence, when applicable
- Warnings array presence and warning names only

Do not print full records if they may contain business-sensitive data.

## Unsafe Fields Checklist

Responses must not expose:

- tokens
- service keys
- `storage_path`
- `file_url`
- signed URLs
- supplier/internal cost
- margin/profit
- bank/payment data
- quotation item internal costing
- raw file content

## Reporting Format

For each route, report:

| Route | Status | Record count | Warnings | Safety disabled actions | Notes |
| --- | --- | --- | --- | --- | --- |
| `/api/admin-read/...` | 200 / 401 / 403 / 500 | Count only | Names only | Count only | Safe summary only |

## Failure Handling

- 401: login or token missing.
- 403: role/RLS issue.
- 500: server/query issue.
- Unsafe field present: stop and mark high risk.
- Non-JSON response: stop and inspect endpoint safely without printing secrets.

## Non-goals

- No mutation.
- No business execution.
- No send/RFQ/quote/PI/order/payment/production/shipment action.
- No secrets.
- No storage/file operations.
