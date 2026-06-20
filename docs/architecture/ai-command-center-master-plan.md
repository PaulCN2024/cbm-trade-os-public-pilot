# AI Command Center Master Plan

## Purpose

The AI Command Center is the future primary entrance of CBM Trade OS.

Paul should operate the system by telling AI what business outcome to achieve, not by manually navigating every module first. The Command Center should understand the instruction, retrieve relevant business context, recommend a safe workflow, prepare drafts or review packages, and stop at the human approval boundary before any external or irreversible action.

## Product Positioning

The AI Command Center is not a chatbot widget.

It is a workflow orchestration entrance for a foreign trade operating system. It should connect customers, inquiries, products, suppliers, quotations, documents, knowledge, prospecting, follow-up, risk checks, and future approval workflows through one AI-first operating surface.

The current system remains a read-only internal trial baseline. This plan defines the future product direction only. It does not implement AI provider calls, RAG, write actions, channel sending, quotation generation, order execution, or production workflows.

## User Problem

Traditional module-first software makes Paul decide where to start:

- open Customers
- search an inquiry
- check products
- check suppliers
- open files
- review price rules
- draft a reply
- decide whether quotation is safe

An AI-first workflow should let Paul start with intent:

- what customer or inquiry needs attention
- what information is missing
- whether quotation preparation is safe
- what supplier or knowledge record is relevant
- what message or document draft can be prepared
- what action still requires approval

The Command Center should reduce navigation work while keeping high-risk commercial actions human-reviewed.

## Natural Language Command Examples

Operators should eventually be able to type instructions such as:

- 帮我处理这个秘鲁客户的轻钢龙骨询盘
- 帮我看看这个客户能不能报价
- 帮我找类似 Caribbean Green Construction 的客户
- 给这个产品生成一周 LinkedIn 内容选题
- 帮我跟进这个 7 天没回复的客户
- 帮我分析这个客户投诉
- 帮我从这个 PDF 里提取报价需要的信息
- 帮我今天排一下最值得处理的客户

## Intent Categories

The first routing model should classify commands into stable internal intent keys:

- `inquiry_processing`
- `quotation_readiness`
- `supplier_matching`
- `customer_followup`
- `prospecting`
- `content_marketing`
- `knowledge_lookup`
- `file_analysis`
- `aftersales_complaint`
- `order_tracking_later`
- `business_review`
- `risk_check`

These keys are internal routing values and should remain English. Chinese labels can be used in the UI.

## Context Retrieval Requirements

Before giving recommendations, the Command Center should retrieve or request the right context:

- customer profile
- inquiry records
- product knowledge
- supplier capability
- quotation rules
- documents and file metadata
- previous quotes
- communication templates
- prospecting notes
- content drafts
- risk rules
- approval status

If required context is missing, the Command Center must say what is missing instead of inventing details.

## Recommended Output Structure

Every Command Center result should be structured enough for Paul to review quickly:

- task understanding
- relevant records found
- missing information
- recommended workflow
- safe drafts
- risk warnings
- source and confidence
- approval-required actions
- next best action

## Workflow Routing Model

The Command Center should route work to existing and future product areas:

- Inquiry
- Customer
- Supplier
- Knowledge
- File
- Quotation Pre-review
- Prospecting
- Social Content
- Follow-up
- Risk
- Approval later

Routing should be display-first and read-only at the beginning. Later stages can add controlled context aggregation, AI draft generation, and approval queues.

## Human Approval Model

AI may analyze, summarize, classify, retrieve, recommend, compare, and draft.

Actions that affect customers, suppliers, money, commitments, external systems, or production status require explicit human approval before execution. Approval-required actions include:

- sending customer or supplier messages
- publishing content
- creating official quotations
- issuing PI
- creating orders
- confirming delivery time
- committing price or payment terms
- committing compensation or responsibility judgments
- changing sensitive workflow status
- running database/schema changes
- changing production settings

The Command Center must show these as approval-required actions, not as completed actions.

## AI Command Center Vs AI Copilot

The AI Command Center is the main entrance and workflow router.

AI Copilot can be a contextual assistant inside individual modules, such as Customer, Inquiry, Knowledge, File, Quotation, or Prospecting. Copilot helps within the current page; Command Center decides where the work should go and what workflow should happen next.

In short:

- Command Center: cross-module intent, routing, prioritization, and workflow orchestration.
- Copilot: module-level assistance, explanation, and draft preparation.

## First-stage Scope

The first stage should be a static/read-only preview:

- static command examples
- static intent cards
- static context panel
- static recommended workflow
- static safety and approval boundary
- no AI execution
- no AI provider calls
- no RAG
- no API changes unless separately planned
- no database writes
- no sending
- no approval execution
- no quotation, PI, order, payment, production, or shipment execution

## Future Stages

- C1: static AI Command Center UI preview
- C2: read-only command examples and route cards
- C3: workflow route cards connected to static context
- C4: admin-read context aggregation plan
- C5: AI provider and model router integration plan
- C6: draft generation with source and risk display
- C7: approval request queue
- C8: controlled action execution
- C9: audit and BI integration

## Non-goals

This plan does not implement:

- AI provider integration
- prompt execution
- RAG or embeddings
- vector database
- schema migration
- API route changes
- UI code
- Gmail or WhatsApp integration
- customer or supplier sending
- quote generation
- PI/order/payment/production/shipment actions
- scraping or unauthorized prospecting
- autonomous approval
- production deployment
