# AI Knowledge Center UI Storyboard

This storyboard describes a future read-only AI Knowledge Center / 企业知识库 experience for CBM Trade OS.

It is planning only. It does not implement UI code, API routes, schema, RAG, embeddings, file upload, file parsing, OCR, or business execution.

## Slide 1 - Missing Knowledge Foundation Today

### Goal

Show why AI needs structured company knowledge, not only current record data.

### ASCII Wireframe

```text
+--------------------------------------------------------------+
| 当前 AI 工作方式                                               |
+--------------------------+-----------------------------------+
| 当前记录                 | AI 能做什么                        |
| - 询盘                   | - 摘要                             |
| - 客户                   | - 风险提示                         |
| - 文件元数据             | - 缺失信息提示                     |
+--------------------------+-----------------------------------+
| 缺少结构化知识                                               |
| 产品规则 / 供应商限制 / 报价规则 / SOP / 沟通风格 / 安全边界 |
+--------------------------------------------------------------+
```

### Key UI Elements

- Current record sources
- Missing knowledge warning
- Read-only baseline note
- Link to future Knowledge Center concept

### Safety Notes

- AI should not invent missing rules.
- Missing knowledge should be shown as a limitation, not silently filled.

## Slide 2 - Knowledge Center Overview

### Goal

Show the primary module layout: categories, knowledge cards, and AI usage panel.

### ASCII Wireframe

```text
+--------------------------------------------------------------+
| AI 知识库 / Knowledge Center                    静态规划预览 |
+--------------+-------------------------------+---------------+
| 知识分类     | 知识卡片                       | AI 使用说明   |
| - 产品知识   | [铝合金门窗报价规则] 已验证    | 来源: SOP     |
| - 供应商知识 | [供应商喷涂能力] 待验证        | 可信度: 高    |
| - 报价规则   | [FOB/CIF 适用说明] 已验证      | 禁止: 自动承诺|
| - 文件知识   | [安装手册摘要] 已过期          | 缺失: 有效期  |
+--------------+-------------------------------+---------------+
```

### Key UI Elements

- Left category navigation
- Center knowledge cards
- Right AI usage panel
- Verification and freshness badges

### Safety Notes

- Knowledge cards are informational only.
- No edit, verify, delete, upload, or AI execution controls in the first preview.

## Slide 3 - Product Knowledge Library

### Goal

Show how product categories and product-specific knowledge can support inquiry analysis.

### ASCII Wireframe

```text
+--------------------------------------------------------------+
| 产品知识                                                     |
+-------------------+------------------------------------------+
| 分类              | 知识卡片                                 |
| 门窗              | 断桥铝门窗常见配置 / 已验证              |
| 幕墙              | 玻璃幕墙基础询价信息 / 待验证            |
| 铝型材            | 型材重量与表面处理说明 / 已验证          |
| 五金              | 常见五金清单与适配注意事项 / 待更新      |
+-------------------+------------------------------------------+
| AI 提示: 当前询盘若缺少图纸、规格、数量，不进入报价判断。     |
+--------------------------------------------------------------+
```

### Key UI Elements

- Product category list
- Knowledge status badges
- Missing information guidance
- Source and confidence summary

### Safety Notes

- Product knowledge can guide review, but it must not create price or delivery commitments.

## Slide 4 - Supplier And Quotation Knowledge

### Goal

Show supplier capability knowledge next to quotation rules without implying confirmed supplier commitment.

### ASCII Wireframe

```text
+--------------------------------------------------------------+
| 供应商知识 + 报价规则                                        |
+-----------------------------+--------------------------------+
| 供应商能力                  | 报价规则                       |
| 喷涂工厂 A: 颜色稳定        | FOB: 需确认港口费用            |
| 型材厂 B: MOQ 较高          | CIF: 需确认海运费与保险        |
| 玻璃厂 C: 交期需复核        | 报价有效期: 人工确认           |
+-----------------------------+--------------------------------+
| 只读提示: 供应商能力不等于生产承诺，报价规则不等于报价生成。 |
+--------------------------------------------------------------+
```

### Key UI Elements

- Supplier capability cards
- Quotation rule cards
- Manual confirmation notes
- Risk badges

### Safety Notes

- No supplier commitment.
- No quotation generation.
- No price calculation.
- Lead time and supplier capacity require human confirmation.

## Slide 5 - File / Document Knowledge

### Goal

Show how file metadata and document-derived knowledge may be linked later without exposing raw private files.

### ASCII Wireframe

```text
+--------------------------------------------------------------+
| 文件知识                                                     |
+------------------------+-------------------------------------+
| 文件元数据             | 关联知识                            |
| Drawing-001.pdf        | 图纸中缺少表面处理 / 待验证         |
| SupplierSheet.xlsx     | 供应商规格表摘要 / 已验证           |
| InstallationManual.pdf | 安装注意事项 / 已过期               |
+------------------------+-------------------------------------+
| 安全边界: 不显示 storage_path、签名 URL、原始文件内容。       |
+--------------------------------------------------------------+
```

### Key UI Elements

- Document metadata list
- Linked knowledge summaries
- Verification status
- Privacy boundary notes

### Safety Notes

- No file upload.
- No download link.
- No parsing or OCR execution.
- No private storage path exposure.

## Slide 6 - Human Verification Queue

### Goal

Show unverified AI summaries requiring human review before they become trusted knowledge.

### ASCII Wireframe

```text
+--------------------------------------------------------------+
| 待人工验证                                                   |
+-----------------------+----------------+---------------------+
| 知识草稿              | 来源           | 状态                |
| AI 摘要: 型材包装规则 | 供应商邮件     | 待人工验证          |
| AI 摘要: 报价有效期   | 历史报价       | 待人工验证          |
| AI 摘要: 投诉处理     | 售后记录       | 需要复核            |
+-----------------------+----------------+---------------------+
| 注意: 未验证知识不得用于客户承诺或自动发送。                 |
+--------------------------------------------------------------+
```

### Key UI Elements

- Review queue
- Source reference
- Risk state
- Human verification requirement

### Safety Notes

- AI-generated knowledge is unverified by default.
- First implementation should not include approve/reject controls.

## Slide 7 - AI Copilot Using Knowledge

### Goal

Show how future AI Copilot can cite verified knowledge when assisting with an inquiry.

### ASCII Wireframe

```text
+--------------------------------------------------------------+
| 当前询盘: 秘鲁客户门窗项目                                   |
+-----------------------------+--------------------------------+
| 询盘摘要                    | AI Copilot 知识引用             |
| 缺少图纸、规格、数量        | 相关知识: 门窗报价前清单        |
| 需要确认目标交期            | 来源: SOP-Quote-001             |
|                             | 可信度: 高 / 已人工验证         |
|                             | 不可做: 不承诺价格或交期        |
+-----------------------------+--------------------------------+
| 建议: 先补充关键信息，再由人工决定是否进入供应商询价。       |
+--------------------------------------------------------------+
```

### Key UI Elements

- Current inquiry context
- Relevant knowledge citation
- Confidence / verification state
- What not to do
- Recommended human next step

### Safety Notes

- AI suggestions remain advisory.
- No send, RFQ, quote, PI, order, payment, production, or shipment actions.
