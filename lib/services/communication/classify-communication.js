const { DEFAULT_COMMUNICATION_VALUES } = require("./communication-constants");
const { normalizeCommunicationInput } = require("./normalize-communication-input");

const ATTACHMENT_RULES = Object.freeze([
  ["supplier_quote", /\b(supplier[\s_-]*quote|supplier[\s_-]*offer|factory[\s_-]*quote)\b/],
  ["drawing", /\b(drawing|dwg|cad|blueprint|plan)\b/],
  ["photo", /\b(photo|image|jpg|jpeg|png|picture)\b|\.(jpg|jpeg|png)$/],
  ["quotation", /\b(quotation|quote|offer)\b/],
  ["pi", /\b(pi|proforma)\b/],
  ["invoice", /\binvoice\b/],
  ["payment_slip", /\b(payment|slip|receipt|transfer)\b/],
  ["product_spec", /\b(spec|specification|datasheet|data-sheet)\b/],
  ["packing_info", /\b(packing|package|carton)\b/],
  ["video", /\.(mp4|mov|avi|webm)$/],
  ["certificate", /\b(cert|certificate|test-report)\b/],
  ["screenshot", /\b(screenshot|screen)\b/],
]);

const SENSITIVE_RULES = Object.freeze([
  ["price_related", /\b(price|pricing|cost|amount|usd|rmb|discount)\b/],
  ["delivery_related", /\b(delivery|lead[\s_-]*time|ship|shipment|eta|etd)\b/],
  ["payment_related", /\b(payment|deposit|balance|bank|tt|t\/t|lc|l\/c|terms)\b/],
  ["compensation_related", /\b(compensation|refund|claim|reimburse)\b/],
  ["quality_related", /\b(quality|defect|broken|damage|damaged|responsibility)\b/],
  ["order_related", /\b(order[\s_-]*confirmation|confirm[\s_-]*order|po\b|purchase[\s_-]*order)\b/],
  ["quotation_related", /\b(quotation|quote|offer|pi|proforma)\b/],
  ["complaint_related", /\b(complaint|complain|issue|problem|dispute)\b/],
]);

function toSearchText(value) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[_-]+/g, " ") : "";
}

function classifyAttachmentName(fileName) {
  const normalizedName = toSearchText(fileName);

  if (!normalizedName) {
    return {
      attachment_type: DEFAULT_COMMUNICATION_VALUES.DEFAULT_ATTACHMENT_TYPE,
      confidence: 0,
      warnings: ["attachment_name missing; classified as other"],
      needs_human_review: true,
    };
  }

  for (const [attachmentType, pattern] of ATTACHMENT_RULES) {
    if (pattern.test(normalizedName)) {
      return {
        attachment_type: attachmentType,
        confidence: 0.85,
        warnings: [],
        needs_human_review: false,
      };
    }
  }

  return {
    attachment_type: DEFAULT_COMMUNICATION_VALUES.DEFAULT_ATTACHMENT_TYPE,
    confidence: 0.2,
    warnings: ["attachment_name did not match local classification rules; classified as other"],
    needs_human_review: true,
  };
}

function detectSensitiveCommunication(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const combinedText = [
    source.subject,
    source.body,
    source.text,
    source.attachment_name,
  ]
    .map(toSearchText)
    .filter(Boolean)
    .join(" ");

  const sensitivityFlags = {};
  const warnings = [];

  for (const [flagName, pattern] of SENSITIVE_RULES) {
    sensitivityFlags[flagName] = pattern.test(combinedText);
  }

  const needsHumanReview = Object.values(sensitivityFlags).some(Boolean);
  if (needsHumanReview) {
    warnings.push("sensitive business keywords detected; human review required");
  }

  return {
    sensitivity_flags: sensitivityFlags,
    needs_human_review: needsHumanReview,
    warnings,
  };
}

function classifyCommunicationInput(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const normalized = normalizeCommunicationInput(source);
  const attachmentClassification = classifyAttachmentName(source.attachment_name || source.file_name);
  const sensitivity = detectSensitiveCommunication(source);

  return {
    normalized_input: normalized.normalized_input,
    attachment_classification: attachmentClassification,
    sensitivity,
    warnings: [
      ...normalized.warnings,
      ...attachmentClassification.warnings,
      ...sensitivity.warnings,
    ],
    needs_human_review:
      normalized.needs_human_review ||
      attachmentClassification.needs_human_review ||
      sensitivity.needs_human_review,
  };
}

module.exports = {
  classifyCommunicationInput,
  classifyAttachmentName,
  detectSensitiveCommunication,
};
