# AI Prospecting Lookalike UI Storyboard

## 1. Purpose

This storyboard describes a future read-only AI Prospecting Center UI for CBM Trade OS.

It is a planning artifact only. It does not create UI code, API routes, schema, scraping, search integration, file parsing, outreach sending or business actions.

## 2. Storyboard Principles

- Chinese operator-first interface.
- AI-assisted, human-reviewed workflow.
- Read-only in early versions.
- No hidden business execution.
- Evidence and compliance always visible.
- Similarity scores must be explainable, not magical.
- Disabled actions must remain informational, not clickable.

## 3. Slide 1 - Missing Module Today

Goal: explain the current gap.

Current system:

```text
Inbound inquiry -> customer review -> AI review -> pre-quotation review -> quotation metadata
```

Missing future module:

```text
Target market / good customer sample -> AI prospecting -> candidate evidence -> human review
```

Operator pain:

- good customers are hard to replicate
- prospect search is manual and scattered
- source quality is unclear
- outreach risk is high without review

Safety note:

- no scraping
- no sending
- no prospect creation
- no business commitment

## 4. Slide 2 - AI Prospecting Center Overview

Goal: show the future top-level page.

```text
┌─────────────────────────────────────────────────────────────────────┐
│ AI 开发客户                                                         │
│ 静态规划 / 只读 / 人工复核                                          │
├───────────────────┬─────────────────────────────────┬───────────────┤
│ 开发目标           │ 相似客户线索队列                 │ AI 推荐理由    │
│                   │                                 │               │
│ 国家: Peru         │ 1. Lima Drywall Distributor      │ 为什么相似     │
│ 产品: Drywall      │    相似度 84 / 合规风险中        │ 匹配特征       │
│ 客户类型: Importer │ 2. Facade Contractor SAC         │ 来源证据       │
│ 关键词: perfiles   │    相似度 78 / 待补充来源        │ 缺失信息       │
│                   │ 3. Ceiling System Supplier       │ 推荐人工动作   │
└───────────────────┴─────────────────────────────────┴───────────────┘
```

Key UI:

- target setup card
- candidate queue
- right AI Copilot review panel
- source and compliance rows

Safety copy:

- 静态规划数据，不代表真实客户状态。
- 后续搜索和外联必须经过合规来源和人工确认。

## 5. Slide 3 - Target-Market Prospecting Mode

Goal: show operator-defined market search planning.

```text
┌──────────────────────────────┐
│ 开发目标                      │
├──────────────────────────────┤
│ 国家 / 地区: Peru             │
│ 产品: Drywall profile         │
│ 客户类型: Importer            │
│ 关键词: perfiles drywall      │
│ 排除: private social scraping │
└──────────────────────────────┘

┌──────────────────────────────┐
│ AI 搜索策略预览               │
├──────────────────────────────┤
│ 公开公司网站                  │
│ 行业目录                      │
│ 展会参展商                    │
│ 官方商会 / 建材协会            │
└──────────────────────────────┘
```

Display-only labels:

- 目标市场
- 客户类型
- 产品匹配
- 合规来源
- 禁止来源

Disabled capabilities:

- 不调用搜索 API
- 不抓取网页
- 不发送邮件
- 不创建客户

## 6. Slide 4 - Lookalike Customer Mode

Goal: show seed-based prospect discovery planning.

```text
┌───────────────────────────────┐
│ 样本客户                       │
├───────────────────────────────┤
│ 公司名称: PANAGLASS            │
│ 国家: Panama                   │
│ 样本类型: CRM customer         │
│ 产品兴趣: aluminum profiles    │
│ 证据: inquiry + quotation ref  │
└───────────────────────────────┘

┌───────────────────────────────┐
│ AI 提取画像                    │
├───────────────────────────────┤
│ 建材项目客户                   │
│ 幕墙 / 门窗 / 铝型材相关        │
│ 中美洲市场                     │
│ 需要人工确认采购角色            │
└───────────────────────────────┘
```

Sample inputs shown as planning categories:

