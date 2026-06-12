import { getAdminSession, publicEnv, requireAdminAuth, signOutAdmin } from "../../lib/admin-auth.js";
import { createEmptyDb, readJson, writeJson } from "../../lib/mock-crm.js";
import { parseCommand } from "../../lib/command-center/command-parser.js";
import { CommandStatus, createCommandPlan, transitionCommandStatus } from "../../lib/command-center/command-planner.js";
import { SafeExecutionModes, executeCommandPlan } from "../../lib/command-center/command-executor.js";
import {
  COMMAND_HISTORY_STORAGE_KEY,
  buildAuditDetailSummary,
  cancelWorkflow,
  closeWorkflow,
  createFollowUpTaskDraft,
  filterAuditRecords,
  generateDocumentDraftChecklist,
  getAuditDetailModel,
  getResumeWorkflowModel,
  markWorkflowStepCompleted,
  normalizeCommandHistoryRecord,
  saveManualReviewNote,
  upsertCommandHistoryRecord,
  summarizeAuditRecords,
  summarizeCommandJourney,
  summarizeWorkflowProgress,
  updateManualReviewStatus,
} from "../../lib/command-center/command-history.js";

const TRADE_OS_STORAGE_KEY = "cbm-trade-os-v2";
const COMMAND_HISTORY_KEY = COMMAND_HISTORY_STORAGE_KEY;

if (!requireAdminAuth()) {
  throw new Error("Admin login required");
}

const examples = [
  "今天有哪些客户要跟进？",
  "分析最新网站询盘。",
  "查一下巴拿马 Kevin 最近的项目和跟进任务。",
  "把这个 lead 转成 customer。",
  "根据这个询盘创建项目。",
  "给 O CLUB HANDRAILS 生成中文生产单草稿。",
  "给 Kevin 的 Celeste4 项目生成 PI 草稿。",
  "生成 Kevin 2026-4 的归档路径。",
];

const commandInput = document.querySelector("#commandInput");
const exampleCommands = document.querySelector("#exampleCommands");
const parsedPreview = document.querySelector("#parsedPreview");
const plannedActions = document.querySelector("#plannedActions");
const missingInfo = document.querySelector("#missingInfo");
const approvalWarning = document.querySelector("#approvalWarning");
const resultCards = document.querySelector("#resultCards");
const resultPreview = document.querySelector("#resultPreview");
const historyList = document.querySelector("#historyList");
const historyFilters = document.querySelector("#historyFilters");
const auditSummary = document.querySelector("#auditSummary");
const auditFilters = document.querySelector("#auditFilters");
const auditList = document.querySelector("#auditList");
const auditDetailPanel = document.querySelector("#auditDetailPanel");
const commandJourney = document.querySelector("#commandJourney");
const resumeWorkspace = document.querySelector("#resumeWorkspace");
const parseButton = document.querySelector("#parseButton");
const previewButton = document.querySelector("#previewButton");
const confirmButton = document.querySelector("#confirmButton");
const executeButton = document.querySelector("#executeButton");
const draftOnlyButton = document.querySelector("#draftOnlyButton");
const approvalCheckbox = document.querySelector("#approvalCheckbox");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const logoutButton = document.querySelector("#logoutButton");
const modePill = document.querySelector("#modePill");

let currentParsed = null;
let currentPlan = null;
let selectedHistoryFilter = "all";
let selectedAuditFilter = "all";
let selectedAuditDetailCommandId = "";
let selectedResumeCommandId = new URLSearchParams(window.location.search).get("command_id") || "";

function loadDb() {
  return createEmptyDb(readJson(TRADE_OS_STORAGE_KEY, {}));
}

function saveDb(db) {
  const existing = readJson(TRADE_OS_STORAGE_KEY, {});
  writeJson(TRADE_OS_STORAGE_KEY, {
    ...existing,
    leads: db.leads,
    customers: db.customers,
    inquiries: db.inquiries,
    architectural_requirements: db.architectural_requirements,
    precision_requirements: db.precision_requirements,
    projects: db.projects,
    quotations: db.quotations,
    orders: db.orders,
    shipments: db.shipments,
    documents: db.documents,
    sellers: db.sellers,
    products: db.products,
    after_sales_cases: db.after_sales_cases,
    follow_up_tasks: db.follow_up_tasks,
    communication_logs: db.communication_logs,
    attachments: db.attachments,
  });
}

function loadHistory() {
  return readJson(COMMAND_HISTORY_KEY, []);
}

function saveHistory(history) {
  writeJson(COMMAND_HISTORY_KEY, history.slice(0, 30));
}

