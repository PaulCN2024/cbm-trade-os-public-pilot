// api/inbound — 获客统一入口（WhatsApp webhook + 独立站表单合一 · 上云最小切口 · 块B）
// ============================================================================
// 一个 serverless function 处理两种入站（Hobby plan 12-function 上限·合并省额度）：
//   GET                        → Meta WhatsApp 订阅验证握手（hub.verify_token → 回显 challenge）
//   POST + Meta 签名/entry     → WhatsApp 消息（X-Hub-Signature-256 强制验签 → 归一 → 落 leads）
//   POST + 表单                → 独立站表单（可选 x-cbm-secret → normalizeWebsiteLead fbclid/utm → 落 leads）
// 【范式】照 api/public-inquiries.js：CJS handler·getSupabaseAdminClient·leads 查重 upsert·NEED_REVIEW·manual_review_required·不自动发·safety_boundary。
// 【ESM 混用】lib/* 是 ESM——handler 内 await import（禁顶层 require）。
// 【红线】外部未核实·AI 不自动回复·WhatsApp 强制验签防伪造·线索进 NEED_REVIEW 待人确认。
// 【多租户·2026-08-07】配了 CBM_ORG_ID 即进多租户模式（目标库 cbm-prod）：落库带 org_id + dstatus='pending' + provenance。
//   不配则保持原单租户行为（旧库 leads 无 org_id/dstatus 列，硬写会报 column does not exist）——两种库都能跑。
// ============================================================================
const { getSupabaseAdminClient, parseBody, sendJson } = require("./_supabase");

