# Phase UI-3 Knowledge RAG Roadmap

## Purpose

Define a safe roadmap for future retrieval-augmented generation over CBM Trade OS company knowledge.

This roadmap is planning only. It does not implement vector storage, embeddings, document ingestion, file parsing, OCR, model calls, API routes, schema migrations, UI changes, or customer-facing AI answers.

## Why Not Implement RAG Immediately

RAG should not be implemented before the knowledge foundation is trustworthy.

The project should define these first:

- Taxonomy first
- Source tracking first
- Human verification first
- Privacy boundaries first
- Safe retrieval first
- Provider abstraction first

If RAG is added too early, AI may retrieve stale documents, unverified AI summaries, confidential internal rules, or incomplete quotation notes and present them as reliable business guidance. That would conflict with the CBM Trade OS human-in-the-loop safety model.

## RAG Stages

### R1: Taxonomy And Manual Knowledge

Create the Knowledge Center taxonomy and manually reviewed knowledge item structure.

Expected output:

- Knowledge categories
- Source type definitions
- Verification states
- Risk levels
- Expiration / freshness fields

### R2: Admin-read Knowledge Resources

Add read-only knowledge resources after schema planning is accepted.

Potential routes:

- `GET /api/admin-read/knowledge-items`
- `GET /api/admin-read/knowledge-categories`
- `GET /api/admin-read/knowledge-review-queue`
- `GET /api/admin-read/knowledge-linked-context`

### R3: Document Ingestion Plan

Plan ingestion before implementation.

The plan should define:

- allowed file types
- private file boundaries
- storage path hiding
- operator consent
- metadata extraction limits
- no OCR / parsing by default without a separate task

### R4: Chunking Strategy

Design chunking rules by knowledge type before embedding.

Chunking should preserve source references and avoid mixing customer-facing knowledge with confidential internal rules.

### R5: Embedding Provider Strategy

Define a provider abstraction before choosing one embedding vendor.

The design should allow provider substitution and environment-specific rollout.

### R6: Retrieval With Citations

Retrieval must return source citations, confidence, freshness, and verification status.

Weak or missing source evidence should produce a warning instead of a confident answer.

### R7: Answer Generation With Source Constraints

AI-generated answers should be constrained to retrieved verified knowledge and current record context.

Customer-facing or supplier-facing output must remain draft-only until approval workflow exists.

### R8: Human Verification Loop

Operators should review AI-generated knowledge summaries, mark them verified or rejected, and record review notes.

Unverified AI summaries must not become trusted knowledge automatically.

### R9: Production Monitoring

Later production RAG should monitor:

- retrieval quality
- citation correctness
- stale knowledge usage
- human feedback
- refusal correctness
- privacy boundary violations

## Chunking Strategy Draft

### Product Docs

- Chunk by product family, model, specification area, and installation topic.
- Preserve drawing/spec references.
- Keep price and commercial terms separate from technical product descriptions.

### Supplier Docs

- Chunk by supplier, capability line, process limit, MOQ, lead time, packaging, and quality notes.
- Mark lead time and capacity as confirmation-required unless recently verified.

### Quotation Rules

- Chunk by trade term, cost type, pricing condition, validity rule, and manual-confirmation rule.
- Keep internal margin/cost rules confidential and blocked from customer-facing output.

### Communication Templates

- Chunk by scenario, language, channel, tone, and risk level.
- Mark templates as draft-only and never auto-send.

### SOPs

- Chunk by workflow step, checklist item, escalation rule, and handoff condition.
- Maintain version and effective date.

### Files / Manuals

- Chunk by document section and linked business object.
- Never expose storage paths, signed URLs, raw confidential content, or private bucket names in UI output.

## Retrieval Safety

Retrieval must:

- retrieve only tenant / company allowed knowledge
- exclude confidential rules from customer-facing output
- show citations / sources
- mark confidence
- refuse or warn when source is weak
- show outdated knowledge warning
- distinguish verified knowledge from unverified AI-generated notes
- avoid mixing internal margin/cost rules into customer-facing drafts

## Provider Strategy

Plan an abstract provider layer for:

- OpenAI
- Gemini
- Qwen
- DeepSeek
- Kimi
- OpenRouter
- local models later

No provider integration is implemented now.

The provider layer should separate:

- embedding generation
- retrieval ranking
- answer generation
- safety classification
- audit logging
- fallback behavior

## Evaluation Plan

Evaluate future RAG with:

- answer accuracy
- source correctness
- hallucination check
- outdated knowledge warning
- human feedback
- confidential-rule leakage checks
- unsupported-claim refusal checks
- cross-language answer quality

## Non-goals

- No vector DB now.
- No embeddings now.
- No ingestion now.
- No customer-facing AI answer now.
- No OCR now.
- No file parsing now.
- No provider integration now.

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-KNOWLEDGE-UI-001 - Add AI Knowledge Center Static UI Preview
2. CBM-CODEX-SPRINT-KNOWLEDGE-SCHEMA-PLAN-001 - Knowledge Base Data Model Plan
3. CBM-CODEX-SPRINT-KNOWLEDGE-SAFETY-001 - Knowledge Verification And Source Safety Plan
4. CBM-CODEX-SPRINT-KNOWLEDGE-RAG-PLAN-001 - RAG And Embedding Architecture Plan
5. CBM-CODEX-SPRINT-UI-AI-FIRST-001 - Add AI Copilot Layout Shell
