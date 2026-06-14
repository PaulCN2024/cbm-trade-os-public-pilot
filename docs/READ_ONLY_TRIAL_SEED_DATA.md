# Read-Only Trial Seed Data

Date: 2026-06-14

## Purpose

This seed data is only for the CBM Trade OS limited internal read-only trial.

It inserts safe demo records into the four Step 2 read-only tables so the production Admin UI can be verified with live Supabase data instead of empty states.

This seed does not add UI write features, does not send messages, does not create quotations, does not create PI, and does not confirm price, delivery time, payment terms, bank account, production feasibility, orders or shipment.

## Tables Seeded

- `companies`
- `products`
- `manufacturing_capabilities`
- `ai_inquiry_analyses`

All records use `TEST_` or `DEMO_` labels and fake company/project names.

## SQL Snippet

Run this SQL in the Supabase SQL Editor for project `zswtekjtkyvfagbudkia`.

```sql
-- CBM Trade OS Step 2G read-only trial seed data
-- Safe demo data only. No real customer private information.
-- Non-destructive: INSERT statements only.

insert into public.companies (
  company_name,
  country,
  address,
  website,
  business_type,
  notes
) values
(
  'TEST_Atlas Facade Buyers Ltd.',
  'United Arab Emirates',
  'Demo address only, Dubai',
  'https://example.com/test-atlas-facade',
  'Architectural project buyer',
  'TEST data for read-only trial. Fake company. No real customer information.'
),
(
  'TEST_Northline Precision Sourcing Inc.',
  'United States',
  'Demo address only, California',
  'https://example.com/test-northline',
  'Industrial aluminum parts buyer',
  'TEST data for read-only trial. Fake company. No commercial commitment.'
),
(
  'DEMO_Inquiry Holding Co.',
  'Spain',
  null,
  null,
  'Mixed inquiry buyer',
  'DEMO record with optional address and website intentionally missing.'
);

insert into public.products (
  business_line,
  category,
  product_family,
  code,
  name_cn,
  name_en,
  name_es,
  material,
  standard,
  surface,
  process_tags,
  notes
) values
(
  'A_ARCHITECTURAL',
  'Windows and Doors',
  'Architectural Aluminum Systems',
  'TEST-AW-001',
  '测试建筑铝门窗系统',
  'TEST Aluminum Windows and Doors System',
  'Sistema de ventanas y puertas de aluminio TEST',
  'Aluminum alloy',
  'Project specification review required',
  'Powder coating',
  '["drawing_review", "project_supply", "surface_finish"]'::jsonb,
  'TEST product for read-only trial. Not an official offer.'
),
(
  'B_INDUSTRIAL',
  'CNC Aluminum Parts',
  'Precision Aluminum Manufacturing',
  'TEST-CNC-001',
  '测试CNC铝件',
  'TEST CNC Aluminum Machined Part',
  'Pieza mecanizada de aluminio CNC TEST',
  '6061-T6 aluminum',
  'Drawing and tolerance review required',
  'Anodized',
  '["cnc_machining", "drawing_required", "manual_review"]'::jsonb,
  'TEST product for read-only trial. Price, feasibility and lead time are not confirmed.'
),
(
  'UNKNOWN',
  'General Aluminum Product',
  'Unclassified Aluminum Inquiry',
  'DEMO-AL-UNKNOWN',
  '测试未分类铝制品',
  'DEMO Unclassified Aluminum Product',
  'Producto de aluminio sin clasificar DEMO',
  null,
  'Requires business line review',
  null,
  '["needs_classification"]'::jsonb,
  'DEMO product with optional material and surface intentionally missing.'
);

insert into public.manufacturing_capabilities (
  capability_line,
  equipment,
  quantity,
  max_length,
  monthly_capacity,
  public_description,
  internal_notes
) values
(
  'A_ARCHITECTURAL',
  'DEMO aluminum project fabrication support',
  2,
  'Up to 7m surface finish review range',
  'Project dependent',
  'Demo architectural aluminum project capability for read-only trial. Drawing review required.',
  'Internal demo note only. Does not confirm feasibility, price or delivery time.'
),
(
  'B_INDUSTRIAL',
  'TEST CNC machining centers',
  16,
  'Part-size dependent',
  'Capacity requires manual review',
  'Demo CNC aluminum machining capability for read-only trial. Drawings and tolerances must be reviewed.',
  'Internal demo note only. No production commitment.'
),
(
  'UNKNOWN',
  'DEMO general aluminum processing line',
  1,
  null,
  null,
  'Demo capability with max length and monthly capacity intentionally missing.',
  'Internal demo note only. Requires classification before use.'
);

insert into public.ai_inquiry_analyses (
  detected_business_line,
  extracted_requirements,
  missing_information,
  risk_flags,
  suggested_reply,
  approval_required
) values
(
  'A_ARCHITECTURAL',
  '{
    "project_type": "hotel windows and facade package",
    "country": "United Arab Emirates",
    "requested_products": ["windows", "curtain wall profiles"],
    "drawing_status": "partial drawings mentioned"
  }'::jsonb,
  '["window schedule", "glass specification", "aluminum color", "destination port"]'::jsonb,
  '["manual quotation required", "technical review required"]'::jsonb,
  'Draft only: Thank you for your inquiry. Please share the window schedule, glass specification, color requirement and destination port so our team can review manually before any official quotation.',
  true
),
(
  'B_INDUSTRIAL',
  '{
    "part_type": "CNC aluminum bracket",
    "material": "6061 aluminum mentioned",
    "surface_finish": "anodizing requested",
    "drawing_status": "drawing required for review"
  }'::jsonb,
  '["2D or 3D drawing file", "tolerance", "quantity", "inspection requirement"]'::jsonb,
  '["do not confirm production feasibility", "do not confirm lead time"]'::jsonb,
  'Draft only: Thank you for the CNC aluminum parts inquiry. Please send the drawing file, tolerance requirement, quantity and inspection requirement for manual engineering review.',
  true
),
(
  'UNKNOWN',
  '{
    "message_type": "general aluminum product inquiry",
    "business_line_status": "unclear",
    "requested_action": "classification needed"
  }'::jsonb,
  '["product application", "drawings or photos", "quantity", "destination"]'::jsonb,
  '["business line unclear", "manual classification required"]'::jsonb,
  'Draft only: Thank you for your aluminum product inquiry. Please share the product application, drawings or photos, quantity and destination so we can classify the request and review it manually.',
  true
);
```

