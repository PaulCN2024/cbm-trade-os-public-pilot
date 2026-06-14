export const BUSINESS_LINES = Object.freeze({
  A_ARCHITECTURAL: "A_ARCHITECTURAL",
  B_INDUSTRIAL: "B_INDUSTRIAL",
  UNKNOWN: "UNKNOWN",
});

export const LEGACY_BUSINESS_LINES = Object.freeze({
  B_PRECISION: "B_PRECISION",
});

export const BUSINESS_LINE_LABELS = Object.freeze({
  [BUSINESS_LINES.A_ARCHITECTURAL]: "Architectural products",
  [BUSINESS_LINES.B_INDUSTRIAL]: "Industrial aluminum processing",
  [BUSINESS_LINES.UNKNOWN]: "Unknown / needs manual routing",
});

export const AI_SAFETY_BOUNDARIES = Object.freeze([
  "No automatic customer messages",
  "No automatic formal quotations",
  "No automatic PI",
  "No automatic price confirmation",
  "No automatic delivery time confirmation",
  "No automatic payment terms confirmation",
  "No automatic production feasibility confirmation",
]);

export function normalizeBusinessLine(value) {
  if (value === BUSINESS_LINES.A_ARCHITECTURAL) return BUSINESS_LINES.A_ARCHITECTURAL;
  if (value === BUSINESS_LINES.B_INDUSTRIAL) return BUSINESS_LINES.B_INDUSTRIAL;
  if (value === LEGACY_BUSINESS_LINES.B_PRECISION) return BUSINESS_LINES.B_INDUSTRIAL;
  return BUSINESS_LINES.UNKNOWN;
}
