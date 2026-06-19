import { getAdminAccessToken } from "../../lib/admin-auth.js";

const navItems = [
  { id: "dashboard", label: "工作台" },
  { id: "inquiries", label: "询盘" },
  { id: "customers", label: "客户" },
  { id: "companies", label: "客户公司" },
  { id: "suppliers", label: "供应商" },
  { id: "products", label: "产品" },
  { id: "manufacturing-capabilities", label: "制造能力" },
  { id: "ai-drafts", label: "AI 复核" },
  { id: "files", label: "文件" },
  { id: "quotations", label: "报价" },
  { id: "orders", label: "订单" },
  { id: "production", label: "生产" },
  { id: "shipping", label: "发货" },
  { id: "after-sales", label: "售后" },
  { id: "settings", label: "设置" },
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
  suppliers: {
    title: "供应商",
    description: "静态供应商能力、报价状态和人工核实预览。",
    sectionTitle: "供应商中心",
    sectionHelp: "静态只读预览。当前不发送 RFQ，不确认报价、交期或供应商承诺。",
    content: renderSuppliers,
    review: renderSupplierReview,
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
    title: "AI 复核中心",
    description: "静态复核 AI 草稿、风险提醒、缺失信息和人工下一步建议。",
    sectionTitle: "AI 复核中心",
    sectionHelp: "静态只读预览。AI 仅提供建议和草稿，不自动发送、审批、报价或生成 PI。",
    content: renderAiDrafts,
    review: renderAiDraftReview,
  },
  files: {
    title: "文件中心",
    description: "集中查看询盘附件、图纸资料、合同单据、质量证据和缺失文件。",
    sectionTitle: "文件中心",
    sectionHelp: "静态只读预览。当前不上传、不删除、不解析文件，也不生成报价、PI、合同或订单。",
    content: renderFiles,
    review: renderFileReview,
  },
  quotations: {
    title: "报价前复核",
    description: "集中检查客户需求、供应商报价、资料完整性、风险边界和人工报价准备状态。",
    sectionTitle: "报价前复核",
    sectionHelp: "静态只读预览。当前不生成报价、不计算价格、不生成 PI、合同或订单。",
    content: renderQuotations,
    review: renderQuotationReview,
  },
  orders: {
    title: "订单中心",
    description: "集中查看订单准备状态、PI/合同资料、付款条件和人工确认边界。",
    sectionTitle: "订单中心",
    sectionHelp: "静态只读预览。当前不确认订单、不生成合同、不确认收款或下达生产。",
    content: renderOrders,
    review: renderOrderReview,
  },
  production: {
    title: "生产中心",
    description: "集中查看生产准备、供应商确认、资料缺口和交期风险。",
    sectionTitle: "生产中心",
    sectionHelp: "静态只读预览。当前不下达生产、不确认交期、包装或质量责任。",
    content: renderProduction,
    review: renderProductionReview,
  },
  shipping: {
    title: "发货中心",
    description: "集中查看装柜、物流资料、目的港、单据缺口和发货风险。",
    sectionTitle: "发货中心",
    sectionHelp: "静态只读预览。当前不确认发货、不生成装箱单、不通知客户。",
    content: renderShipping,
    review: renderShippingReview,
  },
  "after-sales": {
    title: "售后中心",
    description: "集中查看客户反馈、质量证据、责任边界和人工处理建议。",
    sectionTitle: "售后中心",
    sectionHelp: "静态只读预览。当前不承认责任、不承诺赔付、不发送最终结论。",
    content: renderAfterSales,
    review: renderAfterSalesReview,
  },
  settings: {
    title: "设置",
    description: "查看系统边界、账号状态、AI 模型预留和未来集成入口。",
    sectionTitle: "设置",
    sectionHelp: "静态只读边界预览。当前不连接账号、不调用 AI、不修改权限。",
    content: renderSettings,
    review: renderSettingsReview,
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

const aiReviewSummaryCards = [
  { label: "待复核草稿", value: "8", subtitle: "AI 草稿、建议回复和分析结果", tone: "warning" },
  { label: "高风险建议", value: "3", subtitle: "涉及质量、价格、赔付或交期", tone: "danger" },
  { label: "缺失信息提醒", value: "6", subtitle: "规格、图纸、认证或供应商反馈缺失", tone: "warning" },
  { label: "沟通建议", value: "5", subtitle: "仅作为内部回复草稿参考", tone: "info" },
  { label: "报价前风险", value: "4", subtitle: "进入报价前必须人工核算", tone: "neutral" },
  { label: "禁止自动执行", value: "12", subtitle: "发送、审批和商业动作均禁用", tone: "danger" },
];

const aiReviewQueueItems = [
  {
    title: "秘鲁轻钢龙骨询盘 AI 初判",
    type: "询盘分析",
    risk: "中",
    riskTone: "warning",
    status: "待人工复核",
    missingInfo: ["厚度", "锌层", "包装", "装柜重量"],
    aiSuggestion: "客户缺少厚度、锌层、包装和装柜重量信息，建议先补充信息再询价。",
    humanNextStep: "整理客户确认清单，并同步供应商按重量报价。",
    disabledCapabilities: ["不可自动回复", "不可自动报价", "不可生成 PI"],
  },
  {
    title: "南美高尔夫球车客户回复草稿",
    type: "沟通草稿",
    risk: "中",
    riskTone: "warning",
    status: "待人工复核",
    missingInfo: ["车型", "电池", "认证", "包装", "目的港"],
    aiSuggestion: "可向客户说明需要确认车型、电池、认证、包装和目的港。",
    humanNextStep: "人工确认供应商配置后再发送客户回复。",
    disabledCapabilities: ["不可自动发送", "不可承诺价格", "不可确认交期"],
  },
  {
    title: "沿海项目铝型材问题风险复核",
    type: "风险复核",
    risk: "高",
    riskTone: "danger",
    status: "禁止自动结论",
    missingInfo: ["照片", "项目环境", "表面处理记录", "使用位置"],
    aiSuggestion: "涉及质量责任和可能赔付，不应直接承认责任或承诺赔付。",
    humanNextStep: "收集照片、项目环境、表面处理记录和使用位置后再判断。",
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "不可发送最终结论"],
  },
  {
    title: "印尼吊顶系统报价前复核",
    type: "报价前检查",
    risk: "中",
    riskTone: "warning",
    status: "待内部核算",
    missingInfo: ["材料表", "0.7mm 板材", "Option B", "安装损耗", "供应商报价"],
    aiSuggestion: "材料表、0.7mm 板材、Option B、安装损耗和供应商报价仍需核实。",
    humanNextStep: "完成内部核算草稿后再进入人工报价复核。",
    disabledCapabilities: ["不可生成报价", "不可生成 PI", "不可确认生产"],
  },
  {
    title: "供应商能力匹配 AI 建议",
    type: "供应商复核",
    risk: "中",
    riskTone: "warning",
    status: "待人工核实",
    missingInfo: ["厚度", "锌层", "装柜重量", "报价有效期"],
    aiSuggestion: "轻钢龙骨供应商与秘鲁询盘匹配，但厚度、锌层和装柜重量未确认。",
    humanNextStep: "向供应商确认规格、包装、装柜和报价有效期。",
    disabledCapabilities: ["不可发送 RFQ", "不可确认报价", "不可确认交期"],
  },
  {
    title: "PD/PT 门安装资料 AI 建议",
    type: "技术资料",
    risk: "中",
    riskTone: "warning",
    status: "资料缺失",
    missingInfo: ["安装手册", "视频说明", "五金配置", "系统差异"],
    aiSuggestion: "客户需要安装指导，但当前系统资料和五金配置仍需确认。",
    humanNextStep: "整理安装手册、视频说明和系统差异说明后再发客户。",
    disabledCapabilities: ["不可自动发送资料", "不可承诺安装结果", "不可确认售后责任"],
  },
];

const fileCenterSummaryCards = [
  { label: "待复核文件", value: "12", subtitle: "询盘、客户和供应商相关附件", tone: "warning" },
  { label: "缺失关键资料", value: "6", subtitle: "规格、图纸、认证或签署资料缺失", tone: "warning" },
  { label: "图纸 / 技术资料", value: "5", subtitle: "CAD、PDF、安装手册和材料表", tone: "info" },
  { label: "报价 / PI / 合同", value: "4", subtitle: "业务单据必须人工复核", tone: "danger" },
  { label: "质量证据", value: "3", subtitle: "照片、批次和表面处理记录", tone: "neutral" },
  { label: "禁止自动执行", value: "9", subtitle: "上传、解析、发送和生成均禁用", tone: "danger" },
];

const fileCenterQueueItems = [
  {
    title: "秘鲁轻钢龙骨规格资料",
    type: "规格 / 询盘附件",
    linkedBusiness: "秘鲁轻钢龙骨询盘",
    status: "资料不完整",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["厚度", "锌层", "包装方式", "装柜重量"],
    aiSuggestion: "该资料不足以直接报价，应先向客户补充规格并让供应商按重量核价。",
    humanNextStep: "整理客户确认清单，补齐厚度、锌层、包装和装柜信息。",
    disabledCapabilities: ["不可生成报价", "不可生成 PI", "不可确认装柜"],
  },
  {
    title: "印尼吊顶系统图纸与材料表",
    type: "图纸 / 材料表",
    linkedBusiness: "印尼工厂吊顶系统询盘",
    status: "待供应商复核",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["安装损耗", "包装方案", "供应商最终报价"],
    aiSuggestion: "图纸和材料表可用于内部核算，但不能直接作为正式报价依据。",
    humanNextStep: "让供应商确认材料、包装、损耗和交期后再生成报价草稿。",
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可生成 PI"],
  },
  {
    title: "沿海项目铝型材问题照片",
    type: "质量证据",
    linkedBusiness: "沿海项目铝型材问题反馈",
    status: "高风险复核",
    risk: "高",
    riskTone: "danger",
    missingInfo: ["项目环境说明", "表面处理记录", "使用位置照片", "批次信息"],
    aiSuggestion: "涉及质量责任和赔付风险，不能仅凭照片判断责任。",
    humanNextStep: "收集完整证据链后，由人工判断责任边界。",
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "不可发送最终结论"],
  },
  {
    title: "PD/PT 门安装资料",
    type: "安装手册 / 技术资料",
    linkedBusiness: "PD/PT 门安装支持需求",
    status: "资料缺失",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["五金系统确认", "安装步骤图", "视频说明"],
    aiSuggestion: "资料可能与客户实际系统不完全一致，必须人工确认后再发送。",
    humanNextStep: "整理系统差异说明和安装视频，再由人工确认客户可用版本。",
    disabledCapabilities: ["不可自动发送", "不可承诺安装结果", "不可确认售后责任"],
  },
  {
    title: "高尔夫球车供应商报价资料",
    type: "供应商报价",
    linkedBusiness: "南美高尔夫球车客户询盘",
    status: "待人工核价",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["电池配置", "认证", "包装", "装柜数量"],
    aiSuggestion: "供应商报价需要与配置、认证和装柜方案一起复核。",
    humanNextStep: "确认车型配置、包装和装柜数量后再形成客户报价。",
    disabledCapabilities: ["不可承诺价格", "不可确认交期", "不可确认订单"],
  },
  {
    title: "PI / 销售合同草稿",
    type: "业务单据",
    linkedBusiness: "客户下单前资料",
    status: "禁止自动发送",
    risk: "高",
    riskTone: "danger",
    missingInfo: ["最终价格确认", "付款条款", "交期", "手动签名"],
    aiSuggestion: "PI 和合同属于高风险业务文件，必须人工确认后才能发送客户。",
    humanNextStep: "人工确认价格、付款、交期、收款信息和签名后再使用。",
    disabledCapabilities: ["不可自动发送", "不可自动签署", "不可确认订单"],
  },
];

