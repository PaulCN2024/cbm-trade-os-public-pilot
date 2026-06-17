const test = require("node:test");
const assert = require("node:assert/strict");

const {
  prepareInquiryReviewSummary,
} = require("../lib/services/inquiries/prepare-inquiry-review-summary");

test("exports prepareInquiryReviewSummary", () => {
  assert.equal(typeof prepareInquiryReviewSummary, "function");
});

test("returns normalized inquiry", () => {
  const result = prepareInquiryReviewSummary({
    inquiry_type: "website",
    customer_name: "Demo Customer",
    company_name: "Demo Company",
    business_line: "A_ARCHITECTURAL",
    product_category: "curtain wall",
    ignored_field: "not copied",
  });

  assert.equal(result.normalized_inquiry.customer_name, "Demo Customer");
  assert.equal(result.normalized_inquiry.company_name, "Demo Company");
  assert.equal(result.normalized_inquiry.business_line, "A_ARCHITECTURAL");
  assert.equal(result.normalized_inquiry.ignored_field, undefined);
});

test("safety fields always prevent business actions", () => {
  const result = prepareInquiryReviewSummary({
    summary: "Internal inquiry review.",
  });

  assert.equal(result.inquiry_only, true);
  assert.equal(result.can_send, false);
  assert.equal(result.can_create_quote, false);
  assert.equal(result.can_create_pi, false);
  assert.equal(result.can_create_order, false);
  assert.equal(result.can_trigger_production, false);
  assert.equal(result.can_trigger_shipment, false);
});

test("does not mutate raw input context or options", () => {
  const input = {
    original_message: "Please check price.",
    missing_information: ["drawing"],
  };
  const context = { related_customer_id: "customer_001" };
  const options = { review_note: "internal only" };
  const inputSnapshot = { ...input };
  const contextSnapshot = { ...context };
  const optionsSnapshot = { ...options };

  prepareInquiryReviewSummary(input, context, options);

  assert.deepEqual(input, inputSnapshot);
  assert.deepEqual(context, contextSnapshot);
  assert.deepEqual(options, optionsSnapshot);
});

test("combines communication summary when message exists", () => {
  const result = prepareInquiryReviewSummary({
    message: "Please review this inquiry.",
    source: "website",
  });

  assert.ok(result.communication_review_summary);
  assert.equal(result.communication_review_summary.normalized_communication.channel, "website");
});

test("combines communication summary when original_message exists", () => {
  const result = prepareInquiryReviewSummary({
    original_message: "Customer asks for project details.",
  });

  assert.ok(result.communication_review_summary);
  assert.equal(result.communication_review_summary.normalized_communication.body, "Customer asks for project details.");
});

test("combines AI draft summary when suggested_reply exists", () => {
  const result = prepareInquiryReviewSummary({
    suggested_reply: "Draft a polite reply asking for drawings.",
  });

  assert.ok(result.ai_draft_review_summary);
  assert.equal(result.ai_draft_review_summary.draft_only, true);
  assert.equal(result.ai_draft_review_summary.can_send, false);
});

test("combines AI draft summary when draft_content exists", () => {
  const result = prepareInquiryReviewSummary({
    draft_content: "Summarize inquiry details for review.",
  });

  assert.ok(result.ai_draft_review_summary);
  assert.equal(result.ai_draft_review_summary.can_auto_approve, false);
});

test("price delivery payment quotation and PI content requires review through nested summaries", () => {
  const result = prepareInquiryReviewSummary({
    original_message: "Please confirm price, delivery, payment, quotation and PI.",
    suggested_reply: "We will discuss price, delivery, payment, quotation and PI.",
  });

  assert.equal(result.review_required, true);
  assert.equal(result.needs_human_review, true);
  assert.equal(result.communication_review_summary.review_required, true);
  assert.equal(result.ai_draft_review_summary.approval_required, true);
  assert.equal(result.can_send, false);
});

test("missing information produces review required and warning", () => {
  const result = prepareInquiryReviewSummary({
    summary: "Customer needs aluminum profiles.",
    missing_information: ["drawing", "quantity"],
  });

  assert.deepEqual(result.missing_information, ["drawing", "quantity"]);
  assert.equal(result.review_required, true);
  assert.ok(result.warnings.some((warning) => warning.includes("missing_information present")));
});

test("risk flags are preserved and produce review required", () => {
  const result = prepareInquiryReviewSummary({
    summary: "Customer mentions urgent delivery.",
    risk_flags: ["delivery_related"],
  });

  assert.deepEqual(result.risk_flags, ["delivery_related"]);
  assert.equal(result.review_required, true);
  assert.ok(result.warnings.some((warning) => warning.includes("risk_flags present")));
});

test("warnings is always an array", () => {
  assert.ok(Array.isArray(prepareInquiryReviewSummary().warnings));
  assert.ok(Array.isArray(prepareInquiryReviewSummary({ message: "Hello" }).warnings));
});

test("recommended operator action is present and advisory only", () => {
  const result = prepareInquiryReviewSummary({
    original_message: "Please confirm final price.",
  });

  assert.equal(typeof result.recommended_operator_action, "string");
  assert.match(result.recommended_operator_action, /Review/);
  assert.equal(result.can_send, false);
});

test("audit note candidate is present and display only", () => {
  const result = prepareInquiryReviewSummary({
    summary: "Internal inquiry review.",
  });

  assert.ok(result.audit_note_candidate);
  assert.equal(result.audit_note_candidate.inquiry_only, true);
  assert.equal(result.audit_note_candidate.can_send, false);
  assert.equal(result.audit_note_candidate.can_create_quote, false);
  assert.equal(result.audit_note_candidate.can_create_pi, false);
  assert.equal(result.audit_note_candidate.can_create_order, false);
  assert.equal(result.audit_note_candidate.can_trigger_production, false);
  assert.equal(result.audit_note_candidate.can_trigger_shipment, false);
});

test("context is preserved as a safe copy", () => {
  const context = { related_customer_id: "customer_001" };
  const result = prepareInquiryReviewSummary({
    summary: "Internal inquiry review.",
  }, context);

  assert.deepEqual(result.context, context);
  assert.notEqual(result.context, context);
});

test("does not include numbering or code suggestion behavior", () => {
  const result = prepareInquiryReviewSummary({
    summary: "Need inquiry review.",
  });

  assert.equal(Object.prototype.hasOwnProperty.call(result, "code"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "inquiry_code"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "code_suggestion"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.audit_note_candidate, "code"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.audit_note_candidate, "inquiry_code"), false);
});

test("missing or non-object input is handled safely", () => {
  const missingResult = prepareInquiryReviewSummary();
  const stringResult = prepareInquiryReviewSummary("send quote");

  assert.equal(missingResult.inquiry_only, true);
  assert.equal(stringResult.inquiry_only, true);
  assert.equal(missingResult.can_send, false);
  assert.equal(stringResult.can_send, false);
});
