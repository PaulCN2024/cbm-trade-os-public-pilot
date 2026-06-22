# Follow-up Assistant SQL Execution Pack

## Why this exists

This pack records the approval-gated SQL needed for the AI Follow-up Assistant read-only data foundation.

The SQL is intentionally limited to read-only foundation data:

- create new `followup_*` tables
- insert fictional DEMO follow-up workflows
- enable RLS on the new tables
- create authenticated SELECT-only policies

It does not create real tasks, scheduled reminders, customer updates, inquiry updates, message sending, AI provider calls, quotation, PI, order, payment, production, or shipment actions.

## Files

- `docs/ops/followup-assistant-manual-sql-combined.sql`
- `supabase/migrations/20260621_followup_assistant_readonly_foundation.sql`
- `docs/ops/followup-assistant-demo-seed-readonly.sql`

## What it does

- Creates `followup_candidates`
- Creates `followup_missing_information`
- Creates `followup_recommendations`
- Creates `followup_message_drafts`
- Creates `followup_reviews`
- Inserts 3 fictional DEMO follow-up workflows
- Enables RLS on the 5 new tables
- Creates authenticated SELECT-only policies

## What it does not do

- No sending
- No real task creation
- No scheduled reminders
- No AI provider calls
- No customer mutation
- No inquiry mutation
- No quote, PI, order, payment, production, or shipment execution
- No write policies
- No anonymous/public policies
- No destructive SQL

## Approval rule

This SQL may execute only after Paul replies exactly:

```text
APPROVED
```

## Verification SQL

```sql
select count(*) as followup_candidates_count
from followup_candidates;

select count(*) as followup_missing_information_count
from followup_missing_information;

select count(*) as followup_recommendations_count
from followup_recommendations;

select count(*) as followup_message_drafts_count
from followup_message_drafts;

select count(*) as followup_reviews_count
from followup_reviews;

select status, count(*)
from followup_candidates
group by status
order by status;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'followup_candidates',
    'followup_missing_information',
    'followup_recommendations',
    'followup_message_drafts',
    'followup_reviews'
  )
order by tablename;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'followup_candidates',
    'followup_missing_information',
    'followup_recommendations',
    'followup_message_drafts',
    'followup_reviews'
  )
order by tablename, policyname;
```

## Expected verification result

- `followup_candidates` count is at least 3
- `followup_missing_information` count is at least 6
- `followup_recommendations` count is at least 3
- `followup_message_drafts` count is at least 3
- `followup_reviews` count is at least 3
- RLS is enabled for all 5 new tables
- Policies are SELECT-only for authenticated users
