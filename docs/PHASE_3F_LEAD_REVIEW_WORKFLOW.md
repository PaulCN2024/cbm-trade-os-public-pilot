# Phase 3F Lead Review Workflow

Date: 2026-06-11
Project: CBM Trade OS

## Scope

Phase 3F improves the real Supabase pilot for the first real website inquiries.

In scope:

- leads
- inquiries
- follow_up_tasks
- customers manual conversion
- attachment metadata display

Out of scope:

- OpenAI API
- Gmail integration
- WhatsApp integration
- projects migration
- quotations migration
- orders migration
- shipments migration
- after-sales migration
- complex team permissions

## Lead Review Flow

Public website inquiries in Supabase mode follow this path:

```text
public website inquiry
-> /api/public-inquiries
-> Lead
-> Inquiry
-> FollowUpTask
-> admin manual review
```

Lead review statuses:

- `NEW`
- `NEED_REVIEW`
- `QUALIFIED`
- `DISQUALIFIED`
- `CONVERTED_TO_CUSTOMER`

Lead Review UI shows:

- lead source
- customer name
- company
- country
- email
- whatsapp
- business line
- inquiry title
- inquiry summary
- created_at
- follow-up task status
- test data badge when applicable

## Convert To Customer Flow

Public inquiry submission does not automatically create a customer.

Admin manual conversion:

```text
Lead
-> Convert to Customer button
-> create Customer
-> update Lead.customer_id
-> update Lead.status = CONVERTED_TO_CUSTOMER
-> update related Inquiry.customer_id
-> update related FollowUpTask.customer_id
```

The original `lead_id` is preserved on the inquiry and follow-up task.

## Missing Information Checklist

Inquiry detail includes a business-line-specific checklist.

Architectural Aluminum:

- drawings
- product category
- project location
- glass specification
- aluminum color
- quantity/area
- destination port

Precision Aluminum Manufacturing:

- drawing file
- material grade
- tolerance
- surface finish
- quantity
- destination

## Follow-up Workbench

Dashboard includes a pilot follow-up workbench showing:

- pending follow-ups
- overdue follow-ups
- high-priority inquiries
- leads needing review
- inquiries needing missing information

This workbench is for admin review only. It does not send customer messages.

## Test Data Marking

Phase 3F supports `is_test` as a pilot data marker.

Current compatibility behavior:

- API output exposes `is_test: boolean`.
- Public inquiry metadata can store `metadata.is_test`.
- A migration is provided to add first-class `is_test` boolean columns to pilot tables.

Migration:

- `supabase/migrations/202606110001_phase_3f_lead_review_is_test.sql`

Pilot test data should be visibly marked and not silently mixed with real customer data.

## Safe Reply Draft Placeholder

Inquiry detail can show rule-based reply draft placeholders.

Rules:

- no OpenAI API
- no automatic sending
- no official quotation
- no PI
- no confirmed price
- no confirmed delivery time
- no confirmed payment terms
- no confirmed bank account
- no compensation promise
- no responsibility judgment

## Admin Protection

The following must require admin auth in Supabase mode:

- Lead Review
- Convert Lead to Customer
- Follow-up Workbench
- Pilot cleanup
- Data export / dev test pages

Admin APIs return `401` without an authenticated Bearer token.

## What Remains Mock

The following remain mock/localStorage in this phase:

- projects
- quotations
- orders
- shipments
- after-sales
- document center downstream records
- AI assistant output
- Gmail and WhatsApp learning/sending

## Supabase Mode Test Steps

1. Submit an inquiry from `/trade-website`.
2. Log in at `/admin/login`.
3. Open `/trade-os-prototype`.
4. Open Lead Pool.
5. Confirm new website lead appears as `NEED_REVIEW`.
6. Review source, name, company, country, email, WhatsApp, business line, inquiry title, summary and follow-up task status.
7. Open Inquiry Pool and confirm missing information checklist.
8. Click Convert to Customer from Lead Pool.
9. Confirm customer is created and lead status becomes `CONVERTED_TO_CUSTOMER`.
10. Confirm related inquiry and follow-up task are linked to the new customer.

## Mock Mode Test Steps

1. Set `NEXT_PUBLIC_DATA_MODE=mock` locally or use local demo mode.
2. Open `/admin/dev-test?dev=1`.
3. Create sample website inquiry.
4. Import website inquiries into CRM.
5. Open `/trade-os-prototype`.
6. Review Lead Pool, Inquiry Pool and Dashboard Follow-up Workbench.
7. Convert a lead/customer using mock localStorage actions.

## Safety Boundary

CBM Trade OS must not:

- automatically send customer messages
- automatically send official quotations
- automatically send PI
- confirm price
- confirm delivery time
- confirm payment terms
- confirm bank account
- promise compensation
- judge responsibility automatically

All high-risk business actions require manual review.