function addHistory(record) {
  const history = loadHistory();
  saveHistory(upsertCommandHistoryRecord(history, {
    command_id: record.command_id || `cmd_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
    ...record,
  }));
}

function renderExamples() {
  exampleCommands.innerHTML = examples
    .map((example) => `<button class="chip" data-command-example="${escapeHtml(example)}" type="button">${escapeHtml(example)}</button>`)
    .join("");
}

function renderParsed(parsed, plan = null) {
  currentParsed = parsed;
  parsedPreview.innerHTML = `
    <p><strong>识别意图:</strong> ${escapeHtml(parsed.intent)}</p>
    <p><strong>业务标签:</strong> ${escapeHtml(toChineseIntentLabel(parsed.intent_label || parsed.intent))}</p>
    <p><strong>置信度:</strong> ${Math.round(parsed.confidence * 100)}%</p>
    <p><strong>识别到的信息:</strong></p>
    <pre>${escapeHtml(JSON.stringify(parsed.entities, null, 2))}</pre>
  `;
  const steps = plan?.plan_steps || parsed.planned_actions;
  const blocked = plan?.blocked_actions?.length ? `<p class="warning-text"><strong>已阻止的高风险动作</strong></p><ul>${plan.blocked_actions.map((item) => `<li>${escapeHtml(toChineseActionLabel(item))}</li>`).join("")}</ul>` : "";
  const executable = plan?.executable_actions?.length ? `<p><strong>可执行的安全动作</strong></p><ul>${plan.executable_actions.map((item) => `<li>${escapeHtml(toChineseActionLabel(item))}</li>`).join("")}</ul>` : "";
  plannedActions.innerHTML = `<ol>${steps.map((item) => `<li>${escapeHtml(toChineseActionLabel(item))}</li>`).join("")}</ol>${blocked}${executable}`;
  missingInfo.innerHTML = parsed.required_missing_info.length
    ? `<ul>${parsed.required_missing_info.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : `<p class="muted">这个 MVP 指令暂未发现必须补充的信息。</p>`;
  approvalWarning.innerHTML = parsed.approval_required
    ? `<p class="warning-text">需要人工审核</p><p><strong>风险等级:</strong> ${escapeHtml(toChineseStatusLabel(parsed.risk_level))}</p><p>最终执行已阻止。当前只能生成草稿或预览。</p><ul>${parsed.approval_reasons.map((item) => `<li>${escapeHtml(toChineseActionLabel(item))}</li>`).join("")}</ul><ul>${safetyBoundaryNotes().map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : `<p class="muted">这个指令可以进入预览、确认和安全的内部执行流程。</p>`;
  updateWorkflowButtons();
}

function renderResultCards(cards = []) {
  resultCards.innerHTML = cards.length
    ? cards.map(renderCard).join("")
    : `<p class="muted">还没有结果卡片。请先解析并预览一个指令。</p>`;
}

function renderCard(card) {
  const fields = card.fields?.length
    ? `<dl class="card-fields">${card.fields.map((field) => `<div><dt>${escapeHtml(toChineseFieldLabel(field.label))}</dt><dd>${escapeHtml(toChineseResultText(field.value))}</dd></div>`).join("")}</dl>`
    : "";
  const missing = card.missing_info?.length ? `<div class="card-section"><strong>缺失信息</strong><ul>${card.missing_info.map((item) => `<li>${escapeHtml(toChineseResultText(item))}</li>`).join("")}</ul></div>` : "";
  const warnings = card.warnings?.length ? `<div class="card-section warning-text"><strong>提醒</strong><ul>${card.warnings.map((item) => `<li>${escapeHtml(toChineseActionLabel(item))}</li>`).join("")}</ul></div>` : "";
  const nextActions = card.next_actions?.length ? `<div class="card-section"><strong>下一步安全动作</strong><ol>${card.next_actions.map((item) => `<li>${escapeHtml(toChineseActionLabel(item))}</li>`).join("")}</ol></div>` : "";
  const links = card.related_links?.length ? `<div class="card-section"><strong>业务链接</strong><div class="card-actions">${card.related_links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(toChineseLinkLabel(link.label))}</a>`).join("")}</div></div>` : "";
  const safeActions = card.safe_actions?.length ? `<div class="card-section"><strong>安全内部动作</strong><div class="card-actions">${card.safe_actions.map((action) => `<button type="button" data-safe-card-action="${escapeHtml(action.action)}">${escapeHtml(toChineseActionLabel(action.label))}</button>`).join("")}</div></div>` : "";
  const blockedActions = card.blocked_actions?.length ? `<div class="card-section warning-text"><strong>已阻止的高风险动作</strong><ul>${card.blocked_actions.map((item) => `<li>${escapeHtml(toChineseActionLabel(item))}</li>`).join("")}</ul></div>` : "";

  return `<article class="result-card ${escapeHtml(card.status)}">
    <div class="result-card-header">
      <div>
        <span class="card-type">${escapeHtml(toChineseCardType(card.card_type))}</span>
        <h3>${escapeHtml(toChineseResultText(card.title))}</h3>
        <p>${escapeHtml(toChineseResultText(card.subtitle || ""))}</p>
      </div>
      <span class="status-pill">${escapeHtml(toChineseStatusLabel(card.status))}</span>
    </div>
    <p>${escapeHtml(toChineseResultText(card.summary || ""))}</p>
    ${card.approval_required ? `<p class="manual-review-banner">需要人工审核</p>` : ""}
    ${fields}
    ${missing}
    ${warnings}
    ${links}
    ${safeActions}
    ${blockedActions}
    ${nextActions}
  </article>`;
}

function renderHistory() {
  const history = loadHistory()
    .map((item) => normalizeCommandHistoryRecord(item))
    .filter(historyMatchesFilter)
    .sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)));
  renderHistoryFilters();
  historyList.innerHTML = history.length
    ? history
        .map(
          (item) => {
            const summary = summarizeWorkflowProgress(item);
            return `<article class="history-item">
            <strong>${escapeHtml(item.raw_command)}</strong>
            <p class="muted">${escapeHtml(item.parsed_intent)} · ${escapeHtml(toChineseStatusLabel(item.status))} · ${item.approval_required ? "需要人工审核" : "安全内部动作"} · ${escapeHtml(item.created_at)}</p>
            <p>${escapeHtml(toChineseResultText(item.result_summary))}</p>
            <p class="muted">进度：已完成 ${summary.completed} / 待处理 ${summary.pending} / 已阻止 ${summary.blocked} · 草稿 ${summary.draft_count} · 更新 ${escapeHtml(summary.updated_at)}</p>
            ${item.draft_references?.length ? `<p class="muted">草稿引用：${item.draft_references.map((draft) => `${escapeHtml(toChineseResultText(draft.draft_type))} · ${escapeHtml(toChineseStatusLabel(draft.status))} · ${escapeHtml(draft.draft_id)}`).join(" | ")}</p>` : ""}
            <div class="history-actions">
              <button type="button" data-resume-command="${escapeHtml(item.command_id)}">继续处理流程</button>
              ${item.resume_link ? `<a href="${escapeHtml(item.resume_link)}">打开目标模块</a>` : ""}
              <button type="button" data-copy-history="${escapeHtml(item.command_id)}">复制摘要</button>
            </div>
          </article>`;
          },
        )
        .join("")
    : `<p class="muted">还没有指令历史。</p>`;
  renderResumeWorkspace();
  renderAuditView();
}

function renderHistoryFilters() {
  const filters = [
    ["all", "全部"],
    ["needs_review", "需要审核"],
    ["in_progress", "处理中"],
    ["completed", "已完成"],
    ["blocked", "已阻止"],
    ["cancelled", "已取消"],
  ];
  historyFilters.innerHTML = filters
    .map(([value, label]) => `<button class="${selectedHistoryFilter === value ? "active" : ""}" data-history-filter="${value}" type="button">${label}</button>`)
    .join("");
}

function historyMatchesFilter(item) {
  if (selectedHistoryFilter === "all") return true;
  if (selectedHistoryFilter === "needs_review") return item.approval_required || item.status === CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW;
  if (selectedHistoryFilter === "in_progress") return ["planned", "previewed", "confirmed", "resumed"].includes(item.status);
  if (selectedHistoryFilter === "completed") return ["completed", "executed"].includes(item.status);
  if (selectedHistoryFilter === "blocked") return item.status === CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW || (item.blocked_actions || []).length > 0;
  if (selectedHistoryFilter === "cancelled") return item.status === "cancelled";
  return true;
}

function renderResumeWorkspace() {
  if (!selectedResumeCommandId) {
    commandJourney.innerHTML = "";
    resumeWorkspace.innerHTML = `<p class="muted">请从指令历史中选择“继续处理流程”，以恢复安全的内部工作流。</p>`;
    return;
  }
  const model = getResumeWorkflowModel(selectedResumeCommandId, loadHistory());
  if (!model.ok) {
    commandJourney.innerHTML = `<div class="warning-text">指令流程总览：${escapeHtml(model.warning)}</div>`;
    resumeWorkspace.innerHTML = `<div class="warning-text">${escapeHtml(model.warning)}</div>`;
    return;
  }
  const record = model.record;
  const summary = model.progress_summary;
  renderCommandJourney(model);
  resumeWorkspace.innerHTML = `
    <article class="resume-card">
      <div class="resume-head">
        <div>
          <span class="card-type">command_id: ${escapeHtml(model.command_id)}</span>
          <h3>${escapeHtml(model.original_command)}</h3>
          ${record.approval_required ? `<p class="manual-review-banner">需要人工审核</p>` : ""}
          <p class="muted">${escapeHtml(model.parsed_intent)} · ${escapeHtml(toChineseStatusLabel(model.command_status))}</p>
          <p><strong>进度摘要:</strong> 已完成 ${summary.completed} / 待处理 ${summary.pending} / 已阻止 ${summary.blocked} · 草稿 ${summary.draft_count} · 更新 ${escapeHtml(summary.updated_at)}</p>
          <p><strong>关联业务对象:</strong> ${model.business_object_refs.length} 个关联业务对象</p>
          <p><strong>草稿状态:</strong> ${escapeHtml(toChineseStatusLabel(record.review_status))} · <span class="muted">仅内部使用，不会发送给客户</span></p>
          <p><strong>下一步安全动作:</strong> ${escapeHtml(toChineseActionLabel(model.journey_summary?.safe_next_action || model.safe_next_actions[0] || "Review workflow."))}</p>
        </div>
        <div class="card-actions">
          <button type="button" data-copy-history="${escapeHtml(model.command_id)}">复制流程摘要</button>
          <button type="button" data-resume-action="draft-follow-up" data-command-id="${escapeHtml(model.command_id)}">创建跟进任务草稿</button>
          <button type="button" data-resume-action="document-checklist" data-command-id="${escapeHtml(model.command_id)}">生成单据草稿检查清单</button>
          <button type="button" data-resume-review-status="review_pending" data-command-id="${escapeHtml(model.command_id)}">标记为待审核</button>
          <button type="button" data-resume-review-status="reviewed" data-command-id="${escapeHtml(model.command_id)}">标记为已内部审核</button>
          <button type="button" data-resume-action="cancel" data-command-id="${escapeHtml(model.command_id)}">取消流程</button>
          <button type="button" data-resume-action="close" data-command-id="${escapeHtml(model.command_id)}" ${record.approval_required ? "disabled" : ""}>关闭流程</button>
        </div>
      </div>
      <div class="review-note-box">
        <label for="manualReviewNote">审核备注 <span>仅内部使用，不会发送给客户</span></label>
        <textarea id="manualReviewNote" data-review-note-input="${escapeHtml(model.command_id)}" rows="3" placeholder="记录人工审核意见、缺失信息或下一步内部处理说明。">${escapeHtml(record.manual_review_note || "")}</textarea>
        <button type="button" data-resume-action="save-review-note" data-command-id="${escapeHtml(model.command_id)}">保存审核备注</button>
      </div>
      <div class="resume-grid">
        <div>
          <h4>流程进度</h4>
          <ol class="progress-list">
            ${record.workflow_progress.map((step) => `
              <li>
                <span class="status-pill ${escapeHtml(step.status)}">${escapeHtml(toChineseStatusLabel(step.status))}</span>
                <span>${escapeHtml(toChineseActionLabel(step.label))}</span>
                ${step.status === "pending" ? `<button type="button" data-resume-step-complete="${escapeHtml(step.step_id)}" data-command-id="${escapeHtml(model.command_id)}">标记步骤完成</button>` : ""}
              </li>
            `).join("")}
          </ol>
        </div>
        <div>
          <details open>
            <summary>草稿引用 (${model.draft_references.length})</summary>
            ${model.draft_references.length ? `<ul>${model.draft_references.map((draft) => `<li>${escapeHtml(toChineseResultText(draft.draft_type || "draft"))} · ${escapeHtml(toChineseStatusLabel(draft.review_status || draft.status || "draft_only"))} · ${escapeHtml(draft.draft_id || "")}</li>`).join("")}</ul>` : `<p class="muted">暂无草稿引用。</p>`}
          </details>
          <details open>
            <summary>单据草稿检查清单 (${record.document_draft_checklist?.length || 0})</summary>
            ${record.document_draft_checklist?.length ? `<ul>${record.document_draft_checklist.map((item) => `<li>${escapeHtml(item.label)} · ${escapeHtml(toChineseStatusLabel(item.status))}</li>`).join("")}</ul>` : `<p class="muted">尚未生成检查清单。</p>`}
          </details>
          <details>
            <summary>安全动作结果 (${record.safe_action_results?.length || 0})</summary>
            ${record.safe_action_results?.length ? `<ul>${record.safe_action_results.map((item) => `<li>${escapeHtml(toChineseResultText(item.result_summary || item.action))}</li>`).join("")}</ul>` : `<p class="muted">暂无安全动作结果。</p>`}
          </details>
          <details>
            <summary>预览卡片 (${model.preview_cards.length})</summary>
            ${model.preview_cards.length ? model.preview_cards.map((card) => `<p><strong>${escapeHtml(toChineseResultText(card.title || card.card_type))}</strong><br><span class="muted">${escapeHtml(toChineseStatusLabel(card.status || ""))}</span></p>`).join("") : `<p class="muted">暂无已保存的预览卡片。</p>`}
          </details>
        </div>
        <div>
          <h4>关联业务对象</h4>
          <div class="impact-list">
            ${model.business_object_refs.length ? model.business_object_refs.map((ref) => `
              <article class="impact-card">
                <span class="card-type">${escapeHtml(toChineseCardType(ref.type))}</span>
                <strong>${escapeHtml(toChineseResultText(ref.label))}</strong>
                <p class="muted">${escapeHtml(toChineseStatusLabel(ref.status))} · ${ref.manual_review_required ? "需要人工审核" : "内部引用"}</p>
                ${ref.href ? `<a href="${escapeHtml(ref.href)}">打开关联模块</a>` : ""}
              </article>
            `).join("") : `<p class="muted">暂未记录关联业务对象。</p>`}
          </div>
          <h4>目标链接</h4>
          <div class="card-actions">${(model.handoff_links?.length ? model.handoff_links : model.target_links).map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(toChineseLinkLabel(link.label))}</a>`).join("") || `<span class="muted">暂无目标链接。</span>`}</div>
          <h4>安全动作</h4>
          <ul>${model.safe_next_actions.map((action) => `<li>${escapeHtml(toChineseActionLabel(action))}</li>`).join("")}</ul>
          <h4>禁止动作</h4>
          <p class="muted">这些动作不会自动执行，需要人工审核：</p>
          <ul>${model.blocked_actions.map((action) => `<li>${escapeHtml(toChineseActionLabel(action))}</li>`).join("") || "<li>暂无已记录的禁止动作。</li>"}</ul>
        </div>
      </div>
    </article>
  `;
}

function renderAuditView() {
  if (!auditSummary || !auditFilters || !auditList) return;
  const history = loadHistory();
  const summary = summarizeAuditRecords(history);
  const records = filterAuditRecords(selectedAuditFilter, history);
  auditSummary.innerHTML = `
    <div class="audit-summary-grid">
      ${auditStat("总指令记录", summary.total_command_records)}
      ${auditStat("需审核草稿", summary.drafts_requiring_review)}
      ${auditStat("已内部审核", summary.reviewed_internal_drafts)}
      ${auditStat("已阻止高风险流程", summary.blocked_high_risk_workflows)}
      ${auditStat("跟进草稿", summary.follow_up_drafts)}
      ${auditStat("单据草稿", summary.document_drafts)}
      ${auditStat("已取消流程", summary.cancelled_workflows)}
    </div>
  `;
  renderAuditFilters();
  auditList.innerHTML = records.length
    ? records.map(renderAuditCard).join("")
    : `<p class="muted">当前筛选下暂无内部审核记录。</p>`;
  renderAuditDetailPanel();
}

function auditStat(label, value) {
  return `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`;
}

function renderAuditFilters() {
  const filters = [
    ["all", "全部"],
    ["draft_only", "草稿"],
    ["review_pending", "待审核"],
    ["reviewed", "已内部审核"],
    ["blocked_requires_manual_review", "已阻止"],
    ["cancelled", "已取消"],
    ["document_drafts", "单据草稿"],
    ["follow_up_drafts", "跟进草稿"],
    ["needs_manual_review", "需要人工审核"],
  ];
  auditFilters.innerHTML = filters
    .map(([value, label]) => `<button class="${selectedAuditFilter === value ? "active" : ""}" data-audit-filter="${value}" type="button">${label}</button>`)
    .join("");
}

function renderAuditCard(record) {
  const refs = record.related_business_objects?.length
    ? record.related_business_objects.map((ref) => `
      <span class="context-chip">${escapeHtml(toChineseCardType(ref.type))}: ${escapeHtml(toChineseResultText(ref.label || ref.id || "对象"))}</span>
    `).join("")
    : `<span class="context-chip">未关联业务对象</span>`;
  const drafts = record.draft_references?.length
    ? record.draft_references.map((draft) => `<li>${escapeHtml(toChineseResultText(draft.draft_type || "草稿"))} · ${escapeHtml(toChineseStatusLabel(draft.review_status || draft.status))} · ${escapeHtml(draft.draft_id || "")}</li>`).join("")
    : "<li>暂无草稿引用</li>";
  const relatedLinks = record.related_business_objects?.filter((ref) => ref.href).slice(0, 4).map((ref) => `<a href="${escapeHtml(ref.href)}">打开关联对象</a>`).join("") || "";
  return `
    <article class="audit-card ${selectedAuditDetailCommandId === record.command_id ? "selected" : ""}" data-audit-card="${escapeHtml(record.command_id)}">
      <div class="audit-card-head">
        <div>
          <span class="card-type">command_id: ${escapeHtml(record.command_id)}</span>
          <h3>${escapeHtml(record.original_command || "未命名指令")}</h3>
          <p class="muted">${escapeHtml(record.parsed_intent || "-")} · 审核状态：${escapeHtml(toChineseStatusLabel(record.review_status))} · ${record.manual_review_required ? "需要人工审核" : "内部记录"}</p>
        </div>
        <span class="status-pill ${escapeHtml(record.review_status)}">${escapeHtml(toChineseStatusLabel(record.review_status))}</span>
      </div>
      <p><strong>关联业务对象:</strong> ${refs}</p>
      <p><strong>审核备注:</strong> ${escapeHtml(record.manual_review_note_summary || "暂无")}</p>
      <p><strong>步骤:</strong> 已完成 ${record.completed_steps_count} · 待处理 ${record.pending_steps_count} · 禁止动作 ${record.blocked_actions_count}</p>
      <p class="muted">更新：${escapeHtml(record.updated_at || "-")} · 仅内部记录，不代表已发送客户</p>
      <details>
        <summary>草稿引用</summary>
        <ul>${drafts}</ul>
      </details>
      <details>
        <summary>禁止动作</summary>
        <ul>${record.blocked_actions?.length ? record.blocked_actions.map((action) => `<li>${escapeHtml(toChineseActionLabel(action))}</li>`).join("") : "<li>暂无禁止动作</li>"}</ul>
      </details>
      <div class="card-actions">
        <button type="button" data-audit-resume="${escapeHtml(record.command_id)}">打开恢复流程</button>
        <button type="button" data-audit-copy="${escapeHtml(record.command_id)}">复制审核摘要</button>
        ${relatedLinks}
        <button type="button" data-audit-review-status="review_pending" data-command-id="${escapeHtml(record.command_id)}">标记为待审核</button>
        <button type="button" data-audit-review-status="reviewed" data-command-id="${escapeHtml(record.command_id)}">标记为已内部审核</button>
        <button type="button" data-audit-cancel="${escapeHtml(record.command_id)}">取消流程</button>
      </div>
    </article>
  `;
}

function renderAuditDetailPanel() {
  if (!auditDetailPanel) return;
  if (!selectedAuditDetailCommandId) {
    auditDetailPanel.innerHTML = `<p class="muted audit-detail-empty">点击一条内部审核记录，可查看审核详情、时间线、完整备注和安全处理动作。</p>`;
    return;
  }
  const model = getAuditDetailModel(selectedAuditDetailCommandId, loadHistory());
  if (!model.ok) {
    auditDetailPanel.innerHTML = `<article class="audit-detail warning-text">审核详情：${escapeHtml(model.warning)}</article>`;
    return;
  }
  const record = model.record;
  const audit = model.audit_summary;
  const timeline = model.timeline?.length
    ? model.timeline.map((event) => `
      <li>
        <span class="status-pill ${escapeHtml(event.status)}">${escapeHtml(toChineseStatusLabel(event.status))}</span>
        <strong>${escapeHtml(toChineseResultText(event.label))}</strong>
        <span class="muted">${escapeHtml(event.timestamp || "时间未记录")}${event.missing_timestamp ? " · 时间未记录" : ""}</span>
      </li>
    `).join("")
    : "<li>暂无时间线记录。</li>";
  const drafts = model.draft_references?.length
    ? model.draft_references.map((draft) => `<li>${escapeHtml(toChineseResultText(draft.draft_type || "草稿"))} · ${escapeHtml(draft.draft_id || "-")} · ${escapeHtml(toChineseStatusLabel(draft.review_status || draft.status))} · ${draft.official_sent || draft.customer_message_sent ? "异常：请检查" : "仅内部草稿"}</li>`).join("")
    : "<li>暂无草稿引用。</li>";
  const refs = model.business_object_refs?.length
    ? model.business_object_refs.map((ref) => `<li>${escapeHtml(toChineseCardType(ref.type))} · ${escapeHtml(toChineseResultText(ref.label || ref.id || "对象"))} ${ref.href ? `<a href="${escapeHtml(ref.href)}">打开关联对象</a>` : ""}</li>`).join("")
    : "<li>未关联业务对象。</li>";
  const progress = model.workflow_progress?.length
    ? model.workflow_progress.map((step) => `<li><span class="status-pill ${escapeHtml(step.status)}">${escapeHtml(toChineseStatusLabel(step.status))}</span> ${escapeHtml(toChineseActionLabel(step.label))} <span class="muted">${escapeHtml(step.completed_at || "时间未记录")}</span></li>`).join("")
    : "<li>暂无工作流进度。</li>";
  const links = model.related_links?.length
    ? model.related_links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(toChineseLinkLabel(link.label || "打开关联对象"))}</a>`).join("")
    : `<span class="muted">暂无关联链接。</span>`;

  auditDetailPanel.innerHTML = `
    <aside class="audit-detail" aria-live="polite">
      <div class="audit-detail-head">
        <div>
          <span class="card-type">审核详情</span>
          <h3>${escapeHtml(record.raw_command || "未命名指令")}</h3>
          <p class="muted">command_id: ${escapeHtml(record.command_id)} · ${escapeHtml(toChineseStatusLabel(record.status))} · 审核状态：${escapeHtml(toChineseStatusLabel(record.review_status))}</p>
          ${audit.manual_review_required ? `<p class="manual-review-banner">需要人工审核</p>` : ""}
        </div>
        <button type="button" data-audit-detail-close="${escapeHtml(record.command_id)}">关闭详情</button>
      </div>
      <div class="audit-detail-grid">
        <section>
          <h4>基础信息</h4>
          <dl class="card-fields">
            <div><dt>原始指令</dt><dd>${escapeHtml(record.raw_command || "-")}</dd></div>
            <div><dt>识别意图</dt><dd>${escapeHtml(record.parsed_intent || "-")}</dd></div>
            <div><dt>指令状态</dt><dd>${escapeHtml(toChineseStatusLabel(record.status))}</dd></div>
            <div><dt>审核状态</dt><dd>${escapeHtml(toChineseStatusLabel(record.review_status))}</dd></div>
            <div><dt>需要人工审核</dt><dd>${audit.manual_review_required ? "是" : "否"}</dd></div>
            <div><dt>创建时间</dt><dd>${escapeHtml(record.created_at || "时间未记录")}</dd></div>
            <div><dt>更新时间</dt><dd>${escapeHtml(record.updated_at || "时间未记录")}</dd></div>
          </dl>
          <div class="review-note-box">
            <label for="auditDetailNote">审核备注 <span>仅内部记录，不会发送给客户，也不会进入正式 PI/报价文本。</span></label>
            <textarea id="auditDetailNote" data-audit-detail-note="${escapeHtml(record.command_id)}" rows="5">${escapeHtml(model.manual_review_note || "")}</textarea>
            <button type="button" data-audit-detail-save-note="${escapeHtml(record.command_id)}">保存审核备注</button>
          </div>
        </section>
        <section>
          <h4>工作流进度</h4>
          <ol class="progress-list audit-detail-list">${progress}</ol>
          <h4>处理时间线</h4>
          <ol class="audit-timeline">${timeline}</ol>
        </section>
        <section>
          <h4>草稿引用</h4>
          <ul>${drafts}</ul>
          <h4>关联业务对象</h4>
          <ul>${refs}</ul>
          <h4>关联链接</h4>
          <div class="card-actions">${links}</div>
        </section>
        <section>
          <h4>禁止动作</h4>
          <p class="muted">这些动作不会自动执行，需要人工审核：</p>
          <ul>${model.blocked_actions?.length ? model.blocked_actions.map((action) => `<li>${escapeHtml(toChineseActionLabel(action))}</li>`).join("") : "<li>暂无禁止动作。</li>"}</ul>
          <h4>安全动作</h4>
          <div class="card-actions">
            <button type="button" data-audit-detail-review-status="review_pending" data-command-id="${escapeHtml(record.command_id)}">标记为待审核</button>
            <button type="button" data-audit-detail-review-status="reviewed" data-command-id="${escapeHtml(record.command_id)}">标记为已内部审核</button>
            <button type="button" data-audit-detail-cancel="${escapeHtml(record.command_id)}">取消流程</button>
            <button type="button" data-audit-detail-copy="${escapeHtml(record.command_id)}">复制审核详情摘要</button>
            <button type="button" data-audit-detail-resume="${escapeHtml(record.command_id)}">打开恢复流程</button>
          </div>
          <p class="muted">仅内部记录，不代表已发送客户。</p>
        </section>
      </div>
    </aside>
  `;
}

