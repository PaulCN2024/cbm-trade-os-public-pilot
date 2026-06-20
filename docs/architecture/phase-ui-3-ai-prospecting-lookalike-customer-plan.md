# Phase UI-3 AI Prospecting And Lookalike Customer Discovery Plan

## 1. Purpose

This plan defines a future AI Prospecting Center for CBM Trade OS.

The module should help operators move from passive inbound inquiry handling to safe, human-reviewed customer development:

- target-market prospecting based on country, product, customer type and keywords
- lookalike customer discovery based on a known good customer, inquiry, product evidence or company profile
- AI-assisted lead explanation, scoring and review
- compliance-first prospect handling before any outreach

This document is planning only. It does not add search, scraping, file upload, OCR, API routes, schema, UI code, outreach automation or business execution.

## 2. Why This Module Is Needed

Current CBM Trade OS work focuses on read-only internal operations after data already exists:

- customers
- inquiries
- AI review
- supplier capability
- documents
- quotation metadata
- pre-quotation review

The missing future capability is proactive development:

- find more buyers like existing good customers
- identify relevant importers, distributors, contractors and project companies
- explain why a company may be a good fit
- keep every candidate source, risk and next action human-reviewed

The module should support CBM's real foreign-trade workflow, especially aluminum profiles, building materials, drywall/ceiling systems, facade contractors, distributors and project buyers.

## 3. Core Operating Modes

### Mode A: Target-Market Prospecting

The operator provides a prospecting target:

- country or region
- product category
- customer type
- keywords
- excluded regions or sources
- preferred language
- optional business line

Example targets:

- Peru drywall profile importer
- Panama curtain wall contractor
- Indonesia ceiling system distributor
- Chile aluminum accessory wholesaler
- Mexico building material project supplier

The future AI assistant should turn the target into a compliant search plan, candidate criteria, evidence requirements and review checklist.

### Mode B: Lookalike Customer Discovery

The operator provides one or more sample customer signals:

- company name
- website URL
- inquiry text
- customer email or WhatsApp text
- product photo
- product drawing or specification document
- PDF catalog or project file
- quotation sheet
- website screenshot
- existing CRM customer record

The future AI assistant should extract a seed customer profile and find similar potential customers from compliant sources.

In this planning phase, all sample inputs are conceptual. No file upload, file parsing, OCR, website crawling, search API call, scraping or external channel action is implemented.

## 4. Sample Customer Input Model

Future sample inputs should be normalized into a display-safe seed profile:

- seed_source_type: company_name, website_url, inquiry_text, crm_customer, document_metadata, product_image_reference, quotation_reference, email_text, whatsapp_text
- company_name
- website_domain
- country_or_region
- language
- customer_type
- industry
- buyer_role
- product_interest
- project_type
- business_line
- target_product_categories
- purchasing_intent
- evidence_summary
- evidence_sources
- missing_information
- compliance_flags
- confidence

Sensitive content rules:

- do not expose private file paths
- do not expose raw email or WhatsApp content in broad search results
- do not expose private customer attachments
- do not collect unnecessary personal data
- store only evidence needed for human review

## 5. Customer Profile Extraction Model

The future AI profile should answer:

- What type of company is this?
- Which country or region does it operate in?
- What building-material segment does it fit?
- Which products does it likely buy?
- Is it an importer, distributor, contractor, project buyer, factory, designer or trading company?
- What project type does it match?
- What evidence supports the profile?
- What information is missing?
- What compliance risk exists?

Suggested extracted fields:

- company_type
- industry_segment
- country_or_region
- market_language
- buyer_role
- product_interest
- project_type
- building_material_segment
- target_categories
- company_size_clues
- import_or_distribution_clues
- project_relevance
- source_confidence
- missing_information
- compliance_risk
- human_review_required

## 6. Lookalike Similarity Scoring

Lookalike scoring should be explainable and conservative.

Suggested scoring dimensions:

- product fit
- industry fit
- customer type fit
- region or market fit
- project type fit
- website language and market fit
- importer or distributor likelihood
- construction, facade, ceiling or drywall relevance
- contact availability
- source quality
- compliance risk

Suggested score fields:

- similarity_score: 0 to 100
- product_fit_score: 0 to 100
- prospect_quality_score: 0 to 100
- source_confidence: low, medium, high
- compliance_risk: low, medium, high
- human_review_required: true

The score must not imply that the candidate is a confirmed customer, confirmed buyer, confirmed importer, approved contact or safe-to-send lead.

## 7. Source Strategy

Allowed future source categories:

- public company websites
- compliant search API results
- official company directories
- trade show exhibitor pages
- chamber of commerce pages
- industry directories
- construction company websites
- importer and distributor websites
- paid compliant trade data providers after separate approval

Forbidden source categories:

- LinkedIn scraping
- private social network scraping
- login bypass
- anti-bot bypass
- questionable email databases
- leaked contact databases
- unnecessary personal data collection
- automated bulk outreach
- contact extraction from private customer files without human approval

## 8. Future Workflow

Recommended future workflow:

