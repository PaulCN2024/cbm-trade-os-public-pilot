# Inquiry Intelligence Implementation Roadmap

## Purpose

This roadmap defines a safe staged path from the current static AI Inquiry Intelligence preview toward a future read-only data foundation and later controlled workflows.

Each stage must preserve human review, avoid automatic business execution, and keep schema/API/AI/provider work behind separately approved tasks.

## Current Completed State

- AI Inquiry Intelligence UI Preview
- AI Inquiry Intelligence Production Deployment
- Customer Verification foundation complete
- Follow-up Assistant foundation complete
- AI-first safety patterns established

## Roadmap

### IQ0 UI Preview Complete

Static/read-only Admin UI preview exists and has been production-smoke verified.

### IQ1 Data Model And Rules Plan

Create the future data model, missing information rules, quotation readiness rules, supplier/RFQ boundary, human review workflow, and implementation roadmap.

### IQ2 Read-only Data Foundation

Future separately approved task. Prepare migration SQL, DEMO seed data, admin-read resources, and fallback-safe UI binding.

### IQ3 Demo Seed Data

Future separately approved task. Add non-sensitive DEMO inquiry intelligence records for local and production fallback validation.

### IQ4 Admin-read Routes

Future separately approved task. Expose protected GET-only inquiry intelligence summary, queue, missing info, readiness, supplier/RFQ requirement, draft, and review resources.

### IQ5 UI Data Binding

Future separately approved task. Bind AI Inquiry Intelligence UI to admin-read routes while preserving static fallback.

### IQ6 Missing Information Rules

Future separately approved task. Implement deterministic, transparent checklist logic before any AI provider is connected.

### IQ7 Supplier/RFQ Planning

Future planning task. Define supplier RFQ package shape and approval boundary without supplier sending.

### IQ8 AI Provider Plan

Future planning task. Define prompt privacy, source limits, confidence model, cost controls, and review requirements before live AI calls.

### IQ9 File/Drawing Parsing Plan

Future planning task. Define upload, OCR, drawing/photo parsing, privacy, storage, and verification boundaries before real parsing.

### IQ10 Quotation Review Integration

Future planning and read-only integration task. Connect quote readiness to a quote review request, not official quote generation.

### IQ11 Approved Supplier RFQ Later

Future controlled-write task only after approval center and audit workflow exist.

### IQ12 Approved Quote Workflow Later

Future controlled-write task only after quotation data model, pricing rules, approval audit, and document safety rules are approved.

## Recommended Next Executable Task

Recommended:

```text
CBM-CODEX-SPRINT-INQUIRY-INTELLIGENCE-DATA-READONLY-001
```

Purpose:

Create the read-only data foundation for AI Inquiry Intelligence after this planning package is reviewed.

Alternative:

```text
CBM-CODEX-SPRINT-SUPPLIER-INTELLIGENCE-UI-001
```

Purpose:

Add a static/read-only Supplier Intelligence UI preview before real supplier RFQ data or supplier contact exists.

## Safety Boundary

This roadmap does not authorize:

- schema execution
- SQL execution
- AI provider calls
- file parsing
- supplier RFQ creation
- supplier contact
- quotation creation
- sending
- customer or inquiry mutation
- PI/order/payment/production/shipment actions
