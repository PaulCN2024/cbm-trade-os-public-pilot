# Reference Foreign Trade System Feature Integration Plan

## Purpose

This document identifies useful ideas from a reference foreign trade, customer acquisition, and quotation system Paul observed, then translates them into original CBM Trade OS roadmap modules.

The goal is not to copy another product. The goal is to strengthen CBM Trade OS as an AI-first foreign trade operating system where AI is the entrance, the Knowledge Base is the brain, and each business module is AI-readable, AI-assistable, and human-approved before external or commercial execution.

## Important Boundary

This plan is for functional inspiration only.

CBM Trade OS must not copy third-party brand, logos, exact UI, text, watermark, product names, icons, or proprietary workflow. All features must be reinterpreted through CBM Trade OS's AI-first, human-approved, read-only-first architecture.

The reference system can inspire product direction and visual quality, but CBM Trade OS must keep its own business model, customer workflow, safety boundary, data model, and design language.

## Reference Features Observed

- AI-style dark foreign trade dashboard
- "今天该做什么" homepage
- operational metric cards
- customer totals
- weekly new customers
- conversion rate
- quotation/order/SKU metrics
- quotation conversion funnel
- customer country distribution
- product research
- customs data query
- buyer discovery
- customer verification
- batch development letter generation
- task assignment board
- research reports
- conversion analysis
- quote records
- quick quote
- one-sentence quote workbench
- customer management
- SKU management
- price rules
- image & AI
- AI settings
- business card/image upload customer creation

## Integration Principles

- AI-first
- knowledge-backed
- human-approved
- source, confidence, and risk shown
- no auto-send
- no unauthorized scraping
- no blind quote execution
- no confidential leakage
- read-only preview first
- approval workflow before writes

## Recommended Modules And Features To Absorb

### A. AI Daily Workbench / AI 今日工作台

- Purpose: make the homepage tell Paul what to handle today.
- AI role: prioritize customers, inquiries, follow-ups, quote risks, missing knowledge, and content tasks.
- Data required: customers, inquiries, quotations, follow-ups, knowledge verification queue, supplier delays, content drafts.
- Knowledge dependency: risk rules, quotation readiness rules, product knowledge, communication templates.
- Safety boundary: no auto-send, no auto-quote, no task execution.
- Implementation priority: near term.

### B. AI Business Card Capture

- Purpose: turn trade-show cards, WhatsApp contact images, or name cards into customer profile drafts.
- AI role: extract, normalize, infer country/company type, detect duplicates, and suggest follow-up.
- Data required: image/file metadata later, extracted fields, existing customer records, source channel.
- Knowledge dependency: customer type taxonomy, country/domain rules, duplicate matching rules.
- Safety boundary: no automatic customer creation or sending.
- Implementation priority: near term.

### C. AI Customer Verification

- Purpose: help Paul judge whether a customer/company is real, relevant, and worth following up.
- AI role: summarize profile, score fit, flag risk, and explain source confidence.
- Data required: company name, domain/email, website, country, product interest, inquiry history, public/manual source notes.
- Knowledge dependency: buyer personas, product fit rules, risk indicators.
- Safety boundary: score is advisory only; no automatic outreach.
- Implementation priority: near term.

### D. AI Market Intelligence / Customs Data

- Purpose: guide market research, target-country selection, and import signal review.
- AI role: suggest HS code candidates, buyer types, target markets, and trade signal summaries.
- Data required: product, country, public sources, paid provider data later, uploaded reports, historical inquiries.
- Knowledge dependency: product taxonomy, HS code notes, country risk and market knowledge.
- Safety boundary: no unauthorized scraping or legal/import claims without sources.
- Implementation priority: mid term.

### E. AI Buyer Discovery

- Purpose: find similar companies and buyer personas from product/country context.
- AI role: propose buyer types, search criteria, source checklist, and follow-up angle.
- Data required: target market, product line, reference customers, public source plan.
- Knowledge dependency: prospecting rules, compliance rules, customer verification rules.
- Safety boundary: no auto-scraping, no auto-customer creation, no outreach sending.
- Implementation priority: mid term.

### F. AI Development Letter Drafting

- Purpose: create reviewed customer outreach drafts.
- AI role: draft personalized messages from customer profile, product fit, and knowledge.
- Data required: customer profile, product knowledge, target country, language/tone, source reason.
- Knowledge dependency: communication templates, product facts, safety wording rules.
- Safety boundary: draft only; no auto-send or spam behavior.
- Implementation priority: near term.

### G. AI Social Content Studio

- Purpose: generate marketing drafts for LinkedIn, Facebook, WhatsApp status, product articles, and video scripts.
- AI role: turn verified product knowledge and market pain points into reviewable content.
- Data required: product, audience, language, platform, knowledge source, case material.
- Knowledge dependency: product knowledge, customer-safe claims, content safety rules.
- Safety boundary: no auto-posting and no fake cases.
- Implementation priority: mid term.

### H. AI Task Board