1. Operator enters target market or seed customer evidence.
2. AI extracts a seed profile.
3. AI prepares a compliant search strategy.
4. Future search integration collects candidate companies from approved sources.
5. AI summarizes candidate evidence.
6. AI scores product fit, similarity and prospect quality.
7. AI flags compliance and source risks.
8. Operator reviews candidate.
9. Operator may approve adding a prospect to a prospect pool in a future workflow.
10. AI may draft outreach text later, but draft only.
11. Any send, task, quotation, PI or order action remains separately approval-gated.

## 9. UI Module Design

Suggested module name:

- Chinese: AI 开发客户
- English: AI Prospecting Center

Suggested subsections:

- 开发目标
- 样本客户分析
- 相似客户发现
- 线索队列
- 公司画像
- AI 推荐理由
- 来源证据
- 合规风险
- 开发草稿
- 人工复核

Suggested page layout:

- left navigation: AI 开发客户
- main canvas: prospecting target, seed profile, candidate queue
- right AI Copilot panel: why similar, evidence, risk, recommended human action
- bottom or detail drawer: source evidence, disabled capabilities, compliance notes

## 10. AI Copilot Behavior

The AI Copilot should explain:

- why this company looks similar
- which customer traits matched
- which products are relevant
- which evidence supports the recommendation
- what information is missing
- what compliance risks exist
- what the next human step should be

The AI Copilot must not:

- send outreach
- approve a lead
- create a task
- create a quotation
- generate PI
- create an order
- confirm price
- confirm delivery time
- trigger payment, production or shipment

## 11. Human Review Boundary

Human review is required before:

- adding a prospect into a customer pool
- creating an outreach draft
- approving a contact method
- sending email or WhatsApp
- creating a sales task
- generating a quotation
- generating PI or order documents
- making any price, delivery, payment or production commitment

The first UI version should show all future actions as disabled or not present.

## 12. Outreach Draft Policy

Future outreach support must remain draft-only until a separate approval workflow exists.

Outreach drafts should include:

- source reference
- why the prospect may be relevant
- product fit summary
- opt-out or respectful-contact reminder
- human review requirement

Forbidden until separately approved:

- bulk send
- auto-send
- auto-reply
- direct Email or WhatsApp connection
- sending without human confirmation
- scraping contact emails at scale
- messaging personal contacts without review

## 13. Future Data Model Draft

Potential future tables or resources:

- prospecting_search_tasks
- prospecting_seed_profiles
- prospecting_seed_assets
- prospecting_leads
- prospecting_lead_sources
- prospecting_company_profiles
- prospecting_similarity_scores
- prospecting_ai_evaluations
- prospecting_outreach_drafts
- prospecting_compliance_flags
- prospecting_exclusion_list

This is a planning list only. No schema migration is approved by this document.

## 14. Future Admin-read Resources

Potential future read-only resources:

- GET /api/admin-read/prospecting-targets
- GET /api/admin-read/prospecting-seed-profiles
- GET /api/admin-read/prospecting-leads
- GET /api/admin-read/prospecting-lead-sources
- GET /api/admin-read/prospecting-similarity-scores
- GET /api/admin-read/prospecting-outreach-drafts

These are future planning candidates only. No API route is added by this document.

## 15. Implementation Phases

Recommended phases:

1. Static AI Prospecting Center UI preview.
2. Prospecting data model plan.
3. Compliant source and search API integration plan.
4. Prospecting compliance and opt-out plan.
5. Read-only seed profile helper plan.
6. Read-only prospecting lead projection plan.
7. Admin-read prospecting resource plan.
8. UI read-only wiring plan.
9. Draft-only outreach planning.
10. Approval-gated controlled action planning.

## 16. Non-goals

This plan does not implement:

- web scraping
- LinkedIn scraping
- search API calls
- browser automation
- file upload
- OCR
- document parsing
- CRM writes
- prospect creation
- task creation
- outreach sending
- email or WhatsApp integration
- quotation, PI or order generation
- payment, production or shipment workflows

## 17. Recommended Next Tasks

1. CBM-CODEX-SPRINT-PROSPECTING-UI-001 - Add AI Prospecting Center Static UI Preview
2. CBM-CODEX-SPRINT-PROSPECTING-SCHEMA-PLAN-001 - Prospecting Data Model Plan
3. CBM-CODEX-SPRINT-PROSPECTING-API-PLAN-001 - Compliant Search API Integration Plan
4. CBM-CODEX-SPRINT-PROSPECTING-SAFETY-001 - Outreach Compliance And Opt-out Plan
5. CBM-CODEX-SPRINT-UI-AI-FIRST-001 - Add AI Copilot Layout Shell

## 18. Progress Report

- Full product vision: 37% -> 38%
- Internal MVP / foundation: 98% -> 98%
- AI Prospecting Lookalike Customer Planning: 0% -> 100%
- AI Prospecting Compliance Safety Planning: 0% -> 100%
- Overall: [████░░░░░░] 38%
- Internal MVP: [██████████] 98%
- Current module: [██████████] 100%
