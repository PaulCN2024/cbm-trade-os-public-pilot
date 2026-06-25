// Knowledge context assembler.
//
// Turns the raw Obsidian vault (customer profiles + product/communication notes)
// into ready-to-use context strings for quoting and inquiry handling.
//
// Every function degrades gracefully:
//   - When Obsidian is offline it returns a human-readable offline notice string
//     instead of throwing.
//   - When the customer cannot be found it returns a "not found" notice string.
//   - It never sends customer messages or produces binding commercial content;
//     it only gathers internal reference context for human review.

const {
  readVaultFile,
  searchVault,
  isObsidianOnline,
} = require("./obsidian-client");

const OFFLINE_NOTICE =
  "【知识库离线】Obsidian 本地知识库当前不可用，已跳过档案检索，系统其余功能不受影响。";

function offlineNotice() {
  return OFFLINE_NOTICE;
}

function notFoundNotice(customerName) {
  const name = String(customerName || "").trim();
  return `【未找到客户档案】知识库中没有与「${name}」匹配的客户资料。`;
}

function normalizeKeywords(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(/[\s,，、]+/);
  return arr.map((item) => String(item).trim()).filter(Boolean);
}

function extractKeywords(text) {
  const tokens = String(text || "").split(/[\s,.;:!?，。、；：！？\n\r]+/);
  const seen = new Set();
  const keywords = [];
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed.length < 2) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    keywords.push(trimmed);
    if (keywords.length >= 5) break;
  }
  return keywords;
}

async function collectSnippets(results, limit) {
  const snippets = [];
  for (const item of (results || []).slice(0, limit)) {
    const filename = item && item.filename;
    if (!filename) continue;
    const content = await readVaultFile(filename);
    if (content && content.trim()) {
      snippets.push(`#### ${filename}\n${content.trim()}`);
    }
  }
  return snippets;
}

async function collectKeywordKnowledge(keywords, perKeyword) {
  const sections = [];
  for (const keyword of keywords) {
    const results = await searchVault(keyword);
    const snippets = await collectSnippets(results, perKeyword);
    if (snippets.length) {
      sections.push(`### ${keyword}\n${snippets.join("\n\n")}`);
    }
  }
  return sections.join("\n\n");
}

// Retrieve a customer's profile context by name.
// Returns the assembled profile string, an offline notice, or a not-found notice.
async function getClientContext(customerName) {
  const name = String(customerName || "").trim();
  if (!name) return "";
  if (!(await isObsidianOnline())) return offlineNotice();

  const results = await searchVault(name);
  if (!results.length) return notFoundNotice(name);

  const snippets = await collectSnippets(results, 3);
  if (!snippets.length) return notFoundNotice(name);

  return snippets.join("\n\n---\n\n");
}

// Assemble quoting context: customer profile + relevant product knowledge.
async function buildQuoteContext({ customerName, productKeywords } = {}) {
  if (!(await isObsidianOnline())) return offlineNotice();

  const parts = [];

  const clientContext = await getClientContext(customerName);
  if (clientContext) {
    parts.push(`## 客户档案\n${clientContext}`);
  }

  const knowledge = await collectKeywordKnowledge(normalizeKeywords(productKeywords), 2);
  if (knowledge) {
    parts.push(`## 产品知识\n${knowledge}`);
  }

  return parts.join("\n\n").trim();
}

// Assemble inquiry context: customer profile + knowledge relevant to the inquiry text.
async function buildInquiryContext({ customerName, inquiryText } = {}) {
  if (!(await isObsidianOnline())) return offlineNotice();

  const parts = [];

  const clientContext = await getClientContext(customerName);
  if (clientContext) {
    parts.push(`## 客户档案\n${clientContext}`);
  }

  const knowledge = await collectKeywordKnowledge(extractKeywords(inquiryText), 2);
  if (knowledge) {
    parts.push(`## 相关知识\n${knowledge}`);
  }

  return parts.join("\n\n").trim();
}

module.exports = {
  OFFLINE_NOTICE,
  offlineNotice,
  notFoundNotice,
  getClientContext,
  buildQuoteContext,
  buildInquiryContext,
};
