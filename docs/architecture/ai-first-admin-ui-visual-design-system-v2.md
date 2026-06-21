# AI-first Admin UI Visual Design System V2

## Purpose

Paul wants future CBM Trade OS UI to feel like a premium AI foreign trade operations console, not a generic CRM dashboard or plain CRUD admin backend.

This document defines the visual direction for future Admin UI work. It is planning only and does not implement UI code.

## Visual Direction

The future Admin UI should move toward:

- premium dark AI operations console
- dark navy / blue-black background
- fixed left sidebar navigation
- large main workspace
- optional right AI Copilot panel
- glass-like dark cards
- soft borders and shadows
- green / blue AI accent colors
- compact metric cards
- workflow-first panels
- source/confidence/risk chips
- approval-required badges
- clear disabled/read-only states
- strong hierarchy and spacing
- no cluttered cheap dashboard look

## Originality Boundary

Use reference screenshots only as high-level visual inspiration.

Do not copy:

- brand
- logo
- watermark
- exact colors
- exact layout
- exact text
- product names
- icons in a way that creates confusion

CBM Trade OS should keep an original identity built around foreign trade workflows, aluminum/building-material export, AI command flow, knowledge grounding, and human approval.

## Layout Rules

- left nav grouped by workflow
- AI Command Center first
- core work area centered
- AI Copilot right side where useful
- cards organized by business intent
- dashboards must prioritize actions, not only statistics

Recommended workflow grouping:

- AI Command Center / AI Daily Workbench
- Customers and Inquiries
- Prospecting and Content
- Knowledge and Files
- Quotation and Supplier
- Orders / Production / Shipment later
- Risk / Approval / BI later
- Settings last

## Component Rules

Define reusable patterns for:

- metric cards
- workflow cards
- status chips
- risk badges
- source/confidence badges
- approval boundary cards
- daily priority cards
- table cards
- empty states
- disabled action cards
- AI preview panels

Cards should be compact and information-dense. Safety copy should be visible but not repeated as long paragraphs everywhere.

## AI-first UI Rules

Every UI module should show:

- what AI can help with
- what data/knowledge it uses
- what is missing
- what risk exists
- what needs Paul approval
- what actions are unavailable in preview

The UI should help Paul answer:

- What should I handle now?
- Why does AI think this matters?
- What source or evidence supports this?
- What is missing?
- What is blocked until approval?

## Forbidden UI Patterns

Avoid:

- plain white admin CRUD look
- too many active buttons
- fake AI execution buttons
- misleading "auto-send"
- misleading "auto-quote"
- excessive table-only layouts
- generic bootstrap dashboard feel
- cluttered colors without hierarchy

## Required Wording Patterns

Use:

- 只读预览
- 未发送
- 需人工确认
- 不自动执行
- 来源/置信度/风险
- 稍后开放
- 草稿
- AI 建议

Avoid:

- 已发送
- 自动报价
- 一键执行
- 自动发布
- 已确认价格
- 自动下单

## Codex Instruction

Future Codex UI tasks must follow this design system and maintain original CBM Trade OS identity.

When a future prompt asks to improve the Admin UI, Codex should:

- keep CBM Trade OS AI-first
- avoid copying the reference system
- preserve read-only/approval boundaries
- use premium operations-console hierarchy
- prioritize AI Daily Workbench and workflow-first task surfaces over generic CRUD tables
