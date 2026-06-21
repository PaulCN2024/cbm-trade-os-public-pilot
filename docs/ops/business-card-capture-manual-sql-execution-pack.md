# Business Card Capture Manual SQL Execution Pack

## Why This Exists

Supabase CLI execution is not the preferred path for this step. This pack is prepared so Paul can manually execute the Business Card Capture read-only data foundation in the Supabase Dashboard SQL Editor.

Codex must not execute this SQL directly. Codex must not run Supabase CLI, psql, migrations, or seed commands for this pack.

## Files

- `docs/ops/business-card-capture-manual-sql-combined.sql`
- `supabase/migrations/20260621_business_card_capture_readonly_foundation.sql`
- `docs/ops/business-card-capture-demo-seed-readonly.sql`

## What It Does

This SQL pack creates a read-only data foundation for the AI 名片识别 module:

- Creates 5 new Business Card Capture tables.
- Inserts 3 fictional DEMO workflows.
- Enables RLS on the new tables.
- Creates authenticated SELECT policies only.
- Supports read-only Admin UI preview data.

It does not upload files, run OCR, parse images, call AI providers, create customers, send messages, generate quotations, generate PI, create orders, trigger payment, trigger production, or trigger shipment.

## Safety Checklist

Before clicking Run in Supabase SQL Editor, confirm:

- The selected project is `PaulCN2024's Project / zswtekjtkyvfagbudkia`.
- The SQL only targets these new tables:
  - `card_capture_sources`
  - `card_extraction_results`
  - `customer_profile_drafts`
  - `card_duplicate_checks`
  - `card_followup_drafts`
- The seed data is DEMO only and uses example-style contact data.
- No secrets are included.
- There is no executable `DROP`, `DELETE`, `TRUNCATE`, or broad `UPDATE`.
- There is no write policy.
- There is no file upload, OCR, AI provider call, customer creation, message sending, quotation, PI, order, payment, production, or shipment execution.

## Manual Execution Steps

1. Open Supabase Dashboard.
2. Select `PaulCN2024's Project / zswtekjtkyvfagbudkia`.
3. Open SQL Editor.
4. Click New query.
5. Open `docs/ops/business-card-capture-manual-sql-combined.sql`.
6. Copy all content.
7. Paste it into Supabase SQL Editor.
8. Click Run.
9. If any error appears, stop and copy the error text for review.

## Verification SQL

After execution succeeds, run:

```sql
select count(*) from card_capture_sources;
select count(*) from card_extraction_results;
select count(*) from customer_profile_drafts;
select count(*) from card_followup_drafts;

select review_status, count(*)
from customer_profile_drafts
group by review_status
order by review_status;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'card_capture_sources',
    'card_extraction_results',
    'customer_profile_drafts',
    'card_duplicate_checks',
    'card_followup_drafts'
  )
order by tablename;

select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'card_capture_sources',
    'card_extraction_results',
    'customer_profile_drafts',
    'card_duplicate_checks',
    'card_followup_drafts'
  )
order by tablename, policyname;
```

Expected:

- `card_capture_sources` count is at least 3.
- `card_extraction_results` count is at least 3.
- `customer_profile_drafts` count is at least 3.
- `card_followup_drafts` count is at least 3.
- All five new tables show `rowsecurity = true`.
- Each new table has an authenticated SELECT policy.

## Next Task

After Paul executes and verifies the SQL manually, the next task is:

`CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-POST-SQL-VERIFY-001`
