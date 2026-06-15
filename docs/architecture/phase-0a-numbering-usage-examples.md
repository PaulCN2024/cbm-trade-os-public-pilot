# Phase 0A: Numbering Usage Examples

## Purpose

Define safe usage examples for the current pure numbering utilities before any schema, API, UI, Supabase, or AI integration.

This document is documentation only. It does not implement code or change runtime behavior.

## Current Numbering Utilities

Current pure utilities:

- `code-dictionaries.js`
- `normalize-code-input.js`
- `duplicate-check.js`
- `generate-code-suggestion.js`
- `index.js`

These utilities are local-only and must not create final database codes.

## Recommended Safe Flow

Use this order:

```text
raw input
-> normalizeCodeInput
-> checkDuplicateCodeCandidate
-> generateCodeSuggestion
-> human review
-> future approved create workflow
```

## Example 1: Customer Company Code Suggestion

Input:

```js
{
  object_type: "customer_company",
  country_code: "pe",
  customer_type: "dist",
  source_code: "ali",
  year: 2026,
  sequence: 1
}
```

Expected suggestion:

```text
CUST-PE-DIST-ALI-2026-0001
```

Important:

- This is a suggestion only.
- It is not a final locked database code.
- Duplicate check and human review are still required.

## Example 2: Supplier Company Code Suggestion

Input:

```js
{
  object_type: "supplier_company",
  country_code: "cn",
  supplier_category: "alu",
  source_code: "man",
  year: 2026,
  sequence: 1
}
```

Expected suggestion:

```text
SUP-CN-ALU-MAN-2026-0001
```

## Example 3: Customer Contact Code Suggestion

Input:

```js
{
  object_type: "customer_contact",
  parent_code: "CUST-PE-DIST-ALI-2026-0001",
  year: 2026,
  sequence: 1
}
```

Expected suggestion:

```text
CUST-PE-DIST-ALI-2026-0001-C01
```

Important:

- Contact codes require `parent_code`.
- Missing `parent_code` must require human review.

## Example 4: Inquiry Code Suggestion

Input:

```js
{
  object_type: "inquiry",
  country_code: "pe",
  year: 2026,
  sequence: 1
}
```

Expected suggestion:

```text
INQ-PE-2026-0001
```

## Example 5: Document Code Suggestion

Input:

```js
{
  object_type: "document",
  year: 2026,
  sequence: 1
}
```

Expected suggestion:

```text
DOC-2026-0001
```

## Example 6: Duplicate Check Before Suggestion

Input:

```js
{
  candidate_code: "CUST-PE-DIST-ALI-2026-0001",
  candidate_name: "ABC Industries Ltd.",
  candidate_email: "buyer@example.com",
  existing_records: [
    {
      code: "CUST-PE-DIST-ALI-2026-0001",
      company_name: "ABC Industries Ltd."
    }
  ]
}
```

Expected result:

```text
has_possible_duplicate: true
needs_human_review: true
reasons: code_match, name_match
```

Important:

- Duplicate check is local-only in Phase 0A.
- It does not query Supabase.
- It does not prove that no duplicate exists in the real database.

## Example 7: Fallback Values

If values are missing:

```text
country_code -> XX
customer_type -> UNK
source_code -> MAN
supplier_category -> OTH
```

Fallback values should create warnings.

Fallback values may be used for draft suggestions, but final record creation should require human review when important information is unknown.

## What AI Agents May Do

AI agents may:

- suggest likely country/type/source/category
- call pure numbering utilities for draft suggestions
- explain warnings
- flag possible duplicates
- ask for human review

AI agents must not:

- create final database codes
- allocate final sequence numbers
- bypass duplicate checks
- overwrite existing codes
- create customers, suppliers, inquiries, quotations, PI, orders, shipments, or payments automatically

## What Must Not Be Implemented In This Phase

Do not implement in Phase 0A:

- database code fields
- migrations
- API routes
- UI create flows
- Supabase duplicate checks
- automatic sequence allocation
- final code locking
- OpenAI/AI SDK integration
- email/WhatsApp sending
- quotation, PI, order, payment, shipment, or production logic

## Recommended Next Step

The next safe step is a pure pipeline helper or documentation task that shows:

```text
normalize input
-> check local duplicate candidates
-> generate draft code suggestion
-> return warnings and human review requirement
```

It should remain local-only and must not touch schema, API, UI, Supabase, or OpenAI.
