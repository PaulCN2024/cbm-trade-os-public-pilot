# Customer Verification Duplicate Check Strategy

## Purpose

This document defines how AI Customer Verification should later identify possible duplicate customers, contacts, companies, inquiries, and business-card leads before any automatic merge or customer update is considered.

The duplicate check flow is advisory only. It may produce candidate matches, evidence summaries, and review prompts. It must not merge, delete, archive, reject, or update customer records without a separately approved controlled-write workflow.

## Why Duplicate Checking Matters

Duplicate customers can cause:

- repeated follow-up
- conflicting quotation history
- wrong customer ownership
- duplicated supplier/RFQ work
- inconsistent communication
- inaccurate sales pipeline

For CBM Trade OS, duplicate detection should protect Paul's real export workflow. It should help avoid quoting the same buyer twice, missing prior context, or confusing a distributor, contractor, trading company, and end customer.

## Data Sources To Compare Later

Future duplicate comparison may use only approved internal read-only sources first:

- customers / companies
- inquiries
- customer_verification_requests
- customer_profile_drafts
- business card capture records
- WhatsApp/email contacts
- quotation history later

External lookup, search engine checks, scraping, AI provider calls, and protected-platform access are outside this duplicate-check planning scope.

## Match Dimensions

Future duplicate matching should consider:

- exact email match
- exact phone match
- exact WhatsApp match
- exact website/domain match
- exact company name match
- normalized company name match
- similar company name
- same country + similar company
- same contact name + same company
- same inquiry source/channel
- same project/company context

The system should keep raw values and normalized comparison values separate. Normalized values help matching but should not overwrite source data.

## Match Strength Levels

Use stable match strength labels:

- `exact_match`: one or more unique identifiers match exactly, such as email, phone, WhatsApp, or website domain.
- `strong_match`: multiple high-value fields match, such as normalized company name plus domain or country.
- `possible_match`: similarity is meaningful but not conclusive, such as similar company name plus same country.
- `weak_match`: a single broad field matches, such as country, product interest, or source channel.
- `no_match`: no useful duplicate signal is present.
- `conflict`: records look related but contain conflicting identifiers or business context.

## Recommended Matching Order

Recommended future matching order:

1. Exact email
2. Exact phone / WhatsApp
3. Website domain
4. Exact company name
5. Normalized company name
6. Similar company name + country
7. Contact name + product interest
8. Inquiry text similarity later

Start with deterministic fields before any fuzzy or AI-assisted comparison. Text similarity should be a later read-only enhancement, not the first implementation.

## Non-goals

This plan does not authorize:

- automatic merge
- automatic customer deletion
- automatic customer archive/reject
- automatic customer status update
- automatic ownership transfer
- automatic message sending
- supplier RFQ
- quotation, PI, order, payment, production, or shipment action

All duplicate results are candidates for human review only.