function renderCommandJourney(model) {
  const journey = model.journey_summary || summarizeCommandJourney(model.record);
  commandJourney.innerHTML = `
    <section class="journey-card">
      <div>
        <span class="card-type">指令流程总览</span>
        <strong>${escapeHtml(journey.original_command || "指令")}</strong>
        <p class="muted">识别意图：${escapeHtml(journey.parsed_intent || "-")} · 当前状态：${escapeHtml(toChineseStatusLabel(journey.current_status || "-"))} · 需要人工审核：${journey.approval_required ? "是" : "否"}</p>
      </div>
      <div class="journey-stats">
        <span>进度 ${journey.progress_summary.completed}/${journey.progress_summary.total}</span>
        <span>业务对象 ${journey.business_objects_count}</span>
        <span>草稿 ${journey.draft_references_count}</span>
        <span>已阻止 ${journey.blocked_high_risk_actions_count}</span>
      </div>
      <p><strong>下一步安全动作:</strong> ${escapeHtml(toChineseActionLabel(journey.safe_next_action))}</p>
      ${journey.approval_required ? `<p class="warning-text">需要人工审核：不自动发送客户消息、正式报价或 PI，不确认价格、交期、付款条款或银行信息。</p>` : ""}
    </section>
  `;
}

function updateWorkflowButtons() {
  const hasPlan = Boolean(currentPlan);
  const isHighRisk = Boolean(currentPlan?.approval_required);
  previewButton.disabled = !hasPlan;
  confirmButton.disabled = !hasPlan || isHighRisk || currentPlan.status !== CommandStatus.PREVIEWED;
  executeButton.disabled = !hasPlan || isHighRisk || currentPlan.status !== CommandStatus.CONFIRMED;
  draftOnlyButton.disabled = !hasPlan || !isHighRisk;
  draftOnlyButton.style.display = isHighRisk ? "inline-flex" : "none";
  executeButton.style.display = isHighRisk ? "none" : "inline-flex";
}

