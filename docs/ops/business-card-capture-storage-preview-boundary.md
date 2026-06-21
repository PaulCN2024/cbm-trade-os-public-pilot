# Business Card Capture Storage Preview Boundary

## Purpose

This document defines the future preview boundary for business card images stored in private storage.

It is planning only. It does not implement preview URLs, storage access, upload, OCR, image parsing, API routes, schema changes, SQL, customer creation, message sending, or business execution.

## Preview Goals

The future preview should allow Paul to review uploaded card images inside the authenticated Admin UI.

Preview should help Paul decide:

- whether the file is a real business card or contact image
- whether the image is clear enough for OCR
- whether extracted fields match the source image
- whether the contact appears duplicate, private, irrelevant, or useful
- whether the card should stay active, be archived, or be deleted

## Preview Rules

- authenticated only
- not public
- no permanent public URL
- hide full URL/path from UI when possible
- preview should be watermarked or marked internal later if needed
- show extraction confidence near preview
- show source and review status near preview
- do not expose preview in customer-facing documents
- do not place signed URLs into persistent records
- expire signed URLs quickly if signed preview is used later

## Error States

Future UI should handle:

- preview unavailable
- file deleted
- expired signed URL
- permission denied
- unsupported file type
- file too large
- image still processing
- storage object missing
- source record archived

These states should not imply upload success, OCR success, customer creation, or message sending.

## UI Safety Labels

Use:

- 内部预览
- 私有文件
- 未公开
- 待人工确认
- 不自动创建客户

Avoid:

- 公开链接
- 已发布
- 已发送客户
- 自动导入完成

Recommended support copy:

```text
该图片仅供内部复核。预览不代表客户已创建，也不代表 AI 识别结果已确认。
```

## Future Implementation

Plan stages:

1. preview placeholder first
2. short-lived signed URL later
3. thumbnail later
4. access audit later
5. role-based preview permissions before team use

Preview implementation should remain separate from:

- OCR execution
- customer creation
- follow-up message generation
- follow-up sending
- quotation, PI, order, payment, production, or shipment actions
