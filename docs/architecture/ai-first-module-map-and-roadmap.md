# AI-first Module Map And Roadmap

## Current Modules

| Module | Current state | AI role now | Future AI role | Safety boundary |
| --- | --- | --- | --- | --- |
| 工作台 | Read-only internal trial dashboard with admin-read/fallback summaries | Shows static and read-only priorities | Become AI daily briefing and workflow command surface | No write, no send, no approval execution |
| 客户 | Read-only customer view | Displays customer context and follow-up hints | AI summarizes customer history, priority, risk, and next follow-up | No customer mutation or auto-contact |
| 询盘 | Read-only inquiry view | Shows inquiry status, missing info, and risks | AI decomposes products/specs, detects missing info, drafts clarification and supplier RFQ | No auto-send, no auto-quote |
| AI复核 | Read-only AI review surface | Displays draft/safety review states | AI explains why drafts are risky and what approval is needed | No auto-approve or send |
| 供应商 | Read-only supplier/capability preview | Shows supplier/capability context | AI matches supplier candidates and drafts Chinese RFQs | No supplier commitment |
| 制造能力 | Read-only capability reference | Shows equipment/capacity style info | AI checks fit and highlights feasibility uncertainty | No confirmed feasibility, price, or delivery promise |
| 文件中心 | Read-only metadata and fallback | Displays file metadata safely | AI summarizes documents later after approved file pipeline | No upload, download, parsing, OCR, or raw path exposure |
| 报价前复核 | Read-only quote readiness surface | Shows readiness and blocked actions | AI checks missing data, quote risks, and pre-quote checklist | No price calculation or official quote |
| 正式报价元数据 | Read-only quotation metadata | Shows safe projection only | AI drafts quote payload and explanation later | No customer-facing quote without approval |
| AI开发客户 | Static read-only prospecting preview | Shows prospecting concept and compliance boundary | AI plans target markets, lookalikes, and draft outreach | No scraping, no auto-outreach, no prospect creation yet |
| AI知识库 | Read-only/fallback knowledge center with RLS-protected tables | Shows knowledge categories, items, verification state, and safety boundary | AI uses verified knowledge with citations and risk warnings | No RAG, embedding, write, upload, or AI answer generation yet |

## Required Future Modules

### A. AI Command Center

Purpose:

AI-first entrance and workflow orchestrator.

Capabilities:

- natural-language instruction
- intent detection
- route to modules
- task plan generation
- context retrieval
- next action
- approval handoff

### B. AI Inquiry Intelligence

Purpose:

Understand and decompose inquiries.

Capabilities:

- product extraction
- spec extraction
- missing info detection
- clarification question generation
- supplier RFQ draft
- quotation readiness routing

### C. AI Quotation Intelligence

Purpose:

Support quotation calculation and review.

Capabilities:

- quotation readiness
- supplier price comparison
- FOB/tax/exchange-rate reminders
- margin/risk warning
- quotation explanation draft
- human approval before quote

### D. AI Supplier Intelligence

Purpose:

Supplier matching and supplier performance memory.

Capabilities:

- supplier matching
- Chinese RFQ draft
- quotation comparison
- lead time/quality/risk notes
- supplier score later

### E. AI File And Drawing Intelligence

Purpose:

Understand PDFs, drawings, photos, manuals, quotations, contracts.

Capabilities:

- document summary
- metadata extraction
- technical requirement extraction
- human verification
- knowledge base ingestion later

### F. AI Prospecting Center

Purpose:

Find target customers and similar customers.

Capabilities:

- target market planning
- lookalike customer profile
- customer website evaluation
- source confidence
- compliance risk

### G. AI Social Content Studio / AI Content Marketing

Purpose:

Generate marketing content based on product knowledge and target markets.

Capabilities:

- LinkedIn posts
- Facebook posts
- short video scripts
- WhatsApp status
- website blog
- product articles
- multilingual versions
- human review
- manual publishing only

### H. AI Follow-up Assistant

Purpose:

Prevent losing customers because of weak follow-up.

Capabilities:

- no-reply detection
- follow-up timing suggestion
- WhatsApp/email draft
- tone selection
- customer priority score

### I. AI After-sales And Complaint Assistant

Purpose:

Help handle quality complaints and after-sales issues.

Capabilities:

- complaint classification
- evidence checklist
- supplier escalation draft
- customer response draft
- knowledge base update

### J. AI Order / Production / Shipment Tracker

Purpose:

Later phase after approval architecture.

Capabilities:

- order checklist
- production follow-up
- packing/photos reminder
- shipment document checklist
- payment reminder
- delivery update draft

### K. AI Risk And Compliance Center

Purpose:

System-level safety net.

Capabilities:

- detect unsupported price promises
- detect unverified knowledge usage
- detect confidential leakage
- platform compliance
- risky country/payment/customer flags
- audit warnings

### L. AI Business Intelligence

Purpose:

Business review and decision support.

Capabilities:

- best customers
- best products
- high-potential countries
- supplier performance
- quotation conversion
- content performance
- daily priority briefing

## Reference Feature Families To Absorb

These feature families are planning inputs, not direct product copies. They must be reinterpreted through CBM Trade OS's existing AI-first, read-only-first, human-approved architecture.

| Feature family | Role in CBM Trade OS | Priority | Safety boundary |
| --- | --- | --- | --- |
| AI Daily Workbench | Turn the homepage into a daily priority board for inquiries, customers, quotes, knowledge gaps, and follow-ups | Near term | No auto-send, no auto-quote, no task execution |
| AI Business Card Capture | Convert photos/cards into reviewed customer profile drafts | Near term | No automatic customer creation or contact |
| AI Customer Verification | Help verify whether a customer looks real, relevant, and worth follow-up | Near term | No unsupported credit judgment or final trust decision |
| AI Market Intelligence / Customs Data | Convert market/customs signals into readable country, buyer, and product insights | Mid term | No scraping protected sources or unlicensed data use |
| AI Buyer Discovery | Generate reviewed target-buyer candidates and source evidence | Mid term | No auto-prospect creation or outreach sending |
| AI Development Letter Drafting | Draft outreach and follow-up letters from verified product/customer context | Near term | Draft-only, manual send later |
| AI Social Content Studio | Create product posts, short-video scripts, and campaign drafts | Near term | Manual publishing only |
| AI Task Board | Convert AI findings into internal work queue suggestions | Near term | No automatic assignment or external execution |
| AI Conversion Analytics | Show funnel movement from research to lead, inquiry, quote, order, and repeat follow-up | Mid term | Read-only analytics first |
| AI Quote Intelligence / SKU / Price Rules | Prepare quotation-readiness and SKU/price rule checks | Mid term | No official quote, PI, price, or delivery commitment |
| AI Image & File Intelligence | Summarize approved file/image/drawing metadata and later extract requirements | Mid term | No upload/OCR/parsing until separately approved |
| AI Settings / Provider Configuration | Plan provider, model, language, prompt, and safety configuration | Later | No secret exposure or production setting changes without approval |

## Module Connection Map

```text
AI Command Center
        |
        v
Knowledge Center <--> Inquiry Intelligence <--> Quotation Intelligence
        |                   |                         |
        v                   v                         v
Prospecting <--> Content Studio <--> Customer Center <--> Follow-up
        |                                             |
        v                                             v
Supplier Intelligence <--> File Intelligence <--> Order / After-sales
        |
        v
Risk Center + Business Intelligence
```

## Priority Roadmap

### Phase A - AI Entrance And Knowledge Foundation

- AI Command Center
- AI Knowledge Center real data
- unified AI Copilot panel

Goal:

Make AI the first screen and make verified knowledge the grounding layer.

### Phase B - Inquiry-to-Quotation Workflow

- inquiry intelligence
- supplier matching
- quotation readiness
- quotation draft with approval

Goal:

Turn inbound inquiries into reviewed, explainable, approval-gated quotation preparation.

### Phase C - Customer Acquisition

- AI Prospecting
- AI Content Marketing
- Follow-up Assistant

Goal:

Build a safe outbound growth loop without unauthorized scraping or automatic outreach.

### Phase D - Delivery And After-sales

- order/production/shipment
- complaint handling
- repurchase follow-up

Goal:

Extend AI assistance past quotation into controlled execution and customer retention.

### Phase E - Governance And BI

- approval center
- risk center
- audit logs
- BI dashboard

Goal:

Make every risky action reviewable, auditable, and measurable.

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-AI-DAILY-WORKBENCH-PLAN-001`
2. `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-PLAN-001`
3. `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-PLAN-001`
4. `CBM-CODEX-SPRINT-SOCIAL-CONTENT-PLAN-001`
5. `CBM-CODEX-SPRINT-TASK-BOARD-PLAN-001`
6. `CBM-CODEX-SPRINT-MARKET-INTELLIGENCE-PLAN-001`
7. `CBM-CODEX-SPRINT-CUSTOMS-DATA-PLAN-001`
8. `CBM-CODEX-SPRINT-CONVERSION-ANALYTICS-PLAN-001`
9. `CBM-CODEX-SPRINT-QUOTE-INTELLIGENCE-PLAN-001`
10. `CBM-CODEX-SPRINT-IMAGE-AI-PLAN-001`
