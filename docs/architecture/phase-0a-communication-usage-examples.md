# Phase 0A: Communication Usage Examples

## 1. Purpose

This document explains the safe standard flow for using the current Communication + Attachment foundation in CBM Trade OS.

It is documentation only. It does not define database tables, API routes, UI pages, file upload, Gmail, WhatsApp, OCR, AI SDK calls, or auto-send behavior.

## 2. Why Communication Usage Examples Are Needed

Communication and attachments are core business memory. Clear examples help future services and AI agents use the current local helpers consistently while preserving human review and safety boundaries.

## 3. Standard Safe Flow

1. Call `normalizeCommunicationInput(input)`.
2. Call `classifyCommunicationInput(normalized input or raw communication input)`.
3. Inspect `sensitivity_flags`, warnings, and `needs_human_review`.
4. Create draft text or follow-up suggestions only.
5. Require human review when the message is sensitive or uncertain.

## 4. Important Rule

Communication classification is a local helper only.

It is not AI judgment, not a final business decision, and not permission to send messages.

## 5. Example 1: Inbound Customer WhatsApp Message With Photo Attachment

Input example:

```js
{
  direction: "inbound",
  channel: "whatsapp",
  attachment_name: "site_photo.png",
  body: "Here are project site photos."
}
```

Expected safe interpretation:

- direction: `inbound`
- channel: `whatsapp`
- attachment type suggestion: `photo`
- no automatic reply
- no customer-facing action without review

## 6. Example 2: Supplier Email With Supplier Quote Attachment

Input example:

```js
{
  direction: "inbound",
  channel: "email",
  attachment_name: "factory_quote_aluminum.xlsx",
  body: "Please find our offer attached."
}
```

Expected safe interpretation:

- attachment type suggestion: `supplier_quote`
- quotation-related sensitivity may require review
- AI may summarize the supplier quote later
- AI must not create or send a customer quotation automatically

## 7. Example 3: Customer Message Mentioning Price And Delivery

Input example:

```js
{
  direction: "inbound",
  channel: "email",
  subject: "Price and delivery time",
  body: "Please confirm final price and delivery lead time."
}
```

Expected safe interpretation:

- `price_related`: true
- `delivery_related`: true
- `needs_human_review`: true
- no price or delivery confirmation is allowed automatically

## 8. Example 4: Payment Slip Attachment

Input example:

```js
{
  direction: "inbound",
  channel: "whatsapp",
  attachment_name: "payment_slip_receipt.pdf",
  body: "Payment slip attached."
}
```

Expected safe interpretation:

- attachment type suggestion: `payment_slip`
- `payment_related`: true
- visibility may need finance-sensitive handling in a future phase
- no payment confirmation is allowed automatically

## 9. Example 5: Unknown Attachment Type Requiring Human Review

Input example:

```js
{
  direction: "inbound",
  channel: "email",
  attachment_name: "customer_file.bin",
  body: "Please check this file."
}
```

Expected safe interpretation:

- attachment type suggestion: `other`
- low confidence
- `needs_human_review`: true
- user should inspect the file manually before linking it to business objects

## 10. AI Agent Usage Rules

AI may:

- summarize communication
- classify attachment suggestions
- detect sensitive topics
- draft replies
- create follow-up task suggestions

AI must:

- surface warnings and sensitivity flags to human users
- keep draft outputs clearly marked as draft-only
- require review for sensitive or uncertain communication

AI must not:

- auto-send messages
- make price commitments
- make delivery commitments
- make payment commitments
- make compensation commitments
- make quality responsibility commitments

## 11. Human Review Rules

Human review is required when communication involves:

- price
- delivery
- payment
- compensation
- quality responsibility
- order confirmation
- quotation
- PI
- complaint
- uncertain attachment classification

## 12. Attachment-To-Document Relationship

Important attachments may later be promoted into Document Center.

This is not implemented in Phase 0A. The current helpers only normalize and classify communication input locally.

## 13. What Is Still Not Implemented

- database tables
- real message storage
- file upload
- file storage
- OCR
- Gmail integration
- WhatsApp integration
- API endpoints
- UI display
- auto-send
- AI SDK integration

## 14. Recommended Next Steps

1. Communication module readiness review.
2. Communication relationship planning.
3. Later schema field planning.
4. Later API planning.
5. Later read-only UI preview.
