const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyAttachmentName,
  classifyCommunicationInput,
  detectSensitiveCommunication,
} = require("../lib/services/communication/classify-communication");

test("drawing filename is classified as drawing", () => {
  const result = classifyAttachmentName("hotel_window_drawing.dwg");
  assert.equal(result.attachment_type, "drawing");
  assert.equal(result.needs_human_review, false);
});

test("jpg and png filenames are classified as photo", () => {
  assert.equal(classifyAttachmentName("site_photo.jpg").attachment_type, "photo");
  assert.equal(classifyAttachmentName("profile_image.png").attachment_type, "photo");
});

test("supplier quote filename is classified as supplier_quote", () => {
  const result = classifyAttachmentName("factory_quote_aluminum.xlsx");
  assert.equal(result.attachment_type, "supplier_quote");
});

test("PI and proforma filenames are classified as pi", () => {
  assert.equal(classifyAttachmentName("project_pi_v1.pdf").attachment_type, "pi");
  assert.equal(classifyAttachmentName("proforma_invoice.pdf").attachment_type, "pi");
});

test("payment slip filename is classified as payment_slip", () => {
  const result = classifyAttachmentName("payment_slip_receipt.pdf");
  assert.equal(result.attachment_type, "payment_slip");
});

test("unknown filename returns other and needs human review", () => {
  const result = classifyAttachmentName("customer_file.bin");
  assert.equal(result.attachment_type, "other");
  assert.equal(result.needs_human_review, true);
  assert.ok(result.warnings.length > 0);
});

test("price keyword triggers price_related", () => {
  const result = detectSensitiveCommunication({ body: "Please confirm the final price in USD." });
  assert.equal(result.sensitivity_flags.price_related, true);
  assert.equal(result.needs_human_review, true);
});

test("delivery keyword triggers delivery_related", () => {
  const result = detectSensitiveCommunication({ body: "What is the delivery lead time?" });
  assert.equal(result.sensitivity_flags.delivery_related, true);
});

test("payment keyword triggers payment_related", () => {
  const result = detectSensitiveCommunication({ body: "Please confirm payment terms and bank details." });
  assert.equal(result.sensitivity_flags.payment_related, true);
});

test("compensation and refund keywords trigger compensation_related", () => {
  assert.equal(detectSensitiveCommunication({ body: "We request compensation." }).sensitivity_flags.compensation_related, true);
  assert.equal(detectSensitiveCommunication({ body: "Please refund this order." }).sensitivity_flags.compensation_related, true);
});

test("quality and complaint keywords trigger quality or complaint flags", () => {
  const qualityResult = detectSensitiveCommunication({ body: "There is a quality defect." });
  assert.equal(qualityResult.sensitivity_flags.quality_related, true);

  const complaintResult = detectSensitiveCommunication({ body: "Customer complaint about damage." });
  assert.equal(complaintResult.sensitivity_flags.complaint_related, true);
});

test("order confirmation keyword triggers order_related", () => {
  const result = detectSensitiveCommunication({ subject: "Order confirmation for project materials" });
  assert.equal(result.sensitivity_flags.order_related, true);
});

test("quotation keyword triggers quotation_related", () => {
  const result = detectSensitiveCommunication({ body: "Please send quotation for aluminum profile." });
  assert.equal(result.sensitivity_flags.quotation_related, true);
});

test("classifyCommunicationInput combines normalization attachment classification and sensitivity", () => {
  const result = classifyCommunicationInput({
    direction: "INBOUND",
    channel: "EMAIL",
    attachment_name: "facade_drawing.dwg",
    body: "Please check price and delivery.",
  });

  assert.equal(result.normalized_input.direction, "inbound");
  assert.equal(result.normalized_input.channel, "email");
  assert.equal(result.attachment_classification.attachment_type, "drawing");
  assert.equal(result.sensitivity.sensitivity_flags.price_related, true);
  assert.equal(result.sensitivity.sensitivity_flags.delivery_related, true);
  assert.equal(result.needs_human_review, true);
});

test("classifyCommunicationInput does not mutate original input", () => {
  const input = {
    direction: "INBOUND",
    channel: "EMAIL",
    attachment_name: "unknown-file.bin",
    body: "Normal note",
  };
  const snapshot = { ...input };

  classifyCommunicationInput(input);

  assert.deepEqual(input, snapshot);
});