const quoteReviewSummaryCards = [
  { label: "待复核报价", value: "7", subtitle: "进入人工报价前的候选询盘", tone: "warning" },
  { label: "资料不完整", value: "5", subtitle: "规格、图纸、包装或交期资料缺失", tone: "warning" },
  { label: "供应商待确认", value: "4", subtitle: "单价、配置、有效期或装柜待确认", tone: "neutral" },
  { label: "高风险报价", value: "2", subtitle: "质量、赔付、价格或责任边界相关", tone: "danger" },
  { label: "可进入人工报价", value: "3", subtitle: "仅允许人工整理报价草稿", tone: "info" },
  { label: "禁止自动生成", value: "9", subtitle: "报价、PI、合同和订单均禁用", tone: "danger" },
];

const quoteReviewQueueItems = [
  {
    title: "秘鲁轻钢龙骨报价前复核",
    status: "资料不完整",
    risk: "中",
    riskTone: "warning",
    readiness: "暂不报价",
    customerNeed: "20GP 整柜，轻钢龙骨 / drywall materials",
    supplierStatus: "待确认厚度、锌层、包装和装柜重量",
    missingInfo: ["厚度", "锌层", "包装方式", "装柜重量"],
    aiSuggestion: "暂不进入正式报价。先补齐规格和重量，再按供应商报价核算。",
    humanNextStep: "向客户确认规格，同时让供应商按重量报价。",
    disabledCapabilities: ["不可生成报价", "不可生成 PI", "不可确认装柜"],
  },
  {
    title: "印尼吊顶系统报价前复核",
    status: "待内部核算",
    risk: "中",
    riskTone: "warning",
    readiness: "内部核算草稿",
    customerNeed: "工厂吊顶系统，0.7mm，Option B",
    supplierStatus: "材料表、包装、损耗和最终报价待确认",
    missingInfo: ["安装损耗", "包装方案", "供应商最终报价", "交期确认"],
    aiSuggestion: "可以进入内部核算草稿，但不能生成正式客户报价。",
    humanNextStep: "完善材料表和供应商报价后再人工复核。",
    disabledCapabilities: ["不可生成正式报价", "不可生成 PI", "不可确认生产"],
  },
  {
    title: "南美高尔夫球车报价前复核",
    status: "供应商待确认",
    risk: "中",
    riskTone: "warning",
    readiness: "配置待确认",
    customerNeed: "整柜采购高尔夫球车",
    supplierStatus: "型号、配置、电池、认证和装柜数量待确认",
    missingInfo: ["电池配置", "认证要求", "包装方式", "装柜数量"],
    aiSuggestion: "不能只按单价报价，应先确认配置差异和整柜装载方案。",
    humanNextStep: "向供应商确认配置表和装柜方案，再整理客户选项。",
    disabledCapabilities: ["不可承诺价格", "不可确认交期", "不可确认订单"],
  },
  {
    title: "沿海铝型材问题报价/赔付风险复核",
    status: "高风险",
    risk: "高",
    riskTone: "danger",
    readiness: "禁止赔付报价",
    customerNeed: "质量问题反馈，可能涉及赔付或补货",
    supplierStatus: "责任边界和证据链未确认",
    missingInfo: ["项目环境说明", "表面处理记录", "批次信息", "使用位置照片"],
    aiSuggestion: "禁止直接形成赔付报价或补货承诺。",
    humanNextStep: "先完成质量证据收集和责任判断。",
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "不可生成补货报价"],
  },
  {
    title: "PD/PT 门安装支持报价前复核",
    status: "技术资料缺失",
    risk: "中",
    riskTone: "warning",
    readiness: "技术确认后判断",
    customerNeed: "安装指导 / 技术支持",
    supplierStatus: "五金系统和安装资料待确认",
    missingInfo: ["安装手册", "五金系统确认", "视频说明"],
    aiSuggestion: "不应直接承诺安装结果或售后责任。",
    humanNextStep: "整理安装资料和系统差异说明，再判断是否涉及收费服务。",
    disabledCapabilities: ["不可生成服务报价", "不可承诺安装结果", "不可确认售后责任"],
  },
  {
    title: "加勒比建筑客户报价前复核",
    status: "可进入人工报价",
    risk: "中",
    riskTone: "warning",
    readiness: "人工报价准备",
    customerNeed: "门窗五金 / 建筑材料项目",
    supplierStatus: "历史报价和当前规格需要人工合并复核",
    missingInfo: ["最终规格确认", "付款节奏", "目标交期"],
    aiSuggestion: "可进入人工报价准备，但必须人工确认最终规格、价格和交期。",
    humanNextStep: "整理报价草稿，人工复核后再发送客户。",
    disabledCapabilities: ["不可自动发送", "不可自动生成 PI", "不可确认订单"],
  },
];

