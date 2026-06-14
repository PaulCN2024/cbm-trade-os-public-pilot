import test from "node:test";
import assert from "node:assert/strict";

import { BUSINESS_LINES, normalizeBusinessLine } from "../lib/crm-constants.js";
import { routeInquiry } from "../lib/ai-inquiry-router.js";

test("architectural keywords route to A_ARCHITECTURAL", () => {
  const result = routeInquiry({
    customer_message: "We need aluminum windows and curtain wall for a hotel project.",
  });

  assert.equal(result.detected_business_line, BUSINESS_LINES.A_ARCHITECTURAL);
  assert.equal(result.customer_intent, "architectural_project_inquiry");
  assert.ok(result.missing_information.includes("glass specification"));
  assert.equal(result.approval_required, true);
});

test("industrial CNC drawing inquiry routes to B_INDUSTRIAL", () => {
  const result = routeInquiry({
    customer_message: "Please quote CNC aluminum parts from drawings, tolerance ±0.05, anodized finish, 6061 T6.",
    uploaded_file_names: ["mounting-bracket.step"],
  });

  assert.equal(result.detected_business_line, BUSINESS_LINES.B_INDUSTRIAL);
  assert.equal(result.customer_intent, "drawing_driven_processing_inquiry");
  assert.equal(result.extracted_requirements.material_grade, "6061");
  assert.ok(result.missing_information.includes("quantity"));
  assert.equal(result.approval_required, true);
});

test("profile or extrusion stays UNKNOWN when application is unclear", () => {
  const result = routeInquiry({
    customer_message: "We need custom aluminum profiles and extrusion quotation.",
  });

  assert.equal(result.detected_business_line, BUSINESS_LINES.UNKNOWN);
  assert.equal(result.customer_intent, "needs_manual_business_line_review");
  assert.ok(result.missing_information.includes("application"));
});

test("profile becomes architectural when application is curtain wall", () => {
  const result = routeInquiry({
    customer_message: "Need aluminum profiles for curtain wall facade building project.",
  });

  assert.equal(result.detected_business_line, BUSINESS_LINES.A_ARCHITECTURAL);
});

test("extrusion plus machining routes to industrial processing", () => {
  const result = routeInquiry({
    customer_message: "Custom extrusion plus CNC machining for connector parts from drawing.",
  });

  assert.equal(result.detected_business_line, BUSINESS_LINES.B_INDUSTRIAL);
});

test("routing output preserves AI safety boundaries", () => {
  const result = routeInquiry({
    customer_message: "Please send formal quotation with best price and delivery time.",
  });

  assert.equal(result.approval_required, true);
  assert.ok(result.risk_flags.some((flag) => /Manual review required/.test(flag)));
  assert.ok(result.safety_boundaries.includes("No automatic formal quotations"));
  assert.ok(result.safety_boundaries.includes("No automatic PI"));
  assert.ok(result.safety_boundaries.includes("No automatic price confirmation"));
  assert.ok(result.safety_boundaries.includes("No automatic delivery time confirmation"));
  assert.doesNotMatch(result.suggested_reply_draft, /confirmed|we will send|official quotation sent/i);
});

test("legacy B_PRECISION normalizes to B_INDUSTRIAL", () => {
  assert.equal(normalizeBusinessLine("B_PRECISION"), BUSINESS_LINES.B_INDUSTRIAL);
  assert.equal(normalizeBusinessLine("B_INDUSTRIAL"), BUSINESS_LINES.B_INDUSTRIAL);
  assert.equal(normalizeBusinessLine("other"), BUSINESS_LINES.UNKNOWN);
});
