# Phase UI-3 AI Knowledge Center Module Plan

## Purpose

The AI Knowledge Center is the business knowledge foundation of CBM Trade OS.

It enables AI to understand products, suppliers, customers, quotation rules, documents, trade terms, communication style, SOPs, and safety boundaries. It should become the shared source of truth for future AI-assisted inquiry analysis, quotation readiness, supplier matching, customer communication, prospecting, and controlled internal decision support.

This plan is documentation only. It does not implement RAG, embeddings, vector storage, file upload, file parsing, OCR, schema changes, API routes, UI code, or business execution.

## Why This Module Is Needed

Without a knowledge base, AI can only summarize current records. It can inspect an inquiry or customer record, but it cannot reliably know CBM's products, supplier constraints, quotation rules, recurring customer preferences, document context, or internal safety boundaries.

With a knowledge base, AI can:

- answer product questions
- explain quotation rules
- compare supplier capabilities
- suggest what information is missing
- draft better customer and supplier communication
- reduce repeated manual explanation
- improve inquiry analysis
- improve AI prospecting
- support future RAG with source citations

The Knowledge Center should make AI assistance more grounded, less repetitive, and easier for operators to review.

## Knowledge Categories

### A. Product Knowledge

- Aluminum windows and doors
- Curtain wall
- Aluminum profiles
- Glass
- Hardware
- Ceiling system
- Light steel keel / drywall profiles
- Accessories

### B. Supplier Knowledge

- Supplier capabilities
- Process limits
- MOQ
- Lead time
- Quality notes
- Packaging
- Factory strengths and weaknesses
- Supplier risk notes

### C. Quotation Knowledge

- FOB / CIF / EXW rules
- Tax handling
- Exchange rate assumptions
- Packing / CBM
- Container loading
- Port cost
- Price validity
- Margin rules later
- What must be manually confirmed

### D. Customer Knowledge

- Customer preferences
- Country / region differences
- Past inquiries
- Communication style
- Risk notes
- Decision makers later

### E. File / Document Knowledge

- Drawings
- Product specs
- Quotations
- PI / contracts
- Images
- Installation manuals
- Supplier sheets
- Customer documents

### F. Trade Operation Knowledge

- Inquiry processing SOP
- Supplier RFQ SOP
- Quotation review checklist
- Order handoff checklist
- Production follow-up SOP
- Shipping document checklist
- After-sales handling

### G. Communication Templates

- English emails
- Spanish emails
- WhatsApp replies
- Supplier inquiry templates
- Customer clarification questions
- Complaint handling
- Delay explanation
- Quotation explanation

### H. Compliance / Safety Knowledge

- No auto-send
- No unauthorized scraping
- No price promise without review
- No supplier commitment without confirmation
- Opt-out / do-not-contact
- AI must show sources and confidence

## Knowledge Item Structure

A future knowledge item should be planned with fields such as:

- `id`
- `title`
- `category`
- `subcategory`
- `language`
- `summary`
- `content`
- `source_type`
- `source_reference`
- `linked_product`
- `linked_supplier`
- `linked_customer`
- `linked_file`
- `confidence_level`
- `human_verified`
- `risk_level`
- `effective_from`
- `expires_at`
- `owner`
- `created_at`
- `updated_at`

Internal keys should remain English. Operator-facing labels can be localized in the Admin UI later.

## Knowledge Source Strategy

Initial knowledge sources may include:

- Manually written SOPs
- Uploaded documents later
- Supplier capability records
- Customer inquiry history
- Product catalogs
- Pricing / quotation notes
- Installation manuals
- Email templates
- Trade show notes
- AI-generated drafts after human approval

AI-generated knowledge must be marked unverified until reviewed. It should never become active verified knowledge automatically.

## AI Usage Model

AI can use knowledge to:

- answer internal questions
- suggest missing information
- draft clarification questions
- match suppliers
- explain quotation readiness
- improve prospecting search strategies
- recommend the next human step
- compare customer requirements against product capabilities

