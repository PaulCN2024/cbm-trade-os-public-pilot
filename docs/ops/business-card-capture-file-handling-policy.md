# Business Card Capture File Handling Policy

## Purpose

This policy defines how future Business Card Capture files should be accepted, stored, previewed, and protected.

It is planning only. It does not implement upload, storage, OCR, file parsing, API routes, schema changes, SQL, customer creation, message sending, or business execution.

## Allowed Files

First upload stage should allow only business-card/contact images:

- JPEG image: `.jpg`, `.jpeg`, `image/jpeg`
- PNG image: `.png`, `image/png`
- WebP image: `.webp`, `image/webp`

PDF should remain blocked until a later explicit approval because PDFs may contain multiple pages, hidden text, embedded files, or non-card content.

## Rejected Files

Reject:

- executable files
- scripts
- archives
- videos
- unknown binary formats
- Office documents
- files above the approved size limit
- files with mismatched extension/MIME type
- empty files
- corrupted images
- files that are not business card/contact evidence

Rejected files should not create customer records or follow-up drafts.

## Metadata To Store

Future upload metadata may include:

- `original_filename`
- `file_type`
- `file_size`
- `captured_channel`
- `uploaded_by`
- `created_at`
- `processing_status`

Recommended additional internal metadata:

- `source_type`
- `source_label`
- `storage_object_id` or internal file reference
- `checksum`
- `review_status`
- `retention_state`

Metadata should link to `card_capture_sources` and should not itself become an official customer record.

## Metadata Not To Expose

Do not expose:

- storage secret
- signed URL
- long-lived public URL
- internal bucket path if sensitive
- service-role credential
- provider key
- raw provider payload
- personal contact data outside review UI
- private notes not needed for business review

Admin UI should show safe business context, not infrastructure secrets.

## Preview Behavior

Preview rules:

- show safe preview only to authenticated users
- no public previews
- no external sharing
- no customer-facing direct image access
- use short-lived preview access only after backend access review
- show fallback/placeholder if preview is unavailable

Preview should not imply:

- OCR already succeeded
- customer was created
- contact was verified
- follow-up was sent

## Security Checks

Required first-stage checks:

- MIME type check
- extension check
- size check
- authenticated access
- safe processing status

Recommended later checks:

- checksum duplicate detection
- image dimension sanity check
- virus/malware scanning if storage workflow supports it
- provider payload redaction
- audit record for upload and review

Security checks should fail closed. If a file cannot be classified safely, it should not be uploaded.

## User Messaging

Future UI text should be clear and conservative:

- "仅上传业务名片图片"
- "不会自动创建客户"
- "AI 识别结果需要人工确认"
- "不会自动发送消息"

Additional recommended safety copy:

- "上传后仅生成内部复核草稿。"
- "低置信度字段需要人工确认。"
- "可能重复客户需要人工判断。"
- "客户创建和跟进发送是后续单独审批动作。"

## Handling Outcomes

Possible handling outcomes:

- accepted for review
- rejected before upload
- upload failed
- extraction pending
- needs manual review
- duplicate suspected
- rejected by reviewer
- archived
- deletion requested

No outcome should directly send a message, create a customer, issue a quote, create a PI/order, or trigger payment/production/shipment.
