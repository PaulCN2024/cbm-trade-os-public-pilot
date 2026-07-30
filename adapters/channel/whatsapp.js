// adapters/channel/whatsapp — WhatsAppAdapter（Meta WhatsApp Cloud API·第 4 个 Channel Adapter）· WhatsApp 获客对接·块A
// ============================================================================
// 【范式】照 CsvAdapter/FacebookAdapter：webhook payload → normalize → InboundLeadEvent[]（不落库·送 Inbox 是 Gateway 的事）。
// 【委托现有·零重写】复用 lib/meta-leadgen 的 normalizeCtwaMessage + ctwaReferralToAttribution（CTWA 归因·referral→ctwa_clid/ad_id/headline/body）。
// 【依赖·分层】adapters 层：只 import contracts(makeInboundLeadEvent) + lib(meta-leadgen)·【禁 import platform】——只归一返回 events，送 Inbox 是 Gateway 的事。
// 【CTWA 广告归因】Click-to-WhatsApp 广告点进来的首条消息带 referral → 和独立站表单 fbclid 一路进 ROI。
// 【就消息归一·不落库】WhatsApp 是来回消息流：本 Adapter 只把每条到达消息归一成事件；AI 抽线索/人确认在后续块 C。
// ============================================================================
import { normalizeCtwaMessage, ctwaReferralToAttribution, metaLeadProvenance } from '../../lib/meta-leadgen.js';
import { makeInboundLeadEvent } from '../../contracts/events/inbound-lead-event.js';

const s = (v, n) => (v == null ? '' : String(v).slice(0, n || 200));

// Meta WhatsApp webhook payload → [{msg, contact}]（entry[].changes[].value.messages[] + contacts[]·按 wa_id 配对联系人）。
export function extractWhatsappMessages(payload) {
  const out = [];
  for (const entry of (payload && payload.entry) || []) {
    for (const ch of (entry.changes || [])) {
      const v = (ch && ch.value) || {};
      const contacts = v.contacts || [];
      for (const m of (v.messages || [])) {
        const contact = contacts.find((c) => c.wa_id === m.from) || contacts[0] || {};
        out.push({ msg: m, contact });
      }
    }
  }
  return out;
}

// 一条 WhatsApp 消息 → InboundLeadEvent（委托 normalizeCtwaMessage 归一 + CTWA 广告归因）。
function messageToEvent(msg, contact, source) {
  const lead = normalizeCtwaMessage(msg, contact);            // meta lead 格式（fields 中文键 + attribution）
  const ref = ctwaReferralToAttribution(msg.referral || {});  // CTWA 广告归因
  const waId = s(contact.wa_id || msg.from, 40);
  const profileName = s((contact.profile && contact.profile.name) || contact.name || '', 80);
  const uid = (metaLeadProvenance(lead) || {}).lead_uid || '';
  const fields = Object.assign({}, lead.fields);
  if (profileName && !fields['联系人']) fields['联系人'] = profileName;
  fields.wa_id = waId; fields.profileName = profileName;
  return makeInboundLeadEvent({
    channel: 'whatsapp',
    source: source || 'whatsapp:CBM Global',
    attribution: { adId: ref.ad_id, clickId: ref.ctwa_clid, headline: ref.headline, body: ref.body },   // CTWA 归因
    fields,
    raw: { msg, contact },
    dedupKey: uid || (waId + ':' + s(msg.id || msg.wamid, 80)),   // wa_id + message_id 幂等
    receivedAt: msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : undefined,
  });
}

/**
 * @param {object} [opts] { source }  来源标识（来源注册表反查·未建则缺省 'whatsapp:CBM Global'）
 */
export function makeWhatsappAdapter(opts = {}) {
  const source = opts.source || 'whatsapp:CBM Global';   // 来源注册表(每号一条·定 org)未落·缺省 CBM Global
  return {
    channel: 'whatsapp',
    // 推型：Meta WhatsApp Cloud API webhook payload → InboundLeadEvent[]（CTWA 广告归因贯穿）。
    receiveWebhook(payload) {
      try {
        const events = extractWhatsappMessages(payload).map(({ msg, contact }) => messageToEvent(msg, contact, source));
        return { ok: true, events };
      } catch (e) { return { ok: false, error: 'WhatsApp webhook 归一失败：' + String((e && e.message) || e), events: [] }; }
    },
    pullLeads() { return { ok: false, error: 'WhatsAppAdapter 是推型(webhook)·无 pullLeads', events: [] }; },
    importCsv() { return { ok: false, error: 'WhatsAppAdapter 无 CSV 导入', events: [] }; },
  };
}
