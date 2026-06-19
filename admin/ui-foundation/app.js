import { getAdminAccessToken } from "../../lib/admin-auth.js";

const navItems = [
  { id: "dashboard", label: "工作台" },
  { id: "inquiries", label: "询盘" },
  { id: "customers", label: "客户" },
  { id: "companies", label: "客户公司" },
  { id: "suppliers", label: "供应商", soon: true },
  { id: "products", label: "产品" },
  { id: "manufacturing-capabilities", label: "制造能力" },
  { id: "ai-drafts", label: "AI 复核" },
  { id: "quotations", label: "报价", soon: true },
  { id: "orders", label: "订单", soon: true },
  { id: "production", label: "生产", soon: true },
  { id: "shipping", label: "发货", soon: true },
  { id: "after-sales", label: "售后", soon: true },
  { id: "settings", label: "设置", soon: true },
];

const sections = {
  dashboard: {
    title: "CBM 工作台",
    description: "A calm operating view for leads, companies, products and draft reviews.",
    sectionTitle: "工作台",
    sectionHelp: "Foundation layout for future business modules.",
    content: renderDashboard,
    review: renderDashboardReview,
  },
  companies: {
    title: "公司",
    description: "只读公司列表，连接 Step 2A 公司 API。",
    sectionTitle: "公司管理",
    sectionHelp: "只读 API 列表。当前不支持创建、更新或删除。",
    content: renderCompanies,
    review: renderCompanyReview,
  },
  customers: {
    title: "客户",
    description: "只读客户列表，连接现有客户 API。",
    sectionTitle: "客户管理",
    sectionHelp: "只读 API 列表。当前不支持创建、更新、删除或导入。",
    content: renderCustomers,
    review: renderCustomerReview,
  },
  inquiries: {
    title: "询盘",
    description: "只读询盘列表，连接现有询盘 API。",
    sectionTitle: "询盘中心",
    sectionHelp: "只读 API 列表。当前不支持创建询盘、AI 自动处理或外发动作。",
    content: renderInquiries,
    review: renderInquiryReview,
  },
  products: {
    title: "产品",
    description: "只读产品列表，连接 Step 2A 产品 API。",
    sectionTitle: "产品管理",
    sectionHelp: "只读 API 列表。当前不支持创建、更新或删除。",
    content: renderProducts,
    review: renderProductReview,
  },
  "manufacturing-capabilities": {
    title: "制造能力",
    description: "只读制造能力列表，连接 Step 2A 制造能力 API。",
    sectionTitle: "制造能力",
    sectionHelp: "只读 API 列表。当前不支持创建、更新或删除。",
    content: renderManufacturingCapabilities,
    review: renderManufacturingCapabilityReview,
  },
  "ai-drafts": {
    title: "AI 草稿",
    description: "只读 AI 询盘分析草稿审核列表，连接 Step 2A API。",
    sectionTitle: "AI 询盘分析草稿审核",
    sectionHelp: "只读草稿列表。建议回复仅为草稿文本，不会自动发送。",
    content: renderAiDrafts,
    review: renderAiDraftReview,
  },
};

const comingSoonContent = {
  title: "Coming Soon",
  description: "This navigation item is reserved for a future phase.",
  sectionTitle: "Module Placeholder",
  sectionHelp: "No workflow is implemented in Step 2B.",
  content: renderComingSoon,
  review: renderComingSoonReview,
};

const navList = document.querySelector("#navList");
const pageTitle = document.querySelector("#pageTitle");
const pageDescription = document.querySelector("#pageDescription");
const sectionTitle = document.querySelector("#sectionTitle");
const sectionHelp = document.querySelector("#sectionHelp");
const mainContent = document.querySelector("#mainContent");
const reviewTitle = document.querySelector("#reviewTitle");
const reviewPanel = document.querySelector("#reviewPanel");

let activeSectionId = "dashboard";

const fallbackLabel = "Preview fallback / local preview data - not live Supabase data";
const apiUnavailableMessage =
  "Real API data is unavailable. You may not be logged in, the API may not be deployed, or this is local preview mode.";

const companyPreviewFallback = [
  {
    company_name: "Panama Project Buyer",
    country: "Panama",
    business_type: "Project contractor",
    notes: `${fallbackLabel}. API is unavailable or admin token is missing.`,
  },
  {
    company_name: "ABC Industries Ltd.",
    country: "United States",
    business_type: "Industrial buyer",
    notes: `${fallbackLabel}. No API writes are enabled.`,
  },
  {
    company_name: "Blue Horizon SA",
    country: "Brazil",
    business_type: "Facade distributor",
    notes: `${fallbackLabel}. Visual review only.`,
  },
];

const companyApiState = createReadOnlyState("companies");

const customerPreviewFallback = [
  {
    name: "DEMO Customer Contact",
    aliases: "DEMO Customer Company",
    country: "Panama",
    language: "English",
    email: "demo@example.com",
    whatsapp: "+000000000",
    source: "local preview",
    stage: "read-only preview",
    business_line: "A_ARCHITECTURAL",
    last_contact_at: "",
    next_follow_up_at: "",
    notes: `${fallbackLabel}. Local preview customer only.`,
  },
  {
    name: "TEST Industrial Buyer",
    aliases: "TEST Industrial Company",
    country: "United States",
    language: "English",
    email: "industrial-demo@example.com",
    whatsapp: "",
    source: "local preview",
    stage: "read-only preview",
    business_line: "B_INDUSTRIAL",
    last_contact_at: "",
    next_follow_up_at: "",
    notes: `${fallbackLabel}. No customer import or write action is connected.`,
  },
];

const customerApiState = createReadOnlyState("customers");

const inquiryPreviewFallback = [
  {
    inquiry_type: "website inquiry",
    title: "DEMO hotel window package inquiry",
    lead_info: { name: "DEMO Contact", company: "DEMO Project Buyer" },
    business_line: "A_ARCHITECTURAL",
    product_category: "Windows and Doors",
    status: "NEED_REVIEW",
    original_message: `${fallbackLabel}. Preview inquiry only.`,
    ai_summary: "Local preview summary only.",
    missing_info: ["drawing package", "glass specification"],
    next_follow_up_at: "",
    created_at: "local preview",
  },
  {
    inquiry_type: "drawing inquiry",
    title: "TEST CNC aluminum bracket inquiry",
    lead_info: { name: "TEST Buyer", company: "TEST Industrial Company" },
    business_line: "B_INDUSTRIAL",
    product_category: "CNC Aluminum Parts",
    status: "NEW",
    original_message: `${fallbackLabel}. No inquiry creation is connected.`,
    ai_summary: "Local preview summary only.",
    missing_info: ["drawing file", "tolerance"],
    next_follow_up_at: "",
    created_at: "local preview",
  },
];

const inquiryApiState = createReadOnlyState("inquiries");

const productPreviewFallback = [
  {
    name_en: "Aluminum Window System",
    business_line: "A_ARCHITECTURAL",
    category: "Windows & Doors",
    product_family: "Architectural systems",
    material: "6063-T5 aluminum",
    surface: "Powder coated",
    notes: `${fallbackLabel}. API is unavailable or admin token is missing.`,
  },
  {
    name_en: "CNC Aluminum Bracket",
    business_line: "B_INDUSTRIAL",
    category: "CNC Parts",
    product_family: "Machined components",
    material: "6061 aluminum",
    surface: "Anodized",
    notes: `${fallbackLabel}. No API writes are enabled.`,
  },
  {
    name_en: "Custom Aluminum Profile",
    business_line: "UNKNOWN",
    category: "Extrusion",
    product_family: "Custom profile",
    material: "Aluminum alloy",
    surface: "To be confirmed",
    notes: `${fallbackLabel}. Business application needs review.`,
  },
];

const productApiState = createReadOnlyState("products");

