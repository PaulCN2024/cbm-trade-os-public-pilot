# Document Center Implementation Plan

## Purpose

Document Center is part of CBM Trade OS, a foreign trade business operating system. It is not a standalone document generator. Its job is to connect customer, inquiry, project, quotation, PI, commercial invoice, packing list, production order, cutting list, attachments and archive rules into one traceable business workflow.

This document records the current MVP state and the recommended upgrade route. It intentionally does not change runtime behavior.

## Current Project Structure

The current application is a lightweight static Trade OS frontend with Vercel serverless API routes and a Supabase pilot for the front CRM layer.

Relevant files:

- `trade-os-prototype/app.js`: main browser UI and localStorage state handling.
- `lib/mock-crm.js`: mock CRM data models, document mock data, document calculation helpers and archive helper.
- `api/*.js`: Vercel serverless endpoints for health, admin auth, pilot CRM data and public inquiries.
- `supabase/migrations/*.sql`: Supabase pilot migrations for leads, customers, inquiries, follow-up tasks and attachment metadata.
- `docs/*.md`: phase documentation, deployment verification and data-model notes.

Current build check:

- `npm run build` runs JavaScript syntax checks with `node --check`.

## Current Document Center Capabilities

Document Center already exists as an MVP.

### UI Location

The main UI lives in `trade-os-prototype/app.js`.

Important functions include:

- `renderDocuments()`
- `documentDetail()`
- `documentEditor()`
- `customerDocumentPreview()`
- `productionOrderPreview()`
- `customerItemsTable()`
- `productionItemsTable()`
- `bankInfoBlock()`
- `handleDocumentAction()`
- `exportDocumentExcel()`
- `exportDocumentPdf()`

### Mock Logic Location

Most mock document business logic lives in `lib/mock-crm.js`.

Important exports include:

- `DocumentType`
- `DocumentStatus`
- `DocumentItemType`
- `DEFAULT_INTERNAL_WEIGHT_FACTOR`
- `defaultSellers`
- `calculateDocument()`
- `calculateDocumentItem()`
- `upsertCalculatedDocument()`
- `duplicateDocument()`
- `createProductionOrderFromDocument()`
- `documentArchiveInfo()`
- `createBaseDocument()`
- `createCl5437Document()`
- `createOClubHandrailsDocument()`
- `aluminumProfileItem()`
- `accessoryItem()`
- `createBlankDocument()`
- `ensureProductSeeds()`

### Data Storage

The Document Center currently uses mock/localStorage state.

- `trade-os-prototype/app.js` uses `STORAGE_KEY = "cbm-trade-os-v2"`.
- `loadState()` reads browser localStorage.
- `saveState()` writes browser localStorage.
- Document data is stored in arrays such as `state.documents`, `state.sellers` and `state.products`.

This is not yet a real database-backed document system.

### Supported Document Types

Current `DocumentType` values include:

- `quotation`
- `proforma_invoice`
- `production_order`
- `cutting_list`
- `packing_list`

Commercial Invoice is defined in business requirements but is not yet implemented as a first-class document type.

### Existing Calculation Support

The MVP already supports several useful calculation patterns:

- aluminum profile rows quoted by USD/kg
- cut aluminum profile rows quoted by USD/pc
- accessory rows quoted by USD/pc
- charge rows
- internal weight factor through `DEFAULT_INTERNAL_WEIGHT_FACTOR = 1.1`
- document subtotal and total calculation

Customer previews generally show final customer-facing values and hide internal calculation details.

### Existing Production Order Support

The MVP can create a Chinese production order from a customer document through `createProductionOrderFromDocument()`.

The production preview is already designed to hide price, bank and customer-facing commercial fields, while showing production-related fields such as model, material, finish, color, length, cutting length, weight, quantity, packing and production remarks.

### Existing Export Support

Current export behavior is MVP-level:

- `exportDocumentExcel()` exports an HTML table as an `.xls` file.
- `exportDocumentPdf()` uses a browser print window and the user's PDF print/save workflow.

This is not yet true Excel template preservation and not yet a controlled A4 PDF renderer.

### Existing Archive Support

`documentArchiveInfo()` currently generates a mock archive folder and filename.

It does not yet fully match the target customer archive rule:

```text
{base_path} / {customer.folder_alias} / {archive_year}-{archive_order_no}
```

It also does not yet fully match the target file naming rule:

```text
{customer_alias}_{archive_year}-{archive_order_no}_{project}_{document_type}_{date}_v{version}.xlsx
```

## Implemented But Needs Enhancement

The following capabilities exist, but need hardening before long-term use:

- Quotation and Proforma Invoice exist, but templates are not separated into dedicated maintainable modules.
- Chinese Production Order exists, but field-visibility rules should be covered by tests.
- Aluminum kg calculation exists, but calculation logic should be extracted from broad mock CRM logic into a document calculation service.
- Internal weight factor exists, but should eventually be stored in system settings and kept out of customer-facing views.
- Default seller and bank data exist in mock data, but should later move to backend/system settings or database seed data.
- Export exists, but `.xls` HTML export is only a temporary editable output, not true `.xlsx`.
- PDF exists, but browser print is only a temporary fallback, not a stable A4 renderer.
- Archive naming exists, but is not yet based on customer folder alias, archive year/order number, project name and document version.
- Cutting List and Packing List exist as document type enums, but are not yet complete document workflows.
- Supabase pilot exists for CRM front objects, but Document Center is still mock/localStorage.

## Missing Capabilities

Important missing items compared with the target business rules:

- Commercial Invoice as a first-class document type.
- Commercial Invoice detailed mode.
- Commercial Invoice summary mode.
- Customer-facing Packing List workflow.
- Factory-facing Cutting List workflow.
- True Excel template upload and preservation.
- Priority use of user-adjusted Excel templates.
- True `.xlsx` export with preserved width, height, fonts, colors, borders, merged cells and images.
- Controlled A4 PDF export with table boundary checks, image scaling, text wrapping and Chinese font support.
- Exported file version tracking.
- `exported_files` metadata.
- ZIP fallback when the app cannot write directly to the user's archive path.
- Customer `folder_alias`.
- Customer archive base path setting.
- Customer archive year/order number fields.
- Dedicated seller and bank account configuration tables.
- Dedicated document item tables.
- Real file upload and storage for document source files and generated files.
- Automated tests for customer document hidden fields.
- Automated tests for Chinese Production Order hidden fields.
- Automated tests for aluminum kg calculation and hidden internal uplift factor.

## Business Rule Gaps

### Customer-Facing Documents

Customer-facing documents must hide:

- internal cost
- profit
- exchange rate details
- aluminum 10% internal weight uplift rule
- uplift
- 上浮
- wastage
- packing weight
- factory production remarks
- RMB internal purchase cost
- RMB/kg freight cost
- customs declaration cost breakdown

The current MVP mostly follows this in preview, but the rules are not yet centralized or covered by tests.

### Chinese Production Orders

Chinese Production Orders must hide:

- customer company name
- customer address
- customer contact person
- customer email
- customer phone
- sales unit price
- sales total amount
- freight amount
- bank information
- payment method
- exchange rate
- profit
- customer payment terms

The current MVP is directionally correct, but this needs a dedicated visibility test before the module becomes production-grade.

### Aluminum Profile Pricing

The current MVP supports internal factor calculation:

```text
total_weight_kg = quantity_pcs * length_m * weight_kg_per_m * internal_weight_factor
internal_weight_factor = 1.10
amount_usd = total_weight_kg * unit_price_usd_per_kg
```

Customer documents should show theoretical kg/m, final total kg, USD/kg and amount, but never show the internal factor or uplift language.

### Commercial Invoice

Commercial Invoice is currently a major missing workflow.

Target modes:

- detailed mode: material detail lines
- summary mode: buyer, seller, project, goods description, total quantity, total net weight, goods value, shipment cost, invoice total and remarks

Customs Commercial Invoice values should reflect goods value and shipment cost, not simply the remaining balance after a deposit deduction.

## Recommended Phased Route

### Phase DC-1: Rules And Documentation Lock

Status: current low-risk phase.

Work:

- Create root `AGENTS.md`.
- Create this implementation plan.
- Do not change runtime behavior.
- Do not refactor `trade-os-prototype/app.js`.
- Do not alter Document Center UI logic.

### Phase DC-2: Extract Document Services Without UI Behavior Change

Goal: make current MVP maintainable without changing what users see.

Recommended new files:

- `lib/document-calculations.js`
- `lib/document-visibility.js`
- `lib/document-archive.js`
- `lib/document-templates.js`

Move logic gradually from broad UI and mock CRM helpers into services, while keeping the existing UI output stable.

### Phase DC-3: Add Tests Around Current Rules

Goal: prevent accidental leaks of internal commercial data.

Recommended tests:

- customer document visibility tests
- production order visibility tests
- aluminum kg calculation tests
- charge row visibility tests
- archive filename tests
- Commercial Invoice summary/detailed tests after CI exists

### Phase DC-4: Complete Mock Document Workflows

Goal: complete the mock workflows before database migration.

Add or improve:

