# Knowledge Base RLS Manual SQL Pack

## Why This Exists

Supabase Advisor reports RLS disabled for the new `knowledge_*` tables.

The local Supabase CLI remains unusable, so Paul should apply this small RLS read policy SQL through Supabase Dashboard SQL Editor after reviewing this safety summary.

## SQL File To Run

- `docs/ops/knowledge-base-rls-policy.sql`

## Simple Explanation For Paul

这份 SQL 不删除数据。

It only:

- turns on table protection for the Knowledge Base tables
- allows logged-in/authenticated users to read knowledge records
- does not allow create/edit/delete
- does not create public anonymous read access
- does not touch non-knowledge tables

## Before Running Checklist

Paul should confirm:

- Correct Supabase project: `PaulCN2024's Project / zswtekjtkyvfagbudkia`
- SQL only affects `knowledge_*` tables
- SQL enables RLS
- SQL creates authenticated `SELECT` policies only
- SQL has no write policies
- SQL has no `DROP`, `DELETE`, `TRUNCATE`, `UPDATE`, or `INSERT`
- SQL has no `service_role`

## Manual Execution Steps

1. Open Supabase Dashboard.
2. Select project `PaulCN2024's Project / zswtekjtkyvfagbudkia`.
3. Go to SQL Editor.
4. Create a new query.
5. Paste the contents of `docs/ops/knowledge-base-rls-policy.sql`.
6. Run the query once.
7. Do not run any unrelated SQL in the same query.

## Verification SQL

After running the RLS SQL, run:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename like 'knowledge_%'
order by tablename;
```

Then run:

```sql
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename like 'knowledge_%'
order by tablename, policyname;
```

Expected:

- `rowsecurity` is `true` for each `knowledge_*` table
- each table has one `SELECT` policy for `authenticated`
- there are no `INSERT`, `UPDATE`, or `DELETE` policies

## What Paul Should Send Back

Please send Codex:

- whether the RLS SQL succeeded
- the `rowsecurity` result
- the policy list result
- any SQL error text, if the SQL failed

Do not send passwords, API keys, service-role keys, database connection strings, browser cookies, or bearer tokens.

## Next Task

`CBM-CODEX-KNOWLEDGE-RLS-POST-VERIFY-001`

