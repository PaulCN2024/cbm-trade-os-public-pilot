const VALID_BUSINESS_LINES = Object.freeze(["A_ARCHITECTURAL", "B_INDUSTRIAL", "UNKNOWN"]);

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalText(value) {
  if (value === undefined || value === null) return undefined;
  return String(value);
}

function optionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalBoolean(value) {
  if (value === undefined || value === null || value === "") return undefined;
  return Boolean(value);
}

function optionalJson(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return value;
}

function compactRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function validateBusinessLine(value, options = {}) {
  const { field = "business_line", required = false, defaultToUnknown = true } = options;
  if (value === undefined || value === null || value === "") {
    if (required && !defaultToUnknown) throw validationError(`${field} is required.`);
    return defaultToUnknown ? "UNKNOWN" : undefined;
  }
  const normalized = String(value).trim().toUpperCase();
  if (!VALID_BUSINESS_LINES.includes(normalized)) {
    throw validationError(`${field} must be one of: ${VALID_BUSINESS_LINES.join(", ")}.`);
  }
  return normalized;
}

function sanitizeCompanyInput(input = {}) {
  return compactRecord({
    company_name: optionalText(input.company_name || input.name),
    country: optionalText(input.country),
    address: optionalText(input.address),
    website: optionalText(input.website),
    business_type: optionalText(input.business_type),
    notes: optionalText(input.notes),
  });
}

function sanitizeProductInput(input = {}, options = {}) {
  const { partial = false } = options;
  return compactRecord({
    business_line: validateBusinessLine(input.business_line, { defaultToUnknown: !partial }),
    category: optionalText(input.category),
    product_family: optionalText(input.product_family),
    code: optionalText(input.code),
    name_cn: optionalText(input.name_cn),
    name_en: optionalText(input.name_en),
    name_es: optionalText(input.name_es),
    material: optionalText(input.material),
    standard: optionalText(input.standard),
    surface: optionalText(input.surface),
    process_tags: optionalJson(input.process_tags, []),
    notes: optionalText(input.notes),
  });
}

function sanitizeManufacturingCapabilityInput(input = {}, options = {}) {
  const { partial = false } = options;
  return compactRecord({
    capability_line: validateBusinessLine(input.capability_line || input.business_line, {
      field: "capability_line",
      defaultToUnknown: !partial,
    }),
    equipment: optionalText(input.equipment),
    quantity: optionalNumber(input.quantity),
    max_length: optionalText(input.max_length),
    monthly_capacity: optionalText(input.monthly_capacity),
    public_description: optionalText(input.public_description),
    internal_notes: optionalText(input.internal_notes),
  });
}

function sanitizeAiInquiryAnalysisInput(input = {}, options = {}) {
  const { partial = false } = options;
  return compactRecord({
    inquiry_id: optionalText(input.inquiry_id),
    detected_business_line: validateBusinessLine(input.detected_business_line || input.business_line, {
      field: "detected_business_line",
      defaultToUnknown: !partial,
    }),
    extracted_requirements: isPlainObject(input.extracted_requirements) ? input.extracted_requirements : {},
    missing_information: Array.isArray(input.missing_information) ? input.missing_information : [],
    risk_flags: Array.isArray(input.risk_flags) ? input.risk_flags : [],
    suggested_reply: optionalText(input.suggested_reply || input.suggested_reply_draft),
    approval_required: true,
  });
}

function safetyBoundaryPayload() {
  return {
    draft_only: true,
    approval_required: true,
    safety_boundary:
      "Draft only. No automatic customer message, official quotation, PI, price, delivery time, payment terms, production feasibility, contract, order or shipment confirmation.",
  };
}

module.exports = {
  VALID_BUSINESS_LINES,
  safetyBoundaryPayload,
  sanitizeAiInquiryAnalysisInput,
  sanitizeCompanyInput,
  sanitizeManufacturingCapabilityInput,
  sanitizeProductInput,
  validateBusinessLine,
};
