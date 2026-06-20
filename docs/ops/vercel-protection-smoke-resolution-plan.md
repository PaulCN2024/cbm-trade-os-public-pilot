# Vercel Protection Smoke Resolution Plan

## 1. Purpose

Production browser smoke for the AI Prospecting Center preview deployment was blocked by Vercel Security Checkpoint / Deployment Protection.

This document defines safe next steps for future production smoke tests without exposing secrets, changing production behavior, modifying Vercel settings from Codex, or weakening CBM Trade OS business safety boundaries.

## 2. Incident Summary

Deployment:

- Production alias: https://project-7vo99.vercel.app
- Deployment URL: https://project-7vo99-ohqe415z8-paul-s-projects2026.vercel.app
- Deployment ID: dpl_qqhzxRhh6DmhK9aPDyxVwaewvP8M
- Target: production
- Status: Ready

Passed before the blocker:

- `npm test` passed with 471 tests.
- `npm run build` passed.
- Local browser preview passed.
- UI commit was pushed: `a50593e feat: add ai prospecting center preview`.
- Production deploy succeeded.
- Initial curl smoke mostly passed:
  - static root/admin assets responded
  - `/api/health` returned 200
  - admin-read protected routes returned JSON 401 auth gates, not 404
  - unknown admin-read resource returned stable JSON 404

Blocked:

- Production browser/admin smoke reached Vercel Security Checkpoint 403.
- Direct deployment URL showed Vercel SSO/protection behavior.
- The final production checkpoint doc was intentionally deferred because browser smoke did not pass.

## 3. Diagnosis

The app implementation itself passed local validation:

- local static browser preview loaded the Admin UI
- the `AI 开发客户` section rendered
- new preview markers were visible
- active controls inside the AI Prospecting section were 0
- no local horizontal overflow was observed
- no `undefined` or `null` text appeared in the new section
- no API, search, scraping, file, send, customer creation, quotation, PI, order, payment, production or shipment behavior was added

Production deployment also completed successfully:

- Vercel reported the deployment as Ready
- the deployment target was production
- the production alias was attached

The blocker is therefore a production verification access issue, not evidence of an app build failure.

Observed production verification behavior:

- curl/static endpoints initially returned expected results
- browser smoke hit Vercel Security Checkpoint 403
- direct deployment URL showed Vercel SSO/protection behavior
- protected admin-read API behavior remained auth-gated rather than missing

## 4. Recommended Resolution

Preferred resolution: use Vercel Protection Bypass for Automation for automated smoke tests and monitoring against protected deployments.

Manual setup required:

1. Paul creates or verifies a Protection Bypass for Automation secret in Vercel Project settings.
2. The secret is never pasted into code, committed to git, printed in logs, or stored in documentation.
3. The secret is exported locally only for the smoke-test shell as:

```sh
export VERCEL_AUTOMATION_BYPASS_SECRET="..."
```

4. Codex may use the secret only if it is already available as the environment variable `VERCEL_AUTOMATION_BYPASS_SECRET`.
5. Codex must fail safely if the variable is missing.
6. Codex must never print the variable value.

## 5. Automation Usage Plan

For curl-based smoke checks, use the bypass header:

```sh
curl \
  -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" \
  https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1
```

For Playwright/browser smoke checks, use extra HTTP headers:

```js
extraHTTPHeaders: {
  "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  "x-vercel-set-bypass-cookie": "true",
}
```

Do not write this into committed config unless explicitly approved later.

Recommended browser-smoke behavior:

- check the environment variable exists
- open the production Admin UI with the bypass header
- allow Vercel to set the bypass cookie for the session
- verify the Admin UI and `AI 开发客户` markers
- do not dump cookies, localStorage, headers or environment variables

## 6. Security Rules

Codex must not:

- hardcode the bypass secret
- commit the bypass secret
- print the bypass secret
- screenshot the bypass secret
- dump cookies
- dump localStorage
- log Authorization headers
- use Supabase service-role keys for smoke tests
- bypass admin auth using service-role keys
- change Vercel deployment protection settings
- create or rotate the bypass secret
- mutate production data
- run deployment commands during the bypass setup task unless separately approved

The bypass is for deployment protection only. It is not an admin API bearer token and must not be treated as one.

## 7. Future Task After Secret Exists

Recommended next task:

`CBM-CODEX-RELEASE-029 - Rerun AI Prospecting Production Smoke With Vercel Bypass`

That future task should:

- require `VERCEL_AUTOMATION_BYPASS_SECRET`
- stop safely if the environment variable is missing
- run curl smoke with `x-vercel-protection-bypass`
- run browser smoke with `x-vercel-protection-bypass`
- use `x-vercel-set-bypass-cookie: true` for browser smoke if needed
- verify `AI 开发客户`, `AI Prospecting`, `目标市场开发`, `相似客户发现`, `不自动搜索`, `不自动发送`, `不抓取 LinkedIn`, `不创建客户`, and `不生成报价`
- confirm active controls in the AI Prospecting section are 0
- confirm no business execution is available
- create the final production checkpoint only if smoke passes

## 8. Non-goals

This plan does not include:

- code changes
- UI changes
- API changes
- schema changes
- package changes
- Vercel setting changes by Codex
- secret creation
- production deploy
- authenticated admin JSON smoke
- business execution

## 9. Progress Report

- Full product vision: 38% -> 38%
- Internal MVP / foundation: 99% -> 99%
- Vercel Protection Smoke Resolution Plan: 0% -> 100%