const commercialWorkflowSections = {
  orders: {
    title: "订单中心",
    subtitle: "集中查看订单准备状态、PI/合同资料、付款条件和人工确认边界。",
    summaryLabel: "ORDER REVIEW SUMMARY",
    summaryTitle: "订单准备概览",
    queueLabel: "ORDER REVIEW QUEUE",
    queueTitle: "订单复核队列",
    queueHint: "所有订单状态均为静态示例，必须人工确认后才能进入真实业务动作。",
    reviewTitle: "订单复核预览",
    fixedExample: "固定示例：加勒比建筑材料订单准备。",
    reviewRows: [
      ["订单摘要", "建筑材料订单准备中，PI 和合同资料仍需人工复核。"],
      ["PI/合同状态", "PI 待复核，合同资料缺失。"],
      ["付款条件", "付款节奏和收款状态未确认。"],
      ["客户确认状态", "客户尚未完成最终确认。"],
      ["风险点", "价格、付款、交期和生产下达均不可自动确认。"],
    ],
    disabled: ["不可确认订单", "不可生成合同", "不可确认收款", "不可下达生产"],
    summaryCards: [
      { label: "待确认订单", value: "5", subtitle: "需要人工确认后才能推进", tone: "warning" },
      { label: "PI 待复核", value: "4", subtitle: "PI 草稿或条款待人工核对", tone: "warning" },
      { label: "合同资料缺失", value: "3", subtitle: "签署、条款或客户确认缺失", tone: "danger" },
      { label: "付款待确认", value: "4", subtitle: "收款和付款条件未锁定", tone: "neutral" },
      { label: "高风险订单", value: "2", subtitle: "涉及赔付、补货或责任边界", tone: "danger" },
      { label: "禁止自动确认", value: "7", subtitle: "订单、收款、生产均禁用", tone: "danger" },
    ],
    queueItems: [
      { title: "加勒比建筑材料订单准备", status: "PI 待复核", risk: "中", riskTone: "warning", detail: "门窗五金 / 建筑材料项目，需要合并历史报价和当前规格。", missingInfo: ["PI 条款", "付款节奏", "客户最终确认"], nextStep: "人工复核 PI、合同和付款条件后再确认是否进入订单准备。", disabled: ["不可确认订单", "不可生成合同", "不可确认收款"] },
      { title: "秘鲁轻钢龙骨订单准备", status: "规格未锁定", risk: "中", riskTone: "warning", detail: "20GP 轻钢龙骨项目，厚度、锌层和装柜重量未锁定。", missingInfo: ["厚度", "锌层", "包装", "装柜重量"], nextStep: "先锁定规格和供应商报价，再进入人工订单复核。", disabled: ["不可确认订单", "不可下达生产", "不可确认装柜"] },
      { title: "高尔夫球车订单准备", status: "配置待确认", risk: "中", riskTone: "warning", detail: "整柜采购高尔夫球车，车型、配置、电池和认证待确认。", missingInfo: ["车型配置", "电池", "认证", "装柜数量"], nextStep: "由人工确认配置表和供应商报价后再整理订单资料。", disabled: ["不可确认订单", "不可确认交期", "不可确认收款"] },
      { title: "印尼吊顶系统订单准备", status: "生产信息待确认", risk: "中", riskTone: "warning", detail: "吊顶系统材料、包装、损耗和生产信息待供应商确认。", missingInfo: ["材料表", "包装方案", "交期", "生产信息"], nextStep: "完成供应商确认和内部核算后再复核订单边界。", disabled: ["不可下达生产", "不可确认交期", "不可生成合同"] },
      { title: "沿海项目补货订单", status: "高风险", risk: "高", riskTone: "danger", detail: "涉及质量责任和可能补货，证据链和责任边界未确认。", missingInfo: ["责任判断", "批次信息", "补货范围"], nextStep: "先完成人工责任判断，不得自动确认补货订单。", disabled: ["不可承认责任", "不可确认补货", "不可下达生产"] },
    ],
  },
  production: {
    title: "生产中心",
    subtitle: "集中查看生产准备、供应商确认、资料缺口和交期风险。",
    summaryLabel: "PRODUCTION REVIEW SUMMARY",
    summaryTitle: "生产准备概览",
    queueLabel: "PRODUCTION REVIEW QUEUE",
    queueTitle: "生产复核队列",
    queueHint: "仅展示生产准备状态，不下达生产、不确认交期。",
    reviewTitle: "生产复核预览",
    fixedExample: "固定示例：印尼吊顶系统生产准备。",
    reviewRows: [
      ["生产摘要", "吊顶系统材料和包装方案仍需供应商确认。"],
      ["供应商状态", "材料表、包装和最终报价待复核。"],
      ["图纸/材料状态", "图纸可参考，但不能直接下达生产。"],
      ["包装状态", "包装方式和损耗未确认。"],
      ["交期风险", "交期必须由人工复核后确认。"],
      ["质量风险", "质量责任和材料规格需人工确认。"],
    ],
    disabled: ["不可下达生产", "不可确认交期", "不可确认包装", "不可确认质量责任"],
    summaryCards: [
      { label: "待生产确认", value: "6", subtitle: "生产前必须人工审核", tone: "warning" },
      { label: "供应商待确认", value: "5", subtitle: "材料、报价或交期待反馈", tone: "neutral" },
      { label: "图纸待复核", value: "4", subtitle: "图纸和材料表需人工检查", tone: "warning" },
      { label: "交期风险", value: "3", subtitle: "不得自动承诺交期", tone: "danger" },
      { label: "质量风险", value: "2", subtitle: "责任和质保边界需复核", tone: "danger" },
      { label: "禁止自动下单", value: "8", subtitle: "生产下单和采购均禁用", tone: "danger" },
    ],
    queueItems: [
      { title: "印尼吊顶系统生产准备", status: "材料待确认", risk: "中", riskTone: "warning", detail: "0.7mm Option B 吊顶系统，材料表、包装和损耗待确认。", missingInfo: ["材料表", "包装方案", "安装损耗"], nextStep: "供应商确认材料、包装和交期后再人工判断。", disabled: ["不可下达生产", "不可确认交期", "不可确认包装"] },
      { title: "秘鲁轻钢龙骨生产准备", status: "重量和包装待确认", risk: "中", riskTone: "warning", detail: "轻钢龙骨项目重量、包装和装柜方案未锁定。", missingInfo: ["重量", "包装", "装柜方案"], nextStep: "先确认重量和包装，再进入生产准备复核。", disabled: ["不可下达生产", "不可确认重量", "不可确认装柜"] },
      { title: "PD/PT 门生产/安装资料准备", status: "技术资料缺失", risk: "中", riskTone: "warning", detail: "安装资料、五金系统和视频说明仍需整理。", missingInfo: ["安装手册", "五金系统", "视频说明"], nextStep: "补齐系统资料后由人工判断可生产/可交付边界。", disabled: ["不可确认安装结果", "不可下达生产", "不可确认售后责任"] },
      { title: "高尔夫球车整柜生产/备货", status: "配置待确认", risk: "中", riskTone: "warning", detail: "车型、电池、认证和装柜数量待供应商确认。", missingInfo: ["车型", "电池", "认证", "装柜数量"], nextStep: "确认配置和备货周期后再进入人工复核。", disabled: ["不可确认备货", "不可确认交期", "不可确认订单"] },
      { title: "沿海铝型材补货生产风险", status: "高风险", risk: "高", riskTone: "danger", detail: "涉及质量责任和补货生产，证据链未完整。", missingInfo: ["责任边界", "表面处理记录", "批次信息"], nextStep: "先完成人工质量判断，不得直接安排补货生产。", disabled: ["不可承认责任", "不可确认补货", "不可下达生产"] },
    ],
  },
  shipping: {
    title: "发货中心",
    subtitle: "集中查看装柜、物流资料、目的港、单据缺口和发货风险。",
    summaryLabel: "SHIPPING REVIEW SUMMARY",
    summaryTitle: "发货准备概览",
    queueLabel: "SHIPPING REVIEW QUEUE",
    queueTitle: "发货复核队列",
    queueHint: "仅展示发货准备状态，不确认物流、不生成装箱单。",
    reviewTitle: "发货复核预览",
    fixedExample: "固定示例：秘鲁轻钢龙骨 20GP 装柜复核。",
    reviewRows: [
      ["发货摘要", "20GP 装柜重量和包装方案仍需确认。"],
      ["装柜状态", "装柜重量、包装和数量未锁定。"],
      ["物流状态", "物流渠道和船期未确认。"],
      ["单据缺口", "装箱单、商业发票和发货资料仍需人工复核。"],
      ["目的港/贸易条款", "目的港和贸易条款仅为静态展示，不代表确认。"],
      ["风险点", "不得自动通知客户发货或确认物流。"],
    ],
    disabled: ["不可确认发货", "不可生成装箱单", "不可确认物流", "不可通知客户发货"],
    summaryCards: [
      { label: "待发货订单", value: "5", subtitle: "待人工确认后进入发货", tone: "warning" },
      { label: "装柜待确认", value: "4", subtitle: "数量、重量和包装未锁定", tone: "warning" },
      { label: "单据缺失", value: "5", subtitle: "CI/PL/发货资料待复核", tone: "danger" },
      { label: "物流待确认", value: "3", subtitle: "船期、费用或渠道待确认", tone: "neutral" },
      { label: "高风险发货", value: "2", subtitle: "补货、赔付或责任边界相关", tone: "danger" },
      { label: "禁止自动发货", value: "7", subtitle: "发货确认和客户通知禁用", tone: "danger" },
    ],
    queueItems: [
      { title: "秘鲁轻钢龙骨 20GP 装柜复核", status: "装柜重量待确认", risk: "中", riskTone: "warning", detail: "轻钢龙骨整柜发货前，重量、包装和装柜方案未确认。", missingInfo: ["装柜重量", "包装方式", "数量核对"], nextStep: "人工核对装柜方案和发货资料后再确认。", disabled: ["不可确认发货", "不可生成装箱单", "不可通知客户"] },
      { title: "高尔夫球车整柜发货准备", status: "装柜数量待确认", risk: "中", riskTone: "warning", detail: "车型配置和装柜数量需要供应商最终确认。", missingInfo: ["装柜数量", "车型配置", "包装方式"], nextStep: "确认装柜清单和物流安排后再进入发货复核。", disabled: ["不可确认物流", "不可通知客户发货", "不可确认订单"] },
      { title: "印尼吊顶系统包装与发货", status: "包装方案待确认", risk: "中", riskTone: "warning", detail: "吊顶系统包装、体积和发货批次未锁定。", missingInfo: ["包装方案", "体积重量", "发货批次"], nextStep: "供应商确认包装和资料后由人工复核发货。", disabled: ["不可生成装箱单", "不可确认发货", "不可确认交期"] },
      { title: "加勒比建筑材料发货资料", status: "单据待复核", risk: "中", riskTone: "warning", detail: "客户资料、CI/PL 和目的港信息需复核。", missingInfo: ["CI 草稿", "PL 草稿", "目的港"], nextStep: "人工核对单据和客户信息后再准备发货资料。", disabled: ["不可生成单据", "不可通知客户", "不可确认物流"] },
      { title: "沿海项目补货发货风险", status: "高风险", risk: "高", riskTone: "danger", detail: "补货发货涉及质量责任和赔付边界。", missingInfo: ["责任判断", "补货范围", "客户确认"], nextStep: "先确认责任和补货边界，不得自动安排发货。", disabled: ["不可承认责任", "不可确认补货", "不可确认发货"] },
    ],
  },
  "after-sales": {
    title: "售后中心",
    subtitle: "集中查看客户反馈、质量证据、责任边界和人工处理建议。",
    summaryLabel: "AFTER-SALES REVIEW SUMMARY",
    summaryTitle: "售后处理概览",
    queueLabel: "AFTER-SALES REVIEW QUEUE",
    queueTitle: "售后复核队列",
    queueHint: "仅展示售后处理建议，不承认责任、不承诺赔付。",
    reviewTitle: "售后复核预览",
    fixedExample: "固定示例：沿海项目铝型材发黄反馈。",
    reviewRows: [
      ["售后摘要", "客户反馈铝型材表面问题，证据链仍不完整。"],
      ["客户反馈", "可能涉及表面处理、使用环境和质量责任。"],
      ["证据状态", "照片、批次、环境说明和表面处理记录缺失。"],
      ["责任风险", "不得自动承认责任或赔付。"],
      ["供应商状态", "供应商复核和材料记录待确认。"],
    ],
    disabled: ["不可承认责任", "不可承诺赔付", "不可发送最终结论", "不可确认补货"],
    summaryCards: [
      { label: "待处理反馈", value: "5", subtitle: "需人工判断的客户反馈", tone: "warning" },
      { label: "高风险售后", value: "2", subtitle: "质量、赔付或责任相关", tone: "danger" },
      { label: "质量证据缺失", value: "4", subtitle: "照片、批次或记录不完整", tone: "warning" },
      { label: "待供应商复核", value: "3", subtitle: "需要供应商反馈证据", tone: "neutral" },
      { label: "待客户补充", value: "4", subtitle: "客户资料或照片待补齐", tone: "info" },
      { label: "禁止自动结论", value: "6", subtitle: "责任、赔付和补货禁用", tone: "danger" },
    ],
    queueItems: [
      { title: "沿海项目铝型材发黄反馈", status: "高风险", risk: "高", riskTone: "danger", detail: "客户反馈沿海项目铝型材发黄，可能涉及环境和表面处理。", missingInfo: ["环境说明", "表面处理记录", "批次照片"], nextStep: "收集证据链并让供应商复核后再判断责任。", disabled: ["不可承认责任", "不可承诺赔付", "不可发送最终结论"] },
      { title: "PD/PT 门安装支持反馈", status: "技术资料缺失", risk: "中", riskTone: "warning", detail: "客户需要安装支持，系统差异和五金资料未确认。", missingInfo: ["安装手册", "五金配置", "视频说明"], nextStep: "整理资料并人工确认可发送版本。", disabled: ["不可承诺安装结果", "不可确认售后责任", "不可自动发送"] },
      { title: "吊顶系统安装疑问", status: "待技术复核", risk: "中", riskTone: "warning", detail: "安装疑问涉及材料表和施工损耗。", missingInfo: ["施工现场信息", "材料表", "安装照片"], nextStep: "由技术人员复核后再回复客户。", disabled: ["不可确认安装责任", "不可承诺补偿", "不可发送最终结论"] },
      { title: "高尔夫球车配置争议", status: "待供应商确认", risk: "中", riskTone: "warning", detail: "配置争议需要供应商核对订单和出货资料。", missingInfo: ["配置表", "出货照片", "供应商反馈"], nextStep: "核对供应商资料后再判断处理方案。", disabled: ["不可承认责任", "不可承诺赔付", "不可确认补货"] },
      { title: "门窗五金售后反馈", status: "证据不足", risk: "中", riskTone: "warning", detail: "客户反馈五金问题，但缺少安装位置和使用情况。", missingInfo: ["安装位置", "使用照片", "数量"], nextStep: "请客户补充照片和数量后人工复核。", disabled: ["不可确认责任", "不可补发配件", "不可承诺赔付"] },
    ],
  },
  settings: {
    title: "设置",
    subtitle: "查看系统边界、账号状态、AI 模型预留和未来集成入口。",
    summaryLabel: "SETTINGS BOUNDARY SUMMARY",
    summaryTitle: "系统边界概览",
    queueLabel: "SETTINGS PLACEHOLDERS",
    queueTitle: "设置预留入口",
    queueHint: "仅展示未来配置入口，不连接账号、不调用服务。",
    reviewTitle: "系统边界预览",
    fixedExample: "固定示例：设置边界与未来集成入口。",
    reviewRows: [
      ["当前状态", "静态只读设置预览，未连接真实账号或外部服务。"],
      ["未来可接入能力", "AI Provider、Gmail、WhatsApp、审批规则和用户设置。"],
      ["审批边界", "所有高风险动作必须人工审批。"],
      ["安全说明", "当前不修改权限、不保存配置、不开启自动执行。"],
    ],
    disabled: ["不可连接账号", "不可发送消息", "不可调用 AI", "不可修改权限", "不可开启自动执行"],
    summaryCards: [
      { label: "模型接口预留", value: "6", subtitle: "AI Provider / Model Gateway", tone: "neutral" },
      { label: "外部渠道预留", value: "4", subtitle: "Gmail / WhatsApp 等未来入口", tone: "neutral" },
      { label: "审批边界", value: "5", subtitle: "发送、报价、订单等人工审批", tone: "warning" },
      { label: "只读保护", value: "8", subtitle: "当前不保存配置或权限", tone: "info" },
      { label: "待配置项", value: "7", subtitle: "账号、渠道、规则和模板", tone: "warning" },
      { label: "禁止自动执行", value: "10", subtitle: "AI、发送、审批和业务动作禁用", tone: "danger" },
    ],
    queueItems: [
      { title: "AI Provider / Model Gateway placeholder", status: "预留入口", risk: "中", riskTone: "warning", detail: "未来用于配置 AI Provider 或模型网关。", missingInfo: ["供应商选择", "审批策略", "成本边界"], nextStep: "后续单独规划 AI Gateway，不在本页连接。", disabled: ["不可调用 AI", "不可保存 Key", "不可自动执行"] },
      { title: "Gmail / WhatsApp integration placeholder", status: "预留入口", risk: "高", riskTone: "danger", detail: "未来可能连接外部沟通渠道。", missingInfo: ["账号授权", "发送审批", "日志策略"], nextStep: "先完成审批和只读预览规划，再考虑外部渠道。", disabled: ["不可连接账号", "不可发送消息", "不可自动回复"] },
      { title: "Approval rules placeholder", status: "待规划", risk: "中", riskTone: "warning", detail: "未来用于配置价格、交期、付款和订单审批规则。", missingInfo: ["角色", "审批层级", "风险阈值"], nextStep: "先做规则文档和只读预览，不执行审批。", disabled: ["不可审批", "不可拒绝", "不可绕过人工"] },
      { title: "Read-only safety boundary", status: "已启用预览", risk: "中", riskTone: "warning", detail: "当前 Admin UI 仅展示静态和只读信息。", missingInfo: ["真实配置未连接"], nextStep: "继续保留只读边界，避免误触发业务动作。", disabled: ["不可写入", "不可执行", "不可修改权限"] },
      { title: "User/account settings placeholder", status: "预留入口", risk: "中", riskTone: "warning", detail: "未来用于用户资料、角色和安全配置。", missingInfo: ["用户模型", "角色权限", "审计记录"], nextStep: "后续做 schema/API 规划前不接入真实账号设置。", disabled: ["不可修改权限", "不可连接账号", "不可保存设置"] },
    ],
  },
};

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

