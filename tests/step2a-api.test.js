import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  safetyBoundaryPayload,
  sanitizeAiInquiryAnalysisInput,
  sanitizeManufacturingCapabilityInput,
  sanitizeProductInput,
  validateBusinessLine,
} = require("../lib/api-validation.js");

test("valid business_line values are accepted", () => {
  assert.equal(validateBusinessLine("A_ARCHITECTURAL"), "A_ARCHITECTURAL");
  assert.equal(validateBusinessLine("B_INDUSTRIAL"), "B_INDUSTRIAL");
  assert.equal(validateBusinessLine("UNKNOWN"), "UNKNOWN");
});

test("invalid business_line values are rejected", () => {
  assert.throws(
    () => validateBusinessLine("B_PRECISION"),
    /business_line must be one of: A_ARCHITECTURAL, B_INDUSTRIAL, UNKNOWN/,
  );
  assert.throws(() => sanitizeProductInput({ business_line: "B_PRECISION" }), /business_line must be one of/);
});

test("missing business_line defaults to UNKNOWN on create where appropriate", () => {
  assert.equal(sanitizeProductInput({ code: "CL5437" }).business_line, "UNKNOWN");
  assert.equal(sanitizeManufacturingCapabilityInput({ equipment: "CNC machining center" }).capability_line, "UNKNOWN");
});

test("missing business_line is not overwritten on partial update", () => {
  assert.equal(sanitizeProductInput({ code: "CL5437" }, { partial: true }).business_line, undefined);
  assert.equal(
    sanitizeManufacturingCapabilityInput({ equipment: "CNC machining center" }, { partial: true }).capability_line,
    undefined,
  );
});

test("ai_inquiry_analyses create forces approval_required true", () => {
  const analysis = sanitizeAiInquiryAnalysisInput({
    inquiry_id: "inq_1",
    detected_business_line: "B_INDUSTRIAL",
    suggested_reply: "Draft reply only.",
    approval_required: false,
  });

  assert.equal(analysis.approval_required, true);
  assert.equal(analysis.detected_business_line, "B_INDUSTRIAL");
  assert.equal(analysis.suggested_reply, "Draft reply only.");
});

test("ai_inquiry_analyses update cannot set approval_required false", () => {
  const analysis = sanitizeAiInquiryAnalysisInput(
    {
      suggested_reply: "Updated internal draft.",
      approval_required: false,
    },
    { partial: true },
  );

  assert.equal(analysis.approval_required, true);
  assert.equal(analysis.detected_business_line, undefined);
});

test("ai inquiry analysis sanitizer does not preserve automatic sending fields", () => {
  const analysis = sanitizeAiInquiryAnalysisInput({
    detected_business_line: "A_ARCHITECTURAL",
    suggested_reply: "Please review the attached draft.",
    send_action: "send_email",
    send_status: "sent",
    sent_at: "2026-06-14T00:00:00Z",
    official_quotation_sent: true,
    pi_sent: true,
    price_confirmed: true,
    delivery_time_confirmed: true,
    payment_terms_confirmed: true,
  });

  assert.equal(analysis.approval_required, true);
  assert.equal(analysis.send_action, undefined);
  assert.equal(analysis.send_status, undefined);
  assert.equal(analysis.sent_at, undefined);
  assert.equal(analysis.official_quotation_sent, undefined);
  assert.equal(analysis.pi_sent, undefined);
  assert.equal(analysis.price_confirmed, undefined);
  assert.equal(analysis.delivery_time_confirmed, undefined);
  assert.equal(analysis.payment_terms_confirmed, undefined);
});

test("safety boundary payload confirms draft-only behavior", () => {
  const safety = safetyBoundaryPayload();

  assert.equal(safety.draft_only, true);
  assert.equal(safety.approval_required, true);
  assert.match(safety.safety_boundary, /No automatic customer message/);
  assert.match(safety.safety_boundary, /official quotation/);
  assert.match(safety.safety_boundary, /PI/);
  assert.match(safety.safety_boundary, /shipment confirmation/);
});
