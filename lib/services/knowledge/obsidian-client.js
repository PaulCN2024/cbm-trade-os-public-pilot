// Obsidian Local REST API client.
//
// Talks to a locally running Obsidian "Local REST API" plugin so the Trade OS
// can read the user's foreign-trade knowledge base (customer profiles, product
// notes, communication history) when assembling AI context.
//
// Design rules for this layer:
//   - Local development uses a self-signed certificate, so TLS verification is
//     disabled for these requests only.
//   - Every request has a hard 5s timeout.
//   - All exported functions degrade silently: on any error, timeout, offline
//     state or unexpected payload they return an empty/false value instead of
//     throwing. Obsidian being unavailable must never break the system.

const https = require("node:https");

const DEFAULT_BASE_URL = "https://127.0.0.1:27124";
const REQUEST_TIMEOUT_MS = 5000;

function getBaseUrl() {
  return process.env.OBSIDIAN_BASE_URL || DEFAULT_BASE_URL;
}

function getToken() {
  return process.env.OBSIDIAN_TOKEN || "";
}

function encodeVaultPath(path) {
  return String(path)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Low-level request helper. Always resolves (never rejects); resolves to
// `{ status, text }` on a completed HTTP response, or `null` on any failure.
function obsidianRequest(method, path, options = {}) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    let url;
    try {
      url = new URL(path, getBaseUrl());
    } catch {
      finish(null);
      return;
    }

    if (options.query && typeof options.query === "object") {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers = { Accept: options.accept || "application/json" };
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let body;
    if (options.body !== undefined) {
      body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const requestOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      headers,
      // Local Obsidian REST API uses a self-signed certificate in dev.
      rejectUnauthorized: false,
      timeout: REQUEST_TIMEOUT_MS,
    };

    let req;
    try {
      req = https.request(requestOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          finish({ status: res.statusCode || 0, text: data });
        });
        res.on("error", () => finish(null));
      });
    } catch {
      finish(null);
      return;
    }

    req.on("error", () => finish(null));
    req.on("timeout", () => {
      req.destroy();
      finish(null);
    });

    if (body !== undefined) {
      req.write(body);
    }
    req.end();
  });
}

function isOk(res) {
  return Boolean(res) && res.status >= 200 && res.status < 300;
}

// List files in a vault folder. Returns an array of file/folder names, or `[]`.
async function listVaultFiles(folder = "") {
  const clean = String(folder || "").replace(/^\/+|\/+$/g, "");
  const path = clean ? `/vault/${encodeVaultPath(clean)}/` : "/vault/";
  const res = await obsidianRequest("GET", path);
  if (!isOk(res)) return [];
  const data = parseJson(res.text);
  if (data && Array.isArray(data.files)) return data.files;
  return [];
}

// Read a single vault file. Returns its raw markdown content, or `""`.
async function readVaultFile(filePath) {
  const clean = String(filePath || "").replace(/^\/+/, "");
  if (!clean) return "";
  const res = await obsidianRequest("GET", `/vault/${encodeVaultPath(clean)}`, {
    accept: "text/markdown",
  });
  if (!isOk(res)) return "";
  return res.text || "";
}

// Simple full-text search across the vault. Returns the raw result array, or `[]`.
async function searchVault(query) {
  const q = String(query || "").trim();
  if (!q) return [];
  const res = await obsidianRequest("POST", "/search/simple/", { query: { query: q } });
  if (!isOk(res)) return [];
  const data = parseJson(res.text);
  return Array.isArray(data) ? data : [];
}

// Check whether the local Obsidian REST API is reachable. Never throws.
async function isObsidianOnline() {
  const res = await obsidianRequest("GET", "/");
  return Boolean(res) && res.status >= 200 && res.status < 500;
}

module.exports = {
  listVaultFiles,
  readVaultFile,
  searchVault,
  isObsidianOnline,
};
