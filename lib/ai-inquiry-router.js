import { AI_SAFETY_BOUNDARIES, BUSINESS_LINES } from "./crm-constants.js";

const architecturalKeywords = [
  "window",
  "windows",
  "door",
  "doors",
  "curtain wall",
  "facade",
  "façade",
  "louver",
  "louvers",
  "railing",
  "railings",
  "glass",
  "project",
  "building",
  "villa",
  "hotel",
  "apartment",
];

const industrialKeywords = [
  "cnc",
  "machining",
  "machined",
  "bracket",
  "brackets",
  "housing",
  "housings",
  "connector",
  "connectors",
  "mounting plate",
  "mounting plates",
  "drawing",
  "drawings",
  "tolerance",
  "prototype",
  "sample",
  "aluminum part",
  "aluminum parts",
];

const ambiguousProfileKeywords = ["profile", "profiles", "extrusion", "extrusions", "aluminum profile", "aluminium profile"];

const architecturalMissingInfo = [
  "project name",
  "product type",
  "drawings or window schedule",
  "glass specification",
  "area",
  "hardware",
  "color",
  "destination port",
  "incoterm",
];

const industrialMissingInfo = [
  "part name",
  "drawing file",
  "drawing format",
  "material grade",
  "process",
  "tolerance",
  "surface finish",
  "quantity",
  "inspection requirement",
  "sample requirement",
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractRequirements(text, fileNames = []) {
  const requirements = {};

  if (fileNames.length) {
    requirements.uploaded_file_names = fileNames;
  }
  if (/\b(pdf|dwg|dxf|step|stp|iges|igs|solidworks|sldprt)\b/i.test(`${text} ${fileNames.join(" ")}`)) {
    requirements.drawing_format = RegExp.lastMatch.toUpperCase();
  }
  if (/\b(6061|6063|6082|7075|t5|t6)\b/i.test(text)) {
    requirements.material_grade = RegExp.lastMatch.toUpperCase();
  }
  if (/\b(anodized|anodising|anodizing|powder coated|powder coating|mill finish|black|white|silver)\b/i.test(text)) {
    requirements.surface_finish = RegExp.lastMatch;
  }
  if (/\b(fob|cif|exw|dap|ddp)\b/i.test(text)) {
    requirements.incoterm = RegExp.lastMatch.toUpperCase();
  }

  return requirements;
}

function detectBusinessLine(text, fileNames = []) {
  const combined = normalizeText(`${text} ${fileNames.join(" ")}`);
  const hasArchitectural = hasAny(combined, architecturalKeywords);
  const hasIndustrial = hasAny(combined, industrialKeywords);
  const hasAmbiguousProfile = hasAny(combined, ambiguousProfileKeywords);

  if (hasArchitectural && !hasIndustrial) return BUSINESS_LINES.A_ARCHITECTURAL;
  if (hasIndustrial && !hasArchitectural) return BUSINESS_LINES.B_INDUSTRIAL;
  if (hasArchitectural && hasIndustrial) return BUSINESS_LINES.UNKNOWN;
  if (hasAmbiguousProfile) return BUSINESS_LINES.UNKNOWN;
  return BUSINESS_LINES.UNKNOWN;
}

function buildMissingInformation(businessLine, requirements) {
  const required = businessLine === BUSINESS_LINES.A_ARCHITECTURAL
    ? architecturalMissingInfo
    : businessLine === BUSINESS_LINES.B_INDUSTRIAL
      ? industrialMissingInfo
      : ["application", "product category", "drawing or specification", "quantity", "destination"];

  return required.filter((item) => {
    const compact = item.replace(/\s+/g, "_");
    return requirements[compact] === undefined;
  });
}

function buildIntent(businessLine) {
  if (businessLine === BUSINESS_LINES.A_ARCHITECTURAL) return "architectural_project_inquiry";
  if (businessLine === BUSINESS_LINES.B_INDUSTRIAL) return "drawing_driven_processing_inquiry";
  return "needs_manual_business_line_review";
}

function buildSuggestedReply(businessLine, missingInformation) {
  const missing = missingInformation.slice(0, 5).join(", ");
  if (businessLine === BUSINESS_LINES.A_ARCHITECTURAL) {
    return `Thank you for your architectural aluminum inquiry. We will review it manually. To prepare a proper quotation draft, please confirm: ${missing}.`;
  }
  if (businessLine === BUSINESS_LINES.B_INDUSTRIAL) {
    return `Thank you for your aluminum processing inquiry. We will review the drawings/specifications manually. To prepare a quotation draft, please confirm: ${missing}.`;
  }
  return `Thank you for your inquiry. We need a manual review to confirm whether this is an architectural project or industrial aluminum processing request. Please share the application, drawings/specifications and quantity.`;
}

export function routeInquiry(input = {}) {
  const message = String(input.customer_message || input.message || "");
  const fileNames = Array.isArray(input.uploaded_file_names)
    ? input.uploaded_file_names
    : Array.isArray(input.fileNames)
      ? input.fileNames
      : [];
  const detectedBusinessLine = detectBusinessLine(message, fileNames);
  const extractedRequirements = extractRequirements(message, fileNames);
  const missingInformation = buildMissingInformation(detectedBusinessLine, extractedRequirements);

  return {
    detected_business_line: detectedBusinessLine,
    customer_intent: buildIntent(detectedBusinessLine),
    extracted_requirements: extractedRequirements,
    missing_information: missingInformation,
    risk_flags: [
      "Manual review required before formal quotation or PI",
      "Do not confirm price, delivery time, payment terms or production feasibility automatically",
    ],
    suggested_reply_draft: buildSuggestedReply(detectedBusinessLine, missingInformation),
    approval_required: true,
    safety_boundaries: [...AI_SAFETY_BOUNDARIES],
  };
}

export const inquiryRoutingRules = Object.freeze({
  architecturalKeywords,
  industrialKeywords,
  ambiguousProfileKeywords,
});
