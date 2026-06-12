import test from "node:test";
import assert from "node:assert/strict";

import { parseCommand } from "../lib/command-center/command-parser.js";
import { mapCommandResultToCards } from "../lib/command-center/result-card-mapper.js";

test("inquiry analysis result maps to inquiry_analysis_card", () => {
  const parsed = parseCommand("分析最新网站询盘。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "analyzeLatestInquiry",
    result_summary: "Inquiry analyzed.",
    data: {
      inquiry: {
        title: "Website inquiry for curtain wall",
        business_line: "A_ARCHITECTURAL",
        source: "website",
        status: "NEW",
        lead_id: "lead_1",
      },
      analysis: {
        ai_summary: "Customer needs curtain wall quotation.",
        missing_info: ["drawings", "destination port"],
        recommended_next_action: "Request drawings and destination port.",
      },
    },
    warnings: [],
    approval_required: false,
  });

  assert.equal(cards[0].card_type, "inquiry_analysis_card");
  assert.equal(cards[0].title, "Website inquiry for curtain wall");
  assert.deepEqual(cards[0].missing_info, ["drawings", "destination port"]);
});

test("document draft result maps to document_draft_card", () => {
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "createDocumentDraft",
    result_summary: "Document draft created. Manual Review Required.",
    data: {
      document: {
        id: "doc_1",
        document_no: "CBM-PI-001",
        document_type: "proforma_invoice",
        customer_id: "cus_1",
        project_id: "proj_1",
        customer: { name: "Kevin" },
        seller: { company_name: "CBM GLOBAL LIMITED" },
        status: "DRAFT",
        internal_weight_factor: 1.1,
        internal_cost_note: "RMB cost hidden",
      },
      archive: {
        recommended_pdf_file_name: "Kevin_2026-4_Celeste4_PI_20260611_v1.pdf",
      },
      approval: {
        reasons: ["Command mentions high-risk term: PI"],
      },
    },
    warnings: ["Manual Review Required"],
    approval_required: true,
  });

  assert.equal(cards.some((card) => card.card_type === "approval_required_card"), true);
  const documentCard = cards.find((card) => card.card_type === "document_draft_card");
  assert.equal(documentCard.title, "CBM-PI-001");
  assert.equal(documentCard.approval_required, true);
  assert.equal(documentCard.manual_review_required, true);
  assert.ok(documentCard.related_links.some((link) => link.label === "Open Document Center"));
  assert.ok(documentCard.related_links.some((link) => link.href.includes("draft_id=doc_1")));
  assert.ok(documentCard.related_links.some((link) => link.href.includes("customer_id=cus_1")));
  assert.ok(documentCard.related_links.some((link) => link.href.includes("project_id=proj_1")));
});

test("document draft card hides forbidden internal fields", () => {
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "createDocumentDraft",
    result_summary: "Document draft created.",
    data: {
      document: {
        document_no: "CBM-PI-002",
        document_type: "proforma_invoice",
        customer: { name: "Kevin" },
        seller: { company_name: "CBM GLOBAL LIMITED" },
        internal_weight_factor: 1.1,
        internal_cost_note: "RMB cost and profit hidden",
        profit: 1000,
        margin: "20%",
        bank_account: "hidden",
        payment_terms: "hidden",
      },
    },
    warnings: ["Manual Review Required"],
    approval_required: true,
  });
  const text = JSON.stringify(cards);

  assert.equal(text.includes("internal_weight_factor"), false);
  assert.equal(text.includes("internal_cost_note"), false);
  assert.equal(text.includes("RMB cost"), false);
  assert.equal(text.includes("profit"), false);
  assert.equal(text.includes("margin"), false);
  assert.equal(text.includes("bank_account"), false);
  assert.equal(text.includes("payment_terms"), false);
});

test("PI draft card blocks Send official PI", () => {
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "createDocumentDraft",
    result_summary: "Document draft created.",
    data: { document: { document_no: "CBM-PI-003", document_type: "proforma_invoice" } },
    approval_required: true,
  });
  const documentCard = cards.find((card) => card.card_type === "document_draft_card");

  assert.ok(documentCard.blocked_actions.includes("Send official PI"));
});

test("high-risk PI command creates approval_required_card", () => {
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const cards = mapCommandResultToCards(parsed, {
    ok: false,
    tool_name: "approval_gate",
    result_summary: "Blocked until manual approval checkbox is ticked.",
    warnings: ["Manual Review Required"],
    approval_required: true,
  });

  assert.equal(cards[0].card_type, "approval_required_card");
  assert.equal(cards[0].approval_required, true);
});