function planCurrentCommand() {
  const parsed = parseCommand(commandInput.value);
  const plan = createCommandPlan({ parsedCommand: parsed });
  currentPlan = plan;
  renderParsed(parsed, plan);
  resultPreview.textContent = JSON.stringify(plan, null, 2);
  renderResultCards([]);
  addHistory({
    command_id: plan.command_id,
    raw_command: plan.raw_command,
    parsed_intent: plan.intent,
    planned_actions: plan.plan_steps,
    approval_required: plan.approval_required,
    status: CommandStatus.PLANNED,
    result_summary: "指令计划已生成。",
  });
  renderHistory();
  return parsed;
}

function previewCurrentCommand(mode = SafeExecutionModes.PREVIEW) {
  if (!currentPlan || commandInput.value.trim() !== currentPlan.raw_command) planCurrentCommand();
  const db = loadDb();
  const result = executeCommandPlan(db, currentPlan, currentParsed, { mode });
  if (result.ok) currentPlan.status = CommandStatus.PREVIEWED;
  saveDb(db);
  renderResultCards(result.cards || []);
  resultPreview.textContent = JSON.stringify(result, null, 2);
  addHistory({
    ...(result.command_log || {
    command_id: currentPlan.command_id,
    raw_command: currentPlan.raw_command,
    parsed_intent: currentPlan.intent,
    planned_actions: currentPlan.plan_steps,
    approval_required: currentPlan.approval_required,
    status: result.status,
    result_summary: result.result_summary,
    }),
    preview_cards: result.cards || [],
    draft_reference: result.draft_reference || result.command_log?.draft_reference || null,
    draft_references: result.draft_reference ? [result.draft_reference] : result.command_log?.draft_references || [],
    blocked_actions: currentPlan.blocked_actions || [],
  });
  renderParsed(currentParsed, currentPlan);
  renderHistory();
}

