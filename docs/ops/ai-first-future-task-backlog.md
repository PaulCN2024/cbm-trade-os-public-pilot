# AI-first Future Task Backlog

## Purpose

This backlog converts the AI-first master vision into executable future Codex tasks.

It is planning only. It does not authorize code changes, schema changes, AI calls, RAG, channel integration, write actions, or business execution.

## Near-term Tasks

- AI Daily Workbench Plan
- Business Card Capture Plan
- Business Card Capture data model
- Business Card Capture upload safety
- Business Card Capture disabled upload UI preview
- Business Card Capture storage plan
- Business Card Capture storage SQL/manual pack
- Business Card Capture storage post-SQL verification
- Business Card Capture upload API plan (deferred)
- Business Card Capture upload read-only preview (deferred)
- Business Card Capture signed preview URL plan (deferred)
- Business Card Capture retention flow
- Business Card Capture OCR provider plan (deferred)
- Business Card Capture read-only data foundation
- Business Card Capture human review UI
- Business Card Capture human review queue
- Customer Verification Plan
- Customer Verification read-only data foundation
- Customer Verification duplicate check plan
- Customer Verification external lookup plan
- Customer Verification AI reasoning plan
- Customer Verification human review queue
- Social Content Studio Plan
- Task Board Plan
- Unified AI Copilot Shell
- Inquiry Intelligence Plan
- Follow-up Assistant Plan
- Risk Center Plan
- BI Plan
- Knowledge Real Data Verification

## Mid-term Tasks

