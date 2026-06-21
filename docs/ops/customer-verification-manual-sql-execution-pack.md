# Customer Verification Manual SQL Execution Pack

## Purpose

This pack guides manual setup for the AI Customer Verification read-only data foundation.

Codex must not execute this SQL. Paul or an approved human operator should run it in Supabase Dashboard SQL Editor only after reviewing the content.

## Target Project

- Supabase project: PaulCN2024's Project
- Project ref: zswtekjtkyvfagbudkia
- Scope: customer verification read-only foundation only

## Files

Run in this order:

1. `supabase/migrations/20260621_customer_verification_readonly_foundation.sql`
2. `docs/ops/customer-verification-demo-seed-readonly.sql`

Or copy the combined file:

- `docs/ops/customer-verification-manual-sql-combined.sql`

## What This SQL Creates

- `customer_verification_requests`
- `customer_verification_evidence`
- `customer_verification_scores`
- `customer_verification_duplicate_matches`
- `customer_verification_reviews`

It also adds indexes, enables row-level security for these tables, and creates authenticated SELECT policies only.

## What This SQL Does Not Do

- It does not create customer records.
- It does not modify existing customers.
- It does not send Email or WhatsApp.
- It does not run external lookup, scraping, OCR, or AI provider calls.
- It does not create quotations, PI, orders, payment, production, or shipment actions.

## Plain Chinese Instructions For Paul

### 第一步：打开 Supabase

打开 Supabase Dashboard，选择：

`PaulCN2024's Project / zswtekjtkyvfagbudkia`

如果项目不一致，先停下来，不要运行 SQL。

### 第二步：进入 SQL Editor

点击 `SQL Editor`，再点击 `New query`。

### 第三步：复制 SQL

最简单方式：

复制 `docs/ops/customer-verification-manual-sql-combined.sql` 的全部内容，粘贴到 SQL Editor。

也可以分两次运行：

1. 先运行 `supabase/migrations/20260621_customer_verification_readonly_foundation.sql`
2. 再运行 `docs/ops/customer-verification-demo-seed-readonly.sql`

### 第四步：点击 Run 前检查

这个 SQL 只用于建立 AI 客户验证的只读数据基础和 DEMO 数据。

它不会自动创建真实客户，不会发送消息，不会生成报价，不会触发订单、付款、生产或发货。

点击 Run 前，可以在 SQL Editor 搜索这些词：

- `DROP`
- `DELETE`
- `TRUNCATE`
- `UPDATE`
- `GRANT`
- `REVOKE`
- `SECURITY DEFINER`
- `service_role`
- `anonymous`

如果这些词作为真正 SQL 操作出现，不要运行。

如果只在说明文字中出现，或字段名里包含类似 `updated_at`，可以继续人工判断。

### 第五步：点击 Run

点击 `Run`，等待成功提示。

如果报错，把报错内容复制给 Codex，不要反复运行。

## Verification SQL

After running the setup SQL, run:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename like 'customer_verification_%'
order by tablename;

select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename like 'customer_verification_%'
order by tablename, policyname;

select 'customer_verification_requests' as table_name, count(*) as row_count
from public.customer_verification_requests
union all
select 'customer_verification_evidence', count(*)
from public.customer_verification_evidence
union all
select 'customer_verification_scores', count(*)
from public.customer_verification_scores
union all
select 'customer_verification_duplicate_matches', count(*)
from public.customer_verification_duplicate_matches
union all
select 'customer_verification_reviews', count(*)
from public.customer_verification_reviews
order by table_name;
```

Expected result:

- Each `customer_verification_%` table has `rowsecurity = true`.
- Each table has an authenticated SELECT policy.
- `customer_verification_requests >= 3`.
- `customer_verification_evidence >= 9`.
- `customer_verification_scores >= 3`.
- `customer_verification_reviews >= 3`.

## Operational Boundary

This is a data foundation for read-only customer verification review.

It is not approval workflow execution.
It is not customer creation.
It is not customer merge.
It is not external verification.
It is not AI automation.
It is not sales follow-up automation.