const supplierWorkflowSummaryCards = [
  { label: "可用供应商", value: "8", subtitle: "可作为候选匹配的供应商", tone: "info" },
  { label: "待报价确认", value: "5", subtitle: "单价、有效期或币种待复核", tone: "warning" },
  { label: "能力匹配", value: "6", subtitle: "与当前询盘存在能力关联", tone: "neutral" },
  { label: "高风险供应商", value: "2", subtitle: "涉及质保、责任或交期风险", tone: "danger" },
  { label: "待补资料", value: "4", subtitle: "系统、认证、包装或装柜资料缺失", tone: "warning" },
  { label: "待人工核实", value: "7", subtitle: "需要人工确认后才能使用", tone: "warning" },
];

const supplierWorkflowItems = [
  {
    title: "铝合金门窗供应商",
    capability: "门窗型材 / 五金 / 组装",
    status: "能力匹配",
    risk: "中",
    riskTone: "warning",
    need: "确认型材系统、表面处理、五金品牌和包装方式。",
    aiSuggestion: "适合作为门窗和 PD/PT 门项目候选供应商，但安装资料和系统差异必须人工确认。",
    disabledCapabilities: ["不可发送 RFQ", "不可确认报价", "不可确认交期"],
  },
  {
    title: "轻钢龙骨供应商",
    capability: "drywall profiles / Omega / U channel",
    status: "待报价确认",
    risk: "中",
    riskTone: "warning",
    need: "确认厚度、锌层、长度、包装和装柜重量。",
    aiSuggestion: "适合秘鲁轻钢龙骨询盘，建议先按重量报价并核实 20GP 装柜方案。",
    disabledCapabilities: ["不可确认单价", "不可确认装柜", "不可生成客户报价"],
  },
  {
    title: "工业吊顶系统供应商",
    capability: "金属吊顶 / 板材 / 龙骨系统",
    status: "待内部核算",
    risk: "中",
    riskTone: "warning",
    need: "确认 0.7mm 板材、Option B、安装损耗和包装方案。",
    aiSuggestion: "适合印尼工厂吊顶项目，但必须先完成材料表和供应商报价复核。",
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可生成 PI"],
  },
  {
    title: "高尔夫球车供应商",
    capability: "电动车 / 高尔夫球车 / 整柜包装",
    status: "配置待确认",
    risk: "中",
    riskTone: "warning",
    need: "确认电池、认证、包装、装柜数量和目的港要求。",
    aiSuggestion: "适合南美客户整柜询盘，但需要供应商确认不同型号和配置差异。",
    disabledCapabilities: ["不可承诺价格", "不可确认交期", "不可确认订单"],
  },
  {
    title: "表面处理供应商",
    capability: "喷涂 / 氧化 / 海边项目表面处理",
    status: "风险复核",
    risk: "高",
    riskTone: "danger",
    need: "确认海边环境适配、膜厚、质保范围和质量责任边界。",
    aiSuggestion: "涉及沿海项目风险，必须人工判断责任和表面处理方案，不得直接承诺赔付。",
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "不可确认质保结论"],
  },
];

const capabilityWorkflowSummaryCards = [
  { label: "能力分类", value: "6", subtitle: "按产品与加工方式归类", tone: "info" },
  { label: "可匹配询盘", value: "9", subtitle: "可进入人工能力匹配判断", tone: "neutral" },
  { label: "需技术确认", value: "5", subtitle: "图纸、工艺或安装说明待补充", tone: "warning" },
  { label: "高风险工艺", value: "2", subtitle: "涉及责任、质保或环境适配", tone: "danger" },
  { label: "待补资料", value: "4", subtitle: "材料、包装或供应商报价缺失", tone: "warning" },
  { label: "不可承诺交期", value: "7", subtitle: "交期必须由人工复核后确认", tone: "danger" },
];

const capabilityWorkflowItems = [
  {
    title: "铝合金门窗系统",
    process: "型材挤压 / 表面处理 / 组装",
    matchedInquiries: "PD/PT 门、门窗五金、建筑项目",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["系统图纸", "五金清单", "安装说明"],
    disabledCapabilities: ["不可确认安装结果", "不可确认交期", "不可生成正式报价"],
  },
  {
    title: "轻钢龙骨型材",
    process: "冷弯成型 / 镀锌板加工 / 打包",
    matchedInquiries: "秘鲁 drywall materials",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["厚度", "锌层", "包装方式"],
    disabledCapabilities: ["不可确认重量", "不可确认装柜", "不可报价"],
  },
  {
    title: "工业吊顶系统",
    process: "板材加工 / 龙骨系统 / 包装",
    matchedInquiries: "印尼工厂吊顶",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["安装损耗", "包装方案", "供应商最终报价"],
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可生成 PI"],
  },
  {
    title: "高尔夫球车整柜采购",
    process: "车型选择 / 配置确认 / 整柜包装",
    matchedInquiries: "南美高尔夫球车客户",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["电池规格", "认证", "装柜数量"],
    disabledCapabilities: ["不可确认订单", "不可承诺价格", "不可确认交期"],
  },
  {
    title: "沿海项目表面处理",
    process: "喷涂 / 氧化 / 防腐方案",
    matchedInquiries: "沿海铝型材问题反馈",
    risk: "高",
    riskTone: "danger",
    missingInfo: ["项目环境", "膜厚记录", "使用位置照片"],
    disabledCapabilities: ["不可确认责任", "不可承诺赔付", "不可发送最终结论"],
  },
];

const aiDraftApiState = createReadOnlyState("drafts");

function badge(label, type = "") {
  return `<span class="badge ${type}">${escapeHtml(label)}</span>`;
}

function renderSummaryCards(items, renderCard) {
  return items.map(renderCard).join("");
}

function renderChipList(items, className) {
  return items.map((label) => `<span class="${className}">${escapeHtml(label)}</span>`).join("");
}

