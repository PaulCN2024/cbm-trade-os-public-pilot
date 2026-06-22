# Customer Verification Duplicate Evidence Rules

## Purpose

This document defines evidence types, normalization rules, false-positive risks, false-negative risks, and review statuses for future AI Customer Verification duplicate checks.

Evidence rules must support read-only candidate review. They must not become automatic merge, customer mutation, outreach, quotation, or order rules.

## Evidence Types

Use stable evidence type keys:

- `same_email`
- `same_phone`
- `same_whatsapp`
- `same_website`
- `same_domain`
- `same_company_name`
- `normalized_company_name`
- `similar_company_name`
- `same_country`
- `same_contact_name`
- `same_product_interest`
- `same_project_reference`
- `same_source_channel`

Each evidence item should preserve:

- source record type
- source record id
- compared field
- source value, if safe to display internally
- matched value, if safe to display internally
- match strength
- evidence status
- reviewer note later

## Normalization Rules

Future normalization may:

- lowercase email/domain
- trim spaces
- remove common punctuation
- normalize company suffixes such as Ltd, LLC, S.A., Inc., Co., Corp
- normalize phone country code if possible
- avoid storing normalization as fact without review

Normalization should support comparison only. It must not overwrite customer names, contact names, phone numbers, email addresses, websites, or notes.

## False Positive Risks

Possible false positives include:

- same common company name in different countries
- group companies with different branches
- distributor using manufacturer website
- personal Gmail used by multiple contacts
- same construction group with different projects
- same trading company buying for different end customers

False positives are especially risky because they can combine unrelated customer history. Future UI should clearly label these as possible matches, not confirmed duplicates.

## False Negative Risks

Possible false negatives include:

- different email for same buyer
- translated company name
- abbreviation
- typo
- WhatsApp-only contact
- missing website
- regional office using different domain

False negatives mean the system may miss a duplicate. Missing a duplicate should not block normal review, but it should be reflected in confidence notes when information is incomplete.

## Evidence Status

Use stable evidence statuses:

- `confirmed`: reviewer or deterministic unique identifier supports the match.
- `likely`: multiple strong signals support the match, but review is still required.
- `needs_review`: signal is meaningful but not conclusive.
- `conflict`: one or more fields contradict the duplicate hypothesis.
- `missing`: field is not present.
- `not_checked`: field has not been compared.

## Human Review Requirement

All possible or strong matches require Paul review before:

- marking a record as duplicate
- merging records
- archiving a duplicate
- rejecting a customer
- changing customer status
- using duplicate context in a customer reply

The first implementation should display evidence only. It should not include active merge, approve, reject, send, quote, PI, order, payment, production, or shipment controls.