function confirmCurrentCommand() {
  if (!currentPlan || currentPlan.approval_required) return;
  const transition = transitionCommandStatus(currentPlan.status, CommandStatus.CONFIRMED, currentPlan);
  if (transition.ok) {
    currentPlan.status = CommandStatus.CONFIRMED;
    resultPreview.textContent = JSON.stringify({ ok: true, status: currentPlan.status, result_summary: "安全动作已确认，可以进行内部执行。" }, null, 2);
    addHistory({
      command_id: currentPlan.command_id,
      raw_command: currentPlan.raw_command,
      parsed_intent: currentPlan.intent,
      planned_actions: currentPlan.plan_steps,
      approval_required: false,
      status: CommandStatus.CONFIRMED,
      result_summary: "安全动作已确认。",
    });
    renderParsed(currentParsed, currentPlan);
    renderHistory();
  }
}

function executeCurrentCommand() {
  if (!currentPlan || currentPlan.approval_required) return;
  const db = loadDb();
  const result = executeCommandPlan(db, currentPlan, currentParsed, { mode: SafeExecutionModes.EXECUTE });
  if (result.ok) currentPlan.status = CommandStatus.EXECUTED;
  saveDb(db);
  renderResultCards(result.cards || []);
  resultPreview.textContent = JSON.stringify(result, null, 2);
  addHistory(result.command_log);
  renderParsed(currentParsed, currentPlan);
  renderHistory();
}

