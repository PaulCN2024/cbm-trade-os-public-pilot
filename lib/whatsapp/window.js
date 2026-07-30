// lib/whatsapp/window — WhatsApp 客服消息窗口（纯逻辑·无 IO·可 A 轨单测）· WhatsApp 获客·块C
// ============================================================================
// WhatsApp 官方规则：CTWA（Click-to-WhatsApp 广告）来的对话有 72h 免费回复窗；普通用户主动发起 24h 客服窗。
// 超窗只能发【审批过的模板消息】（不能自由文本）——CBM 就地提醒别拖过窗口。now 作参数传入（不调当前时间·纯函数可测）。
// ============================================================================
const H = 3600 * 1000;

// opts: { firstMsgAt(ISO), isCtwa(bool), now(ISO|ms) } → { kind, hours, expiresAt, remainingMs, expired, warnSoon, ok }
export function whatsappWindow(opts) {
  const o = opts || {};
  const isCtwa = !!o.isCtwa;
  const hours = isCtwa ? 72 : 24;
  const kind = isCtwa ? 'ctwa' : 'standard';
  const firstMs = o.firstMsgAt ? Date.parse(o.firstMsgAt) : NaN;
  if (!Number.isFinite(firstMs)) return { kind, hours, ok: false, error: '无首条消息时间' };
  const expiresMs = firstMs + hours * H;
  const expiresAt = new Date(expiresMs).toISOString();
  const now = o.now == null ? NaN : (typeof o.now === 'number' ? o.now : Date.parse(o.now));
  if (!Number.isFinite(now)) return { kind, hours, expiresAt, ok: true };   // 未给 now：只算到期时刻
  const remainingMs = expiresMs - now;
  return {
    kind, hours, expiresAt, remainingMs,
    expired: remainingMs <= 0,
    warnSoon: remainingMs > 0 && remainingMs <= 4 * H,   // 剩 ≤4h 就地提醒
    ok: true,
  };
}
