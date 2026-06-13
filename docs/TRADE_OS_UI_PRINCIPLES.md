# CBM Trade OS UI Principles

CBM Trade OS should feel like an AI-driven foreign trade operating system, not a traditional CRM page collection.

## Core Principles

1. Command Center is the primary work entry.
2. Dashboard should show tasks and status, not long explanations.
3. Use short labels, status chips, progress bars and clear actions.
4. Use drawers and context panels for details instead of overwhelming pages.
5. Use progressive disclosure: show summary first, details on demand.
6. High-risk actions always show `需要人工审核`.
7. Use motion lightly: hover, slide-in panels, fade transitions and copy/save feedback.
8. Backend should be task-driven, not module-dense.
9. Chinese should be the default user-facing language.
10. Do not expose internal technical JSON by default.

## Daily Operator Experience

The first screen should answer:

- 今天要先处理什么？
- 哪些询盘需要人工审核？
- 哪些客户需要跟进？
- 哪些单据仍然是草稿？
- 哪些动作被系统阻止，必须人工确认？

## Safety Language

High-risk commercial actions must remain blocked until manual review:

- 不自动发送客户消息
- 不自动发送正式报价
- 不自动发送 PI
- 不确认价格
- 不确认交期
- 不确认付款条款
- 不确认银行信息
- 不承诺赔偿
- 不自动判断责任

## Visual Direction

Use:

- Clear command input areas
- Compact task cards
- Status chips
- Progress strips
- Right-side context panels
- Lightweight hover states
- Collapsed debug data

Avoid:

- Long paragraphs
- Dense equal-weight cards
- Raw JSON as the default view
- Crowded tables without hierarchy
- Scattered module-first navigation as the main mental model
