# Supplier Intelligence Manual SQL Execution Pack

## Purpose

This pack records the manual Supabase SQL Editor execution path for the AI Supplier Intelligence read-only data foundation.

It is intended for controlled operator execution only. The SQL is not run by application code.

## Target Project

- Supabase project: `PaulCN2024's Project`
- Project ref: `zswtekjtkyvfagbudkia`
- Execution channel: Supabase Dashboard SQL Editor

## SQL Files

- Migration SQL: `supabase/migrations/20260621_supplier_intelligence_readonly_foundation.sql`
- DEMO seed SQL: `docs/ops/supplier-intelligence-demo-seed-readonly.sql`
- Combined execution pack: `docs/ops/supplier-intelligence-manual-sql-combined.sql`

## Scope

The SQL creates and seeds these read-only supplier intelligence tables:

- `supplier_intelligence_requests`
- `supplier_capability_matches`
- `supplier_questions`
- `supplier_rfq_readiness`
- `supplier_rfq_drafts`
- `supplier_intelligence_reviews`

## Safety Boundary

The SQL is limited to the supplier intelligence read-only foundation:

- creates new supplier intelligence tables only
- inserts fictional DEMO records only
- enables RLS on the new tables
- creates authenticated SELECT-only policies
- does not create write policies
- does not contact suppliers
- does not create or send RFQs
- does not create quotations, PI, orders, payments, production, or shipment actions

## Required Review Before Running

Before execution, confirm the SQL does not contain executable destructive operations such as:

- `DROP`
- `DELETE`
- `TRUNCATE`
- `UPDATE`
- `GRANT`
- `REVOKE`
- `SECURITY DEFINER`
- `service_role`
- anonymous public read policy

## Verification Queries

After execution, verify:

- each new table has expected DEMO row counts
- RLS is enabled on all 6 new tables
- each table has one authenticated SELECT policy

Expected DEMO counts:

- `supplier_intelligence_requests`: 3
- `supplier_capability_matches`: 3
- `supplier_questions`: 15
- `supplier_rfq_readiness`: 3
- `supplier_rfq_drafts`: 3
- `supplier_intelligence_reviews`: 3

