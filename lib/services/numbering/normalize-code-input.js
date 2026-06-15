const {
  CUSTOMER_TYPE_CODE_VALUES,
  DEFAULT_CODES,
  OBJECT_TYPE_CODES,
  SOURCE_CODE_VALUES,
  SUPPLIER_CATEGORY_CODE_VALUES,
} = require("./code-dictionaries");

function result(value, warnings = [], needsHumanReview = warnings.length > 0) {
  return {
    value,
    warnings,
    needs_human_review: needsHumanReview,
  };
}

function cleanUpper(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeCountryCode(value) {
  const normalized = cleanUpper(value);
  if (!normalized) {
    return result(DEFAULT_CODES.UNKNOWN_COUNTRY, ["Missing country_code. Using XX."]);
  }
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return result(normalized, ["country_code should be a two-letter code."], true);
  }
  return result(normalized, []);
}

function normalizeCustomerType(value) {
  const normalized = cleanUpper(value);
  if (!normalized) {
    return result(DEFAULT_CODES.UNKNOWN_CUSTOMER_TYPE, ["Missing customer_type. Using UNK."]);
  }
  if (!CUSTOMER_TYPE_CODE_VALUES.includes(normalized)) {
    return result(DEFAULT_CODES.UNKNOWN_CUSTOMER_TYPE, [`Unknown customer_type "${normalized}". Using UNK.`]);
  }
  return result(normalized, []);
}

function normalizeSourceCode(value) {
  const normalized = cleanUpper(value);
  if (!normalized) {
    return result(DEFAULT_CODES.UNKNOWN_SOURCE, ["Missing source_code. Using MAN."]);
  }
  if (!SOURCE_CODE_VALUES.includes(normalized)) {
    return result(DEFAULT_CODES.UNKNOWN_SOURCE, [`Unknown source_code "${normalized}". Using MAN.`]);
  }
  return result(normalized, []);
}

function normalizeSupplierCategory(value) {
  const normalized = cleanUpper(value);
  if (!normalized) {
    return result(DEFAULT_CODES.OTHER_SUPPLIER_CATEGORY, ["Missing supplier_category. Using OTH."]);
  }
  if (!SUPPLIER_CATEGORY_CODE_VALUES.includes(normalized)) {
    return result(DEFAULT_CODES.OTHER_SUPPLIER_CATEGORY, [`Unknown supplier_category "${normalized}". Using OTH.`]);
  }
  return result(normalized, []);
}

function normalizeObjectType(value) {
  const normalized = String(value || "").trim();
  if (!normalized || !Object.prototype.hasOwnProperty.call(OBJECT_TYPE_CODES, normalized)) {
    return result(normalized, ["Unknown object_type."], true);
  }
  return result(normalized, []);
}

function normalizeYear(value) {
  const raw = String(value || "").trim();
  const year = Number(raw);
  if (!/^\d{4}$/.test(raw) || !Number.isInteger(year)) {
    return result(null, ["Invalid or missing year."], true);
  }
  return result(year, []);
}

function normalizeSequence(value) {
  const raw = String(value || "").trim();
  const sequence = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isInteger(sequence) || sequence <= 0) {
    return result(null, ["Invalid or missing sequence."], true);
  }
  return result(sequence, []);
}

function normalizeCodeInput(input = {}) {
  const normalizedInput = {};
  const warnings = [];
  let needsHumanReview = false;

  function apply(field, normalized) {
    normalizedInput[field] = normalized.value;
    warnings.push(...normalized.warnings);
    needsHumanReview = needsHumanReview || normalized.needs_human_review;
  }

  apply("object_type", normalizeObjectType(input.object_type));
  apply("country_code", normalizeCountryCode(input.country_code));
  apply("customer_type", normalizeCustomerType(input.customer_type));
  apply("source_code", normalizeSourceCode(input.source_code));
  apply("supplier_category", normalizeSupplierCategory(input.supplier_category));
  apply("year", normalizeYear(input.year));
  apply("sequence", normalizeSequence(input.sequence));

  if (Object.prototype.hasOwnProperty.call(input, "parent_code")) {
    normalizedInput.parent_code = String(input.parent_code || "").trim();
  }

  return {
    normalized_input: normalizedInput,
    warnings,
    needs_human_review: needsHumanReview,
  };
}

module.exports = {
  normalizeCountryCode,
  normalizeCustomerType,
  normalizeSourceCode,
  normalizeSupplierCategory,
  normalizeObjectType,
  normalizeYear,
  normalizeSequence,
  normalizeCodeInput,
};
