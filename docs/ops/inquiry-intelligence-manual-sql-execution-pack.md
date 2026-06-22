# Inquiry Intelligence SQL Execution Pack

## Why This Exists

This pack records the approval-gated SQL foundation for the AI Inquiry Intelligence read-only data layer.

It exists so Paul can review exactly what SQL was prepared before any database execution and so future Codex work can reuse the same safety boundary.

## Files

- `docs/ops/inquiry-intelligence-manual-sql-combined.sql`
- `supabase/migrations/20260621_inquiry_intelligence_readonly_foundation.sql`
- `docs/ops/inquiry-intelligence-demo-seed-readonly.sql`

## What It Does

- Creates 7 inquiry intelligence tables.
- Inserts 3 fictional DEMO inquiry workflows.
- Enables RLS on the new inquiry intelligence tables.
- Creates authenticated SELECT policies.
- Keeps the feature read-only for the Admin UI.

It does not:

- call an AI provider
- parse files, drawings, or images
- create supplier RFQs
- create quotations
- send customer or supplier messages
- mutate customer or inquiry records
- create write policies

## Approval Rule

SQL may execute only after Paul replies exactly:

```text
APPROVED
```

## Verification SQL

```sql
select count(*) as inquiry_intelligence_requests_count
from public.inquiry_intelligence_requests;

select count(*) as inquiry_product_classifications_count
from public.inquiry_product_classifications;

select count(*) as inquiry_missing_information_count
from public.inquiry_missing_information;

select count(*) as inquiry_quotation_readiness_count
from public.inquiry_quotation_readiness;

select count(*) as inquiry_supplier_rfq_requirements_count
from public.inquiry_supplier_rfq_requirements;

select count(*) as inquiry_reply_drafts_count
from public.inquiry_reply_drafts;

select count(*) as inquiry_intelligence_reviews_count
from public.inquiry_intelligence_reviews;

select analysis_status, count(*)
from public.inquiry_intelligence_requests
group by analysis_status
order by analysis_status;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'inquiry_intelligence_requests',
    'inquiry_product_classifications',
    'inquiry_missing_information',
    'inquiry_quotation_readiness',
    'inquiry_supplier_rfq_requirements',
    'inquiry_reply_drafts',
    'inquiry_intelligence_reviews'
  )
order by tablename;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'inquiry_intelligence_requests',
    'inquiry_product_classifications',
    'inquiry_missing_information',
    'inquiry_quotation_readiness',
    'inquiry_supplier_rfq_requirements',
    'inquiry_reply_drafts',
    'inquiry_intelligence_reviews'
  )
order by tablename, policyname;
```

## Expected Counts

- `inquiry_intelligence_requests`: at least 3
- `inquiry_product_classifications`: at least 3
- `inquiry_missing_information`: at least 9
- `inquiry_quotation_readiness`: at least 3
- `inquiry_supplier_rfq_requirements`: at least 3
- `inquiry_reply_drafts`: at least 3
- `inquiry_intelligence_reviews`: at least 3

Expected security:

- RLS enabled on all 7 new tables
- policies are SELECT to authenticated only
