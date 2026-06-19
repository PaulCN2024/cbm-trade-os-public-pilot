# Phase UI-1 Global Shell Cleanup Plan

## 1. Purpose

This document plans a small future cleanup of the global Admin UI shell after the Static Workbench Preview passed browser review.

The cleanup should reduce the unfinished prototype feeling caused by English shell labels, prominent mock controls, repeated static/mock text, and global status copy that competes with the Workbench.

This is planning only. It does not implement shell cleanup and does not modify Admin UI files.

## 2. Current Shell Problems

Current known global shell issues:

- English `Dashboard` label remains in the sidebar.
- `Admin Dashboard` title may not match the Chinese Workbench direction.
- Topbar mock/disabled controls feel unfinished:
  - `Static mock`
  - `Export view - Not connected`
  - `Add New - Coming later`
  - `Create Draft - Mock only`
- Global shell still feels like a prototype even though the Workbench content is more workflow-first.
- Shell labels are less localized than content sections.
- Too much status/debug wording competes with the Workbench.

## 3. Design Goal

Make the global shell feel like a calm Chinese internal SaaS admin while preserving read-only safety.

The shell should support the future `工作台` direction without adding write actions, API integration, schema changes, helper execution, or business workflows.

## 4. What Should Be Cleaned Up Later

Future cleanup should evaluate:

- Sidebar `Dashboard` label
- Page title `Admin Dashboard`
- `Static mock` label
- `Export view - Not connected`
- `Add New - Coming later`
- `Create Draft - Mock only`
- `Review Panel` label if used globally
- `Manual review required` copy
- Global safety/status chips

The goal is not to remove safety. The goal is to make safety compact, natural, and less prototype-like.

## 5. Recommended Chinese Labels

Recommended label direction:

| Current label | Recommended Chinese label |
|---|---|
| Dashboard | 工作台 |
| Admin Dashboard | CBM 工作台 |
| Static mock | 静态预览 |
| Export view | 导出视图 |
| Not connected | 未连接 |
| Add New | 新增 |
| Coming later | 稍后开放 |
| Create Draft | 创建草稿 |
| Mock only | 仅模拟 |
| Review Panel | 复核面板 |
| Manual review required | 需要人工复核 |

These labels should be applied only to visible operator-facing text. Internal keys, route ids, and data fields should remain unchanged.

## 6. What Should Remain English

Keep these values in English where appropriate:

- `API`
- `Email`
- `WhatsApp`
- `GET /api/...`
- technical route values
- internal enum values
- Step labels if used as technical phase references

Technical values should remain accurate and should not be translated if translation would obscure implementation meaning.

## 7. What Should Be Hidden Or De-emphasized

Future cleanup should consider:

- topbar mock action controls should be hidden, moved, or clearly grouped as prototype-only
- disabled actions should not look like primary product actions
- global safety copy should be compact
- technical/debug status should be secondary to the Workbench
- repeated mock wording should be reduced where a compact static-preview badge is enough

Do not hide safety entirely. Keep the boundary visible, but make it calmer and more structured.

## 8. Read-only Safety Rules

Shell cleanup must not add:

- create
- update
- delete
- send
- approve
- reject
- quote
- PI
- order
- payment
- production
- shipment

Disabled capabilities must remain informational and must not become buttons, links, toggles, or executable controls.

## 9. Recommended First Implementation Scope

Recommended small future implementation:

- change visible `Dashboard` label to `工作台`
- change `Admin Dashboard` title to `CBM 工作台` or `工作台`
- localize only simple shell labels if present
- keep disabled controls disabled
- do not remove controls unless specifically approved
- do not change navigation structure
- do not change route ids, section ids, or data fields

This should be a label/status pass, not a layout rewrite.

## 10. Files For Future Implementation

Recommend allowing:

- `admin/ui-foundation/app.js`
- `admin/ui-foundation/index.html` only if title/static shell labels are located there
- `admin/ui-foundation/styles.css` only if small layout polish is needed

Any implementation task should list exact allowed files and include browser preview validation.

## 11. Files To Keep Forbidden

Future shell cleanup should keep these forbidden unless a separate task explicitly changes scope:

- `api/*`
- `supabase/migrations/*`
- `package.json`
- `tests/*`
- `lib/services/*`
- external integrations
- business modules
- any OpenAI / Gmail / WhatsApp / quotation / PI / order / payment / shipment / production code

## 12. Browser Preview Requirements

Future implementation must check:

- sidebar fits
- title fits
- no horizontal overflow
- no console errors
- no active write controls
- disabled/mock controls remain safe
- Chinese wording is natural
- no wording implies confirmed price, delivery, payment, production, quotation, PI, order, shipment, or approval

## 13. Risks

Risks to avoid:

- changing navigation keys instead of labels
- making disabled controls look active
- removing useful safety indicators too early
- broad shell rewrite
- accidentally changing route logic
- creating buttons or links that imply actions are available
- weakening the read-only boundary while cleaning up text

## 14. Recommended Next Task

Recommended next task:

- Global Shell Cleanup Readiness Review

Then:

- Small Global Shell Label Cleanup Implementation

## 15. Final Recommendation

Do shell cleanup as a small label/status pass, not a layout rewrite.

The first implementation should improve the global shell's Chinese SaaS feel while preserving the existing static HTML/CSS/JS architecture, read-only behavior, navigation structure, and business safety boundaries.
