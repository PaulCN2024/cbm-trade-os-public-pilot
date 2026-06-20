# AI-first Future Task Backlog

## Purpose

This backlog converts the AI-first master vision into executable future Codex tasks.

It is planning only. It does not authorize code changes, schema changes, AI calls, RAG, channel integration, write actions, or business execution.

## Near-term Tasks

- AI Command Center Plan
- Unified AI Copilot Shell
- Inquiry Intelligence Plan
- Social Content Studio Plan
- Follow-up Assistant Plan
- Risk Center Plan
- BI Plan
- Knowledge Real Data Verification

## Mid-term Tasks

- quotation draft with approval
- supplier intelligence
- file/drawing intelligence
- human verification workflow
- content draft data foundation
- prospecting data model
- after-sales assistant

## Long-term Tasks

- controlled write workflow
- order/production/shipment
- RAG/embedding
- platform integrations
- model router
- multi-tenant permissions
- performance analytics

## Backlog Table

| Task id | Module | Purpose | AI role | Safety boundary | Expected files | Risk level | Recommended order |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| `CBM-CODEX-MASTER-AI-COMMAND-CENTER-PLAN-001` | AI Command Center | Define AI-first entrance and workflow router | intent detection, context plan, next-step recommendation | planning only, no AI calls or execution | `docs/architecture/*`, `docs/ops/*` | Low | 1 |
| `CBM-CODEX-SPRINT-COPILOT-SHELL-001` | Unified AI Copilot Shell | Add read-only AI Copilot surface | explain context, risk, missing info, disabled actions | static/read-only first, no helper execution | `admin/ui-foundation/app.js`, `styles.css` if approved | Medium-low | 2 |
| `CBM-CODEX-SPRINT-INQUIRY-INTELLIGENCE-PLAN-001` | Inquiry Intelligence | Plan inquiry decomposition and RFQ draft flow | extract specs, missing info, draft questions | no sending, no quote commitment | docs only | Low | 3 |
| `CBM-CODEX-SPRINT-SOCIAL-CONTENT-PLAN-001` | AI Social Content Studio | Plan marketing drafts from product/market knowledge | draft posts and scripts | manual publishing only, no platform posting | docs only | Low | 4 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001` | Follow-up Assistant | Prevent missed customer follow-up | suggest timing and draft messages | no auto-send, no task creation yet | docs only | Low | 5 |
| `CBM-CODEX-SPRINT-AFTERSALES-ASSISTANT-PLAN-001` | After-sales Assistant | Plan complaint and quality issue assistance | classify, evidence checklist, draft response | no compensation promise, no responsibility judgment | docs only | Low | 6 |
| `CBM-CODEX-SPRINT-RISK-CENTER-PLAN-001` | Risk Center | Plan cross-module AI safety net | detect commitments, leakage, unverified knowledge | alerts only, no enforcement writes yet | docs only | Low | 7 |
| `CBM-CODEX-SPRINT-BI-PLAN-001` | Business Intelligence | Plan daily/weekly business review | summarize customers, products, countries, suppliers | read-only analytics first | docs only | Low | 8 |
| `CBM-CODEX-SPRINT-KNOWLEDGE-SAFETY-001` | Knowledge Safety | Strengthen knowledge verification and source rules | source, confidence, freshness, visibility review | no RAG or customer-facing AI answers | docs only | Low | 9 |
| `CBM-CODEX-SPRINT-QUOTATION-INTELLIGENCE-PLAN-001` | Quotation Intelligence | Plan quote readiness and quote draft workflow | compare, warn, draft explanation | no official quote, no price commitment | docs only | Medium | 10 |
| `CBM-CODEX-SPRINT-SUPPLIER-INTELLIGENCE-PLAN-001` | Supplier Intelligence | Plan supplier matching and RFQ support | match suppliers, draft Chinese RFQ | no auto-RFQ, no supplier commitment | docs only | Medium | 11 |
| `CBM-CODEX-SPRINT-FILE-DRAWING-INTELLIGENCE-PLAN-001` | File/Drawing Intelligence | Plan PDF/drawing/manual understanding | summarize and extract metadata | no upload/OCR/parsing until approved | docs only | Medium | 12 |
| `CBM-CODEX-SPRINT-MODEL-ROUTER-PLAN-001` | Model Router | Plan multi-model provider routing | select models by task type | no provider keys or live calls | docs only | Medium | 13 |
| `CBM-CODEX-SPRINT-RAG-ARCHITECTURE-PLAN-001` | RAG/Embedding | Plan retrieval architecture | cite verified knowledge | no vector implementation yet | docs only | Medium | 14 |
| `CBM-CODEX-SPRINT-CONTROLLED-WRITE-PLAN-001` | Controlled Write | Plan approval-backed write workflow | prepare proposed actions | no write API implementation yet | docs only | Medium | 15 |

## Recommended Immediate Next Task

Recommended next task:

```text
CBM-CODEX-MASTER-AI-COMMAND-CENTER-PLAN-001
```

Reason:

AI Command Center should become the main entrance and connect existing modules. It is the safest next planning task because it can define intent routing, context retrieval, Copilot behavior, and approval handoff before any new AI execution or write workflow is implemented.
