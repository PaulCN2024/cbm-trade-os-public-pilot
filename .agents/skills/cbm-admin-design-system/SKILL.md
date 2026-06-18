---
name: cbm-admin-design-system
description: Use this skill when designing the CBM Trade OS Admin UI design system, layout rules, design tokens, component hierarchy, Chinese labels, cards, tables, badges, review panels, dashboards, and SaaS admin patterns before implementation.
---

# CBM Admin Design System Skill

## When to use this skill

Use this skill when the task asks to:
- design Admin UI structure
- create a design system plan
- define layout rules
- define component rules
- improve dashboard feel
- reduce UI clutter
- plan SaaS-style admin redesign
- create UI tokens or component guidelines
- plan dashboard / queue / detail layouts
- plan Chinese B2B SaaS interface structure

## Core goal

Create a coherent Chinese B2B SaaS admin design system for CBM Trade OS before code implementation.

The design system should make the admin UI feel like a real product, not a static test page.

## Design principles

The Admin UI should feel:
- clear
- business-like
- calm
- efficient
- information-dense but not cluttered
- Chinese-operator friendly
- AI-assisted but human-reviewed
- read-only safe unless explicit workflow approval exists

## Default layout model

Prefer:
- left sidebar navigation
- top status/header area
- primary dashboard/work queue area
- main content area
- optional right review/detail drawer
- summary cards above tables
- table + detail/review panel pattern
- collapsible sections for dense text
- clear empty/loading/error states

## Information hierarchy

Each main page should have:

1. Page title
2. Short purpose description
3. Current state or read-only boundary
4. Key metrics or summary cards
5. Main work queue / table / list
6. Detail or review panel
7. Warnings or blocked actions only where needed

## Workflow-first model

The UI should gradually move from module-centric to workflow-centric.

Instead of only showing:
- Customers
- Inquiries
- Products
- Companies

The dashboard should eventually show:
- 待处理询盘
- 需要人工复核
- 缺失信息
- 高风险草稿
- 待跟进客户
- 供应商待报价
- 文件/附件待归档
- 即将超时任务

## Component categories

Define or reuse:
- page header
- section header
- metric card
- work queue card
- data card
- review panel
- safety boundary card
- table
- badge
- disabled capability chip
- warning row
- empty state
- loading state
- error state
- fallback preview label
- detail drawer
- collapsible safety detail

## Chinese UI language rules

- Operator-facing UI should use Chinese.
- Internal keys remain English.
- API route values remain English.
- Brand/channel names like Email, WhatsApp, API may remain English if appropriate.
- Avoid Chinese wording that implies price, delivery, payment, production, supplier commitment, quotation, PI, order, shipment, or approval has been confirmed.

## Visual hierarchy rules

Use:
- fewer large text blocks
- more concise cards
- grouped badges
- clear title/subtitle separation
- short safety copy
- collapsible detail text when needed
- tables for records
- right drawer for review details
- stronger page-level summary

Avoid:
- repeated long safety paragraphs
- too many badges with equal weight
- always-visible technical/debug information
- mock buttons in prominent positions
- overloaded right panels

## Design token planning

When asked for design system planning, define:
- spacing scale
- card radius
- table density
- badge types
- risk colors
- neutral colors
- typography hierarchy
- layout grid
- breakpoints
- right panel width
- sidebar width
- content max width
- compact/comfortable table modes

Do not implement tokens unless explicitly allowed.

## Dashboard design direction

Future dashboard should emphasize:
- 今日待办
- 需要复核
- 缺失信息
- 风险提醒
- 新询盘
- 客户跟进
- 供应商等待
- AI 草稿待审

## Output format for design plans

Use:

1. Design goal
2. Current UI diagnosis
3. Proposed information architecture
4. Layout model
5. Component system
6. Visual hierarchy rules
7. Chinese wording rules
8. Read-only safety rules
9. Design tokens, if relevant
10. Implementation roadmap
11. First smallest safe implementation task

## Hard restrictions

For planning tasks:
- Do NOT modify files unless explicitly allowed.
- Do NOT implement broad redesign.
- Do NOT add write actions.
- Do NOT connect API/schema/AI/channel integrations.
- Do NOT add quotation/PI/order/payment/shipment/production actions.
