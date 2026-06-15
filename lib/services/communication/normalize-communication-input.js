const {
  ATTACHMENT_TYPES,
  COMMUNICATION_CHANNELS,
  COMMUNICATION_DIRECTIONS,
  COMMUNICATION_STATUS,
  COMMUNICATION_VISIBILITY_LEVELS,
  DEFAULT_COMMUNICATION_VALUES,
} = require("./communication-constants");

function normalizeDictionaryValue(value, dictionary, fallbackValue, fieldName) {
  const warnings = [];
  const normalizedValue = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (normalizedValue && Object.prototype.hasOwnProperty.call(dictionary, normalizedValue)) {
    return {
      value: normalizedValue,
      warnings,
      needs_human_review: false,
    };
  }

  const reason = normalizedValue ? "unknown" : "missing";
  warnings.push(`${fieldName} ${reason}; fallback used: ${fallbackValue}`);

  return {
    value: fallbackValue,
    warnings,
    needs_human_review: Boolean(normalizedValue),
  };
}

function normalizeCommunicationDirection(value) {
  return normalizeDictionaryValue(
    value,
    COMMUNICATION_DIRECTIONS,
    DEFAULT_COMMUNICATION_VALUES.DEFAULT_DIRECTION,
    "direction",
  );
}

function normalizeCommunicationChannel(value) {
  return normalizeDictionaryValue(
    value,
    COMMUNICATION_CHANNELS,
    DEFAULT_COMMUNICATION_VALUES.DEFAULT_CHANNEL,
    "channel",
  );
}

function normalizeAttachmentType(value) {
  return normalizeDictionaryValue(
    value,
    ATTACHMENT_TYPES,
    DEFAULT_COMMUNICATION_VALUES.DEFAULT_ATTACHMENT_TYPE,
    "attachment_type",
  );
}

function normalizeCommunicationVisibility(value) {
  return normalizeDictionaryValue(
    value,
    COMMUNICATION_VISIBILITY_LEVELS,
    DEFAULT_COMMUNICATION_VALUES.DEFAULT_VISIBILITY,
    "visibility",
  );
}

function normalizeCommunicationStatus(value) {
  return normalizeDictionaryValue(
    value,
    COMMUNICATION_STATUS,
    DEFAULT_COMMUNICATION_VALUES.DEFAULT_STATUS,
    "status",
  );
}

function normalizeCommunicationInput(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const normalizedInput = { ...source };

  const fields = [
    ["direction", normalizeCommunicationDirection(source.direction)],
    ["channel", normalizeCommunicationChannel(source.channel)],
    ["attachment_type", normalizeAttachmentType(source.attachment_type)],
    ["visibility", normalizeCommunicationVisibility(source.visibility)],
    ["status", normalizeCommunicationStatus(source.status)],
  ];

  const warnings = [];
  let needsHumanReview = false;

  for (const [fieldName, result] of fields) {
    normalizedInput[fieldName] = result.value;
    warnings.push(...result.warnings);
    needsHumanReview = needsHumanReview || result.needs_human_review;
  }

  return {
    normalized_input: normalizedInput,
    warnings,
    needs_human_review: needsHumanReview,
  };
}

module.exports = {
  normalizeCommunicationDirection,
  normalizeCommunicationChannel,
  normalizeAttachmentType,
  normalizeCommunicationVisibility,
  normalizeCommunicationStatus,
  normalizeCommunicationInput,
};