function renderMode() {
  const env = publicEnv();
  const session = getAdminSession();
  const mode = env.NEXT_PUBLIC_DATA_MODE || localStorage.getItem("cbm-data-mode") || "mock";
  modePill.textContent = `${mode} · ${session?.user?.email || "admin"}`;
}

function toChineseStatusLabel(value) {
  const labels = {
    all: "全部",
    needs_review: "需要审核",
    in_progress: "处理中",
    completed: "已完成",
    blocked: "已阻止",
    cancelled: "已取消",
    pending: "待处理",
    skipped: "已跳过",
    success: "成功",
    draft: "草稿",
    draft_only: "仅草稿",
    review_pending: "待审核",
    reviewed: "已内部审核",
    created_draft: "已创建草稿",
    unknown: "未知",
    high: "高",
    low: "低",
    planned: "已生成计划",
    previewed: "已预览",
    confirmed: "已确认",
    executed: "已执行",
    resumed: "已恢复",
    blocked_requires_manual_review: "已阻止，需人工审核",
    needs_review_card: "需要审核",
  };
  return labels[String(value || "").toLowerCase()] || value || "-";
}

function toChineseLinkLabel(value) {
  const labels = {
    "Open target module": "打开目标模块",
    "Open related module": "打开关联模块",
    "Return to Command Center": "返回指令中心",
    "Resume Workflow": "继续处理流程",
    "Open Follow-up Workbench": "打开跟进工作台",
    "Open Inquiry Pool": "打开询盘池",
    "Open Document Center": "打开单据中心",
    "Open Customer 360": "打开客户 360",
    "Open Lead Review": "打开线索审核",
    "Document Center": "单据中心",
    "Customer 360": "客户 360",
    "Inquiry Detail": "询盘详情",
    "Lead Review": "线索审核",
    "Follow-up Workbench": "跟进工作台",
  };
  return labels[value] || value || "";
}

function toChineseIntentLabel(value) {
  const labels = {
    "Daily follow-up list": "今日客户跟进清单",
    "Latest inquiry analysis": "最新网站询盘分析",
    "Customer lookup": "客户查询",
    "Lead to customer": "线索转客户",
    "Create project from inquiry": "从询盘创建项目",
    "Create quotation draft": "创建报价草稿",
    "Create document draft": "创建单据草稿",
    "Build archive path": "生成归档路径",
    "Create follow-up task": "创建跟进任务",
    unknown: "未知指令",
  };
  return labels[value] || labels[String(value || "").toLowerCase()] || value || "-";
}

function toChineseCardType(value) {
  const labels = {
    followup_card: "跟进卡片",
    inquiry_analysis_card: "询盘分析卡片",
    customer_card: "客户卡片",
    document_draft_card: "单据草稿卡片",
    archive_path_card: "归档路径卡片",
    approval_required_card: "人工审核卡片",
    unknown_command_card: "未知指令卡片",
    document_draft: "单据草稿",
    archive_path: "归档路径",
    customer: "客户",
    lead: "线索",
    inquiry: "询盘",
    follow_up_task: "跟进任务",
    project: "项目",
    quotation: "报价",
  };
  return labels[value] || value || "";
}

function toChineseFieldLabel(value) {
  const labels = {
    Intent: "识别意图",
    Tool: "工具",
    "Risk level": "风险等级",
    "Document type": "单据类型",
    "Customer/project": "客户/项目",
    Seller: "卖方",
    "Draft status": "草稿状态",
    "Forbidden field check": "禁用字段检查",
    "Archive file name": "归档文件名",
    "Archive file": "归档文件",
    "Customer alias": "客户别名",
    "Archive year/order": "归档年份/订单号",
    Project: "项目",
    "Archive path": "归档路径",
    "File name": "文件名",
    "Next version": "下一个版本",
    "ZIP fallback path": "ZIP 备用路径",
    "Lead/customer status": "线索/客户状态",
  };
  return labels[value] || value || "";
}

function toChineseActionLabel(value) {
  const text = String(value || "");
  const exact = {
    "Manual Review Required": "需要人工审核",
    "Copy summary": "复制摘要",
    "Copy context summary": "复制上下文摘要",
    "Open target module": "打开目标模块",
    "Create follow-up task draft": "创建跟进任务草稿",
    "Create Follow-up Task": "创建跟进任务草稿",
    "Copy Draft Summary": "复制草稿摘要",
    "Create follow-up task draft placeholder": "创建跟进任务草稿",
    "Mark step completed": "标记步骤完成",
    "Mark safe pending step as completed": "标记安全待处理步骤为已完成",
    "Copy workflow summary": "复制流程摘要",
    "Generate document draft checklist": "生成单据草稿检查清单",
    "Mark manual review status": "更新人工审核状态",
    "Add internal review note": "添加内部审核备注",
    "Cancel workflow": "取消流程",
    "Close workflow": "关闭流程",
    "Return to Command Center": "返回指令中心",
    "Review workflow.": "检查当前流程。",
    "Review workflow and archive as closed when complete.": "检查流程，完成后归档关闭。",
    "Manual review required before any customer-facing or commercial action.": "任何客户可见或商业承诺动作前都需要人工审核。",
    "No automatic customer messages": "不自动发送客户消息",
    "No automatic official quotation": "不自动发送正式报价",
    "No automatic PI": "不自动发送 PI",
    "No price confirmation": "不确认价格",
    "No delivery time confirmation": "不确认交期",
    "No payment terms confirmation": "不确认付款条款",
    "No bank account confirmation": "不确认银行信息",
    "No compensation promise": "不承诺赔偿",
    "No automatic responsibility judgment": "不自动判断责任",
    "Send official quotation": "发送正式报价",
    "Send official PI": "发送正式 PI",
    "Confirm payment terms": "确认付款条款",
    "Confirm bank account": "确认银行信息",
    "Confirm delivery time": "确认交期",
    "Send customer message": "发送客户消息",
    "Promise compensation": "承诺赔偿",
    "Judge responsibility": "判断责任",
    "Create Draft Only": "仅创建草稿",
    "Copy Archive Path": "复制归档路径",
    "Review draft data.": "检查草稿数据。",
    "Find customer/project reference": "查找客户/项目引用",
    "Prepare document draft data": "准备单据草稿数据",
    "Check forbidden customer fields": "检查禁用字段",
    "Calculate totals": "计算合计",
    "Build archive file name": "生成归档文件名",
    "Mark manual review required": "标记为需要人工审核",
    "send customer message": "发送客户消息",
    "send official quotation": "发送正式报价",
    "send official PI": "发送正式 PI",
    "confirm price": "确认价格",
    "confirm delivery time": "确认交期",
    "confirm payment terms": "确认付款条款",
    "confirm bank account": "确认银行信息",
    "promise compensation": "承诺赔偿",
    "judge responsibility": "判断责任",
    "Confirm protected commercial terms": "确认受保护的商业条款",
    "Export official file automatically": "自动导出正式文件",
    "Approve manually only if the commercial information is correct.": "只有在人工确认商业信息正确后才能继续。",
    "Request missing information before quotation.": "报价前先补齐缺失信息。",
    "Check high-score inquiries or leads needing review.": "检查高分询盘或需要审核的线索。",
    "Use this path when exporting manually.": "手动导出时使用这个路径。",
    "Keep original customer files in the same order folder.": "把客户原始文件保存在同一个订单文件夹中。",
    "Submit or import an inquiry first.": "请先提交或导入询盘。",
  };
  if (exact[text]) return exact[text];
  return text
    .replaceAll("Manual Review Required", "需要人工审核")
    .replaceAll("official quotation", "正式报价")
    .replaceAll("customer message", "客户消息")
    .replaceAll("payment terms", "付款条款")
    .replaceAll("bank account", "银行信息")
    .replaceAll("delivery time", "交期")
    .replaceAll("compensation", "赔偿")
    .replaceAll("responsibility judgment", "责任判断")
    .replaceAll("Send", "发送")
    .replaceAll("Confirm", "确认")
    .replaceAll("Promise", "承诺")
    .replaceAll("Judge", "判断")
    .replaceAll("Intent", "识别意图")
    .replaceAll("creates a commercial draft that requires manual review.", "会创建商业草稿，需要人工审核。")
    .replaceAll("Command mentions high-risk term:", "指令包含高风险词：");
}