// —— 多租户装配（只在配了 CBM_ORG_ID 时生效） ——
// 【为什么必须显式写 dstatus】cbm-prod 的 leads.dstatus 默认是 'confirmed'，而系统的待拍板列表读的是
//   dstatus='pending'（domains/lead listPending）。不显式写 'pending'，网站线索会以「已确认」落库、
//   直接跳过待拍板队列——人确认铁律当场破掉，且没有任何报错。旧库没这列，所以只在多租户模式下加。
const orgId = () => String(process.env.CBM_ORG_ID || "").trim();
function withTenant(row, leadUid) {
  const oid = orgId();
  if (!oid) return row;                                  // 单租户模式：原样（兼容旧库）
  return Object.assign({}, row, {
    org_id: oid,
    dstatus: "pending",                                  // 入站即待拍板·人确认才 confirmed（红线）
    kind: "lead",
    basis: row.source || "",
    provenance: {
      external: true, verified: false,                   // 外部来源·未核实
      channel: (row.metadata && row.metadata.channel) || row.source || "",
      lead_uid: leadUid || (row.metadata && row.metadata.lead_uid) || "",
    },
  });
}

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
// 库写错误统一打 dbError 标记：让 handler catch 区分"库挂(应让 Meta 重投)"vs"验签/解析错(可安全 2xx ACK)"。
function dbErr(msg) { const e = new Error(msg); e.dbError = true; return e; }
async function upsertLead(supabase, row, dedupCol) {
  const key = row[dedupCol];
  let existing = null;
  if (key) {
    let q = supabase.from("leads").select("*").eq("source", row.source).eq(dedupCol, key);
    if (orgId()) q = q.eq("org_id", orgId());   // 多租户：查重必须限定本 org，否则会跨租户误判重复
    const r = await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (r.error) throw dbErr("leads 查重失败：" + (r.error.message || r.error));   // 修：查重失败不再静默吞（否则库挂时误判"无重复"）
    existing = r.data;
  }
  if (existing) {
    const u = await supabase.from("leads").update({
      status: "NEED_REVIEW",
      summary: row.summary || existing.summary,
      metadata: { ...(existing.metadata || {}), ...row.metadata, manual_review_required: true },
    }).eq("id", existing.id);
    if (u.error) throw dbErr("leads 更新失败：" + (u.error.message || u.error));   // 修
  } else {
    const i = await supabase.from("leads").insert(row);
    if (i.error) throw dbErr("leads 落库失败：" + (i.error.message || i.error));   // 修：落库失败真抛错→handler 感知（不再"假成功"静默丢线索）
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
    const q = request.query || {};
    // —— 保活 + 健康：无需 token·只戳一下库(select id limit 1)·不返回任何线索·给免费库制造活动防 7 天不活动自动暂停(本次故障根因)。定时任务每 3 天调·不健康返 503→触发告警。——
    if (q.action === "ping") {
      const sbUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
      const sbKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
      if (!sbUrl || !sbKey) { sendJson(response, 200, { ok: false, healthy: false, error: "no supabase config" }); return; }
      try {
        const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 6500);
        const r = await fetch(sbUrl + "/rest/v1/leads?select=id&limit=1", { headers: { apikey: sbKey, Authorization: "Bearer " + sbKey, Accept: "application/json" }, signal: ctrl.signal });
        clearTimeout(timer);
        sendJson(response, r.ok ? 200 : 503, { ok: r.ok, healthy: r.ok, status: r.status });
      } catch (e) { sendJson(response, 503, { ok: false, healthy: false, error: String((e && e.cause && e.cause.code) || (e && e.message) || e) }); }
      return;
    }
    // —— 一次性清理：删测试线索（company 前缀 ZZ-/CLOUD-TEST、name 含 Cloud Test）。凭 token·维护用·有 or 过滤(绝不裸删全表)。——
    if (q.action === "purge_test") {
      const want = String(process.env.CBM_EXPORT_TOKEN || "");
      const got = String(q.token || request.headers["x-cbm-export-token"] || "");
      if (!want || got !== want) { sendJson(response, 401, { ok: false, error: "token mismatch" }); return; }
      const sbUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
      const sbKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
      try {
        const delUrl = sbUrl + "/rest/v1/leads?or=(company.like.ZZ-*,company.like.CLOUD-TEST*,name.like.Cloud*Test*)";
        const r = await fetch(delUrl, { method: "DELETE", headers: { apikey: sbKey, Authorization: "Bearer " + sbKey, Prefer: "return=representation", Accept: "application/json" } });
        const txt = await r.text();
        let deleted = []; try { deleted = JSON.parse(txt); } catch (pe) {}
        sendJson(response, 200, { ok: r.ok, status: r.status, deletedCount: Array.isArray(deleted) ? deleted.length : 0 });
      } catch (e) { sendJson(response, 200, { ok: false, error: String((e && e.message) || e) }); }
      return;
    }
    // —— 桌面回写：人在桌面处理完云线索后·标记这条已处理(status NEED_REVIEW→CONFIRMED/QUOTED)·免 export 再拉回。凭 token·id 精确(绝不批量改)·status 白名单。——
    if (q.action === "confirm") {
      const want = String(process.env.CBM_EXPORT_TOKEN || "");
      const got = String(q.token || request.headers["x-cbm-export-token"] || "");
      if (!want || got !== want) { sendJson(response, 401, { ok: false, error: "token mismatch" }); return; }
      const id = String(q.id || "");
      const status = /^(CONFIRMED|QUOTED)$/.test(String(q.status || "")) ? String(q.status) : "CONFIRMED";
      if (!id) { sendJson(response, 200, { ok: false, error: "missing id" }); return; }
      const sbUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
      const sbKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
      try {
        const r = await fetch(sbUrl + "/rest/v1/leads?id=eq." + encodeURIComponent(id), {
          method: "PATCH",
          headers: { apikey: sbKey, Authorization: "Bearer " + sbKey, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({ status }),
        });
        const txt = await r.text(); let rows = []; try { rows = JSON.parse(txt); } catch (pe) {}
        sendJson(response, r.ok ? 200 : 503, { ok: r.ok, status: r.status, updated: Array.isArray(rows) ? rows.length : 0 });
      } catch (e) { sendJson(response, 503, { ok: false, error: String((e && e.message) || e) }); }
      return;
    }
    // —— 广告 ROI 统计：按渠道/站点/广告系列聚合线索数 + 转化数(CONFIRMED/QUOTED)。凭 token·只读·云端聚合(不吐明细·省传输+隐私)。——
    if (q.action === "stats") {
      const want = String(process.env.CBM_EXPORT_TOKEN || "");
      const got = String(q.token || request.headers["x-cbm-export-token"] || "");
      if (!want || got !== want) { sendJson(response, 401, { ok: false, error: "token mismatch" }); return; }
      const sbUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
      const sbKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
      try {
        const r = await fetch(sbUrl + "/rest/v1/leads?select=source,status,metadata&limit=5000", { headers: { apikey: sbKey, Authorization: "Bearer " + sbKey, Accept: "application/json" } });
        if (!r.ok) { sendJson(response, 503, { ok: false, error: "supabase HTTP " + r.status }); return; }
        const data = await r.json();
        const byStatus = {}, byChannel = {}, bySite = {}, byCampaign = {};
        const bump = (obj, key, processed) => { if (!key) return; obj[key] = obj[key] || { total: 0, processed: 0 }; obj[key].total++; if (processed) obj[key].processed++; };
        for (const row of (Array.isArray(data) ? data : [])) {
          const st = row.status || "NEED_REVIEW";
          byStatus[st] = (byStatus[st] || 0) + 1;
          const done = st !== "NEED_REVIEW";   // 非待复核=已推进(涵盖 CONFIRMED/QUOTED 及真实业务态 QUALIFYING/CONVERTED_TO_CUSTOMER 等)
          const m = row.metadata || {};
          bump(byChannel, m.channel || row.source || "unknown", done);
          bump(bySite, m.site || "", done);
          bump(byCampaign, m.utm_campaign || "", done);
        }
        const toArr = (obj) => Object.entries(obj).map(([k, v]) => ({ key: k, total: v.total, processed: v.processed })).sort((a, b) => b.total - a.total);
        sendJson(response, 200, { ok: true, total: (Array.isArray(data) ? data.length : 0), byStatus, byChannel: toArr(byChannel), bySite: toArr(bySite), byCampaign: toArr(byCampaign) });
      } catch (e) { sendJson(response, 503, { ok: false, error: String((e && e.cause && e.cause.code) || (e && e.message) || e) }); }
      return;
    }
    // —— 桌面只读导出：凭 CBM_EXPORT_TOKEN 拉待复核线索（复用 GET·不加新 function·避 Hobby 12 上限）。只读·service_role 不出云。——
    // 用原生 fetch 直连 Supabase REST（绕 supabase-js·可控超时/重试/拿到真 cause）：观察到 serverless 里 supabase-js 的 select 稳定 8s "fetch failed"（insert 却成功）·换原生 fetch + 重试 + 暴露 cause 定位。
    if (q.action === "export") {
      const want = String(process.env.CBM_EXPORT_TOKEN || "");
      const got = String(q.token || request.headers["x-cbm-export-token"] || "");
      if (!want || got !== want) { sendJson(response, 401, { ok: false, error: "export token mismatch" }); return; }
      const sbUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
      const sbKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
      if (!sbUrl || !sbKey) { sendJson(response, 200, { ok: false, error: "missing supabase url/key", items: [] }); return; }
      const restUrl = sbUrl + "/rest/v1/leads?select=*&status=eq.NEED_REVIEW&order=id.desc&limit=200";
      let dnsInfo = "";
      try { const dnsp = require("dns").promises; const a = await dnsp.lookup(new URL(sbUrl).host); dnsInfo = "ok " + a.address; } catch (de) { dnsInfo = "ERR " + (de && (de.code || de.message)); }
      let lastErr = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 6500);
          const r = await fetch(restUrl, { headers: { apikey: sbKey, Authorization: "Bearer " + sbKey, Accept: "application/json" }, signal: ctrl.signal });
          clearTimeout(timer);
          const txt = await r.text();
          if (!r.ok) { lastErr = "supabase HTTP " + r.status + ": " + txt.slice(0, 180); continue; }
          let items = []; try { items = JSON.parse(txt); } catch (pe) { lastErr = "bad json from supabase"; continue; }
          sendJson(response, 200, { ok: true, count: items.length, items });
          return;
        } catch (e) {
          const cause = e && e.cause ? (e.cause.code || e.cause.message || String(e.cause)) : "";
          lastErr = (e && e.name) + ": " + (e && e.message) + (cause ? (" | cause=" + cause) : "");
          console.error("export attempt " + attempt + " failed:", lastErr);
        }
      }
      let dbgHost = ""; try { dbgHost = new URL(sbUrl).host; } catch (ue) { dbgHost = "BADURL"; }
      sendJson(response, 200, { ok: false, error: lastErr || "export failed after retries", items: [], debug: { host: dbgHost, rawUrlLen: String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").length, dns: dnsInfo } });
      return;
    }
    const { parseVerifyChallenge } = await import("../lib/whatsapp/webhook.js");
    const v = parseVerifyChallenge(q, process.env.WHATSAPP_VERIFY_TOKEN || "");
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
        const row = withTenant(leadFromWaEvent(ev), String((ev.raw && ev.raw.msg && ev.raw.msg.id) || ev.dedupKey || ""));
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
    const row = withTenant(leadFromWebsite(lead), lead.lead_uid || "");
    await upsertLead(supabase, row, "email");
    sendJson(response, 200, { ok: true, channel: row.source, safety_boundary: "Manual review required. No automatic message; no quotation/price/PI." });
  } catch (error) {
    console.error("inbound failed", { message: error && error.message, wa: isWhatsapp, db: !!(error && error.dbError) });
    // WhatsApp：非库错误(验签/解析)可安全 2xx ACK(重投也无用·免 Meta 重试风暴)；但【库写错误】必须回非 2xx→让 Meta 重投(upsertLead 按 source+whatsapp 查重·重投幂等·不重复插)·否则库挂时 WhatsApp 线索永久丢(③扫描高危发现·补 upsertLead 修复在 WhatsApp 路径的盲点)。
    if (isWhatsapp && !(error && error.dbError)) { sendJson(response, 200, { ok: true, note: "received" }); }
    else if (isWhatsapp) { sendJson(response, 503, { ok: false, error: "db write failed, please retry" }); }
    else sendJson(response, 500, { ok: false, error: "submission failed" });
  }
};