const capabilityPreviewFallback = [
  {
    capability_line: "B_INDUSTRIAL",
    equipment: "CNC machining centers",
    quantity: 16,
    max_length: "To be confirmed",
    monthly_capacity: "Project-based capacity",
    public_description: `${fallbackLabel}. CNC machining capability for aluminum parts and components.`,
    internal_notes: "Admin preview only. API is unavailable or admin token is missing.",
  },
  {
    capability_line: "A_ARCHITECTURAL",
    equipment: "Aluminum extrusion lines",
    quantity: 2,
    max_length: "Up to project requirement",
    monthly_capacity: "Around 400 tons",
    public_description: `${fallbackLabel}. Extrusion support for project aluminum profiles.`,
    internal_notes: "Admin preview only. No API writes are enabled.",
  },
  {
    capability_line: "UNKNOWN",
    equipment: "Surface finishing support",
    quantity: null,
    max_length: "Anodizing up to 7.5m / powder coating up to 7m",
    monthly_capacity: "To be reviewed",
    public_description: `${fallbackLabel}. Surface finish support depends on drawing and color requirement.`,
    internal_notes: "Admin preview only. Capability line needs business review.",
  },
];

const capabilityApiState = createReadOnlyState("capabilities");

const aiDraftPreviewFallback = [
  {
    detected_business_line: "A_ARCHITECTURAL",
    extracted_requirements: { product: "hotel facade package", destination_port: "Balboa" },
    missing_information: ["glass specification", "drawing package", "aluminum color"],
    risk_flags: ["manual quotation review required"],
    suggested_reply:
      `${fallbackLabel}. Thank you for your inquiry. Please share drawings, glass specification, aluminum color, quantity and destination port for manual review.`,
    approval_required: true,
    created_at: "local preview",
  },
  {
    detected_business_line: "B_INDUSTRIAL",
    extracted_requirements: { product: "CNC aluminum connector", material: "6061 aluminum" },
    missing_information: ["drawing file", "tolerance", "surface finish", "quantity"],
    risk_flags: ["draft only", "do not confirm production feasibility"],
    suggested_reply:
      `${fallbackLabel}. Please send drawing files, tolerance, finish and quantity. Our team will review before any quotation.`,
    approval_required: true,
    created_at: "local preview",
  },
  {
    detected_business_line: "UNKNOWN",
    extracted_requirements: { product: "custom aluminum profile" },
    missing_information: ["application", "drawing", "quantity"],
    risk_flags: ["business line needs manual routing"],
    suggested_reply:
      `${fallbackLabel}. Please confirm the application and drawing details so we can route the inquiry correctly.`,
    approval_required: true,
    created_at: "local preview",
  },
];

const registryMetadataPreviewCards = [
  {
    title: "AI 草稿复核",
    description: "用于展示 AI 草稿的风险、审核状态和禁用能力。",
    safetyLabels: ["仅预览", "只读", "不执行助手", "不可发送", "不可审批"],
  },
  {
    title: "沟通复核",
    description: "用于展示沟通内容、附件类型、敏感信息和人工复核提示。",
    safetyLabels: ["仅预览", "只读", "不自动回复", "不创建任务", "不上传或归档文件"],
  },
  {
    title: "询盘复核",
    description: "用于展示询盘、沟通复核、AI 草稿复核、缺失信息和风险标记。",
    safetyLabels: ["仅预览", "只读", "不生成报价", "不生成 PI", "不创建订单", "不触发付款 / 生产 / 发货"],
  },
];

const workbenchOverviewCards = [
  {
    label: "新询盘",
    value: "5",
    subtitle: "今日新增待查看询盘",
    tone: "info",
  },
  {
    label: "需要人工复核",
    value: "8",
    subtitle: "AI 草稿、沟通或询盘需要复核",
    tone: "warning",
  },
  {
    label: "缺失信息",
    value: "4",
    subtitle: "图纸、规格、数量或交期信息缺失",
    tone: "warning",
  },
  {
    label: "今日跟进",
    value: "6",
    subtitle: "需要联系客户或供应商",
    tone: "info",
  },
  {
    label: "高风险提醒",
    value: "2",
    subtitle: "涉及价格、付款、交期或质量责任",
    tone: "danger",
  },
  {
    label: "AI 草稿待审",
    value: "3",
    subtitle: "仅草稿，发送前必须人工确认",
    tone: "neutral",
  },
];

const workbenchQueueItems = [
  {
    title: "秘鲁客户询盘：缺少图纸 / 规格",
    category: "询盘",
    priority: "P1",
    meta: "客户资料待补齐",
    badges: ["缺失信息", "需要复核"],
    recommendedAction: "补充图纸和产品规格后再继续报价判断",
    disabledCapabilities: ["不可发送", "不可报价", "不可生成 PI"],
  },
  {
    title: "AI 回复草稿：涉及价格，需要复核",
    category: "AI 草稿",
    priority: "P1",
    meta: "价格 / 交期敏感",
    badges: ["高风险", "需要人工复核"],
    recommendedAction: "人工确认价格、交期和付款条款后再使用",
    disabledCapabilities: ["不可发送", "不可审批"],
  },
  {
    title: "供应商报价附件：需要人工查看",
    category: "附件 / 供应商",
    priority: "P2",
    meta: "报价附件待确认",
    badges: ["附件复核", "供应商报价"],
    recommendedAction: "确认报价有效期、币种、交期和规格",
    disabledCapabilities: ["不可生成客户报价", "不可确认订单"],
  },
  {
    title: "客户跟进：已超过计划跟进时间",
    category: "客户跟进",
    priority: "P2",
    meta: "跟进节奏待判断",
    badges: ["待跟进"],
    recommendedAction: "人工决定是否发送跟进消息",
    disabledCapabilities: ["不可自动发送", "不可创建任务"],
  },
  {
    title: "制造能力问题：不得承诺交期",
    category: "制造能力",
    priority: "P1",
    meta: "产能 / 交期需核实",
    badges: ["需要复核", "不承诺交期"],
    recommendedAction: "人工核实产能、设备和供应商反馈",
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可发货"],
  },
];

const inquiryWorkflowSummaryCards = [
  {
    label: "新询盘",
    value: "5",
    subtitle: "今日新增待查看询盘",
    tone: "info",
  },
  {
    label: "缺失信息",
    value: "4",
    subtitle: "图纸、规格或认证要求待补齐",
    tone: "warning",
  },
  {
    label: "高风险",
    value: "2",
    subtitle: "质量、赔付、价格或交期相关",
    tone: "danger",
  },
  {
    label: "待客户确认",
    value: "3",
    subtitle: "客户需求或技术资料未确认",
    tone: "info",
  },
  {
    label: "待供应商确认",
    value: "2",
    subtitle: "型号、包装、认证或交期待反馈",
    tone: "neutral",
  },
  {
    label: "AI 初判待复核",
    value: "6",
    subtitle: "仅建议，必须人工确认后使用",
    tone: "warning",
  },
];

const inquiryWorkflowItems = [
  {
    title: "秘鲁客户轻钢龙骨询盘",
    category: "询盘",
    status: "缺失信息",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["图纸", "厚度确认", "包装方式"],
    aiSuggestion: "先补充规格和厚度，再让供应商按重量报价。",
    disabledCapabilities: ["不可报价", "不可生成 PI", "不可确认订单"],
  },
  {
    title: "南美客户高尔夫球车询盘",
    category: "询盘",
    status: "待供应商确认",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["电池规格", "装柜数量", "认证要求"],
    aiSuggestion: "先确认型号、装柜数量、包装和目的港要求。",
    disabledCapabilities: ["不可报价", "不可确认交期", "不可生成合同"],
  },
  {
    title: "沿海项目铝型材问题反馈",
    category: "质量反馈",
    status: "高风险",
    risk: "高",
    riskTone: "danger",
    missingInfo: ["项目环境说明", "表面处理记录", "使用位置照片"],
    aiSuggestion: "先按质量问题流程收集证据，不要承认责任或承诺赔付。",
    disabledCapabilities: ["不可承诺赔付", "不可确认责任", "不可发送最终结论"],
  },
  {
    title: "印尼工厂吊顶系统询盘",
    category: "询盘",
    status: "待内部核算",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["安装损耗", "包装方式", "供应商最终报价"],
    aiSuggestion: "先整理材料表和供应商询价，再形成内部核算草稿。",
    disabledCapabilities: ["不可报价", "不可确认交期", "不可确认生产"],
  },
  {
    title: "PD/PT 门安装支持需求",
    category: "技术支持",
    status: "技术资料缺失",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["安装手册", "五金系统确认", "视频说明"],
    aiSuggestion: "先整理安装资料和系统差异说明，再发客户。",
    disabledCapabilities: ["不可承诺安装结果", "不可发送未经确认手册", "不可确认售后责任"],
  },
];