function toChineseResultText(value) {
  const text = String(value ?? "");
  const labels = {
    "Manual Review Required": "需要人工审核",
    "No follow-ups due": "今天暂无到期跟进",
    "Daily follow-up list": "今日客户跟进清单",
    "No pending follow-up tasks were found for today.": "今天暂未发现待处理跟进任务。",
    "Latest inquiry": "最新询盘",
    "business line unknown · source unknown": "业务线未知 · 来源未知",
    "No inquiry found.": "暂未找到询盘。",
    "Submit or import an inquiry first.": "请先提交或导入询盘。",
    "not linked": "未关联",
    "Archive path preview": "归档路径预览",
    "Archive path preview generated.": "归档路径预览已生成。",
    "Document draft created. Manual Review Required before export, sending, official quotation or PI.": "单据草稿已创建。导出、发送、正式报价或 PI 前必须人工审核。",
    "Quotation draft created. Manual Review Required before any official quotation.": "报价草稿已创建。正式报价前必须人工审核。",
    "This command may affect commercial commitments or customer communication.": "该指令可能影响商业承诺或客户沟通。",
    "DRAFT_REQUIRES_REVIEW": "草稿需要审核",
    "NEED_REVIEW": "需要审核",
    DRAFT: "草稿",
    passed: "通过",
    "passed for card display": "通过，卡片展示未发现禁用字段",
    Project: "项目",
    Document: "单据",
    production_order: "中文生产单",
    proforma_invoice: "PI 草稿",
    quotation: "报价草稿",
    draft: "草稿",
    draft_only: "仅草稿",
    "New Customer": "新客户",
    "Open Document Center": "打开单据中心",
    follow_up_task_draft: "跟进任务草稿",
  };
  if (labels[text]) return labels[text];
  return toChineseActionLabel(text)
    .replaceAll("Document draft created.", "单据草稿已创建。")
    .replaceAll("Archive path preview generated.", "归档路径预览已生成。")
    .replaceAll("Command planned.", "指令计划已生成。")
    .replaceAll("follow-up task(s) need attention.", "个跟进任务需要关注。")
    .replaceAll("Intent", "识别意图")
    .replaceAll("creates a commercial draft that requires manual review.", "会创建商业草稿，需要人工审核。")
    .replaceAll("Command mentions high-risk term:", "指令包含高风险词：")
    .replaceAll("high", "高")
    .replaceAll("source unknown", "来源未知")
    .replaceAll("business line unknown", "业务线未知");
}

function safetyBoundaryNotes() {
  return [
    "不自动发送客户消息",
    "不自动发送正式报价",
    "不自动发送 PI",
    "不确认价格",
    "不确认交期",
    "不确认付款条款",
    "不确认银行信息",
    "不承诺赔偿",
    "不自动判断责任",
  ];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

exampleCommands.addEventListener("click", (event) => {
  const button = event.target.closest("[data-command-example]");
  if (!button) return;
  commandInput.value = button.dataset.commandExample;
  currentPlan = null;
  renderParsed(parseCommand(commandInput.value));
  renderResultCards([]);
});

parseButton.addEventListener("click", planCurrentCommand);
previewButton.addEventListener("click", () => previewCurrentCommand(SafeExecutionModes.PREVIEW));
draftOnlyButton.addEventListener("click", () => {
  if (!approvalCheckbox.checked) {
    resultPreview.textContent = "需要人工审核。请先勾选人工确认，再创建仅草稿预览。";
    return;
  }
  previewCurrentCommand(SafeExecutionModes.DRAFT_PREVIEW);
});
confirmButton.addEventListener("click", confirmCurrentCommand);
executeButton.addEventListener("click", executeCurrentCommand);
clearHistoryButton.addEventListener("click", () => {
  saveHistory([]);
  selectedResumeCommandId = "";
  selectedAuditDetailCommandId = "";
  renderHistory();
});
logoutButton.addEventListener("click", async () => {
  await signOutAdmin();
  window.location.assign("/admin/login?signed_out=1");
});

historyFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-history-filter]");
  if (!button) return;
  selectedHistoryFilter = button.dataset.historyFilter;
  renderHistory();
});

historyList.addEventListener("click", async (event) => {
  const resumeButton = event.target.closest("[data-resume-command]");
  if (resumeButton) {
    selectedResumeCommandId = resumeButton.dataset.resumeCommand;
    addHistory({
      ...getResumeWorkflowModel(selectedResumeCommandId, loadHistory()).record,
      status: CommandStatus.RESUMED,
      result_summary: "已在指令中心恢复流程。",
    });
    renderHistory();
    return;
  }
  const copyButton = event.target.closest("[data-copy-history]");
  if (copyButton) {
    await copyHistorySummary(copyButton.dataset.copyHistory, copyButton);
  }
});

auditFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-audit-filter]");
  if (!button) return;
  selectedAuditFilter = button.dataset.auditFilter;
  renderAuditView();
});

