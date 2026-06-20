# AI-first UI Redesign Visual Storyboard

## Purpose

This storyboard previews the intended AI-first Admin UI direction before implementation.

It is a markdown wireframe document only. It does not create binary PPTX, install packages, modify UI code, change API routes, change schema, deploy production, or enable business execution.

## Slide 1 - Current UI Problem

### Goal

Show why the current Admin UI still feels too static and traditional even though it is safe and useful.

### Rough ASCII Wireframe

```text
+----------------------------------------------------------+
| Header: CBM 工作台 / read-only trial                     |
+----------------+-----------------------------+-----------+
| Module Nav     | Many cards + long text      | Review    |
| 工作台         | Similar cards               | Panel     |
| 询盘           | Repeated safety notes       | Text      |
| 客户           | Static fallback blocks      | More text |
| 报价前复核     | Weak AI feeling             |           |
+----------------+-----------------------------+-----------+
```

### Key UI Elements

- module list
- repeated cards
- text-heavy status notes
- right review panel
- fallback/read-only labels

### Safety Notes

- current UI is safe
- no enabled business actions
- problem is product feel and information hierarchy, not unsafe behavior

## Slide 2 - Target AI-first Command Center

### Goal

Show the new product metaphor: AI-powered foreign trade command center with human review.

### Rough ASCII Wireframe

```text
+------------------------------------------------------------------+
| Priority strip: 今日风险 / 缺失信息 / 供应商待确认 / AI 待复核  |
+-------------+--------------------------------------+-------------+
| Workflow    | AI Business Canvas                   | AI Copilot  |
| Nav         |                                      |             |
|             | [待人工复核] [信息待补充]            | AI 摘要     |
| 工作台      | [供应商待确认] [文件待核对]          | 风险提示    |
| 询盘        |                                      | 建议下一步  |
| 客户        | Active object + timeline              | 禁用动作    |
| AI 复核     |                                      | 为什么      |
+-------------+--------------------------------------+-------------+
```

### Key UI Elements

- top priority overview
- left workflow nav
- center business canvas
- right AI Copilot
- risk/missing-info queues

### Safety Notes

- Copilot recommends but does not execute
- no send/apply/approve buttons
- all future actions remain disabled

## Slide 3 - Three-zone Layout

### Goal

Define the core layout pattern for future implementation rounds.

### Rough ASCII Wireframe

```text
+----------------------------------------------------------+
| Top status: Internal read-only trial / risk / queues     |
+--------------+------------------------------+------------+
| Workflow Nav | Business Workflow Canvas     | AI Copilot |
|              | Queue / Cards / Timeline     | Panel      |
|              | Read-only details            |            |
+--------------+------------------------------+------------+
```

### Key UI Elements

- workflow navigation
- business workflow canvas
- persistent AI Copilot panel
- top status summary
- secondary technical details

### Safety Notes

- route IDs and data-section values should remain stable during first implementation
- admin-read endpoints must not change
- right panel is read-only

## Slide 4 - Work Queue + Risk Cards

### Goal

Replace text-wall feeling with operator queues.

### Rough ASCII Wireframe

```text
+------------------------------------------------------+
| 今日待处理                                           |
+-------------------+-------------------+--------------+
| 待人工复核        | 信息待补充        | 高风险提示   |
| 8                 | 4                 | 2            |
+-------------------+-------------------+--------------+
| Queue                                                 |
| [询盘] Panama 门窗项目    风险: 信息待补充            |
| 下一步: 补图纸、规格、数量                            |
| 禁用: 不发送 / 不报价 / 不生成 PI                     |
|------------------------------------------------------|
| [AI 草稿] 价格相关回复    风险: 高                    |
| 下一步: 人工确认价格、交期、付款条款                  |
| 禁用: 不发送 / 不审批                                 |
+------------------------------------------------------+
```

### Key UI Elements

- queue cards
- risk badges
- next human step
- disabled capability chips
- source state chip

### Safety Notes

- queue cards are informational
- queue selection may update a read-only detail panel only
- no row click should execute business logic

## Slide 5 - Inquiry-to-Quotation Workflow Timeline

### Goal

Make the core business process visible: inquiry to quotation readiness.

### Rough ASCII Wireframe

```text
询盘 -> 客户 -> 文件 -> 供应商 -> AI复核 -> 报价前复核 -> 报价元数据
 |      |      |       |          |          |              |
 新     已关联  CAD待看 能力待确认  需人工复核 缺失信息       只读记录
```

Expanded card:

```text
+-------------------------------------------------------+
| 当前对象: 秘鲁 drywall profiles 20GP                  |
| 状态: 报价前复核不足                                  |
| 缺失: 规格 / 包装 / 装柜重量 / 目标数量                |
| AI 建议: 先补齐资料，再进入供应商确认                  |
+-------------------------------------------------------+
```

### Key UI Elements

- timeline/stepper
- step status
- missing information chips
- supplier confirmation state
- read-only quotation metadata state

### Safety Notes

- timeline shows readiness only
- it must not imply quote generation is possible
- future execution stage stays locked

## Slide 6 - AI Copilot Panel Details

### Goal

Show how AI assistance becomes visible, explainable, and human-reviewed.

### Rough ASCII Wireframe

```text
+-----------------------------+
| AI Copilot                  |
|-----------------------------|
| AI 摘要                     |
| 客户需要补充图纸和规格...   |
|-----------------------------|
| 风险提示                    |
| [信息待补充] [交期待确认]   |
|-----------------------------|
| 缺失信息                    |
| - 图纸                      |
| - 目标数量                  |
| - 表面处理                  |
|-----------------------------|
| 建议下一步                  |
| 先联系客户补资料。          |
|-----------------------------|
| 为什么这样建议              |
| 当前字段不足以判断报价。    |
|-----------------------------|
| 暂不执行动作                |
| [不可发送] [不可报价]       |
| [不可生成 PI] [不可下单]    |
+-----------------------------+
```

### Key UI Elements

- AI 摘要
- 风险提示
- 缺失信息
- 建议下一步
- 为什么这样建议
- 暂不执行动作
- 数据来源
- 置信度 / 可靠性提示

### Safety Notes

- no send/apply/approve controls
- no real AI calls in first implementation
- panel maps existing/fallback data into an explainability layout

## Slide 7 - Implementation Phases

### Goal

Show a safe incremental path instead of a broad rewrite.

### Rough ASCII Wireframe

```text
Round A: AI Copilot shell
  -> add right read-only AI panel layout

Round B: Work queues
  -> dashboard queue cards and priority clusters

Round C: Workflow timeline
  -> inquiry-to-quotation stepper

Round D: Section card redesign
  -> core sections become intelligence cards

Round E: Safe local interactions
  -> expand/collapse, tabs, local detail switching only

Round F: feedback-driven polish
  -> based on Paul's manual trial feedback
```

### Key UI Elements

- staged roadmap
- small implementation rounds
- clear acceptance checks
- no backend/API/schema work

### Safety Notes

- every round keeps active business controls disabled
- tests/build/browser smoke required before deploy
- production deploy only after safe local verification
