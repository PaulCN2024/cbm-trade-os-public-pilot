# AI Command Center UI Storyboard

## Purpose

This storyboard describes a future AI-first command surface for CBM Trade OS. It is planning only and does not implement UI code, AI calls, API routes, schema, sending, approval execution, quotation generation, or other business actions.

## Slide 1 - Traditional Menu-heavy Workflow Problem

### Goal

Show why the current module-first workflow creates cognitive load.

### Wireframe

```text
+--------------------------------------------------------------+
| Sidebar: Customers / Inquiries / Files / Quotes / Suppliers   |
+-----------------------+--------------------------------------+
| Module list           | Operator must decide:                 |
| - Customers           | 1. Which customer?                    |
| - Inquiries           | 2. Which inquiry?                     |
| - Files               | 3. Which file?                        |
| - Quotations          | 4. Can quote?                         |
| - Knowledge           | 5. What is risky?                     |
+-----------------------+--------------------------------------+
```

### Key UI Elements

- module navigation
- long record lists
- repeated safety metadata
- no single place to ask for an outcome

### Safety Notes

No action should be implied. This slide explains the problem only.

## Slide 2 - AI-first Command Entrance

### Goal

Make AI the starting point for business work.

### Wireframe

```text
+--------------------------------------------------------------+
| AI Command Center                                             |
| Tell AI what you want to do...                                |
| [ 帮我处理这个秘鲁客户的轻钢龙骨询盘                  ]        |
| [静态预览] [只读] [需要人工审批后才能执行动作]                 |
+--------------------------------------------------------------+
| Suggested commands                                            |
| - 帮我看看这个客户能不能报价                                  |
| - 帮我今天排一下最值得处理的客户                              |
+--------------------------------------------------------------+
```

### Key UI Elements

- large AI instruction box
- suggested commands
- read-only safety badges
- no send or approve button

### Safety Notes

The first implementation should be static and read-only. The instruction box may be visual only until a separate AI execution plan exists.

## Slide 3 - Task Intent Detection

### Goal

Show how the system explains what it thinks Paul wants.

### Wireframe

```text
+--------------------------------------------------------------+
| Detected intent                                               |
| 询盘处理 / inquiry_processing                                  |
| Confidence: medium                                            |
+--------------------------------------------------------------+
| Why: mentions Peru customer, light steel keel, inquiry         |
| Missing: drawing, specification, target quantity               |
+--------------------------------------------------------------+
```

### Key UI Elements

- intent label
- internal intent key
- confidence
- reason
- missing context

### Safety Notes

Intent detection is advisory. Low confidence should ask clarification instead of inventing facts.

## Slide 4 - Context Retrieval Panel

### Goal

Show the records used before giving advice.

### Wireframe

```text
+----------------------+---------------------------------------+
| Context found        | Source                                |
+----------------------+---------------------------------------+
| Customer profile     | Customer Center                       |
| Inquiry record       | Inquiry Center                        |
| Product knowledge    | Knowledge Center                      |
| Supplier capability  | Supplier / Manufacturing Capability   |
| File metadata        | File Center                           |
+----------------------+---------------------------------------+
```

### Key UI Elements

- context cards
- source names
- confidence labels
- missing context warnings

### Safety Notes

The panel should show sources and confidence. It must not expose private file paths, signed URLs, secrets, or raw confidential content without a separate safe design.

## Slide 5 - Recommended Workflow

### Goal

Turn the instruction into a reviewable workflow.

### Wireframe

```text
+--------------------------------------------------------------+
| Recommended workflow                                          |
| 1. Confirm missing info                                       |
| 2. Prepare supplier RFQ draft                                 |
| 3. Check quotation readiness                                  |
| 4. Wait for human approval                                    |
+--------------------------------------------------------------+
```

### Key UI Elements

- step list
- missing information summary
- next best action
- approval boundary

### Safety Notes

The workflow prepares work. It does not send RFQs, create quotations, or approve anything automatically.

## Slide 6 - Draft Generation Preview

### Goal

Preview safe drafts without enabling execution.

### Wireframe

```text
+--------------------------+-----------------------------------+
| Draft customer question  | Supplier RFQ draft                 |
+--------------------------+-----------------------------------+
| 请补充图纸、规格和数量... | 请确认规格、MOQ、交期、价格...    |
| [仅草稿] [不可发送]      | [仅草稿] [不可发送]               |
+--------------------------+-----------------------------------+
```

### Key UI Elements

- draft customer question
- supplier RFQ draft
- disabled capability chips
- source/risk notes

### Safety Notes

Drafts are review-only. No active send, approve, RFQ, quotation, PI, order, payment, production, or shipment controls should be present.

## Slide 7 - Approval Boundary

### Goal

Make the human approval point visible before execution exists.

### Wireframe

```text
+--------------------------------------------------------------+
| Approval boundary                                             |
| AI prepares. Paul approves. System executes later.             |
+--------------------------------------------------------------+
| Approval-required actions                                     |
| - Send customer reply                                         |
| - Send supplier RFQ                                           |
| - Create formal quotation                                     |
| - Confirm price or delivery time                              |
+--------------------------------------------------------------+
```

### Key UI Elements

- approval-required action list
- risk explanation
- exact output preview later
- audit note placeholder

### Safety Notes

The approval boundary must not be decorative. Future execution requires explicit approval and audit logging.

## Slide 8 - Daily Priority Briefing

### Goal

Show how the Command Center can become the daily work entrance.

### Wireframe

```text
+--------------------------------------------------------------+
| Today in CBM Trade OS                                         |
+----------------------+----------------------+----------------+
| Top customers        | Risks                | Follow-ups     |
| - Peru inquiry       | - Price wording      | - 7-day no reply|
| - Caribbean lead     | - Missing drawing    | - Supplier quote|
+----------------------+----------------------+----------------+
| Content tasks        | Missing knowledge    | Next best action|
| - LinkedIn topics    | - product FAQ gap    | Review inquiry  |
+----------------------+----------------------+----------------+
```

### Key UI Elements

- top customers
- risk reminders
- follow-up queue
- content tasks
- missing knowledge
- next best action

### Safety Notes

Daily briefing can prioritize and recommend. It must not auto-send, auto-create records, publish posts, or execute external actions without approval.