function renderDisabledCapabilities(items) {
  return renderChipList(items, "disabled-chip");
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
          ${renderSummaryCards(workbenchOverviewCards, renderWorkbenchCard)}
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
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

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
        ${renderDisabledCapabilities(["不可发送", "不可报价", "不可生成 PI", "不可下单", "不可触发付款 / 生产 / 发货"])}
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
  const workflowModel = getCustomerWorkflowViewModel();
  if (customerApiState.status === "idle" || customerApiState.status === "loading") {
    return `
      ${renderCustomersLoading()}
      ${renderCustomerWorkflowPreview(workflowModel)}
    `;
  }

  if (customerApiState.status === "empty") {
    return `
      ${renderCustomersEmpty()}
      ${renderCustomerWorkflowPreview(workflowModel)}
    `;
  }

  const statusNotice =
    customerApiState.status === "error"
      ? renderDataStatus("error", "客户 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${customerApiState.error}`)
      : renderDataStatus("success", "客户数据已加载", `Source: ${customerApiState.source}. 只读 CRM 列表，未连接创建、更新、导入或删除动作。`);

  return `
    ${statusNotice}
    ${renderCustomerWorkflowPreview(workflowModel)}
  `;
}

function renderCustomerReview() {
  const { selectedItem, isLive } = getCustomerWorkflowViewModel();
  return `
    <div class="review-stack">
      <div class="review-card customer-review-card">
        <div class="customer-review-heading">
          <div>
            <h3>客户复核预览</h3>
            <p>${isLive ? "实时只读记录：" : "固定示例："}${escapeHtml(selectedItem.title)}。</p>
          </div>
          ${badge(isLive ? "实时只读数据" : "静态", isLive ? "active" : "draft")}
        </div>
        <dl>
          <dt>客户摘要</dt>
          <dd>${escapeHtml(selectedItem.summary)}</dd>
          <dt>当前阶段</dt>
          <dd>${escapeHtml(selectedItem.stage)}，价值 ${escapeHtml(selectedItem.valueLevel)}，风险 ${escapeHtml(selectedItem.risk)}。</dd>
          <dt>最近询盘</dt>
          <dd>${escapeHtml(selectedItem.recentInquiry)}</dd>
          <dt>需要补充</dt>
          <dd>${escapeHtml(selectedItem.need)}</dd>
          <dt>风险点</dt>
          <dd>${escapeHtml(selectedItem.riskDescription)}</dd>
          <dt>AI 建议</dt>
          <dd>${escapeHtml(selectedItem.aiSuggestion)}</dd>
          <dt>人工下一步</dt>
          <dd>${escapeHtml(selectedItem.humanNextStep)}</dd>
        </dl>
        <div class="customer-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(selectedItem.disabledCapabilities)}
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

function getCustomerWorkflowViewModel() {
  const isLive = customerApiState.status === "loaded" && customerApiState.customers.length > 0;
  const items = isLive
    ? customerApiState.customers.map(mapCustomerRecordToWorkflowItem)
    : customerWorkflowItems.map(normalizeStaticCustomerWorkflowItem);
  return {
    isLive,
    items,
    selectedItem: items[0] || normalizeStaticCustomerWorkflowItem(customerWorkflowItems[0]),
    summaryCards: isLive ? buildCustomerSummaryCardsFromRecords(items) : customerWorkflowSummaryCards,
    sourceLabel: isLive
      ? "实时只读数据"
      : customerApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览 fallback",
    queueCountLabel: isLive ? `${items.length} 条只读记录` : "5 条静态示例",
  };
}

function normalizeStaticCustomerWorkflowItem(item) {
  return {
    ...item,
    summary: item.summary || `${item.title}需要人工复核，当前不能自动跟进、报价、生成 PI 或确认订单。`,
    humanNextStep: item.humanNextStep || "由业务人员核对客户资料、询盘背景和风险边界后再推进。",
    riskDescription: item.riskDescription || "不能自动确认价格、交期、付款、订单或责任边界。",
  };
}

function mapCustomerRecordToWorkflowItem(record, index) {
  record = record || {};
  const title = firstDisplayValue([
    record.name,
    record.contact_name,
    record.company_name,
    record.company,
    record.aliases,
    `只读客户记录 ${index + 1}`,
  ]);
  const company = firstDisplayValue([record.company_name, record.company, record.aliases, record.company_id, "公司待确认"]);
  const stage = normalizeCustomerStage(record.stage || record.status || record.source || "待复核");
  const risk = deriveCustomerRisk(record);
  const need = deriveCustomerNeed(record);

  return {
    title,
    stage,
    valueLevel: deriveCustomerValueLevel(record),
    risk: risk.level,
    riskTone: risk.tone,
    recentInquiry: firstDisplayValue([
      record.recent_inquiry,
      record.last_inquiry,
      record.business_line,
      record.source,
      "客户资料待补充",
    ]),
    need,
    summary: firstDisplayValue([
      record.summary,
      record.notes,
      `${title} / ${company}`,
    ]),
    aiSuggestion: firstDisplayValue([
      record.ai_suggestion,
      record.suggested_next_step,
      record.summary,
      "需要人工确认客户资料和当前需求后再决定下一步。",
    ]),
    humanNextStep: firstDisplayValue([
      record.human_next_step,
      record.next_action,
      record.next_step,
      "人工复核客户资料、跟进背景和风险边界后再推进。",
    ]),
    riskDescription: risk.description,
    disabledCapabilities: ["不可自动发送", "不可自动报价", "不可生成 PI", "不可确认订单"],
  };
}

function normalizeCustomerStage(value) {
  const stage = String(value ?? "").trim();
  const upperStage = stage.toUpperCase();
  if (!stage) return "待复核";
  if (upperStage.includes("RISK")) return "风险待复核";
  if (upperStage.includes("ACTIVE")) return "活跃客户";
  if (upperStage.includes("NEW")) return "新客户";
  if (upperStage.includes("FOLLOW")) return "待跟进";
  return stage;
}

function deriveCustomerValueLevel(record) {
  const value = firstDisplayValue([record.value_level, record.priority, record.customer_value, record.tier, "暂无价值等级"]);
  const lowerValue = value.toLowerCase();
  if (value.includes("高") || lowerValue.includes("high") || lowerValue.includes("vip")) return "高";
  if (value.includes("中") || lowerValue.includes("medium")) return "中";
  return value;
}

function deriveCustomerRisk(record) {
  const combinedText = [
    record.risk,
    record.risk_level,
    record.risk_flags,
    record.stage,
    record.status,
    record.notes,
    record.summary,
  ]
    .flat()
    .join(" ")
    .toLowerCase();
  const highRiskTerms = ["high", "高", "price", "payment", "delivery", "quality", "claim", "refund", "赔付", "质量", "价格", "付款", "交期"];
  if (highRiskTerms.some((term) => combinedText.includes(term))) {
    return {
      level: "高",
      tone: "danger",
      description: "客户记录包含价格、付款、交期、质量或责任相关风险，必须人工复核。",
    };
  }
  const missingFields = getCustomerMissingFields(record);
  if (missingFields.length) {
    return {
      level: "中",
      tone: "warning",
      description: "客户资料仍有缺失，不能自动判断跟进、报价或订单状态。",
    };
  }
  return {
    level: "暂无风险等级",
    tone: "neutral",
    description: "暂无明确风险等级，仍需人工确认后再推进。",
  };
}

function getCustomerMissingFields(record) {
  const missing = [];
  if (!hasDisplayValue([record.company_name, record.company, record.aliases, record.company_id])) missing.push("公司");
  if (!hasDisplayValue([record.country])) missing.push("国家");
  if (!hasDisplayValue([record.language])) missing.push("语言");
  if (!hasDisplayValue([record.source, record.metadata?.source])) missing.push("来源");
  return missing;
}

function hasDisplayValue(values) {
  return values.some((item) => item !== undefined && item !== null && String(item).trim() !== "");
}

function deriveCustomerNeed(record) {
  const missingFields = getCustomerMissingFields(record);
  if (missingFields.length) return `${missingFields.join("、")}待补充。`;
  return firstDisplayValue([
    record.need,
    record.next_action,
    record.notes,
    "需要人工确认客户当前需求和下一步跟进方式。",
  ]);
}

function buildCustomerSummaryCardsFromRecords(items) {
  const followUpCount = items.filter((item) => item.stage.includes("跟进") || item.humanNextStep.includes("跟进")).length;
  const activeCount = items.filter((item) => item.stage.includes("活跃") || item.recentInquiry !== "客户资料待补充").length;
  const highValueCount = items.filter((item) => item.valueLevel === "高").length;
  const riskCount = items.filter((item) => item.risk === "高").length;
  const missingCount = items.filter((item) => item.need.includes("待补充")).length;
  return [
    { label: "只读客户", value: String(items.length), subtitle: "来自现有只读客户数据路径", tone: "info" },
    { label: "今日需跟进", value: String(followUpCount), subtitle: "需要人工判断是否联系客户", tone: "warning" },
    { label: "有活跃线索", value: String(activeCount), subtitle: "存在来源、业务线或近期记录", tone: "info" },
    { label: "高价值客户", value: String(highValueCount), subtitle: "仅按只读字段做保守展示", tone: "neutral" },
    { label: "风险客户", value: String(riskCount), subtitle: "价格、付款、交期或质量相关", tone: "danger" },
    { label: "待补资料客户", value: String(missingCount), subtitle: "公司、国家、语言或来源不完整", tone: "warning" },
  ];
}

function renderCustomerWorkflowPreview(model = getCustomerWorkflowViewModel()) {
  return `
    <div class="customer-workflow-preview" aria-label="客户中心只读工作流预览">
      <div class="customer-workflow-header">
        <div>
          <span class="state-label">客户中心</span>
          <h3>客户中心</h3>
          <p>集中查看客户分层、跟进状态、活跃询盘和人工下一步动作。</p>
          <p class="customer-safety-note">只读数据用于界面展示；所有跟进、报价、PI、订单、发送和交期承诺必须人工复核。</p>
        </div>
        <div class="workbench-badges">
          ${badge(model.sourceLabel, model.isLive ? "active" : "draft")}
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
          <span>${escapeHtml(model.sourceLabel)}</span>
        </div>
        <div class="customer-summary-grid">
          ${renderSummaryCards(model.summaryCards, renderCustomerSummaryCard)}
        </div>
      </section>

      <section class="customer-workflow-section" aria-label="客户处理队列">
        <div class="workbench-section-header">
          <div>
            <h3>客户处理队列</h3>
            <p>队列只展示人工建议和禁用能力，不触发跟进、报价或订单动作。</p>
          </div>
          <span>${escapeHtml(model.queueCountLabel)}</span>
        </div>
        <div class="customer-queue">
          ${model.items.map(renderCustomerQueueItem).join("")}
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
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

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
      <p><strong>人工下一步：</strong>${escapeHtml(item.humanNextStep)}</p>
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

function renderSuppliers() {
  return `
    <div class="supplier-workflow-preview" aria-label="供应商中心静态工作流预览">
      <div class="supplier-workflow-header">
        <div>
          <span class="state-label">供应商中心</span>
          <h3>供应商中心</h3>
          <p>集中查看供应商能力、报价状态、风险提醒和人工核实事项。</p>
          <p class="supplier-safety-note">静态预览数据，仅用于界面验证；所有询价、报价、交期、质保和供应商承诺必须人工核实。</p>
        </div>
        <div class="workbench-badges">
          ${badge("静态预览", "active")}
          ${badge("只读", "active")}
          ${badge("人工核实", "pending")}
        </div>
      </div>

      <section class="supplier-workflow-section" aria-label="供应商摘要">
        <div class="workbench-section-header">
          <div>
            <h3>供应商概览</h3>
            <p>先把候选供应商、报价确认、能力匹配和风险压缩成可扫读状态。</p>
          </div>
          <span>静态数据</span>
        </div>
        <div class="supplier-summary-grid">
          ${renderSummaryCards(supplierWorkflowSummaryCards, renderSupplierSummaryCard)}
        </div>
      </section>

      <section class="supplier-workflow-section" aria-label="供应商处理队列">
        <div class="workbench-section-header">
          <div>
            <h3>供应商处理队列</h3>
            <p>队列仅展示候选匹配和人工核实建议，不发送 RFQ，不确认报价或交期。</p>
          </div>
          <span>5 条静态示例</span>
        </div>
        <div class="supplier-queue">
          ${supplierWorkflowItems.map(renderSupplierQueueItem).join("")}
        </div>
      </section>

      <div class="form-card read-only-card supplier-boundary-card">
        <h3>供应商中心只读边界</h3>
        <p>本区域仅用于静态预览供应商匹配思路，不会创建供应商、发送 RFQ 或确认供应商承诺。</p>
        <div class="supplier-boundary-grid">
          <div>
            <span>允许动作</span>
            <strong>只读供应商查看</strong>
            <small>当前没有供应商 API、RFQ 发送或报价确认动作。</small>
          </div>
          <div>
            <span>禁止动作</span>
            <strong>No RFQ / quote / delivery confirmation</strong>
            <small>供应商询价、报价、交期和质保必须人工核实。</small>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSupplierReview() {
  return `
    <div class="review-stack">
      <div class="review-card supplier-review-card">
        <div class="supplier-review-heading">
          <div>
            <h3>供应商复核预览</h3>
            <p>固定示例：铝合金门窗供应商。</p>
          </div>
          ${badge("静态", "draft")}
        </div>
        <dl>
          <dt>供应商摘要</dt>
          <dd>门窗型材、五金和组装候选供应商，适合建筑类门窗和 PD/PT 门项目的人工初筛。</dd>
          <dt>能力范围</dt>
          <dd>门窗型材 / 五金 / 组装。</dd>
          <dt>适用询盘</dt>
          <dd>门窗五金、PD/PT 门、建筑项目。</dd>
          <dt>待确认事项</dt>
          <dd>型材系统、表面处理、五金品牌、包装方式和安装资料。</dd>
          <dt>风险点</dt>
          <dd>不能直接确认报价、交期、安装效果或供应商正式承诺。</dd>
          <dt>AI 建议</dt>
          <dd>适合作为候选供应商，但安装资料和系统差异必须人工确认。</dd>
          <dt>人工下一步</dt>
          <dd>由业务人员核对项目要求和供应商资料，再决定是否人工发起询价。</dd>
        </dl>
        <div class="supplier-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(["不可发送 RFQ", "不可确认报价", "不可确认交期", "不可生成客户报价"])}
          </div>
        </div>
      </div>
      <div class="review-card">
        <h3>供应商预览状态</h3>
        <dl>
          <dt>数据来源</dt>
          <dd>静态预览</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
          <dt>外发动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
    </div>
  `;
}

function renderSupplierSummaryCard(card) {
  return `
    <article class="supplier-summary-card supplier-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderSupplierQueueItem(item) {
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

  return `
    <article class="supplier-queue-item">
      <div class="supplier-queue-main">
        <div class="supplier-queue-title">
          <span class="workbench-category">${escapeHtml(item.capability)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="supplier-queue-meta">
          ${badge(item.status, item.status.includes("风险") ? "risk" : "pending")}
          <span class="supplier-risk supplier-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
        </div>
      </div>
      <p><strong>待确认：</strong>${escapeHtml(item.need)}</p>
      <p><strong>AI 建议：</strong>${escapeHtml(item.aiSuggestion)}</p>
      <div class="supplier-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
  `;
}

function renderInquiries() {
  const workflowModel = getInquiryWorkflowViewModel();
  if (inquiryApiState.status === "idle" || inquiryApiState.status === "loading") {
    return `
      ${renderInquiriesLoading()}
      ${renderInquiryWorkflowPreview(workflowModel)}
    `;
  }

  if (inquiryApiState.status === "empty") {
    return `
      ${renderInquiriesEmpty()}
      ${renderInquiryWorkflowPreview(workflowModel)}
    `;
  }

  const statusNotice =
    inquiryApiState.status === "error"
      ? renderDataStatus("error", "询盘 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${inquiryApiState.error}`)
      : renderDataStatus("success", "询盘数据已加载", `Source: ${inquiryApiState.source}. 只读询盘列表，未连接创建、AI 自动处理、发送、报价或 PI 动作。`);

  return `
    ${statusNotice}
    ${renderInquiryWorkflowPreview(workflowModel)}
  `;
}

function renderInquiryReview() {
  const { selectedItem, isLive } = getInquiryWorkflowViewModel();
  return `
    <div class="review-stack">
      <div class="review-card inquiry-review-card">
        <div class="inquiry-review-heading">
          <div>
            <h3>询盘复核预览</h3>
            <p>${isLive ? "实时只读记录：" : "固定示例："}${escapeHtml(selectedItem.title)}。</p>
          </div>
          ${badge(isLive ? "实时只读数据" : "静态", isLive ? "active" : "draft")}
        </div>
        <dl>
          <dt>客户需求摘要</dt>
          <dd>${escapeHtml(selectedItem.summary)}</dd>
          <dt>客户 / 公司</dt>
          <dd>${escapeHtml(selectedItem.customerCompany)}</dd>
          <dt>当前状态</dt>
          <dd>${escapeHtml(selectedItem.status)}</dd>
          <dt>缺失信息</dt>
          <dd>${escapeHtml(selectedItem.missingInfo.join("、"))}</dd>
          <dt>风险点</dt>
          <dd>${escapeHtml(selectedItem.riskDescription)}</dd>
          <dt>AI 建议</dt>
          <dd>${escapeHtml(selectedItem.aiSuggestion)}</dd>
          <dt>人工下一步</dt>
          <dd>${escapeHtml(selectedItem.humanNextStep)}</dd>
        </dl>
        <div class="inquiry-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(selectedItem.disabledCapabilities)}
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

function getInquiryWorkflowViewModel() {
  const isLive = inquiryApiState.status === "loaded" && inquiryApiState.inquiries.length > 0;
  const items = isLive
    ? inquiryApiState.inquiries.map(mapInquiryRecordToWorkflowItem)
    : inquiryWorkflowItems.map(normalizeStaticInquiryWorkflowItem);
  return {
    isLive,
    items,
    selectedItem: items[0] || normalizeStaticInquiryWorkflowItem(inquiryWorkflowItems[0]),
    summaryCards: isLive ? buildInquirySummaryCardsFromRecords(items) : inquiryWorkflowSummaryCards,
    sourceLabel: isLive
      ? "实时只读数据"
      : inquiryApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览 fallback",
    queueCountLabel: isLive ? `${items.length} 条只读记录` : "5 条静态示例",
  };
}

function normalizeStaticInquiryWorkflowItem(item) {
  return {
    ...item,
    summary: item.summary || `${item.title}需要人工复核，当前不能直接进入报价、PI、订单或发送动作。`,
    customerCompany: item.customerCompany || "静态示例客户 / 公司",
    humanNextStep: item.humanNextStep || "由业务人员补齐关键信息并人工判断下一步。",
    riskDescription: item.riskDescription || "规格、价格、交期、责任或业务承诺均不能自动确认。",
  };
}

function mapInquiryRecordToWorkflowItem(record, index) {
  record = record || {};
  const title = firstDisplayValue([
    record.title,
    record.project_description,
    record.original_message,
    `只读询盘记录 ${index + 1}`,
  ]);
  const customerName = firstDisplayValue([record.lead_info?.name, record.customer_name, record.customer_id, "客户待确认"]);
  const companyName = firstDisplayValue([record.lead_info?.company, record.company_name, record.company_id, "公司待确认"]);
  const missingInfo = normalizeListValue(record.missing_info || record.missing_information || record.missingInfo);
  const status = normalizeInquiryStatus(record.status || record.inquiry_status || "待复核");
  const risk = deriveInquiryRisk(record, missingInfo, status);

  return {
    title,
    category: firstDisplayValue([record.inquiry_type, record.project_type, record.source, "询盘"]),
    status,
    risk: risk.level,
    riskTone: risk.tone,
    missingInfo,
    summary: firstDisplayValue([
      record.ai_summary,
      record.summary,
      record.original_message,
      record.project_description,
      title,
    ]),
    customerCompany: `${customerName} / ${companyName}`,
    aiSuggestion: firstDisplayValue([
      record.ai_suggestion,
      record.suggested_next_step,
      record.ai_summary,
      "需要人工确认资料完整性后再决定下一步。",
    ]),
    humanNextStep: firstDisplayValue([
      record.human_next_step,
      record.next_action,
      record.next_step,
      "人工复核客户需求、缺失资料和风险边界后再推进。",
    ]),
    riskDescription: risk.description,
    disabledCapabilities: ["不可报价", "不可生成 PI", "不可确认订单", "不可发送"],
  };
}

function firstDisplayValue(values) {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim() !== "");
  return displayValue(value);
}

function normalizeListValue(value) {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item ?? "").trim()).filter(Boolean);
    return items.length ? items : ["信息待补充"];
  }
  if (typeof value === "string") {
    const items = value
      .split(/[,，;；\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length ? items : ["信息待补充"];
  }
  return ["信息待补充"];
}

function normalizeInquiryStatus(value) {
  const status = String(value ?? "").trim();
  const upperStatus = status.toUpperCase();
  if (!status) return "待复核";
  if (upperStatus.includes("HIGH_RISK")) return "高风险";
  if (upperStatus.includes("NEED") || upperStatus.includes("REVIEW")) return "待复核";
  if (upperStatus === "NEW") return "新询盘";
  if (upperStatus.includes("MISSING")) return "缺失信息";
  return status;
}

function deriveInquiryRisk(record, missingInfo, status) {
  const combinedText = [
    record.risk,
    record.risk_level,
    record.risk_flags,
    record.original_message,
    record.project_description,
    record.ai_summary,
    status,
  ]
    .flat()
    .join(" ")
    .toLowerCase();
  const highRiskTerms = ["high", "高", "price", "payment", "delivery", "quality", "claim", "refund", "赔付", "质量", "价格", "付款", "交期"];
  if (highRiskTerms.some((term) => combinedText.includes(term))) {
    return {
      level: "高",
      tone: "danger",
      description: "记录包含价格、付款、交期、质量或责任相关风险，必须人工复核。",
    };
  }
  if (missingInfo.length > 0 && !missingInfo.includes("信息待补充")) {
    return {
      level: "中",
      tone: "warning",
      description: "记录存在缺失信息，不能直接判断报价、交期或订单条件。",
    };
  }
  return {
    level: "暂无风险等级",
    tone: "neutral",
    description: "暂无明确风险等级，仍需人工确认后再推进。",
  };
}

function buildInquirySummaryCardsFromRecords(items) {
  const missingCount = items.filter((item) => !item.missingInfo.includes("信息待补充") && item.missingInfo.length > 0).length;
  const highRiskCount = items.filter((item) => item.risk === "高").length;
  const reviewCount = items.filter((item) => item.status.includes("复核") || item.status.includes("缺失")).length;
  return [
    { label: "只读询盘", value: String(items.length), subtitle: "来自现有只读数据路径", tone: "info" },
    { label: "缺失信息", value: String(missingCount), subtitle: "资料、规格或客户需求待补齐", tone: "warning" },
    { label: "高风险", value: String(highRiskCount), subtitle: "价格、付款、交期或质量相关", tone: "danger" },
    { label: "待人工复核", value: String(reviewCount || items.length), subtitle: "不能自动发送或报价", tone: "warning" },
    { label: "静态 fallback", value: "保留", subtitle: "API 不可用时继续显示示例", tone: "neutral" },
    { label: "写入动作", value: "0", subtitle: "未连接创建、报价、PI 或发送", tone: "info" },
  ];
}

function renderInquiryWorkflowPreview(model = getInquiryWorkflowViewModel()) {
  return `
    <div class="inquiry-workflow-preview" aria-label="询盘中心只读工作流预览">
      <div class="inquiry-workflow-header">
        <div>
          <span class="state-label">询盘中心</span>
          <h3>询盘中心</h3>
          <p>集中查看新询盘、缺失信息、风险提醒和人工下一步动作。</p>
          <p class="inquiry-safety-note">只读数据用于界面展示；所有报价、PI、订单、发送和交期承诺必须人工复核。</p>
        </div>
        <div class="workbench-badges">
          ${badge(model.sourceLabel, model.isLive ? "active" : "draft")}
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
          <span>${escapeHtml(model.sourceLabel)}</span>
        </div>
        <div class="inquiry-summary-grid">
          ${renderSummaryCards(model.summaryCards, renderInquirySummaryCard)}
        </div>
      </section>

      <section class="inquiry-workflow-section" aria-label="询盘处理队列">
        <div class="workbench-section-header">
          <div>
            <h3>待处理询盘队列</h3>
            <p>队列只展示人工建议和禁用能力，不触发报价、发送或订单动作。</p>
          </div>
          <span>${escapeHtml(model.queueCountLabel)}</span>
        </div>
        <div class="inquiry-queue">
          ${model.items.map(renderInquiryQueueItem).join("")}
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
  const missingInfoHtml = renderChipList(item.missingInfo, "inquiry-chip");
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

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
      <p><strong>人工下一步：</strong>${escapeHtml(item.humanNextStep)}</p>
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
    return `
      ${renderManufacturingCapabilitiesLoading()}
      ${renderCapabilityWorkflowPreview()}
    `;
  }

  if (capabilityApiState.status === "empty") {
    return `
      ${renderManufacturingCapabilitiesEmpty()}
      ${renderCapabilityWorkflowPreview()}
    `;
  }

  const statusNotice =
    capabilityApiState.status === "error"
      ? renderDataStatus("error", "制造能力 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${capabilityApiState.error}`)
      : renderDataStatus("success", "制造能力数据已加载", `Source: ${capabilityApiState.source}. Read-only list. No create, update or delete action is connected.`);

  return `
    ${statusNotice}
    ${renderCapabilityWorkflowPreview()}
  `;
}

function renderManufacturingCapabilityReview() {
  return `
    <div class="review-stack">
      <div class="review-card capability-review-card">
        <div class="capability-review-heading">
          <div>
            <h3>制造能力复核预览</h3>
            <p>固定示例：铝合金门窗系统。</p>
          </div>
          ${badge("不承诺交期", "pending")}
        </div>
        <dl>
          <dt>能力摘要</dt>
          <dd>铝合金门窗系统可用于 PD/PT 门、门窗五金和建筑项目，但必须补齐系统图纸、五金清单和安装说明。</dd>
          <dt>适用询盘</dt>
          <dd>PD/PT 门、门窗五金、建筑项目。</dd>
          <dt>加工方式</dt>
          <dd>型材挤压 / 表面处理 / 组装。</dd>
          <dt>资料缺口</dt>
          <dd>系统图纸、五金清单、安装说明。</dd>
          <dt>风险点</dt>
          <dd>不能直接确认安装结果、生产可行性、正式报价或交期。</dd>
          <dt>AI 建议</dt>
          <dd>先核对系统资料和供应商反馈，再由人工判断是否进入询价或报价准备。</dd>
          <dt>人工下一步</dt>
          <dd>补齐技术资料并核实供应商能力，不在本页面承诺生产或发货。</dd>
        </dl>
        <div class="capability-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(["不可确认安装结果", "不可确认交期", "不可生成正式报价", "不可触发生产 / 发货"])}
          </div>
        </div>
      </div>
      <div class="review-card">
        <h3>制造能力 API 状态</h3>
        <dl>
          <dt>API 路由</dt>
          <dd>GET /api/manufacturing-capabilities</dd>
          <dt>记录数量</dt>
          <dd>${escapeHtml(String(capabilityApiState.capabilities.length))}</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
    </div>
  `;
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
  `;
}

function renderCapabilityWorkflowPreview() {
  return `
    <div class="capability-workflow-preview" aria-label="制造能力中心静态工作流预览">
      <div class="capability-workflow-header">
        <div>
          <span class="state-label">制造能力中心</span>
          <h3>制造能力中心</h3>
          <p>查看产品能力、加工方式、资料缺口和生产风险。</p>
          <p class="capability-safety-note">静态预览数据，仅用于界面验证；所有生产能力、加工方案、交期和质量责任必须人工复核。</p>
        </div>
        <div class="workbench-badges">
          ${badge("静态预览", "active")}
          ${badge("只读", "active")}
          ${badge("不承诺交期", "pending")}
        </div>
      </div>

      <section class="capability-workflow-section" aria-label="制造能力摘要">
        <div class="workbench-section-header">
          <div>
            <h3>能力概览</h3>
            <p>把可匹配询盘、技术确认、资料缺口和高风险工艺整理成可扫读状态。</p>
          </div>
          <span>静态数据</span>
        </div>
        <div class="capability-summary-grid">
          ${renderSummaryCards(capabilityWorkflowSummaryCards, renderCapabilitySummaryCard)}
        </div>
      </section>

      <section class="capability-workflow-section" aria-label="制造能力队列">
        <div class="workbench-section-header">
          <div>
            <h3>制造能力队列</h3>
            <p>队列只展示能力匹配和缺失资料，不确认生产可行性、交期或报价。</p>
          </div>
          <span>5 条静态示例</span>
        </div>
        <div class="capability-queue">
          ${capabilityWorkflowItems.map(renderCapabilityQueueItem).join("")}
        </div>
      </section>

      ${renderReadOnlyCapabilityCard()}
    </div>
  `;
}

function renderCapabilitySummaryCard(card) {
  return `
    <article class="capability-summary-card capability-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderCapabilityQueueItem(item) {
  const missingInfoHtml = renderChipList(item.missingInfo, "capability-chip");
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

  return `
    <article class="capability-queue-item">
      <div class="capability-queue-main">
        <div class="capability-queue-title">
          <span class="workbench-category">${escapeHtml(item.process)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="capability-queue-meta">
          <span class="capability-risk capability-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
        </div>
      </div>
      <p><strong>匹配询盘：</strong>${escapeHtml(item.matchedInquiries)}</p>
      <div class="capability-row-group">
        <span>资料缺口</span>
        <div class="capability-chip-row">${missingInfoHtml}</div>
      </div>
      <div class="capability-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
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
    <div class="form-card read-only-card capability-boundary-card">
      <h3>制造能力查看模式</h3>
      <p>本区域仅用于查看和预览制造能力，不会创建能力记录、确认生产可行性或承诺交期。</p>
      <div class="capability-boundary-grid">
        <div>
          <span>允许动作</span>
          <strong>只读制造能力查看</strong>
          <small>No create, update or delete API call is connected.</small>
        </div>
        <div>
          <span>安全边界</span>
          <strong>不承诺生产或交期</strong>
          <small>Capability display does not confirm feasibility, price or delivery time.</small>
        </div>
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

  const statusNotice =
    aiDraftApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时 AI 询盘分析草稿", "当前没有可用实时数据。AI 复核中心 V2 使用静态只读预览，不执行任何业务动作。")
      : aiDraftApiState.status === "error"
      ? renderDataStatus("error", "AI 询盘分析 API 暂不可用", `${apiUnavailableMessage} Showing ${fallbackLabel} only. Technical detail: ${aiDraftApiState.error}`)
      : renderDataStatus("success", "AI 询盘分析草稿已加载", `Source: ${aiDraftApiState.source}. 只读草稿列表，未连接发送、报价或 PI 动作。`);

  return `
    ${statusNotice}
    ${renderAiReviewCenterPreview()}
  `;
}

function renderAiReviewCenterPreview() {
  return `
    <div class="ai-review-preview" aria-label="AI 复核中心静态工作流预览">
      <div class="ai-review-preview-header">
        <div>
          <span class="state-label">AI 复核中心</span>
          <h3>AI 复核中心</h3>
          <p>集中复核 AI 草稿、风险提醒、缺失信息和人工下一步建议。</p>
          <p class="ai-review-safety-note">静态预览数据，仅用于界面验证；AI 仅可生成建议和草稿，所有发送、报价、PI、订单、赔付和交期承诺必须人工审批。</p>
        </div>
        <div class="ai-review-preview-badges">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("人工审批前置", "approval")}
          ${badge("不自动发送", "pending")}
        </div>
      </div>

      <section class="ai-review-section" aria-label="AI 复核概览">
        <div class="workbench-section-header">
          <div>
            <span>AI REVIEW SUMMARY</span>
            <h3>今日 AI 复核概览</h3>
          </div>
          <p>所有数字均为静态示例，不代表实时业务状态。</p>
        </div>
        <div class="ai-review-summary-grid">
          ${renderSummaryCards(aiReviewSummaryCards, renderAiReviewSummaryCard)}
        </div>
      </section>

      <section class="ai-review-section" aria-label="AI 复核队列">
        <div class="workbench-section-header">
          <div>
            <span>AI REVIEW QUEUE</span>
            <h3>AI 复核队列</h3>
          </div>
          <p>按风险和信息缺口整理，帮助操作员先判断再行动。</p>
        </div>
        <div class="ai-review-queue">
          ${aiReviewQueueItems.map(renderAiReviewQueueItem).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderAiReviewSummaryCard(card) {
  return `
    <article class="ai-review-summary-card ai-review-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderAiReviewQueueItem(item) {
  const missingInfoHtml = renderChipList(item.missingInfo, "ai-chip");
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

  return `
    <article class="ai-review-queue-item">
      <div class="ai-review-queue-main">
        <div class="ai-review-queue-title">
          <span class="workbench-category">${escapeHtml(item.type)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="ai-review-queue-meta">
          <span class="ai-risk ai-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
          <span class="ai-status">${escapeHtml(item.status)}</span>
        </div>
      </div>
      <p><strong>AI 建议：</strong>${escapeHtml(item.aiSuggestion)}</p>
      <p><strong>人工下一步：</strong>${escapeHtml(item.humanNextStep)}</p>
      <div class="ai-review-row-group">
        <span>缺失信息 / 待核实</span>
        <div class="ai-chip-row">${missingInfoHtml}</div>
      </div>
      <div class="ai-review-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
  `;
}

function renderAiDraftReview() {
  const selected = aiReviewQueueItems[0];
  return `
    <div class="review-card ai-review-card" aria-label="AI 复核预览">
      <div class="ai-review-heading">
        <div>
          <span class="state-label">AI 复核预览</span>
          <h3>AI 复核预览</h3>
          <p>固定示例：秘鲁轻钢龙骨询盘 AI 初判。</p>
        </div>
        <div class="ai-review-meta">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("不自动发送", "pending")}
        </div>
      </div>
      <dl>
        <dt>复核摘要</dt>
        <dd>客户询盘缺少厚度、锌层、包装和装柜重量信息，当前只能作为 AI 初判建议，不能进入报价或客户回复。</dd>
        <dt>类型</dt>
        <dd>${escapeHtml(selected.type)}</dd>
        <dt>风险等级</dt>
        <dd><span class="ai-risk ai-risk-${escapeHtml(selected.riskTone)}">${escapeHtml(selected.risk)}</span></dd>
        <dt>AI 建议</dt>
        <dd>${escapeHtml(selected.aiSuggestion)}</dd>
        <dt>缺失信息</dt>
        <dd>${renderChipList(selected.missingInfo, "ai-chip")}</dd>
        <dt>人工下一步</dt>
        <dd>${escapeHtml(selected.humanNextStep)}</dd>
        <dt>审批边界</dt>
        <dd>AI 仅可生成建议和草稿；所有发送、报价、PI、订单、赔付和交期承诺必须人工审批。</dd>
      </dl>
      <div class="ai-review-group">
        <h4>禁用能力</h4>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities([...selected.disabledCapabilities, "不可下单", "不可触发付款 / 生产 / 发货"])}
        </div>
      </div>
      <div class="ai-review-group">
        <h4>技术说明</h4>
        <p>静态预览数据。当前不调用 AI、不调用 API、不执行助手、不写入数据库。</p>
        <dl class="ai-review-technical">
          <dt>API 路由</dt>
          <dd>GET /api/ai-inquiry-analyses</dd>
          <dt>记录数量</dt>
          <dd>${escapeHtml(String(aiDraftApiState.drafts.length))}</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
    </div>
  `;
}

function renderAiDraftsLoading() {
  return `
    ${renderDataStatus("loading", "正在加载 AI 询盘分析草稿", "正在使用当前管理员会话请求 GET /api/ai-inquiry-analyses。")}
    ${renderAiReviewCenterPreview()}
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

function renderFiles() {
  return `
    <div class="file-center-preview" aria-label="文件中心静态工作流预览">
      <div class="file-center-header">
        <div>
          <span class="state-label">文件中心</span>
          <h3>文件中心</h3>
          <p>集中查看询盘附件、图纸资料、合同单据、质量证据和缺失文件。</p>
          <p class="file-center-safety-note">静态预览数据，仅用于界面验证；所有文件解析、报价、PI、合同、订单、赔付和交期承诺必须人工复核。</p>
        </div>
        <div class="file-center-badges">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("人工复核", "approval")}
          ${badge("不自动解析", "pending")}
        </div>
      </div>

      <section class="file-center-section" aria-label="文件复核概览">
        <div class="workbench-section-header">
          <div>
            <span>FILE REVIEW SUMMARY</span>
            <h3>文件复核概览</h3>
          </div>
          <p>所有文件记录均为静态示例，不代表真实客户文件。</p>
        </div>
        <div class="file-summary-grid">
          ${renderSummaryCards(fileCenterSummaryCards, renderFileSummaryCard)}
        </div>
      </section>

      <section class="file-center-section" aria-label="文件复核队列">
        <div class="workbench-section-header">
          <div>
            <span>FILE REVIEW QUEUE</span>
            <h3>文件复核队列</h3>
          </div>
          <p>按文件类型、风险和缺失资料整理，帮助操作员先复核再进入业务动作。</p>
        </div>
        <div class="file-review-queue">
          ${fileCenterQueueItems.map(renderFileQueueItem).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderFileSummaryCard(card) {
  return `
    <article class="file-summary-card file-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderFileQueueItem(item) {
  const missingInfoHtml = renderChipList(item.missingInfo, "file-chip");
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

  return `
    <article class="file-review-queue-item">
      <div class="file-review-queue-main">
        <div class="file-review-queue-title">
          <span class="workbench-category">${escapeHtml(item.type)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="file-review-queue-meta">
          <span class="file-risk file-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
          <span class="file-status">${escapeHtml(item.status)}</span>
        </div>
      </div>
      <p><strong>关联业务：</strong>${escapeHtml(item.linkedBusiness)}</p>
      <p><strong>AI 建议：</strong>${escapeHtml(item.aiSuggestion)}</p>
      <p><strong>人工下一步：</strong>${escapeHtml(item.humanNextStep)}</p>
      <div class="file-row-group">
        <span>缺失资料</span>
        <div class="file-chip-row">${missingInfoHtml}</div>
      </div>
      <div class="file-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
  `;
}

function renderFileReview() {
  const selected = fileCenterQueueItems[0];
  return `
    <div class="review-card file-review-card" aria-label="文件复核预览">
      <div class="file-review-heading">
        <div>
          <span class="state-label">文件复核预览</span>
          <h3>文件复核预览</h3>
          <p>固定示例：秘鲁轻钢龙骨规格资料。</p>
        </div>
        <div class="file-review-meta">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("不自动解析", "pending")}
        </div>
      </div>
      <dl>
        <dt>文件摘要</dt>
        <dd>客户提供的规格资料不足以直接报价，需要补齐厚度、锌层、包装和装柜重量后再进入人工判断。</dd>
        <dt>文件类型</dt>
        <dd>${escapeHtml(selected.type)}</dd>
        <dt>关联业务</dt>
        <dd>${escapeHtml(selected.linkedBusiness)}</dd>
        <dt>当前状态</dt>
        <dd>${escapeHtml(selected.status)}</dd>
        <dt>风险点</dt>
        <dd><span class="file-risk file-risk-${escapeHtml(selected.riskTone)}">风险 ${escapeHtml(selected.risk)}</span></dd>
        <dt>缺失资料</dt>
        <dd>${renderChipList(selected.missingInfo, "file-chip")}</dd>
        <dt>AI 建议</dt>
        <dd>${escapeHtml(selected.aiSuggestion)}</dd>
        <dt>人工下一步</dt>
        <dd>${escapeHtml(selected.humanNextStep)}</dd>
      </dl>
      <div class="file-review-group">
        <h4>禁用能力</h4>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities([...selected.disabledCapabilities, "不可上传", "不可删除", "不可 OCR / 解析"])}
        </div>
      </div>
      <div class="file-review-group">
        <h4>安全边界</h4>
        <p>本页只展示静态文件复核预览；不读取真实文件、不上传、不删除、不解析、不归档，也不生成报价、PI、合同或订单。</p>
      </div>
    </div>
  `;
}

function renderQuotations() {
  return `
    <div class="quote-review-preview" aria-label="报价前复核静态工作流预览">
      <div class="quote-review-header">
        <div>
          <span class="state-label">报价前复核</span>
          <h3>报价前复核</h3>
          <p>集中检查客户需求、供应商报价、资料完整性、风险边界和人工报价准备状态。</p>
          <p class="quote-review-safety-note">静态预览数据，仅用于界面验证；所有价格、报价、PI、合同、订单、赔付和交期承诺必须人工复核。</p>
        </div>
        <div class="quote-review-badges">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("人工复核", "approval")}
          ${badge("不生成报价", "pending")}
        </div>
      </div>

      <section class="quote-review-section" aria-label="报价前复核概览">
        <div class="workbench-section-header">
          <div>
            <span>PRE-QUOTATION SUMMARY</span>
            <h3>报价准备概览</h3>
          </div>
          <p>所有报价状态均为静态示例，不代表真实可报价状态。</p>
        </div>
        <div class="quote-summary-grid">
          ${renderSummaryCards(quoteReviewSummaryCards, renderQuoteSummaryCard)}
        </div>
      </section>

      <section class="quote-review-section" aria-label="报价前复核队列">
        <div class="workbench-section-header">
          <div>
            <span>PRE-QUOTATION QUEUE</span>
            <h3>报价前复核队列</h3>
          </div>
          <p>先确认资料、供应商反馈和风险边界，再由人工准备报价草稿。</p>
        </div>
        <div class="quote-review-queue">
          ${quoteReviewQueueItems.map(renderQuoteQueueItem).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderQuoteSummaryCard(card) {
  return `
    <article class="quote-summary-card quote-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderQuoteQueueItem(item) {
  const missingInfoHtml = renderChipList(item.missingInfo, "quote-chip");
  const disabledHtml = renderDisabledCapabilities(item.disabledCapabilities);

  return `
    <article class="quote-review-queue-item">
      <div class="quote-review-queue-main">
        <div class="quote-review-queue-title">
          <span class="workbench-category">${escapeHtml(item.readiness)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="quote-review-queue-meta">
          <span class="quote-risk quote-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
          <span class="quote-status">${escapeHtml(item.status)}</span>
        </div>
      </div>
      <p><strong>客户需求：</strong>${escapeHtml(item.customerNeed)}</p>
      <p><strong>供应商状态：</strong>${escapeHtml(item.supplierStatus)}</p>
      <p><strong>AI 建议：</strong>${escapeHtml(item.aiSuggestion)}</p>
      <p><strong>人工下一步：</strong>${escapeHtml(item.humanNextStep)}</p>
      <div class="quote-row-group">
        <span>缺失资料</span>
        <div class="quote-chip-row">${missingInfoHtml}</div>
      </div>
      <div class="quote-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
  `;
}

function renderQuotationReview() {
  const selected = quoteReviewQueueItems[0];
  return `
    <div class="review-card quote-review-card" aria-label="报价前复核预览">
      <div class="quote-review-heading">
        <div>
          <span class="state-label">报价前复核预览</span>
          <h3>报价前复核预览</h3>
          <p>固定示例：秘鲁轻钢龙骨报价前复核。</p>
        </div>
        <div class="quote-review-meta">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("不生成报价", "pending")}
        </div>
      </div>
      <dl>
        <dt>复核摘要</dt>
        <dd>客户需要 20GP 整柜轻钢龙骨材料，但厚度、锌层、包装和装柜重量未确认，当前不能进入正式报价。</dd>
        <dt>客户需求</dt>
        <dd>${escapeHtml(selected.customerNeed)}</dd>
        <dt>供应商状态</dt>
        <dd>${escapeHtml(selected.supplierStatus)}</dd>
        <dt>风险点</dt>
        <dd><span class="quote-risk quote-risk-${escapeHtml(selected.riskTone)}">风险 ${escapeHtml(selected.risk)}</span></dd>
        <dt>缺失资料</dt>
        <dd>${renderChipList(selected.missingInfo, "quote-chip")}</dd>
        <dt>AI 建议</dt>
        <dd>${escapeHtml(selected.aiSuggestion)}</dd>
        <dt>人工下一步</dt>
        <dd>${escapeHtml(selected.humanNextStep)}</dd>
        <dt>报价边界</dt>
        <dd>本页只做报价前检查，不生成价格、不计算报价、不生成 PI、合同或订单。</dd>
      </dl>
      <div class="quote-review-group">
        <h4>禁用能力</h4>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities([...selected.disabledCapabilities, "不可计算价格", "不可生成合同", "不可下单 / 收款 / 发货"])}
        </div>
      </div>
      <div class="quote-review-group">
        <h4>安全边界</h4>
        <p>静态预览数据。所有价格、报价、PI、合同、订单、赔付和交期承诺必须人工复核。</p>
      </div>
    </div>
  `;
}

function renderOrders() {
  return renderCommercialWorkflowSection("orders");
}

function renderOrderReview() {
  return renderCommercialWorkflowReview("orders");
}

function renderProduction() {
  return renderCommercialWorkflowSection("production");
}

function renderProductionReview() {
  return renderCommercialWorkflowReview("production");
}

function renderShipping() {
  return renderCommercialWorkflowSection("shipping");
}

function renderShippingReview() {
  return renderCommercialWorkflowReview("shipping");
}

function renderAfterSales() {
  return renderCommercialWorkflowSection("after-sales");
}

function renderAfterSalesReview() {
  return renderCommercialWorkflowReview("after-sales");
}

function renderSettings() {
  return renderCommercialWorkflowSection("settings");
}

function renderSettingsReview() {
  return renderCommercialWorkflowReview("settings");
}

function renderCommercialWorkflowSection(sectionId) {
  const config = commercialWorkflowSections[sectionId];
  return `
    <div class="commercial-workflow-preview" aria-label="${escapeHtml(config.title)}静态工作流预览">
      <div class="commercial-workflow-header">
        <div>
          <span class="state-label">${escapeHtml(config.title)}</span>
          <h3>${escapeHtml(config.title)}</h3>
          <p>${escapeHtml(config.subtitle)}</p>
          <p class="commercial-safety-note">静态预览数据，仅用于界面验证；所有价格、报价、PI、合同、订单、付款、生产、发货和赔付承诺必须人工复核。</p>
        </div>
        <div class="commercial-workflow-badges">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("人工复核", "approval")}
          ${badge("不自动执行", "pending")}
        </div>
      </div>

      <section class="commercial-workflow-section" aria-label="${escapeHtml(config.summaryTitle)}">
        <div class="workbench-section-header">
          <div>
            <span>${escapeHtml(config.summaryLabel)}</span>
            <h3>${escapeHtml(config.summaryTitle)}</h3>
          </div>
          <p>${escapeHtml(config.queueHint)}</p>
        </div>
        <div class="commercial-summary-grid">
          ${renderSummaryCards(config.summaryCards, renderCommercialSummaryCard)}
        </div>
      </section>

      <section class="commercial-workflow-section" aria-label="${escapeHtml(config.queueTitle)}">
        <div class="workbench-section-header">
          <div>
            <span>${escapeHtml(config.queueLabel)}</span>
            <h3>${escapeHtml(config.queueTitle)}</h3>
          </div>
          <p>队列仅展示人工复核建议和禁用能力，不触发真实业务动作。</p>
        </div>
        <div class="commercial-review-queue">
          ${config.queueItems.map(renderCommercialQueueItem).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCommercialSummaryCard(card) {
  return `
    <article class="commercial-summary-card commercial-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderCommercialQueueItem(item) {
  const missingInfoHtml = renderChipList(item.missingInfo, "commercial-chip");
  const disabledHtml = renderDisabledCapabilities(item.disabled);

  return `
    <article class="commercial-review-queue-item">
      <div class="commercial-review-queue-main">
        <div class="commercial-review-queue-title">
          <span class="workbench-category">${escapeHtml(item.status)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        <div class="commercial-review-queue-meta">
          <span class="commercial-risk commercial-risk-${escapeHtml(item.riskTone)}">风险 ${escapeHtml(item.risk)}</span>
          <span class="commercial-status">${escapeHtml(item.status)}</span>
        </div>
      </div>
      <p><strong>复核内容：</strong>${escapeHtml(item.detail)}</p>
      <p><strong>人工下一步：</strong>${escapeHtml(item.nextStep)}</p>
      <div class="commercial-row-group">
        <span>缺失资料 / 待核实</span>
        <div class="commercial-chip-row">${missingInfoHtml}</div>
      </div>
      <div class="commercial-row-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${disabledHtml}</div>
      </div>
    </article>
  `;
}

function renderCommercialWorkflowReview(sectionId) {
  const config = commercialWorkflowSections[sectionId];
  const selected = config.queueItems[0];
  return `
    <div class="review-card commercial-review-card" aria-label="${escapeHtml(config.reviewTitle)}">
      <div class="commercial-review-heading">
        <div>
          <span class="state-label">${escapeHtml(config.reviewTitle)}</span>
          <h3>${escapeHtml(config.reviewTitle)}</h3>
          <p>${escapeHtml(config.fixedExample)}</p>
        </div>
        <div class="commercial-review-meta">
          ${badge("静态预览", "draft")}
          ${badge("只读", "active")}
          ${badge("不自动执行", "pending")}
        </div>
      </div>
      <dl>
        ${config.reviewRows.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
        <dt>人工下一步</dt>
        <dd>${escapeHtml(selected.nextStep)}</dd>
      </dl>
      <div class="commercial-review-group">
        <h4>禁用能力</h4>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(config.disabled)}
        </div>
      </div>
      <div class="commercial-review-group">
        <h4>安全说明</h4>
        <p>本页只做静态只读预览，不调用 API、不写入数据、不执行审批、发送、订单、付款、生产或发货。</p>
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
