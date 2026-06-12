const DEFAULT_BASE_PATH = "桌面 / MacBook Air / OneNote";

export function normalizeArchiveSegment(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export function buildArchivePath(options = {}) {
  const basePath = normalizeBasePath(options.base_path || DEFAULT_BASE_PATH);
  const customerAlias = normalizeArchiveSegment(options.customer_folder_alias || options.customer_alias || "Customer");
  const archiveYear = normalizeArchiveSegment(options.archive_year || new Date().getFullYear());
  const archiveOrderNo = normalizeArchiveSegment(options.archive_order_no || "1");

  return [...basePath, customerAlias, `${archiveYear}-${archiveOrderNo}`].join(" / ");
}

export function buildExportFileName(options = {}) {
  const customerAlias = normalizeArchiveSegment(options.customer_alias || options.customer_folder_alias || "Customer") || "Customer";
  const archiveYear = normalizeArchiveSegment(options.archive_year || new Date().getFullYear());
  const archiveOrderNo = normalizeArchiveSegment(options.archive_order_no || "1");
  const project = normalizeArchiveSegment(options.project || "Project") || "Project";
  const documentType = normalizeArchiveSegment(options.document_type || "Document") || "Document";
  const date = normalizeArchiveSegment(options.date || compactDate(new Date().toISOString().slice(0, 10)));
  const version = normalizeVersion(options.version || "v1");
  const ext = normalizeArchiveSegment(options.ext || "xlsx").toLowerCase() || "xlsx";

  return `${customerAlias}_${archiveYear}-${archiveOrderNo}_${project}_${documentType}_${date}_${version}.${ext}`;
}

export function getNextVersion(existingFiles = []) {
  const versions = existingFiles
    .map((fileName) => String(fileName).match(/_v(\d+)\.[^.]+$/i))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter(Number.isFinite);

  const nextVersion = versions.length ? Math.max(...versions) + 1 : 1;
  return `v${nextVersion}`;
}

export function buildZipPath(options = {}) {
  const baseParts = normalizeBasePath(options.base_path || DEFAULT_BASE_PATH);
  const zipBaseParts = baseParts[0] === "桌面" || baseParts[0].toLowerCase() === "desktop" ? baseParts.slice(1) : baseParts;
  const customerAlias = normalizeArchiveSegment(options.customer_folder_alias || options.customer_alias || "Customer");
  const archiveYear = normalizeArchiveSegment(options.archive_year || new Date().getFullYear());
  const archiveOrderNo = normalizeArchiveSegment(options.archive_order_no || "1");
  const fileName = options.file_name || buildExportFileName(options);

  return [...zipBaseParts, customerAlias, `${archiveYear}-${archiveOrderNo}`, fileName].join("/");
}

function normalizeBasePath(basePath) {
  return String(basePath || DEFAULT_BASE_PATH)
    .split("/")
    .map(normalizeArchiveSegment)
    .filter(Boolean);
}

function normalizeVersion(version) {
  const raw = String(version || "v1").trim();
  return raw.toLowerCase().startsWith("v") ? `v${Number(raw.slice(1)) || 1}` : `v${Number(raw) || 1}`;
}

function compactDate(value) {
  return String(value || "").replaceAll("-", "").slice(0, 8) || new Date().toISOString().slice(0, 10).replaceAll("-", "");
}
