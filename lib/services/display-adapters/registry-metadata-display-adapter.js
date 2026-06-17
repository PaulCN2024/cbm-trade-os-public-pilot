const {
  getReviewSummaryHelper,
  listReviewSummaryHelpers,
} = require("../orchestration");

const FALLBACK_TITLE = "未知复核助手";
const FALLBACK_SUBTITLE = "未找到可用的复核助手元数据。";
const HELPER_REFERENCE_TEXT = "not displayed / not executable";

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function booleanText(value) {
  return value ? "是" : "否";
}

function buildFallbackViewModel(input) {
  const source = safeObject(input);

  return {
    title: FALLBACK_TITLE,
    subtitle: FALLBACK_SUBTITLE,
    badges: [
      { label: "未连接", tone: "warning" },
      { label: "不可用", tone: "neutral" },
    ],
    summaryRows: [],
    warningRows: [
      { label: "提示", value: "请检查 domain 或 metadata 输入。" },
    ],
    safetyRows: [],
    disabledCapabilities: [],
    technicalDetails: {
      domain: source.domain || null,
      helperReference: "none",
    },
    rawReference: null,
  };
}

function resolveMetadata(input) {
  const source = safeObject(input);

  if (source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)) {
    return source.metadata;
  }

  if (source.domain) {
    return getReviewSummaryHelper(source.domain);
  }

  return null;
}

function buildBadges(metadata) {
  const safetyFlags = safeObject(metadata.safetyFlags);

  return [
    { label: "只读", tone: "neutral" },
    { label: safetyFlags.pure_local ? "纯本地" : "需复核", tone: safetyFlags.pure_local ? "safe" : "warning" },
    { label: safetyFlags.no_write_actions ? "禁止写入" : "写入未确认", tone: "warning" },
  ];
}

function buildSummaryRows(metadata) {
  return [
    { label: "领域", value: metadata.domain || "unknown" },
    { label: "模块", value: metadata.module || "unknown" },
    { label: "函数", value: metadata.functionName || "unknown" },
    { label: "说明", value: metadata.description || FALLBACK_SUBTITLE },
  ];
}

function buildWarningRows(metadata) {
  return safeArray(metadata.forbiddenUse).map((forbiddenUse) => ({
    label: "禁止用途",
    value: forbiddenUse,
  }));
}

function buildSafetyRows(metadata) {
  return Object.entries(safeObject(metadata.safetyFlags)).map(([key, value]) => ({
    label: "安全标记",
    key,
    value: booleanText(Boolean(value)),
  }));
}

function buildDisabledCapabilities(metadata) {
  return Object.entries(safeObject(metadata.outputCapabilities))
    .filter(([, value]) => value === false)
    .map(([key]) => ({
      label: "已禁用能力",
      key,
      value: "否",
    }));
}

function buildTechnicalDetails(metadata) {
  return {
    key: metadata.key || null,
    domain: metadata.domain || null,
    module: metadata.module || null,
    functionName: metadata.functionName || null,
    helperReference: HELPER_REFERENCE_TEXT,
    allowedUse: safeArray(metadata.allowedUse),
    requiresHumanReviewFor: safeArray(metadata.requiresHumanReviewFor),
  };
}

function buildRawReference(metadata) {
  return {
    key: metadata.key || null,
    domain: metadata.domain || null,
    label: metadata.label || null,
    description: metadata.description || null,
    module: metadata.module || null,
    functionName: metadata.functionName || null,
    helperReference: HELPER_REFERENCE_TEXT,
  };
}

function registryMetadataDisplayAdapter(input = {}) {
  const metadata = resolveMetadata(input);

  if (!metadata) {
    return buildFallbackViewModel(input);
  }

  return {
    title: metadata.label || FALLBACK_TITLE,
    subtitle: metadata.description || FALLBACK_SUBTITLE,
    badges: buildBadges(metadata),
    summaryRows: buildSummaryRows(metadata),
    warningRows: buildWarningRows(metadata),
    safetyRows: buildSafetyRows(metadata),
    disabledCapabilities: buildDisabledCapabilities(metadata),
    technicalDetails: buildTechnicalDetails(metadata),
    rawReference: buildRawReference(metadata),
  };
}

function listRegistryMetadataDisplayModels() {
  return listReviewSummaryHelpers().map((metadata) => registryMetadataDisplayAdapter({ metadata }));
}

module.exports = {
  registryMetadataDisplayAdapter,
  listRegistryMetadataDisplayModels,
};