- Purpose: unify pending inquiries, supplier RFQs, quotation review, follow-up, knowledge verification, and content review tasks.
- AI role: prioritize, group, detect bottlenecks, and recommend next action.
- Data required: task records later, customer/inquiry status, quotation status, knowledge queue, content drafts.
- Knowledge dependency: workflow rules and priority heuristics.
- Safety boundary: no auto-assignment or external action until approved.
- Implementation priority: near term.

### I. AI Research Report Library

- Purpose: collect market reports, customer verification notes, customs research, and prospecting summaries.
- AI role: summarize, tag, connect to customers/products/countries, and show confidence.
- Data required: report metadata, source, linked products/countries/customers, review status.
- Knowledge dependency: Knowledge Center taxonomy and source rules.
- Safety boundary: read-only first; no unsupported claims.
- Implementation priority: mid term.

### J. AI Conversion Analytics

- Purpose: show conversion from research to lead, inquiry, quote, order, and repeat follow-up.
- AI role: summarize bottlenecks and explain why conversion changes.
- Data required: lead/inquiry/quote/order records later, follow-up records, content performance.
- Knowledge dependency: business metrics definitions and attribution rules.
- Safety boundary: mark incomplete data clearly; no fake metrics.
- Implementation priority: mid term.

### K. AI Quote Intelligence / SKU / Price Rules

- Purpose: absorb quick quote, one-sentence quote, SKU, and price rule concepts safely.
- AI role: parse quote instructions, identify SKU/product, check missing info, and prepare draft quote review.
- Data required: products, SKU later, price rules, supplier costs, quotation history, exchange-rate assumptions.
- Knowledge dependency: quote rules, hidden-field rules, product pricing rules, approval rules.
- Safety boundary: no automatic formal quote, PI, price commitment, or sending.
- Implementation priority: later.

### L. AI Image & File Intelligence

- Purpose: later interpret business cards, product images, drawings, PDFs, and supplier files.
- AI role: extract metadata and summarize review needs.
- Data required: file metadata and approved file-processing pipeline later.
- Knowledge dependency: file taxonomy, product taxonomy, privacy rules.
- Safety boundary: no upload/OCR/parsing until separately approved.
- Implementation priority: later.

### M. AI Settings / Provider Configuration

- Purpose: configure model providers, task routing, cost controls, prompt policies, and safety settings later.
- AI role: none directly; this is governance and configuration.
- Data required: provider settings later, model routing policy, audit settings.
- Knowledge dependency: security and approval rules.
- Safety boundary: no secret exposure, no production setting changes without approval.
- Implementation priority: later.

## Priority Ranking

### Near Term

- AI Daily Workbench
- AI Business Card Capture
- AI Customer Verification
- AI Development Letter Drafts
- AI Task Board

### Mid Term

- AI Market Intelligence / Customs Data
- AI Buyer Discovery
- AI Research Report Library
- AI Conversion Analytics
- AI Social Content Studio

### Later

- AI Quote Intelligence
- SKU/Price Rules
- controlled quote generation
- image & AI deeper processing
- platform/API integrations

## Relationship With Existing Modules

| Feature family | Existing/future module relationship |
| --- | --- |
| AI Daily Workbench | AI Command Center, AI Copilot, Customer Center, Inquiry Center, Quotation Pre-review, Knowledge Center, AI Prospecting Center, BI later |
| AI Business Card Capture | Customer Center, File Center, AI Copilot, AI Command Center |
| AI Customer Verification | Customer Center, Inquiry Center, AI Prospecting Center, Knowledge Center |
| AI Market Intelligence / Customs Data | AI Prospecting Center, AI Knowledge Center, AI Command Center, BI later |
| AI Buyer Discovery | AI Prospecting Center, Customer Center, AI Daily Workbench |
| AI Development Letter Drafting | AI Prospecting Center, Customer Center, Follow-up Assistant, Content Studio |
| AI Social Content Studio | Knowledge Center, Prospecting, AI Daily Workbench |
| AI Task Board | AI Daily Workbench, AI Command Center, Approval later |
| AI Research Report Library | Knowledge Center, Market Intelligence, Prospecting |
| AI Conversion Analytics | BI later, Customer Center, Inquiry Center, Quotation Center |
| AI Quote Intelligence / SKU / Price Rules | Quotation Pre-review, Supplier Center, Knowledge Center, Approval later |
| AI Image & File Intelligence | File Center, Knowledge Center, Customer Center, Inquiry Center |
| AI Settings / Provider Configuration | AI Command Center, AI Copilot, Risk Center later |

## Safety Model

All new feature families must follow this sequence:

1. read-only planning/static preview
2. data model planning
3. admin-read route planning
4. real data binding
5. approval workflow
6. controlled writes only after explicit approval and audit design

The system must not jump directly from an AI idea to external action. Drafts, research, verification, and recommendations are internal until Paul approves the exact action.

## Non-goals

- no copying third-party product
- no direct clone
- no auto-spam
- no scraping protected platforms
- no auto-send
- no automatic customer creation without approval
- no automatic formal quote
- no real platform integration without compliance review