- 公司名
- 网站 URL
- 询盘文本
- 产品图片
- 图纸 / PDF
- 报价表
- 邮件 / WhatsApp 文本

Safety note:

- These are future input categories only. No upload, OCR, parsing or live crawling is implemented.

## 7. Slide 5 - Seed Profile Analysis

Goal: make the AI extraction transparent.

```text
┌────────────────────────────────────────┐
│ 样本客户画像                            │
├────────────────────────────────────────┤
│ 客户类型: 建材项目 / 分销 / 进口可能性   │
│ 产品方向: 铝型材 / 幕墙配件              │
│ 市场: Panama / Latin America            │
│ 采购意图: 中等，需要更多证据             │
│ 缺失信息: 年采购量 / 采购负责人 / 项目类型 │
└────────────────────────────────────────┘
```

The view should distinguish:

- AI inferred fields
- source-backed evidence
- missing information
- compliance warnings

Never present AI inference as confirmed fact.

## 8. Slide 6 - Similar Leads Queue

Goal: show a readable future work queue.

```text
┌────────────────────────────────────────────────────┐
│ 相似客户发现                                        │
├────────────────────────────────────────────────────┤
│ Lima Drywall Distributor       相似度 84  待复核     │
│ 证据: company website + product catalog             │
│ 推荐: 人工查看产品页面和公司类型                     │
│ 禁用: 不可发送 / 不可创建客户 / 不可报价             │
├────────────────────────────────────────────────────┤
│ Facade Contractor SAC          相似度 78  来源不足   │
│ 证据: public project page                           │
│ 推荐: 补充公司网站和项目证据                         │
│ 禁用: 不可发送 / 不可创建任务 / 不可生成 PI          │
└────────────────────────────────────────────────────┘
```

Queue fields:

- company name
- country
- customer type
- product fit
- similarity score
- compliance risk
- source evidence count
- recommended human action
- disabled capabilities

## 9. Slide 7 - AI Copilot Explanation Panel

Goal: make the recommendation auditable.

```text
┌──────────────────────────────┐
│ AI 推荐理由                   │
├──────────────────────────────┤
│ 为什么相似                    │
│ - 同属建筑材料分销             │
│ - 产品页面包含 drywall profile │
│ - 市场语言和区域匹配           │
│                              │
│ 缺失信息                      │
│ - 未确认进口角色               │
│ - 未确认联系人                 │
│                              │
│ 合规风险                      │
│ - 来源需要人工确认             │
│ - 不允许自动外联               │
└──────────────────────────────┘
```

AI Copilot should be advisory only.

It must never show:

- send button
- approve button
- create quotation button
- create PI button
- create order button
- production or shipment action

## 10. Slide 8 - Human Review Before Outreach

Goal: show the safe final gate.

```text
┌──────────────────────────────────────┐
│ 人工复核                              │
├──────────────────────────────────────┤
│ 1. 确认来源是否公开合规                │
│ 2. 确认公司类型和产品匹配              │
│ 3. 确认是否可以进入潜在客户池           │
│ 4. 后续外联草稿必须人工审核             │
└──────────────────────────────────────┘

禁用能力:
不可自动发送 / 不可自动建档 / 不可批量外联 / 不可报价 / 不可生成 PI / 不可下单
```

Future enabled actions require separate approval architecture.

## 11. Recommended First Static UI Preview

The safest first implementation should be:

- new read-only AI 开发客户 module preview
- static target-market example
- static lookalike seed profile
- static candidate queue
- static AI Copilot explanation
- disabled future capabilities

It should not:

- import helpers
- call APIs
- call search services
- parse files
- add uploads
- send messages
- create prospects
- create business records

## 12. Review Checklist For Future UI

- Chinese labels are natural for business operators.
- Static/read-only state is visible but not overwhelming.
- Similarity score is explained by evidence.
- Compliance risk is visible.
- Disabled actions are informational, not controls.
- No raw private customer file content is exposed.
- No email/WhatsApp automation is implied.
- No price, delivery, quotation, PI, order, payment, production or shipment commitment is implied.