const customerWorkflowSummaryCards = [
  {
    label: "活跃客户",
    value: "12",
    subtitle: "近期有询盘、跟进或项目讨论",
    tone: "info",
  },
  {
    label: "今日需跟进",
    value: "5",
    subtitle: "需要人工判断是否联系客户",
    tone: "warning",
  },
  {
    label: "有活跃询盘",
    value: "7",
    subtitle: "正在确认规格、价格或供应商反馈",
    tone: "info",
  },
  {
    label: "高价值客户",
    value: "3",
    subtitle: "优先维护的大项目或复购客户",
    tone: "neutral",
  },
  {
    label: "风险客户",
    value: "2",
    subtitle: "涉及质量、赔付或商业承诺风险",
    tone: "danger",
  },
  {
    label: "待补资料客户",
    value: "4",
    subtitle: "公司、规格、付款或交期资料不完整",
    tone: "warning",
  },
];

const customerWorkflowItems = [
  {
    title: "加勒比建筑客户",
    stage: "活跃询盘",
    valueLevel: "高",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "门窗五金 / 建筑材料项目",
    need: "确认客户最终规格、付款节奏和目标交期。",
    aiSuggestion: "优先维护，先整理历史报价和当前询盘，再准备人工复核后的跟进内容。",
    disabledCapabilities: ["不可自动发送", "不可自动报价", "不可生成 PI"],
  },
  {
    title: "秘鲁建材客户",
    stage: "规格确认",
    valueLevel: "中",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "轻钢龙骨 / drywall materials",
    need: "补充厚度、包装、装柜和目的港信息。",
    aiSuggestion: "先把缺失信息整理成客户确认清单，再同步供应商询价。",
    disabledCapabilities: ["不可报价", "不可确认装柜", "不可生成合同"],
  },
  {
    title: "南美高尔夫球车客户",
    stage: "供应商确认",
    valueLevel: "中",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "高尔夫球车整柜采购",
    need: "确认型号、电池、认证、包装和装柜数量。",
    aiSuggestion: "先向供应商确认装柜方案和配置差异，再给客户做选项对比。",
    disabledCapabilities: ["不可确认交期", "不可承诺价格", "不可确认订单"],
  },
  {
    title: "沿海项目客户",
    stage: "售后风险",
    valueLevel: "中",
    risk: "高",
    riskTone: "danger",
    recentInquiry: "铝型材发黄问题反馈",
    need: "收集项目环境、照片、表面处理记录和使用位置。",
    aiSuggestion: "按质量问题流程处理，避免直接承认责任或承诺赔付。",
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "不可发送最终结论"],
  },
  {
    title: "印尼工业项目客户",
    stage: "内部核算",
    valueLevel: "高",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "工厂吊顶系统",
    need: "整理材料表、供应商报价、包装和施工损耗。",
    aiSuggestion: "先形成内部核算草稿，再进入人工报价复核。",
    disabledCapabilities: ["不可报价", "不可确认生产", "不可确认交期"],
  },
];

const aiDraftApiState = createReadOnlyState("drafts");

function badge(label, type = "") {
  return `<span class="badge ${type}">${escapeHtml(label)}</span>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function businessBadge(value) {
  if (value === "A_ARCHITECTURAL") return badge("Architectural", "architectural");
  if (value === "B_INDUSTRIAL") return badge("Industrial", "industrial");
  return badge("Unknown", "unknown");
}

function renderNav() {
  navList.innerHTML = navItems
    .map(
      (item) => `
        <button class="nav-button" type="button" data-section="${item.id}" ${item.soon ? "aria-disabled=\"true\"" : ""}>
          <span>${escapeHtml(item.label)}</span>
          ${item.soon ? "<small>稍后</small>" : ""}
        </button>
      `,
    )
    .join("");

  navList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (!button) return;
    setSection(button.dataset.section);
  });
}

function setSection(sectionId) {
  activeSectionId = sectionId;
  const config = sections[sectionId] || comingSoonContent;
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
  pageTitle.textContent = config.title;
  pageDescription.textContent = config.description;
  sectionTitle.textContent = config.sectionTitle;
  sectionHelp.textContent = config.sectionHelp;
  mainContent.innerHTML = config.content(sectionId);
  reviewTitle.textContent = config.title === "Coming Soon" ? "Module Status" : "复核面板";
  reviewPanel.innerHTML = config.review(sectionId);
  if (sectionId === "companies") {
    loadCompaniesReadOnly();
  }
  if (sectionId === "customers") {
    loadCustomersReadOnly();
  }
  if (sectionId === "inquiries") {
    loadInquiriesReadOnly();
  }
  if (sectionId === "products") {
    loadProductsReadOnly();
  }
  if (sectionId === "manufacturing-capabilities") {
    loadManufacturingCapabilitiesReadOnly();
  }
  if (sectionId === "ai-drafts") {
    loadAiDraftsReadOnly();
  }
}

function renderDashboard() {
  return `
    <div class="workbench-preview" aria-label="静态工作台预览">
      <div class="workbench-header">
        <div>
          <span class="state-label">工作台</span>
          <h3>CBM 工作台 / 今日待处理</h3>
          <p>静态预览数据，仅用于验证工作台信息层级；不调用 API、不执行助手、不写入数据。</p>
        </div>
        <div class="workbench-badges" aria-label="工作台预览状态">
          ${badge("静态预览", "active")}
          ${badge("只读", "active")}
          ${badge("不执行动作", "pending")}
        </div>
      </div>

      <section class="workbench-section" aria-label="今日概览">
        <div class="workbench-section-header">
          <div>
            <h3>今日概览</h3>
            <p>把需要注意的询盘、草稿、缺失信息和风险先压缩成可扫读数字。</p>
          </div>
          <span>静态数据</span>
        </div>
        <div class="workbench-summary-grid">
          ${workbenchOverviewCards.map(renderWorkbenchCard).join("")}
        </div>
      </section>

      <div class="workbench-layout">
        <section class="workbench-queue" aria-label="静态待处理队列">
          <div class="workbench-section-header">
            <div>
              <h3>待处理队列</h3>
              <p>按人工复核优先级排列，队列项仅展示建议，不触发任何业务动作。</p>
            </div>
            <span>5 条静态示例</span>
          </div>
          ${workbenchQueueItems.map(renderWorkbenchQueueItem).join("")}
        </section>
        <aside class="workbench-review-panel" aria-label="只读复核预览">
          ${renderWorkbenchStaticReview()}
        </aside>
      </div>
    </div>
  `;
}

function renderDashboardReview() {
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>工作台只读边界</h3>
        <ul class="check-list">
          <li>不调用 API，不执行助手，不写入数据库</li>
          <li>不发送、不审批、不创建任务</li>
          <li>不生成报价、PI、订单，不触发付款 / 生产 / 发货</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>预览目标</h3>
        <p>先验证工作台、今日待处理、复核队列和只读详情面板的产品方向，再进入任何真实数据或业务流程。</p>
      </div>
    </div>
  `;
}

