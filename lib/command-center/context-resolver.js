const VIEW_ALIASES = {
  "customer-360": "customers",
  inquiries: "leads",
  "lead-review": "leadPool",
  "follow-ups": "actionCenter",
};

const SUPPORTED_VIEWS = new Set([
  "dashboard",
  "actionCenter",
  "acquisition",
  "flow",
  "customers",
  "prospects",
  "leadPool",
  "leads",
  "website",
  "alibaba",
  "social",
  "campaigns",
  "whatsapp",
  "automation",
  "projects",
  "products",
  "quotes",
  "documents",
  "commandCenter",
  "orders",
  "shipments",
  "afterSales",
  "assistant",
]);

const SAFE_CONTEXT_KEYS = [
  "customer_id",
  "lead_id",
  "inquiry_id",
  "project_id",
  "draft_id",
  "document_id",
  "task_id",
  "document_type",
  "filter",
  "command_id",
  "command_summary",
];

const ALLOWED_FILTERS = new Set(["today", "overdue", "upcoming", "pending", "all"]);
const SENSITIVE_KEY_PATTERN = /(token|secret|password|key|session|auth|cookie|supabase|service_role)/i;

function toSearchParams(input) {
  if (input instanceof URLSearchParams) return input;
  if (typeof input === "string") return new URLSearchParams(input.startsWith("?") ? input.slice(1) : input);
  if (input && typeof input === "object") return new URLSearchParams(input);
  return new URLSearchParams();
}

function sanitizeValue(value) {
  return String(value || "").trim().slice(0, 120);
}

export function resolveCommandContext(input) {
  const params = toSearchParams(input);
  const warnings = [];
  const requestedView = sanitizeValue(params.get("view"));
  const resolvedView = VIEW_ALIASES[requestedView] || requestedView;
  const view = requestedView ? (SUPPORTED_VIEWS.has(resolvedView) ? resolvedView : "dashboard") : "";

  if (requestedView && !SUPPORTED_VIEWS.has(resolvedView)) {
    warnings.push(`Unknown view "${requestedView}". Opened Dashboard instead.`);
  }

  const context = {
    source: "command_center",
    view,
    customer_id: "",
    lead_id: "",
    inquiry_id: "",
    project_id: "",
    draft_id: "",
    document_id: "",
    task_id: "",
    document_type: "",
    filter: "",
    command_id: "",
    command_summary: "",
    warnings,
  };

  SAFE_CONTEXT_KEYS.forEach((key) => {
    const value = sanitizeValue(params.get(key));
    if (!value) return;
    if (key === "filter" && !ALLOWED_FILTERS.has(value)) {
      warnings.push(`Unsupported filter "${value}" ignored.`);
      return;
    }
    context[key] = value;
  });

  for (const key of params.keys()) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      warnings.push(`Sensitive parameter "${key}" ignored.`);
    }
  }

  return context;
}

export function hasCommandContext(context) {
  if (!context) return false;
  return Boolean(
    context.view ||
      context.customer_id ||
      context.lead_id ||
      context.inquiry_id ||
      context.project_id ||
      context.draft_id ||
      context.document_id ||
      context.task_id ||
      context.document_type ||
      context.filter ||
      context.command_id ||
      context.command_summary ||
      (context.warnings || []).length,
  );
}

export function contextTargetSummary(context) {
  if (!context) return [];
  return SAFE_CONTEXT_KEYS.map((key) => [key, context[key]]).filter(([, value]) => Boolean(value));
}