## How To Run

1. Open Supabase project `zswtekjtkyvfagbudkia`.
2. Open SQL Editor.
3. Paste the SQL snippet above.
4. Run the query.
5. If Supabase warns about potential changes, confirm only after checking that the SQL contains `INSERT` statements only.

## API Verification

After logging in as an admin/test admin, the four production endpoints should return `200` and non-zero record counts:

```bash
GET https://project-7vo99.vercel.app/api/companies
GET https://project-7vo99.vercel.app/api/products
GET https://project-7vo99.vercel.app/api/manufacturing-capabilities
GET https://project-7vo99.vercel.app/api/ai-inquiry-analyses
```

Unauthenticated requests should still return `401`.

## Admin UI Verification

Open:

```text
https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1
```

Check these read-only sections:

- Companies
- Products
- Capabilities
- AI Drafts

Expected result:

- live rows are shown
- no `Preview fallback / local preview data - not live Supabase data` label appears when authenticated
- empty state is no longer shown for the four seeded sections
- no create, update or delete action is enabled
- AI Drafts still show `Draft only`, `Approval Required`, `Not sent` and `Human review required`

## Test Data Identification

Demo records can be identified by:

- company names beginning with `TEST_` or `DEMO_`
- product codes beginning with `TEST-` or `DEMO-`
- notes containing `read-only trial`
- suggested replies beginning with `Draft only:`

## Cleanup Notes

This document intentionally does not include cleanup SQL because the current step is non-destructive.

If duplicate demo records are created during testing, manually remove only records clearly labeled `TEST_` or `DEMO_` after confirming they are not needed. Do not delete real customer or production data.
