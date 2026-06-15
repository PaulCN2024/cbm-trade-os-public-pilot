# Task ID

`CBM-CODEX-IMPL-004`

# Title

Duplicate Check Interface Stub

# Purpose

Add a pure duplicate-check interface stub for future business-code and business-object duplicate detection.

# Action Type

Small code implementation

# Risk Level

Low

# Allowed Files

- `lib/services/numbering/duplicate-check.js`
- `tests/duplicate-check.test.js`

# Allowed Reads

- `lib/services/numbering/code-dictionaries.js`
- `lib/services/numbering/generate-code-suggestion.js`
- `lib/services/numbering/normalize-code-input.js`
- `tests/numbering-dictionaries.test.js`
- `tests/generate-code-suggestion.test.js`
- `tests/normalize-code-input.test.js`

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

- numbering dictionaries
- `generateCodeSuggestion`
- `normalizeCodeInput`

The next step is to add a pure duplicate-check interface stub.

This must not access Supabase, must not call APIs, and must not perform real database duplicate checks.

# Goal

Create a pure utility file:

- `lib/services/numbering/duplicate-check.js`

It should export helper functions such as:

- `checkDuplicateCodeCandidate(input)`
- `normalizeExistingRecords(records)`

# Implementation Requirements

Suggested input:

```js
{
  candidate_code,
  candidate_name,
  candidate_email,
  candidate_phone,
  candidate_website,
  object_type,
  existing_records
}
```

Suggested output:

```js
{
  has_possible_duplicate,
  duplicate_candidates,
  warnings,
  needs_human_review
}
```

Required behavior:

1. No database access.
2. No Supabase access.
3. No API access.
4. Does not mutate original input.
5. If `candidate_code` exactly matches an existing record code, mark as possible duplicate.
6. If `candidate_email` exactly matches an existing record email, mark as possible duplicate.
7. If `candidate_phone` exactly matches an existing record phone, mark as possible duplicate.
8. If `candidate_website` exactly matches an existing record website, mark as possible duplicate.
9. If `candidate_name` matches exactly after trim/lowercase normalization, mark as possible duplicate.
10. If `existing_records` is missing or empty, return no duplicates and a warning that real database duplicate check is not performed.
11. If duplicates are found, set `needs_human_review: true`.
12. Return `duplicate_candidates` with reason fields, such as:
    - `code_match`
    - `email_match`
    - `phone_match`
    - `website_match`
    - `name_match`

# Important Boundary

This is only a pure interface stub for future duplicate detection.

It is not a final duplicate detection system.

It must not query Supabase or any remote service.

# Test Requirements

Create:

- `tests/duplicate-check.test.js`

Tests should verify:

1. Exact code match detects duplicate.
2. Exact email match detects duplicate.
3. Exact phone match detects duplicate.
4. Exact website match detects duplicate.
5. Normalized exact name match detects duplicate.
6. Missing `existing_records` returns no duplicates with warning.
7. Empty `existing_records` returns no duplicates with warning.
8. Duplicates set `needs_human_review: true`.
9. No duplicates returns `needs_human_review: false`.
10. Original input is not mutated.
11. `npm test` passes.

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
- Duplicate detection remains pure and local only.
