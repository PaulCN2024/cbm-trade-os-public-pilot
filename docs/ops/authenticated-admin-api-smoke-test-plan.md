# Authenticated Admin API Smoke Test Plan

## 1. Purpose

Plan how to safely verify protected Admin APIs in production without exposing secrets.

This plan covers authenticated read-only smoke testing for CBM Trade OS Admin API routes, especially `GET /api/admin-dashboard-summary`, while preserving production safety, token hygiene, and the no-write boundary.

## 2. Current Production Status

- UI2 production deployment is live at `https://project-7vo99.vercel.app`.
- Unauthenticated protected Admin APIs return `401`, which is expected.
- `/api/admin-dashboard-summary` is deployed and no longer returns `404`.
- `/api/follow-ups` is deployed and no longer returns `404`.
- `/api/health` returns `200`.
- Authenticated `200` JSON shape validation for `/api/admin-dashboard-summary` still needs a safe token workflow.

## 3. Target APIs

Primary target:

- `GET /api/admin-dashboard-summary`

Additional protected Admin read-only targets:

- `GET /api/customers`
- `GET /api/inquiries`
- `GET /api/follow-ups`
- `GET /api/admin-health`

Optional protected read-only targets when needed:

- `GET /api/companies`
- `GET /api/products`
- `GET /api/manufacturing-capabilities`
- `GET /api/ai-inquiry-analyses`

## 4. Expected Unauthenticated Behavior

For protected endpoints:

- `401` is expected without an admin Bearer token.
- `404` is a failure for deployed protected routes that should exist.
- `500` is a failure and should be investigated.

For public health:

- `/api/health` should return `200`.

## 5. Expected Authenticated Behavior

For `GET /api/admin-dashboard-summary`, authenticated response should be:

- HTTP `200`
- JSON includes:
  - `meta`
  - `summary_cards`
  - `workflow_queues`
  - `safety`
  - `warnings`

For other protected Admin APIs:

- HTTP `200`, or safe empty read-only JSON if no records are available
- No mutation
- No business execution
- No outbound message
- No approval execution
- No quote, PI, order, payment, production, or shipment action

## 6. Safe Token Handling Rules

- Token must never be printed in logs.
- Token must never be committed.
- Token must never be stored in the repository.
- Token must not be pasted into a Codex prompt unless the user explicitly provides a safe temporary token and accepts transcript exposure risk.
- Token should be passed through a local shell variable or secure secret manager.
- Commands and reports should redact token values.
- Prefer a short-lived or revocable token if available.
- Do not add token values to `.env`, docs, screenshots, terminal transcripts, or committed files.
- Do not use production secrets in Codex output.
- Do not bypass or disable auth.

## 7. Recommended Manual Operator Workflow

Use a local shell variable with a placeholder. Do not commit this value.

```bash
export ADMIN_API_TOKEN="<paste-token-locally-do-not-commit>"

curl -sS \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  https://project-7vo99.vercel.app/api/admin-dashboard-summary
```

Safer status-and-shape check pattern:

```bash
export ADMIN_API_TOKEN="<paste-token-locally-do-not-commit>"

status="$(
  curl -sS \
    -o /tmp/cbm-admin-dashboard-summary.json \
    -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_API_TOKEN" \
    https://project-7vo99.vercel.app/api/admin-dashboard-summary
)"

node -e '
const fs = require("fs");
const status = Number(process.argv[1]);
const body = fs.readFileSync("/tmp/cbm-admin-dashboard-summary.json", "utf8");
let keys = [];
try {
  keys = Object.keys(JSON.parse(body));
} catch {}
console.log(JSON.stringify({
  endpoint: "/api/admin-dashboard-summary",
  status,
  keys,
  token_printed: false
}));
' "$status"
```

Important:

- Do not include a real token in this document.
- Do not echo `$ADMIN_API_TOKEN`.
- Do not run the shell with `set -x`.
- Delete temporary response files after review if they might contain sensitive business data.

## 8. Verification Checklist

For `GET /api/admin-dashboard-summary`:

- Confirm HTTP `200`.
- Confirm JSON shape includes `meta`.
- Confirm JSON shape includes `summary_cards`.
- Confirm JSON shape includes `workflow_queues`.
- Confirm JSON shape includes `safety`.
- Confirm JSON shape includes `warnings`.
- Confirm `safety.human_review_required` is `true`.
- Confirm disabled actions include restrictions for quote/order/payment/production/shipment-related capabilities.
- Confirm no `POST`, `PATCH`, `PUT`, or `DELETE` requests were used.
- Confirm no write endpoint was called.
- Confirm no official business action was implied or executed.

For other protected Admin APIs:

- Confirm HTTP `200`.
- Confirm response is read-only JSON.
- Confirm empty lists are acceptable when no records exist.
- Confirm no mutation fields or executable action links are introduced.

## 9. Redaction And Reporting Template

Use this template for a future authenticated smoke report:

| Endpoint | HTTP status | Shape valid? | Auth method used? | Token printed? | Notes |
| --- | ---: | --- | --- | --- | --- |
| `/api/admin-dashboard-summary` | `200` | Yes / No | Bearer token via local shell variable | No | Confirmed required top-level keys. |
| `/api/customers` | `200` | Yes / No | Bearer token via local shell variable | No | Read-only check only. |
| `/api/inquiries` | `200` | Yes / No | Bearer token via local shell variable | No | GET only. |
| `/api/follow-ups` | `200` | Yes / No | Bearer token via local shell variable | No | GET only. |
| `/api/admin-health` | `200` | Yes / No | Bearer token via local shell variable | No | Admin health check. |

Report only:

- endpoint
- HTTP status
- top-level JSON keys
- whether token was printed
- safe notes

Do not report:

- token value
- full customer records
- private inquiry details
- private file paths
- customer contact details
- internal commercial notes

## 10. What Not To Do

- Do not paste a secret token into a Codex prompt.
- Do not commit a token.
- Do not save `.env` changes.
- Do not modify production environment variables.
- Do not disable auth.
- Do not bypass auth.
- Do not use force or workaround access.
- Do not test `POST`, `PATCH`, `PUT`, or `DELETE` in production unless specifically approved.
- Do not run write actions.
- Do not send messages.
- Do not approve or reject records.
- Do not generate quotations, PI, contracts, orders, payment confirmations, production confirmations, or shipment confirmations.
- Do not print full API payloads if they may contain real business data.

## 11. Recommended Next Task

If a safe temporary token is available later:

`CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution`

If no safe token is available:

`CBM-CODEX-SPRINT-SAFETY-001 - Disabled Action And Approval Boundary Audit`