test("archive command maps to archive_path_card", () => {
  const parsed = parseCommand("生成 Kevin 2026-4 的归档路径。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "buildArchivePath",
    result_summary: "Archive path preview generated.",
    data: {
      archive_path: "桌面 / MacBook Air / OneNote / Kevin / 2026-4",
      file_name: "Kevin_2026-4_Project_Document_20260611_v1.xlsx",
      zip_path: "MacBook Air/OneNote/Kevin/2026-4/Kevin_2026-4_Project_Document_20260611_v1.xlsx",
    },
    warnings: [],
    approval_required: false,
  });

  assert.equal(cards[0].card_type, "archive_path_card");
  assert.equal(cards[0].fields.some((field) => field.value.includes("2026-4")), true);
});

test("follow-up card includes Follow-up Workbench link", () => {
  const parsed = parseCommand("今天有哪些客户要跟进？");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "listTodayFollowUps",
    result_summary: "1 follow-up task needs attention.",
    data: {
      tasks: [{ id: "task_1", title: "Follow up Kevin", customer_id: "cus_1", inquiry_id: "inq_1", due_date: "2026-06-12", status: "PENDING" }],
    },
    approval_required: false,
  });

  assert.equal(cards[0].card_type, "followup_card");
  assert.ok(cards[0].related_links.some((link) => link.label === "Open Follow-up Workbench"));
  assert.ok(cards[0].related_links.some((link) => link.href.includes("task_id=task_1")));
  assert.ok(cards[0].related_links.some((link) => link.href.includes("filter=today")));
});

test("customer card includes Customer 360 link when customer_id exists", () => {
  const parsed = parseCommand("查一下巴拿马 Kevin 最近的项目和跟进任务。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "findCustomer",
    result_summary: "Found customer.",
    data: {
      customer: { id: "cus_1", name: "Kevin", country: "Panama" },
      inquiries: [],
      follow_up_tasks: [],
    },
    approval_required: false,
  });

  assert.ok(cards[0].related_links.some((link) => link.label === "Open Customer 360"));
  assert.ok(cards[0].related_links.some((link) => link.href.includes("view=customer-360")));
  assert.ok(cards[0].related_links.some((link) => link.href.includes("customer_id=cus_1")));
});

test("inquiry card includes Inquiry Detail and Lead Review links", () => {
  const parsed = parseCommand("分析最新网站询盘。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "analyzeLatestInquiry",
    result_summary: "Inquiry analyzed.",
    data: {
      inquiry: { id: "inq_1", title: "Website inquiry", source: "website", status: "NEW", lead_id: "lead_1" },
      analysis: { missing_info: [] },
    },
    approval_required: false,
  });

  assert.ok(cards[0].related_links.some((link) => link.label === "Open Inquiry Detail"));
  assert.ok(cards[0].related_links.some((link) => link.label === "Open Lead Review"));
  assert.ok(cards[0].related_links.some((link) => link.href.includes("inquiry_id=inq_1")));
  assert.ok(cards[0].related_links.some((link) => link.href.includes("lead_id=lead_1")));
});

test("missing IDs still produce safe generic links", () => {
  const parsed = parseCommand("生成 Kevin 2026-4 的归档路径。");
  const cards = mapCommandResultToCards(parsed, {
    ok: true,
    tool_name: "buildArchivePath",
    result_summary: "Archive path preview generated.",
    data: {},
    warnings: [],
    approval_required: false,
  });

  assert.ok(cards[0].related_links[0].href.startsWith("/trade-os-prototype?view=documents"));
});

test("unknown command maps to unknown_command_card", () => {
  const parsed = parseCommand("随便帮我搞一下这个事情");
  const cards = mapCommandResultToCards(parsed, {
    ok: false,
    tool_name: "unknown",
    result_summary: "Command intent is not supported yet.",
    warnings: ["No tool executed."],
    approval_required: false,
  });

  assert.equal(cards[0].card_type, "unknown_command_card");
  assert.equal(cards[0].summary, "No action was executed and no data was changed.");
});

test("approval_required remains true for quotation PI and customer message actions", () => {
  const quotationCards = mapCommandResultToCards(parseCommand("生成报价草稿"), {
    ok: false,
    tool_name: "approval_gate",
    result_summary: "Manual Review Required",
    approval_required: true,
  });
  const piCards = mapCommandResultToCards(parseCommand("生成 PI 草稿"), {
    ok: false,
    tool_name: "approval_gate",
    result_summary: "Manual Review Required",
    approval_required: true,
  });
  const messageCards = mapCommandResultToCards(parseCommand("发送消息给客户确认交期"), {
    ok: false,
    tool_name: "unknown",
    result_summary: "No action was executed.",
    approval_required: true,
  });

  assert.equal(quotationCards.some((card) => card.approval_required), true);
  assert.equal(piCards.some((card) => card.approval_required), true);
  assert.equal(messageCards.some((card) => card.approval_required), true);
});
