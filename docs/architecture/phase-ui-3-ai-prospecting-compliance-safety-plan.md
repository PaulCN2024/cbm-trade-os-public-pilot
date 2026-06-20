# Phase UI-3 AI Prospecting Compliance And Safety Plan

## 1. Purpose

This document defines compliance and safety boundaries for a future AI Prospecting Center and lookalike customer discovery workflow.

It is planning only. It does not implement search, scraping, upload, parsing, OCR, APIs, schema, UI, outreach or business execution.

## 2. Core Compliance Principles

- Use public and compliant business sources only.
- Do not bypass logins, paywalls, robots restrictions, anti-bot systems or platform terms.
- Minimize personal data collection.
- Track every source used for candidate discovery.
- Keep AI recommendations explainable and evidence-backed.
- Require human review before adding a prospect, drafting outreach or contacting anyone.
- Keep all outreach draft-only until a separate approval workflow exists.
- Provide opt-out and exclusion-list support before any future outreach workflow.

## 3. Production Safety Boundary

The prospecting module must not directly:

- write production database records without approved schema/API workflow
- delete customer, prospect, file or source records
- change production environment variables
- access private customer files without explicit approval
- send Email or WhatsApp messages
- create tasks
- approve leads
- create quotations
- create PI
- create orders
- confirm payment
- trigger production
- trigger shipment

## 4. Source Policy

| Source type | Status | Notes |
| --- | --- | --- |
| Public company website | Allowed later | Must store source URL and review status |
| Search API result | Allowed later with approval | Must use a compliant provider and rate limits |
| Official company directory | Allowed later | Prefer official and public records |
| Trade show exhibitor page | Allowed later | Good fit for building material leads |
| Chamber of commerce page | Allowed later | Public source only |
| Industry directory | Allowed later | Verify terms and data quality |
| Paid trade data provider | Future approval required | Requires separate vendor and compliance review |
| LinkedIn scraping | Forbidden | Do not scrape or bypass platform controls |
| Private social profile scraping | Forbidden | Do not collect unnecessary personal data |
| Login-gated website scraping | Forbidden | No bypass or credential-based scraping |
| Anti-bot bypass | Forbidden | No evasion behavior |
| Questionable email database | Forbidden | Do not import low-quality or non-consented data |
| Leaked data or private lists | Forbidden | Never use |

## 5. Data Handling Rules

Allowed future display data:

- company name
- company website domain
- country or region
- business category
- product category
- public source URL
- source title
- evidence summary
- similarity score
- fit score
- compliance risk
- missing information
- recommended human action

Restricted or forbidden data:

- raw private customer file content
- private attachments
- storage paths
- signed URLs
- personal phone numbers without review
- personal email addresses collected at scale
- bank/payment details
- credentials or tokens
- internal cost, profit or pricing logic
- customer-hidden document fields

## 6. AI Recommendation Safety

AI output should use cautious language:

- likely
- appears to
- may fit
- needs human review
- source requires confirmation
- do not send until approved

AI output must not say:

- confirmed buyer
- approved customer
- safe to contact automatically
- quote ready
- delivery confirmed
- price confirmed
- payment confirmed
- supplier confirmed
- order ready

## 7. Similarity Score Safety

Similarity scores are decision support only.

They must:

- be paired with evidence
- show missing information
- show confidence level
- show compliance risk
- require human review

They must not:

- automatically create a prospect
- automatically rank people for outreach without review
- hide low-confidence evidence
- imply a legal or commercial determination

## 8. Outreach Safety

Before any future outreach:

- source must be reviewed
- company fit must be reviewed
- contact method must be reviewed
- opt-out policy must be visible
- message must be draft-only
- human approval must be required

Forbidden until separately approved:

- auto-send
- bulk-send
- auto-reply
- Email or WhatsApp integration
- contact enrichment at scale
- scraping personal contacts
- sending price, quotation, PI, payment, delivery or production commitments

## 9. Risk Flags

Future prospect records should support risk flags:

- source_unverified
- low_source_confidence
- private_data_risk
- personal_contact_risk
- platform_terms_risk
- duplicate_candidate
- irrelevant_market
- competitor_risk
- restricted_region
- high_compliance_risk
- outreach_not_allowed
- opt_out_required

Risk flags should be display-only until a separate write workflow exists.

## 10. Human Review Requirements

Human review is required for:

- approving a source
- approving a company profile
- approving a lookalike score as useful
- adding a candidate to a prospect pool
- creating an outreach draft
- selecting a contact channel
- sending any message
- creating a follow-up task
- generating any commercial document

The initial module should show these as future disabled capabilities or checklist items only.

## 11. Exclusion List Planning

A future exclusion list should support:

- do_not_contact
- opted_out
- bad_source
- competitor
- irrelevant
- duplicate
- restricted_region
- internal_blacklist

No exclusion-list database table is created by this planning document.

## 12. Audit And Evidence Requirements

Future records should keep:

- source URL
- source type
- source captured time
- evidence summary
- AI evaluation version
- human reviewer
- review status
- reason for approval or rejection
- compliance flags

Do not store unnecessary personal content when a source reference and short summary are enough.

## 13. Non-goals

This plan does not approve:

- scraping implementation
- search API implementation
- schema migration
- external AI provider integration
- Gmail or WhatsApp integration
- file upload or parsing
- OCR
- contact enrichment
- automated outreach
- prospect write API
- approval execution
- quotation, PI, order, payment, production or shipment actions

## 14. Recommended Next Tasks

1. CBM-CODEX-SPRINT-PROSPECTING-UI-001 - Add AI Prospecting Center Static UI Preview
2. CBM-CODEX-SPRINT-PROSPECTING-SCHEMA-PLAN-001 - Prospecting Data Model Plan
3. CBM-CODEX-SPRINT-PROSPECTING-API-PLAN-001 - Compliant Search API Integration Plan
4. CBM-CODEX-SPRINT-PROSPECTING-SAFETY-001 - Outreach Compliance And Opt-out Plan
5. CBM-CODEX-SPRINT-PROSPECTING-REVIEW-001 - Human Review Workflow Plan
