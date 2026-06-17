const test = require("node:test");
const assert = require("node:assert/strict");

const {
  prepareCommunicationReviewSummary,
} = require("../lib/services/communication/prepare-communication-review-summary");

test("exports prepareCommunicationReviewSummary", () => {
  assert.equal(typeof prepareCommunicationReviewSummary, "function");
});

test("returns normalized communication and classification", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "INBOUND",
    channel: "EMAIL",
    visibility: "NORMAL",
    status: "ACTIVE",
    body: "Internal note only",
  });

  assert.equal(result.normalized_communication.direction, "inbound");
  assert.equal(result.normalized_communication.channel, "email");
  assert.ok(result.classification);
});

test("safety fields always prevent sending auto replies and task creation", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "internal",
    channel: "manual_note",
    body: "Routine internal note",
  });

  assert.equal(result.communication_only, true);
  assert.equal(result.can_send, false);
  assert.equal(result.can_auto_reply, false);
  assert.equal(result.can_create_task, false);
});

test("does not mutate raw input context or options", () => {
  const input = {
    direction: "INBOUND",
    channel: "EMAIL",
    attachment_name: "unknown-file.bin",
    body: "Please check this file.",
  };
  const context = { related_customer_id: "customer_001" };
  const options = { review_note: "check manually" };
  const inputSnapshot = { ...input };
  const contextSnapshot = { ...context };
  const optionsSnapshot = { ...options };

  prepareCommunicationReviewSummary(input, context, options);

  assert.deepEqual(input, inputSnapshot);
  assert.deepEqual(context, contextSnapshot);
  assert.deepEqual(options, optionsSnapshot);
});

test("price delivery payment quotation pi and complaint content requires review", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "inbound",
    channel: "email",
    subject: "Price delivery payment quotation PI complaint",
    body: "Please confirm price, delivery, payment, quotation, PI, and complaint solution.",
  });

  assert.equal(result.sensitivity_flags.price_related, true);
  assert.equal(result.sensitivity_flags.delivery_related, true);
  assert.equal(result.sensitivity_flags.payment_related, true);
  assert.equal(result.sensitivity_flags.quotation_related, true);
  assert.equal(result.sensitivity_flags.complaint_related, true);
  assert.equal(result.review_required, true);
  assert.equal(result.needs_human_review, true);
  assert.equal(result.can_send, false);
});

test("unknown attachment requires review", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "inbound",
    channel: "email",
    attachment_name: "customer-file.bin",
    body: "Please check this file.",
  });

  assert.equal(result.attachment_summary.attachment_type, "other");
  assert.equal(result.attachment_summary.requires_review, true);
  assert.equal(result.review_required, true);
});

test("supplier quote attachment requires review", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "inbound",
    channel: "email",
    attachment_name: "factory_quote_aluminum.xlsx",
    body: "Supplier offer attached.",
  });

  assert.equal(result.attachment_summary.attachment_type, "supplier_quote");
  assert.equal(result.attachment_summary.requires_review, true);
  assert.equal(result.review_required, true);
});

test("payment slip attachment requires review", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "inbound",
    channel: "whatsapp",
    attachment_name: "payment_slip_receipt.pdf",
    body: "Payment slip attached.",
  });

  assert.equal(result.attachment_summary.attachment_type, "payment_slip");
  assert.equal(result.attachment_summary.requires_review, true);
  assert.equal(result.review_required, true);
});

test("warnings is always an array", () => {
  const result = prepareCommunicationReviewSummary();

  assert.ok(Array.isArray(result.warnings));
});

test("recommended operator action is present and advisory only", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "inbound",
    channel: "email",
    body: "Please confirm final price.",
  });

  assert.equal(typeof result.recommended_operator_action, "string");
  assert.match(result.recommended_operator_action, /Review/);
  assert.equal(result.can_send, false);
});

test("audit note candidate is present and display only", () => {
  const result = prepareCommunicationReviewSummary({
    direction: "inbound",
    channel: "email",
    body: "Normal communication",
  });

  assert.ok(result.audit_note_candidate);
  assert.equal(result.audit_note_candidate.communication_only, true);
  assert.equal(result.audit_note_candidate.can_send, false);
  assert.equal(result.audit_note_candidate.can_auto_reply, false);
  assert.equal(result.audit_note_candidate.can_create_task, false);
});

test("context is preserved as a safe copy", () => {
  const context = { related_inquiry_id: "inquiry_001" };
  const result = prepareCommunicationReviewSummary({
    direction: "internal",
    channel: "manual_note",
    body: "Internal context note",
  }, context);

  assert.deepEqual(result.context, context);
  assert.notEqual(result.context, context);
});