function renderWorkbenchCard(card) {
  return `
    <article class="workbench-card ${card.tone ? `workbench-card-${escapeHtml(card.tone)}` : ""}">
      <span>${escapeHtml(card.label)}</span>
      <div class="workbench-card-value">
        <strong>${escapeHtml(card.value)}</strong>
      </div>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderWorkbenchQueueItem(item) {
  const badgeHtml = item.badges
    .map((label) => badge(label, label.includes("高风险") ? "risk" : "approval"))
    .join(" ");
  const disabledHtml = item.disabledCapabilities
    .map((label) => `<span class="disabled-chip">${escapeHtml(label)}</span>`)
    .join("");

  return `
    <article class="workbench-queue-item">
      <div class="workbench-queue-topline">
        <div>
          <span class="workbench-category">${escapeHtml(item.category)}</span>
          <h4>${escapeHtml(item.title)}</h4>
          <small>${escapeHtml(item.meta)}</small>
        </div>
        <span class="workbench-priority">${escapeHtml(item.priority)}</span>
      </div>
      <div class="workbench-badges">${badgeHtml}</div>
      <p><strong>推荐人工动作：</strong>${escapeHtml(item.recommendedAction)}</p>
      <div class="disabled-chip-row" aria-label="禁用能力">${disabledHtml}</div>
    </article>
  `;
}

function renderWorkbenchStaticReview() {
  return `
    <div class="workbench-review-heading">
      <div>
        <h3>只读复核预览</h3>
        <p class="workbench-review-note">固定示例：秘鲁客户询盘，缺少图纸 / 规格。</p>
      </div>
      ${badge("不执行动作", "pending")}
    </div>

    <dl class="workbench-review-list">
      <dt>摘要</dt>
      <dd>客户询盘需要补充图纸、规格和目标数量后，才能进入报价判断。</dd>
      <dt>推荐人工动作</dt>
      <dd>先补齐关键信息，再由人工决定是否进入供应商询价或报价准备。</dd>
      <dt>技术说明</dt>
      <dd>静态预览，不调用 API、不执行助手、不写入数据库。</dd>
    </dl>

    <div class="workbench-review-group">
      <h4>风险 / 缺失信息</h4>
      <ul class="check-list">
        <li>缺少图纸</li>
        <li>缺少产品规格</li>
        <li>未确认目标数量</li>
        <li>不应直接承诺价格或交期</li>
      </ul>
    </div>

    <div class="workbench-review-group">
      <h4>禁用能力</h4>
      <div class="disabled-chip-row">
        <span class="disabled-chip">不可发送</span>
        <span class="disabled-chip">不可报价</span>
        <span class="disabled-chip">不可生成 PI</span>
        <span class="disabled-chip">不可下单</span>
        <span class="disabled-chip">不可触发付款 / 生产 / 发货</span>
      </div>
    </div>
  `;
}

function renderCompanies() {
  if (companyApiState.status === "idle" || companyApiState.status === "loading") {
    return renderCompaniesLoading();
  }

  if (companyApiState.status === "empty") {
    return renderCompaniesEmpty();
  }

  const statusNotice =
    companyApiState.status === "error"
      ? renderDataStatus("error", "公司 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${companyApiState.error}`)
      : renderDataStatus("success", "公司数据已加载", `Source: ${companyApiState.source}. Read-only list. No create, update or delete action is connected.`);

  return `
    ${statusNotice}
    ${renderCompanyTable(companyApiState.companies, companyApiState.source)}
    ${renderReadOnlyCompanyCard()}
  `;
}