auditList.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-audit-card]");
  const actionTarget = event.target.closest("button,a,summary,details");
  const resumeButton = event.target.closest("[data-audit-resume]");
  if (resumeButton) {
    selectedResumeCommandId = resumeButton.dataset.auditResume;
    const model = getResumeWorkflowModel(selectedResumeCommandId, loadHistory());
    if (model.ok) {
      addHistory({
        ...model.record,
        status: CommandStatus.RESUMED,
        result_summary: "已从内部审核记录恢复流程。",
      });
    }
    renderHistory();
    resumeWorkspace?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const copyButton = event.target.closest("[data-audit-copy]");
  if (copyButton) {
    await copyAuditSummary(copyButton.dataset.auditCopy, copyButton);
    return;
  }
  const reviewStatusButton = event.target.closest("[data-audit-review-status]");
  if (reviewStatusButton) {
    const result = updateManualReviewStatus(
      reviewStatusButton.dataset.commandId,
      reviewStatusButton.dataset.auditReviewStatus,
      loadHistory(),
      { reviewed_by: getAdminSession()?.user?.email || "local_admin" },
    );
    if (result.ok) saveHistory(result.history);
    reviewStatusButton.textContent = result.ok ? "审核状态已更新" : "状态不可更新";
    renderHistory();
    return;
  }
  const cancelButton = event.target.closest("[data-audit-cancel]");
  if (cancelButton) {
    const result = updateManualReviewStatus(cancelButton.dataset.auditCancel, "cancelled", loadHistory(), {
      reviewed_by: getAdminSession()?.user?.email || "local_admin",
    });
    if (result.ok) saveHistory(result.history);
    renderHistory();
    return;
  }
  if (card && !actionTarget) {
    selectedAuditDetailCommandId = card.dataset.auditCard;
    renderAuditView();
    auditDetailPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

auditDetailPanel.addEventListener("click", async (event) => {
  const closeButton = event.target.closest("[data-audit-detail-close]");
  if (closeButton) {
    selectedAuditDetailCommandId = "";
    renderAuditDetailPanel();
    return;
  }
  const resumeButton = event.target.closest("[data-audit-detail-resume]");
  if (resumeButton) {
    selectedResumeCommandId = resumeButton.dataset.auditDetailResume;
    const model = getResumeWorkflowModel(selectedResumeCommandId, loadHistory());
    if (model.ok) {
      addHistory({
        ...model.record,
        status: CommandStatus.RESUMED,
        result_summary: "已从审核详情打开恢复流程。",
      });
    }
    renderHistory();
    resumeWorkspace?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const copyButton = event.target.closest("[data-audit-detail-copy]");
  if (copyButton) {
    await copyAuditDetailSummary(copyButton.dataset.auditDetailCopy, copyButton);
    return;
  }
  const saveNoteButton = event.target.closest("[data-audit-detail-save-note]");
  if (saveNoteButton) {
    const commandId = saveNoteButton.dataset.auditDetailSaveNote;
    const note = document.querySelector(`[data-audit-detail-note="${CSS.escape(commandId)}"]`)?.value || "";
    const result = saveManualReviewNote(commandId, note, loadHistory(), { reviewed_by: getAdminSession()?.user?.email || "local_admin" });
    if (result.ok) saveHistory(result.history);
    saveNoteButton.textContent = result.ok ? "审核备注已保存" : "保存失败";
    renderHistory();
    return;
  }
  const statusButton = event.target.closest("[data-audit-detail-review-status]");
  if (statusButton) {
    const result = updateManualReviewStatus(
      statusButton.dataset.commandId,
      statusButton.dataset.auditDetailReviewStatus,
      loadHistory(),
      { reviewed_by: getAdminSession()?.user?.email || "local_admin" },
    );
    if (result.ok) saveHistory(result.history);
    statusButton.textContent = result.ok ? "审核状态已更新" : "状态不可更新";
    renderHistory();
    return;
  }
  const cancelButton = event.target.closest("[data-audit-detail-cancel]");
  if (cancelButton) {
    const result = updateManualReviewStatus(cancelButton.dataset.auditDetailCancel, "cancelled", loadHistory(), {
      reviewed_by: getAdminSession()?.user?.email || "local_admin",
    });
    if (result.ok) saveHistory(result.history);
    renderHistory();
  }
});

resumeWorkspace.addEventListener("click", async (event) => {
  const stepButton = event.target.closest("[data-resume-step-complete]");
  if (stepButton) {
    const result = markWorkflowStepCompleted(stepButton.dataset.commandId, stepButton.dataset.resumeStepComplete, loadHistory());
    if (result.ok) saveHistory(result.history);
    renderHistory();
    return;
  }
  const copyButton = event.target.closest("[data-copy-history]");
  if (copyButton) {
    await copyHistorySummary(copyButton.dataset.copyHistory, copyButton);
    return;
  }
  const reviewStatusButton = event.target.closest("[data-resume-review-status]");
  if (reviewStatusButton) {
    const result = updateManualReviewStatus(
      reviewStatusButton.dataset.commandId,
      reviewStatusButton.dataset.resumeReviewStatus,
      loadHistory(),
      { reviewed_by: getAdminSession()?.user?.email || "local_admin" },
    );
    if (result.ok) saveHistory(result.history);
    reviewStatusButton.textContent = result.ok ? "审核状态已更新" : "状态不可更新";
    renderHistory();
    return;
  }
  const actionButton = event.target.closest("[data-resume-action]");
  if (!actionButton) return;
  const commandId = actionButton.dataset.commandId;
  if (actionButton.dataset.resumeAction === "draft-follow-up") {
    const result = createFollowUpTaskDraft(commandId, loadHistory());
    if (result.ok) saveHistory(result.history);
    actionButton.textContent = result.ok ? "跟进草稿已创建" : "创建失败";
    actionButton.title = "仅草稿，不会发送任何客户消息。";
    renderHistory();
    return;
  }
  if (actionButton.dataset.resumeAction === "document-checklist") {
    const result = generateDocumentDraftChecklist(commandId, loadHistory());
    if (result.ok) saveHistory(result.history);
    actionButton.textContent = result.ok ? "检查清单已生成" : "生成失败";
    renderHistory();
    return;
  }
  if (actionButton.dataset.resumeAction === "save-review-note") {
    const note = document.querySelector(`[data-review-note-input="${CSS.escape(commandId)}"]`)?.value || "";
    const result = saveManualReviewNote(commandId, note, loadHistory(), { reviewed_by: getAdminSession()?.user?.email || "local_admin" });
    if (result.ok) saveHistory(result.history);
    actionButton.textContent = result.ok ? "审核备注已保存" : "保存失败";
    renderHistory();
    return;
  }
  if (actionButton.dataset.resumeAction === "cancel") {
    const result = cancelWorkflow(commandId, loadHistory());
    if (result.ok) saveHistory(result.history);
    renderHistory();
    return;
  }
  if (actionButton.dataset.resumeAction === "close") {
    const result = closeWorkflow(commandId, loadHistory());
    saveHistory(result.history);
    renderHistory();
  }
});

async function copyHistorySummary(commandId, button) {
  const model = getResumeWorkflowModel(commandId, loadHistory());
  const summary = model.ok
    ? `${model.original_command}\n状态: ${toChineseStatusLabel(model.command_status)}\n进度: ${model.progress_summary.text}\n已阻止: ${model.blocked_actions.map(toChineseActionLabel).join(", ") || "无"}`
    : model.warning;
  try {
    await navigator.clipboard.writeText(summary);
    button.textContent = "已复制";
  } catch {
    button.textContent = "复制失败";
  }
}

async function copyAuditSummary(commandId, button) {
  const record = filterAuditRecords("all", loadHistory()).find((item) => item.command_id === commandId);
  const summary = record
    ? [
        `原始指令: ${record.original_command || "-"}`,
        `识别意图: ${record.parsed_intent || "-"}`,
        `审核状态: ${toChineseStatusLabel(record.review_status)}`,
        `需要人工审核: ${record.manual_review_required ? "是" : "否"}`,
        `关联业务对象: ${record.related_business_object_label || "未关联业务对象"}`,
        `草稿数量: ${record.draft_references?.length || 0}`,
        `已完成步骤: ${record.completed_steps_count}`,
        `待处理步骤: ${record.pending_steps_count}`,
        `禁止动作: ${record.blocked_actions_count}`,
        `内部备注: ${record.manual_review_note_summary || "暂无"}`,
        "仅内部审核记录，不代表已发送客户消息、正式报价或 PI。",
      ].join("\n")
    : "未找到内部审核记录。";
  try {
    await navigator.clipboard.writeText(summary);
    button.textContent = "已复制审核摘要";
  } catch {
    button.textContent = "复制失败";
  }
}

async function copyAuditDetailSummary(commandId, button) {
  const model = getAuditDetailModel(commandId, loadHistory());
  const summary = model.ok ? buildAuditDetailSummary(model.record) : model.warning;
  try {
    await navigator.clipboard.writeText(summary);
    button.textContent = "已复制审核详情摘要";
  } catch {
    button.textContent = "复制失败";
  }
}

renderExamples();
renderMode();
currentParsed = parseCommand(examples[0]);
currentPlan = createCommandPlan({ parsedCommand: currentParsed });
renderParsed(currentParsed, currentPlan);
renderResultCards([]);
renderHistory();
