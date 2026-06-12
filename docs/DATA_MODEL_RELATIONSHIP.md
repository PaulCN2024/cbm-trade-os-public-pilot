# CBM Trade OS Data Model Relationship

Phase: 2F System Hardening & Data Model Lock

Current storage: browser `localStorage` mock data only.

## Core Flow

```text
Lead
  -> Customer
  -> Inquiry
  -> Project
  -> Quotation
  -> Order
  -> Shipment
  -> AfterSalesCase
  -> RepeatBusinessTask
```

The system must keep all high-risk actions under manual review:

- No automatic customer messages.
- No automatic official quotations.
- No automatic PI.
- No automatic price, delivery time, payment terms, bank account, compensation, or responsibility judgment.

## Object Relationships

### Lead

Primary key: `lead.id`

Important relationships:

- `lead.customer_id -> customer.id`
- `lead.id -> inquiry.lead_id`
- `lead.id -> communication_log.lead_id`
- `lead.id -> attachment.lead_id`

Purpose:

- Stores early customer acquisition records from website, Alibaba, Gmail, WhatsApp, manual import, social, SEO, ads, trade shows, or referrals.
- Can convert to `Customer`.
- Can convert to `Inquiry`.

### Customer

Primary key: `customer.id`

Important relationships:

- `customer.id -> lead.customer_id`
- `customer.id -> inquiry.customer_id`
- `customer.id -> project.customer_id`
- `customer.id -> quotation.customer_id`
- `customer.id -> order.customer_id`
- `customer.id -> shipment.customer_id`
- `customer.id -> after_sales_case.customer_id`
- `customer.id -> follow_up_task.customer_id`
- `customer.id -> communication_log.customer_id`
- `customer.id -> attachment.customer_id`

Purpose:

- Customer 360 root object.
- Aggregates history across acquisition, inquiry, project, quotation, order, shipment, after-sales, communications, tasks, and attachments.

### Inquiry

Primary key: `inquiry.id`

Important relationships:

- `inquiry.lead_id -> lead.id`
- `inquiry.customer_id -> customer.id`
- `inquiry.project_id -> project.id`
- `inquiry.quotation_id -> quotation.id`
- `inquiry.id -> project.inquiry_id`
- `inquiry.id -> quotation.inquiry_id`
- `inquiry.id -> order.inquiry_id`
- `inquiry.id -> follow_up_task.inquiry_id`
- `inquiry.id -> communication_log.inquiry_id`
- `inquiry.id -> attachment.inquiry_id`

Purpose:

- Captures buyer requirements, business line, source, missing information, mock AI summary, lead score, and recommended next action.
- Is the main qualification object before project and quotation.

### Project

Primary key: `project.id`

Important relationships:

- `project.inquiry_id -> inquiry.id`
- `project.customer_id -> customer.id`
- `project.id -> inquiry.project_id`
- `project.id -> quotation.project_id`
- `project.id -> order.project_id`
- `project.id -> shipment.project_id`
- `project.id -> after_sales_case.project_id`
- `project.id -> follow_up_task.project_id`
- `project.id -> communication_log.project_id`
- `project.id -> attachment.project_id`

Purpose:

- Tracks requirement review, quotation, negotiation, order pending, ordered, and lost stages.
- Connects inquiry data to quotation, order, shipment, and after-sales records.

### Quotation

Primary key: `quotation.id`

Important relationships:

- `quotation.inquiry_id -> inquiry.id`
- `quotation.project_id -> project.id`
- `quotation.customer_id -> customer.id`
- `quotation.id -> inquiry.quotation_id`
- `quotation.id -> order.quotation_id`
- `quotation.id -> follow_up_task.quotation_id`
- `quotation.id -> communication_log.quotation_id`
- `quotation.id -> attachment.quotation_id`

Purpose:

- Internal quotation draft only.
- Must remain manual review required before official send.
- Must not confirm final price, lead time, payment terms, bank account, or PI automatically.

### Order

Primary key: `order.id`

Important relationships:

- `order.quotation_id -> quotation.id`
- `order.inquiry_id -> inquiry.id`
- `order.project_id -> project.id`
- `order.customer_id -> customer.id`
- `order.id -> shipment.order_id`
- `order.id -> after_sales_case.order_id`
- `order.id -> follow_up_task.order_id`
- `order.id -> communication_log.order_id`
- `order.id -> attachment.order_id`

