// api/inbound/whatsapp — WhatsApp Cloud API webhook（公网入口 · 上云最小切口 · 获客块B）
// ============================================================================
// GET  = Meta 订阅验证握手（hub.verify_token == WHATSAPP_VERIFY_TOKEN → 回显 hub.challenge）。
// POST = X-Hub-Signature-256 验签（HMAC-SHA256·WHATSAPP_APP_SECRET）→ WhatsAppAdapter 归一 → 落云 leads(status=NEED_REVIEW)。
// 【范式】照 api/public-inquiries.js：CommonJS handler·getSupabaseAdminClient·leads 查重 upsert·NEED_REVIEW/manual_review_required/不自动发/safety_boundary。
// 【ESM 混用】lib/whatsapp/*、adapters、meta-leadgen 是 ESM——handler 内 await import（禁顶层 require·见 public-inquiries.js:197）。
// 【单租户】当前 public-pilot 的 leads 无 org_id；按站分 org_id + 来源注册表是下一步（Running 号来了一次性上）。
// 【红线】外部·未核实·AI 不自动回复；线索进 NEED_REVIEW 待人确认；CTWA 广告归因（ctwa_clid/source_ad_id）随线索带进 metadata。
// ============================================================================
const { getSupabaseAdminClient, sendJson } = require("./_supabase");

// 读原始请求体字节（验签必需·JSON.parse 后无法复原字节）。Vercel 纯 serverless：优先 rawBody，否则读原始流，最后降级。
async function readRawBody(request) {
  if (request.rawBody) return Buffer.isBuffer(request.rawBody) ? request.rawBody.toString("utf8") : String(request.rawBody);
  if (typeof request.body === "string") return request.body;
  if (Buffer.isBuffer(request.body)) return request.body.toString("utf8");
  try {
    const chunks = [];
    for await (const c of request) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
    if (chunks.length) return Buffer.concat(chunks).toString("utf8");
  } catch { /* 流已被消费 */ }
  return request.body ? JSON.stringify(request.body) : "";
}

// InboundLeadEvent → leads 行（照 public-inquiries.js leadInsert 的列·source=whatsapp）。
function leadFromEvent(ev) {
  const f = ev.fields || {};
  const a = ev.attribution || {};
  const rawMsg = (ev.raw && ev.raw.msg) || {};
  const waId = String(f.wa_id || "").trim();
  const name = String(f["联系人"] || f.profileName || "").trim();
  const company = String(f["公司"] || "").trim();
  const msgText = (rawMsg.text && rawMsg.text.body) || f.message || f["询价项"] || "";
  return {
    source: "whatsapp",
    status: "NEED_REVIEW",
    business_line: "",
    title: (company || name || ("WhatsApp " + waId)) + " · WhatsApp 询盘",
    name,
    company,
    email: String(f["邮箱"] || "").trim(),
    whatsapp: waId,
    country: String(f["国家地区"] || "").trim(),
    score: 0,
    summary: String(msgText).slice(0, 2000),
    missing_info: [],
    metadata: {
      created_from: "api/inbound/whatsapp",
      manual_review_required: true,
      channel: "whatsapp",
      external_verified: false,
      ctwa_clid: a.clickId || "",
      source_ad_id: a.adId || "",
      ad_headline: a.headline || "",
      wa_message_id: String(rawMsg.id || ev.dedupKey || ""),
      received_at: ev.receivedAt || new Date().toISOString(),
    },
  };
}

module.exports = async function handler(request, response) {
  // —— GET：Meta 订阅验证握手 ——
  if (request.method === "GET") {
    const { parseVerifyChallenge } = await import("../../lib/whatsapp/webhook.js");
    const q = request.query || {};
    const v = parseVerifyChallenge(q, process.env.WHATSAPP_VERIFY_TOKEN || "");
    if (v.ok) { response.status(200).send(String(v.challenge)); return; }
    sendJson(response, 403, { ok: false, error: "verify_token mismatch or mode not subscribe" });
    return;
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  // —— POST：验签 → 归一 → 落云 leads ——
  try {
    const raw = await readRawBody(request);
    const { verifyMetaSignature } = await import("../../lib/whatsapp/webhook.js");
    const sig = verifyMetaSignature(raw, request.headers["x-hub-signature-256"], process.env.WHATSAPP_APP_SECRET || "");
    // 生产【强制验签】：没配 app secret（reason:no-secret）或签名不符一律拒——防伪造 payload 冒充你的号码。
    if (!sig.ok) { sendJson(response, 401, { ok: false, error: "signature verification failed (" + (sig.reason || "mismatch") + ")" }); return; }

    let payload = {};
    try { payload = raw ? JSON.parse(raw) : {}; } catch { sendJson(response, 200, { ok: false, error: "bad json" }); return; }

    const { makeWhatsappAdapter } = await import("../../adapters/channel/whatsapp.js");
    const out = makeWhatsappAdapter().receiveWebhook(payload);
    if (!out.ok) { sendJson(response, 200, { ok: false, error: out.error }); return; }

    const supabase = getSupabaseAdminClient();
    let ingested = 0;
    for (const ev of out.events) {
      const row = leadFromEvent(ev);
      if (!row.whatsapp && !row.name && !row.company) continue; // 无可识别客户·跳过
      // 同号查重（source=whatsapp + whatsapp=wa_id）：有则刷新·无则新建（单租户·leads 无 org_id）。
      const { data: existing } = await supabase
        .from("leads").select("*").eq("source", "whatsapp").eq("whatsapp", row.whatsapp)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (existing) {
        await supabase.from("leads").update({
          status: "NEED_REVIEW",
          summary: row.summary || existing.summary,
          metadata: { ...(existing.metadata || {}), last_wa_at: row.metadata.received_at, manual_review_required: true },
        }).eq("id", existing.id);
      } else {
        await supabase.from("leads").insert(row);
      }
      ingested++;
    }
    // Meta 要求快速 2xx ACK。
    sendJson(response, 200, { ok: true, ingested, safety_boundary: "Manual review required. No automatic WhatsApp reply sent; no quotation/price/PI." });
  } catch (error) {
    console.error("whatsapp webhook failed", { message: error && error.message });
    // Meta 要 2xx（否则重试风暴）；内部错记 console 不外泄。
    sendJson(response, 200, { ok: true, note: "received" });
  }
};
