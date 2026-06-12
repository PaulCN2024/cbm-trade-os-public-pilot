export const HighRiskTerms = [
  "official quotation",
  "正式报价",
  "报价",
  "quotation",
  "pi",
  "proforma invoice",
  "payment terms",
  "付款",
  "payment",
  "bank account",
  "银行",
  "delivery time",
  "交期",
  "compensation",
  "赔偿",
  "responsibility",
  "责任",
  "send",
  "发送",
  "回复客户",
];

export const HighRiskIntents = new Set(["create_quotation_draft", "create_document_draft"]);

export function requiresManualApproval(input = {}) {
  return approvalSummary(input).approval_required;
}

export function approvalSummary(input = {}) {
  const intent = typeof input === "string" ? "" : input.intent || input.parsed_intent || "";
  const rawCommand = typeof input === "string" ? input : input.raw_command || input.command || "";
  const plannedActions = Array.isArray(input.planned_actions) ? input.planned_actions.join(" ") : "";
  const haystack = `${intent} ${rawCommand} ${plannedActions}`.toLowerCase();
  const reasons = [];

  if (HighRiskIntents.has(intent)) reasons.push(`Intent ${intent} creates a commercial draft that requires manual review.`);
  HighRiskTerms.forEach((term) => {
    if (haystack.includes(term.toLowerCase())) reasons.push(`Command mentions high-risk term: ${term}`);
  });

  const approvalRequired = reasons.length > 0;

  return {
    approval_required: approvalRequired,
    risk_level: approvalRequired ? "high" : "low",
    reasons,
    label: approvalRequired ? "Manual Review Required" : "Manual approval not required for preview",
    safety_notes: [
      "No automatic customer messages.",
      "No automatic official quotation or PI.",
      "No price, delivery time, payment terms, bank account, compensation or responsibility confirmation.",
    ],
  };
}