function renderCompanyReview() {
  return renderReviewDetails({
    title: "公司 API 状态",
    badges: [badge("Read-only", "active"), badge(companyApiState.source, companyApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API 路由", "GET /api/companies"],
      ["记录数量", String(companyApiState.companies.length)],
      ["写入动作", "未连接"],
    ],
    draft: "Companies are shown as a read-only list in Step 2C-1. Create, update, delete, quotations, PI and message sending are not implemented.",
  });
}

function renderCompaniesLoading() {
  return `
    ${renderDataStatus("loading", "正在加载公司", "Requesting GET /api/companies with the current admin session when available.")}
    <div class="table-wrap table-skeleton" aria-label="Loading company rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderCompaniesEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时公司数据", "No live data is currently available. This page is read-only; write/create support will come in a later approved phase.")}
    ${renderReadOnlyCompanyCard()}
  `;
}

function renderCompanyTable(companies, source) {
  const rows = [
    ["公司", "国家", "类型", "来源", "备注"],
    ...companies.map((company) => [
      company.company_name || "Unnamed company",
      escapeHtml(company.country || "Unknown"),
      escapeHtml(company.business_type || "Not classified"),
      badge(source === "api" ? "API" : fallbackLabel, source === "api" ? "active" : "pending"),
      escapeHtml(company.notes || "No notes"),
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (company) => company.website || company.id || "Read-only company record",
    bodyData: companies,
  });
}

function renderReadOnlyCompanyCard() {
  return `
    <div class="form-card read-only-card">
      <h3>公司查看模式</h3>
      <p>This card remains a static review pattern. It does not submit data or create records.</p>
      <div class="form-grid">
        <label class="field">
          <span>允许动作</span>
          <input type="text" value="只读查看" readonly />
          <small>No create or update API call is connected.</small>
        </label>
        <label class="field">
          <span>安全边界</span>
          <input type="text" value="不自动发送或承诺" readonly />
          <small>Messages, quotations and PI are not sent.</small>
        </label>
      </div>
    </div>
  `;
}

function renderCustomers() {
  if (customerApiState.status === "idle" || customerApiState.status === "loading") {
    return `
      ${renderCustomersLoading()}
      ${renderCustomerWorkflowPreview()}
    `;
  }

  if (customerApiState.status === "empty") {
    return `
      ${renderCustomersEmpty()}
      ${renderCustomerWorkflowPreview()}
    `;
  }

  const statusNotice =
    customerApiState.status === "error"
      ? renderDataStatus("error", "客户 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${customerApiState.error}`)
      : renderDataStatus("success", "客户数据已加载", `Source: ${customerApiState.source}. 只读 CRM 列表，未连接创建、更新、导入或删除动作。`);

  return `
    ${statusNotice}
    ${renderCustomerWorkflowPreview()}
  `;
}

function renderCustomerReview() {
  return `
    <div class="review-stack">
      <div class="review-card customer-review-card">
        <div class="customer-review-heading">
          <div>
            <h3>客户复核预览</h3>
            <p>固定示例：加勒比建筑客户。</p>
          </div>
          ${badge("静态", "draft")}
        </div>
        <dl>
          <dt>客户摘要</dt>
          <dd>高价值建筑类客户，当前有门窗五金 / 建筑材料项目询盘，需要人工整理历史报价和当前需求。</dd>
          <dt>当前阶段</dt>
          <dd>活跃询盘，价值高，风险中。</dd>
          <dt>最近询盘</dt>
          <dd>门窗五金 / 建筑材料项目。</dd>
          <dt>需要补充</dt>
          <dd>最终规格、付款节奏、目标交期和项目范围。</dd>
          <dt>风险点</dt>
          <dd>不能自动确认价格、交期、付款条件或正式 PI。</dd>
          <dt>AI 建议</dt>
          <dd>优先维护，先整理历史报价和当前询盘，再准备人工复核后的跟进内容。</dd>
          <dt>人工下一步</dt>
          <dd>业务人员先核对客户需求和历史记录，再决定是否进入供应商询价或报价准备。</dd>
        </dl>
        <div class="customer-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            <span class="disabled-chip">不可自动发送</span>
            <span class="disabled-chip">不可自动报价</span>
            <span class="disabled-chip">不可生成 PI</span>
            <span class="disabled-chip">不可确认订单</span>
          </div>
        </div>
      </div>
      <div class="review-card">
        <h3>客户 API 状态</h3>
        <dl>
          <dt>API 路由</dt>
          <dd>GET /api/customers</dd>
          <dt>记录数量</dt>
          <dd>${escapeHtml(String(customerApiState.customers.length))}</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
    </div>
  `;
}

function renderCustomersLoading() {
  return `
    ${renderDataStatus("loading", "正在加载客户", "正在使用当前管理员会话请求 GET /api/customers。")}
    <div class="table-wrap table-skeleton" aria-label="正在加载客户行">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderCustomersEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时客户数据", "当前没有可用实时数据。本页面为只读；客户导入和创建支持将在后续批准阶段加入。")}
  `;
}

function renderCustomerWorkflowPreview() {
  return `
    <div class="customer-workflow-preview" aria-label="客户中心静态工作流预览">
      <div class="customer-workflow-header">
        <div>
          <span class="state-label">客户中心</span>
          <h3>客户中心</h3>
          <p>集中查看客户分层、跟进状态、活跃询盘和人工下一步动作。</p>
          <p class="customer-safety-note">静态预览数据，仅用于界面验证；所有跟进、报价、PI、订单、赔付和交期承诺必须人工复核。</p>
        </div>
        <div class="workbench-badges">
          ${badge("静态预览", "active")}
          ${badge("只读", "active")}
          ${badge("人工复核", "pending")}
        </div>
      </div>

      <section class="customer-workflow-section" aria-label="客户摘要">
        <div class="workbench-section-header">
          <div>
            <h3>客户概览</h3>
            <p>把客户价值、跟进状态、活跃询盘和风险先整理成可扫读队列。</p>
          </div>
          <span>静态数据</span>
        </div>
        <div class="customer-summary-grid">
          ${customerWorkflowSummaryCards.map(renderCustomerSummaryCard).join("")}
        </div>
      </section>

      <section class="customer-workflow-section" aria-label="客户处理队列">
        <div class="workbench-section-header">
          <div>
            <h3>客户处理队列</h3>
            <p>队列只展示人工建议和禁用能力，不触发跟进、报价或订单动作。</p>
          </div>
          <span>5 条静态示例</span>
        </div>
        <div class="customer-queue">
          ${customerWorkflowItems.map(renderCustomerQueueItem).join("")}
        </div>
      </section>

      ${renderReadOnlyCustomerCard()}
    </div>
  `;
}

function renderCustomerSummaryCard(card) {
  return `
    <article class="customer-summary-card customer-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderCustomerQueueItem(item) {
  const disabledHtml = item.disabledCapabilities
    .map((label) => `<span class="disabled-chip">${escapeHtml(label)}</span>`)
    .join("");

  return `
    <article class="customer-queue-item">
      <div class="customer-queue-main">
        <div class="customer-queue-title">
          <span class="workbench-category">${escapeHtml(item.recentInquiry)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="customer-queue-meta">
          ${badge(item.stage, item.stage.includes("风险") ? "risk" : "pending")}
          <span class="customer-value customer-value-${item.valueLevel === "高" ? "high" : "medium"}">价值 ${escapeHtml(item.valueLevel)}</span>
          <span class="customer-risk customer-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
        </div>
      </div>
      <p><strong>当前需要：</strong>${escapeHtml(item.need)}</p>
      <p><strong>AI 建议：</strong>${escapeHtml(item.aiSuggestion)}</p>
      <div class="customer-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
  `;
}

function renderCustomerTable(customers, source) {
  const rows = [
    ["客户姓名", "公司", "国家", "语言", "Email", "WhatsApp", "来源", "阶段", "业务线", "上次联系", "下次跟进", "备注"],
    ...customers.map((customer) => [
      displayValue(customer.name || customer.contact_name),
      escapeHtml(displayValue(customer.company_name || customer.company || customer.aliases || customer.company_id)),
      escapeHtml(displayValue(customer.country)),
      escapeHtml(displayValue(customer.language)),
      escapeHtml(displayValue(customer.email)),
      escapeHtml(displayValue(customer.whatsapp || customer.phone)),
      escapeHtml(displayValue(customer.source || customer.metadata?.source)),
      escapeHtml(displayValue(customer.stage || customer.status)),
      businessBadge(customer.business_line),
      escapeHtml(formatDateValue(customer.last_contact_at)),
      escapeHtml(formatDateValue(customer.next_follow_up_at)),
      `${badge(source === "api" ? "API" : fallbackLabel, source === "api" ? "active" : "pending")} ${escapeHtml(displayValue(customer.notes || customer.summary))}`,
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (customer) => customer.id || "只读客户记录",
    bodyData: customers,
  });
}

function renderReadOnlyCustomerCard() {
  return `
    <div class="form-card read-only-card customer-boundary-card">
      <h3>客户管理只读边界</h3>
      <p>本区域仅用于查看客户记录，不会创建、导入、更新或删除客户。</p>
      <div class="customer-boundary-grid">
        <div>
          <span>允许动作</span>
          <strong>只读客户查看</strong>
          <small>未连接客户导入、创建或编辑 API 调用。</small>
        </div>
        <div>
          <span>禁止动作</span>
          <strong>No send / quote / PI / order</strong>
          <small>商业动作需要后续批准阶段和人工审核。</small>
        </div>
      </div>
    </div>
  `;
}

function loadCustomersReadOnly() {
  return loadReadOnlyList({
    state: customerApiState,
    collectionKey: "customers",
    endpoint: "/api/customers",
    payloadKey: "customers",
    fallbackRecords: customerPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshCustomersView,
  });
}

function refreshCustomersView() {
  if (activeSectionId !== "customers") return;
  mainContent.innerHTML = renderCustomers();
  reviewPanel.innerHTML = renderCustomerReview();
}

function renderInquiries() {
  if (inquiryApiState.status === "idle" || inquiryApiState.status === "loading") {
    return `
      ${renderInquiriesLoading()}
      ${renderInquiryWorkflowPreview()}
    `;
  }

  if (inquiryApiState.status === "empty") {
    return `
      ${renderInquiriesEmpty()}
      ${renderInquiryWorkflowPreview()}
    `;
  }

  const statusNotice =
    inquiryApiState.status === "error"
      ? renderDataStatus("error", "询盘 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${inquiryApiState.error}`)
      : renderDataStatus("success", "询盘数据已加载", `Source: ${inquiryApiState.source}. 只读询盘列表，未连接创建、AI 自动处理、发送、报价或 PI 动作。`);

  return `
    ${statusNotice}
    ${renderInquiryWorkflowPreview()}
  `;
}

function renderInquiryReview() {
  return `
    <div class="review-stack">
      <div class="review-card inquiry-review-card">
        <div class="inquiry-review-heading">
          <div>
            <h3>询盘复核预览</h3>
            <p>固定示例：秘鲁客户轻钢龙骨询盘。</p>
          </div>
          ${badge("静态", "draft")}
        </div>
        <dl>
          <dt>客户需求摘要</dt>
          <dd>客户询问轻钢龙骨材料，需要补充图纸、厚度和包装方式后，才能进入供应商询价或报价判断。</dd>
          <dt>缺失信息</dt>
          <dd>图纸、厚度确认、包装方式。</dd>
          <dt>风险点</dt>
          <dd>规格不完整，不能直接判断价格、交期、生产可行性或最终订单条件。</dd>
          <dt>AI 建议</dt>
          <dd>先补充规格和厚度，再让供应商按重量报价。</dd>
          <dt>人工下一步</dt>
          <dd>由业务人员确认图纸、厚度、数量、包装和目的港，再决定是否进入供应商询价。</dd>
        </dl>
        <div class="inquiry-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            <span class="disabled-chip">不可报价</span>
            <span class="disabled-chip">不可生成 PI</span>
            <span class="disabled-chip">不可确认订单</span>
            <span class="disabled-chip">不可触发付款 / 生产 / 发货</span>
          </div>
        </div>
      </div>
      <div class="review-card">
        <h3>询盘 API 状态</h3>
        <dl>
          <dt>API 路由</dt>
          <dd>GET /api/inquiries</dd>
          <dt>记录数量</dt>
          <dd>${escapeHtml(String(inquiryApiState.inquiries.length))}</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
    </div>
  `;
}

function renderInquiriesLoading() {
  return `
    ${renderDataStatus("loading", "正在加载询盘", "正在使用当前管理员会话请求 GET /api/inquiries。")}
    <div class="table-wrap table-skeleton" aria-label="正在加载询盘行">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderInquiriesEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时询盘数据", "当前没有可用实时数据。本页面为只读；询盘创建和 AI 处理将在后续批准阶段加入。")}
  `;
}

function renderInquiryWorkflowPreview() {
  return `
    <div class="inquiry-workflow-preview" aria-label="询盘中心静态工作流预览">
      <div class="inquiry-workflow-header">
        <div>
          <span class="state-label">询盘中心</span>
          <h3>询盘中心</h3>
          <p>集中查看新询盘、缺失信息、风险提醒和人工下一步动作。</p>
          <p class="inquiry-safety-note">静态预览数据，仅用于界面验证；所有报价、PI、订单、赔付和交期承诺必须人工复核。</p>
        </div>
        <div class="workbench-badges">
          ${badge("静态预览", "active")}
          ${badge("只读", "active")}
          ${badge("人工复核", "pending")}
        </div>
      </div>

      <section class="inquiry-workflow-section" aria-label="询盘摘要">
        <div class="workbench-section-header">
          <div>
            <h3>询盘概览</h3>
            <p>先把新询盘、缺失资料、风险和待确认事项整理成可扫读状态。</p>
          </div>
          <span>静态数据</span>
        </div>
        <div class="inquiry-summary-grid">
          ${inquiryWorkflowSummaryCards.map(renderInquirySummaryCard).join("")}
        </div>
      </section>

      <section class="inquiry-workflow-section" aria-label="询盘处理队列">
        <div class="workbench-section-header">
          <div>
            <h3>待处理询盘队列</h3>
            <p>队列只展示人工建议和禁用能力，不触发报价、发送或订单动作。</p>
          </div>
          <span>5 条静态示例</span>
        </div>
        <div class="inquiry-queue">
          ${inquiryWorkflowItems.map(renderInquiryQueueItem).join("")}
        </div>
      </section>

      ${renderReadOnlyInquiryCard()}
    </div>
  `;
}

function renderInquirySummaryCard(card) {
  return `
    <article class="inquiry-summary-card inquiry-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderInquiryQueueItem(item) {
  const missingInfoHtml = item.missingInfo
    .map((label) => `<span class="inquiry-chip">${escapeHtml(label)}</span>`)
    .join("");
  const disabledHtml = item.disabledCapabilities
    .map((label) => `<span class="disabled-chip">${escapeHtml(label)}</span>`)
    .join("");

  return `
    <article class="inquiry-queue-item">
      <div class="inquiry-queue-main">
        <div class="inquiry-queue-title">
          <span class="workbench-category">${escapeHtml(item.category)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="inquiry-queue-meta">
          ${badge(item.status, item.status === "高风险" ? "risk" : "pending")}
          <span class="inquiry-risk inquiry-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
        </div>
      </div>
      <div class="inquiry-row-group">
        <span>缺失信息</span>
        <div class="inquiry-chip-row">${missingInfoHtml}</div>
      </div>
      <p><strong>AI 建议：</strong>${escapeHtml(item.aiSuggestion)}</p>
      <div class="inquiry-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
  `;
}

function renderInquiryTable(inquiries, source) {
  const rows = [
    ["询盘类型", "客户", "公司", "业务线", "产品分类", "状态", "原始消息 / 摘要", "缺失信息", "下次跟进", "创建时间"],
    ...inquiries.map((inquiry) => [
      displayValue(inquiry.inquiry_type || inquiry.project_type || inquiry.source),
      escapeHtml(displayValue(inquiry.lead_info?.name || inquiry.customer_name || inquiry.customer_id)),
      escapeHtml(displayValue(inquiry.lead_info?.company || inquiry.company_name || inquiry.company_id)),
      businessBadge(inquiry.business_line),
      escapeHtml(displayValue(inquiry.product_category || inquiry.project_type)),
      escapeHtml(displayValue(inquiry.status)),
      escapeHtml(displayValue(inquiry.original_message || inquiry.project_description || inquiry.ai_summary || inquiry.title)),
      escapeHtml(formatList(inquiry.missing_info)),
      escapeHtml(formatDateValue(inquiry.next_follow_up_at)),
      escapeHtml(formatDateValue(inquiry.created_at)),
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (inquiry) => `${source === "api" ? "API" : fallbackLabel} · ${inquiry.id || "只读询盘记录"}`,
    bodyData: inquiries,
  });
}

function renderReadOnlyInquiryCard() {
  return `
    <div class="form-card read-only-card inquiry-boundary-card">
      <h3>询盘中心只读边界</h3>
      <p>本区域仅用于查看现有询盘，不会创建询盘或运行 AI 自动处理。</p>
      <div class="inquiry-boundary-grid">
        <div>
          <span>允许动作</span>
          <strong>只读询盘查看</strong>
          <small>本界面未连接询盘创建、POST 或 PATCH 动作。</small>
        </div>
        <div>
          <span>禁止动作</span>
          <strong>No send / quote / PI / order</strong>
          <small>不会执行外发消息、报价、PI 或业务承诺。</small>
        </div>
      </div>
    </div>
  `;
}

function loadInquiriesReadOnly() {
  return loadReadOnlyList({
    state: inquiryApiState,
    collectionKey: "inquiries",
    endpoint: "/api/inquiries",
    payloadKey: "inquiries",
    fallbackRecords: inquiryPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshInquiriesView,
  });
}

function refreshInquiriesView() {
  if (activeSectionId !== "inquiries") return;
  mainContent.innerHTML = renderInquiries();
  reviewPanel.innerHTML = renderInquiryReview();
}

function renderDataStatus(type, title, message) {
  return `
    <div class="data-status ${escapeHtml(type)}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function createReadOnlyState(collectionKey) {
  return {
    status: "idle",
    [collectionKey]: [],
    error: "",
    source: "not loaded",
  };
}

async function loadReadOnlyList({ state, collectionKey, endpoint, payloadKey, fallbackRecords, fallbackSource, refresh, normalize = (records) => records }) {
  state.status = "loading";
  state.error = "";
  state.source = "api";
  refresh();

  try {
    const token = getAdminAccessToken();
    const response = await fetch(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `${endpoint} failed with ${response.status}`);
    }
    const records = Array.isArray(payload[payloadKey]) ? payload[payloadKey] : [];
    state.status = records.length ? "loaded" : "empty";
    state[collectionKey] = normalize(records);
    state.source = "api";
  } catch (error) {
    state.status = "error";
    state.error = error.message || "Unknown API error";
    state[collectionKey] = normalize(fallbackRecords);
    state.source = fallbackSource;
  }

  refresh();
}

function loadCompaniesReadOnly() {
  return loadReadOnlyList({
    state: companyApiState,
    collectionKey: "companies",
    endpoint: "/api/companies",
    payloadKey: "companies",
    fallbackRecords: companyPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshCompaniesView,
  });
}

function refreshCompaniesView() {
  if (activeSectionId !== "companies") return;
  mainContent.innerHTML = renderCompanies();
  reviewPanel.innerHTML = renderCompanyReview();
}

function renderProducts() {
  if (productApiState.status === "idle" || productApiState.status === "loading") {
    return renderProductsLoading();
  }

  if (productApiState.status === "empty") {
    return renderProductsEmpty();
  }

  const statusNotice =
    productApiState.status === "error"
      ? renderDataStatus("error", "产品 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${productApiState.error}`)
      : renderDataStatus("success", "产品数据已加载", `Source: ${productApiState.source}. Read-only list. No create, update or delete action is connected.`);

  return `
    ${statusNotice}
    ${renderProductTable(productApiState.products, productApiState.source)}
    ${renderReadOnlyProductCard()}
  `;
}

function renderProductReview() {
  return renderReviewDetails({
    title: "产品 API 状态",
    badges: [badge("Read-only", "active"), badge(productApiState.source, productApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API 路由", "GET /api/products"],
      ["记录数量", String(productApiState.products.length)],
      ["写入动作", "未连接"],
    ],
    draft: "Products are shown as a read-only list in Step 2C-2. Create, update, delete, quotations, PI and message sending are not implemented.",
  });
}

function renderProductsLoading() {
  return `
    ${renderDataStatus("loading", "正在加载产品", "Requesting GET /api/products with the current admin session when available.")}
    <div class="table-wrap table-skeleton" aria-label="Loading product rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderProductsEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时产品数据", "No live data is currently available. This page is read-only; write/create support will come in a later approved phase.")}
    ${renderReadOnlyProductCard()}
  `;
}

function renderProductTable(products, source) {
  const rows = [
    ["产品名称", "业务线", "分类", "产品系列", "材质", "表面处理", "状态 / 备注"],
    ...products.map((product) => [
      product.name_en || product.name_cn || product.code || "Unnamed product",
      businessBadge(product.business_line),
      escapeHtml(product.category || "Unclassified"),
      escapeHtml(product.product_family || "Not set"),
      escapeHtml(product.material || "To be confirmed"),
      escapeHtml(product.surface || "To be confirmed"),
      `${badge(source === "api" ? "API" : fallbackLabel, source === "api" ? "active" : "pending")} ${escapeHtml(product.notes || "No notes")}`,
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (product) => product.code || product.id || "Read-only product record",
    bodyData: products,
  });
}

function renderReadOnlyProductCard() {
  return `
    <div class="form-card read-only-card">
      <h3>产品查看模式</h3>
      <p>This card remains a static review pattern. It does not submit data or create records.</p>
      <div class="form-grid">
        <label class="field">
          <span>允许动作</span>
          <input type="text" value="只读产品查看" readonly />
          <small>No create, update or delete API call is connected.</small>
        </label>
        <label class="field">
          <span>业务线</span>
          <input type="text" value="A_ARCHITECTURAL / B_INDUSTRIAL / UNKNOWN" readonly />
          <small>Business-line labels are display-only in this step.</small>
        </label>
      </div>
    </div>
  `;
}

function loadProductsReadOnly() {
  return loadReadOnlyList({
    state: productApiState,
    collectionKey: "products",
    endpoint: "/api/products",
    payloadKey: "products",
    fallbackRecords: productPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshProductsView,
  });
}

function refreshProductsView() {
  if (activeSectionId !== "products") return;
  mainContent.innerHTML = renderProducts();
  reviewPanel.innerHTML = renderProductReview();
}

function renderManufacturingCapabilities() {
  if (capabilityApiState.status === "idle" || capabilityApiState.status === "loading") {
    return renderManufacturingCapabilitiesLoading();
  }

  if (capabilityApiState.status === "empty") {
    return renderManufacturingCapabilitiesEmpty();
  }

  const statusNotice =
    capabilityApiState.status === "error"
      ? renderDataStatus("error", "制造能力 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${capabilityApiState.error}`)
      : renderDataStatus("success", "制造能力数据已加载", `Source: ${capabilityApiState.source}. Read-only list. No create, update or delete action is connected.`);

  return `
    ${statusNotice}
    ${renderManufacturingCapabilityTable(capabilityApiState.capabilities, capabilityApiState.source)}
    ${renderReadOnlyCapabilityCard()}
  `;
}

function renderManufacturingCapabilityReview() {
  return renderReviewDetails({
    title: "制造能力 API 状态",
    badges: [badge("Read-only", "active"), badge(capabilityApiState.source, capabilityApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API 路由", "GET /api/manufacturing-capabilities"],
      ["记录数量", String(capabilityApiState.capabilities.length)],
      ["写入动作", "未连接"],
    ],
    draft: "Manufacturing capabilities are shown as a read-only admin list in Step 2C-3. This page does not confirm production feasibility, quotation, delivery time or supplier commitments.",
  });
}

function renderManufacturingCapabilitiesLoading() {
  return `
    ${renderDataStatus("loading", "正在加载制造能力", "Requesting GET /api/manufacturing-capabilities with the current admin session when available.")}
    <div class="table-wrap table-skeleton" aria-label="Loading manufacturing capability rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderManufacturingCapabilitiesEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时制造能力数据", "No live data is currently available. This page is read-only; write/create support will come in a later approved phase.")}
    ${renderReadOnlyCapabilityCard()}
  `;
}

function renderManufacturingCapabilityTable(capabilities, source) {
  const rows = [
    ["能力线", "设备", "数量", "最大长度", "月产能", "公开描述", "状态 / 备注"],
    ...capabilities.map((capability) => [
      businessBadge(capability.capability_line),
      capability.equipment || "Unnamed equipment",
      escapeHtml(capability.quantity ?? "Not set"),
      escapeHtml(capability.max_length || "To be confirmed"),
      escapeHtml(capability.monthly_capacity || "To be confirmed"),
      escapeHtml(capability.public_description || "No public description"),
      `${badge(source === "api" ? "API" : fallbackLabel, source === "api" ? "active" : "pending")} ${escapeHtml(capability.internal_notes || "No internal notes")}`,
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (capability) => capability.id || "Read-only capability record",
    bodyData: capabilities,
    firstColumnHtml: true,
  });
}

function renderReadOnlyCapabilityCard() {
  return `
    <div class="form-card read-only-card">
      <h3>制造能力查看模式</h3>
      <p>This card remains a static review pattern. It does not submit data or create capability records.</p>
      <div class="form-grid">
        <label class="field">
          <span>允许动作</span>
          <input type="text" value="只读制造能力查看" readonly />
          <small>No create, update or delete API call is connected.</small>
        </label>
        <label class="field">
          <span>安全边界</span>
          <input type="text" value="不承诺生产或交期" readonly />
          <small>Capability display does not confirm feasibility, price or delivery time.</small>
        </label>
      </div>
    </div>
  `;
}

function loadManufacturingCapabilitiesReadOnly() {
  return loadReadOnlyList({
    state: capabilityApiState,
    collectionKey: "capabilities",
    endpoint: "/api/manufacturing-capabilities",
    payloadKey: "manufacturing_capabilities",
    fallbackRecords: capabilityPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshManufacturingCapabilitiesView,
  });
}

function refreshManufacturingCapabilitiesView() {
  if (activeSectionId !== "manufacturing-capabilities") return;
  mainContent.innerHTML = renderManufacturingCapabilities();
  reviewPanel.innerHTML = renderManufacturingCapabilityReview();
}

function renderAiDrafts() {
  if (aiDraftApiState.status === "idle" || aiDraftApiState.status === "loading") {
    return renderAiDraftsLoading();
  }

  if (aiDraftApiState.status === "empty") {
    return renderAiDraftsEmpty();
  }

  const statusNotice =
    aiDraftApiState.status === "error"
      ? renderDataStatus("error", "AI 询盘分析 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${aiDraftApiState.error}`)
      : renderDataStatus("success", "AI 询盘分析草稿已加载", `Source: ${aiDraftApiState.source}. 只读草稿列表，未连接发送、报价或 PI 动作。`);

  return `
    ${statusNotice}
    ${renderAiDraftTable(aiDraftApiState.drafts, aiDraftApiState.source)}
    ${renderReadOnlyAiDraftCard()}
    ${renderRegistryMetadataPreviewPanel()}
  `;
}

function renderAiDraftReview() {
  return renderReviewDetails({
    title: "AI Draft API Status",
    badges: [badge("只读", "active"), badge("仅草稿", "draft"), badge("需要人工审核", "approval"), badge("需要人工复核", "approval"), badge("未发送", "pending")],
    rows: [
      ["API 路由", "GET /api/ai-inquiry-analyses"],
      ["记录数量", String(aiDraftApiState.drafts.length)],
      ["写入动作", "未连接"],
    ],
    draft: "AI 询盘分析在 Step 2C-4 中仅作为只读草稿展示。建议回复只是草稿文本，不会发送。需要人工审核。本页面不确认价格、交期、付款条款、银行信息、生产可行性、报价或 PI。",
  });
}

function renderAiDraftsLoading() {
  return `
    ${renderDataStatus("loading", "正在加载 AI 询盘分析草稿", "正在使用当前管理员会话请求 GET /api/ai-inquiry-analyses。")}
    <div class="table-wrap table-skeleton" aria-label="正在加载 AI 草稿行">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderAiDraftsEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时 AI 询盘分析草稿", "当前没有可用实时数据。本页面为只读；写入和创建支持将在后续批准阶段加入。")}
    ${renderReadOnlyAiDraftCard()}
    ${renderRegistryMetadataPreviewPanel()}
  `;
}

function renderAiDraftTable(drafts, source) {
  const rows = [
    ["识别业务线", "缺失信息", "风险标记", "审核", "建议回复草稿", "状态 / 来源"],
    ...drafts.map((draft) => [
      businessBadge(draft.detected_business_line),
      escapeHtml(formatList(draft.missing_information)),
      escapeHtml(formatList(draft.risk_flags)),
      draft.approval_required === false ? badge("API 强制需要审核", "approval") : badge("需要人工审核", "approval"),
      escapeHtml(draft.suggested_reply || "No suggested reply draft"),
      `${badge(source === "api" ? "API" : fallbackLabel, source === "api" ? "active" : "pending")} ${badge("仅草稿", "draft")} ${badge("需要人工审核", "approval")} ${badge("未发送", "pending")} ${badge("需要人工复核", "approval")}`,
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (draft) => draft.created_at || draft.id || "只读 AI 草稿记录",
    bodyData: drafts,
    firstColumnHtml: true,
  });
}

function renderReadOnlyAiDraftCard() {
  return `
    <div class="form-card read-only-card">
      <h3>AI 草稿安全审核</h3>
      <p>建议回复仅为内部草稿文本。本页面不会发送或批准任何面向客户的动作。</p>
      <div class="form-grid">
        <label class="field">
          <span>草稿状态</span>
          <input type="text" value="仅草稿 / 未发送" readonly />
          <small>不会发送邮件、WhatsApp 或客户消息。</small>
        </label>
        <label class="field">
          <span>审核规则</span>
          <input type="text" value="发送前需要人工审核" readonly />
          <small>不确认报价、PI、价格、交期、付款或银行信息。</small>
        </label>
      </div>
    </div>
  `;
}

function renderRegistryMetadataPreviewPanel() {
  const panelBadges = ["仅预览", "只读", "不执行助手", "不调用 API", "不写入数据", "不发送", "不审批"]
    .map((label) => badge(label, label === "仅预览" || label === "只读" ? "active" : "pending"))
    .join(" ");

  return `
    <div class="form-card read-only-card" aria-label="复核助手预览">
      <h3>复核助手预览</h3>
      <p>静态只读预览，不执行助手、不调用 API、不写入数据。</p>
      <p>所有复核助手仅用于未来展示规划，不代表可以发送、审批、创建任务、生成报价、PI 或订单。</p>
      <p>${panelBadges}</p>
      <div class="module-preview">
        ${registryMetadataPreviewCards.map(renderRegistryMetadataPreviewCard).join("")}
      </div>
    </div>
  `;
}

function renderRegistryMetadataPreviewCard(card) {
  return `
    <article class="module-card">
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.description)}</p>
      <p>
        ${card.safetyLabels.map((label) => badge(label, label === "仅预览" || label === "只读" ? "active" : "pending")).join(" ")}
      </p>
    </article>
  `;
}

function loadAiDraftsReadOnly() {
  return loadReadOnlyList({
    state: aiDraftApiState,
    collectionKey: "drafts",
    endpoint: "/api/ai-inquiry-analyses",
    payloadKey: "ai_inquiry_analyses",
    fallbackRecords: aiDraftPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshAiDraftsView,
    normalize: (drafts) => drafts.map((draft) => ({ ...draft, approval_required: true })),
  });
}

function refreshAiDraftsView() {
  if (activeSectionId !== "ai-drafts") return;
  mainContent.innerHTML = renderAiDrafts();
  reviewPanel.innerHTML = renderAiDraftReview();
}

function formatList(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (value && typeof value === "object") return Object.entries(value).map(([key, item]) => `${key}: ${item}`).join(", ");
  return value || "—";
}

function displayValue(value) {
  return value === undefined || value === null || value === "" ? "—" : String(value);
}

function formatDateValue(value) {
  if (!value) return "—";
  if (value === "local preview") return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function renderComingSoon(sectionId) {
  return `
    <div class="module-preview">
      <article class="module-card">
        <h3>${escapeHtml(sectionId || "Module")}</h3>
        <p>This module is reserved for a later phase and is not implemented in Step 2B.</p>
        ${badge("Coming soon", "pending")}
      </article>
    </div>
  `;
}

function renderComingSoonReview() {
  return `
    <div class="review-card">
      <h3>Not Implemented</h3>
      <p>This placeholder does not connect to data, create records or execute business actions.</p>
    </div>
  `;
}

function renderTable(rows, options = {}) {
  const [headers, ...bodyRows] = rows;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${bodyRows
            .map(
              (row, rowIndex) => `
                <tr>
                  ${row
                    .map((cell, index) => {
                      const sourceRecord = options.bodyData?.[rowIndex] || {};
                      const subtitle = options.firstColumnSubtitle
                        ? options.firstColumnSubtitle(sourceRecord)
                        : "Static sample";
                      const title = options.firstColumnHtml ? cell : escapeHtml(cell);
                      return index === 0
                        ? `<td><span class="row-title"><strong>${title}</strong><span>${escapeHtml(subtitle)}</span></span></td>`
                        : `<td>${cell}</td>`;
                    })
                    .join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFormCard(title, fields) {
  return `
    <div class="form-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="form-grid">
        ${fields
          .map(([label, value, type]) => {
            const control =
              type === "textarea"
                ? `<textarea>${escapeHtml(value)}</textarea>`
                : `<input type="text" value="${escapeHtml(value)}" />`;
            return `
              <label class="field">
                <span>${escapeHtml(label)}</span>
                ${control}
                <small>Static field style sample.</small>
              </label>
            `;
          })
          .join("")}
      </div>
      <div class="form-actions">
        <button class="button secondary" type="button">Cancel</button>
        <button class="button primary" type="button">Save Draft</button>
      </div>
    </div>
  `;
}

function renderReviewDetails({ title, badges, rows, draft }) {
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>${escapeHtml(title)}</h3>
        <p>${badges.join(" ")}</p>
        <dl>
          ${rows.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
        </dl>
      </div>
      <div class="review-card">
        <h3>Draft / Review Note</h3>
        <div class="draft-box">${escapeHtml(draft)}</div>
      </div>
      <div class="review-card">
        <h3>Safety Checklist</h3>
        <ul class="check-list">
          <li>Draft only</li>
          <li>Manual approval required</li>
          <li>No automatic sending</li>
          <li>No price, payment, delivery or PI confirmation</li>
        </ul>
      </div>
    </div>
  `;
}

renderNav();
setSection("dashboard");