Purpose:

- Mock order draft created after quotation is manually marked accepted in the demo.
- Tracks PI review, payment status, production status, document placeholders, and risk flags.

### Shipment

Primary key: `shipment.id`

Important relationships:

- `shipment.order_id -> order.id`
- `shipment.project_id -> project.id`
- `shipment.customer_id -> customer.id`
- `shipment.id -> after_sales_case.shipment_id`
- `shipment.id -> follow_up_task.shipment_id`
- `shipment.id -> communication_log.shipment_id`
- `shipment.id -> attachment.shipment_id`

Purpose:

- Tracks booking, route, container, ETA, document status, BL / CI / PL placeholders, and manual review state.

### AfterSalesCase

Primary key: `after_sales_case.id`

Important relationships:

- `after_sales_case.shipment_id -> shipment.id`
- `after_sales_case.order_id -> order.id`
- `after_sales_case.project_id -> project.id`
- `after_sales_case.customer_id -> customer.id`
- `after_sales_case.id -> follow_up_task.after_sales_case_id`
- `after_sales_case.id -> communication_log.after_sales_case_id` future field
- `after_sales_case.id -> attachment.after_sales_case_id`

Purpose:

- Tracks delivery feedback, quality issues, complaints, replacement placeholders, compensation placeholders, and repeat opportunity.
- Must not automatically judge responsibility or promise compensation.

### FollowUpTask

Primary key: `follow_up_task.id`

Important relationships:

- `follow_up_task.customer_id -> customer.id`
- `follow_up_task.inquiry_id -> inquiry.id`
- `follow_up_task.project_id -> project.id`
- `follow_up_task.quotation_id -> quotation.id`
- `follow_up_task.order_id -> order.id`
- `follow_up_task.shipment_id -> shipment.id`
- `follow_up_task.after_sales_case_id -> after_sales_case.id`

Purpose:

- Represents actionable work items.
- Task types include initial reply, request missing info, quote follow-up, after-sales follow-up, and repeat business.

### RepeatBusinessTask

Primary key: `follow_up_task.id`

Definition:

- A `FollowUpTask` where `type = REPEAT_BUSINESS`.

Required relationships:

- `follow_up_task.after_sales_case_id -> after_sales_case.id`
- Usually also links `customer_id`, `project_id`, `order_id`, and `shipment_id`.

Purpose:

- Keeps post-shipment business development connected to customer history.

### CommunicationLog

Primary key: `communication_log.id`

Important relationships:

- `communication_log.customer_id -> customer.id`
- `communication_log.lead_id -> lead.id`
- `communication_log.inquiry_id -> inquiry.id`
- `communication_log.project_id -> project.id`
- `communication_log.quotation_id -> quotation.id`
- `communication_log.order_id -> order.id`
- `communication_log.shipment_id -> shipment.id`

Purpose:

- Future read-only learning layer for Gmail, WhatsApp, Alibaba, website, phone notes, and internal notes.
- Must not send messages automatically.

### Attachment

Primary key: `attachment.id`

Important relationships:

- `attachment.customer_id -> customer.id`
- `attachment.lead_id -> lead.id`
- `attachment.inquiry_id -> inquiry.id`
- `attachment.project_id -> project.id`
- `attachment.quotation_id -> quotation.id`
- `attachment.order_id -> order.id`
- `attachment.shipment_id -> shipment.id`
- `attachment.after_sales_case_id -> after_sales_case.id`

Purpose:

- Stores metadata for drawings, images, quotations, PI, CI, PL, BL, certificates, inspection reports, packing photos, shipment documents, and after-sales evidence.
- Current mock stores names only; future implementation should store files in object storage.

## Current Mock Table Names

```text
leads
customers
inquiries
architectural_requirements
precision_requirements
projects
quotations
orders
shipments
document_drafts
after_sales_cases
follow_up_tasks
communication_logs
attachments
documents
products
sellers
```

`documents`, `products`, and `sellers` currently support Document Center and Product Library but are outside the required Phase 2F core chain.
