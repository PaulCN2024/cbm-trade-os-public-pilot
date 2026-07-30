// api/inbound — 获客统一入口（WhatsApp webhook + 独立站表单合一 · 上云最小切口 · 块B）
// ============================================================================
// 一个 serverless function 处理两种入站（Hobby plan 12-function 上限·合并省额度）：
//   GET                        → Meta WhatsApp 订阅验证握手（hub.verify_token → 回显 challenge）
//   POST + Meta 签名/entry     → WhatsApp 消息（X-Hub-Signature-256 强制验签 → 归一 → 落 leads）
//   POST + 表单                → 独立站表单（可选 x-cbm-secret → normalizeWebsiteLead fbclid/utm → 落 leads）
// 【范式】照 api/public-inquiries.js：CJS handler·getSupabaseAdminClient·leads 查重 upsert·NEED_REVIEW·manual_review_required·不自动发·safety_boundary。
// 【ESM 混用】lib/* 是 ESM——handler 内 await import（禁顶层 require）。
// 【红线】外部未核实·AI 不自动回复·WhatsApp 强制验签防伪造·线索进 NEED_REVIEW 待人确认。
// 【单租户】leads 无 org_id；按站分 org_id + 来源注册表下一步。
// ============================================================================
const { getSupabaseAdminClient, parseBody, sendJson } = require("./_supabase");

// 原始请求体字节（WhatsApp 验签必需）。Vercel 纯 serverless：优先 rawBody，否则读流，最后降级。
async function readRawBody(request) {
  if (request.rawBody) return Buffer.isBuffer(request.rawBody) ? request.rawBody.toString("utf8") : String(request.rawBody);
  if (typeof request.body === "string") return request.body;
  if (Buffer.isBuffer(request.body)) return request.body.toString("utf8");
  try { const chunks = []; for await (const c of request) chunks.push(typeof c === "string" ? Buffer.from(c) : c); if (chunks.length) return Buffer.concat(chunks).toString("utf8"); } catch { /* 流已消费 */ }
  return request.body ? JSON.stringify(request.body) : "";
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type, x-cbm-secret, x-hub-signature-256");
  response.setHeader("Access-Control-Max-Age", "86400");
}

// leads 查重 upsert（dedupCol=whatsapp 或 email；单租户·无 org_id）。
async function upsertLead(supabase, row, dedupCol) {
  const key = row[dedupCol];
  let existing = null;
  if (key) {
    const r = await supabase.from("leads").select("*").eq("source", row.source).eq(dedupCol, key)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    existing = r.data;
  }
  if (existing) {
    await supabase.from("leads").update({
      status: "NEED_REVIEW",
      summary: row.summary || existing.summary,
      metadata: { ...(existing.metadata || {}), ...row.metadata, manual_review_required: true },
    }).eq("id", existing.id);
  } else {
    await supabase.from("leads").insert(row);
  }
}

// WhatsApp InboundLeadEvent → leads 行。
function leadFromWaEvent(ev) {
  const f = ev.fields || {};
  const a = ev.attribution || {};
  const rawMsg = (ev.raw && ev.raw.msg) || {};
  const waId = String(f.wa_id || "").trim();
  const name = String(f["联系人"] || f.profileName || "").trim();
  const company = String(f["公司"] || "").trim();
  const msgText = (rawMsg.text && rawMsg.text.body) || f.message || f["询价项"] || "";
  return {
    source: "whatsapp", status: "NEED_REVIEW", business_line: "",
    title: (company || name || ("WhatsApp " + waId)) + " · WhatsApp 询盘",
    name, company, email: String(f["邮箱"] || "").trim(), whatsapp: waId,
    country: String(f["国家地区"] || "").trim(), score: 0,
    summary: String(msgText).slice(0, 2000), missing_info: [],
    metadata: {
      created_from: "api/inbound", manual_review_required: true, channel: "whatsapp", external_verified: false,
      ctwa_clid: a.clickId || "", source_ad_id: a.adId || "", ad_headline: a.headline || "",
      wa_message_id: String(rawMsg.id || ev.dedupKey || ""), received_at: ev.receivedAt || new Date().toISOString(),
    },
  };
}

