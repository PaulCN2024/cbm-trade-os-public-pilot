# Task ID

`CBM-CODEX-IMPL-005`

# Title

Numbering Module Index / Public Export

# Purpose

Add a small public index file for the numbering service so future services and AI tools can import numbering utilities from one stable module entry point.

# Action Type

Small code implementation

# Risk Level

Low

# Allowed Files

- `lib/services/numbering/index.js`
- `tests/numbering-index.test.js`

# Allowed Reads

- `lib/services/numbering/code-dictionaries.js`
- `lib/services/numbering/generate-code-suggestion.js`
- `lib/services/numbering/normalize-code-input.js`
- `lib/services/numbering/duplicate-check.js`
- `tests/numbering-dictionaries.test.js`
- `tests/generate-code-suggestion.test.js`
- `tests/normalize-code-input.test.js`
- `tests/duplicate-check.test.js`

# Forbidden Files

- `api/*`
- `supabase/migrations/*`
- `admin/*`
- `trade-website/*`
- `trade-os-prototype/*`
- `package.json`
- any OpenAI / Gmail / WhatsApp / quotation / PI / order / shipment code

# Context

The project already has four low-risk numbering utilities:

- `code-dictionaries.js`
- `generate-code-suggestion.js`
- `normalize-code-input.js`
- `duplicate-check.js`

The next step is to add a stable module entry point:

- `lib/services/numbering/index.js`

# Goal

Create a public export file that re-exports the existing numbering utilities and constants.

# Implementation Requirements

1. Create `lib/services/numbering/index.js`.
2. Export all public constants and helper arrays from `code-dictionaries.js`.
3. Export `generateCodeSuggestion` from `generate-code-suggestion.js`.
4. Export all public normalization helpers from `normalize-code-input.js`.
5. Export `checkDuplicateCodeCandidate` and `normalizeExistingRecords` from `duplicate-check.js`.
6. Do not change the existing implementation files.
7. Do not add new business logic.
8. Do not access database, Supabase, API, UI, or OpenAI.
9. Keep this as a simple CommonJS public export module consistent with existing files.

# Test Requirements

Create:

- `tests/numbering-index.test.js`

Tests should verify:

1. `index.js` exports `CUSTOMER_TYPE_CODES`.
2. `index.js` exports `SOURCE_CODES`.
3. `index.js` exports `SUPPLIER_CATEGORY_CODES`.
4. `index.js` exports `OBJECT_TYPE_CODES`.
5. `index.js` exports `DEFAULT_CODES`.
6. `index.js` exports `generateCodeSuggestion`.
7. `index.js` exports `normalizeCodeInput`.
8. `index.js` exports `normalizeCountryCode`.
9. `index.js` exports `normalizeCustomerType`.
10. `index.js` exports `normalizeSourceCode`.
11. `index.js` exports `normalizeSupplierCategory`.
12. `index.js` exports `normalizeObjectType`.
13. `index.js` exports `normalizeYear`.
14. `index.js` exports `normalizeSequence`.
15. `index.js` exports `checkDuplicateCodeCandidate`.
16. `index.js` exports `normalizeExistingRecords`.
17. `npm test` passes.

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
- Existing numbering tests continue to pass.