- Commercial Invoice
- Packing List
- Cutting List
- versioned export metadata
- archive path preview
- ZIP fallback design
- user template metadata model

### Phase DC-5: Supabase Document Migration Plan

Goal: move only stable document models into Supabase.

Do not migrate until the mock document model is clear.

### Phase DC-6: Real Export Engine

Goal: replace temporary export behavior with reliable generated files.

Evaluate:

- ExcelJS or another `.xlsx` library for editable Excel output.
- Playwright, Puppeteer or server-side HTML-to-PDF flow for A4 PDF output.
- Supabase Storage or other storage for generated files.

## Low-Risk Refactor Plan

The next safe implementation step should be small and reversible:

1. Create `lib/document-calculations.js`.
2. Move pure calculation helpers only.
3. Keep function signatures compatible.
4. Add basic calculation tests or build-time checks.
5. Create `lib/document-visibility.js`.
6. Move field-visibility rules only.
7. Add leak-prevention tests for customer documents and Chinese Production Orders.
8. Leave `trade-os-prototype/app.js` UI rendering unchanged until tests pass.

Do not add Supabase, API routes, OpenAI or file upload in this refactor.

## Future Supabase Migration Plan

Potential future tables:

- `sellers`
- `seller_bank_accounts`
- `documents`
- `document_items`
- `document_charges`
- `production_orders`
- `exported_files`
- `document_templates`
- `customer_archive_settings`

Potential customer fields:

- `folder_alias`
- `default_archive_base_path`
- `archive_order_sequence`

Potential document fields:

- `document_type`
- `document_no`
- `document_status`
- `customer_id`
- `lead_id`
- `inquiry_id`
- `project_id`
- `quotation_id`
- `order_id`
- `seller_id`
- `currency`
- `incoterm`
- `destination_port`
- `archive_year`
- `archive_order_no`
- `project_code`
- `version`
- `source_template_file_id`
- `created_by`
- `review_required`
- `created_at`
- `updated_at`

Potential document item fields:

- `document_id`
- `item_type`
- `item_code`
- `description`
- `image_url`
- `material`
- `finish`
- `color`
- `length_m`
- `cut_length_mm`
- `weight_kg_per_m`
- `quantity`
- `unit`
- `unit_price_usd`
- `internal_weight_factor`
- `total_weight_kg`
- `amount_usd`
- `internal_cost_note`
- `production_remark`
- `sort_order`

RLS and admin authentication must be designed before any real migration.

## PDF And Excel Plan

### Current Temporary Behavior

- Excel: browser-generated HTML `.xls`.
- PDF: browser print window.

### Target Excel Behavior

Future Excel export should:

- create real `.xlsx` files
- preserve user uploaded templates where possible
- preserve images
- preserve column widths and row heights
- preserve borders, fonts, colors and merged cells
- keep amount and quantity formatting consistent
- avoid overwriting previous versions by default

### Target PDF Behavior

Future PDF export should:

- use A4 pages
- keep tables inside page boundaries
- auto-scale images
- wrap long text
- right-align quantities and amounts
- support English customer documents
- support Chinese Production Orders
- match the preview content

## Test Plan

Recommended checks before production use:

- Customer Quotation does not reveal internal weight factor.
- Customer PI does not reveal uplift, 上浮, wastage or packing weight.
- Customer charge rows do not reveal RMB/kg freight or customs declaration cost breakdown.
- Chinese Production Order does not reveal customer contact fields.
- Chinese Production Order does not reveal sales price, freight, bank, payment, exchange rate or profit.
- Aluminum profile kg calculation matches expected total weight and amount.
- Cut aluminum profile pc calculation matches expected amount.
- Accessory rows do not show length or weight.
- Commercial Invoice summary mode hides material model line details.
- Archive path uses customer `folder_alias` and `archive_year-archive_order_no`.
- Export versions do not overwrite prior files by default.

## Risks And Notes

- `trade-os-prototype/app.js` is large, so broad refactors are risky.
- Document Center is still mock/localStorage and not yet part of the Supabase pilot.
- Vercel Hobby deployments may be sensitive to API function count, so avoid adding API routes casually.
- Bank information must not drift into hardcoded frontend UI components.
- User uploaded Excel template preservation is complex and should be implemented only after the data model is stable.
- Direct local archive writing may not be available in browser or Vercel environments; ZIP fallback is likely required.
- Chinese PDF rendering needs font support and careful visual testing.
- No automatic customer messages, official quotations, PI, price confirmations, delivery confirmations, payment term confirmations, bank account confirmations, compensation promises or responsibility judgments are allowed.
