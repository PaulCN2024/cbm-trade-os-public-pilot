import { getAdminAccessToken } from "../../lib/admin-auth.js";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "customers", label: "客户" },
  { id: "companies", label: "公司" },
  { id: "inquiries", label: "询盘" },
  { id: "products", label: "产品" },
  { id: "manufacturing-capabilities", label: "制造能力" },
  { id: "suppliers", label: "Suppliers", soon: true },
  { id: "ai-drafts", label: "AI 草稿" },
  { id: "quotations", label: "Quotations", soon: true },
  { id: "orders", label: "Orders", soon: true },
  { id: "production", label: "Production", soon: true },
  { id: "shipping", label: "Shipping", soon: true },
  { id: "after-sales", label: "After-sales", soon: true },
  { id: "settings", label: "Settings", soon: true },
];

const sections = {
  dashboard: {
    title: "Admin Dashboard",
    description: "A calm operating view for leads, companies, products and draft reviews.",
    sectionTitle: "Dashboard Overview",
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
          ${item.soon ? "<small>soon</small>" : ""}
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
    <div class="module-preview">
      <article class="module-card">
        <h3>Foundation Objects</h3>
        <p>Companies, products, capabilities and AI draft reviews use the same page rhythm.</p>
        ${badge("Consistent layout", "active")}
      </article>
      <article class="module-card">
        <h3>Business Lines</h3>
        <p>Every major record can show Architectural, Industrial or Unknown clearly.</p>
        ${businessBadge("A_ARCHITECTURAL")} ${businessBadge("B_INDUSTRIAL")}
      </article>
      <article class="module-card">
        <h3>Manual Review</h3>
        <p>Drafts stay internal until a human approves the next action.</p>
        ${badge("Approval Required", "approval")}
      </article>
    </div>
  `;
}

function renderDashboardReview() {
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>Step 2B Boundary</h3>
        <ul class="check-list">
          <li>No API connection</li>
          <li>No CRUD submission</li>
          <li>No business automation</li>
          <li>No OpenAI or outbound message integration</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>Reusable Patterns</h3>
        <p>Sidebar, topbar, metric cards, tables, form cards, detail panels, badges and state cards.</p>
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
    return renderCustomersLoading();
  }

  if (customerApiState.status === "empty") {
    return renderCustomersEmpty();
  }

  const statusNotice =
    customerApiState.status === "error"
      ? renderDataStatus("error", "客户 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${customerApiState.error}`)
      : renderDataStatus("success", "客户数据已加载", `Source: ${customerApiState.source}. 只读 CRM 列表，未连接创建、更新、导入或删除动作。`);

  return `
    ${statusNotice}
    ${renderCustomerTable(customerApiState.customers, customerApiState.source)}
    ${renderReadOnlyCustomerCard()}
  `;
}

function renderCustomerReview() {
  return renderReviewDetails({
    title: "客户 API 状态",
    badges: [badge("只读", "active"), badge(customerApiState.source, customerApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API 路由", "GET /api/customers"],
      ["记录数量", String(customerApiState.customers.length)],
      ["写入动作", "未连接"],
    ],
    draft: "客户在 Step 3A 中仅作为只读 CRM 列表展示。当前不支持新增客户、导入、编辑、删除、消息发送、报价、PI 或订单动作。",
  });
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
    ${renderReadOnlyCustomerCard()}
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
    <div class="form-card read-only-card">
      <h3>客户管理只读边界</h3>
      <p>本区域仅用于查看客户记录，不会创建、导入、更新或删除客户。</p>
      <div class="form-grid">
        <label class="field">
          <span>允许动作</span>
          <input type="text" value="只读客户查看" readonly />
          <small>未连接客户导入、创建或编辑 API 调用。</small>
        </label>
        <label class="field">
          <span>禁止动作</span>
          <input type="text" value="No send / quote / PI / order" readonly />
          <small>商业动作需要后续批准阶段和人工审核。</small>
        </label>
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
    return renderInquiriesLoading();
  }

  if (inquiryApiState.status === "empty") {
    return renderInquiriesEmpty();
  }

  const statusNotice =
    inquiryApiState.status === "error"
      ? renderDataStatus("error", "询盘 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${inquiryApiState.error}`)
      : renderDataStatus("success", "询盘数据已加载", `Source: ${inquiryApiState.source}. 只读询盘列表，未连接创建、AI 自动处理、发送、报价或 PI 动作。`);

  return `
    ${statusNotice}
    ${renderInquiryTable(inquiryApiState.inquiries, inquiryApiState.source)}
    ${renderReadOnlyInquiryCard()}
  `;
}

function renderInquiryReview() {
  return renderReviewDetails({
    title: "询盘 API 状态",
    badges: [badge("只读", "active"), badge(inquiryApiState.source, inquiryApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API 路由", "GET /api/inquiries"],
      ["记录数量", String(inquiryApiState.inquiries.length)],
      ["写入动作", "未连接"],
    ],
    draft: "询盘在 Step 3A 中仅作为只读询盘中心列表展示。当前不支持创建询盘、AI 自动处理、发送、报价、PI、订单、生产或出运动作。",
  });
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
    ${renderReadOnlyInquiryCard()}
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
    <div class="form-card read-only-card">
      <h3>询盘中心只读边界</h3>
      <p>本区域仅用于查看现有询盘，不会创建询盘或运行 AI 自动处理。</p>
      <div class="form-grid">
        <label class="field">
          <span>允许动作</span>
          <input type="text" value="只读询盘查看" readonly />
          <small>本界面未连接询盘创建、POST 或 PATCH 动作。</small>
        </label>
        <label class="field">
          <span>禁止动作</span>
          <input type="text" value="No send / quote / PI / order" readonly />
          <small>不会执行外发消息、报价、PI 或业务承诺。</small>
        </label>
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
