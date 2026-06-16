# Phase 0A: Chinese UI Label Mapping Plan

## 1. Purpose

Define the future Chinese operator-facing UI label mapping strategy for CBM Trade OS.

This document is planning only. It does not implement UI wiring, API changes, database fields, i18n framework, translation service, AI model calls, or customer-facing language automation.

## 2. Core Principle

- English identifiers remain stable for code, API, database, tests, and internal constants.
- Chinese labels are used for operator-facing UI.
- Customer-facing text uses the customer's language.

## 3. Why Chinese UI Labels Matter

Chinese operator-facing labels should:

- reduce operator confusion
- improve internal adoption
- make AI suggestions easier to review
- avoid exposing raw enum keys to business users

## 4. Scope

Future label mapping should cover:

- Numbering
- Communication + Attachment
- AI Draft & Approval
- Customer / Supplier / Inquiry / Document future UI
- Status / risk / approval fields

## 5. AI Draft Label Examples

- `customer_reply_draft` => 客户回复草稿
- `supplier_rfq_draft` => 供应商询价草稿
- `quotation_draft` => 报价草稿
- `pi_draft` => PI 草稿
- `whatsapp_draft` => WhatsApp 草稿
- `email_draft` => 邮件草稿
- `knowledge_article_draft` => 知识库文章草稿
- `document_summary_draft` => 文件摘要草稿
- `follow_up_task_draft` => 跟进任务草稿
- `internal_note_draft` => 内部备注草稿

## 6. AI Task Label Examples

- `inquiry_analysis` => 询盘分析
- `customer_summary` => 客户摘要
- `supplier_matching` => 供应商匹配
- `supplier_rfq_generation` => 供应商询价生成
- `quotation_check` => 报价检查
- `quotation_generation` => 报价生成
- `document_summary` => 文件摘要
- `communication_summary` => 沟通摘要
- `knowledge_update_suggestion` => 知识库更新建议
- `follow_up_suggestion` => 跟进建议

## 7. Approval / Risk Label Examples

- `draft` => 草稿
- `needs_review` => 需要审核
- `approved_internal` => 内部已批准
- `rejected` => 已拒绝
- `sent_manual` => 已人工发送
- `archived` => 已归档
- `low` => 低
- `medium` => 中
- `high` => 高
- `blocked` => 已阻止
- `pending` => 待处理
- `accepted` => 已接受
- `edited` => 已编辑
- `escalated` => 已升级
- `auto_allowed` => 可自动执行
- `review_required` => 需要人工审核

## 8. Communication Label Examples

- `inbound` => 收到
- `outbound` => 发出
- `internal` => 内部
- `system` => 系统
- `ai_draft` => AI 草稿
- `email` => 邮件
- `whatsapp` => WhatsApp
- `wechat` => 微信
- `phone` => 电话
- `meeting` => 会议
- `website` => 官网
- `alibaba` => 阿里巴巴
- `made_in_china` => 中国制造网
- `manual_note` => 手动备注
- `system_note` => 系统备注
- `ai_command` => AI 指令

## 9. Attachment Label Examples

- `drawing` => 图纸
- `photo` => 照片
- `quotation` => 报价单
- `supplier_quote` => 供应商报价
- `pi` => PI
- `invoice` => 发票
- `payment_slip` => 付款水单
- `product_spec` => 产品规格
- `packing_info` => 包装信息
- `video` => 视频
- `certificate` => 证书
- `screenshot` => 截图
- `other` => 其他

## 10. Numbering Label Examples

- `customer_company` => 客户公司
- `customer_contact` => 客户联系人
- `supplier_company` => 供应商公司
- `supplier_contact` => 供应商联系人
- `inquiry` => 询盘
- `project` => 项目
- `supplier_rfq` => 供应商询价
- `supplier_quote` => 供应商报价
- `customer_quotation` => 客户报价
- `order` => 订单
- `purchase_order` => 采购订单
- `document` => 文件
- `attachment` => 附件
- `knowledge_article` => 知识库文章
- `approval_review` => 人工审核

## 11. Future Implementation Recommendation

- Create pure label dictionaries first.
- Keep label dictionaries separate from business logic.
- Do not hardcode Chinese labels directly inside API routes.
- UI should call label mapping utilities.
- AI output for operators should prefer Chinese labels.
- Customer-facing generated text should remain language-aware.

## 12. What Should NOT Be Implemented Yet

- no UI wiring
- no API changes
- no database fields
- no i18n framework
- no translation service
- no AI model call
- no customer-facing language automation

## 13. Recommended Next Steps

1. Add pure Chinese label dictionary constants.
2. Add tests for label dictionaries.
3. Later create label helper utility.
4. Later wire labels into admin UI.
5. Later support customer-facing multilingual output.
