# Phase UI-3 Read-only To Controlled Write Roadmap

## Purpose

This roadmap defines how CBM Trade OS should evolve from the current read-only internal Admin UI into controlled write workflows without losing human review, auditability, or commercial safety.

It is a planning document only. It does not authorize write APIs, schema changes, external integrations, approvals, quotations, PI/order creation, payment actions, production actions, or shipment actions.

## Current Read-only Baseline

The current production baseline is useful for internal review because it can show read-only Admin UI data and static fallback data across the core workflow areas:

- 工作台
- 询盘
- 客户
- AI 复核
- 供应商
- 制造能力
- 文件中心
- 报价前复核
- 正式报价元数据
- 订单
- 生产
- 发货
- 售后
- 设置

Current admin-read coverage includes safe GET-only projections for key internal review surfaces such as dashboard summary, customers, inquiries, AI review, supplier capabilities, documents, pre-quotation review, and quotation metadata.

## Why Not Jump Directly To Write Actions

Direct write actions can create real foreign-trade business risk:

- accidental customer send
- incorrect quotation or PI
- wrong price, quantity, weight, currency, or delivery promise
- supplier commitment before manual confirmation
- payment, order, production, or shipment mistakes
- exposure of internal costs, margins, exchange rates, bank details, or private file paths
- customer-facing documents containing factory-only or internal-only fields

CBM Trade OS can be AI-first, but all business-risk actions must remain human-reviewed and auditable.

## Stage Model

| Stage | Name | Allowed Capability | Not Allowed |
| --- | --- | --- | --- |
| 0 | Read-only internal trial | Review data, fallback previews, safety labels, manual feedback | Any write or external action |
| 1 | Draft-only generation | Create display-only draft proposals for human review | Send, approve, create quote/PI/order |
| 2 | Staged actions with human review | Prepare proposed actions with visible payload preview | Direct execution without approval |
| 3 | Approval records and audit logs | Record reviewer, decision, timestamp, reason, payload snapshot | Silent approval or mutable audit trail |
| 4 | Manual execution assistance | Help operator copy, compare, or prepare approved payloads | Automatic channel sending or business commitment |
| 5 | Controlled execution queue | Queue approved actions with state, owner, retry/cancel visibility | Untracked background execution |
| 6 | Limited external integrations | Integrate selected channels only after auth, logs, and approval gates | Broad AI/channel automation |
| 7 | Production-grade operations | Role-based, audited, monitored operational workflows | Any unreviewed commercial action |

## Module Migration Path

| Module | Current State | Next Safe Capability | Required Approval/Safety Before Write | Not Allowed Yet |
| --- | --- | --- | --- | --- |
| 询盘 | Read-only admin-read and fallback display | Draft missing-info checklist and proposed follow-up text | Approval audit schema, payload preview, manual reviewer | Auto-send, auto-create quote |
| 客户 | Read-only customer review | Draft follow-up recommendation | Customer identity check, approval note, no auto-send | Auto-update stage or contact customer |
| AI 复核 | Display-only review surfaces | Draft-only AI output review | Human approval, safety classification, immutable audit note | Auto-approve or send |
| 供应商 | Read-only supplier/capability review | Draft supplier RFQ text | Supplier identity, attachment safety, approval record | Auto-send RFQ |
| 文件 | Safe metadata only | Draft archive recommendation | No raw file path exposure, file action approval, storage policy | Upload, download, delete, OCR, promotion |
| 报价前复核 | Read-only quote readiness review | Draft quotation preparation checklist | Pricing policy, margin protection, internal field hiding | Official quote generation |
| 正式报价 | Metadata-only read view | Draft quote payload preview | Quote schema, numbering, approval, document preview | Customer-facing quote issue |
| 订单 | Static/read-only preview | Order readiness checklist | Order schema, buyer/seller validation, approval | Confirm order |
| 生产 | Static/read-only preview | Factory production draft checklist | Factory-only field rules, Chinese document rules | Confirm production |
| 发货 | Static/read-only preview | Shipment readiness checklist | Logistics data validation, document approval | Confirm shipment |
| 售后 | Static/read-only preview | After-sales issue summary | Responsibility review, evidence capture, approval | Compensation promise |

## Required Safety Gates

Before any controlled write or execution workflow, the project should have:

- disabled action registry
- approval audit schema plan and reviewed migration
- role and RLS model
- idempotency strategy for proposed actions
- immutable audit logs or append-only decision records
- payload preview before approval
- confirmation modal with exact action wording
- execution queue design
- rollback/cancel visibility where applicable
- operator guide and trial checklist
- tests for denied/blocked risky paths
- production smoke plan for GET and rejected non-GET behavior

## Recommended Order

1. `CBM-CODEX-SPRINT-TRIAL-002 - Paul Manual Trial Feedback Incorporation`
2. `CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution` if Paul has a safe temporary admin token or logged-in browser session
3. `CBM-CODEX-SPRINT-UI-SAFETY-005 - Create Static Disabled Action Registry Module`
4. `CBM-CODEX-SPRINT-SCHEMA-DRAFT-001 - Draft Approval Audit Migration File For Review Only`
5. `CBM-CODEX-SPRINT-DOCS-004 - Controlled Write Operator Safety Guide`
6. `CBM-CODEX-SPRINT-ACTION-PLAN-001 - Draft-only Proposed Action Architecture Plan`
7. `CBM-CODEX-SPRINT-QUEUE-PLAN-001 - Controlled Execution Queue Plan`

## Non-goals

This roadmap does not implement:

- write APIs
- schema migrations
- approval execution
- external AI calls
- Gmail or WhatsApp sending
- RFQ sending
- quotation or PI generation
- order confirmation
- payment, production, or shipment execution
- file upload/download/delete/OCR

## Progress Report

- Full product vision: 36% -> 36%
- Internal MVP / foundation: 95% -> 95%
- Read-only to Controlled Write Roadmap: 0% -> 100%
- Overall: `[████░░░░░░]` 36%
- Internal MVP: `[██████████]` 95%
- Current module: `[██████████]` 100%