// 独立站 normalizeWebsiteLead 结果 → leads 行。
function leadFromWebsite(lead) {
  const f = lead.fields || {};
  const a = lead.attribution || {};
  const name = String(f["联系人"] || "").trim();
  const company = String(f["公司"] || "").trim();
  return {
    source: lead.channel || "website", status: "NEED_REVIEW", business_line: "",
    title: (company || name || "独立站询盘") + " · 网站表单",
    name, company, email: String(f["邮箱"] || "").trim(),
    whatsapp: String(f["WhatsApp"] || f["电话"] || "").trim(),
    country: String(f["国家地区"] || "").trim(), score: 0,
    summary: String(f["询价项"] || f["备注"] || "").slice(0, 2000), missing_info: [],
    metadata: {
      created_from: "api/inbound", manual_review_required: true, channel: lead.channel || "website", external_verified: false,
      site: a.site || "", fbclid: a.fbclid || "", gclid: a.gclid || "",
      utm_source: a.utm_source || "", utm_medium: a.utm_medium || "", utm_campaign: a.utm_campaign || "",
      utm_content: a.utm_content || "", utm_term: a.utm_term || "",
      landing_url: a.landing_url || "", referrer: a.referrer || "", lead_uid: lead.lead_uid || "",
      received_at: new Date().toISOString(),
    },
  };
}

module.exports = async function handler(request, response) {
  // —— GET：WhatsApp 订阅验证握手（不碰库） ——
  if (request.method === "GET") {
    const { parseVerifyChallenge } = await import("../lib/whatsapp/webhook.js");
    const v = parseVerifyChallenge(request.query || {}, process.env.WHATSAPP_VERIFY_TOKEN || "");
    if (v.ok) { response.status(200).send(String(v.challenge)); return; }
    sendJson(response, 403, { ok: false, error: "verify_token mismatch or mode not subscribe" });
    return;
  }
  setCors(response);
  if (request.method === "OPTIONS") { response.status(204).send(""); return; }
  if (request.method !== "POST") { response.setHeader("Allow", "GET, POST, OPTIONS"); sendJson(response, 405, { error: "Method not allowed" }); return; }

  const raw = await readRawBody(request);
  const sigHeader = request.headers["x-hub-signature-256"];
  let parsed = {}; try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
  const isWhatsapp = !!sigHeader || (parsed && Array.isArray(parsed.entry));

  try {
    const supabase = getSupabaseAdminClient();
    if (isWhatsapp) {
      // —— WhatsApp 消息：强制验签 → 归一 → 落 leads ——
      const { verifyMetaSignature } = await import("../lib/whatsapp/webhook.js");
      const sig = verifyMetaSignature(raw, sigHeader, process.env.WHATSAPP_APP_SECRET || "");
      if (!sig.ok) { sendJson(response, 401, { ok: false, error: "signature verification failed (" + (sig.reason || "mismatch") + ")" }); return; }
      const { makeWhatsappAdapter } = await import("../adapters/channel/whatsapp.js");
      const out = makeWhatsappAdapter().receiveWebhook(parsed);
      if (!out.ok) { sendJson(response, 200, { ok: false, error: out.error }); return; }
      let ingested = 0;
      for (const ev of out.events) {
        const row = leadFromWaEvent(ev);
        if (!row.whatsapp && !row.name && !row.company) continue;
        await upsertLead(supabase, row, "whatsapp"); ingested++;
      }
      sendJson(response, 200, { ok: true, channel: "whatsapp", ingested, safety_boundary: "Manual review required. No automatic WhatsApp reply; no quotation/price/PI." });
      return;
    }

    // —— 独立站表单：可选 secret → 归一 → 落 leads ——
    const body = parsed && Object.keys(parsed).length ? parsed : parseBody(request);
    const secret = String(process.env.WEBSITE_INBOUND_SECRET || "");
    if (secret) {
      const got = String(request.headers["x-cbm-secret"] || (body && body.secret) || "");
      if (got !== secret) { sendJson(response, 401, { ok: false, error: "secret mismatch" }); return; }
    }
    if (!body || (!body.email && !body["邮箱"] && !body.company && !body["公司"] && !body.name && !body["联系人"])) {
      sendJson(response, 200, { ok: false, error: "empty form (need company/name/email)" }); return;
    }
    const { normalizeWebsiteLead } = await import("../lib/website-leadgen.js");
    const lead = normalizeWebsiteLead(body, { site: (body && body.site) || "" });
    const row = leadFromWebsite(lead);
    await upsertLead(supabase, row, "email");
    sendJson(response, 200, { ok: true, channel: row.source, safety_boundary: "Manual review required. No automatic message; no quotation/price/PI." });
  } catch (error) {
    console.error("inbound failed", { message: error && error.message, wa: isWhatsapp });
    if (isWhatsapp) sendJson(response, 200, { ok: true, note: "received" });   // Meta 要 2xx 快速 ACK·内部错不外泄
    else sendJson(response, 500, { ok: false, error: "submission failed" });
  }
};
