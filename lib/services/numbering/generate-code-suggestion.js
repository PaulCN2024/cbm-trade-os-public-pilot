const {
  CUSTOMER_TYPE_CODE_VALUES,
  DEFAULT_CODES,
  OBJECT_TYPE_CODES,
  SOURCE_CODE_VALUES,
  SUPPLIER_CATEGORY_CODE_VALUES,
} = require("./code-dictionaries");

const COUNTRY_BASED_OBJECT_TYPES = new Set([
  "inquiry",
  "project",
  "supplier_rfq",
  "supplier_quote",
  "customer_quotation",
  "pi",
  "order",
  "purchase_order",
]);

const NON_COUNTRY_OBJECT_TYPES = new Set([
  "document",
  "attachment",
  "communication_thread",
  "task",
  "knowledge_article",
  "approval_review",
]);

function normalizeCode(value, fallback) {
  return String(value || fallback).trim().toUpperCase();
}

function normalizeYear(year, warnings) {
  const normalized = String(year || "").trim();
  if (!/^\d{4}$/.test(normalized)) {
    warnings.push("Invalid or missing year.");
    return "";
  }
  return normalized;
}

function normalizeSequence(sequence, digits, warnings) {
  const number = Number(sequence);
  if (!Number.isInteger(number) || number <= 0) {
    warnings.push("Invalid or missing sequence.");
    return "";
  }
  return String(number).padStart(digits, "0");
}

function buildResult(code, codeParts, warnings) {
  const needsHumanReview = warnings.length > 0;

  return {
    code,
    code_parts: codeParts,
    confidence: needsHumanReview ? "low" : "high",
    warnings,
    needs_human_review: needsHumanReview,
  };
}

function generateCodeSuggestion(input = {}) {
  const warnings = [];
  const objectType = input.object_type;
  const objectCode = OBJECT_TYPE_CODES[objectType];

  if (!objectCode) {
    warnings.push("Unknown object_type.");
    return buildResult("", { object_type: objectType || "" }, warnings);
  }

  const year = normalizeYear(input.year, warnings);
  const mainSequence = normalizeSequence(input.sequence, 4, warnings);
  const contactSequence = normalizeSequence(input.sequence, 2, warnings);
  const country = normalizeCode(input.country_code, DEFAULT_CODES.UNKNOWN_COUNTRY);
  const source = normalizeCode(input.source_code, DEFAULT_CODES.UNKNOWN_SOURCE);
  const customerType = normalizeCode(input.customer_type, DEFAULT_CODES.UNKNOWN_CUSTOMER_TYPE);
  const supplierCategory = normalizeCode(input.supplier_category, DEFAULT_CODES.OTHER_SUPPLIER_CATEGORY);

  if (objectType === "customer_company" && !CUSTOMER_TYPE_CODE_VALUES.includes(customerType)) {
    warnings.push("Unknown customer_type.");
  }

  if ((objectType === "customer_company" || objectType === "supplier_company") && !SOURCE_CODE_VALUES.includes(source)) {
    warnings.push("Unknown source_code.");
  }

  if (objectType === "supplier_company" && !SUPPLIER_CATEGORY_CODE_VALUES.includes(supplierCategory)) {
    warnings.push("Unknown supplier_category.");
  }

  if (objectType === "customer_company") {
    return buildResult(
      [objectCode, country, customerType, source, year, mainSequence].filter(Boolean).join("-"),
      { object_type: objectType, object_code: objectCode, country, customer_type: customerType, source, year, sequence: mainSequence },
      warnings
    );
  }

  if (objectType === "supplier_company") {
    return buildResult(
      [objectCode, country, supplierCategory, source, year, mainSequence].filter(Boolean).join("-"),
      { object_type: objectType, object_code: objectCode, country, supplier_category: supplierCategory, source, year, sequence: mainSequence },
      warnings
    );
  }

  if (objectType === "customer_contact" || objectType === "supplier_contact") {
    const parentCode = String(input.parent_code || "").trim();
    if (!parentCode) {
      warnings.push("Missing parent_code for contact object type.");
    }

    return buildResult(
      parentCode && contactSequence ? `${parentCode}-C${contactSequence}` : "",
      { object_type: objectType, object_code: objectCode, parent_code: parentCode, sequence: contactSequence },
      warnings
    );
  }

  if (COUNTRY_BASED_OBJECT_TYPES.has(objectType)) {
    return buildResult(
      [objectCode, country, year, mainSequence].filter(Boolean).join("-"),
      { object_type: objectType, object_code: objectCode, country, year, sequence: mainSequence },
      warnings
    );
  }

  if (NON_COUNTRY_OBJECT_TYPES.has(objectType)) {
    return buildResult(
      [objectCode, year, mainSequence].filter(Boolean).join("-"),
      { object_type: objectType, object_code: objectCode, year, sequence: mainSequence },
      warnings
    );
  }

  warnings.push("Unsupported object_type.");
  return buildResult("", { object_type: objectType, object_code: objectCode }, warnings);
}

module.exports = {
  generateCodeSuggestion,
};
