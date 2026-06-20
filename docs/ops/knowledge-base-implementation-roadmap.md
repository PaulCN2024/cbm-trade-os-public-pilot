# Knowledge Base Implementation Roadmap

## Purpose

Define a staged implementation path for turning the static AI Knowledge Center preview into a real read-only Knowledge Base, and later into a safe RAG-ready foundation.

This roadmap is planning only. It does not implement schema, API routes, UI binding, RAG, embeddings, file ingestion, AI answers, or business execution.

## Roadmap Overview

- Stage K0: planning completed
- Stage K1: schema migration
- Stage K2: demo seed data
- Stage K3: admin-read routes
- Stage K4: UI real data binding
- Stage K5: verification queue preview with real read data
- Stage K6: source/version tracking
- Stage K7: file ingestion plan
- Stage K8: RAG/embedding architecture
- Stage K9: controlled AI answer with source citation
- Stage K10: human review workflow

## Recommended Next Combined Task

Recommended future task:

`CBM-CODEX-COMBO-KNOWLEDGE-DATA-READONLY-001`

Goal:

Implement schema + seed demo data + admin-read route + UI data binding in a controlled read-only way.

Do not run this task until Paul approves the schema plan.

## Task Breakdown

### KBF-1: Knowledge Base Functional Foundation Plan

- goal: define the safe functional foundation
- files likely touched: `docs/architecture/*`, `docs/ops/*`, `docs/PROJECT_PROGRESS.md`
- safety restrictions: documentation only
- validation: docs-only diff
- commit message: `docs: add knowledge base functional foundation plan`

### KBF-2: Knowledge Base Schema Migration

- goal: create approved knowledge tables
- files likely touched: `supabase/migrations/*`
- safety restrictions: create new tables only; no destructive SQL; no existing table drop/alter unless separately approved
- validation: migration review, no code changes, schema smoke if safe
- commit message: `feat: add knowledge base schema`

### KBF-3: Knowledge Base Demo Seed Data

- goal: add safe `DEMO_` knowledge categories and demo items
- files likely touched: `supabase/migrations/*` or approved seed location
- safety restrictions: insert-only, no real customer/supplier confidential data, no price commitments
- validation: row count checks in safe environment
- commit message: `feat: add knowledge base demo seed data`

### KBF-4: Knowledge Admin-read Routes

- goal: expose GET-only knowledge resources through the existing Admin Read Dispatcher
- files likely touched: `api/admin-read.js`, focused tests
- safety restrictions: no new physical API files unless approved; no writes; no service-role exposure; no private file fields
- validation: GET/401/404/405 tests, build, production smoke later
- commit message: `feat: add knowledge admin read resources`

### KBF-5: Knowledge UI Real Data Binding

- goal: bind AI Knowledge Center preview to read-only knowledge admin-read data
- files likely touched: `admin/ui-foundation/app.js`, maybe `admin/ui-foundation/styles.css`
- safety restrictions: no active controls, no upload, no RAG answer, no write/send/approve actions
- validation: npm test, build, browser smoke, fallback checks
- commit message: `feat: wire knowledge center read-only data`

### KBF-6: Human Verification Queue Preview

- goal: show real read-only review queue records and verification state
- files likely touched: `api/admin-read.js`, `admin/ui-foundation/app.js`, tests if API changes
- safety restrictions: no approve/reject execution; display-only badges and rows
- validation: GET-only tests, UI smoke, no active controls
- commit message: `feat: add knowledge verification queue preview`

### KBF-7: Source And Version Tracking

- goal: expose safe source/version metadata in read-only UI
- files likely touched: `api/admin-read.js`, `admin/ui-foundation/app.js`, docs
- safety restrictions: no storage paths, signed URLs, private buckets, or raw file content
- validation: field projection review, smoke tests
- commit message: `feat: show knowledge source and version metadata`

### KBF-8: File Ingestion Plan

- goal: plan file ingestion boundaries before implementation
- files likely touched: docs only
- safety restrictions: no upload/download/delete/parse/OCR implementation
- validation: docs-only review
- commit message: `docs: add knowledge file ingestion plan`

### KBF-9: RAG And Embedding Architecture

- goal: define provider, embedding, chunking, retrieval, citation, and evaluation strategy
- files likely touched: docs only
- safety restrictions: no provider integration, no embeddings, no vector DB, no AI answer execution
- validation: docs-only review
- commit message: `docs: add knowledge rag architecture plan`

### KBF-10: Controlled AI Answer With Source Citation

- goal: later provide internal draft-only AI answers with source citations
- files likely touched: separate AI service/API/UI files after approval
- safety restrictions: draft-only, internal-only first, human approval before external use
- validation: source citation tests, refusal tests, safety review
- commit message: future task only

## Progress Impact

After this planning task:

- Full product vision: 39% -> 40%
- Internal MVP / foundation: 100% -> 100%

After actual read-only data implementation:

- Full product vision can move to 42%
- Internal MVP / foundation remains 100%

Progress should not increase for RAG, embeddings, file ingestion, AI answers, or write workflows until those capabilities are actually implemented and verified.
