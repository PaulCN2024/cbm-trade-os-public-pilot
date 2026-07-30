// contracts/events/inbound-lead-event — 统一入站线索事件 schema · 地基季·第三刀 B4-1。
// ============================================================================
// 纯 schema/类型（contracts 层·无副作用·无跨层 import）·各层共享。先只定 Lead 事件；消息/邮件事件后续扩。
// 宪法 §9 入站链路：Webhook → Inbox → Normalize → Dedupe → Policy → Human Review。本 schema 是「到达事件」的标准信封。
// 外部入站（Meta lead / WhatsApp / Gmail / 未来 TikTok/Google）统一归一成 InboundLeadEvent，经 platform/events Inbox 处理。
// ============================================================================

export const INBOUND_CHANNELS = ['facebook', 'tiktok', 'google', 'whatsapp', 'gmail', 'manual', 'website'];

/**
 * @typedef {Object} InboundAttribution
 * @property {string} [campaignId]  广告系列 id
 * @property {string} [adId]        广告 id
 * @property {string} [formId]      即时表单 id
 * @property {string} [clickId]     点击 id（ctwa_clid / fbclid 等）
 *
 * @typedef {Object} InboundLeadEvent
 * @property {string} channel     来源渠道（INBOUND_CHANNELS 之一）
 * @property {string} source      具体来源标识（表单 id / 会话 id）
 * @property {InboundAttribution} attribution  广告归因（算 ROI 用·一路带到成交）
 * @property {Object} fields      normalize 后的标准字段（公司/国家/邮箱/电话/需求）
 * @property {any}    raw         原始 payload（留痕）
 * @property {string} dedupKey    去重键（lead_uid / message_id / stanza_id）
 * @property {string} receivedAt  ISO 时间戳
 */

const s = (v, n) => (v == null ? '' : String(v).slice(0, n || 200));

/** 构造标准入站线索事件。fields 由调用方喂 normalize 结果（Inbox 委托现有 normalizer 产出·此处不重写归一逻辑）。 */
export function makeInboundLeadEvent(input) {
  input = input || {};
  const a = input.attribution || {};
  return {
    channel: INBOUND_CHANNELS.includes(input.channel) ? input.channel : 'manual',
    source: s(input.source, 120),
    attribution: {
      campaignId: s(a.campaignId, 60), adId: s(a.adId, 60), formId: s(a.formId, 60), clickId: s(a.clickId, 120),
      headline: s(a.headline, 200), body: s(a.body, 300),   // Click-to-WhatsApp 广告文案（referral 带·辅助归因·和 fbclid 一路进 ROI）
    },
    fields: input.fields && typeof input.fields === 'object' ? input.fields : {},
    raw: input.raw != null ? input.raw : null,
    dedupKey: s(input.dedupKey, 160),
    receivedAt: input.receivedAt || new Date().toISOString(),
  };
}

/** 校验事件（返回缺陷数组·空=合法）。Inbox.receive 前置校验用。 */
export function validateInboundLeadEvent(event) {
  if (!event || typeof event !== 'object') return ['event 非对象'];
  const errs = [];
  if (!event.channel || !INBOUND_CHANNELS.includes(event.channel)) errs.push('channel 非法：' + (event.channel || '空'));
  if (!event.fields || typeof event.fields !== 'object') errs.push('缺 fields');
  if (!event.dedupKey) errs.push('缺 dedupKey（去重必需）');
  return errs;
}
