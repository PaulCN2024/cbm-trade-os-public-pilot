# Task ID

`CBM-CODEX-IMPL-003`

# Title

Numbering Normalization Helpers

# Purpose

Add pure helper functions to normalize numbering input before `generateCodeSuggestion` is used.

# Action Type

Small code implementation

# Risk Level

Low

# Allowed Files

- `lib/services/numbering/normalize-code-input.js`
- `tests/normalize-code-input.test.js`

# Allowed Reads

- `lib/services/numbering/code-dictionaries.js`
- `lib/services/numbering/generate-code-suggestion.js`
- `tests/numbering-dictionaries.test.js`
- `tests/generate-code-suggestion.test.js`

# Forbidden Files

- `api/*`
- `supabase/migrations/*`
- `admin/*`
- `trade-website/*`
- `trade-os-prototype/*`
- `package.json`
- any OpenAI / Gmail / WhatsApp / quotation / PI / order / shipment code

# Context

The project already has:

- `lib/services/numbering/code-dictionaries.js`
- `lib/services/numbering/generate-code-suggestion.js`
- `tests/numbering-dictionaries.test.js`
- `tests/generate-code-suggestion.test.js`

The next step is to add pure normalization helpers.

These helpers must not generate final codes, must not access Supabase, and must not modify business records.

# Goal

Create a pure utility file:

- `lib/services/numbering/normalize-code-input.js`

It should export helper functions such as:

- `normalizeCountryCode(value)`
- `normalizeCustomerType(value)`
- `normalizeSourceCode(value)`
- `normalizeSupplierCategory(value)`
- `normalizeObjectType(value)`
- `normalizeYear(value)`
- `normalizeSequence(value)`
- `normalizeCodeInput(input)`

# Implementation Requirements

## Country Code

- Trim whitespace.
- Uppercase.
- Use `XX` if missing.
- Warn if missing or not two letters.

## Customer Type

- Trim whitespace.
- Uppercase.
- Accept known `CUSTOMER_TYPE_CODES`.
- Use `UNK` if missing or unknown.
- Warn when fallback is used.

## Source Code

- Trim whitespace.
- Uppercase.
- Accept known `SOURCE_CODES`.
- Use `MAN` if missing or unknown.
- Warn when fallback is used.

## Supplier Category

- Trim whitespace.
- Uppercase.
- Accept known `SUPPLIER_CATEGORY_CODES`.
- Use `OTH` if missing or unknown.
- Warn when fallback is used.

## Object Type

- Must match known `OBJECT_TYPE_CODES` keys.
- Unknown object type should set `needs_human_review: true`.

## Year

- Accept number or numeric string.
- Return integer year.
- Invalid year should set `needs_human_review: true`.

## Sequence

- Accept number or numeric string.
- Return integer sequence.
- Invalid sequence should set `needs_human_review: true`.

## normalizeCodeInput(input)

Returns:

```js
{
  normalized_input,
  warnings,
  needs_human_review
}
```

Rules:

- Does not generate final code.
- Does not call database.
- Does not call API.
- Does not mutate original input.

# Test Requirements

Create:

- `tests/normalize-code-input.test.js`

Tests should verify:

1. Lowercase country/type/source/category are normalized to uppercase.
2. Missing country returns `XX` with warning.
3. Missing customer type returns `UNK` with warning.
4. Unknown customer type returns `UNK` with warning.
5. Missing source returns `MAN` with warning.
6. Unknown source returns `MAN` with warning.
7. Missing supplier category returns `OTH` with warning.
8. Unknown supplier category returns `OTH` with warning.
9. Known object type passes.
10. Unknown object type requires human review.
11. Numeric string year and sequence are accepted.
12. Invalid year requires human review.
13. Invalid sequence requires human review.
14. `normalizeCodeInput` does not mutate original input.
15. `npm test` passes.

# Before Editing

Codex must first report:

1. plan
2. exact files it will create
3. risks or assumptions

Codex must wait for approval before editing.

# After Editing

Codex must report:

1. files created/modified
2. test command and result
3. final git status
4. warnings

# Commit Rule

Do not commit during implementation.

# Acceptance Criteria

- Only the two allowed files are created.
- No existing code is modified.
- `npm test` passes.
- No database/API/UI/OpenAI/Supabase/package.json changes.