AI must not:

- invent prices
- override supplier confirmation
- send messages automatically
- mark knowledge as verified without human review
- expose confidential internal rules to customers
- use outdated knowledge without warning

## Knowledge Lifecycle

Planned lifecycle:

```text
create/import knowledge
-> AI summarize
-> human verify
-> mark active
-> use in AI suggestions
-> review periodically
-> archive/update if outdated
```

Lifecycle controls should be explicit because business knowledge can expire, become region-specific, or require supplier reconfirmation.

## UI Module Design

Top-level module:

- AI 知识库 / Knowledge Center

Recommended subsections:

- 知识总览
- 产品知识
- 供应商知识
- 报价规则
- 文件知识
- 沟通模板
- SOP / 操作流程
- 合规与安全
- 待人工验证
- 已过期 / 待更新

The first UI version should be static and read-only. It should show categories, review state, source status, and safety boundaries without allowing edits or uploads.

## AI Copilot Integration

The right AI panel should eventually show:

- relevant knowledge
- source
- confidence
- whether human verified
- how it applies to the current inquiry / customer / supplier
- what not to do
- missing knowledge
- outdated knowledge warning

The AI Copilot should cite knowledge sources before recommending actions. It should show when knowledge is missing instead of inventing an answer.

## Future Admin-read Resources

Future read-only resources may include:

- `GET /api/admin-read/knowledge-items`
- `GET /api/admin-read/knowledge-categories`
- `GET /api/admin-read/knowledge-review-queue`
- `GET /api/admin-read/knowledge-linked-context`

These routes are planning targets only. No API is implemented in this task.

## Future Data Model Draft

Potential tables:

- `knowledge_items`
- `knowledge_categories`
- `knowledge_sources`
- `knowledge_links`
- `knowledge_reviews`
- `knowledge_usage_logs`
- `knowledge_versions`

No migrations should be created until the data model is separately reviewed and approved.

## RAG / Embedding Boundary

Future RAG and embeddings should be a later phase.

Before RAG, CBM Trade OS should define:

- knowledge taxonomy
- safe fields
- source tracking
- verification workflow
- privacy boundaries
- model / provider layer
- citation requirements

RAG should not be added before the system can distinguish verified knowledge, unverified notes, confidential internal rules, expired content, and customer-safe output.

## Safety Rules

- No unverified knowledge should be used for customer commitment.
- No hidden source should be used for business recommendation.
- No confidential rule should be exposed externally.
- No automatic send.
- No price commitment.
- No outdated rule without warning.
- No private file content exposed without permission.

## Implementation Phases

- K1: planning / storyboard
- K2: static UI preview
- K3: data model plan
- K4: admin-read knowledge resource
- K5: manual knowledge entry read-only preview
- K6: file / document ingestion plan
- K7: embedding / RAG architecture plan
- K8: controlled AI answer generation with source citations
- K9: human verified knowledge workflow

## Non-goals

- No RAG now.
- No embeddings now.
- No file parsing now.
- No automatic customer response now.
- No schema migration now.
- No vector database now.

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-KNOWLEDGE-UI-001 - Add AI Knowledge Center Static UI Preview
2. CBM-CODEX-SPRINT-KNOWLEDGE-SCHEMA-PLAN-001 - Knowledge Base Data Model Plan
3. CBM-CODEX-SPRINT-KNOWLEDGE-RAG-PLAN-001 - RAG And Embedding Architecture Plan
4. CBM-CODEX-SPRINT-KNOWLEDGE-SAFETY-001 - Knowledge Verification And Source Safety Plan
5. CBM-CODEX-SPRINT-UI-AI-FIRST-001 - Add AI Copilot Layout Shell

## Progress Report

- Full product vision: 38% -> 39%
- Internal MVP / foundation: 100% -> 100%
- AI Knowledge Center Planning: 0% -> 100%