- Market Intelligence Plan
- Customs Data Plan
- Conversion Analytics Plan
- Quote Intelligence Plan
- Image AI Plan
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
| `CBM-CODEX-SPRINT-AI-DAILY-WORKBENCH-PLAN-001` | AI Daily Workbench | Plan the daily AI operations homepage | prioritize today's inquiries, follow-ups, knowledge gaps, quote risks, and content tasks | planning only, no action execution | docs only | Low | 1 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-PLAN-001` | Business Card Capture | Plan card/photo-to-customer-profile draft workflow | extract reviewed customer profile fields and verification hints | no automatic customer creation or outreach | docs only | Low | 2 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-DATA-PLAN-001` | Business Card Capture | Plan future data model, privacy, review workflow, and roadmap | define reviewed customer-profile draft foundation | planning only, no schema/API/upload/OCR/customer creation | docs only | Low | 3 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-DATA-READONLY-001` | Business Card Capture | Plan and later implement read-only capture/draft data foundation after schema approval | expose reviewed capture metadata safely | no upload/OCR/write/customer creation | docs/API/schema only if separately approved | Medium | 4 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-SAFETY-001` | Business Card Capture | Plan upload storage, privacy, retention, and file safety before any upload exists | identify safe image intake boundaries | no upload implementation until approved | docs only first | Medium | 5 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-UI-PREVIEW-001` | Business Card Capture | Add disabled/static upload preview for operator review | explain upload workflow and blocked actions | no real file input, upload, OCR, or customer creation | `admin/ui-foundation/app.js`, `styles.css` only if separately approved | Medium-low | 6 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-STORAGE-PLAN-001` | Business Card Capture | Plan private storage bucket and access behavior | prepare storage policy requirements | no bucket creation, no storage mutation | docs only | Medium | 7 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-STORAGE-SQL-PACK-001` | Business Card Capture | Prepare manual setup pack for private bucket and storage policies | translate approved storage plan into reviewable setup instructions | no SQL execution, no bucket mutation by Codex | docs/ops only | Medium | 8 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-STORAGE-POST-VERIFY-001` | Business Card Capture | Verify manual private bucket and storage policy execution result | confirm storage is private and future upload remains blocked | no SQL execution by Codex without approval, no upload | docs/ops only | Medium | 9 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-API-PLAN-001` | Business Card Capture | Deferred: plan protected upload API validation and metadata linkage | define safe upload-to-review handoff later | no API implementation, no upload | docs only | Medium | 10 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-READONLY-PREVIEW-001` | Business Card Capture | Deferred: plan or preview read-only upload status after storage verification | show bucket/policy readiness later without enabling upload | no file input, no upload, no storage call | docs/UI only if separately approved | Medium-low | 11 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-PREVIEW-SIGNED-URL-PLAN-001` | Business Card Capture | Deferred: plan short-lived preview URLs or server-mediated preview | define private image preview behavior later | no signed URL implementation, no public links | docs only | Medium | 12 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-RETENTION-FLOW-001` | Business Card Capture | Plan archive/delete workflow for stored card images | protect privacy and audit decisions | no deletion implementation, no storage mutation | docs only | Medium | 13 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-OCR-PROVIDER-PLAN-001` | Business Card Capture | Deferred: plan OCR/vision provider privacy and confidence model | extract fields with source/confidence metadata later | no provider keys or live OCR calls | docs only | Medium | 14 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-HUMAN-REVIEW-UI-001` | Business Card Capture | Plan or preview human review UI for card extraction results | show missing fields, duplicates, and draft follow-up | no approve/create/send execution | docs/UI only if separately approved | Medium-low | 15 |
| `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-REVIEW-QUEUE-001` | Business Card Capture | Plan human review queue for card extraction results | show missing fields, duplicates, and draft follow-up | no approve/create/send execution | docs/UI only if separately approved | Medium-low | 16 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-PLAN-001` | Customer Verification | Plan buyer/company verification and buyer discovery | summarize evidence, confidence, mismatch, and follow-up value | no final trust decision, no scraping, no outreach | docs only | Low | 17 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-DATA-READONLY-001` | Customer Verification | Create the read-only customer verification data foundation plan/pack | organize requests, evidence, scores, duplicate matches, and reviews | read-only first, no customer mutation, no external lookup | docs/API/schema only if separately approved | Medium | 17.1 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-DUPLICATE-CHECK-PLAN-001` | Customer Verification | Plan duplicate candidate rules against existing customer/contact data | explain match candidates and confidence | no auto-merge, no archive/reject, no customer mutation | docs only | Low | 17.2 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-DUPLICATE-READONLY-001` | Customer Verification | Implement/read-only preview deterministic duplicate candidates from existing internal records | show exact email/phone/domain/company candidate evidence | no auto-merge, no archive/reject, no customer mutation | docs/API/UI only if separately approved | Medium | 17.3 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-DUPLICATE-QUEUE-UI-001` | Customer Verification | Plan or preview possible duplicate queue UI | show duplicate candidates, evidence rows, disabled decisions | no approve/reject/merge/archive/customer mutation | docs/UI only if separately approved | Medium-low | 17.4 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-MERGE-AUDIT-PLAN-001` | Customer Verification | Plan future merge audit and rollback requirements | define evidence snapshot, reviewer decision, and history preservation | no merge implementation, no customer mutation | docs only | Medium | 17.5 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-EXTERNAL-LOOKUP-PLAN-001` | Customer Verification | Plan future external lookup boundaries and source rules | summarize allowed sources, citation, freshness, and privacy | no lookup execution, no scraping, no protected-platform bypass | docs only | Medium | 17.6 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-AI-REASONING-PLAN-001` | Customer Verification | Plan future AI reasoning over verified evidence | explain confidence, risk, and next-step recommendations | no provider keys, no live AI calls, no final trust decision | docs only | Medium | 17.7 |
| `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-HUMAN-REVIEW-QUEUE-001` | Customer Verification | Plan or preview human review queue for verification cases | show evidence, duplicates, risk, and disabled decisions | no approve/create/send execution until approval workflow exists | docs/UI only if separately approved | Medium-low | 17.8 |
| `CBM-CODEX-SPRINT-SOCIAL-CONTENT-PLAN-001` | AI Social Content Studio | Plan marketing drafts from product/market knowledge | draft posts and scripts | manual publishing only, no platform posting | docs only | Low | 18 |
| `CBM-CODEX-SPRINT-TASK-BOARD-PLAN-001` | AI Task Board | Plan AI-generated internal work queue | convert findings into suggested tasks and blocked actions | no auto-assignment, no external execution | docs only | Low | 19 |
| `CBM-CODEX-SPRINT-COPILOT-SHELL-001` | Unified AI Copilot Shell | Add read-only AI Copilot surface | explain context, risk, missing info, disabled actions | static/read-only first, no helper execution | `admin/ui-foundation/app.js`, `styles.css` if approved | Medium-low | 20 |
| `CBM-CODEX-SPRINT-INQUIRY-INTELLIGENCE-PLAN-001` | Inquiry Intelligence | Plan inquiry decomposition and RFQ draft flow | extract specs, missing info, draft questions | no sending, no quote commitment | docs only | Low | 21 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001` | Follow-up Assistant | Prevent missed customer follow-up | suggest timing and draft messages | no auto-send, no task creation yet | docs only | Low | 22 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-UI-001` | Follow-up Assistant | Add static/read-only Follow-up Assistant UI preview | show candidates, missing info, timing, draft-only labels | no send, no task creation, no customer mutation | UI only if separately approved | Medium-low | 22.1 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-DATA-PLAN-001` | Follow-up Assistant | Plan follow-up data foundation and admin-read shape | candidates, missing info, recommendations, drafts, reviews | docs only, no schema execution | docs only | Low | 22.2 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-DATA-READONLY-001` | Follow-up Assistant | Create read-only follow-up data foundation after schema approval | safe DEMO records and protected projection | no real task creation, no send | docs/API/schema only if separately approved | Medium | 22.3 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-MESSAGE-TEMPLATE-001` | Follow-up Assistant | Create reviewed draft-only follow-up templates | information request, quote follow-up, buyer role, dormant lead | no AI provider call, no sending | docs only | Low | 22.4 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-AI-PROVIDER-PLAN-001` | Follow-up Assistant | Plan AI provider use for follow-up drafts | privacy, prompts, cost, review boundary | no live AI call, no provider key change | docs only | Medium | 22.5 |
| `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-HUMAN-REVIEW-QUEUE-001` | Follow-up Assistant | Plan or preview follow-up review queue | draft messages, proposed tasks, disabled decisions | no approve/send/task execution | docs/UI only if separately approved | Medium-low | 22.6 |
| `CBM-CODEX-SPRINT-RISK-CENTER-PLAN-001` | Risk Center | Plan cross-module AI safety net | detect commitments, leakage, unverified knowledge | alerts only, no enforcement writes yet | docs only | Low | 23 |
| `CBM-CODEX-SPRINT-BI-PLAN-001` | Business Intelligence | Plan daily/weekly business review | summarize customers, products, countries, suppliers | read-only analytics first | docs only | Low | 24 |
| `CBM-CODEX-SPRINT-KNOWLEDGE-SAFETY-001` | Knowledge Safety | Strengthen knowledge verification and source rules | source, confidence, freshness, visibility review | no RAG or customer-facing AI answers | docs only | Low | 25 |
| `CBM-CODEX-SPRINT-MARKET-INTELLIGENCE-PLAN-001` | Market Intelligence | Plan country/product opportunity intelligence | summarize market signals and product opportunities | no protected scraping or unlicensed data use | docs only | Medium | 26 |
| `CBM-CODEX-SPRINT-CUSTOMS-DATA-PLAN-001` | Customs Data | Plan safe customs/import-export data usage | explain buyer/import signals and confidence | source licensing review required, no claims without source | docs only | Medium | 27 |
| `CBM-CODEX-SPRINT-CONVERSION-ANALYTICS-PLAN-001` | Conversion Analytics | Plan funnel analytics from research to repeat follow-up | identify bottlenecks and next actions | read-only analytics only | docs only | Medium | 28 |
| `CBM-CODEX-SPRINT-QUOTE-INTELLIGENCE-PLAN-001` | Quote Intelligence | Plan SKU/price rules and quotation readiness | identify missing pricing inputs and draft quote review | no formal quote, PI, price, or delivery commitment | docs only | Medium | 29 |
| `CBM-CODEX-SPRINT-IMAGE-AI-PLAN-001` | Image/File AI | Plan image and file intelligence | summarize approved file/image metadata and later extract requirements | no upload/OCR/parsing until separately approved | docs only | Medium | 30 |
| `CBM-CODEX-SPRINT-AFTERSALES-ASSISTANT-PLAN-001` | After-sales Assistant | Plan complaint and quality issue assistance | classify, evidence checklist, draft response | no compensation promise, no responsibility judgment | docs only | Low | 31 |
| `CBM-CODEX-SPRINT-QUOTATION-INTELLIGENCE-PLAN-001` | Quotation Intelligence | Plan quote readiness and quote draft workflow | compare, warn, draft explanation | no official quote, no price commitment | docs only | Medium | 32 |
| `CBM-CODEX-SPRINT-SUPPLIER-INTELLIGENCE-PLAN-001` | Supplier Intelligence | Plan supplier matching and RFQ support | match suppliers, draft Chinese RFQ | no auto-RFQ, no supplier commitment | docs only | Medium | 33 |
| `CBM-CODEX-SPRINT-FILE-DRAWING-INTELLIGENCE-PLAN-001` | File/Drawing Intelligence | Plan PDF/drawing/manual understanding | summarize and extract metadata | no upload/OCR/parsing until approved | docs only | Medium | 34 |
| `CBM-CODEX-SPRINT-MODEL-ROUTER-PLAN-001` | Model Router | Plan multi-model provider routing | select models by task type | no provider keys or live calls | docs only | Medium | 35 |
| `CBM-CODEX-SPRINT-RAG-ARCHITECTURE-PLAN-001` | RAG/Embedding | Plan retrieval architecture | cite verified knowledge | no vector implementation yet | docs only | Medium | 36 |
| `CBM-CODEX-SPRINT-CONTROLLED-WRITE-PLAN-001` | Controlled Write | Plan approval-backed write workflow | prepare proposed actions | no write API implementation yet | docs only | Medium | 37 |

## Recommended Immediate Next Task

Recommended next task:

```text
CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-UI-001
```

Reason:

AI Customer Verification and Follow-up Assistant planning are now complete. The next recommended task is a static/read-only Follow-up Assistant UI preview before schema, API, AI provider, task creation, or sending work. Do not jump to external lookup, AI reasoning, customer mutation, merge execution, task creation, or sending.

## Business Card Capture Real Upload/OCR Pause

Business Card Capture real upload/OCR is paused and deferred.

Reason:

- Current business-card usage frequency is low.
- The module already has static UI, read-only data foundation, DEMO data, RLS, private storage bucket, storage policy, upload UI preview, and production verification.
- Real upload/OCR should resume later when exhibition or batch-card intake becomes a frequent workflow.

Paused/deferred tasks:

- Business Card Capture Upload API Plan
- Business Card Capture Metadata Migration Plan
- Business Card Capture OCR Provider Implementation
- Business Card Capture Real Upload Implementation
- Business Card Capture Signed Preview URL Implementation

Resume condition:

- Paul starts attending exhibitions more often.
- Batch business-card capture becomes a real daily workflow.
- Card OCR becomes higher priority than customer verification, follow-up, or inquiry intelligence.

These tasks are deferred, not deleted.
