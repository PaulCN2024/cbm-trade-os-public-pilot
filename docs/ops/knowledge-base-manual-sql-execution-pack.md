# Knowledge Base Manual SQL Execution Pack

## Why This Exists

The Supabase CLI execution channel is unavailable on Paul's Mac because the Homebrew-installed CLI failed with invalid signature / `SIGKILL`, and the fallback install attempts did not produce a usable CLI.

Paul will execute the Knowledge Base read-only foundation SQL manually in the Supabase Dashboard SQL Editor.

Codex must not run this SQL in the current task.

## Files To Use

- Combined manual SQL pack: `docs/ops/knowledge-base-manual-sql-combined.sql`
- Original migration SQL: `supabase/migrations/20260620_knowledge_base_readonly_foundation.sql`
- Original DEMO seed SQL: `docs/ops/knowledge-base-demo-seed-readonly.sql`

Recommended file for manual execution:

```text
docs/ops/knowledge-base-manual-sql-combined.sql
```

## Execution Order

1. Open Supabase Dashboard.
2. Open the correct CBM Trade OS Supabase project.
3. Go to SQL Editor.
4. Review `docs/ops/knowledge-base-manual-sql-combined.sql`.
5. Copy the migration section first and run it.
6. Verify the `knowledge_*` tables exist.
7. Copy the DEMO seed section and run it.
8. Verify row counts using the SQL snippets below.

If Paul prefers a single paste:

1. Open `docs/ops/knowledge-base-manual-sql-combined.sql`.
2. Copy the full file.
3. Paste it into Supabase SQL Editor.
4. Review it again in Supabase before clicking Run.
5. Run once.
6. Run the verification SQL snippets.

## Recommended Verification SQL

```sql
select count(*) as knowledge_categories_count from knowledge_categories;

select count(*) as knowledge_items_count from knowledge_items;

select verification_status, count(*)
from knowledge_items
group by verification_status
order by verification_status;

select source_reference, title
from knowledge_items
order by created_at
limit 20;
```

## Expected Results

- `knowledge_categories_count >= 7`
- `knowledge_items_count >= 12`
- `source_reference` values should begin with `DEMO_`
- `verification_status` should be `draft`, `needs_review`, or `verified` depending on the DEMO seed row

## Safety Checklist Before Clicking Run

Paul should confirm:

- The correct Supabase project is open.
- The SQL was reviewed before execution.
- No `DROP`, `DELETE`, `TRUNCATE`, `ALTER`, or `UPDATE` statement is present in executable SQL.
- No `service_role` key or secret is present.
- No real customer confidential data is present.
- No real price commitment is present.
- No supplier commitment is present.
- Only `knowledge_*` tables are affected.
- This is read-only foundation/demo data, not RAG, embeddings, upload, OCR, AI answer generation, or business execution.

## After Execution

After manual execution, Paul should send Codex:

- Whether the migration succeeded.
- Whether the DEMO seed succeeded.
- `knowledge_categories_count`.
- `knowledge_items_count`.
- Any SQL error text, if present.
- Optional screenshot only if it contains no secrets.

Do not send Supabase tokens, database URLs, passwords, service-role keys, request headers, cookies, or local/session storage.

## Next Codex Task

```text
CBM-CODEX-KNOWLEDGE-POST-SQL-VERIFY-001
```

Goal:

Verify Knowledge Base real data after manual SQL execution.
