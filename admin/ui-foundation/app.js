import { getAdminAccessToken } from "../../lib/admin-auth.js";

const navItems = [
  { id: "ai-command-center", label: "AI 指挥台" },
  { id: "dashboard", label: "工作台" },
  { id: "prospecting", label: "AI 开发客户" },
  { id: "customer-verification", label: "AI 客户验证" },
  { id: "followup-assistant", label: "AI 跟进助手" },
  { id: "business-card-capture", label: "AI 名片识别" },
  { id: "knowledge-center", label: "AI 知识库" },
  { id: "inquiries", label: "询盘" },
  { id: "inquiry-intelligence", label: "AI 询盘智能分析" },
  { id: "customers", label: "客户" },
  { id: "companies", label: "客户公司" },
  { id: "suppliers", label: "供应商" },
  { id: "products", label: "产品" },
  { id: "manufacturing-capabilities", label: "制造能力" },
  { id: "ai-drafts", label: "AI 复核" },
  { id: "files", label: "文件" },
  { id: "quotations", label: "报价前复核" },
  { id: "orders", label: "订单" },
  { id: "production", label: "生产" },
  { id: "shipping", label: "发货" },
  { id: "after-sales", label: "售后" },
  { id: "settings", label: "设置" },
];

const sections = {
  "ai-command-center": {
    title: "AI 指挥台",
    description: "未来系统主入口静态预览：AI 理解任务、查找上下文、规划流程、准备草稿，并等待人工确认。",
    sectionTitle: "AI 指挥台",
    sectionHelp: "静态只读预览。当前不调用 AI、不执行工作流、不发送、不生成报价或 PI、不写入数据。",
    content: renderAiCommandCenter,
    review: renderAiCommandCenterReview,
  },
  dashboard: {
    title: "AI 今日工作台",
    description: "AI-first 今日工作台静态预览：帮助判断今天最值得处理的外贸任务，但不自动执行任何动作。",
    sectionTitle: "AI 今日工作台",
    sectionHelp: "只读首页预览。AI 只提供优先级、风险和下一步建议；发送、报价、创建客户和业务执行均需人工确认。",
    content: renderDashboard,
    review: renderDashboardReview,
  },
  prospecting: {
    title: "AI 开发客户",
    description: "基于目标市场或样本客户发现相似潜在客户；当前为静态只读预览，不搜索、不抓取、不发送。",
    sectionTitle: "AI 开发客户",
    sectionHelp: "AI Prospecting 静态预览。当前不调用搜索 API、不解析文件、不创建客户、不外发消息。",
    content: renderProspecting,
    review: renderProspectingReview,
  },
  "customer-verification": {
    title: "AI 客户验证中心",
    description: "正式跟进前的客户身份、公司资料、联系信息、重复风险和跟进价值静态复核预览。",
    sectionTitle: "AI 客户验证",
    sectionHelp: "只读预览。当前不联网、不自动查询、不调用 AI、不创建客户、不修改客户资料、不发送消息。",
    content: renderCustomerVerification,
    review: renderCustomerVerificationReview,
  },
  "followup-assistant": {
    title: "AI 跟进助手",
    description: "根据客户验证、询盘状态、报价阶段和缺失信息，辅助判断下一步跟进动作；当前仅为静态只读预览。",
    sectionTitle: "AI 跟进助手",
    sectionHelp: "只读预览。当前不自动创建任务、不自动发送消息、不修改客户或询盘状态。",
    content: renderFollowupAssistant,
    review: renderFollowupAssistantReview,
  },
  "business-card-capture": {
    title: "AI 名片识别",
    description: "上传或拍摄客户名片、展会卡片、WhatsApp 联系人图片后的字段提取与客户草稿静态预览。",
    sectionTitle: "AI 名片识别",
    sectionHelp: "静态只读预览。当前不上传文件、不执行 OCR、不调用 AI、不创建客户、不发送跟进消息。",
    content: renderBusinessCardCapture,
    review: renderBusinessCardCaptureReview,
  },
  "knowledge-center": {
    title: "AI 知识库",
    description: "企业知识库只读数据预览，优先展示 admin-read 数据，失败时显示安全 fallback。",
    sectionTitle: "AI 知识库",
    sectionHelp: "AI Knowledge Center 只读预览。当前不上传文件、不解析文档、不执行 RAG、不生成 AI 答案。",
    content: renderKnowledgeCenter,
    review: renderKnowledgeCenterReview,
  },
  companies: {
    title: "公司",
    description: "内部试用的公司只读列表，用于核对客户公司资料和来源。",
    sectionTitle: "公司管理",
    sectionHelp: "只读 API 列表。当前不创建、不更新、不删除，也不导出公司数据。",
    content: renderCompanies,
    review: renderCompanyReview,
  },
  customers: {
    title: "客户",
    description: "客户信息只读预览，用于查看客户资料、跟进线索和风险提示。",
    sectionTitle: "客户管理",
    sectionHelp: "只读 admin-read 列表。当前不创建、不编辑、不导入、不导出客户资料。",
    content: renderCustomers,
    review: renderCustomerReview,
  },
  inquiries: {
    title: "询盘",
    description: "询盘只读复核中心，用于查看客户需求、缺失信息和人工下一步。",
    sectionTitle: "询盘中心",
    sectionHelp: "只读 admin-read 列表。当前不创建询盘、不外发消息、不自动报价。",
    content: renderInquiries,
    review: renderInquiryReview,
  },
  "inquiry-intelligence": {
    title: "AI 询盘智能分析",
    description: "把客户询盘拆解为产品类别、缺失信息、报价准备度、供应商确认点、风险和草稿回复；当前为静态只读预览。",
    sectionTitle: "AI 询盘智能分析",
    sectionHelp: "静态只读预览。当前不调用 AI、不解析文件、不联系供应商、不创建 RFQ、不报价、不发送消息。",
    content: renderInquiryIntelligence,
    review: renderInquiryIntelligenceReview,
  },
  suppliers: {
    title: "供应商",
    description: "供应商与能力信息仅供内部参考，用于核对状态和待确认事项。",
    sectionTitle: "供应商中心",
    sectionHelp: "静态只读预览。当前不发送 RFQ，不确认报价、交期或供应商承诺。",
    content: renderSuppliers,
    review: renderSupplierReview,
  },
  products: {
    title: "产品",
    description: "产品资料只读列表，用于核对业务线、分类、材质和表面处理信息。",
    sectionTitle: "产品管理",
    sectionHelp: "只读 API 列表。当前不支持创建、更新或删除。",
    content: renderProducts,
    review: renderProductReview,
  },
  "manufacturing-capabilities": {
    title: "制造能力",
    description: "制造能力只读参考，用于匹配方向判断，不代表供应商已确认可生产。",
    sectionTitle: "制造能力",
    sectionHelp: "只读 admin-read 列表。当前不确认产能、价格、交期、包装或质量责任。",
    content: renderManufacturingCapabilities,
    review: renderManufacturingCapabilityReview,
  },
  "ai-drafts": {
    title: "AI 复核中心",
    description: "AI 输出只作为复核材料，必须人工确认后才可进入任何后续流程。",
    sectionTitle: "AI 复核中心",
    sectionHelp: "只读复核预览。AI 不自动发送、不审批、不应用建议、不生成报价或 PI。",
    content: renderAiDrafts,
    review: renderAiDraftReview,
  },
  files: {
    title: "文件中心",
    description: "文件中心仅展示安全元数据，用于查看附件、图纸、单据和缺失资料。",
    sectionTitle: "文件中心",
    sectionHelp: "只读元数据预览。当前不上传、不下载、不删除、不解析、不 OCR。",
    content: renderFiles,
    review: renderFileReview,
  },
  quotations: {
    title: "报价前复核（只读）",
    description: "当前仅检查询盘是否具备人工报价条件；正式报价模块稍后开放。",
    sectionTitle: "报价前复核（只读）",
    sectionHelp: "只读 admin-read 复核列表。当前不计算价格、不生成报价单、不生成 PI、合同或订单，也不发送客户。",
    content: renderQuotations,
    review: renderQuotationReview,
  },
  orders: {
    title: "订单中心",
    description: "未来订单模块静态流程占位，仅供内部流程评审，不代表真实订单状态。",
    sectionTitle: "订单中心",
    sectionHelp: "当前仅为流程占位，稍后开放；不确认订单、不生成合同、不确认收款或下达生产。",
    content: renderOrders,
    review: renderOrderReview,
  },
  production: {
    title: "生产中心",
    description: "未来生产模块静态流程占位，仅供内部流程评审，不代表真实生产状态。",
    sectionTitle: "生产中心",
    sectionHelp: "当前仅为流程占位，稍后开放；不下达生产、不确认交期、包装或质量责任。",
    content: renderProduction,
    review: renderProductionReview,
  },
  shipping: {
    title: "发货中心",
    description: "未来发货模块静态流程占位，仅供内部流程评审，不代表真实发货状态。",
    sectionTitle: "发货中心",
    sectionHelp: "当前仅为流程占位，稍后开放；不确认发货、不生成装箱单、不通知客户。",
    content: renderShipping,
    review: renderShippingReview,
  },
  "after-sales": {
    title: "售后中心",
    description: "未来售后模块静态流程占位，仅供内部流程评审，不代表真实售后结论。",
    sectionTitle: "售后中心",
    sectionHelp: "当前仅为流程占位，稍后开放；不承认责任、不承诺赔付、不发送最终结论。",
    content: renderAfterSales,
    review: renderAfterSalesReview,
  },
  settings: {
    title: "设置",
    description: "设置页仅展示未来配置入口和安全边界，不连接账号、不保存配置。",
    sectionTitle: "设置",
    sectionHelp: "当前仅为配置占位，稍后开放；不连接账号、不调用 AI、不修改权限。",
    content: renderSettings,
    review: renderSettingsReview,
  },
};

const comingSoonContent = {
  title: "稍后开放",
  description: "该模块保留给后续阶段，当前仅显示只读占位信息。",
  sectionTitle: "模块占位",
  sectionHelp: "当前未实现真实业务流程，不执行写入或外发动作。",
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

const fallbackLabel = "静态预览（安全示例，非实时数据）";
const apiUnavailableMessage =
  "实时只读数据暂不可用，可能是尚未登录、接口未部署或当前为本地预览。";
const DASHBOARD_SUMMARY_ENDPOINT = "/api/admin-read/dashboard-summary";
const CUSTOMERS_ENDPOINT = "/api/admin-read/customers";
const INQUIRIES_ENDPOINT = "/api/admin-read/inquiries";
const AI_REVIEW_ENDPOINT = "/api/admin-read/ai-review";
const SUPPLIER_CAPABILITIES_ENDPOINT = "/api/admin-read/supplier-capabilities";
const DOCUMENTS_ENDPOINT = "/api/admin-read/documents";
const PRE_QUOTATION_REVIEW_ENDPOINT = "/api/admin-read/pre-quotation-review";
const QUOTATIONS_ENDPOINT = "/api/admin-read/quotations";
const KNOWLEDGE_SUMMARY_ENDPOINT = "/api/admin-read/knowledge-summary";
const KNOWLEDGE_CATEGORIES_ENDPOINT = "/api/admin-read/knowledge-categories";
const KNOWLEDGE_ITEMS_ENDPOINT = "/api/admin-read/knowledge-items";
const KNOWLEDGE_REVIEW_QUEUE_ENDPOINT = "/api/admin-read/knowledge-review-queue";
const KNOWLEDGE_LINKED_CONTEXT_ENDPOINT = "/api/admin-read/knowledge-linked-context";
const BUSINESS_CARD_SUMMARY_ENDPOINT = "/api/admin-read/business-card-summary";
const BUSINESS_CARD_CAPTURE_SOURCES_ENDPOINT = "/api/admin-read/business-card-capture-sources";
const BUSINESS_CARD_EXTRACTION_RESULTS_ENDPOINT = "/api/admin-read/business-card-extraction-results";
const CUSTOMER_PROFILE_DRAFTS_ENDPOINT = "/api/admin-read/customer-profile-drafts";
const BUSINESS_CARD_REVIEW_QUEUE_ENDPOINT = "/api/admin-read/business-card-review-queue";
const BUSINESS_CARD_DUPLICATE_CHECKS_ENDPOINT = "/api/admin-read/business-card-duplicate-checks";
const BUSINESS_CARD_FOLLOWUP_DRAFTS_ENDPOINT = "/api/admin-read/business-card-followup-drafts";
const CUSTOMER_VERIFICATION_SUMMARY_ENDPOINT = "/api/admin-read/customer-verification-summary";
const CUSTOMER_VERIFICATION_REQUESTS_ENDPOINT = "/api/admin-read/customer-verification-requests";
const CUSTOMER_VERIFICATION_EVIDENCE_ENDPOINT = "/api/admin-read/customer-verification-evidence";
const CUSTOMER_VERIFICATION_SCORES_ENDPOINT = "/api/admin-read/customer-verification-scores";
const CUSTOMER_VERIFICATION_DUPLICATE_MATCHES_ENDPOINT = "/api/admin-read/customer-verification-duplicate-matches";
const CUSTOMER_VERIFICATION_REVIEW_QUEUE_ENDPOINT = "/api/admin-read/customer-verification-review-queue";
const CUSTOMER_VERIFICATION_REVIEWS_ENDPOINT = "/api/admin-read/customer-verification-reviews";
const FOLLOWUP_SUMMARY_ENDPOINT = "/api/admin-read/followup-summary";
const FOLLOWUP_CANDIDATES_ENDPOINT = "/api/admin-read/followup-candidates";
const FOLLOWUP_MISSING_INFORMATION_ENDPOINT = "/api/admin-read/followup-missing-information";
const FOLLOWUP_RECOMMENDATIONS_ENDPOINT = "/api/admin-read/followup-recommendations";
const FOLLOWUP_MESSAGE_DRAFTS_ENDPOINT = "/api/admin-read/followup-message-drafts";
const FOLLOWUP_REVIEW_QUEUE_ENDPOINT = "/api/admin-read/followup-review-queue";
const FOLLOWUP_REVIEWS_ENDPOINT = "/api/admin-read/followup-reviews";
const INQUIRY_INTELLIGENCE_SUMMARY_ENDPOINT = "/api/admin-read/inquiry-intelligence-summary";
const INQUIRY_INTELLIGENCE_REQUESTS_ENDPOINT = "/api/admin-read/inquiry-intelligence-requests";
const INQUIRY_PRODUCT_CLASSIFICATIONS_ENDPOINT = "/api/admin-read/inquiry-product-classifications";
const INQUIRY_MISSING_INFORMATION_ENDPOINT = "/api/admin-read/inquiry-missing-information";
const INQUIRY_QUOTATION_READINESS_ENDPOINT = "/api/admin-read/inquiry-quotation-readiness";
const INQUIRY_SUPPLIER_RFQ_REQUIREMENTS_ENDPOINT = "/api/admin-read/inquiry-supplier-rfq-requirements";
const INQUIRY_REPLY_DRAFTS_ENDPOINT = "/api/admin-read/inquiry-reply-drafts";
const INQUIRY_INTELLIGENCE_REVIEW_QUEUE_ENDPOINT = "/api/admin-read/inquiry-intelligence-review-queue";
const INQUIRY_INTELLIGENCE_REVIEWS_ENDPOINT = "/api/admin-read/inquiry-intelligence-reviews";

const dashboardSummaryApiState = createDashboardSummaryState();
const knowledgeApiState = createKnowledgeState();
const businessCardApiState = createBusinessCardCaptureState();
const customerVerificationApiState = createCustomerVerificationState();
const followupAssistantApiState = createFollowupAssistantState();
const inquiryIntelligenceApiState = createInquiryIntelligenceState();

const companyPreviewFallback = [
  {
    company_name: "Panama Facade Contractor Demo",
    country: "Panama",
    business_type: "Construction contractor",
    notes: `${fallbackLabel}. 门窗、幕墙和玻璃配置待人工复核。`,
  },
  {
    company_name: "Peru Building Materials Importer Demo",
    country: "Peru",
    business_type: "Distributor / importer",
    notes: `${fallbackLabel}. 轻钢龙骨、drywall profiles 和装柜资料待确认。`,
  },
  {
    company_name: "Indonesia Ceiling System Buyer Demo",
    country: "Indonesia",
    business_type: "Factory project buyer",
    notes: `${fallbackLabel}. 吊顶系统材料表、板材选项和供应商交期待人工确认。`,
  },
];

const companyApiState = createReadOnlyState("companies");

const customerPreviewFallback = [
  {
    name: "Panama facade project contact",
    aliases: "Panama Facade Contractor Demo",
    country: "Panama",
    language: "English",
    email: "trial.panama@example.com",
    whatsapp: "+000000000",
    source: "internal trial demo",
    stage: "信息待补充",
    business_line: "A_ARCHITECTURAL",
    last_contact_at: "2026-06-18",
    next_follow_up_at: "2026-06-21",
    notes: `${fallbackLabel}. construction contractor；关注铝合金门窗、玻璃和幕墙材料，需补充玻璃配置、开启方向、五金品牌和目的港。`,
  },
  {
    name: "Peru drywall distributor contact",
    aliases: "Peru Building Materials Importer Demo",
    country: "Peru",
    language: "English",
    email: "trial.peru@example.com",
    whatsapp: "",
    source: "internal trial demo",
    stage: "待人工复核",
    business_line: "A_ARCHITECTURAL",
    last_contact_at: "2026-06-17",
    next_follow_up_at: "2026-06-22",
    notes: `${fallbackLabel}. distributor/importer；最近询盘为 20GP 轻钢龙骨，需确认厚度、锌层、包装和 FOB 范围。`,
  },
  {
    name: "Indonesia factory project buyer",
    aliases: "Indonesia Ceiling System Buyer Demo",
    country: "Indonesia",
    language: "English",
    email: "trial.indonesia@example.com",
    whatsapp: "",
    source: "internal trial demo",
    stage: "供应商待确认",
    business_line: "A_ARCHITECTURAL",
    last_contact_at: "2026-06-16",
    next_follow_up_at: "2026-06-23",
    notes: `${fallbackLabel}. factory project buyer；关注吊顶系统和铝天花，需人工核对图纸、板材选项和供应商交期。`,
  },
];

const customerApiState = createReadOnlyState("customers");

const inquiryPreviewFallback = [
  {
    inquiry_type: "website inquiry",
    title: "Panama facade / aluminum window-door inquiry",
    lead_info: { name: "Panama facade contact", company: "Panama Facade Contractor Demo" },
    business_line: "A_ARCHITECTURAL",
    product_category: "Aluminum windows / doors / curtain wall",
    status: "信息待补充",
    original_message: `${fallbackLabel}. 客户需要铝合金门窗和幕墙材料，当前仅作为内部试用询盘示例。`,
    ai_summary: "客户需要门窗/幕墙材料；玻璃配置、开启方向、五金品牌和交货港口仍需补充。",
    missing_info: ["glass spec", "opening direction", "hardware brand", "delivery port"],
    next_follow_up_at: "2026-06-21",
    created_at: "2026-06-20 demo",
  },
  {
    inquiry_type: "container inquiry",
    title: "Peru drywall profile / light steel keel 20GP inquiry",
    lead_info: { name: "Peru drywall distributor", company: "Peru Building Materials Importer Demo" },
    business_line: "A_ARCHITECTURAL",
    product_category: "Light steel keel / drywall profiles",
    status: "待人工复核",
    original_message: `${fallbackLabel}. 客户询问 20GP 轻钢龙骨和 drywall profiles，当前仅用于试用数据展示。`,
    ai_summary: "20GP/FCL 询盘需要确认最终厚度、锌层、包装方式、装柜重量以及税费/FOB 范围。",
    missing_info: ["final thickness", "zinc coating", "packing", "tax/FOB scope"],
    next_follow_up_at: "2026-06-22",
    created_at: "2026-06-20 demo",
  },
  {
    inquiry_type: "project inquiry",
    title: "Indonesia factory ceiling system inquiry",
    lead_info: { name: "Indonesia factory buyer", company: "Indonesia Ceiling System Buyer Demo" },
    business_line: "A_ARCHITECTURAL",
    product_category: "Ceiling system / aluminum panel",
    status: "信息待补充",
    original_message: `${fallbackLabel}. 客户询问工厂吊顶系统和铝天花，当前仅用于内部试用复核。`,
    ai_summary: "工厂吊顶系统需要确认最终面板选项、图纸版本、安装损耗和供应商交期。",
    missing_info: ["final panel option", "drawing confirmation", "installation wastage", "supplier lead time"],
    next_follow_up_at: "2026-06-23",
    created_at: "2026-06-20 demo",
  },
];

const inquiryApiState = createReadOnlyState("inquiries");

const productPreviewFallback = [
  {
    name_en: "Aluminum Window And Door System",
    business_line: "A_ARCHITECTURAL",
    category: "Windows & Doors",
    product_family: "Architectural systems",
    material: "6063-T5 aluminum",
    surface: "Powder coated",
    notes: `${fallbackLabel}. 需按项目图纸、玻璃配置、五金和表面处理人工复核。`,
  },
  {
    name_en: "Light Steel Keel / Drywall Profile",
    business_line: "A_ARCHITECTURAL",
    category: "Drywall profiles",
    product_family: "Ceiling and partition systems",
    material: "Galvanized steel",
    surface: "Zinc coating to be confirmed",
    notes: `${fallbackLabel}. 厚度、锌层、包装、装柜重量和贸易条款待人工确认。`,
  },
  {
    name_en: "Aluminum Ceiling Panel System",
    business_line: "A_ARCHITECTURAL",
    category: "Ceiling system",
    product_family: "Ceiling panels and suspension system",
    material: "Aluminum / metal panel",
    surface: "Powder coated / option pending",
    notes: `${fallbackLabel}. 图纸、板材选项、安装损耗、包装和供应商交期待复核。`,
  },
];

const productApiState = createReadOnlyState("products");

const capabilityPreviewFallback = [
  {
    capability_line: "A_ARCHITECTURAL",
    equipment: "Aluminum profile extrusion / powder coating",
    quantity: 2,
    max_length: "Powder coating length to be confirmed",
    monthly_capacity: "Supplier confirmation required",
    public_description: `${fallbackLabel}. 适用于门窗、幕墙和铝型材项目方向判断。`,
    internal_notes: "静态示例；不代表供应商已确认产能、价格或交期。",
  },
  {
    capability_line: "A_ARCHITECTURAL",
    equipment: "Glass processing / IGU / laminated glass",
    quantity: 1,
    max_length: "Project drawing required",
    monthly_capacity: "Supplier confirmation required",
    public_description: `${fallbackLabel}. 适用于门窗和幕墙玻璃配置复核。`,
    internal_notes: "静态示例；玻璃规格、厚度、认证和包装均需人工确认。",
  },
  {
    capability_line: "A_ARCHITECTURAL",
    equipment: "Ceiling panel fabrication",
    quantity: 3,
    max_length: "Panel option pending",
    monthly_capacity: "Supplier confirmation required",
    public_description: `${fallbackLabel}. 适用于铝天花、金属吊顶和配套龙骨系统复核。`,
    internal_notes: "静态示例；材料表、安装损耗、包装和交期均需复核。",
  },
  {
    capability_line: "A_ARCHITECTURAL",
    equipment: "Light steel keel roll forming",
    quantity: 4,
    max_length: "Container loading plan required",
    monthly_capacity: "Supplier confirmation required",
    public_description: `${fallbackLabel}. 适用于 drywall profiles、U channel 和 Omega profile。`,
    internal_notes: "静态示例；厚度、锌层、包装、装柜重量和报价有效期待确认。",
  },
];

const capabilityApiState = createReadOnlyState("capabilities");

const aiDraftPreviewFallback = [
  {
    detected_business_line: "A_ARCHITECTURAL",
    extracted_requirements: { product: "aluminum window-door / facade package", destination_port: "Balboa" },
    missing_information: ["glass specification", "opening direction", "hardware brand", "delivery port"],
    risk_flags: ["仅供人工复核", "需要人工确认", "不自动应用"],
    suggested_reply:
      `${fallbackLabel}. 客户需求信息不足，建议补充玻璃配置、开启方向、五金品牌和目的港后，再由人工判断是否进入供应商询价。`,
    approval_required: true,
    created_at: "local preview",
  },
  {
    detected_business_line: "A_ARCHITECTURAL",
    extracted_requirements: { product: "drywall profiles / light steel keel", container: "20GP" },
    missing_information: ["final thickness", "packing", "FOB scope", "container weight"],
    risk_flags: ["仅供人工复核", "需要人工确认", "不自动应用"],
    suggested_reply:
      `${fallbackLabel}. 报价前需确认最终厚度、包装、装柜重量和贸易条款；供应商报价为内部参考，不能直接外发客户。`,
    approval_required: true,
    created_at: "local preview",
  },
  {
    detected_business_line: "A_ARCHITECTURAL",
    extracted_requirements: { product: "ceiling system / aluminum panel", project: "factory ceiling" },
    missing_information: ["panel option", "drawing confirmation", "supplier lead time", "installation wastage"],
    risk_flags: ["仅供人工复核", "需要人工确认", "不自动应用"],
    suggested_reply:
      `${fallbackLabel}. 供应商报价为出厂价参考，需人工确认税费/FOB 范围、包装、交期和材料选项后再继续。`,
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
    aiSuggestion: "仅供人工复核，不自动应用，需要人工确认：客户缺少厚度、锌层、包装和装柜重量信息，建议先补充信息再询价。",
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
    aiSuggestion: "仅供人工复核，不自动应用，需要人工确认：回复草稿涉及配置、价格和交期边界，需先确认供应商资料。",
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
    aiSuggestion: "仅供人工复核，不自动应用，需要人工确认：涉及质量责任和可能赔付，不应直接承认责任或承诺赔付。",
    humanNextStep: "收集照片、项目环境、表面处理记录和使用位置后再判断。",
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "禁止外发最终结论"],
  },
  {
    title: "印尼吊顶系统报价前复核",
    type: "报价前检查",
    risk: "中",
    riskTone: "warning",
    status: "待内部核算",
    missingInfo: ["材料表", "0.7mm 板材", "Option B", "安装损耗", "供应商报价"],
    aiSuggestion: "仅供人工复核，不自动应用，需要人工确认：材料表、0.7mm 板材、Option B、安装损耗和供应商报价仍需核实。",
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
    aiSuggestion: "仅供人工复核，不自动应用，需要人工确认：轻钢龙骨供应商与秘鲁询盘匹配，但厚度、锌层和装柜重量未确认。",
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
    aiSuggestion: "仅供人工复核，不自动应用，需要人工确认：客户需要安装指导，但当前系统资料和五金配置仍需确认。",
    humanNextStep: "整理安装手册、视频说明和系统差异说明后再发客户。",
    disabledCapabilities: ["不可自动发送资料", "不可承诺安装结果", "不可确认售后责任"],
  },
];

const fileCenterSummaryCards = [
  { label: "元数据预览", value: "12", subtitle: "仅展示文件名称、类型、关联业务和状态", tone: "info" },
  { label: "待人工核对", value: "7", subtitle: "询盘截图、图纸、规格和供应商资料", tone: "warning" },
  { label: "图纸 / 技术资料", value: "5", subtitle: "CAD、PDF、安装手册和材料表", tone: "info" },
  { label: "供应商报价资料", value: "3", subtitle: "仅做人工复核，不生成客户报价", tone: "warning" },
  { label: "风险文件", value: "2", subtitle: "质量证据、PI/合同草稿或责任相关", tone: "danger" },
  { label: "禁止文件操作", value: "9", subtitle: "上传、下载、解析、OCR 和删除均禁用", tone: "danger" },
];

const fileCenterQueueItems = [
  {
    title: "秘鲁轻钢龙骨询盘截图",
    type: "客户询盘截图",
    linkedBusiness: "秘鲁 drywall profiles 20GP 询盘",
    status: "资料不完整",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["最终厚度", "锌层", "包装方式", "税费/FOB 范围"],
    aiSuggestion: "元数据预览显示该资料只能辅助人工确认询盘背景，不能作为报价依据。",
    humanNextStep: "整理客户确认清单，补齐厚度、锌层、包装、装柜和贸易条款范围。",
    disabledCapabilities: ["不可生成报价", "不可生成 PI", "不可确认装柜"],
  },
  {
    title: "印尼吊顶系统 CAD/PDF 图纸",
    type: "CAD / PDF drawing",
    linkedBusiness: "印尼工厂吊顶系统询盘",
    status: "待供应商复核",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["最终板材选项", "图纸版本", "安装损耗", "供应商交期"],
    aiSuggestion: "元数据预览显示图纸可用于人工复核，但不能读取原文件内容或生成报价。",
    humanNextStep: "让供应商确认材料、包装、损耗和交期后再进入人工报价前复核。",
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
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "禁止外发最终结论"],
  },
  {
    title: "巴拿马门窗产品照片与规格页",
    type: "Product photo / spec sheet",
    linkedBusiness: "Panama facade / window-door inquiry",
    status: "资料缺失",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["玻璃配置", "开启方向", "五金品牌", "项目图纸"],
    aiSuggestion: "元数据预览仅说明文件类型和业务关联，不展示原图、不生成对外资料。",
    humanNextStep: "人工核对产品照片、规格页和客户图纸后，再判断是否进入供应商询价。",
    disabledCapabilities: ["不可外发客户", "不可承诺安装结果", "不可确认报价"],
  },
  {
    title: "供应商门窗型材报价表",
    type: "供应商报价",
    linkedBusiness: "Panama facade / window-door inquiry",
    status: "待人工核价",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["报价有效期", "币种", "表面处理", "包装和交期"],
    aiSuggestion: "供应商报价资料仅作为内部核对参考，需确认规格、币种、有效期和交期范围。",
    humanNextStep: "人工核对供应商报价、规格和项目需求后，再判断是否准备报价资料。",
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
  { label: "报价前复核草稿", value: "7", subtitle: "仅检查资料是否具备人工复核条件", tone: "warning" },
  { label: "信息待补充", value: "5", subtitle: "客户、规格、图纸、包装或交期资料缺失", tone: "warning" },
  { label: "供应商待确认", value: "4", subtitle: "供应商报价、有效期、包装或交期待确认", tone: "neutral" },
  { label: "文件待确认", value: "3", subtitle: "图纸、截图、规格页或报价表待人工核对", tone: "warning" },
  { label: "草稿仅供参考", value: "3", subtitle: "只支持人工整理，不计算价格", tone: "info" },
  { label: "禁止生成", value: "9", subtitle: "不计算价格、不生成报价单、不发送客户", tone: "danger" },
];

const quoteReviewQueueItems = [
  {
    title: "秘鲁 drywall profiles 20GP 报价前复核",
    status: "信息待补充",
    risk: "中",
    riskTone: "warning",
    readiness: "信息待补充",
    customerNeed: "20GP/FCL 轻钢龙骨、U channel 和 Omega profile",
    supplierStatus: "供应商待确认最终厚度、锌层、包装、装柜重量和报价有效期",
    missingInfo: ["最终厚度", "锌层", "包装方式", "税费/FOB 范围"],
    aiSuggestion: "草稿仅供参考。先补齐规格和贸易条款范围，再让供应商提供内部核对资料。",
    humanNextStep: "向客户确认规格，同时让供应商补充包装、装柜和报价有效期。",
    disabledCapabilities: ["不可计算价格", "不可生成报价单", "不可生成 PI", "禁止外发客户"],
  },
  {
    title: "印尼吊顶系统报价前复核",
    status: "文件待确认",
    risk: "中",
    riskTone: "warning",
    readiness: "文件待确认",
    customerNeed: "工厂吊顶系统，铝天花 / ceiling panel option pending",
    supplierStatus: "供应商待确认材料表、包装、安装损耗和交期范围",
    missingInfo: ["最终面板选项", "图纸版本", "安装损耗", "供应商交期"],
    aiSuggestion: "草稿仅供参考。当前只检查资料完整性，不计算价格、不确认交期。",
    humanNextStep: "完善材料表、图纸版本和供应商反馈后，再由人工决定是否进入报价准备。",
    disabledCapabilities: ["不可计算价格", "不可生成报价单", "不可生成 PI", "不可确认生产"],
  },
  {
    title: "巴拿马门窗 / 幕墙报价前复核",
    status: "供应商待确认",
    risk: "中",
    riskTone: "warning",
    readiness: "供应商待确认",
    customerNeed: "铝合金门窗、幕墙材料和玻璃配置",
    supplierStatus: "供应商待确认系统、表面处理、五金品牌、玻璃规格和包装",
    missingInfo: ["玻璃配置", "开启方向", "五金品牌", "目的港"],
    aiSuggestion: "草稿仅供参考。不能仅凭项目描述准备对外报价。",
    humanNextStep: "补齐客户图纸和规格，人工核对供应商反馈后再判断报价准备。",
    disabledCapabilities: ["不可计算价格", "不可生成报价单", "禁止外发客户"],
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
    readiness: "草稿仅供参考",
    customerNeed: "安装指导 / 技术支持",
    supplierStatus: "五金系统和安装资料待确认",
    missingInfo: ["安装手册", "五金系统确认", "视频说明"],
    aiSuggestion: "不应直接承诺安装结果或售后责任。",
    humanNextStep: "整理安装资料和系统差异说明，再判断是否涉及收费服务。",
    disabledCapabilities: ["不可生成服务报价", "不可承诺安装结果", "不可确认售后责任"],
  },
  {
    title: "加勒比建筑客户报价前复核",
    status: "待人工复核",
    risk: "中",
    riskTone: "warning",
    readiness: "需要人工确认",
    customerNeed: "门窗五金 / 建筑材料项目",
    supplierStatus: "历史报价和当前规格需要人工合并复核",
    missingInfo: ["最终规格确认", "付款节奏", "目标交期"],
    aiSuggestion: "草稿仅供参考，必须人工确认最终规格、价格和交期边界。",
    humanNextStep: "整理报价资料，人工复核后再决定是否进入正式流程。",
    disabledCapabilities: ["不可自动发送", "不可自动生成 PI", "不可确认订单"],
  },
];

const quotationMetadataFallback = [
  {
    quote_no: "QT-DEMO-001",
    inquiry_id: "Panama facade inquiry",
    customer_name: "Panama facade contractor demo",
    quote_status: "草稿仅供内部查看",
    currency: "USD",
    total_amount: "金额暂不展示",
    item_count: "明细暂不展示",
    human_review_required: true,
    safety_status: "静态预览 fallback",
    created_at: "2026-06-20",
    updated_at: "2026-06-20",
  },
  {
    quote_no: "QT-DEMO-002",
    inquiry_id: "Peru drywall profile inquiry",
    customer_name: "Peru building materials importer demo",
    quote_status: "待人工复核",
    currency: "USD",
    total_amount: "金额暂不展示",
    item_count: "明细暂不展示",
    human_review_required: true,
    safety_status: "静态预览 fallback",
    created_at: "2026-06-20",
    updated_at: "2026-06-20",
  },
  {
    quote_no: "QT-DEMO-003",
    inquiry_id: "Indonesia ceiling system inquiry",
    customer_name: "Indonesia factory project demo",
    quote_status: "信息待补充",
    currency: "USD",
    total_amount: "金额暂不展示",
    item_count: "明细暂不展示",
    human_review_required: true,
    safety_status: "静态预览 fallback",
    created_at: "2026-06-20",
    updated_at: "2026-06-20",
  },
];

const commercialWorkflowSections = {
  orders: {
    title: "订单中心",
    subtitle: "当前仅为流程占位，用于查看未来订单准备状态和人工确认边界。",
    summaryLabel: "ORDER REVIEW SUMMARY",
    summaryTitle: "订单准备概览",
    queueLabel: "ORDER REVIEW QUEUE",
    queueTitle: "订单复核队列",
    queueHint: "所有订单状态均为静态示例，不代表真实订单状态；真实订单流程稍后开放。",
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
    subtitle: "当前仅为流程占位，用于查看未来生产准备、供应商确认和交期风险。",
    summaryLabel: "PRODUCTION REVIEW SUMMARY",
    summaryTitle: "生产准备概览",
    queueLabel: "PRODUCTION REVIEW QUEUE",
    queueTitle: "生产复核队列",
    queueHint: "仅展示生产准备占位状态，不代表真实生产；不下达生产、不确认交期。",
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
      { label: "禁止业务执行", value: "8", subtitle: "生产下单和采购均禁用", tone: "danger" },
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
    subtitle: "当前仅为流程占位，用于查看未来装柜、物流资料和发货风险。",
    summaryLabel: "SHIPPING REVIEW SUMMARY",
    summaryTitle: "发货准备概览",
    queueLabel: "SHIPPING REVIEW QUEUE",
    queueTitle: "发货复核队列",
    queueHint: "仅展示发货准备占位状态，不代表真实发货；不确认物流、不生成装箱单。",
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
    subtitle: "当前仅为流程占位，用于查看未来客户反馈、质量证据和责任边界。",
    summaryLabel: "AFTER-SALES REVIEW SUMMARY",
    summaryTitle: "售后处理概览",
    queueLabel: "AFTER-SALES REVIEW QUEUE",
    queueTitle: "售后复核队列",
    queueHint: "仅展示售后处理占位建议，不代表真实售后结论；不承认责任、不承诺赔付。",
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
      { title: "PD/PT 门安装支持反馈", status: "技术资料缺失", risk: "中", riskTone: "warning", detail: "客户需要安装支持，系统差异和五金资料未确认。", missingInfo: ["安装手册", "五金配置", "视频说明"], nextStep: "整理资料并人工确认内部参考版本。", disabled: ["不可承诺安装结果", "不可确认售后责任", "不可自动发送"] },
      { title: "吊顶系统安装疑问", status: "待技术复核", risk: "中", riskTone: "warning", detail: "安装疑问涉及材料表和施工损耗。", missingInfo: ["施工现场信息", "材料表", "安装照片"], nextStep: "由技术人员复核后再回复客户。", disabled: ["不可确认安装责任", "不可承诺补偿", "不可发送最终结论"] },
      { title: "高尔夫球车配置争议", status: "待供应商确认", risk: "中", riskTone: "warning", detail: "配置争议需要供应商核对订单和出货资料。", missingInfo: ["配置表", "出货照片", "供应商反馈"], nextStep: "核对供应商资料后再判断处理方案。", disabled: ["不可承认责任", "不可承诺赔付", "不可确认补货"] },
      { title: "门窗五金售后反馈", status: "证据不足", risk: "中", riskTone: "warning", detail: "客户反馈五金问题，但缺少安装位置和使用情况。", missingInfo: ["安装位置", "使用照片", "数量"], nextStep: "请客户补充照片和数量后人工复核。", disabled: ["不可确认责任", "不可补发配件", "不可承诺赔付"] },
    ],
  },
  settings: {
    title: "设置",
    subtitle: "当前仅为配置占位，用于查看系统边界、账号状态和未来集成入口。",
    summaryLabel: "SETTINGS BOUNDARY SUMMARY",
    summaryTitle: "系统边界概览",
    queueLabel: "SETTINGS PLACEHOLDERS",
    queueTitle: "设置预留入口",
    queueHint: "仅展示未来配置入口，稍后开放；不连接账号、不调用服务。",
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
    label: "今日待复核询盘",
    value: "6",
    subtitle: "门窗、轻钢龙骨和吊顶项目待人工查看",
    tone: "info",
  },
  {
    label: "缺少报价信息",
    value: "5",
    subtitle: "规格、图纸、包装或交货港口不完整",
    tone: "warning",
  },
  {
    label: "供应商待确认",
    value: "4",
    subtitle: "能力、报价有效期、包装和交期待人工核实",
    tone: "warning",
  },
  {
    label: "文件待人工核对",
    value: "6",
    subtitle: "询盘截图、CAD/PDF、规格页和供应商报价表",
    tone: "info",
  },
  {
    label: "高风险提醒",
    value: "2",
    subtitle: "涉及价格、付款、交期或质量责任",
    tone: "danger",
  },
  {
    label: "报价前复核草稿",
    value: "3",
    subtitle: "只做资料检查，不计算价格、不发送客户",
    tone: "neutral",
  },
];

const workbenchQueueItems = [
  {
    title: "巴拿马门窗/幕墙询盘：玻璃与五金信息缺失",
    category: "询盘",
    priority: "P1",
    meta: "客户规格待补齐",
    badges: ["信息待补充", "需要复核"],
    recommendedAction: "补充玻璃配置、开启方向、五金品牌和目的港后，再判断是否询价",
    disabledCapabilities: ["禁止外发客户", "不可计算价格", "不可生成 PI"],
  },
  {
    title: "秘鲁 drywall profiles：20GP 装柜与包装待确认",
    category: "询盘",
    priority: "P1",
    meta: "轻钢龙骨 / drywall",
    badges: ["缺少报价信息", "供应商待确认"],
    recommendedAction: "确认最终厚度、锌层、包装、装柜重量和税费/FOB 范围",
    disabledCapabilities: ["不可生成报价单", "不可生成 PI", "不可确认订单"],
  },
  {
    title: "AI 回复草稿：供应商报价为内部参考",
    category: "AI 草稿",
    priority: "P1",
    meta: "价格 / 交期 / 付款敏感",
    badges: ["高风险", "需要人工复核"],
    recommendedAction: "人工确认价格、交期、付款条款和供应商报价范围后再使用",
    disabledCapabilities: ["禁止外发", "不可审批"],
  },
  {
    title: "文件元数据：印尼吊顶系统 CAD/PDF 待人工查看",
    category: "文件 / 图纸",
    priority: "P2",
    meta: "元数据预览",
    badges: ["文件待确认", "图纸复核"],
    recommendedAction: "确认图纸版本、板材选项、安装损耗和供应商交期",
    disabledCapabilities: ["不可下载", "不可解析", "不可生成客户报价"],
  },
  {
    title: "客户跟进：Panama 项目需要补齐图纸包",
    category: "客户",
    priority: "P2",
    meta: "跟进节奏待判断",
    badges: ["待跟进"],
    recommendedAction: "人工决定是否向客户索取图纸、规格和目标数量",
    disabledCapabilities: ["不可自动外发", "不可创建任务"],
  },
  {
    title: "制造能力问题：轻钢龙骨供应商不得承诺交期",
    category: "制造能力",
    priority: "P1",
    meta: "产能 / 交期需核实",
    badges: ["需要复核", "不承诺交期"],
    recommendedAction: "人工核实辊压设备、厚度范围、包装和供应商反馈",
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可发货"],
  },
];

const dailyBriefingStats = [
  { label: "今日重点", value: "3 件" },
  { label: "高风险", value: "1 条" },
  { label: "待跟进", value: "2 个客户" },
  { label: "待验证知识", value: "4 条" },
];

const dailyPriorityCards = [
  {
    title: "待处理询盘",
    count: "3",
    reason: "缺少规格、图纸或目标数量，暂不能进入报价判断。",
    suggestion: "AI 建议：先整理缺失信息清单，再由 Paul 决定是否向客户澄清。",
    source: "询盘 / 文件",
    confidence: "中",
    risk: "缺失信息",
  },
  {
    title: "待报价客户",
    count: "2",
    reason: "客户意向较明确，但供应商价格、包装和交期仍未核实。",
    suggestion: "AI 建议：先准备报价前复核，不生成正式报价。",
    source: "报价前复核",
    confidence: "中",
    risk: "价格敏感",
  },
  {
    title: "待供应商回复",
    count: "4",
    reason: "供应商报价有效期、币种、最小起订量和交期需要人工确认。",
    suggestion: "AI 建议：整理供应商问题清单，等待人工发送。",
    source: "供应商 / 制造能力",
    confidence: "中",
    risk: "供应承诺",
  },
  {
    title: "待跟进客户",
    count: "2",
    reason: "2 个客户超过 7 天未回复，可能需要温和跟进。",
    suggestion: "AI 建议：生成温和跟进草稿，等待 Paul 确认。",
    source: "客户 / 沟通",
    confidence: "高",
    risk: "低",
  },
  {
    title: "待验证知识",
    count: "4",
    reason: "报价规则和产品说明仍需人工确认后才能作为 AI 引用依据。",
    suggestion: "AI 建议：优先验证轻钢龙骨报价规则和包装说明。",
    source: "AI 知识库",
    confidence: "中",
    risk: "知识未验证",
  },
  {
    title: "内容草稿待审核",
    count: "3",
    reason: "LinkedIn / 产品介绍内容仍是草稿，不能自动发布。",
    suggestion: "AI 建议：先审核产品事实和目标市场措辞。",
    source: "AI 开发客户 / 内容",
    confidence: "中",
    risk: "公开内容",
  },
];

const dailyOperationsMetrics = [
  { label: "客户总数", value: "128", note: "数据预览 / fallback demo", tone: "info" },
  { label: "本周新增客户", value: "6", note: "静态示例，待后续 BI 聚合", tone: "neutral" },
  { label: "本周询盘数", value: "12", note: "仅用于首页信息层级验证", tone: "info" },
  { label: "报价草稿数", value: "3", note: "草稿待审，不生成正式报价", tone: "warning" },
  { label: "报价转化率", value: "预览", note: "不展示伪造最终指标", tone: "neutral" },
  { label: "知识库待验证数", value: "4", note: "需人工确认后才能被 AI 引用", tone: "warning" },
  { label: "AI 开发客户线索", value: "5", note: "静态线索，不自动创建客户", tone: "info" },
  { label: "内容营销待审核", value: "3", note: "草稿待审，不自动发布", tone: "warning" },
];

const dailyBottlenecks = [
  { label: "询盘缺少规格", detail: "图纸、厚度、表面处理或目标数量未确认。", severity: "P1" },
  { label: "报价缺供应商价格", detail: "供应商币种、有效期和交期仍需人工核实。", severity: "P1" },
  { label: "知识库缺产品说明", detail: "轻钢龙骨和吊顶产品说明仍有未验证条目。", severity: "P2" },
  { label: "客户超过 7 天未回复", detail: "建议先准备温和跟进草稿，不自动发送。", severity: "P2" },
  { label: "内容草稿待人工审核", detail: "公开内容需要确认事实、语气和目标市场。", severity: "P2" },
];

const dailyRecommendations = [
  "处理缺规格询盘",
  "跟进 7 天未回复客户",
  "验证轻钢龙骨报价规则知识",
  "准备一条 LinkedIn 产品内容草稿",
];

const dailyFunnelSteps = [
  { label: "开发线索", value: "5", note: "静态预览" },
  { label: "有效客户", value: "3", note: "待验证" },
  { label: "询盘", value: "2", note: "待复核" },
  { label: "报价", value: "1", note: "草稿" },
  { label: "成交", value: "预览", note: "不造假" },
];

const dailyCountryDistribution = [
  { country: "USA", value: 78, label: "美国" },
  { country: "Peru", value: 62, label: "秘鲁" },
  { country: "Panama", value: 56, label: "巴拿马" },
  { country: "Indonesia", value: 46, label: "印尼" },
  { country: "Caribbean", value: 40, label: "加勒比" },
];

const aiCommandExamples = [
  "帮我处理这个秘鲁客户的轻钢龙骨询盘",
  "帮我看看这个客户能不能报价",
  "帮我找类似 Caribbean Green Construction 的客户",
  "给这个产品生成一周 LinkedIn 内容选题",
  "帮我跟进这个 7 天没回复的客户",
];

const aiCommandIntentCards = [
  {
    title: "询盘处理",
    detects: "客户、国家、产品、缺失信息和下一步复核动作",
    routesTo: "询盘 / 客户 / 知识库 / 文件",
    safeOutput: "缺失信息清单、客户澄清问题草稿",
    approval: "发送前需要人工确认",
  },
  {
    title: "报价准备",
    detects: "规格、数量、图纸、价格/交期/付款风险",
    routesTo: "报价前复核 / 询盘 / 知识库",
    safeOutput: "报价准备度、阻塞项、人工检查表",
    approval: "正式报价需要人工确认",
  },
  {
    title: "供应商匹配",
    detects: "产品工艺、数量、包装和供应能力方向",
    routesTo: "供应商 / 制造能力 / 知识库",
    safeOutput: "候选供应方向、供应商询价草稿",
    approval: "发送 RFQ 前需要人工确认",
  },
  {
    title: "客户跟进",
    detects: "未回复天数、客户阶段、跟进风险和语气",
    routesTo: "客户 / 询盘 / 历史沟通",
    safeOutput: "跟进建议、消息草稿",
    approval: "外发消息需要人工确认",
  },
  {
    title: "AI 开发客户",
    detects: "样本客户、目标市场、产品匹配和合规来源",
    routesTo: "AI 开发客户 / 知识库 / 客户",
    safeOutput: "相似客户方向、研究计划",
    approval: "开发信发送前需要人工确认",
  },
  {
    title: "内容营销",
    detects: "产品、受众、话题角度和风险词",
    routesTo: "内容营销 / 知识库 / 产品",
    safeOutput: "LinkedIn 选题和草稿方向",
    approval: "发布前需要人工确认",
  },
  {
    title: "知识查询",
    detects: "产品规则、报价规则、SOP 和风险边界",
    routesTo: "AI 知识库",
    safeOutput: "带来源的内部参考摘要",
    approval: "无需执行；客户承诺仍需确认",
  },
  {
    title: "文件分析",
    detects: "PDF/图纸/规格书里与报价有关的信息",
    routesTo: "文件 / 询盘 / 报价前复核",
    safeOutput: "提取清单、缺失字段、人工检查项",
    approval: "报价或外发前需要人工确认",
  },
  {
    title: "售后投诉",
    detects: "投诉类型、证据缺口、责任/赔偿风险",
    routesTo: "售后 / 文件 / 知识库",
    safeOutput: "问题摘要、证据清单、回复草稿",
    approval: "责任或赔偿表述需要人工确认",
  },
  {
    title: "业务复盘",
    detects: "今日优先级、风险、跟进和缺失知识",
    routesTo: "工作台 / 客户 / 询盘 / 风险",
    safeOutput: "每日优先级简报",
    approval: "仅复盘无需执行",
  },
];

const aiCommandContextItems = [
  "客户资料",
  "询盘记录",
  "产品知识",
  "供应商能力",
  "报价规则",
  "文件资料",
  "历史沟通",
  "风险规则",
];

const aiCommandWorkflowSteps = [
  "识别客户和国家",
  "提取产品 / 规格 / 数量 / 港口",
  "查询知识库规则",
  "检查供应商能力",
  "识别缺失信息",
  "生成客户确认问题草稿",
  "生成供应商询价草稿",
  "进入报价前复核",
  "等待 Paul 人工确认",
];

const aiCommandDrafts = [
  {
    title: "客户确认问题草稿",
    subtitle: "Short English / Spanish-friendly draft",
    body: "Dear customer, thank you for your inquiry. To check quotation readiness, please help confirm the drawing/specification, target quantity, thickness, packing requirement and destination port. We will review the information internally before preparing any quotation.",
    chips: ["草稿", "未发送", "需人工确认"],
  },
  {
    title: "供应商询价草稿",
    subtitle: "中文供应商询价草稿",
    body: "请帮忙预审轻钢龙骨询价方向：需确认规格、厚度、材质/镀锌层、包装方式、MOQ、20GP 装柜范围、参考交期和报价有效期。当前仅内部询价草稿，未对客户承诺价格或交期。",
    chips: ["草稿", "未发送", "需人工确认"],
  },
];

const aiCommandDailyBriefingItems = [
  { title: "今日最该处理的客户", detail: "秘鲁轻钢龙骨询盘、巴拿马门窗图纸补充、印尼吊顶系统规格确认。" },
  { title: "需要补充信息的询盘", detail: "图纸、规格、数量、目的港、包装和交期目标仍需人工确认。" },
  { title: "高风险报价", detail: "涉及价格、付款、交期、质量责任或供应商能力的内容必须先复核。" },
  { title: "待跟进客户", detail: "7 天未回复客户需要人工决定是否发送跟进消息。" },
  { title: "待验证知识", detail: "报价规则、供应商交期和产品 SOP 需要人工验证后才能引用。" },
  { title: "内容营销建议", detail: "可准备 LinkedIn 选题草稿，但发布前必须人工确认来源和表述。" },
];

const prospectingModeCards = [
  {
    title: "目标市场开发",
    description: "根据国家、产品、客户类型和公开来源范围，规划后续合规开发方向。",
    chips: [
      "国家/地区：秘鲁、巴拿马、印尼",
      "产品：铝合金门窗、幕墙、轻钢龙骨、吊顶系统",
      "客户类型：工程承包商、进口商、分销商",
      "数据来源：公开官网 / 行业目录 / 展会页面",
    ],
    status: ["搜索 API 未接入", "当前仅为流程预览", "不执行自动搜索"],
  },
  {
    title: "相似客户发现",
    description: "从一个样本客户画像出发，展示未来如何寻找相似公司和产品需求。",
    chips: [
      "样本客户：Panama Facade Contractor Demo",
      "样本来源：官网 URL / 询盘文本 / 产品照片 / PDF 资料",
      "AI 提取画像：幕墙工程商、门窗需求、商业建筑项目",
      "相似客户方向：同区域工程公司、建材进口商、门窗分销商",
    ],
    status: ["文件上传/解析/OCR 未开放", "当前仅为静态预览", "不自动创建客户"],
  },
];

const prospectingLeadCards = [
  {
    company: "Andean Drywall Distributor Demo",
    region: "Peru",
    productFit: "轻钢龙骨 / drywall profiles",
    score: 82,
    risk: "中",
    riskTone: "warning",
    evidence: ["行业目录", "官网关键词"],
    nextStep: "人工确认公司类型与联系方式",
  },
  {
    company: "Panama Facade Systems Demo",
    region: "Panama",
    productFit: "铝合金门窗 / curtain wall",
    score: 88,
    risk: "低",
    riskTone: "active",
    evidence: ["官网项目案例"],
    nextStep: "人工查看项目类型",
  },
  {
    company: "Indonesia Ceiling Supply Demo",
    region: "Indonesia",
    productFit: "吊顶系统 / ceiling system",
    score: 76,
    risk: "中",
    riskTone: "warning",
    evidence: ["建材分销页面"],
    nextStep: "确认是否进口商/分销商",
  },
];

const prospectingWorkflowSteps = [
  "目标市场/样本客户",
  "AI 提取画像",
  "相似客户发现",
  "来源证据",
  "合规检查",
  "人工复核",
  "开发草稿",
  "未来审批发送",
];

const prospectingSafetyItems = [
  "不抓取 LinkedIn",
  "不绕过登录",
  "不自动采集私人联系方式",
  "不自动发送邮件/WhatsApp",
  "不创建客户",
  "不生成报价",
  "保留来源记录",
  "后续支持 do-not-contact / opt-out",
];

const customerVerificationSummaryCards = [
  { label: "待验证客户", value: "12", subtitle: "公司、邮箱或角色仍需人工确认", tone: "info" },
  { label: "高可信客户", value: "5", subtitle: "资料较完整，仍未自动确认", tone: "active" },
  { label: "需补充信息", value: "7", subtitle: "缺网站、项目、数量或买家角色", tone: "warning" },
  { label: "疑似重复", value: "2", subtitle: "公司名或联系人可能已存在", tone: "warning" },
  { label: "高风险线索", value: "1", subtitle: "身份或需求存在明显矛盾", tone: "danger" },
  { label: "建议跟进", value: "6", subtitle: "可人工索取公司和项目资料", tone: "active" },
];

const customerVerificationChecklist = [
  { item: "公司名称是否完整", status: "通过", detail: "DEMO Facade Solutions 已提供公司名称。" },
  { item: "邮箱域名是否合理", status: "需确认", detail: "示例邮箱需要人工核实，不能自动发送。" },
  { item: "网站是否存在", status: "未查询", detail: "当前不联网，不检查网站真实性。" },
  { item: "国家与询盘是否匹配", status: "通过", detail: "名片和询盘均指向 Peru / Latin America 方向。" },
  { item: "产品需求是否清晰", status: "需确认", detail: "门窗和幕墙方向清楚，但规格、数量和项目位置缺失。" },
  { item: "是否可能为同行", status: "需确认", detail: "公司名不像明显同行，但未做真实背景调查。" },
  { item: "是否可能为中间商", status: "需确认", detail: "可能是承包商或建材进口商，需要确认采购角色。" },
  { item: "是否已有重复客户", status: "未查询", detail: "当前不查真实客户库，仅展示查重字段结构。" },
  { item: "是否需要补充公司资料", status: "缺失", detail: "缺网站、注册信息、项目位置、采购角色。" },
  { item: "是否建议继续跟进", status: "需确认", detail: "建议温和索取信息，不发送正式报价。" },
];

const customerVerificationTypeOptions = [
  { label: "Developer / 开发商", status: "可能性低" },
  { label: "Contractor / 承包商", status: "主要推测" },
  { label: "Importer / 进口商", status: "次要可能" },
  { label: "Distributor / 经销商", status: "待确认" },
  { label: "Fabricator / 加工厂", status: "待确认" },
  { label: "Trading company / 贸易商", status: "待确认" },
  { label: "Competitor / 同行风险", status: "需排除" },
  { label: "Unknown / 待确认", status: "兜底" },
];

const customerVerificationDuplicateRows = [
  ["Same email", "not found / not checked"],
  ["Same company", "possible similar name"],
  ["Same phone", "not available"],
  ["Same website", "not checked"],
  ["Existing customer match", "needs review"],
];

const customerVerificationLowRiskSignals = ["company name provided", "product interest clear", "country provided"];
const customerVerificationNeedConfirmSignals = [
  "website not verified",
  "company registration not checked",
  "email domain not verified",
  "project details missing",
  "purchase role unclear",
];
const customerVerificationHighRiskSignals = [
  "personal email only",
  "refuses company information",
  "asks for sensitive pricing without project context",
  "suspected competitor",
  "inconsistent country/contact data",
];

const customerVerificationDisabledDecisions = [
  "禁用：标记为验证通过客户",
  "禁用：请求更多信息",
  "禁用：标记可能重复",
  "禁用：标记低优先级",
  "禁用：风险 / 暂停跟进",
];

const customerVerificationSafetyItems = [
  "不联网自动查询",
  "不自动创建客户",
  "不自动修改客户资料",
  "不自动发送 Email / WhatsApp",
  "不生成正式报价",
  "所有结论需要 Paul 人工确认",
];

const businessCardCaptureFields = [
  { label: "姓名", value: "Carlos Ramirez", note: "DEMO / 未验证" },
  { label: "公司", value: "Demo Facade Solutions", note: "客户档案草稿" },
  { label: "职位", value: "Project Manager", note: "需人工确认" },
  { label: "邮箱", value: "carlos.ramirez@example-demo.com", note: "示例邮箱，未验证" },
  { label: "电话", value: "+51 900 000 000", note: "示例号码，未验证" },
  { label: "WhatsApp", value: "+51 900 000 000", note: "示例号码，未发送" },
  { label: "网站", value: "www.demo-facade.example", note: "示例域名，待确认" },
  { label: "国家", value: "Peru", note: "根据名片国家码推测" },
  { label: "地址", value: "Lima, Peru", note: "示例城市，待补全" },
  { label: "客户类型", value: "Facade contractor / importer", note: "AI 推测，需 Paul 确认" },
  { label: "产品兴趣", value: "Aluminum windows, glass, hardware", note: "静态推测" },
  { label: "来源渠道", value: "DEMO_TRADE_SHOW_CARD", note: "展会名片 demo" },
  { label: "置信度", value: "Medium", note: "Review status: Needs Paul confirmation" },
  { label: "缺失字段", value: "邮箱有效性、网站、采购需求", note: "不可直接建客" },
  { label: "风险提示", value: "联系人和需求均未验证", note: "不可自动发送" },
];

const businessCardAnalysisRows = [
  ["可能客户类型", "幕墙承包商 / 建材进口商"],
  ["可能关注产品", "铝合金门窗、玻璃、五金"],
  ["需要人工确认", "邮箱、网站、采购需求"],
  ["推荐下一步", "生成温和跟进草稿，等待 Paul 确认"],
];

const businessCardDuplicateChecks = [
  ["是否已有相同公司", "未执行真实查重，当前仅为静态预览"],
  ["是否已有相同邮箱", "未连接客户数据库查重"],
  ["是否可能是老客户", "需要人工确认公司名、邮箱和历史沟通"],
];

const businessCardReviewQueue = [
  "待确认名片",
  "缺邮箱",
  "缺网站",
  "需确认国家",
  "可能重复客户",
  "可生成跟进草稿",
];

const businessCardAiCanItems = [
  "识别字段",
  "生成客户草稿",
  "提醒缺失信息",
  "推荐跟进方向",
  "生成草稿",
];

const businessCardAiCannotItems = [
  "不自动创建客户",
  "不自动发送消息",
  "不自动导入真实数据",
  "不自动群发开发信",
  "不自动判断客户绝对可信",
];

const businessCardUploadFileRules = [
  "支持格式：JPG / PNG / WEBP",
  "PDF：后续阶段再评估",
  "单张图片建议不超过 5MB",
  "不支持压缩包、脚本、视频、未知二进制文件",
];

const businessCardUploadPrivacyNotes = [
  "名片可能包含电话、邮箱、WhatsApp、职位、地址",
  "文件未来将存入私有存储",
  "不公开访问",
  "不自动创建客户",
  "不自动发送消息",
  "AI 识别结果必须人工确认",
];

const businessCardUploadPipelineSteps = [
  "图片上传",
  "私有存储",
  "OCR/视觉识别",
  "提取字段",
  "置信度评分",
  "查重",
  "客户草稿",
  "Paul 审核",
];

const businessCardUploadErrorStates = [
  "文件类型不支持",
  "文件过大",
  "图片不清晰",
  "识别置信度低",
  "可能重复客户",
  "需要人工复核",
];

const businessCardUploadRetentionNotes = [
  "错误/重复/无关名片可归档或删除",
  "保留必要业务联系人信息",
  "不保存无关私人信息",
];

const knowledgeOverviewCards = [
  {
    label: "产品知识",
    count: "42",
    description: "铝合金门窗、幕墙、玻璃、五金、吊顶系统、轻钢龙骨等产品规格和应用场景。",
    status: "待人工验证 / 静态预览",
    note: "仅供询盘分析参考，不生成价格或交期承诺。",
    tone: "info",
  },
  {
    label: "供应商知识",
    count: "18",
    description: "供应商能力、工艺限制、MOQ、交期、包装和质量注意事项。",
    status: "来源待补充",
    note: "供应商能力不等于确认可生产，必须人工复核。",
    tone: "warning",
  },
  {
    label: "报价规则",
    count: "12",
    description: "FOB / CIF / EXW、港口费用、税费、装柜、报价有效期和人工确认规则。",
    status: "待人工验证",
    note: "不计算价格，不生成报价单，不承诺付款或交期。",
    tone: "danger",
  },
  {
    label: "文件知识",
    count: "26",
    description: "图纸、规格书、供应商资料、安装手册和客户文件的知识摘要方向。",
    status: "元数据预览",
    note: "不上传、不下载、不解析、不 OCR，不暴露私有文件内容。",
    tone: "neutral",
  },
  {
    label: "沟通模板",
    count: "16",
    description: "英文邮件、西语邮件、WhatsApp 回复、客户澄清问题和供应商询价模板。",
    status: "草稿参考",
    note: "模板只辅助起草，发送必须等人工审批。",
    tone: "info",
  },
  {
    label: "合规与安全",
    count: "9",
    description: "不自动发送、不越权采集、不承诺价格、不隐藏来源和 opt-out 边界。",
    status: "安全优先",
    note: "安全规则优先于任何 AI 建议或业务快捷操作。",
    tone: "active",
  },
];

const knowledgeItems = [
  {
    title: "铝合金门窗询盘信息补充清单",
    category: "产品知识 / 询盘 SOP",
    summary: "玻璃配置、开启方式、五金品牌、颜色、尺寸、交货港口需要人工确认。",
    source: "内部 SOP 草稿",
    confidence: "中",
    humanVerified: "否",
    chips: ["产品知识", "待人工验证", "仅供内部参考"],
  },
  {
    title: "轻钢龙骨报价前确认规则",
    category: "报价规则",
    summary: "厚度、长度、包装、FOB费用、税费、装柜数量需要确认。",
    source: "报价经验总结",
    confidence: "中",
    humanVerified: "否",
    chips: ["报价规则", "来源待补充", "不可客户承诺"],
  },
  {
    title: "供应商能力匹配注意事项",
    category: "供应商知识",
    summary: "铝型材、玻璃深加工、吊顶板材和轻钢龙骨需分别确认工艺、交期和包装。",
    source: "供应商能力记录",
    confidence: "中",
    humanVerified: "否",
    chips: ["供应商知识", "交期需复核", "不代表承诺"],
  },
  {
    title: "客户投诉回复原则",
    category: "沟通模板 / 售后 SOP",
    summary: "先承认问题、解释调查流程、避免过早承诺赔偿、收集项目环境和照片证据。",
    source: "内部沟通模板",
    confidence: "中",
    humanVerified: "否",
    chips: ["沟通模板", "售后 SOP", "不可自动发送"],
  },
];

const knowledgeVerificationQueue = [
  {
    title: "报价规则待确认",
    status: "待人工验证",
    note: "需要确认费用口径、有效期和是否可用于 AI 引用。",
  },
  {
    title: "供应商交期规则待更新",
    status: "可能过期",
    note: "交期和产能随订单排产变化，不能作为客户承诺。",
  },
  {
    title: "安装手册来源待补充",
    status: "需补充来源",
    note: "缺少文件版本和来源说明，只能作为内部提示。",
  },
];

const knowledgeUsageRows = [
  {
    label: "可用于",
    value: "询盘分析、报价前复核、供应商匹配、开发客户关键词",
  },
  {
    label: "不可用于",
    value: "自动报价、自动发送、自动承诺价格、自动确认供应商能力",
  },
  {
    label: "缺失知识",
    value: "真实产品目录、安装手册、供应商报价规则、国家市场规则",
  },
  {
    label: "AI 使用边界",
    value: "未来可引用经人工确认的知识给出建议，但当前阶段不会自动生成客户承诺或发送消息。",
  },
];

const knowledgeRoadmapSteps = [
  "知识分类",
  "来源记录",
  "人工验证",
  "文档切分",
  "Embedding / RAG",
  "带来源引用回答",
  "人工反馈优化",
];

const knowledgeSafetyItems = [
  "未验证知识不能用于客户承诺",
  "不自动发送",
  "不自动报价",
  "不隐藏来源",
  "不使用过期规则",
  "不暴露内部 confidential 规则给客户",
  "不上传文件",
  "不执行 RAG",
];

function knowledgeStatusLabel(value) {
  const labels = {
    draft: "草稿",
    needs_review: "待人工验证",
    verified: "已人工验证",
    outdated: "可能过期",
    archived: "已归档",
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    internal_only: "仅内部",
    ai_reference_only: "AI 内部参考",
    customer_safe_after_review: "人工复核后可对客",
    confidential: "机密",
    manual_sop: "内部 SOP",
    supplier_record: "供应商记录",
    customer_inquiry: "客户询盘",
    quotation_note: "报价备注",
    product_catalog: "产品目录",
    installation_manual: "安装手册",
    email_template: "邮件模板",
    ai_draft: "AI 草稿",
    external_public_reference: "公开来源",
    file_metadata: "文件元数据",
  };
  return labels[value] || value || "待确认";
}

function knowledgeTone(value) {
  if (value === "high" || value === "confidential") return "danger";
  if (value === "medium" || value === "needs_review" || value === "draft" || value === "outdated") return "warning";
  if (value === "verified" || value === "low") return "active";
  return "info";
}

function knowledgeSourceLabel(item) {
  const sourceType = knowledgeStatusLabel(item.source_type || "");
  const reference = item.source_reference || item.source || "";
  return [sourceType, reference].filter(Boolean).join(" · ") || "来源待补充";
}

function knowledgeHumanVerifiedLabel(item) {
  if (item.humanVerified !== undefined) return item.humanVerified;
  return item.human_verified ? "是" : "否";
}

function knowledgeItemChips(item) {
  if (Array.isArray(item.chips) && item.chips.length) return item.chips;
  return [
    knowledgeStatusLabel(item.verification_status),
    knowledgeStatusLabel(item.risk_level),
    knowledgeStatusLabel(item.visibility_scope),
    item.human_verified ? "已人工验证" : "待人工验证",
  ].filter(Boolean);
}

function fallbackKnowledgeViewModel() {
  return {
    isLive: false,
    sourceLabel: fallbackLabel,
    overviewCards: knowledgeOverviewCards,
    items: knowledgeItems,
    reviewQueue: knowledgeVerificationQueue,
    linkedContext: [],
    usageRows: knowledgeUsageRows,
    queueCountLabel: "静态安全示例",
    headerCopy:
      "AI Knowledge Center：沉淀产品、供应商、报价规则、文件资料、沟通模板和业务 SOP。当前显示安全 fallback，不上传文件、不解析文档、不执行 RAG。",
  };
}

function getKnowledgeCenterViewModel() {
  const fallback = fallbackKnowledgeViewModel();
  const isLive = knowledgeApiState.status === "loaded" && knowledgeApiState.source === "api";
  if (!isLive) {
    return fallback;
  }

  const summary = knowledgeApiState.summary || {};
  const overviewCards = knowledgeApiState.categories.map((category) => ({
    label: category.name_zh || category.name_en || category.slug || "知识分类",
    count: String(category.item_count ?? 0),
    description: category.description || "只读知识分类",
    status: `已验证 ${category.verified_count ?? 0} / 待验证 ${category.needs_review_count ?? 0}`,
    note: category.slug || "admin-read knowledge category",
    tone: category.needs_review_count > 0 ? "warning" : "active",
  }));

  return {
    isLive: true,
    sourceLabel: "实时只读数据",
    overviewCards: overviewCards.length ? overviewCards : fallback.overviewCards,
    items: knowledgeApiState.items,
    reviewQueue: knowledgeApiState.reviewQueue,
    linkedContext: knowledgeApiState.linkedContext,
    usageRows: [
      { label: "知识总数", value: `${summary.total_items ?? knowledgeApiState.items.length} 条` },
      { label: "已验证", value: `${summary.verified_items ?? 0} 条` },
      { label: "待人工验证", value: `${summary.needs_review_items ?? knowledgeApiState.reviewQueue.length} 条` },
      { label: "高风险", value: `${summary.high_risk_items ?? 0} 条` },
    ],
    queueCountLabel: `${knowledgeApiState.reviewQueue.length} 条待验证记录`,
    headerCopy:
      "AI Knowledge Center：展示 admin-read 知识库只读数据；不上传文件、不解析文档、不执行 RAG、不生成 AI 答案。",
  };
}

const inquiryWorkflowSummaryCards = [
  {
    label: "真实感试用询盘",
    value: "5",
    subtitle: "Panama / Peru / Indonesia 合成示例",
    tone: "info",
  },
  {
    label: "缺失信息",
    value: "6",
    subtitle: "玻璃、厚度、包装、图纸或港口信息缺失",
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
    subtitle: "客户需求、图纸或产品选项未确认",
    tone: "info",
  },
  {
    label: "待供应商确认",
    value: "2",
    subtitle: "能力、包装、报价有效期或交期待反馈",
    tone: "neutral",
  },
  {
    label: "AI 初判待复核",
    value: "6",
    subtitle: "仅供人工复核，不自动应用",
    tone: "warning",
  },
];

const inquiryWorkflowItems = [
  {
    title: "Panama facade / aluminum window-door inquiry",
    category: "询盘",
    status: "信息待补充",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["glass spec", "opening direction", "hardware brand", "delivery port"],
    aiSuggestion: "客户需要门窗/幕墙材料，先补齐玻璃配置、开启方向和五金品牌。",
    humanNextStep: "向客户索取图纸包、玻璃配置、五金品牌和目的港信息。",
    disabledCapabilities: ["不可计算价格", "不可生成报价单", "禁止外发客户"],
  },
  {
    title: "Peru drywall profile / light steel keel 20GP inquiry",
    category: "询盘",
    status: "待人工复核",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["final thickness", "packing", "tax/FOB scope", "container loading weight"],
    aiSuggestion: "20GP/FCL 询盘需要确认最终厚度、锌层、包装和贸易条款范围。",
    humanNextStep: "整理客户确认清单，同时让供应商补充包装和装柜资料。",
    disabledCapabilities: ["不可生成报价单", "不可生成 PI", "不可确认订单"],
  },
  {
    title: "Indonesia factory ceiling system inquiry",
    category: "询盘",
    status: "信息待补充",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["final panel option", "drawing confirmation", "supplier lead time"],
    aiSuggestion: "工厂吊顶系统需要确认最终面板选项、图纸版本和供应商交期。",
    humanNextStep: "让客户确认图纸和板材选项，再让供应商确认包装、损耗和交期。",
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可生成 PI"],
  },
  {
    title: "Coastal aluminum profile quality feedback",
    category: "质量反馈",
    status: "高风险",
    risk: "高",
    riskTone: "danger",
    missingInfo: ["project environment", "surface treatment record", "batch photos"],
    aiSuggestion: "涉及质量责任和可能赔付，必须先收集证据链，不得直接承认责任。",
    humanNextStep: "收集照片、表面处理记录和使用环境，由人工判断责任边界。",
    disabledCapabilities: ["不可承认责任", "不可承诺赔付", "禁止外发最终结论"],
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
    label: "试用客户档案",
    value: "12",
    subtitle: "contractor / importer / distributor 合成样例",
    tone: "info",
  },
  {
    label: "今日需跟进",
    value: "5",
    subtitle: "需要人工判断是否索取资料",
    tone: "warning",
  },
  {
    label: "有活跃询盘",
    value: "7",
    subtitle: "正在确认规格、图纸或供应商反馈",
    tone: "info",
  },
  {
    label: "重点项目客户",
    value: "3",
    subtitle: "门窗幕墙、吊顶和建材整柜项目",
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
    subtitle: "公司、规格、图纸或交期资料不完整",
    tone: "warning",
  },
];

const customerWorkflowItems = [
  {
    title: "Panama facade contractor",
    stage: "信息待补充",
    valueLevel: "高",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "aluminum windows / curtain wall / glass",
    need: "确认玻璃配置、开启方向、五金品牌、目的港和图纸包。",
    aiSuggestion: "construction contractor；先整理客户图纸和规格，再进入供应商能力复核。",
    humanNextStep: "人工准备信息确认清单，不外发报价或商业承诺。",
    disabledCapabilities: ["禁止外发客户", "不可计算价格", "不可生成 PI"],
  },
  {
    title: "Peru building materials importer",
    stage: "规格确认",
    valueLevel: "中",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "light steel keel / drywall profiles 20GP",
    need: "补充最终厚度、锌层、包装、税费/FOB 范围和装柜重量。",
    aiSuggestion: "distributor/importer；先把缺失信息整理成客户确认清单，再向供应商核对包装和重量。",
    humanNextStep: "人工确认资料后，再判断是否进入报价前复核。",
    disabledCapabilities: ["不可生成报价单", "不可确认装柜", "不可生成合同"],
  },
  {
    title: "Indonesia factory project buyer",
    stage: "供应商确认",
    valueLevel: "高",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "ceiling system / aluminum ceiling panel",
    need: "确认最终面板选项、图纸版本、供应商交期和安装损耗。",
    aiSuggestion: "factory project buyer；适合做吊顶系统资料复核，但交期和材料方案不能自动确认。",
    humanNextStep: "人工核对图纸和材料表，再向供应商确认包装、损耗和交期。",
    disabledCapabilities: ["不可确认交期", "不可承诺价格", "不可确认生产"],
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
    title: "Brazil facade distributor",
    stage: "客户资料待确认",
    valueLevel: "高",
    risk: "中",
    riskTone: "warning",
    recentInquiry: "aluminum profiles / facade accessories",
    need: "确认项目用途、表面处理、数量、长度和包装需求。",
    aiSuggestion: "facade distributor；可作为产品方向参考，但仍需补充图纸和规格。",
    humanNextStep: "人工整理产品清单，等待客户补齐规格后再推进。",
    disabledCapabilities: ["不可生成报价单", "不可确认生产", "不可确认交期"],
  },
];

const supplierWorkflowSummaryCards = [
  { label: "候选供应商", value: "8", subtitle: "仅作为人工匹配候选", tone: "info" },
  { label: "供应商待确认", value: "5", subtitle: "规格、包装、有效期或交期待复核", tone: "warning" },
  { label: "能力匹配", value: "6", subtitle: "与门窗、吊顶、轻钢龙骨询盘相关", tone: "neutral" },
  { label: "高风险供应商", value: "2", subtitle: "涉及质保、责任或交期风险", tone: "danger" },
  { label: "待补资料", value: "4", subtitle: "系统、认证、包装或装柜资料缺失", tone: "warning" },
  { label: "待人工核实", value: "7", subtitle: "需要人工确认后才能使用", tone: "warning" },
];

const supplierWorkflowItems = [
  {
    title: "铝合金门窗 / 幕墙候选供应商",
    capability: "型材挤压 / 喷涂 / 五金配套 / 组装",
    status: "能力匹配",
    risk: "中",
    riskTone: "warning",
    need: "确认型材系统、表面处理、五金品牌和包装方式。",
    aiSuggestion: "适合作为 Panama 门窗/幕墙项目候选供应商，但系统、五金、玻璃和包装必须人工确认。",
    disabledCapabilities: ["不可发送 RFQ", "不可确认报价", "不可确认交期"],
  },
  {
    title: "轻钢龙骨 / drywall profiles 候选供应商",
    capability: "roll forming / Omega / U channel / stud track",
    status: "待报价确认",
    risk: "中",
    riskTone: "warning",
    need: "确认厚度、锌层、长度、包装和装柜重量。",
    aiSuggestion: "适合 Peru drywall profiles 20GP 询盘，建议先按规格和重量核对包装与装柜方案。",
    disabledCapabilities: ["不可确认单价", "不可确认装柜", "不可生成客户报价"],
  },
  {
    title: "吊顶系统 / ceiling panel 候选供应商",
    capability: "金属吊顶 / 板材 / 龙骨系统",
    status: "待内部核算",
    risk: "中",
    riskTone: "warning",
    need: "确认 0.7mm 板材、Option B、安装损耗和包装方案。",
    aiSuggestion: "适合 Indonesia factory ceiling system 项目，但必须先完成材料表、面板选项和供应商报价复核。",
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可生成 PI"],
  },
  {
    title: "玻璃深加工候选供应商",
    capability: "tempered / laminated / IGU glass",
    status: "规格待确认",
    risk: "中",
    riskTone: "warning",
    need: "确认玻璃厚度、夹胶/中空配置、认证、包装和运输方式。",
    aiSuggestion: "适合 Panama 门窗/幕墙玻璃配置复核，但需客户图纸和玻璃规范。",
    disabledCapabilities: ["不可承诺价格", "不可确认交期", "不可确认生产"],
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
  { label: "能力分类", value: "6", subtitle: "挤压、喷涂、玻璃、吊顶和辊压", tone: "info" },
  { label: "可匹配询盘", value: "9", subtitle: "仅进入人工能力方向判断", tone: "neutral" },
  { label: "需技术确认", value: "5", subtitle: "图纸、工艺、包装或安装说明待补充", tone: "warning" },
  { label: "高风险工艺", value: "2", subtitle: "涉及责任、质保或环境适配", tone: "danger" },
  { label: "待补资料", value: "4", subtitle: "材料、包装或供应商报价缺失", tone: "warning" },
  { label: "不可承诺交期", value: "7", subtitle: "交期必须由人工复核后确认", tone: "danger" },
];

const capabilityWorkflowItems = [
  {
    title: "铝合金门窗系统",
    process: "型材挤压 / powder coating / 组装",
    matchedInquiries: "Panama 门窗、幕墙和建筑项目",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["系统图纸", "玻璃配置", "五金清单", "包装方式"],
    disabledCapabilities: ["不可确认安装结果", "不可确认交期", "不可生成正式报价"],
  },
  {
    title: "轻钢龙骨型材",
    process: "roll forming / galvanized steel / drywall profiles",
    matchedInquiries: "Peru 20GP 轻钢龙骨 / drywall profiles",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["最终厚度", "锌层", "包装方式", "装柜重量"],
    disabledCapabilities: ["不可确认重量", "不可确认装柜", "不可生成报价单"],
  },
  {
    title: "金属吊顶 / 铝天花系统",
    process: "ceiling panel fabrication / suspension system",
    matchedInquiries: "Indonesia factory ceiling system",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["最终面板选项", "材料表", "安装损耗", "供应商交期"],
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可生成 PI"],
  },
  {
    title: "玻璃加工",
    process: "tempered / laminated / IGU glass",
    matchedInquiries: "Panama facade glass specification",
    risk: "中",
    riskTone: "warning",
    missingInfo: ["玻璃厚度", "中空/夹胶配置", "认证", "包装"],
    disabledCapabilities: ["不可确认生产", "不可承诺价格", "不可确认交期"],
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
const documentApiState = createReadOnlyState("documents");
const preQuotationApiState = createReadOnlyState("reviews");
const quotationMetadataApiState = createReadOnlyState("quotations");

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
  reviewTitle.textContent = config.title === "稍后开放" ? "模块状态" : "复核面板";
  reviewPanel.innerHTML = config.review(sectionId);
  if (sectionId === "dashboard") {
    loadDashboardSummaryReadOnly();
  }
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
  if (sectionId === "suppliers") {
    loadManufacturingCapabilitiesReadOnly();
  }
  if (sectionId === "ai-drafts") {
    loadAiDraftsReadOnly();
  }
  if (sectionId === "knowledge-center") {
    loadKnowledgeCenterReadOnly();
  }
  if (sectionId === "business-card-capture") {
    loadBusinessCardCaptureReadOnly();
  }
  if (sectionId === "customer-verification") {
    loadCustomerVerificationReadOnly();
  }
  if (sectionId === "followup-assistant") {
    loadFollowupAssistantReadOnly();
  }
  if (sectionId === "inquiry-intelligence") {
    loadInquiryIntelligenceReadOnly();
  }
  if (sectionId === "files") {
    loadDocumentsReadOnly();
  }
  if (sectionId === "quotations") {
    loadPreQuotationReviewReadOnly();
    loadQuotationMetadataReadOnly();
  }
}

function renderAiCommandCenter() {
  return `
    <div class="ai-command-center-preview" aria-label="AI 指挥台静态预览">
      <div class="command-center-hero">
        <div>
          <span class="state-label">AI Command Center</span>
          <h3>AI 指挥台</h3>
          <p>用一句话告诉 AI 你要完成的外贸任务，AI 会自动理解意图、查找上下文、规划流程、生成草稿，并提示需要人工确认的动作。</p>
        </div>
        <div class="command-center-badges" aria-label="AI 指挥台预览状态">
          ${badge("静态预览", "draft")}
          ${badge("不调用 AI", "pending")}
          ${badge("不自动发送", "pending")}
          ${badge("人工确认", "approval")}
          ${badge("来源与风险", "active")}
        </div>
      </div>

      <section class="command-center-section" aria-label="AI 指令输入预览">
        <div class="workbench-section-header">
          <div>
            <h3>告诉 AI 你想完成什么</h3>
            <p>这是静态指令预览区，不是可输入表单；当前不会提交、不会调用模型、不会执行动作。</p>
          </div>
          <span>只读指令示例</span>
        </div>
        <div class="command-input-preview" aria-label="只读 AI 指令示例">
          <span>Tell AI what you want to do...</span>
          ${aiCommandExamples.map((example) => `<p>${escapeHtml(example)}</p>`).join("")}
        </div>
      </section>

      <section class="command-center-section" aria-label="意图识别卡片">
        <div class="workbench-section-header">
          <div>
            <h3>任务意图识别</h3>
            <p>AI 先判断任务类型，再路由到相应模块；输出保持只读，不直接执行外贸动作。</p>
          </div>
          <span>10 类 intent</span>
        </div>
        <div class="intent-grid">
          ${aiCommandIntentCards.map(renderAiCommandIntentCard).join("")}
        </div>
      </section>

      <section class="command-center-section" aria-label="上下文检索面板">
        <div class="workbench-section-header">
          <div>
            <h3>跨模块上下文检索</h3>
            <p>未来 AI 会先查找与任务相关的客户、询盘、知识、供应商、文件和风险规则，再给出建议。</p>
          </div>
          <span>来源优先</span>
        </div>
        <div class="context-retrieval-grid">
          ${aiCommandContextItems
            .map(
              (item) => `
                <article class="context-retrieval-card">
                  <span>${escapeHtml(item)}</span>
                  <p>只读检索来源，未来需要显示来源、可信度和缺失信息。</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <div class="ai-command-layout">
        <section class="command-center-section workflow-preview" aria-label="秘鲁客户轻钢龙骨询盘流程预览">
          <div class="workbench-section-header">
            <div>
              <h3>示例流程：秘鲁客户轻钢龙骨询盘</h3>
              <p>AI 把一句话拆成可复核流程；所有步骤都是预览，不会写入或外发。</p>
            </div>
            <span>等待 Paul 确认</span>
          </div>
          <div class="workflow-stepper" aria-label="AI 指挥台示例流程">
            ${aiCommandWorkflowSteps.map(renderProspectingWorkflowStep).join("")}
          </div>
        </section>

        <aside class="approval-boundary-panel" aria-label="人工审批边界">
          <div class="workbench-review-heading">
            <div>
              <h3>人工审批边界</h3>
              <p class="workbench-review-note">AI 准备工作，Paul 决定是否执行。</p>
            </div>
            ${badge("不自动执行", "pending")}
          </div>
          <div class="approval-boundary-grid">
            <div>
              <h4>AI 可以准备</h4>
              <div class="command-center-chip-row">
                ${renderChipList(["分析", "建议", "草稿", "风险提示"], "ai-command-chip")}
              </div>
            </div>
            <div>
              <h4>Paul 必须确认</h4>
              <div class="disabled-chip-row">
                ${renderDisabledCapabilities(["发送客户消息", "发送供应商询价", "正式报价", "PI", "订单", "付款 / 生产 / 发货", "售后赔偿"])}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section class="command-center-section" aria-label="草稿预览">
        <div class="workbench-section-header">
          <div>
            <h3>安全草稿预览</h3>
            <p>草稿只用于人工复核。当前无复制、发送、审批或生成正式单据能力。</p>
          </div>
          <span>草稿 / 未发送</span>
        </div>
        <div class="draft-preview-grid">
          ${aiCommandDrafts.map(renderAiCommandDraftCard).join("")}
        </div>
      </section>

      <section class="command-center-section" aria-label="每日优先级简报预览">
        <div class="workbench-section-header">
          <div>
            <h3>每日优先级简报</h3>
            <p>未来 AI 指挥台可把客户、询盘、风险、跟进、知识和内容任务汇总成当天最值得处理的事项。</p>
          </div>
          <span>未来简报</span>
        </div>
        <div class="daily-briefing-grid">
          ${aiCommandDailyBriefingItems
            .map(
              (item) => `
                <article class="daily-briefing-card">
                  <h4>${escapeHtml(item.title)}</h4>
                  <p>${escapeHtml(item.detail)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="command-center-section command-center-note" aria-label="AI 指挥台和 Copilot 关系">
        <div>
          <h3>AI 指挥台 vs AI Copilot</h3>
          <p>AI 指挥台是系统入口，负责理解目标、路由模块和规划流程。AI Copilot 是每个模块里的上下文助手，负责在客户、询盘、知识、文件或报价复核页面里辅助解释和起草。</p>
          <p>两者共享知识库、风险边界和人工审批规则；当前都不会调用 AI、不会自动发送、不会执行业务动作。</p>
        </div>
      </section>
    </div>
  `;
}

function renderAiCommandIntentCard(card) {
  return `
    <article class="intent-card">
      <div>
        <h4>${escapeHtml(card.title)}</h4>
        <p>${escapeHtml(card.detects)}</p>
      </div>
      <dl>
        <dt>路由到</dt>
        <dd>${escapeHtml(card.routesTo)}</dd>
        <dt>安全输出</dt>
        <dd>${escapeHtml(card.safeOutput)}</dd>
        <dt>审批边界</dt>
        <dd>${escapeHtml(card.approval)}</dd>
      </dl>
    </article>
  `;
}

function renderAiCommandDraftCard(draft) {
  return `
    <article class="draft-preview-card">
      <div class="draft-preview-heading">
        <div>
          <span class="workbench-category">${escapeHtml(draft.subtitle)}</span>
          <h4>${escapeHtml(draft.title)}</h4>
        </div>
        ${badge("Review only", "draft")}
      </div>
      <p>${escapeHtml(draft.body)}</p>
      <div class="command-center-chip-row">
        ${renderChipList(draft.chips, "ai-command-chip")}
      </div>
    </article>
  `;
}

function renderAiCommandCenterReview() {
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 指挥台只读边界</h3>
        <ul class="check-list">
          <li>静态预览，不调用 AI provider，不连接 chat backend</li>
          <li>不执行 workflow，不写入数据库，不创建客户、询盘、任务或报价</li>
          <li>不发送 Email / WhatsApp，不发布内容，不发送 RFQ</li>
          <li>不生成正式报价、PI、订单，不触发付款 / 生产 / 发货</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>未来入口定位</h3>
        <dl>
          <dt>AI 指挥台</dt>
          <dd>跨模块理解任务、查找上下文、规划流程和展示审批边界。</dd>
          <dt>AI Copilot</dt>
          <dd>每个模块里的上下文助手，帮助解释、总结、起草和提醒风险。</dd>
          <dt>共享基础</dt>
          <dd>知识库、风险边界、来源可信度、人工审批规则和未来审计记录。</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>禁用能力</h3>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(["不可提交指令", "不可调用 AI", "不可自动发送", "不可自动报价", "不可生成 PI", "不可创建订单", "不可触发付款 / 生产 / 发货"])}
        </div>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const model = getDashboardWorkbenchViewModel();
  const statusNotice =
    dashboardSummaryApiState.status === "loading"
      ? renderDataStatus("loading", "正在加载工作台汇总", `正在使用当前管理员会话请求 GET ${DASHBOARD_SUMMARY_ENDPOINT}。`)
      : dashboardSummaryApiState.status === "error"
      ? renderDataStatus("error", "工作台汇总 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${dashboardSummaryApiState.error}`)
      : dashboardSummaryApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时工作台汇总", "当前没有可用实时汇总数据，继续显示静态预览（安全示例）。")
      : "";

  return `
    <div class="workbench-preview daily-workbench-preview" aria-label="AI 今日工作台只读预览">
      ${statusNotice}
      <div class="workbench-header daily-workbench-hero">
        <div>
          <span class="state-label">AI Daily Workbench</span>
          <h3>今天该做什么，保罗？</h3>
          <p>${escapeHtml(model.headerCopy)}</p>
          <div class="daily-briefing-stats" aria-label="今日简报静态摘要">
            ${dailyBriefingStats
              .map(
                (item) => `
                  <span>
                    <strong>${escapeHtml(item.value)}</strong>
                    ${escapeHtml(item.label)}
                  </span>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="workbench-badges" aria-label="工作台预览状态">
          ${badge("AI 今日简报", "active")}
          ${badge("只读预览", "draft")}
          ${badge("不自动执行", "pending")}
          ${badge("需人工确认", "approval")}
          ${badge("风险优先", "risk")}
        </div>
      </div>

      <section class="workbench-section daily-priority-section" aria-label="今日优先任务">
        <div class="workbench-section-header">
          <div>
            <h3>今日优先处理</h3>
            <p>把客户、询盘、报价、供应商、知识库和内容工作压缩成可扫读的优先级卡片。</p>
          </div>
          <span>${escapeHtml(model.sourceLabel)}</span>
        </div>
        <div class="daily-priority-grid">
          ${dailyPriorityCards.map(renderDailyPriorityCard).join("")}
        </div>
      </section>

      <section class="workbench-section" aria-label="运营指标预览">
        <div class="workbench-section-header">
          <div>
            <h3>运营指标预览</h3>
            <p>静态/fallback 指标用于验证 AI-first 首页层级；不代表最终 BI 聚合结果。</p>
          </div>
          <span>数据预览</span>
        </div>
        <div class="operations-metric-grid">
          ${dailyOperationsMetrics.map(renderOperationsMetricCard).join("")}
        </div>
      </section>

      <div class="workbench-layout daily-workbench-layout">
        <section class="workbench-queue" aria-label="工作流瓶颈和 AI 建议">
          <div class="workbench-section-header">
            <div>
              <h3>工作流瓶颈</h3>
              <p>显示今天最容易卡住业务推进的只读问题，不创建任务、不执行流程。</p>
            </div>
            <span>5 个瓶颈</span>
          </div>
          ${renderBottleneckPanel()}
          ${renderAiRecommendationPanel()}
          ${renderConversionFunnelPreview()}
        </section>
        <aside class="workbench-review-panel daily-insight-panel" aria-label="AI 今日工作台只读洞察">
          ${renderCountryDistributionPreview()}
          ${renderWorkbenchSafetyNote()}
        </aside>
      </div>
    </div>
  `;
}

function renderDashboardReview() {
  const model = getDashboardWorkbenchViewModel();
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 今日工作台只读边界</h3>
        <ul class="check-list">
          <li>不调用 AI Provider，不执行助手，不写入数据库</li>
          <li>不发送、不审批、不创建客户、不创建任务</li>
          <li>不自动报价、不生成 PI、不创建订单，不触发付款 / 生产 / 发货</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>首页预览状态</h3>
        <dl>
          <dt>API 路由</dt>
          <dd>GET ${DASHBOARD_SUMMARY_ENDPOINT}</dd>
          <dt>数据状态</dt>
          <dd>${escapeHtml(model.sourceLabel)}</dd>
          <dt>队列数量</dt>
          <dd>${escapeHtml(model.queueCountLabel)}</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>预览目标</h3>
        <p>验证 AI 今日工作台是否能回答“今天最值得处理的是哪几件事”。当前只展示静态建议和只读状态，不执行发送、审批、报价、PI、订单、付款、生产或发货。</p>
      </div>
    </div>
  `;
}

function createDashboardSummaryState() {
  return {
    status: "idle",
    summary: null,
    error: "",
    source: "not loaded",
  };
}

function createKnowledgeState() {
  return {
    status: "idle",
    summary: null,
    categories: [],
    items: [],
    reviewQueue: [],
    linkedContext: [],
    error: "",
    source: "not loaded",
  };
}

function getDashboardWorkbenchViewModel() {
  const isLive = dashboardSummaryApiState.status === "loaded" && Boolean(dashboardSummaryApiState.summary);
  if (!isLive) {
    return {
      isLive: false,
      sourceLabel:
        dashboardSummaryApiState.status === "error"
          ? "API 暂不可用，显示静态预览"
          : dashboardSummaryApiState.status === "loading"
          ? "静态预览（安全示例）"
          : "静态预览（安全示例）",
      summaryLabel: "静态数据",
      queueCountLabel: "5 条静态示例",
      headerCopy: "AI 会根据客户、询盘、报价、供应商、知识库和跟进状态，整理今天最值得处理的外贸任务。当前为只读预览，不自动执行。",
      summaryCards: workbenchOverviewCards,
      queueItems: workbenchQueueItems,
      selectedItem: workbenchQueueItems[0],
      warnings: [],
    };
  }

  const summary = dashboardSummaryApiState.summary;
  return {
    isLive: true,
    sourceLabel: "实时只读数据",
    summaryLabel: "实时只读汇总",
    queueCountLabel: `${summary.queueItems.length} 条只读汇总记录`,
    headerCopy: "AI 今日工作台可结合只读汇总数据呈现优先级方向；当前仍不执行助手、不写入数据、不触发业务动作。",
    summaryCards: summary.summaryCards,
    queueItems: summary.queueItems,
    selectedItem: summary.queueItems[0] || workbenchQueueItems[0],
    warnings: summary.warnings,
  };
}

function normalizeDashboardSummaryPayload(payload) {
  if (!payload || typeof payload !== "object" || !payload.summary_cards || typeof payload.summary_cards !== "object") {
    return null;
  }

  const summaryCards = normalizeDashboardSummaryCards(payload.summary_cards);
  const queueItems = normalizeDashboardWorkflowQueues(payload.workflow_queues || {});

  return {
    summaryCards,
    queueItems: queueItems.length ? queueItems : workbenchQueueItems,
    warnings: Array.isArray(payload.warnings) ? payload.warnings.map((item) => safeDashboardText(item, "数据源提示")) : [],
  };
}

function normalizeDashboardSummaryCards(summaryCards) {
  const cardOrder = [
    ["new_inquiries", workbenchOverviewCards[0]],
    ["needs_review", workbenchOverviewCards[1]],
    ["missing_information", workbenchOverviewCards[2]],
    ["followups_due", workbenchOverviewCards[3]],
    ["high_risk", workbenchOverviewCards[4]],
    ["ai_drafts_pending", workbenchOverviewCards[5]],
  ];

  return cardOrder.map(([key, fallback]) => {
    const card = summaryCards[key] || {};
    return {
      label: safeDashboardText(card.label, fallback.label),
      value: safeDashboardText(card.value, fallback.value),
      subtitle: safeDashboardText(card.note || card.subtitle, fallback.subtitle),
      tone: normalizeWorkbenchTone(card.tone || fallback.tone),
    };
  });
}

function normalizeDashboardWorkflowQueues(workflowQueues) {
  const queueConfig = [
    ["inquiry_queue", "询盘"],
    ["customer_queue", "客户"],
    ["ai_review_queue", "AI 复核"],
    ["supplier_capability_queue", "供应商 / 制造能力"],
    ["pre_quotation_queue", "报价前复核"],
  ];
  return queueConfig
    .flatMap(([key, category]) => {
      const items = Array.isArray(workflowQueues[key]) ? workflowQueues[key] : [];
      return items.map((item) => normalizeDashboardQueueItem(item, category));
    })
    .slice(0, 5);
}

function normalizeDashboardQueueItem(item, category) {
  const risk = safeDashboardText(item?.risk || item?.risk_level, "暂无风险等级");
  const status = safeDashboardText(item?.status, "待复核");
  return {
    title: safeDashboardText(item?.title, "未命名只读记录"),
    category,
    priority: risk.includes("高") || risk.toLowerCase().includes("high") ? "P1" : "P2",
    meta: safeDashboardText(item?.summary, "需要人工确认"),
    badges: [status, risk].filter(Boolean),
    recommendedAction: safeDashboardText(item?.next_step || item?.recommended_action, "需要人工确认"),
    disabledCapabilities: normalizeDashboardDisabledActions(item?.disabled_actions || item?.disabledCapabilities),
  };
}

function normalizeDashboardDisabledActions(actions) {
  const labels = {
    send: "不可发送",
    approve: "不可审批",
    reject: "不可拒绝",
    quote: "不可报价",
    create_rfq: "不可发送 RFQ",
    create_task: "不可创建任务",
    generate_quotation: "不可生成报价",
    generate_pi: "不可生成 PI",
    confirm_order: "不可确认订单",
    create_order: "不可创建订单",
    confirm_payment: "不可确认付款",
    trigger_production: "不可触发生产",
    confirm_production: "不可确认生产",
    trigger_shipment: "不可触发发货",
    confirm_shipment: "不可确认发货",
  };
  const normalized = (Array.isArray(actions) ? actions : [])
    .map((action) => labels[action] || safeDashboardText(action, "禁用动作"))
    .filter(Boolean);
  return normalized.length ? normalized : ["不可发送", "不可审批", "不可报价"];
}

function normalizeWorkbenchTone(tone) {
  if (tone === "risk") return "danger";
  if (["info", "warning", "danger", "neutral"].includes(tone)) return tone;
  return "neutral";
}

function safeDashboardText(value, fallback) {
  const text = String(value ?? "").trim();
  return text && text !== "undefined" && text !== "null" ? text : fallback;
}

function renderWorkbenchCard(card) {
  return `
    <article class="workbench-card ${card.tone ? `workbench-card-${escapeHtml(card.tone)}` : ""}">
      <span>${escapeHtml(card.label)}</span>
      <div class="workbench-card-value">
        <strong>${escapeHtml(card.value)}</strong>
      </div>
      <span class="workbench-card-meter" style="--meter-width: ${getWorkbenchCardMeterWidth(card)}%;" aria-hidden="true"><i></i></span>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function getWorkbenchCardMeterWidth(card) {
  const numericValue = Number.parseInt(String(card?.value ?? "").replace(/[^\d]/g, ""), 10);
  if (Number.isFinite(numericValue)) {
    return Math.max(18, Math.min(92, numericValue * 12));
  }
  if (card?.tone === "danger") return 72;
  if (card?.tone === "warning") return 58;
  if (card?.tone === "info") return 48;
  return 36;
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

function renderDailyPriorityCard(item) {
  return `
    <article class="daily-priority-card">
      <div class="daily-priority-topline">
        <span class="workbench-category">${escapeHtml(item.title)}</span>
        <strong>${escapeHtml(item.count)}</strong>
      </div>
      <p>${escapeHtml(item.reason)}</p>
      <small>${escapeHtml(item.suggestion)}</small>
      <div class="daily-evidence-row" aria-label="来源置信度风险">
        ${badge(`来源：${item.source}`, "draft")}
        ${badge(`置信度：${item.confidence}`, "active")}
        ${badge(`风险：${item.risk}`, item.risk === "低" ? "approval" : "risk")}
      </div>
    </article>
  `;
}

function renderOperationsMetricCard(item) {
  return `
    <article class="operations-metric-card operations-metric-card-${escapeHtml(item.tone || "neutral")}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <small>${escapeHtml(item.note)}</small>
    </article>
  `;
}

function renderBottleneckPanel() {
  return `
    <div class="bottleneck-panel">
      ${dailyBottlenecks
        .map(
          (item) => `
            <article class="bottleneck-item">
              <span>${escapeHtml(item.severity)}</span>
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.detail)}</p>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAiRecommendationPanel() {
  return `
    <section class="ai-recommendation-panel" aria-label="AI 今日建议">
      <div class="workbench-section-header">
        <div>
          <h3>AI 建议今天先做</h3>
          <p>只展示建议顺序，不自动生成任务、不发送消息、不调用 AI。</p>
        </div>
        <span>需人工确认</span>
      </div>
      <ol>
        ${dailyRecommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </section>
  `;
}

function renderConversionFunnelPreview() {
  return `
    <section class="conversion-funnel-preview" aria-label="转化漏斗静态预览">
      <div class="workbench-section-header">
        <div>
          <h3>转化漏斗预览</h3>
          <p>开发线索到成交的静态结构预览，不展示伪造最终成交指标。</p>
        </div>
        <span>preview / demo</span>
      </div>
      <div class="funnel-step-row">
        ${dailyFunnelSteps
          .map(
            (step) => `
              <article class="funnel-step">
                <span>${escapeHtml(step.label)}</span>
                <strong>${escapeHtml(step.value)}</strong>
                <small>${escapeHtml(step.note)}</small>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCountryDistributionPreview() {
  return `
    <section class="country-distribution-preview" aria-label="客户国家分布静态预览">
      <div class="workbench-review-heading">
        <div>
          <h3>客户国家分布预览</h3>
          <p class="workbench-review-note">静态示例，不代表实时市场占比。</p>
        </div>
        ${badge("数据预览", "draft")}
      </div>
      <div class="country-bar-list">
        ${dailyCountryDistribution
          .map(
            (item) => `
              <div class="country-bar-row">
                <span>${escapeHtml(item.country)}</span>
                <i style="--country-width: ${Math.max(12, Math.min(100, item.value))}%"></i>
                <small>${escapeHtml(item.label)}</small>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderWorkbenchSafetyNote() {
  return `
    <section class="workbench-safety-note" aria-label="AI 今日工作台安全边界">
      <h3>安全边界</h3>
      <p>AI 今日工作台只提供建议和草稿，不自动发送、不自动报价、不自动创建客户、不自动修改业务数据。所有外部动作需要 Paul 确认。</p>
      <div class="disabled-chip-row">
        ${renderDisabledCapabilities(["不可发送", "不可报价", "不可创建客户", "不可自动发布", "不可下单", "不可触发付款 / 生产 / 发货"])}
      </div>
    </section>
  `;
}

function renderWorkbenchStaticReview(model = getDashboardWorkbenchViewModel()) {
  if (model.isLive) {
    const selected = model.selectedItem || workbenchQueueItems[0];
    const warningItems = model.warnings.length
      ? model.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")
      : "<li>无额外数据源警告</li>";
    return `
      <div class="workbench-review-heading">
        <div>
          <h3>只读复核预览</h3>
          <p class="workbench-review-note">实时只读记录：${escapeHtml(selected.title)}。</p>
        </div>
        ${badge("不执行动作", "pending")}
      </div>

      <dl class="workbench-review-list">
        <dt>摘要</dt>
        <dd>${escapeHtml(selected.meta)}</dd>
        <dt>推荐人工动作</dt>
        <dd>${escapeHtml(selected.recommendedAction)}</dd>
        <dt>技术说明</dt>
        <dd>实时只读汇总数据。当前不调用 AI、不执行助手、不写入数据库。</dd>
      </dl>

      <div class="workbench-review-group">
        <h4>风险 / 状态</h4>
        <ul class="check-list">
          ${selected.badges.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          ${warningItems}
        </ul>
      </div>

      <div class="workbench-review-group">
        <h4>禁用能力</h4>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(selected.disabledCapabilities)}
        </div>
      </div>
    `;
  }

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

function renderProspecting() {
  return `
    <div class="prospecting-preview" aria-label="AI 开发客户静态预览">
      <div class="prospecting-header">
        <div>
          <span class="state-label">AI Prospecting</span>
          <h3>AI 开发客户</h3>
          <p>AI Prospecting Center：基于目标市场或样本客户，发现相似潜在客户。当前为只读预览，不执行搜索、不抓取、不发送。</p>
        </div>
        <div class="prospecting-badges" aria-label="AI 开发客户预览状态">
          ${badge("只读预览", "draft")}
          ${badge("不自动搜索", "pending")}
          ${badge("不自动发送", "pending")}
          ${badge("人工复核", "approval")}
          ${badge("合规优先", "active")}
        </div>
      </div>

      <section class="prospecting-section" aria-label="开发模式预览">
        <div class="workbench-section-header">
          <div>
            <h3>开发模式</h3>
            <p>先把目标市场开发和相似客户发现拆成两个只读流程，不连接真实搜索或外联。</p>
          </div>
          <span>静态流程</span>
        </div>
        <div class="prospecting-grid">
          ${prospectingModeCards.map(renderProspectingModeCard).join("")}
        </div>
      </section>

      <div class="prospecting-layout">
        <section class="prospecting-section" aria-label="相似客户线索队列">
          <div class="workbench-section-header">
            <div>
              <h3>相似客户发现</h3>
              <p>候选线索仅为 demo 数据，分数只表示未来 AI 可解释评分方向。</p>
            </div>
            <span>3 条 demo 线索</span>
          </div>
          <div class="prospecting-lead-list">
            ${prospectingLeadCards.map(renderProspectingLeadCard).join("")}
          </div>
        </section>

        <aside class="ai-explain-panel" aria-label="AI 推荐理由">
          <div class="workbench-review-heading">
            <div>
              <h3>AI 为什么推荐</h3>
              <p class="workbench-review-note">固定示例：Panama Facade Contractor Demo 相似客户方向。</p>
            </div>
            ${badge("暂不执行动作", "pending")}
          </div>

          <dl class="prospecting-explain-list">
            <dt>匹配的样本特征</dt>
            <dd>幕墙工程商、门窗需求、商业建筑项目、拉美市场。</dd>
            <dt>相关产品</dt>
            <dd>铝合金门窗、curtain wall、facade system、轻钢龙骨和吊顶系统。</dd>
            <dt>缺失信息</dt>
            <dd>采购角色、进口能力、联系人合规来源、近期项目证据仍需人工确认。</dd>
            <dt>合规提醒</dt>
            <dd>AI 仅基于公开来源和样本画像生成相似客户建议。当前阶段不自动搜索、不保存真实线索、不发送开发信，所有线索必须人工复核。</dd>
          </dl>
        </aside>
      </div>

      <section class="prospecting-section prospecting-safety-panel" aria-label="合规安全预览">
        <div class="workbench-section-header">
          <div>
            <h3>合规 / 安全边界</h3>
            <p>开发客户必须先有公开来源、证据记录、人工复核和未来 opt-out / do-not-contact 机制。</p>
          </div>
          <span>合规优先</span>
        </div>
        <div class="prospecting-compliance-grid">
          ${prospectingSafetyItems.map((item) => `<span class="compliance-chip">${escapeHtml(item)}</span>`).join("")}
        </div>
      </section>

      <section class="prospecting-section" aria-label="未来开发流程">
        <div class="workbench-section-header">
          <div>
            <h3>未来工作流</h3>
            <p>从目标或样本进入 AI 画像，再进入来源证据、合规检查和人工复核；发送必须等未来审批链。</p>
          </div>
          <span>不执行</span>
        </div>
        <div class="workflow-stepper" aria-label="AI 开发客户未来流程">
          ${prospectingWorkflowSteps.map(renderProspectingWorkflowStep).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderProspectingModeCard(card) {
  return `
    <article class="prospecting-mode-card">
      <div>
        <h4>${escapeHtml(card.title)}</h4>
        <p>${escapeHtml(card.description)}</p>
      </div>
      <div class="prospecting-chip-row">
        ${card.chips.map((item) => `<span class="evidence-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
      <div class="prospecting-status-row" aria-label="${escapeHtml(card.title)}状态">
        ${card.status.map((item) => badge(item, item.includes("未") || item.includes("不") ? "pending" : "draft")).join("")}
      </div>
    </article>
  `;
}

function renderProspectingLeadCard(lead) {
  const evidenceHtml = renderChipList(lead.evidence, "evidence-chip");
  return `
    <article class="prospecting-lead-card">
      <div class="prospecting-lead-heading">
        <div>
          <span class="workbench-category">${escapeHtml(lead.region)}</span>
          <h4>${escapeHtml(lead.company)}</h4>
          <small>${escapeHtml(lead.productFit)}</small>
        </div>
        <span class="lead-score" aria-label="相似度 ${escapeHtml(lead.score)}">相似度 ${escapeHtml(lead.score)}</span>
      </div>
      <div class="prospecting-lead-meta">
        ${badge(`风险：${lead.risk}`, lead.riskTone)}
        <span>来源证据：${evidenceHtml}</span>
      </div>
      <p><strong>人工下一步：</strong>${escapeHtml(lead.nextStep)}</p>
      <div class="disabled-chip-row" aria-label="禁用能力">
        ${renderDisabledCapabilities(["不可自动搜索", "不可自动发送", "不可创建客户", "不可生成报价"])}
      </div>
    </article>
  `;
}

function renderProspectingWorkflowStep(step, index) {
  return `
    <div class="workflow-step">
      <span>${index + 1}</span>
      <strong>${escapeHtml(step)}</strong>
    </div>
  `;
}

function renderProspectingReview() {
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 开发客户只读边界</h3>
        <ul class="check-list">
          <li>静态预览，不调用搜索 API，不抓取网页，不解析文件</li>
          <li>不自动发送 Email / WhatsApp，不创建客户，不创建任务</li>
          <li>不生成报价、PI、订单，不触发付款 / 生产 / 发货</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>样本客户方向</h3>
        <dl>
          <dt>样本客户</dt>
          <dd>Panama Facade Contractor Demo</dd>
          <dt>样本来源</dt>
          <dd>官网 URL / 询盘文本 / 产品照片 / PDF 资料（未来输入类型，仅预览）</dd>
          <dt>相似客户方向</dt>
          <dd>同区域工程公司、建材进口商、门窗分销商</dd>
          <dt>人工复核</dt>
          <dd>必须确认来源、公司类型、产品匹配和合规边界后才能进入任何后续流程。</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>禁用能力</h3>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(["不可抓取 LinkedIn", "不可绕过登录", "不可采集私人联系方式", "不可发送开发信", "不可创建客户", "不可生成报价"])}
        </div>
      </div>
    </div>
  `;
}

function customerVerificationStatusLabel() {
  if (customerVerificationApiState.status === "loading") return "正在加载只读数据";
  if (customerVerificationApiState.status === "loaded") return "实时只读数据";
  if (customerVerificationApiState.status === "empty") return "暂无实时记录，显示静态预览";
  if (customerVerificationApiState.status === "error") return "API 暂不可用，显示静态预览";
  return fallbackLabel;
}

function getCustomerVerificationViewModel() {
  const fallback = fallbackCustomerVerificationApiData();
  const isLive = customerVerificationApiState.status === "loaded" && customerVerificationApiState.source === "api";
  const summary = customerVerificationApiState.summary || fallback.summary;
  const requests = customerVerificationApiState.requests.length ? customerVerificationApiState.requests : fallback.requests;
  const evidence = customerVerificationApiState.evidence.length ? customerVerificationApiState.evidence : fallback.evidence;
  const scores = customerVerificationApiState.scores.length ? customerVerificationApiState.scores : fallback.scores;
  const duplicateMatches = customerVerificationApiState.duplicateMatches.length
    ? customerVerificationApiState.duplicateMatches
    : fallback.duplicateMatches;
  const reviewQueue = customerVerificationApiState.reviewQueue.length ? customerVerificationApiState.reviewQueue : fallback.reviewQueue;
  const reviews = customerVerificationApiState.reviews.length ? customerVerificationApiState.reviews : fallback.reviews;
  const selectedQueueItem = reviewQueue[0] || {};
  const selectedRequest = requests.find((record) => record.id === selectedQueueItem.id) || requests[0] || {};
  const selectedScore = scores.find((record) => record.verification_request_id === selectedRequest.id) || {};
  const selectedReview = reviews.find((record) => record.verification_request_id === selectedRequest.id) || {};
  const selectedEvidence = evidence.filter((record) => record.verification_request_id === selectedRequest.id);
  const selectedDuplicates = duplicateMatches.filter((record) => record.verification_request_id === selectedRequest.id);

  return {
    isLive,
    statusLabel: customerVerificationStatusLabel(),
    summary,
    requests,
    evidence,
    scores,
    duplicateMatches,
    reviewQueue,
    reviews,
    selectedRequest,
    selectedScore,
    selectedReview,
    selectedEvidence,
    selectedDuplicates,
  };
}

function customerVerificationSummaryCardsFromModel(model) {
  const summary = model.summary || {};
  const highConfidence = model.scores.filter(
    (record) => record.confidence_level === "high" || Number(record.credibility_score) >= 70
  ).length;
  return [
    {
      label: "待验证客户",
      value: String(summary.pending_requests ?? summary.total_requests ?? model.requests.length),
      subtitle: "公司、邮箱或角色仍需人工确认",
      tone: "info",
    },
    {
      label: "高可信客户",
      value: String(summary.verified_requests ?? highConfidence),
      subtitle: "资料较完整，仍需人工确认",
      tone: "active",
    },
    {
      label: "需补充信息",
      value: String(summary.needs_more_info ?? 0),
      subtitle: "缺网站、项目、数量或买家角色",
      tone: "warning",
    },
    {
      label: "疑似重复",
      value: String(summary.possible_duplicates ?? model.duplicateMatches.length),
      subtitle: "公司名或联系人可能已存在",
      tone: "warning",
    },
    {
      label: "高风险线索",
      value: String(summary.risky_requests ?? 0),
      subtitle: "身份或需求存在明显矛盾",
      tone: "danger",
    },
    {
      label: "建议跟进",
      value: String(summary.high_priority_followups ?? 0),
      subtitle: "可人工索取公司和项目资料",
      tone: "active",
    },
  ];
}

function customerVerificationStatusText(status) {
  const statusMap = {
    confirmed: "通过",
    likely: "需确认",
    needs_review: "需确认",
    missing: "缺失",
    conflict: "风险",
    not_checked: "未查询",
  };
  return statusMap[status] || "需确认";
}

function customerVerificationChecklistFromModel(model) {
  const evidenceItems = model.selectedEvidence.map((record) => ({
    item: safeDashboardText(record.evidence_label || record.evidence_type, "验证证据"),
    status: customerVerificationStatusText(record.evidence_status),
    detail: safeDashboardText(
      [record.evidence_value, record.notes].filter(Boolean).join("。"),
      "需要人工复核该证据，不自动判断客户身份。"
    ),
  }));
  return evidenceItems.length ? evidenceItems : customerVerificationChecklist;
}

function customerVerificationDuplicateRowsFromModel(model) {
  if (!model.selectedDuplicates.length) {
    return [
      ["Same email", "not found / not checked"],
      ["Same company", model.selectedRequest.company_name ? "not checked" : "company missing"],
      ["Same phone", model.selectedRequest.phone ? "not checked" : "not available"],
      ["Same website", model.selectedRequest.website ? "not checked" : "not available"],
      ["Existing customer match", "needs review"],
    ];
  }
  return model.selectedDuplicates.map((record) => [
    safeDashboardText(record.match_type || record.matched_entity_type, "matched entity"),
    `${safeDashboardText(record.matched_label, "需要人工确认")} / confidence ${safeDashboardText(record.match_confidence, "—")}`,
  ]);
}

function customerVerificationRiskSignalsFromModel(model, level) {
  const records = model.selectedEvidence.filter((record) => record.risk_level === level);
  return records.length
    ? records.map((record) => safeDashboardText(record.evidence_label || record.evidence_type || record.notes, "验证信号"))
    : level === "low"
    ? customerVerificationLowRiskSignals
    : level === "high"
    ? customerVerificationHighRiskSignals
    : customerVerificationNeedConfirmSignals;
}

function renderCustomerVerification() {
  const model = getCustomerVerificationViewModel();
  const selectedRequest = model.selectedRequest;
  const selectedScore = model.selectedScore;
  const selectedReview = model.selectedReview;
  const sourceNote = model.isLive
    ? "已连接 admin-read 只读数据。所有判断仍需人工确认。"
    : "显示静态预览 fallback；可能是尚未登录、接口未部署或数据表未执行。";
  const statusNotice =
    customerVerificationApiState.status === "loading"
      ? renderDataStatus("loading", "AI 客户验证数据加载中", "正在请求 admin-read 只读数据。")
      : customerVerificationApiState.status === "error"
      ? renderDataStatus("error", "AI 客户验证 API 暂不可用", `${apiUnavailableMessage} 显示静态预览 fallback。系统提示：${customerVerificationApiState.error}`)
      : customerVerificationApiState.status === "empty"
      ? renderDataStatus("empty", "暂无 AI 客户验证实时记录", "显示静态预览 fallback，避免空白页面。")
      : customerVerificationApiState.status === "loaded"
      ? renderDataStatus("success", "AI 客户验证已连接只读数据", "当前数据来自 /api/admin-read/customer-verification-*，仍然不执行任何动作。")
      : "";

  return `
    <div class="customer-verification-preview" aria-label="AI 客户验证中心只读预览">
      <div class="customer-verification-hero">
        <div>
          <span class="state-label">AI Customer Verification Center</span>
          <h3>AI 客户验证中心</h3>
          <p>用于在正式跟进前，对客户身份、公司信息、联系方式、询盘可信度、重复风险和跟进价值进行 AI 辅助判断。当前为只读数据预览，不联网、不自动查询、不自动创建客户、不自动发送。</p>
        </div>
        <div class="verification-badge-row" aria-label="AI 客户验证预览状态">
          ${badge(model.statusLabel, model.isLive ? "active" : "draft")}
          ${badge("只读", "draft")}
          ${badge("不自动查询", "pending")}
          ${badge("不自动创建客户", "pending")}
          ${badge("不自动发送", "pending")}
          ${badge("需人工确认", "approval")}
        </div>
      </div>
      ${statusNotice}

      <section class="verification-section" aria-label="客户验证概览">
        <div class="workbench-section-header">
          <div>
            <h3>验证概览</h3>
            <p>${escapeHtml(sourceNote)}</p>
          </div>
          <span>${escapeHtml(model.statusLabel)}</span>
        </div>
        <div class="verification-summary-grid">
          ${customerVerificationSummaryCardsFromModel(model).map(renderCustomerVerificationSummaryCard).join("")}
        </div>
      </section>

      <div class="verification-layout">
        <section class="verification-profile-card" aria-label="客户验证档案示例">
          <div class="workbench-section-header">
            <div>
              <h3>${escapeHtml(safeDashboardText(selectedRequest.customer_name, "客户验证档案"))}</h3>
              <p>${escapeHtml(safeDashboardText(selectedReview.decision_reason || selectedScore.score_explanation, "所有字段只用于只读复核，不自动确认客户。"))}</p>
            </div>
            <span>${escapeHtml(safeDashboardText(selectedRequest.verification_status, "needs_review"))}</span>
          </div>
          <dl class="verification-profile-list">
            <dt>Customer</dt>
            <dd>${escapeHtml(safeDashboardText(selectedRequest.customer_name, "需要人工确认"))}</dd>
            <dt>Company</dt>
            <dd>${escapeHtml(safeDashboardText(selectedRequest.company_name, "需要人工确认"))}</dd>
            <dt>Country</dt>
            <dd>${escapeHtml(safeDashboardText(selectedRequest.country, "需要人工确认"))}</dd>
            <dt>Email</dt>
            <dd>${escapeHtml(safeDashboardText(selectedRequest.email, "—"))}</dd>
            <dt>Website</dt>
            <dd>${escapeHtml(safeDashboardText(selectedRequest.website, "—"))}</dd>
            <dt>Source</dt>
            <dd>${escapeHtml(safeDashboardText(selectedRequest.source_type, "manual_entry"))}</dd>
            <dt>Interest</dt>
            <dd>${escapeHtml(safeDashboardText(model.selectedEvidence.find((record) => record.evidence_type === "product_interest" || record.evidence_type === "inquiry_content")?.evidence_value, "需要人工确认"))}</dd>
            <dt>Status</dt>
            <dd>${escapeHtml(safeDashboardText(selectedRequest.verification_status, "needs_review"))}</dd>
            <dt>Confidence</dt>
            <dd>${escapeHtml(safeDashboardText(selectedScore.confidence_level, "medium"))}</dd>
            <dt>Risk</dt>
            <dd>${escapeHtml(safeDashboardText(selectedScore.risk_level, "medium"))}</dd>
          </dl>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(["不可自动创建客户", "不可修改客户", "不可发送", "不可报价"])}
          </div>
        </section>

        <aside class="verification-type-panel" aria-label="客户类型推测">
          <div class="workbench-review-heading">
            <div>
              <h3>客户类型推测</h3>
              <p class="workbench-review-note">AI 建议仅作为人工复核材料，不是最终身份判断。</p>
            </div>
            ${badge(`Confidence: ${safeDashboardText(selectedScore.confidence_level, "medium")}`, "draft")}
          </div>
          <div class="verification-type-highlight">
            <span>Primary guess</span>
            <strong>${escapeHtml(safeDashboardText(selectedRequest.source_type, "manual_entry"))}</strong>
            <small>${escapeHtml(safeDashboardText(selectedRequest.company_name, "Secondary possibility needs review"))}</small>
          </div>
          <p class="verification-reason">Reason: ${escapeHtml(safeDashboardText(selectedScore.score_explanation, "Company identity and product interest require manual evidence review."))}</p>
          <div class="verification-type-grid">
            ${customerVerificationTypeOptions.map(renderCustomerVerificationTypeOption).join("")}
          </div>
        </aside>
      </div>

      <section class="verification-section" aria-label="AI 验证清单">
        <div class="workbench-section-header">
          <div>
            <h3>AI 验证清单</h3>
            <p>状态 chip 来自只读证据或 fallback；未查询表示当前没有联网或真实查重结论。</p>
          </div>
          <span>只读 evidence</span>
        </div>
        <div class="verification-checklist-grid">
          ${customerVerificationChecklistFromModel(model).map(renderCustomerVerificationChecklistItem).join("")}
        </div>
      </section>

      <div class="verification-two-column">
        <section class="verification-duplicate-panel" aria-label="重复风险预览">
          <div class="workbench-section-header">
            <div>
              <h3>重复风险</h3>
              <p>只读查重结构预览。当前不合并客户、不写入数据。</p>
            </div>
            <span>${escapeHtml(model.selectedDuplicates.length ? "needs review" : "not checked")}</span>
          </div>
          <dl class="verification-mini-list">
            ${customerVerificationDuplicateRowsFromModel(model).map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
          </dl>
        </section>

        <section class="verification-risk-panel" aria-label="风险信号预览">
          <div class="workbench-section-header">
            <div>
            <h3>风险信号</h3>
            <p>用于提醒 Paul 复核，不自动拦截、不自动放行、不创建任务。</p>
          </div>
          <span>人工判断</span>
        </div>
          ${renderCustomerVerificationSignalGroup("Low-risk signals", customerVerificationRiskSignalsFromModel(model, "low"), "safe")}
          ${renderCustomerVerificationSignalGroup("Need-confirmation signals", customerVerificationRiskSignalsFromModel(model, "medium"), "warning")}
          ${renderCustomerVerificationSignalGroup("High-risk signals", customerVerificationRiskSignalsFromModel(model, "high"), "danger")}
        </section>
      </div>

      <div class="verification-two-column">
        <section class="verification-action-panel" aria-label="建议下一步">
          <div class="workbench-section-header">
            <div>
              <h3>推荐人工动作</h3>
          <p>${escapeHtml(safeDashboardText(selectedReview.decision_reason, "先补充公司和项目资料，再决定是否进入跟进或报价准备。"))}</p>
            </div>
            <span>${escapeHtml(safeDashboardText(selectedReview.review_status, "pending"))}</span>
          </div>
          <p class="verification-recommendation">Suggested next step: ${escapeHtml(safeDashboardText(selectedReview.next_action, "Request company website, project location, product specifications, expected quantity, and buyer role before formal quotation."))}</p>
          <div class="verification-draft-box">
            <span>English draft preview</span>
            <p>Thank you for your inquiry. Before preparing a suitable proposal, could you please share your company website, project location, required specifications, and estimated quantity?</p>
          </div>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(["Draft only", "Not sent", "Human approval required"])}
          </div>
        </section>

        <section class="verification-action-panel" aria-label="禁用决策选项">
          <div class="workbench-section-header">
            <div>
              <h3>验证决策预览</h3>
              <p>这些是未来审批后的人工决策方向；当前全部禁用、不可点击、不会写入。</p>
            </div>
            <span>禁用</span>
          </div>
          <div class="verification-decision-grid">
            ${customerVerificationDisabledDecisions.map((item) => `<span class="verification-decision-chip">${escapeHtml(item)}</span>`).join("")}
          </div>
        </section>
      </div>

      <section class="verification-safety-panel" aria-label="客户验证安全边界">
        <div class="workbench-section-header">
          <div>
            <h3>安全边界</h3>
            <p>客户验证只能帮助判断下一步复核方向，不能代替 Paul 的商业判断。</p>
          </div>
          <span>Human approval</span>
        </div>
        <div class="verification-safety-grid">
          ${customerVerificationSafetyItems.map((item) => `<span class="verification-safety-chip">${escapeHtml(item)}</span>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCustomerVerificationSummaryCard(card) {
  return `
    <article class="verification-summary-card verification-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderCustomerVerificationChecklistItem(item) {
  return `
    <article class="verification-check-item">
      <div>
        <h4>${escapeHtml(item.item)}</h4>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      ${verificationStatusChip(item.status)}
    </article>
  `;
}

function renderCustomerVerificationTypeOption(option) {
  return `
    <div class="verification-type-option">
      <span>${escapeHtml(option.label)}</span>
      <small>${escapeHtml(option.status)}</small>
    </div>
  `;
}

function renderCustomerVerificationSignalGroup(title, items, tone) {
  return `
    <div class="verification-signal-group verification-signal-${escapeHtml(tone)}">
      <h4>${escapeHtml(title)}</h4>
      <div class="verification-chip-row">
        ${items.map((item) => `<span class="verification-signal-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
}

function verificationStatusChip(status) {
  const toneMap = {
    通过: "pass",
    需确认: "confirm",
    缺失: "missing",
    风险: "risk",
    未查询: "unknown",
  };
  const tone = toneMap[status] || "unknown";
  return `<span class="verification-status-chip verification-status-${tone}">${escapeHtml(status)}</span>`;
}

function renderCustomerVerificationReview() {
  const model = getCustomerVerificationViewModel();
  const selectedRequest = model.selectedRequest;
  const selectedScore = model.selectedScore;
  const selectedReview = model.selectedReview;
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 客户验证只读边界</h3>
        <ul class="check-list">
          <li>静态预览，不联网查询，不搜索，不抓取网页，不调用 AI provider</li>
          <li>不创建客户、不修改客户资料、不写入数据库、不创建任务</li>
          <li>不发送 Email / WhatsApp，不群发开发信，不自动判断客户可信度</li>
          <li>不生成正式报价、PI、订单，不触发付款 / 生产 / 发货</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>当前复核样本</h3>
        <dl>
          <dt>联系人</dt>
          <dd>${escapeHtml(safeDashboardText(selectedRequest.customer_name, "需要人工确认"))}</dd>
          <dt>公司</dt>
          <dd>${escapeHtml(safeDashboardText(selectedRequest.company_name, "需要人工确认"))}</dd>
          <dt>推测类型</dt>
          <dd>${escapeHtml(safeDashboardText(selectedRequest.source_type, "manual_entry"))}</dd>
          <dt>评分</dt>
          <dd>credibility ${escapeHtml(safeDashboardText(selectedScore.credibility_score, "—"))} / duplicate ${escapeHtml(safeDashboardText(selectedScore.duplicate_score, "—"))}</dd>
          <dt>建议动作</dt>
          <dd>${escapeHtml(safeDashboardText(selectedReview.next_action, "先索取公司网站、项目位置、规格、数量和买家角色，再由 Paul 决定是否跟进。"))}</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>禁用能力</h3>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(["不可自动查询", "不可自动创建客户", "不可修改客户", "不可发送消息", "不可生成报价", "不可确认订单"])}
        </div>
      </div>
    </div>
  `;
}

const followupAssistantSummaryCards = [
  { label: "今日建议跟进", value: "7", subtitle: "静态 DEMO 候选，等待人工判断", tone: "active" },
  { label: "需补充信息", value: "5", subtitle: "规格、数量、角色或项目资料缺失", tone: "warning" },
  { label: "报价后待回复", value: "3", subtitle: "建议 2-3 个工作日后温和跟进", tone: "info" },
  { label: "高优先级客户", value: "2", subtitle: "项目明确，适合尽快人工复核", tone: "active" },
  { label: "风险/暂缓", value: "2", subtitle: "重复、身份不清或风险信号待确认", tone: "danger" },
  { label: "草稿消息", value: "4", subtitle: "仅草稿，未发送，需 Paul 确认", tone: "neutral" },
];

const followupAssistantCandidates = [
  {
    customerName: "Carlos Ramirez",
    company: "DEMO Facade Solutions",
    country: "Peru",
    source: "customer_verification",
    currentStage: "information_request",
    stageLabel: "资料补充",
    productInterest: "Aluminum window and facade profiles",
    lastInteraction: "客户询问铝合金窗项目方案，但尚未提供项目位置、规格、数量和买家角色。",
    reason: "Missing project location and specifications",
    priority: "High",
    risk: "Medium",
    confidence: "Medium-high",
    suggestedTiming: "within 24 hours",
    suggestedLanguage: "English",
    alternativeLanguage: "Spanish",
    channel: "Email / WhatsApp",
    tone: "professional, concise",
    recommendedAction: "Request project location, required specifications, estimated quantity, and buyer role before preparing formal quotation.",
    actionReason: "报价前缺少关键项目资料，直接报价可能造成价格、规格和交期误判。",
    riskNotes: "不要承诺价格、交期或供应能力；先确认项目和身份。",
    missingInformation: [
      ["company website", "needs_review"],
      ["project location", "missing"],
      ["product specification", "missing"],
      ["quantity", "missing"],
      ["buyer role", "missing"],
      ["drawings/photos", "needs_review"],
      ["delivery port", "not_required"],
      ["expected timeline", "needs_review"],
    ],
    draftSubject: "Project details for your aluminum window inquiry",
    draftBody: `Dear Carlos,\n\nThank you for your inquiry. Before preparing a suitable proposal, could you please share the project location, required window specifications, estimated quantity, and your role in the project?\n\nThis will help us prepare a more accurate recommendation and quotation.\n\nBest regards,\nPaul`,
  },
  {
    customerName: "Maria Gonzalez",
    company: "DEMO Construction Importers",
    country: "Panama",
    source: "customer_verification_duplicate",
    currentStage: "possible_duplicate_review",
    stageLabel: "重复风险复核",
    productInterest: "Curtain wall accessories and aluminum profiles",
    lastInteraction: "系统提示该公司名称和国家与既有客户资料相似，跟进前需要确认是否为同一买家或关联公司。",
    reason: "Possible duplicate customer, needs review before follow-up",
    priority: "Medium",
    risk: "Medium",
    confidence: "Medium",
    suggestedTiming: "after duplicate review",
    suggestedLanguage: "English",
    alternativeLanguage: "Spanish",
    channel: "Email",
    tone: "professional, careful",
    recommendedAction: "Review duplicate evidence before using previous customer context or preparing any follow-up draft.",
    actionReason: "重复关系未确认前，不应混用历史报价、联系人或客户状态。",
    riskNotes: "不自动合并客户，不自动归档，不用重复关系对外沟通。",
    missingInformation: [
      ["company website", "needs_review"],
      ["project location", "confirmed"],
      ["product specification", "needs_review"],
      ["quantity", "needs_review"],
      ["buyer role", "missing"],
      ["drawings/photos", "not_required"],
      ["delivery port", "needs_review"],
      ["expected timeline", "missing"],
    ],
    draftSubject: "Confirming project details before next step",
    draftBody: `Dear Maria,\n\nThank you for your message. Before we prepare the next step, could you please confirm your company website, project role, and the required product specifications?\n\nThis will help us avoid duplicated records and make sure we respond with the correct project context.\n\nBest regards,\nPaul`,
  },
  {
    customerName: "Daniel Wong",
    company: "DEMO Building Materials Asia",
    country: "Indonesia",
    source: "business_card",
    currentStage: "dormant / prospecting_lead",
    stageLabel: "低频线索澄清",
    productInterest: "Ceiling system profiles",
    lastInteraction: "来自名片或展会线索，缺少公司网站、买家角色和明确项目需求。",
    reason: "Need company website and buyer role",
    priority: "Low-medium",
    risk: "Medium",
    confidence: "Low-medium",
    suggestedTiming: "wait for clarification",
    suggestedLanguage: "English",
    alternativeLanguage: "Chinese",
    channel: "WhatsApp / Email",
    tone: "friendly, brief",
    recommendedAction: "Ask for company website, buyer role, and current project need before adding to active follow-up queue.",
    actionReason: "线索价值和身份都不清楚，应该先轻量确认，不进入报价或任务执行。",
    riskNotes: "不要发送强销售话术，不要承诺报价或样品。",
    missingInformation: [
      ["company website", "missing"],
      ["project location", "missing"],
      ["product specification", "needs_review"],
      ["quantity", "missing"],
      ["buyer role", "missing"],
      ["drawings/photos", "not_required"],
      ["delivery port", "not_required"],
      ["expected timeline", "missing"],
    ],
    draftSubject: "Quick confirmation about your building materials interest",
    draftBody: `Hello Daniel,\n\nNice to connect with you. Could you please share your company website and your role in current building materials projects?\n\nIf you have an active aluminum or ceiling profile requirement, you may also send the basic specifications for our review.\n\nBest regards,\nPaul`,
  },
];

const followupAssistantSafetyItems = [
  "不自动发送邮件/WhatsApp",
  "不自动创建正式任务",
  "不自动修改客户状态",
  "不生成正式报价",
  "不创建 PI / 订单 / 付款 / 生产 / 发货动作",
  "所有外部沟通必须 Paul 人工确认",
];

const followupAssistantDecisions = [
  "Approve follow-up task",
  "Revise message",
  "Request more context",
  "Hold due to risk",
  "Skip",
  "Archive",
];

function renderFollowupAssistant() {
  const model = getFollowupAssistantViewModel();
  const selected = model.selectedCandidate;
  return `
    <div class="followup-assistant-preview" aria-label="AI 跟进助手只读数据预览">
      <div class="followup-hero">
        <div>
          <span class="state-label">${escapeHtml(model.sourceLabel)}</span>
          <h3>AI 跟进助手</h3>
          <p>${escapeHtml(model.headerCopy)}</p>
        </div>
        <div class="followup-badge-row" aria-label="AI 跟进助手状态">
          ${badge(model.isLive ? "实时只读" : "Fallback 预览", "draft")}
          ${badge("AI 建议", "active")}
          ${badge("草稿", "draft")}
          ${badge("未发送", "pending")}
          ${badge("需人工确认", "approval")}
          ${badge("不自动执行", "pending")}
        </div>
      </div>

      <section class="followup-section" aria-label="跟进概览">
        <div class="workbench-section-header">
          <div>
            <h3>跟进概览</h3>
            <p>展示跟进候选、缺失信息、草稿和复核状态；所有动作仍为只读展示。</p>
          </div>
          <span>${escapeHtml(model.sourceLabel)}</span>
        </div>
        <div class="followup-summary-grid">
          ${model.summaryCards.map(renderFollowupSummaryCard).join("")}
        </div>
      </section>

      <div class="followup-layout">
        <section class="followup-candidate-list" aria-label="跟进候选列表">
          <div class="workbench-section-header">
            <div>
              <h3>建议跟进队列</h3>
              <p>队列项不可点击，不创建任务；仅展示 AI 建议和 Paul 复核所需信息。</p>
            </div>
            <span>${escapeHtml(model.queueCountLabel)}</span>
          </div>
          ${model.candidates.map(renderFollowupCandidateCard).join("")}
        </section>

        <aside class="followup-detail-panel" aria-label="选中候选详情">
          <div class="workbench-review-heading">
            <div>
              <h3>选中候选详情</h3>
              <p class="workbench-review-note">固定展示第一条只读候选。当前没有点击选择行为。</p>
            </div>
            ${badge("需人工确认", "approval")}
          </div>
          ${renderFollowupCandidateDetails(selected)}
        </aside>
      </div>

      <div class="followup-two-column">
        <section class="followup-action-panel" aria-label="推荐下一步">
          <div class="workbench-section-header">
            <div>
              <h3>AI 建议下一步</h3>
              <p>建议只作为 Paul 复核材料，不代表系统已经执行或准备外发。</p>
            </div>
            <span>${escapeHtml(selected.confidence)}</span>
          </div>
          <dl class="followup-meta-list">
            <dt>recommended action</dt>
            <dd>${escapeHtml(selected.recommendedAction)}</dd>
            <dt>reason</dt>
            <dd>${escapeHtml(selected.actionReason)}</dd>
            <dt>timing</dt>
            <dd>${escapeHtml(selected.suggestedTiming)}</dd>
            <dt>risk notes</dt>
            <dd>${escapeHtml(selected.riskNotes)}</dd>
            <dt>confidence</dt>
            <dd>${escapeHtml(selected.confidence)}</dd>
          </dl>
        </section>

        <section class="followup-draft-panel" aria-label="草稿消息预览">
          <div class="workbench-section-header">
            <div>
              <h3>消息草稿预览</h3>
              <p>Draft only. Not sent. Human approval required.</p>
            </div>
            <span>${escapeHtml(selected.draftStatus || "draft")}</span>
          </div>
          <div class="followup-draft-box">
            <span>Subject: ${escapeHtml(selected.draftSubject)}</span>
            <pre>${escapeHtml(selected.draftBody)}</pre>
          </div>
          <div class="followup-chip-row">
            ${renderChipList(["Draft only", "Not sent", "Human approval required"], "followup-draft-chip")}
          </div>
        </section>
      </div>

      <div class="followup-two-column">
        <section class="followup-channel-panel" aria-label="渠道语言语气建议">
          <div class="workbench-section-header">
            <div>
              <h3>语言 / 渠道 / 语气</h3>
              <p>仅显示建议，不连接 Email、WhatsApp、LinkedIn 或任何外部渠道。</p>
            </div>
            <span>no automatic send</span>
          </div>
          <dl class="followup-meta-list">
            <dt>suggested language</dt>
            <dd>${escapeHtml(selected.suggestedLanguage)}</dd>
            <dt>alternative</dt>
            <dd>${escapeHtml(selected.alternativeLanguage)}</dd>
            <dt>channel</dt>
            <dd>${escapeHtml(selected.channel)}</dd>
            <dt>tone</dt>
            <dd>${escapeHtml(selected.tone)}</dd>
          </dl>
        </section>

        <section class="followup-review-panel" aria-label="人工复核决策预览">
          <div class="workbench-section-header">
            <div>
              <h3>复核决策预览</h3>
              <p>以下选项全部禁用、不可点击、不会创建任务或写入数据。</p>
            </div>
            <span>disabled</span>
          </div>
          <div class="followup-decision-grid">
            ${followupAssistantDecisions.map((item) => `<span class="followup-decision-chip">${escapeHtml(item)}</span>`).join("")}
          </div>
        </section>
      </div>

      <section class="followup-safety-panel" aria-label="AI 跟进助手安全边界">
        <div class="workbench-section-header">
          <div>
            <h3>安全边界</h3>
            <p>所有外部沟通和客户状态变化都必须由 Paul 人工确认。当前模块只展示建议和草稿。</p>
          </div>
          <span>Human approval</span>
        </div>
        <div class="followup-safety-grid">
          ${followupAssistantSafetyItems.map((item) => `<span class="followup-safety-chip">${escapeHtml(item)}</span>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderFollowupSummaryCard(card) {
  return `
    <article class="followup-summary-card followup-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderFollowupCandidateCard(candidate, index) {
  const isSelected = index === 0;
  return `
    <article class="followup-candidate-card ${isSelected ? "followup-candidate-selected" : ""}" aria-label="${escapeHtml(candidate.customerName)} 跟进候选">
      <div class="followup-candidate-heading">
        <div>
          <h4>${escapeHtml(candidate.customerName)}</h4>
          <p>${escapeHtml(candidate.company)} / ${escapeHtml(candidate.country)}</p>
        </div>
        <span>${escapeHtml(candidate.stageLabel)}</span>
      </div>
      <p class="followup-candidate-reason">${escapeHtml(candidate.reason)}</p>
      <div class="followup-chip-row">
        ${renderChipList([`Priority: ${candidate.priority}`, `Risk: ${candidate.risk}`, `Timing: ${candidate.suggestedTiming}`], "followup-status-chip")}
      </div>
    </article>
  `;
}

function renderFollowupCandidateDetails(candidate) {
  return `
    <dl class="followup-meta-list">
      <dt>customer name</dt>
      <dd>${escapeHtml(candidate.customerName)}</dd>
      <dt>company</dt>
      <dd>${escapeHtml(candidate.company)}</dd>
      <dt>country</dt>
      <dd>${escapeHtml(candidate.country)}</dd>
      <dt>source</dt>
      <dd>${escapeHtml(candidate.source)}</dd>
      <dt>current stage</dt>
      <dd>${escapeHtml(candidate.currentStage)}</dd>
      <dt>product interest</dt>
      <dd>${escapeHtml(candidate.productInterest)}</dd>
      <dt>last interaction</dt>
      <dd>${escapeHtml(candidate.lastInteraction)}</dd>
      <dt>duplicate status</dt>
      <dd>${escapeHtml(candidate.currentStage.includes("duplicate") ? "needs_review" : "not_checked")}</dd>
      <dt>priority</dt>
      <dd>${escapeHtml(candidate.priority)}</dd>
      <dt>risk</dt>
      <dd>${escapeHtml(candidate.risk)}</dd>
      <dt>confidence</dt>
      <dd>${escapeHtml(candidate.confidence)}</dd>
    </dl>
    <div class="followup-missing-info-grid" aria-label="缺失信息清单">
      ${candidate.missingInformation.map(renderFollowupMissingInfoItem).join("")}
    </div>
  `;
}

function renderFollowupMissingInfoItem([label, status]) {
  return `
    <div class="followup-missing-info-item">
      <span>${escapeHtml(label)}</span>
      <small class="followup-info-status followup-info-${escapeHtml(status)}">${escapeHtml(status)}</small>
    </div>
  `;
}

function renderFollowupAssistantReview() {
  const model = getFollowupAssistantViewModel();
  const selected = model.selectedCandidate;
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 跟进助手只读边界</h3>
        <ul class="check-list">
          <li>${escapeHtml(model.sourceLabel)}，不调用 AI provider，不连接 Email / WhatsApp / LinkedIn</li>
          <li>不自动创建任务、不创建定时提醒、不写入客户或询盘状态</li>
          <li>不发送消息，不生成报价、PI、订单，不触发付款 / 生产 / 发货</li>
          <li>所有外部沟通必须 Paul 人工确认后才可执行</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>当前复核样本</h3>
        <dl>
          <dt>候选客户</dt>
          <dd>${escapeHtml(selected.customerName)} / ${escapeHtml(selected.company)}</dd>
          <dt>建议动作</dt>
          <dd>${escapeHtml(selected.recommendedAction)}</dd>
          <dt>草稿状态</dt>
          <dd>${escapeHtml(selected.draftStatus || "Draft only")} / Not sent / Human approval required</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>禁用能力</h3>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(["不可自动发送", "不可创建任务", "不可修改客户", "不可修改询盘", "不可报价", "不可创建 PI / 订单 / 付款 / 生产 / 发货"])}
        </div>
      </div>
    </div>
  `;
}

function getFollowupAssistantViewModel() {
  const fallback = fallbackFollowupAssistantApiData();
  const isLive = followupAssistantApiState.status === "loaded" && followupAssistantApiState.source === "api";
  const isLoading = followupAssistantApiState.status === "loading";
  const summary = followupAssistantApiState.summary || fallback.summary;
  const candidates = followupAssistantApiState.candidates.length ? followupAssistantApiState.candidates : fallback.candidates;
  const missingInformation = followupAssistantApiState.missingInformation.length
    ? followupAssistantApiState.missingInformation
    : fallback.missingInformation;
  const recommendations = followupAssistantApiState.recommendations.length ? followupAssistantApiState.recommendations : fallback.recommendations;
  const messageDrafts = followupAssistantApiState.messageDrafts.length ? followupAssistantApiState.messageDrafts : fallback.messageDrafts;
  const reviewQueue = followupAssistantApiState.reviewQueue.length ? followupAssistantApiState.reviewQueue : fallback.reviewQueue;
  const reviews = followupAssistantApiState.reviews.length ? followupAssistantApiState.reviews : fallback.reviews;
  const selectedCandidate = candidates[0] || fallback.candidates[0];
  const sourceLabel = isLive ? "实时只读数据" : followupAssistantApiState.status === "loading" ? "正在读取 admin-read 数据" : fallbackLabel;

  return {
    isLive,
    isLoading,
    sourceLabel,
    summary,
    summaryCards: buildFollowupSummaryCards(summary),
    candidates,
    missingInformation,
    recommendations,
    messageDrafts,
    reviewQueue,
    reviews,
    selectedCandidate,
    queueCountLabel: `${candidates.length} 条只读候选`,
    headerCopy: isLive
      ? "已连接 admin-read 跟进助手只读数据。当前仅展示候选、缺失信息、建议、草稿和复核记录，不创建任务、不发送消息、不写入客户或询盘。"
      : "当前显示安全 fallback / DEMO 数据，用于验证跟进候选、缺失信息、草稿和人工复核边界；不调用 API 写入、不执行助手、不发送消息。",
  };
}

function buildFollowupSummaryCards(summary) {
  return [
    {
      label: "跟进候选",
      value: safeDashboardText(summary?.total_candidates, "0"),
      subtitle: "只读候选，不自动创建任务",
      tone: "active",
    },
    {
      label: "需要复核",
      value: safeDashboardText(summary?.needs_review, "0"),
      subtitle: "人工确认后才可继续",
      tone: "warning",
    },
    {
      label: "缺失信息",
      value: safeDashboardText(summary?.missing_information, "0"),
      subtitle: "规格、数量、角色或项目资料缺失",
      tone: "info",
    },
    {
      label: "草稿消息",
      value: safeDashboardText(summary?.draft_messages, "0"),
      subtitle: "仅草稿，未发送",
      tone: "neutral",
    },
    {
      label: "高优先级",
      value: safeDashboardText(summary?.high_priority, "0"),
      subtitle: "适合优先人工查看",
      tone: "active",
    },
    {
      label: "风险暂缓",
      value: safeDashboardText(summary?.risk_hold, "0"),
      subtitle: "重复、身份或风险信号待确认",
      tone: "danger",
    },
  ];
}

function fallbackFollowupAssistantApiData() {
  const candidates = followupAssistantCandidates.map((candidate, index) => ({
    ...candidate,
    id: `DEMO_FOLLOWUP_UI_${index + 1}`,
    status: index === 2 ? "draft" : "needs_review",
    draftStatus: index === 1 ? "needs_review" : "draft",
  }));
  const missingInformation = candidates.flatMap((candidate) =>
    candidate.missingInformation.map(([label, status], index) => ({
      id: `${candidate.id}_INFO_${index + 1}`,
      followup_candidate_id: candidate.id,
      info_label: label,
      status,
    }))
  );
  const recommendations = candidates.map((candidate, index) => ({
    id: `${candidate.id}_RECOMMENDATION`,
    followup_candidate_id: candidate.id,
    recommended_action: candidate.recommendedAction,
    recommendation_reason: candidate.actionReason,
    suggested_timing: candidate.suggestedTiming,
    priority_level: candidate.priority.toLowerCase(),
    risk_level: candidate.risk.toLowerCase(),
    confidence_level: candidate.confidence.toLowerCase(),
    created_at: `2026-06-22 demo ${index + 1}`,
  }));
  const messageDrafts = candidates.map((candidate, index) => ({
    id: `${candidate.id}_DRAFT`,
    followup_candidate_id: candidate.id,
    language: candidate.suggestedLanguage,
    channel: candidate.channel,
    tone: candidate.tone,
    draft_subject: candidate.draftSubject,
    draft_body: candidate.draftBody,
    draft_status: candidate.draftStatus,
    safety_notes: "Draft only. Human approval required before any use.",
    requires_approval: true,
    created_at: `2026-06-22 demo ${index + 1}`,
  }));
  const reviews = candidates.map((candidate, index) => ({
    id: `${candidate.id}_REVIEW`,
    followup_candidate_id: candidate.id,
    reviewer: "Paul",
    review_status: "pending",
    decision: "",
    reviewer_notes: "",
    approved_next_action: "",
    reviewed_at: "",
    created_at: `2026-06-22 demo ${index + 1}`,
  }));
  const summary = {
    total_candidates: candidates.length,
    needs_review: candidates.filter((candidate) => candidate.status === "needs_review").length,
    high_priority: candidates.filter((candidate) => candidate.priority.toLowerCase().includes("high")).length,
    missing_information: missingInformation.filter((record) => ["missing", "needs_review"].includes(record.status)).length,
    draft_messages: messageDrafts.filter((record) => ["draft", "needs_review"].includes(record.draft_status)).length,
    risk_hold: candidates.filter((candidate) => candidate.currentStage.includes("risk")).length,
    waiting_response: 0,
  };

  return {
    summary,
    candidates,
    missingInformation,
    recommendations,
    messageDrafts,
    reviewQueue: candidates,
    reviews,
  };
}

function followupRecords(payload) {
  return Array.isArray(payload?.records) ? payload.records : [];
}

function followupIsFallbackPayload(...payloads) {
  return payloads.some((payload) => payload?.meta?.source === "fallback_demo" || payload?.meta?.is_fallback === true);
}

function followupStageLabel(stage) {
  const labels = {
    first_contact: "首次接触",
    information_request: "资料补充",
    quotation_pending: "报价准备",
    quotation_sent: "报价后待回复",
    sample_discussion: "样品沟通",
    negotiation: "谈判中",
    waiting_response: "等待回复",
    dormant: "低频线索",
    risk_hold: "风险暂缓",
    closed: "已关闭",
  };
  return labels[stage] || safeDashboardText(stage, "待复核");
}

function followupDisplayLevel(value) {
  const normalized = String(value || "").trim();
  const labels = { high: "High", medium: "Medium", low: "Low" };
  return labels[normalized] || safeDashboardText(normalized, "Medium");
}

function normalizeFollowupCandidates({ candidates, missingInformation, recommendations, messageDrafts }) {
  const missingMap = groupFollowupRecords(missingInformation, "followup_candidate_id");
  const recommendationMap = new Map((recommendations || []).map((record) => [record.followup_candidate_id, record]));
  const draftMap = new Map((messageDrafts || []).map((record) => [record.followup_candidate_id, record]));

  return (candidates || []).map((candidate) => {
    const recommendation = recommendationMap.get(candidate.id) || {};
    const draft = draftMap.get(candidate.id) || {};
    const stage = safeDashboardText(candidate.current_stage, "needs_review");
    const missingItems = missingMap.get(candidate.id) || [];
    return {
      id: safeDashboardText(candidate.id, "FOLLOWUP_CANDIDATE"),
      customerName: safeDashboardText(candidate.customer_name || candidate.contact_name, "待确认联系人"),
      company: safeDashboardText(candidate.company_name, "待确认公司"),
      country: safeDashboardText(candidate.country, "待确认国家"),
      source: safeDashboardText(candidate.source_type, "manual_note"),
      currentStage: stage,
      stageLabel: followupStageLabel(stage),
      productInterest: "Follow-up candidate",
      lastInteraction: safeDashboardText(candidate.followup_reason, "需要人工复核跟进原因"),
      reason: safeDashboardText(candidate.followup_reason, "需要人工复核跟进原因"),
      priority: followupDisplayLevel(candidate.priority_level || recommendation.priority_level),
      risk: followupDisplayLevel(candidate.risk_level || recommendation.risk_level),
      confidence: followupDisplayLevel(candidate.confidence_level || recommendation.confidence_level),
      suggestedTiming: safeDashboardText(recommendation.suggested_timing, "人工判断后再跟进"),
      suggestedLanguage: safeDashboardText(candidate.language || draft.language, "en"),
      alternativeLanguage: candidate.language === "zh" ? "English" : "Chinese",
      channel: safeDashboardText(draft.channel, "email"),
      tone: safeDashboardText(draft.tone, "professional"),
      recommendedAction: safeDashboardText(recommendation.recommended_action, "request_more_information"),
      actionReason: safeDashboardText(recommendation.recommendation_reason, "需要人工确认下一步"),
      riskNotes: safeDashboardText(draft.safety_notes, "Draft only. Human approval required before any use."),
      status: safeDashboardText(candidate.status, "needs_review"),
      draftStatus: safeDashboardText(draft.draft_status, "draft"),
      missingInformation: missingItems.length
        ? missingItems.map((item) => [safeDashboardText(item.info_label || item.info_type, "缺失信息"), safeDashboardText(item.status, "missing")])
        : [["missing information", "needs_review"]],
      draftSubject: safeDashboardText(draft.draft_subject, "Follow-up draft requires review"),
      draftBody: safeDashboardText(draft.draft_body, "Draft body is not available. Please review manually before any external communication."),
    };
  });
}

function groupFollowupRecords(records, key) {
  return (records || []).reduce((map, record) => {
    const groupKey = record?.[key] || "";
    if (!map.has(groupKey)) map.set(groupKey, []);
    map.get(groupKey).push(record);
    return map;
  }, new Map());
}

async function fetchFollowupResource(endpoint) {
  const token = getAdminAccessToken();
  const response = await fetch(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `${endpoint} failed with ${response.status}`);
  }
  return payload;
}

function fetchFollowupSummary() {
  return fetchFollowupResource(FOLLOWUP_SUMMARY_ENDPOINT);
}

function fetchFollowupCandidates() {
  return fetchFollowupResource(FOLLOWUP_CANDIDATES_ENDPOINT);
}

function fetchFollowupMissingInformation() {
  return fetchFollowupResource(FOLLOWUP_MISSING_INFORMATION_ENDPOINT);
}

function fetchFollowupRecommendations() {
  return fetchFollowupResource(FOLLOWUP_RECOMMENDATIONS_ENDPOINT);
}

function fetchFollowupMessageDrafts() {
  return fetchFollowupResource(FOLLOWUP_MESSAGE_DRAFTS_ENDPOINT);
}

function fetchFollowupReviewQueue() {
  return fetchFollowupResource(FOLLOWUP_REVIEW_QUEUE_ENDPOINT);
}

function fetchFollowupReviews() {
  return fetchFollowupResource(FOLLOWUP_REVIEWS_ENDPOINT);
}

async function loadFollowupAssistantReadOnly() {
  followupAssistantApiState.status = "loading";
  followupAssistantApiState.error = "";
  followupAssistantApiState.source = "api";
  refreshFollowupAssistantView();

  try {
    const [summaryPayload, candidatesPayload, missingPayload, recommendationsPayload, draftsPayload, queuePayload, reviewsPayload] =
      await Promise.all([
        fetchFollowupSummary(),
        fetchFollowupCandidates(),
        fetchFollowupMissingInformation(),
        fetchFollowupRecommendations(),
        fetchFollowupMessageDrafts(),
        fetchFollowupReviewQueue(),
        fetchFollowupReviews(),
      ]);

    const rawCandidates = followupRecords(candidatesPayload);
    const missingInformation = followupRecords(missingPayload);
    const recommendations = followupRecords(recommendationsPayload);
    const messageDrafts = followupRecords(draftsPayload);
    const reviewQueue = followupRecords(queuePayload);
    const reviews = followupRecords(reviewsPayload);
    const candidates = normalizeFollowupCandidates({
      candidates: rawCandidates,
      missingInformation,
      recommendations,
      messageDrafts,
    });

    followupAssistantApiState.summary = summaryPayload.summary || null;
    followupAssistantApiState.candidates = candidates;
    followupAssistantApiState.missingInformation = missingInformation;
    followupAssistantApiState.recommendations = recommendations;
    followupAssistantApiState.messageDrafts = messageDrafts;
    followupAssistantApiState.reviewQueue = reviewQueue;
    followupAssistantApiState.reviews = reviews;

    const recordCount = candidates.length + missingInformation.length + recommendations.length + messageDrafts.length + reviewQueue.length + reviews.length;

    if (followupIsFallbackPayload(summaryPayload, candidatesPayload, missingPayload, recommendationsPayload, draftsPayload, queuePayload, reviewsPayload)) {
      const fallback = fallbackFollowupAssistantApiData();
      Object.assign(followupAssistantApiState, fallback);
      followupAssistantApiState.status = "error";
      followupAssistantApiState.error = "followup admin-read source unavailable; showing fallback demo";
      followupAssistantApiState.source = fallbackLabel;
    } else if (recordCount === 0) {
      const fallback = fallbackFollowupAssistantApiData();
      Object.assign(followupAssistantApiState, fallback);
      followupAssistantApiState.status = "empty";
      followupAssistantApiState.source = fallbackLabel;
    } else {
      followupAssistantApiState.status = "loaded";
      followupAssistantApiState.source = "api";
    }
  } catch (error) {
    const fallback = fallbackFollowupAssistantApiData();
    Object.assign(followupAssistantApiState, fallback);
    followupAssistantApiState.status = "error";
    followupAssistantApiState.error = error.message || "Unknown API error";
    followupAssistantApiState.source = fallbackLabel;
  }

  refreshFollowupAssistantView();
}

function refreshFollowupAssistantView() {
  if (activeSectionId !== "followup-assistant") return;
  mainContent.innerHTML = renderFollowupAssistant();
  reviewPanel.innerHTML = renderFollowupAssistantReview();
}

const inquiryIntelligenceSummaryCards = [
  { label: "待分析询盘", value: "12", subtitle: "静态 DEMO，用于验证 AI 询盘拆解界面", tone: "info" },
  { label: "可进入报价", value: "3", subtitle: "仍需人工确认价格、交期和供应能力", tone: "active" },
  { label: "需补充信息", value: "7", subtitle: "图纸、规格、数量或包装资料缺失", tone: "warning" },
  { label: "需供应商确认", value: "5", subtitle: "单位重量、MOQ、装柜或交期待核实", tone: "warning" },
  { label: "高风险询盘", value: "2", subtitle: "价格、付款、质量责任或交期风险", tone: "danger" },
  { label: "草稿回复", value: "4", subtitle: "Draft only，发送前必须人工确认", tone: "neutral" },
];

const inquiryIntelligenceItems = [
  {
    title: "Peru Light Steel Keel Inquiry",
    customer: "Maria Gonzalez",
    company: "DEMO Construction Importers",
    country: "Peru",
    channel: "Email",
    category: "询盘",
    product: "Drywall galvanized steel profiles",
    requestedQuantity: "20GP trial order / quantity split pending",
    targetPort: "Callao, Peru",
    stage: "information_missing",
    stageLabel: "缺失信息",
    priority: "High",
    risk: "Medium",
    confidence: "Medium-high",
    customerVerificationStatus: "needs_review",
    followupStatus: "information_request",
    badges: ["缺失信息", "需要复核", "供应商确认"],
    needs: ["thickness", "exact quantity allocation", "packing", "loading plan"],
    summary: "客户询盘需要补充图纸、规格和目标数量后，才能进入正式报价判断。",
    classification: {
      primaryCategory: "Light Steel Keel / Drywall Profile",
      secondaryCategory: "Galvanized steel framing",
      productFamily: "建材龙骨 / drywall profile",
      possibleMaterial: "Galvanized steel",
      productionProcess: "roll forming / cutting / packing",
      supplierType: "steel profile roll-forming factory",
    },
    missingChecklist: [
      ["exact specification", "missing"],
      ["thickness", "missing"],
      ["drawing/photo", "needs_review"],
      ["quantity by item", "missing"],
      ["surface treatment", "supplier_confirm"],
      ["packing requirement", "missing"],
      ["target port", "confirmed"],
      ["delivery time", "supplier_confirm"],
      ["installation responsibility", "not_required"],
      ["brand/private label", "needs_review"],
      ["payment terms", "needs_review"],
    ],
    quotationReadiness: [
      ["Ready for quotation", "No / Needs more information"],
      ["Reason", "Missing thickness, drawing/photo, quantity split, packing and loading plan."],
      ["Can prepare budget estimate", "Yes, only with explicit assumptions and Paul review."],
      ["Formal quotation", "Requires customer confirmation and supplier confirmation."],
      ["Risk if quote now", "Wrong specification, wrong weight, wrong loading plan, or misleading delivery expectation."],
    ],
    supplierRequirement: [
      ["Supplier confirmation needed", "Yes"],
      ["Need to ask supplier", "material thickness, unit weight, MOQ, packing, 20GP loading, FOB cost, production lead time"],
      ["Supplier category", "galvanized steel profile supplier / steel profile roll-forming factory"],
      ["RFQ status", "Not created. Future RFQ draft must remain human-reviewed."],
    ],
    risks: [
      "incomplete specification",
      "missing drawing",
      "unclear quantity split",
      "packing/loading plan not confirmed",
      "urgent price-only inquiry risk",
    ],
    recommendedAction: {
      action: "Ask customer to confirm thickness, profile drawing/photo, exact quantity by profile type, packing preference, and private label requirement.",
      reason: "Formal quote is unsafe until specification, quantity split and loading assumptions are reviewed.",
      timing: "Before supplier RFQ or customer quotation preparation",
      priority: "High",
      confidence: "Medium-high",
    },
    draftSubject: "Confirmation needed for your drywall profile inquiry",
    draftBody:
      "Dear Maria,\n\nThank you for your inquiry. Before preparing a formal quotation, could you please confirm the profile thickness, drawing or photo, exact quantity by profile type, packing preference, and whether private label is required?\n\nAfter these details are confirmed, we can review the suitable supplier options and prepare the next quotation step for your approval.\n\nBest regards,\nPaul",
    disabledCapabilities: ["不可发送", "不可报价", "不可生成 PI", "不可创建 RFQ", "不可下单", "不可触发付款 / 生产 / 发货"],
  },
  {
    title: "Indonesia Ceiling System Inquiry",
    customer: "Daniel Wong",
    company: "DEMO Building Materials Asia",
    country: "Indonesia",
    channel: "WhatsApp / Email",
    category: "询盘",
    product: "Aluminum ceiling / light steel keel",
    requestedQuantity: "Project quantity pending",
    targetPort: "Jakarta / Surabaya pending",
    stage: "supplier_confirmation_needed",
    stageLabel: "供应商确认",
    priority: "Medium-high",
    risk: "Medium",
    confidence: "Medium",
    customerVerificationStatus: "needs_review",
    followupStatus: "clarification_needed",
    badges: ["附件复核", "供应商确认", "需要人工复核"],
    needs: ["drawing confirmation", "panel thickness", "option selection"],
    summary: "客户描述了吊顶系统需求，但产品方案和材料选型仍不清楚，需要先确认图纸、厚度和可选方案。",
    classification: {
      primaryCategory: "Ceiling system",
      secondaryCategory: "Aluminum ceiling / light steel keel",
      productFamily: "吊顶系统 / ceiling profile",
      possibleMaterial: "Aluminum or galvanized steel",
      productionProcess: "extrusion / roll forming / surface treatment",
      supplierType: "ceiling system supplier with option confirmation",
    },
    missingChecklist: [
      ["exact specification", "needs_review"],
      ["thickness", "supplier_confirm"],
      ["drawing/photo", "needs_review"],
      ["quantity by item", "missing"],
      ["surface treatment", "needs_review"],
      ["packing requirement", "supplier_confirm"],
      ["target port", "missing"],
      ["delivery time", "supplier_confirm"],
      ["installation responsibility", "needs_review"],
      ["brand/private label", "not_required"],
      ["payment terms", "needs_review"],
    ],
    quotationReadiness: [
      ["Ready for quotation", "No"],
      ["Reason", "Product option, material and target port are not confirmed."],
      ["Can prepare budget estimate", "Only after option and material confirmation."],
      ["Formal quotation", "Requires supplier confirmation."],
      ["Risk if quote now", "Wrong product option or material assumption."],
    ],
    supplierRequirement: [
      ["Supplier confirmation needed", "Yes"],
      ["Need to ask supplier", "product option, material, panel/profile thickness, MOQ, packing, lead time"],
      ["Supplier category", "aluminum ceiling supplier / ceiling system supplier"],
      ["RFQ status", "Not created. Future RFQ draft must remain human-reviewed."],
    ],
    risks: ["unclear product option", "missing target port", "supplier lead time unknown", "material assumption risk"],
    recommendedAction: {
      action: "Ask customer to choose or confirm the ceiling system option, material, thickness and target port before any quote estimate.",
      reason: "The request could refer to different ceiling systems with different suppliers, cost structure and packing rules.",
      timing: "Before supplier RFQ",
      priority: "Medium-high",
      confidence: "Medium",
    },
    draftSubject: "Confirming ceiling system details before quotation",
    draftBody:
      "Dear Daniel,\n\nThank you for your ceiling system inquiry. Could you please confirm the drawing or selected product option, material preference, thickness, quantity and target port?\n\nWith these details, we can review the suitable supplier direction before preparing any quotation.\n\nBest regards,\nPaul",
    disabledCapabilities: ["不可发送", "不可报价", "不可创建 RFQ", "不可确认交期", "不可确认订单"],
  },
  {
    title: "Ecuador Window Measurement Issue",
    customer: "Carlos Ramirez",
    company: "DEMO Developer Contact",
    country: "Ecuador",
    channel: "Email",
    category: "项目澄清",
    product: "Aluminum window/door project",
    requestedQuantity: "Project quantity pending",
    targetPort: "Guayaquil pending",
    stage: "clarification_needed",
    stageLabel: "责任边界澄清",
    priority: "Medium",
    risk: "Medium",
    confidence: "Medium",
    customerVerificationStatus: "needs_review",
    followupStatus: "risk_review",
    badges: ["责任边界", "需要复核", "不承诺交期"],
    needs: ["installation responsibility", "site measurement responsibility", "developer confirmation"],
    summary: "客户提到门窗尺寸和现场问题，必须先区分供货、测量、安装和现场责任边界。",
    classification: {
      primaryCategory: "Aluminum window/door project",
      secondaryCategory: "Project measurement clarification",
      productFamily: "铝合金门窗 / window and door system",
      possibleMaterial: "Aluminum profile + glass + hardware",
      productionProcess: "profile cutting / assembly / glazing",
      supplierType: "window and door system supplier with technical review",
    },
    missingChecklist: [
      ["exact specification", "needs_review"],
      ["thickness", "not_required"],
      ["drawing/photo", "missing"],
      ["quantity by item", "missing"],
      ["surface treatment", "needs_review"],
      ["packing requirement", "supplier_confirm"],
      ["target port", "missing"],
      ["delivery time", "supplier_confirm"],
      ["installation responsibility", "missing"],
      ["brand/private label", "not_required"],
      ["payment terms", "needs_review"],
    ],
    quotationReadiness: [
      ["Ready for quotation", "No"],
      ["Reason", "Site measurement, drawing and responsibility boundary are unclear."],
      ["Can prepare budget estimate", "Not recommended before measurement responsibility is clarified."],
      ["Formal quotation", "Requires drawing, measurement confirmation and Paul review."],
      ["Risk if quote now", "Responsibility misunderstanding, wrong size, wrong delivery expectation."],
    ],
    supplierRequirement: [
      ["Supplier confirmation needed", "Yes, later"],
      ["Need to ask supplier", "profile system, glass option, hardware, packing and lead time after drawings are available"],
      ["Supplier category", "aluminum window and door system supplier"],
      ["RFQ status", "Not created. Future RFQ draft must remain human-reviewed."],
    ],
    risks: ["installation responsibility unclear", "site measurement responsibility unclear", "missing drawing", "delivery commitment risk"],
    recommendedAction: {
      action: "Clarify whether CBM is responsible only for supply, or also expected to support measurement/install advice, before discussing quotation.",
      reason: "Door/window projects can create responsibility and size-risk issues if boundaries are not defined early.",
      timing: "Before quotation or supplier confirmation",
      priority: "Medium",
      confidence: "Medium",
    },
    draftSubject: "Clarifying window project measurements and responsibility",
    draftBody:
      "Dear Carlos,\n\nThank you for the project information. Before reviewing quotation possibilities, could you please confirm the drawings, opening measurements, project scope, and whether CBM is expected to supply materials only or support installation-related review?\n\nThis will help avoid misunderstanding on size, responsibility and delivery expectations.\n\nBest regards,\nPaul",
    disabledCapabilities: ["不可发送", "不可报价", "不可确认责任", "不可确认交期", "不可生成 PI", "不可触发生产 / 发货"],
  },
];

const inquiryIntelligenceSafetyItems = [
  "不自动报价",
  "不自动发送客户消息",
  "不自动联系供应商",
  "不自动创建 RFQ",
  "不自动创建 PI / 订单 / 付款 / 生产 / 发货动作",
  "所有结论需要 Paul 人工确认",
];

function fallbackInquiryIntelligenceApiData() {
  return {
    summary: {
      total_requests: inquiryIntelligenceItems.length,
      needs_more_info: 2,
      supplier_confirm_needed: 1,
      quote_ready: 0,
      risk_hold: 0,
      missing_information: 7,
      supplier_rfq_needed: 2,
      draft_replies: 3,
      high_priority: 1,
    },
    items: inquiryIntelligenceItems,
    requests: [],
    classifications: [],
    missingInformation: [],
    quotationReadiness: [],
    supplierRequirements: [],
    replyDrafts: [],
    reviewQueue: [],
    reviews: [],
  };
}

function getInquiryIntelligenceViewModel() {
  const fallback = fallbackInquiryIntelligenceApiData();
  const isLive = inquiryIntelligenceApiState.status === "loaded" && inquiryIntelligenceApiState.source === "api";
  const isLoading = inquiryIntelligenceApiState.status === "loading";
  const summary = inquiryIntelligenceApiState.summary || fallback.summary;
  const liveItems = normalizeInquiryIntelligenceItems({
    requests: inquiryIntelligenceApiState.requests,
    classifications: inquiryIntelligenceApiState.classifications,
    missingInformation: inquiryIntelligenceApiState.missingInformation,
    quotationReadiness: inquiryIntelligenceApiState.quotationReadiness,
    supplierRequirements: inquiryIntelligenceApiState.supplierRequirements,
    replyDrafts: inquiryIntelligenceApiState.replyDrafts,
    reviews: inquiryIntelligenceApiState.reviews,
  });
  const items = isLive && liveItems.length ? liveItems : fallback.items;
  const sourceLabel = isLive ? "实时只读数据" : isLoading ? "正在读取 admin-read 数据" : fallbackLabel;

  return {
    isLive,
    isLoading,
    sourceLabel,
    summaryCards: buildInquiryIntelligenceSummaryCards(summary),
    items,
    selected: items[0] || fallback.items[0],
    queueCountLabel: `${items.length} 条${isLive ? "只读记录" : "静态示例"}`,
    headerCopy: isLive
      ? "当前展示 admin-read 只读数据；不调用 AI、不解析附件、不创建 RFQ、不报价、不发送。"
      : "当前显示安全 fallback 示例；不调用 AI、不解析真实附件、不联系供应商、不报价、不发送。",
  };
}

function buildInquiryIntelligenceSummaryCards(summary) {
  return [
    {
      label: "待分析询盘",
      value: String(summary.total_requests ?? 0),
      subtitle: "只读分析请求，用于人工复核",
      tone: "info",
    },
    {
      label: "可进入预算判断",
      value: String(summary.budget_estimate_possible ?? 0),
      subtitle: "仍需人工确认假设、价格和交期边界",
      tone: "active",
    },
    {
      label: "需补充信息",
      value: String(summary.missing_information ?? summary.needs_more_info ?? 0),
      subtitle: "图纸、规格、数量或包装资料缺失",
      tone: "warning",
    },
    {
      label: "需供应商确认",
      value: String(summary.supplier_rfq_needed ?? summary.supplier_confirm_needed ?? 0),
      subtitle: "单位重量、MOQ、装柜或交期待核实",
      tone: "warning",
    },
    {
      label: "高风险询盘",
      value: String(summary.risk_hold ?? 0),
      subtitle: "价格、付款、质量责任或交期风险",
      tone: "danger",
    },
    {
      label: "草稿回复",
      value: String(summary.draft_replies ?? 0),
      subtitle: "Draft only，发送前必须人工确认",
      tone: "neutral",
    },
  ];
}

function groupInquiryIntelligenceRecords(records, key = "inquiry_intelligence_request_id") {
  return (records || []).reduce((map, record) => {
    const groupKey = record?.[key] || "";
    if (!map.has(groupKey)) map.set(groupKey, []);
    map.get(groupKey).push(record);
    return map;
  }, new Map());
}

function firstInquiryIntelligenceRecord(records, key = "inquiry_intelligence_request_id") {
  const grouped = groupInquiryIntelligenceRecords(records, key);
  return new Map(Array.from(grouped.entries()).map(([groupKey, groupRecords]) => [groupKey, groupRecords[0] || {}]));
}

function normalizeInquiryIntelligenceItems(data) {
  const requests = data.requests || [];
  if (!requests.length) return [];

  const classificationMap = firstInquiryIntelligenceRecord(data.classifications || []);
  const missingMap = groupInquiryIntelligenceRecords(data.missingInformation || []);
  const readinessMap = firstInquiryIntelligenceRecord(data.quotationReadiness || []);
  const supplierMap = firstInquiryIntelligenceRecord(data.supplierRequirements || []);
  const draftMap = firstInquiryIntelligenceRecord(data.replyDrafts || []);
  const reviewMap = firstInquiryIntelligenceRecord(data.reviews || []);

  return requests.map((request) => {
    const classification = classificationMap.get(request.id) || {};
    const missingItems = missingMap.get(request.id) || [];
    const readiness = readinessMap.get(request.id) || {};
    const supplier = supplierMap.get(request.id) || {};
    const draft = draftMap.get(request.id) || {};
    const review = reviewMap.get(request.id) || {};
    const missingChecklist = missingItems.length
      ? missingItems.map((item) => [
          safeDashboardText(item.info_label || item.info_type, "缺失信息"),
          normalizeInquiryChecklistStatus(item.status),
        ])
      : [["missing information", "needs_review"]];

    return {
      title: safeDashboardText(request.inquiry_title, "未命名询盘分析"),
      customer: safeDashboardText(request.customer_name, "需要人工确认"),
      company: safeDashboardText(request.company_name, "需要人工确认"),
      country: safeDashboardText(request.country, "—"),
      channel: safeDashboardText(request.source_channel || request.source_type, "manual_note"),
      category: "询盘",
      product: safeDashboardText(classification.primary_category || classification.product_family, "产品类别待确认"),
      requestedQuantity: "需要人工确认",
      targetPort: missingItems.find((item) => item.info_type === "target_port")?.status === "confirmed" ? "已确认" : "待确认",
      stage: safeDashboardText(request.analysis_status, "pending"),
      stageLabel: inquiryIntelligenceStageLabel(request.analysis_status),
      priority: safeDashboardText(request.priority_level, "medium"),
      risk: safeDashboardText(request.risk_level, "medium"),
      confidence: safeDashboardText(request.confidence_level || classification.classification_confidence, "medium"),
      customerVerificationStatus: "needs_review",
      followupStatus: "information_request",
      badges: inquiryIntelligenceBadges(request, readiness, supplier),
      needs: missingItems
        .filter((item) => ["missing", "needs_review", "supplier_confirm"].includes(item.status))
        .map((item) => safeDashboardText(item.info_label || item.info_type, "缺失信息"))
        .slice(0, 6),
      summary: truncateForDisplay(request.inquiry_text, "客户询盘需要人工复核后才能进入报价或供应商确认判断。", 220),
      classification: {
        primaryCategory: safeDashboardText(classification.primary_category, "待分类"),
        secondaryCategory: safeDashboardText(classification.secondary_category, "待分类"),
        productFamily: safeDashboardText(classification.product_family, "待确认"),
        possibleMaterial: safeDashboardText(classification.material, "待确认"),
        productionProcess: safeDashboardText(classification.likely_process, "待确认"),
        supplierType: safeDashboardText(classification.supplier_type_needed, "待确认"),
      },
      missingChecklist,
      quotationReadiness: [
        ["Ready for quotation", readiness.can_prepare_formal_quote ? "Possible after human review" : "No / Needs review"],
        ["Readiness status", safeDashboardText(readiness.readiness_status, "not_ready")],
        ["Can prepare budget estimate", readiness.can_prepare_budget_estimate ? "Yes, only with assumptions and Paul review" : "No"],
        ["Formal quotation", readiness.can_prepare_formal_quote ? "Requires Paul approval before use" : "Blocked until information is confirmed"],
        ["Risk if quote now", safeDashboardText(readiness.risk_if_quoted_now || readiness.quote_blockers, "需要人工复核风险。")],
      ],
      supplierRequirement: [
        ["Supplier confirmation needed", supplier.supplier_required ? "Yes" : "Not yet"],
        ["Need to ask supplier", safeDashboardText(supplier.supplier_questions, "待人工确认")],
        ["Supplier category", safeDashboardText(supplier.supplier_category, "待确认")],
        ["RFQ status", supplier.rfq_needed ? "Needed later, but not created" : "Not created"],
      ],
      risks: [
        safeDashboardText(readiness.quote_blockers, "quotation readiness requires review"),
        safeDashboardText(readiness.assumption_needed, "assumptions require review"),
        safeDashboardText(readiness.risk_if_quoted_now, "risk if quoted now requires review"),
      ].filter((item, index, list) => item && list.indexOf(item) === index),
      recommendedAction: {
        action: safeDashboardText(
          review.approved_next_action,
          supplier.rfq_needed
            ? "人工复核缺失信息和供应商确认点，再决定是否准备 RFQ 草稿。"
            : "先补齐关键信息，再由人工决定是否进入报价准备。"
        ),
        reason: safeDashboardText(readiness.quote_blockers || supplier.rfq_reason, "正式报价或客户回复前需要人工复核。"),
        timing: "Before supplier RFQ or customer quotation preparation",
        priority: safeDashboardText(request.priority_level, "medium"),
        confidence: safeDashboardText(request.confidence_level, "medium"),
      },
      draftSubject: safeDashboardText(draft.draft_subject, "Draft reply requires review"),
      draftBody: safeDashboardText(draft.draft_body, "Draft body is not available. Human review is required before any customer communication."),
      disabledCapabilities: ["不可发送", "不可报价", "不可生成 PI", "不可创建 RFQ", "不可下单", "不可触发付款 / 生产 / 发货"],
    };
  });
}

function normalizeInquiryChecklistStatus(status) {
  return ["confirmed", "missing", "needs_review", "supplier_confirm", "not_required"].includes(status) ? status : "needs_review";
}

function inquiryIntelligenceStageLabel(status) {
  const labels = {
    draft: "草稿",
    pending: "待分析",
    analyzed: "已分析",
    needs_more_info: "缺失信息",
    supplier_confirm_needed: "供应商确认",
    quote_ready: "可复核报价",
    risk_hold: "风险暂停",
    archived: "已归档",
  };
  return labels[status] || "需要复核";
}

function inquiryIntelligenceBadges(request, readiness, supplier) {
  const labels = [inquiryIntelligenceStageLabel(request.analysis_status), "需要人工复核"];
  if (request.risk_level === "high") labels.push("高风险");
  if (readiness?.readiness_status === "blocked_by_missing_info") labels.push("缺失信息");
  if (supplier?.supplier_required || supplier?.rfq_needed) labels.push("供应商确认");
  return labels;
}

function truncateForDisplay(value, fallback, maxLength = 180) {
  const text = safeDashboardText(value, fallback);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function renderInquiryIntelligence() {
  const model = getInquiryIntelligenceViewModel();
  const selected = model.selected;
  return `
    <div class="inquiry-intelligence-preview" aria-label="AI 询盘智能分析静态只读预览">
      <div class="inquiry-intelligence-hero">
        <div>
          <span class="state-label">${escapeHtml(model.sourceLabel)}</span>
          <h3>AI 询盘智能分析</h3>
          <p>把客户询盘拆成产品类别、缺失信息、报价准备度、供应商确认点、风险信号和草稿回复，帮助 Paul 判断下一步。</p>
          <p>${escapeHtml(model.headerCopy)}</p>
        </div>
        <div class="inquiry-intelligence-badges" aria-label="AI 询盘智能分析状态">
          ${badge(model.isLive ? "实时只读数据" : "只读预览", model.isLive ? "active" : "draft")}
          ${badge("AI 建议", "active")}
          ${badge("不自动报价", "pending")}
          ${badge("不自动发送", "pending")}
          ${badge("需人工确认", "approval")}
          ${badge("不自动执行", "pending")}
        </div>
      </div>

      <section class="inquiry-intelligence-section" aria-label="询盘智能分析概览">
        <div class="workbench-section-header">
          <div>
            <h3>询盘智能概览</h3>
            <p>以静态 DEMO 方式展示未来 AI 可以整理的询盘状态，不代表实时客户或真实报价状态。</p>
          </div>
          <span>${escapeHtml(model.sourceLabel)}</span>
        </div>
        <div class="inquiry-intelligence-summary-grid">
          ${renderSummaryCards(model.summaryCards, renderInquiryIntelligenceSummaryCard)}
        </div>
      </section>

      <div class="inquiry-intelligence-layout">
        <section class="inquiry-intelligence-queue" aria-label="AI 询盘智能分析队列">
          <div class="workbench-section-header">
            <div>
              <h3>DEMO 询盘分析队列</h3>
              <p>队列项不可点击；展示只读分析记录或安全 fallback 示例，验证 AI 分析信息架构。</p>
            </div>
            <span>${escapeHtml(model.queueCountLabel)}</span>
          </div>
          ${model.items.map(renderInquiryIntelligenceQueueItem).join("")}
        </section>

        <aside class="inquiry-intelligence-detail-panel" aria-label="选中询盘详情">
          <div class="workbench-review-heading">
            <div>
              <h3>选中询盘详情</h3>
              <p class="workbench-review-note">固定展示第一条示例。当前没有点击选择行为。</p>
            </div>
            ${badge("人工复核", "approval")}
          </div>
          ${renderInquiryIntelligenceDetail(selected)}
        </aside>
      </div>

      <div class="inquiry-intelligence-two-column">
        <section class="inquiry-intelligence-analysis-panel" aria-label="产品分类与报价准备度">
          <div class="workbench-section-header">
            <div>
              <h3>产品分类 / 报价准备度</h3>
              <p>分类和准备度仅作为人工复核材料，不构成正式报价或供应承诺。</p>
            </div>
            <span>${escapeHtml(selected.confidence)}</span>
          </div>
          ${renderInquiryIntelligenceClassification(selected.classification)}
          ${renderInquiryIntelligenceRows("报价准备度", selected.quotationReadiness)}
        </section>

        <section class="inquiry-intelligence-analysis-panel" aria-label="缺失信息清单">
          <div class="workbench-section-header">
            <div>
              <h3>缺失信息清单</h3>
              <p>把图纸、规格、数量、包装、付款和责任边界拆成可核对状态。</p>
            </div>
            <span>review checklist</span>
          </div>
          <div class="inquiry-intelligence-checklist">
            ${selected.missingChecklist.map(renderInquiryIntelligenceChecklistItem).join("")}
          </div>
        </section>
      </div>

      <div class="inquiry-intelligence-two-column">
        <section class="inquiry-intelligence-analysis-panel" aria-label="供应商和 RFQ 判断">
          <div class="workbench-section-header">
            <div>
              <h3>供应商 / RFQ 判断</h3>
              <p>只显示未来 RFQ 准备方向，不创建 RFQ，不联系供应商。</p>
            </div>
            <span>RFQ not created</span>
          </div>
          ${renderInquiryIntelligenceRows("供应商确认", selected.supplierRequirement)}
        </section>

        <section class="inquiry-intelligence-analysis-panel" aria-label="风险信号">
          <div class="workbench-section-header">
            <div>
              <h3>风险信号</h3>
              <p>风险提示只用于 Paul 判断优先级和下一步，不自动阻断或执行动作。</p>
            </div>
            <span>${escapeHtml(selected.risk)}</span>
          </div>
          <div class="inquiry-intelligence-risk-grid">
            ${selected.risks.map((risk) => `<span class="inquiry-intelligence-risk-chip">${escapeHtml(risk)}</span>`).join("")}
          </div>
        </section>
      </div>

      <div class="inquiry-intelligence-two-column">
        <section class="inquiry-intelligence-action-panel" aria-label="推荐人工动作">
          <div class="workbench-section-header">
            <div>
              <h3>推荐人工动作</h3>
              <p>建议只作为操作员复核材料，不代表系统已进入报价、供应商询价或发送流程。</p>
            </div>
            <span>${escapeHtml(selected.recommendedAction.priority)}</span>
          </div>
          <dl class="inquiry-intelligence-meta-list">
            <dt>recommended action</dt>
            <dd>${escapeHtml(selected.recommendedAction.action)}</dd>
            <dt>reason</dt>
            <dd>${escapeHtml(selected.recommendedAction.reason)}</dd>
            <dt>timing</dt>
            <dd>${escapeHtml(selected.recommendedAction.timing)}</dd>
            <dt>priority</dt>
            <dd>${escapeHtml(selected.recommendedAction.priority)}</dd>
            <dt>confidence</dt>
            <dd>${escapeHtml(selected.recommendedAction.confidence)}</dd>
          </dl>
        </section>

        <section class="inquiry-intelligence-draft-panel" aria-label="草稿回复预览">
          <div class="workbench-section-header">
            <div>
              <h3>回复草稿预览</h3>
              <p>Draft only. Not sent. Human approval required.</p>
            </div>
            <span>draft only</span>
          </div>
          <div class="inquiry-intelligence-draft-box">
            <span>Subject: ${escapeHtml(selected.draftSubject)}</span>
            <pre>${escapeHtml(selected.draftBody)}</pre>
          </div>
          <div class="inquiry-intelligence-chip-row">
            ${renderChipList(["Draft only", "Not sent", "Human approval required"], "inquiry-intelligence-status-chip")}
          </div>
        </section>
      </div>

      <section class="inquiry-intelligence-safety-panel" aria-label="AI 询盘智能分析安全边界">
        <div class="workbench-section-header">
          <div>
            <h3>安全边界</h3>
            <p>这个模块只整理询盘信息。报价、发送、RFQ、供应商联系、PI、订单和生产发货都必须另行人工确认。</p>
          </div>
          <span>Human approval</span>
        </div>
        <div class="inquiry-intelligence-safety-grid">
          ${inquiryIntelligenceSafetyItems.map((item) => `<span class="inquiry-intelligence-safety-chip">${escapeHtml(item)}</span>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderInquiryIntelligenceSummaryCard(card) {
  return `
    <article class="inquiry-intelligence-summary-card inquiry-intelligence-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderInquiryIntelligenceQueueItem(item, index) {
  const isSelected = index === 0;
  return `
    <article class="inquiry-intelligence-queue-item ${isSelected ? "inquiry-intelligence-queue-selected" : ""}" aria-label="${escapeHtml(item.title)} 询盘分析">
      <div class="inquiry-intelligence-queue-heading">
        <div>
          <span class="workbench-category">${escapeHtml(item.category)}</span>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.company)} / ${escapeHtml(item.country)}</p>
        </div>
        <span>${escapeHtml(item.stageLabel)}</span>
      </div>
      <p>${escapeHtml(item.summary)}</p>
      <div class="inquiry-intelligence-chip-row">
        ${renderChipList(item.badges, "inquiry-intelligence-status-chip")}
      </div>
      <div class="inquiry-intelligence-mini-group">
        <span>Need</span>
        <div class="inquiry-intelligence-chip-row">
          ${renderChipList(item.needs, "inquiry-intelligence-need-chip")}
        </div>
      </div>
      <div class="inquiry-intelligence-mini-group">
        <span>禁用能力</span>
        <div class="disabled-chip-row">${renderDisabledCapabilities(item.disabledCapabilities.slice(0, 3))}</div>
      </div>
    </article>
  `;
}

function renderInquiryIntelligenceDetail(item) {
  return `
    <dl class="inquiry-intelligence-meta-list">
      <dt>inquiry title</dt>
      <dd>${escapeHtml(item.title)}</dd>
      <dt>customer / company</dt>
      <dd>${escapeHtml(item.customer)} / ${escapeHtml(item.company)}</dd>
      <dt>country</dt>
      <dd>${escapeHtml(item.country)}</dd>
      <dt>source channel</dt>
      <dd>${escapeHtml(item.channel)}</dd>
      <dt>product / category</dt>
      <dd>${escapeHtml(item.product)}</dd>
      <dt>requested quantity</dt>
      <dd>${escapeHtml(item.requestedQuantity)}</dd>
      <dt>target port</dt>
      <dd>${escapeHtml(item.targetPort)}</dd>
      <dt>current stage</dt>
      <dd>${escapeHtml(item.stage)}</dd>
      <dt>customer verification</dt>
      <dd>${escapeHtml(item.customerVerificationStatus)}</dd>
      <dt>follow-up status</dt>
      <dd>${escapeHtml(item.followupStatus)}</dd>
      <dt>priority</dt>
      <dd>${escapeHtml(item.priority)}</dd>
      <dt>risk</dt>
      <dd>${escapeHtml(item.risk)}</dd>
      <dt>confidence</dt>
      <dd>${escapeHtml(item.confidence)}</dd>
    </dl>
  `;
}

function renderInquiryIntelligenceClassification(classification) {
  return `
    <dl class="inquiry-intelligence-meta-list inquiry-intelligence-classification-list">
      <dt>primary category</dt>
      <dd>${escapeHtml(classification.primaryCategory)}</dd>
      <dt>secondary category</dt>
      <dd>${escapeHtml(classification.secondaryCategory)}</dd>
      <dt>product family</dt>
      <dd>${escapeHtml(classification.productFamily)}</dd>
      <dt>possible material</dt>
      <dd>${escapeHtml(classification.possibleMaterial)}</dd>
      <dt>production process</dt>
      <dd>${escapeHtml(classification.productionProcess)}</dd>
      <dt>supplier type</dt>
      <dd>${escapeHtml(classification.supplierType)}</dd>
    </dl>
  `;
}

function renderInquiryIntelligenceRows(title, rows) {
  return `
    <div class="inquiry-intelligence-row-panel">
      <h4>${escapeHtml(title)}</h4>
      <dl class="inquiry-intelligence-meta-list">
        ${rows
          .map(
            ([label, value]) => `
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(value)}</dd>
            `,
          )
          .join("")}
      </dl>
    </div>
  `;
}

function renderInquiryIntelligenceChecklistItem([label, status]) {
  const statusLabel = {
    confirmed: "已确认",
    missing: "缺失",
    needs_review: "需复核",
    supplier_confirm: "供应商确认",
    not_required: "暂不需要",
  }[status] || status;

  return `
    <div class="inquiry-intelligence-check-item">
      <span>${escapeHtml(label)}</span>
      <small class="inquiry-intelligence-check-status inquiry-intelligence-check-${escapeHtml(status)}">${escapeHtml(statusLabel)}</small>
    </div>
  `;
}

function renderInquiryIntelligenceReview() {
  const model = getInquiryIntelligenceViewModel();
  const selected = model.selected;
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 询盘智能分析只读边界</h3>
        <ul class="check-list">
          <li>静态 DEMO 预览，不调用 AI provider，不解析真实附件，不读取外部网站</li>
          <li>不创建 RFQ，不联系供应商，不生成报价，不发送客户消息</li>
          <li>不修改客户、询盘、报价、订单、文件或知识库数据</li>
          <li>报价、PI、订单、付款、生产和发货都必须另行人工确认</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>当前复核样本</h3>
        <dl>
          <dt>API 路由</dt>
          <dd>GET ${INQUIRY_INTELLIGENCE_REQUESTS_ENDPOINT}</dd>
          <dt>数据状态</dt>
          <dd>${escapeHtml(model.sourceLabel)}</dd>
          <dt>询盘</dt>
          <dd>${escapeHtml(selected.title)}</dd>
          <dt>客户 / 公司</dt>
          <dd>${escapeHtml(selected.customer)} / ${escapeHtml(selected.company)}</dd>
          <dt>推荐动作</dt>
          <dd>${escapeHtml(selected.recommendedAction.action)}</dd>
          <dt>草稿状态</dt>
          <dd>Draft only / Not sent / Human approval required</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>禁用能力</h3>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(selected.disabledCapabilities)}
        </div>
      </div>
    </div>
  `;
}

async function fetchInquiryIntelligenceResource(endpoint) {
  const token = getAdminAccessToken();
  const response = await fetch(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `${endpoint} failed with ${response.status}`);
  }
  return payload;
}

function inquiryIntelligenceRecords(payload) {
  return Array.isArray(payload?.records) ? payload.records : [];
}

function inquiryIntelligenceIsFallbackPayload(...payloads) {
  return payloads.some((payload) => payload?.meta?.source === "fallback_demo" || payload?.meta?.is_fallback === true);
}

async function loadInquiryIntelligenceReadOnly() {
  inquiryIntelligenceApiState.status = "loading";
  inquiryIntelligenceApiState.error = "";
  inquiryIntelligenceApiState.source = "api";
  refreshInquiryIntelligenceView();

  try {
    const [
      summaryPayload,
      requestsPayload,
      classificationsPayload,
      missingPayload,
      readinessPayload,
      supplierPayload,
      draftsPayload,
      queuePayload,
      reviewsPayload,
    ] = await Promise.all([
      fetchInquiryIntelligenceResource(INQUIRY_INTELLIGENCE_SUMMARY_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_INTELLIGENCE_REQUESTS_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_PRODUCT_CLASSIFICATIONS_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_MISSING_INFORMATION_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_QUOTATION_READINESS_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_SUPPLIER_RFQ_REQUIREMENTS_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_REPLY_DRAFTS_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_INTELLIGENCE_REVIEW_QUEUE_ENDPOINT),
      fetchInquiryIntelligenceResource(INQUIRY_INTELLIGENCE_REVIEWS_ENDPOINT),
    ]);

    inquiryIntelligenceApiState.summary = summaryPayload.summary || null;
    inquiryIntelligenceApiState.requests = inquiryIntelligenceRecords(requestsPayload);
    inquiryIntelligenceApiState.classifications = inquiryIntelligenceRecords(classificationsPayload);
    inquiryIntelligenceApiState.missingInformation = inquiryIntelligenceRecords(missingPayload);
    inquiryIntelligenceApiState.quotationReadiness = inquiryIntelligenceRecords(readinessPayload);
    inquiryIntelligenceApiState.supplierRequirements = inquiryIntelligenceRecords(supplierPayload);
    inquiryIntelligenceApiState.replyDrafts = inquiryIntelligenceRecords(draftsPayload);
    inquiryIntelligenceApiState.reviewQueue = inquiryIntelligenceRecords(queuePayload);
    inquiryIntelligenceApiState.reviews = inquiryIntelligenceRecords(reviewsPayload);

    const recordCount =
      inquiryIntelligenceApiState.requests.length +
      inquiryIntelligenceApiState.classifications.length +
      inquiryIntelligenceApiState.missingInformation.length +
      inquiryIntelligenceApiState.quotationReadiness.length +
      inquiryIntelligenceApiState.supplierRequirements.length +
      inquiryIntelligenceApiState.replyDrafts.length +
      inquiryIntelligenceApiState.reviewQueue.length +
      inquiryIntelligenceApiState.reviews.length;

    if (
      inquiryIntelligenceIsFallbackPayload(
        summaryPayload,
        requestsPayload,
        classificationsPayload,
        missingPayload,
        readinessPayload,
        supplierPayload,
        draftsPayload,
        queuePayload,
        reviewsPayload
      )
    ) {
      const fallback = fallbackInquiryIntelligenceApiData();
      inquiryIntelligenceApiState.summary = fallback.summary;
      inquiryIntelligenceApiState.requests = [];
      inquiryIntelligenceApiState.classifications = [];
      inquiryIntelligenceApiState.missingInformation = [];
      inquiryIntelligenceApiState.quotationReadiness = [];
      inquiryIntelligenceApiState.supplierRequirements = [];
      inquiryIntelligenceApiState.replyDrafts = [];
      inquiryIntelligenceApiState.reviewQueue = [];
      inquiryIntelligenceApiState.reviews = [];
      inquiryIntelligenceApiState.status = "error";
      inquiryIntelligenceApiState.error = "inquiry-intelligence admin-read source unavailable; showing fallback demo";
      inquiryIntelligenceApiState.source = fallbackLabel;
    } else if (recordCount === 0) {
      const fallback = fallbackInquiryIntelligenceApiData();
      inquiryIntelligenceApiState.summary = fallback.summary;
      inquiryIntelligenceApiState.status = "empty";
      inquiryIntelligenceApiState.source = fallbackLabel;
    } else {
      inquiryIntelligenceApiState.status = "loaded";
      inquiryIntelligenceApiState.source = "api";
    }
  } catch (error) {
    const fallback = fallbackInquiryIntelligenceApiData();
    inquiryIntelligenceApiState.summary = fallback.summary;
    inquiryIntelligenceApiState.requests = [];
    inquiryIntelligenceApiState.classifications = [];
    inquiryIntelligenceApiState.missingInformation = [];
    inquiryIntelligenceApiState.quotationReadiness = [];
    inquiryIntelligenceApiState.supplierRequirements = [];
    inquiryIntelligenceApiState.replyDrafts = [];
    inquiryIntelligenceApiState.reviewQueue = [];
    inquiryIntelligenceApiState.reviews = [];
    inquiryIntelligenceApiState.status = "error";
    inquiryIntelligenceApiState.error = error.message || "Unknown API error";
    inquiryIntelligenceApiState.source = fallbackLabel;
  }

  refreshInquiryIntelligenceView();
}

function refreshInquiryIntelligenceView() {
  if (activeSectionId !== "inquiry-intelligence") return;
  mainContent.innerHTML = renderInquiryIntelligence();
  reviewPanel.innerHTML = renderInquiryIntelligenceReview();
}

function getBusinessCardCaptureViewModel() {
  const fallback = fallbackBusinessCardApiData();
  const isLive = businessCardApiState.status === "loaded" && businessCardApiState.source === "api";
  const isLoading = businessCardApiState.status === "loading";
  const summary = businessCardApiState.summary || fallback.summary;
  const captureSources = businessCardApiState.captureSources.length ? businessCardApiState.captureSources : fallback.captureSources;
  const extractionResults = businessCardApiState.extractionResults.length ? businessCardApiState.extractionResults : fallback.extractionResults;
  const profileDrafts = businessCardApiState.profileDrafts.length ? businessCardApiState.profileDrafts : fallback.profileDrafts;
  const reviewQueue = businessCardApiState.reviewQueue.length ? businessCardApiState.reviewQueue : fallback.reviewQueue;
  const duplicateChecks = businessCardApiState.duplicateChecks.length ? businessCardApiState.duplicateChecks : fallback.duplicateChecks;
  const followupDrafts = businessCardApiState.followupDrafts.length ? businessCardApiState.followupDrafts : fallback.followupDrafts;
  const selectedExtraction = extractionResults[0] || {};
  const selectedDraft = profileDrafts[0] || {};
  const selectedSource = captureSources.find((source) => source.id === selectedDraft.capture_source_id) || captureSources[0] || {};
  const selectedFollowup = followupDrafts.find((draft) => draft.customer_profile_draft_id === selectedDraft.id) || followupDrafts[0] || {};
  const sourceLabel = isLive ? "实时只读数据" : fallbackLabel;

  return {
    isLive,
    isLoading,
    sourceLabel,
    summary,
    captureSources,
    extractionResults,
    profileDrafts,
    reviewQueue,
    duplicateChecks,
    followupDrafts,
    selectedSource,
    selectedExtraction,
    selectedDraft,
    selectedFollowup,
    headerCopy: isLive
      ? "已连接 admin-read 名片识别只读数据。当前只展示捕获来源、提取结果、客户草稿、查重和跟进草稿，不上传文件、不执行 OCR、不创建客户。"
      : "当前显示安全 fallback / DEMO 数据，用于验证名片识别到客户草稿的只读流程；不上传文件、不识别图片、不创建客户。",
  };
}

function businessCardSummaryCardsFromModel(model) {
  const summary = model.summary || {};
  return [
    { label: "捕获来源", value: displayValue(summary.total_captures || model.captureSources.length), subtitle: "名片 / 联系人图片来源", tone: "info" },
    { label: "待复核草稿", value: displayValue(summary.needs_review_drafts || 0), subtitle: "客户资料必须人工确认", tone: "warning" },
    { label: "可能重复", value: displayValue(summary.possible_duplicates || 0), subtitle: "公司 / 联系人相似需核对", tone: "warning" },
    { label: "已批准草稿", value: displayValue(summary.approved_drafts || 0), subtitle: "当前仍不自动创建客户", tone: "neutral" },
    { label: "跟进草稿", value: displayValue(summary.followup_drafts || model.followupDrafts.length), subtitle: "草稿只读，未发送", tone: "info" },
    { label: "高风险", value: displayValue(summary.high_risk_drafts || 0), subtitle: "商业动作仍需人工审批", tone: "danger" },
  ];
}

function businessCardFieldRows(model) {
  const extraction = model.selectedExtraction;
  const draft = model.selectedDraft;
  const source = model.selectedSource;
  return [
    { label: "姓名", value: extraction.extracted_name || draft.proposed_customer_name, note: "提取字段 / 未验证" },
    { label: "公司", value: extraction.extracted_company || draft.proposed_company_name, note: "客户档案草稿" },
    { label: "职位", value: extraction.extracted_title, note: "需人工确认" },
    { label: "邮箱", value: extraction.extracted_email || draft.proposed_email, note: "未验证，不能自动发送" },
    { label: "电话", value: extraction.extracted_phone || draft.proposed_phone, note: "未验证" },
    { label: "WhatsApp", value: extraction.extracted_whatsapp || draft.proposed_whatsapp, note: "未发送" },
    { label: "网站", value: extraction.extracted_website || draft.proposed_website, note: "待确认" },
    { label: "国家", value: extraction.extracted_country || draft.proposed_country, note: "需人工确认" },
    { label: "地址", value: extraction.extracted_address, note: "待补全" },
    { label: "客户类型", value: extraction.extracted_business_type || draft.proposed_customer_type, note: "AI/DEMO 推测" },
    { label: "产品兴趣", value: extraction.extracted_product_interest || draft.proposed_product_interest, note: "用于复核，不报价" },
    { label: "来源渠道", value: source.source_label || draft.source_channel, note: "只读来源记录" },
    { label: "置信度", value: extraction.confidence_level || draft.confidence_level, note: `Review status: ${displayValue(draft.review_status)}` },
    { label: "查重状态", value: draft.duplicate_status, note: "不能自动创建客户" },
    { label: "风险提示", value: draft.risk_level, note: "不可自动发送" },
  ].map((field) => ({
    label: field.label,
    value: displayValue(field.value),
    note: displayValue(field.note),
  }));
}

function businessCardAnalysisRowsFromModel(model) {
  const extraction = model.selectedExtraction;
  const draft = model.selectedDraft;
  return [
    ["可能客户类型", displayValue(extraction.extracted_business_type || draft.proposed_customer_type)],
    ["可能关注产品", displayValue(extraction.extracted_product_interest || draft.proposed_product_interest)],
    ["需要人工确认", "邮箱、网站、客户身份、真实采购需求和是否重复"],
    ["推荐下一步", "人工核实名片信息，再决定是否进入客户资料创建或跟进草稿复核"],
  ];
}

function businessCardDuplicateRowsFromModel(model) {
  return model.duplicateChecks.slice(0, 3).map((record) => [
    displayValue(record.match_label || record.match_type),
    displayValue(record.match_reason || `置信度：${displayValue(record.match_confidence)}`),
  ]);
}

function businessCardReviewQueueLabels(model) {
  return model.reviewQueue.slice(0, 8).map((item) => {
    const name = firstDisplayValue([item.proposed_company_name, item.proposed_customer_name, "未命名草稿"]);
    return `${name} / ${displayValue(item.review_status)} / ${displayValue(item.duplicate_status)}`;
  });
}

function renderBusinessCardSummaryCard(card) {
  return `
    <article class="business-card-summary-card business-card-summary-${escapeHtml(card.tone)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.subtitle)}</small>
    </article>
  `;
}

function renderBusinessCardUploadPreview() {
  return `
    <section class="business-card-section card-upload-zone-preview" aria-label="名片上传静态预览">
      <div class="workbench-section-header">
        <div>
          <h3>上传名片图片</h3>
          <p>拖拽或选择客户名片、展会卡片、WhatsApp 联系人截图。当前为静态预览，未启用真实上传。</p>
        </div>
        <span>静态预览 / 未启用上传</span>
      </div>

      <div class="card-upload-preview" aria-label="静态上传区域预览">
        <span class="card-upload-icon">IMG</span>
        <div>
          <h4>后续阶段的上传入口</h4>
          <p>这里未来会连接私有存储和人工复核流程；当前没有文件选择控件、没有拖拽监听、没有上传请求。</p>
          <small>只读展示，不会保存图片或创建客户。</small>
        </div>
      </div>

      <div class="upload-preview-layout">
        <div class="upload-preview-panel upload-file-rules-grid" aria-label="名片文件规则">
          <h4>文件规则</h4>
          <div class="business-card-chip-row">
            ${renderChipList(businessCardUploadFileRules, "business-card-safe-chip")}
          </div>
        </div>

        <div class="upload-preview-panel upload-privacy-panel" aria-label="名片隐私说明">
          <h4>隐私与人工确认</h4>
          <ul class="upload-preview-list">
            ${businessCardUploadPrivacyNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div class="upload-preview-panel ocr-pipeline-preview" aria-label="后续 OCR 流程预览">
        <div class="upload-preview-panel-heading">
          <div>
            <h4>OCR/视觉识别流程</h4>
            <p>后续阶段才会启用；当前未启用 OCR，不解析图片、不提取真实字段。</p>
          </div>
          <div class="business-card-badges">
            ${badge("后续阶段", "draft")}
            ${badge("当前未启用 OCR", "pending")}
          </div>
        </div>
        <div class="upload-pipeline-row">
          ${businessCardUploadPipelineSteps
            .map((step, index) => `
              <span class="upload-pipeline-step">
                <strong>${escapeHtml(String(index + 1).padStart(2, "0"))}</strong>
                ${escapeHtml(step)}
              </span>
            `)
            .join("")}
        </div>
      </div>

      <div class="upload-preview-layout">
        <div class="upload-preview-panel upload-error-preview" aria-label="上传错误状态预览">
          <h4>错误状态预览</h4>
          <div class="upload-error-chip-row">
            ${renderChipList(businessCardUploadErrorStates, "upload-error-chip")}
          </div>
        </div>

        <div class="upload-preview-panel upload-retention-note" aria-label="名片数据留存说明">
          <h4>留存与删除原则</h4>
          <ul class="upload-preview-list">
            ${businessCardUploadRetentionNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;
}

function renderBusinessCardCapture() {
  const model = getBusinessCardCaptureViewModel();
  const statusNotice =
    businessCardApiState.status === "loading"
      ? renderDataStatus("loading", "正在加载名片识别数据", `正在使用当前管理员会话请求 GET ${BUSINESS_CARD_SUMMARY_ENDPOINT}。`)
      : businessCardApiState.status === "error"
      ? renderDataStatus("error", "名片识别 API 暂不可用", `${apiUnavailableMessage} 显示静态预览 fallback。系统提示：${businessCardApiState.error}`)
      : businessCardApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时名片识别数据", "当前没有可用实时名片记录，继续显示静态预览 fallback。")
      : businessCardApiState.status === "loaded"
      ? renderDataStatus("success", "名片识别只读数据已加载", "已读取 admin-read 只读数据；没有上传、OCR、客户创建或发送动作。")
      : "";

  return `
    <div class="business-card-capture-preview" aria-label="AI 名片识别静态预览">
      ${statusNotice}
      <div class="business-card-capture-hero">
        <div>
          <span class="state-label">AI Business Card Capture</span>
          <h3>AI 名片识别</h3>
          <p>${escapeHtml(model.headerCopy)}</p>
        </div>
        <div class="business-card-badges" aria-label="AI 名片识别预览状态">
          ${badge(model.sourceLabel, model.isLive ? "active" : "draft")}
          ${badge("只读预览", "draft")}
          ${badge("不上传文件", "pending")}
          ${badge("不执行 OCR", "pending")}
          ${badge("不自动建客户", "pending")}
          ${badge("需人工确认", "approval")}
          ${badge("客户资料草稿", "active")}
        </div>
      </div>

      <section class="business-card-section" aria-label="名片识别数据概览">
        <div class="workbench-section-header">
          <div>
            <h3>名片识别概览</h3>
            <p>${model.isLive ? "来自 admin-read 的只读统计。" : "安全 fallback / DEMO 统计；不代表实时客户或名片状态。"}</p>
          </div>
          <span>${escapeHtml(model.sourceLabel)}</span>
        </div>
        <div class="business-card-summary-grid">
          ${renderSummaryCards(businessCardSummaryCardsFromModel(model), renderBusinessCardSummaryCard)}
        </div>
      </section>

      ${renderBusinessCardUploadPreview()}

      <div class="business-card-layout">
        <section class="business-card-section" aria-label="名片识别字段预览">
          <div class="workbench-section-header">
            <div>
              <h3>字段提取预览</h3>
              <p>${model.isLive ? "只读提取结果，展示如何进入客户档案草稿复核。" : "固定 demo 数据，展示未来 AI 提取结果如何进入客户档案草稿复核。"}</p>
            </div>
            <span>${escapeHtml(model.isLive ? "admin-read / draft" : "DEMO / draft")}</span>
          </div>
          <div class="extraction-preview-grid">
            ${businessCardFieldRows(model).map(renderBusinessCardFieldCard).join("")}
          </div>
        </section>

        <aside class="customer-draft-profile" aria-label="客户档案草稿预览">
          <div class="workbench-review-heading">
            <div>
              <h3>客户档案草稿</h3>
              <p class="workbench-review-note">${model.isLive ? "只读草稿：" : "固定示例："}${escapeHtml(firstDisplayValue([model.selectedDraft.proposed_customer_name, "Carlos Ramirez"]))} / ${escapeHtml(firstDisplayValue([model.selectedDraft.proposed_company_name, "Demo Facade Solutions"]))}。</p>
            </div>
            ${badge("未验证", "pending")}
          </div>
          <dl class="business-card-draft-list">
            <dt>Review status</dt>
            <dd>${escapeHtml(displayValue(model.selectedDraft.review_status))}</dd>
            <dt>客户类型</dt>
            <dd>${escapeHtml(displayValue(model.selectedDraft.proposed_customer_type))}</dd>
            <dt>国家</dt>
            <dd>${escapeHtml(displayValue(model.selectedDraft.proposed_country))}</dd>
            <dt>来源</dt>
            <dd>${escapeHtml(displayValue(model.selectedSource.source_label || model.selectedDraft.source_channel))}</dd>
            <dt>安全状态</dt>
            <dd>草稿 / 未导入 / 不创建客户</dd>
          </dl>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(["不可上传", "不可 OCR", "不可建客", "不可发送", "不可群发"])}
          </div>
        </aside>
      </div>

      <div class="business-card-two-column">
        ${renderBusinessCardAnalysisPanel(model)}
        ${renderBusinessCardDuplicatePanel(model)}
      </div>

      <div class="business-card-two-column">
        ${renderBusinessCardFollowupDraft(model)}
        ${renderBusinessCardReviewQueue(model)}
      </div>

      ${renderBusinessCardSafetyPanel()}
    </div>
  `;
}

function renderBusinessCardFieldCard(field) {
  return `
    <article class="extracted-field-card">
      <span>${escapeHtml(field.label)}</span>
      <strong>${escapeHtml(field.value)}</strong>
      <small>${escapeHtml(field.note)}</small>
    </article>
  `;
}

function renderBusinessCardAnalysisPanel(model) {
  return `
    <section class="business-card-section ai-card-analysis-panel" aria-label="AI 名片分析预览">
      <div class="workbench-section-header">
        <div>
          <h3>AI 分析预览</h3>
          <p>分析结果只作为人工复核材料，不代表客户已确认或可直接联系。</p>
        </div>
        <span>AI draft only</span>
      </div>
      <dl class="business-card-analysis-list">
        ${businessCardAnalysisRowsFromModel(model).map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
      </dl>
    </section>
  `;
}

function renderBusinessCardDuplicatePanel(model) {
  return `
    <section class="business-card-section duplicate-check-panel" aria-label="客户查重静态预览">
      <div class="workbench-section-header">
        <div>
          <h3>查重预览</h3>
          <p>${model.isLive ? "只读展示查重结果结构；不创建客户、不合并客户、不写入数据库。" : "仅展示未来查重结果结构；当前未查询真实客户、邮箱或公司记录。"}</p>
        </div>
        <span>${escapeHtml(model.isLive ? "只读查重结果" : "未执行真实查重")}</span>
      </div>
      <dl class="business-card-analysis-list">
        ${businessCardDuplicateRowsFromModel(model).map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
      </dl>
    </section>
  `;
}

function renderBusinessCardFollowupDraft(model) {
  const draft = model.selectedFollowup;
  const paragraphs = String(draft.body || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return `
    <section class="business-card-section followup-draft-preview" aria-label="跟进草稿静态预览">
      <div class="workbench-section-header">
        <div>
          <h3>温和跟进草稿</h3>
          <p>英文草稿仅供人工复核；当前没有复制、发送、审批或群发动作。</p>
        </div>
        <span>${escapeHtml(displayValue(draft.review_status || "草稿 / 未发送"))}</span>
      </div>
      <div class="business-card-draft-box">
        <p><strong>${escapeHtml(displayValue(draft.subject || "Follow-up draft"))}</strong></p>
        ${paragraphs.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </div>
      <div class="disabled-chip-row">
        ${renderDisabledCapabilities(["草稿", "未发送", "需人工确认", "不可复制执行", "不可群发"])}
      </div>
    </section>
  `;
}

function renderBusinessCardReviewQueue(model) {
  const queueLabels = businessCardReviewQueueLabels(model);
  return `
    <section class="business-card-section capture-review-queue" aria-label="名片复核队列静态预览">
      <div class="workbench-section-header">
        <div>
          <h3>复核队列预览</h3>
          <p>把名片草稿拆成可扫读的待确认项，但不创建任务或客户记录。</p>
        </div>
        <span>${escapeHtml(model.isLive ? `${queueLabels.length} 个只读待复核项` : `${queueLabels.length} 个静态标签`)}</span>
      </div>
      <div class="business-card-queue-grid">
        ${queueLabels.map((item) => `<span class="business-card-queue-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderBusinessCardSafetyPanel() {
  return `
    <section class="business-card-section capture-safety-panel" aria-label="AI 名片识别安全边界">
      <div class="workbench-section-header">
        <div>
          <h3>AI 能做什么 / 不能做什么</h3>
          <p>名片识别未来可以提高录入效率，但客户资料和开发动作必须人工确认。</p>
        </div>
        <span>安全边界</span>
      </div>
      <div class="capture-safety-grid">
        <div>
          <h4>AI 可以</h4>
          <div class="business-card-chip-row">
            ${renderChipList(businessCardAiCanItems, "business-card-safe-chip")}
          </div>
        </div>
        <div>
          <h4>AI 不能</h4>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(businessCardAiCannotItems)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBusinessCardCaptureReview() {
  const model = getBusinessCardCaptureViewModel();
  const selectedDraft = model.selectedDraft;
  const selectedExtraction = model.selectedExtraction;
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 名片识别只读边界</h3>
        <ul class="check-list">
          <li>静态预览，不上传文件，不执行 OCR，不解析图片，不调用 AI provider</li>
          <li>不创建客户、不导入真实数据、不写入数据库、不创建任务</li>
          <li>不发送 Email / WhatsApp，不群发开发信，不自动判断客户可信度</li>
          <li>不生成报价、PI、订单，不触发付款 / 生产 / 发货</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>${model.isLive ? "只读样本" : "固定样本"}</h3>
        <dl>
          <dt>样本联系人</dt>
          <dd>${escapeHtml(firstDisplayValue([selectedDraft.proposed_customer_name, selectedExtraction.extracted_name, "需要人工确认"]))} / ${escapeHtml(firstDisplayValue([selectedDraft.proposed_company_name, selectedExtraction.extracted_company, "需要人工确认"]))}</dd>
          <dt>样本来源</dt>
          <dd>${escapeHtml(firstDisplayValue([model.selectedSource.source_label, selectedDraft.source_channel, "需要人工确认"]))}</dd>
          <dt>客户类型</dt>
          <dd>${escapeHtml(firstDisplayValue([selectedDraft.proposed_customer_type, selectedExtraction.extracted_business_type, "需要人工确认"]))}（AI / DEMO 推测，需 Paul 确认）</dd>
          <dt>复核状态</dt>
          <dd>${escapeHtml(displayValue(selectedDraft.review_status))}</dd>
          <dt>数据状态</dt>
          <dd>${escapeHtml(model.sourceLabel)}</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>禁用能力</h3>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(["不可上传文件", "不可执行 OCR", "不可创建客户", "不可导入数据", "不可发送消息", "不可群发开发信", "不可生成报价"])}
        </div>
      </div>
    </div>
  `;
}

function renderKnowledgeCenter() {
  const model = getKnowledgeCenterViewModel();
  const statusNotice =
    knowledgeApiState.status === "loading"
      ? renderDataStatus("loading", "正在加载知识库", `正在使用当前管理员会话请求 GET ${KNOWLEDGE_ITEMS_ENDPOINT}。`)
      : knowledgeApiState.status === "error"
      ? renderDataStatus("error", "知识库 API 暂不可用", `${apiUnavailableMessage} 显示静态预览 fallback。系统提示：${knowledgeApiState.error}`)
      : knowledgeApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时知识库数据", "当前没有可用实时知识库记录，继续显示静态预览 fallback。")
      : knowledgeApiState.status === "loaded"
      ? renderDataStatus("success", "知识库数据已加载", `数据来源：${model.sourceLabel}。只读列表，未连接创建、编辑、验证或 RAG 动作。`)
      : "";

  return `
    <div class="ai-knowledge-preview" aria-label="AI 知识库静态预览">
      ${statusNotice}
      <div class="ai-knowledge-header">
        <div>
          <span class="state-label">AI Knowledge Center</span>
          <h3>AI 知识库</h3>
          <p>${escapeHtml(model.headerCopy)}</p>
        </div>
        <div class="ai-knowledge-badges" aria-label="AI 知识库预览状态">
          ${badge(model.sourceLabel, model.isLive ? "active" : "draft")}
          ${badge("只读", "active")}
          ${badge("不上传文件", "pending")}
          ${badge("不执行 RAG", "pending")}
          ${badge("人工验证", "approval")}
          ${badge("来源可追溯", "active")}
        </div>
      </div>

      <section class="ai-knowledge-section" aria-label="知识总览">
        <div class="workbench-section-header">
          <div>
            <h3>知识总览</h3>
            <p>展示企业知识库的分类、来源、验证状态和安全边界；真实数据不可用时显示安全 fallback。</p>
          </div>
          <span>${escapeHtml(model.isLive ? "admin-read 知识分类" : "静态知识分类")}</span>
        </div>
        <div class="knowledge-grid">
          ${model.overviewCards.map(renderKnowledgeOverviewCard).join("")}
        </div>
      </section>

      <div class="ai-knowledge-layout">
        <section class="ai-knowledge-section" aria-label="知识条目预览">
          <div class="workbench-section-header">
            <div>
            <h3>知识条目</h3>
              <p>知识条目展示来源、可信度、人工验证状态、风险等级和可见范围。</p>
            </div>
            <span>${escapeHtml(model.isLive ? `${model.items.length} 条只读知识` : "4 条 demo 知识")}</span>
          </div>
          <div class="knowledge-item-list">
            ${model.items.map(renderKnowledgeItemCard).join("") || renderKnowledgeEmptyState("暂无知识条目")}
          </div>
        </section>

        <aside class="ai-knowledge-panel" aria-label="AI 知识使用说明">
          <div class="workbench-review-heading">
            <div>
              <h3>AI 如何使用知识</h3>
              <p class="workbench-review-note">固定示例：企业知识库只作为 AI Copilot 的内部参考来源。</p>
            </div>
            ${badge("不生成答案", "pending")}
          </div>
          <dl class="knowledge-usage-list">
            ${model.usageRows
              .map(
                (row) => `
                  <dt>${escapeHtml(row.label)}</dt>
                  <dd>${escapeHtml(row.value)}</dd>
                `,
              )
              .join("")}
          </dl>
        </aside>
      </div>

      <section class="ai-knowledge-section" aria-label="人工验证队列">
        <div class="workbench-section-header">
          <div>
            <h3>人工验证队列</h3>
            <p>AI 生成或归纳的知识必须先进入人工验证；未验证内容不可用于客户承诺。</p>
          </div>
          <span>${escapeHtml(model.queueCountLabel)}</span>
        </div>
        <div class="knowledge-verification-grid">
          ${model.reviewQueue.map(renderKnowledgeVerificationCard).join("") || renderKnowledgeEmptyState("暂无待验证知识")}
        </div>
      </section>

      <section class="ai-knowledge-section" aria-label="RAG 路线预览">
        <div class="workbench-section-header">
          <div>
            <h3>RAG 路线预览</h3>
            <p>未来 RAG 必须先有分类、来源、验证、切分和引用规则；当前只展示路线，不执行检索。</p>
          </div>
          <span>未来路线</span>
        </div>
        <div class="knowledge-roadmap" aria-label="AI 知识库未来 RAG 路线">
          ${knowledgeRoadmapSteps.map(renderKnowledgeRoadmapStep).join("")}
        </div>
      </section>

      <section class="ai-knowledge-section knowledge-risk-note" aria-label="AI 知识库安全边界">
        <div class="workbench-section-header">
          <div>
            <h3>安全边界</h3>
            <p>知识库帮助 AI 更懂业务，但不会替代人工判断、报价确认、供应商确认或客户沟通审批。</p>
          </div>
          <span>安全优先</span>
        </div>
        <div class="knowledge-safety-grid">
          ${knowledgeSafetyItems.map((item) => `<span class="compliance-chip">${escapeHtml(item)}</span>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderKnowledgeOverviewCard(card) {
  return `
    <article class="knowledge-card knowledge-card-${escapeHtml(card.tone || "neutral")}">
      <div>
        <span class="knowledge-category-chip">${escapeHtml(card.label)}</span>
        <strong class="knowledge-count">${escapeHtml(card.count)}</strong>
      </div>
      <p>${escapeHtml(card.description)}</p>
      <div class="knowledge-card-status">
        <span class="verification-badge">${escapeHtml(card.status)}</span>
        <span class="knowledge-source-pill">${escapeHtml(card.note)}</span>
      </div>
    </article>
  `;
}

function renderKnowledgeItemCard(item) {
  const category = item.category || item.category_slug || "知识条目";
  const confidence = item.confidence || knowledgeStatusLabel(item.confidence_level);
  const summary = item.summary || "知识摘要待补充";
  const source = item.source || knowledgeSourceLabel(item);
  const humanVerified = knowledgeHumanVerifiedLabel(item);
  return `
    <article class="knowledge-item-card">
      <div class="knowledge-item-heading">
        <div>
          <span class="workbench-category">${escapeHtml(category)}</span>
          <h4>${escapeHtml(item.title)}</h4>
        </div>
        ${badge(`可信度：${confidence}`, knowledgeTone(item.confidence_level))}
      </div>
      <p>${escapeHtml(summary)}</p>
      <dl class="knowledge-item-meta">
        <dt>来源</dt>
        <dd>${escapeHtml(source)}</dd>
        <dt>人工验证</dt>
        <dd>${escapeHtml(humanVerified)}</dd>
      </dl>
      <div class="knowledge-chip-row">
        ${renderChipList(knowledgeItemChips(item), "knowledge-category-chip")}
      </div>
    </article>
  `;
}

function renderKnowledgeVerificationCard(item) {
  const status = item.status || knowledgeStatusLabel(item.verification_status);
  const note = item.note || item.reason || "需要人工确认来源、有效期、风险和可见范围。";
  return `
    <article class="knowledge-verification-card">
      <div>
        <span class="verification-badge">${escapeHtml(status)}</span>
        <h4>${escapeHtml(item.title)}</h4>
      </div>
      <p>${escapeHtml(note)}</p>
      <div class="disabled-chip-row">
        ${renderDisabledCapabilities(["不可用于客户承诺", "不可自动发送", "不可自动报价"])}
      </div>
    </article>
  `;
}

function renderKnowledgeEmptyState(message) {
  return `
    <article class="knowledge-item-card">
      <div class="knowledge-item-heading">
        <div>
          <span class="workbench-category">空状态</span>
          <h4>${escapeHtml(message)}</h4>
        </div>
        ${badge("只读", "active")}
      </div>
      <p>当前没有可显示的实时知识库记录；不会创建、编辑、上传、RAG 或生成 AI 答案。</p>
    </article>
  `;
}

function renderKnowledgeRoadmapStep(step, index) {
  return `
    <div class="knowledge-roadmap-step">
      <span>${index + 1}</span>
      <strong>${escapeHtml(step)}</strong>
    </div>
  `;
}

function renderKnowledgeCenterReview() {
  const model = getKnowledgeCenterViewModel();
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>AI 知识库只读边界</h3>
        <ul class="check-list">
          <li>${model.isLive ? "实时只读数据已接入 admin-read；" : "当前显示静态 fallback；"}不创建知识条目，不写入数据库，不调用 AI 或 RAG</li>
          <li>不上传、不下载、不解析文件，不 OCR，不展示原始私有文件内容</li>
          <li>不自动发送 Email / WhatsApp，不创建客户，不生成报价、PI、订单或生产动作</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>知识使用原则</h3>
        <dl>
          <dt>当前用途</dt>
          <dd>展示未来企业知识库如何支撑询盘分析、供应商匹配、报价前复核和 AI Copilot。</dd>
          <dt>数据状态</dt>
          <dd>${escapeHtml(model.sourceLabel)}</dd>
          <dt>验证状态</dt>
          <dd>${escapeHtml(model.queueCountLabel)}；未验证知识不得用于客户承诺。</dd>
          <dt>来源要求</dt>
          <dd>未来知识必须记录来源、可信度、有效期和人工复核结果。</dd>
          <dt>缺失能力</dt>
          <dd>真实知识库、RAG、embedding、文档切分、检索引用和人工验证流程尚未实现。</dd>
        </dl>
      </div>
      <div class="review-card">
        <h3>禁用能力</h3>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities(["不可上传文件", "不可解析/OCR", "不可执行 RAG", "不可生成 AI 客户答案", "不可自动报价", "不可外发消息", "不可创建业务记录"])}
        </div>
      </div>
    </div>
  `;
}

async function fetchKnowledgeResource(endpoint) {
  const token = getAdminAccessToken();
  const response = await fetch(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `${endpoint} failed with ${response.status}`);
  }
  return payload;
}

function knowledgeRecords(payload) {
  return Array.isArray(payload?.records) ? payload.records : [];
}

function knowledgeIsFallbackPayload(...payloads) {
  return payloads.some((payload) => payload?.meta?.source === "fallback_demo" || payload?.meta?.is_fallback === true);
}

async function loadKnowledgeCenterReadOnly() {
  knowledgeApiState.status = "loading";
  knowledgeApiState.error = "";
  knowledgeApiState.source = "api";
  refreshKnowledgeCenterView();

  try {
    const [summaryPayload, categoriesPayload, itemsPayload, queuePayload, linkedContextPayload] = await Promise.all([
      fetchKnowledgeResource(KNOWLEDGE_SUMMARY_ENDPOINT),
      fetchKnowledgeResource(KNOWLEDGE_CATEGORIES_ENDPOINT),
      fetchKnowledgeResource(KNOWLEDGE_ITEMS_ENDPOINT),
      fetchKnowledgeResource(KNOWLEDGE_REVIEW_QUEUE_ENDPOINT),
      fetchKnowledgeResource(KNOWLEDGE_LINKED_CONTEXT_ENDPOINT),
    ]);

    knowledgeApiState.summary = summaryPayload.summary || null;
    knowledgeApiState.categories = knowledgeRecords(categoriesPayload);
    knowledgeApiState.items = knowledgeRecords(itemsPayload);
    knowledgeApiState.reviewQueue = knowledgeRecords(queuePayload);
    knowledgeApiState.linkedContext = knowledgeRecords(linkedContextPayload);

    if (knowledgeIsFallbackPayload(summaryPayload, categoriesPayload, itemsPayload, queuePayload, linkedContextPayload)) {
      knowledgeApiState.status = "error";
      knowledgeApiState.error = "knowledge admin-read source unavailable; showing fallback demo";
      knowledgeApiState.source = fallbackLabel;
    } else {
      knowledgeApiState.status = knowledgeApiState.categories.length || knowledgeApiState.items.length ? "loaded" : "empty";
      knowledgeApiState.source = "api";
    }
  } catch (error) {
    knowledgeApiState.status = "error";
    knowledgeApiState.error = error.message || "Unknown API error";
    knowledgeApiState.summary = null;
    knowledgeApiState.categories = [];
    knowledgeApiState.items = [];
    knowledgeApiState.reviewQueue = [];
    knowledgeApiState.linkedContext = [];
    knowledgeApiState.source = fallbackLabel;
  }

  refreshKnowledgeCenterView();
}

function refreshKnowledgeCenterView() {
  if (activeSectionId !== "knowledge-center") return;
  mainContent.innerHTML = renderKnowledgeCenter();
  reviewPanel.innerHTML = renderKnowledgeCenterReview();
}

async function fetchBusinessCardResource(endpoint) {
  const token = getAdminAccessToken();
  const response = await fetch(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `${endpoint} failed with ${response.status}`);
  }
  return payload;
}

function businessCardRecords(payload) {
  return Array.isArray(payload?.records) ? payload.records : [];
}

function businessCardIsFallbackPayload(...payloads) {
  return payloads.some((payload) => payload?.meta?.source === "fallback_demo" || payload?.meta?.is_fallback === true);
}

function fallbackBusinessCardApiData() {
  const captureSources = [
    {
      id: "DEMO_CARD_SOURCE_PERU",
      source_type: "trade_show_card",
      source_label: "DEMO_TRADE_SHOW_CARD_PERU",
      captured_channel: "manual_upload",
      processing_status: "needs_review",
      captured_at: "2026-06-21 demo",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CARD_SOURCE_PANAMA",
      source_type: "trade_show_card",
      source_label: "DEMO_TRADE_SHOW_CARD_PANAMA",
      captured_channel: "manual_upload",
      processing_status: "needs_review",
      captured_at: "2026-06-21 demo",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CARD_SOURCE_INDONESIA",
      source_type: "whatsapp_contact_image",
      source_label: "DEMO_WHATSAPP_CONTACT_INDONESIA",
      captured_channel: "manual_upload",
      processing_status: "extracted",
      captured_at: "2026-06-21 demo",
      created_at: "2026-06-21 demo",
    },
  ];
  const extractionResults = [
    {
      id: "DEMO_CARD_EXTRACTION_PERU",
      capture_source_id: "DEMO_CARD_SOURCE_PERU",
      extracted_name: "Carlos Ramirez",
      extracted_company: "DEMO Facade Solutions",
      extracted_title: "Project Manager",
      extracted_email: "carlos.ramirez@example.com",
      extracted_phone: "+51 900 000 000",
      extracted_whatsapp: "+51 900 000 000",
      extracted_website: "www.demo-facade.example",
      extracted_country: "Peru",
      extracted_address: "Lima, Peru",
      extracted_business_type: "facade contractor",
      extracted_product_interest: "aluminum windows and facade systems",
      confidence_level: "medium",
      extraction_language: "en",
      extraction_notes: "DEMO extraction. Email, phone, company and product interest require human review.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CARD_EXTRACTION_PANAMA",
      capture_source_id: "DEMO_CARD_SOURCE_PANAMA",
      extracted_name: "Maria Gonzalez",
      extracted_company: "DEMO Construction Importers",
      extracted_title: "Purchasing Manager",
      extracted_email: "maria.gonzalez@example.com",
      extracted_phone: "+507 6000 0000",
      extracted_whatsapp: "+507 6000 0000",
      extracted_website: "www.demo-importers.example",
      extracted_country: "Panama",
      extracted_address: "Panama City, Panama",
      extracted_business_type: "construction material importer",
      extracted_product_interest: "glass and aluminum accessories",
      confidence_level: "medium",
      extraction_language: "es",
      extraction_notes: "DEMO extraction. Possible duplicate requires human review.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CARD_EXTRACTION_INDONESIA",
      capture_source_id: "DEMO_CARD_SOURCE_INDONESIA",
      extracted_name: "Daniel Wong",
      extracted_company: "DEMO Building Materials Asia",
      extracted_title: "Distributor",
      extracted_email: "",
      extracted_phone: "+62 800 0000 0000",
      extracted_whatsapp: "+62 800 0000 0000",
      extracted_website: "",
      extracted_country: "Indonesia",
      extracted_address: "Jakarta, Indonesia",
      extracted_business_type: "distributor",
      extracted_product_interest: "ceiling system and light steel keel",
      confidence_level: "low",
      extraction_language: "en",
      extraction_notes: "DEMO extraction. Website and email are missing.",
      created_at: "2026-06-21 demo",
    },
  ];
  const profileDrafts = [
    {
      id: "DEMO_PROFILE_DRAFT_PERU",
      proposed_customer_name: "Carlos Ramirez",
      proposed_company_name: "DEMO Facade Solutions",
      proposed_country: "Peru",
      proposed_email: "carlos.ramirez@example.com",
      proposed_phone: "+51 900 000 000",
      proposed_whatsapp: "+51 900 000 000",
      proposed_website: "www.demo-facade.example",
      proposed_customer_type: "facade contractor",
      proposed_product_interest: "aluminum windows and facade systems",
      source_channel: "trade_show_card",
      confidence_level: "medium",
      duplicate_status: "not_checked",
      risk_level: "medium",
      review_status: "needs_review",
      reviewer_notes: "DEMO draft only. Do not create customer until Paul reviews contact and project context.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_PROFILE_DRAFT_PANAMA",
      proposed_customer_name: "Maria Gonzalez",
      proposed_company_name: "DEMO Construction Importers",
      proposed_country: "Panama",
      proposed_email: "maria.gonzalez@example.com",
      proposed_phone: "+507 6000 0000",
      proposed_whatsapp: "+507 6000 0000",
      proposed_website: "www.demo-importers.example",
      proposed_customer_type: "construction material importer",
      proposed_product_interest: "glass and aluminum accessories",
      source_channel: "trade_show_card",
      confidence_level: "medium",
      duplicate_status: "possible_duplicate",
      risk_level: "medium",
      review_status: "needs_review",
      reviewer_notes: "DEMO draft only. Possible duplicate should be reviewed before any customer profile is created.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_PROFILE_DRAFT_INDONESIA",
      proposed_customer_name: "Daniel Wong",
      proposed_company_name: "DEMO Building Materials Asia",
      proposed_country: "Indonesia",
      proposed_email: "",
      proposed_phone: "+62 800 0000 0000",
      proposed_whatsapp: "+62 800 0000 0000",
      proposed_website: "",
      proposed_customer_type: "distributor",
      proposed_product_interest: "ceiling system and light steel keel",
      source_channel: "whatsapp_contact_image",
      confidence_level: "low",
      duplicate_status: "not_checked",
      risk_level: "medium",
      review_status: "draft",
      reviewer_notes: "DEMO draft only. Email and website are missing.",
      created_at: "2026-06-21 demo",
    },
  ];
  const duplicateChecks = [
    {
      id: "DEMO_DUPLICATE_PERU",
      customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PERU",
      match_type: "none_detected_demo",
      match_label: "No DEMO duplicate detected",
      match_confidence: "low",
      match_reason: "DEMO record has not been checked against real customer data.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_DUPLICATE_PANAMA",
      customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PANAMA",
      match_type: "possible_company_match",
      match_label: "Possible DEMO company-name similarity",
      match_confidence: "medium",
      match_reason: "Company name resembles an importer profile and requires human review.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_DUPLICATE_INDONESIA",
      customer_profile_draft_id: "DEMO_PROFILE_DRAFT_INDONESIA",
      match_type: "insufficient_contact_data",
      match_label: "Missing email and website",
      match_confidence: "low",
      match_reason: "Not enough contact fields to complete duplicate review.",
      created_at: "2026-06-21 demo",
    },
  ];
  const followupDrafts = [
    {
      id: "DEMO_FOLLOWUP_PERU",
      customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PERU",
      language: "en",
      channel: "email",
      subject: "Nice to meet you at the exhibition",
      body: "Hi Carlos, nice to meet you at the exhibition. We mainly supply aluminum windows, facade systems, glass and related building materials. May I know what kind of project or product you are currently looking for?",
      tone: "polite_intro",
      review_status: "draft",
      risk_notes: "Draft only. Paul must review before sending.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_FOLLOWUP_PANAMA",
      customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PANAMA",
      language: "es",
      channel: "email",
      subject: "Seguimiento de productos de vidrio y aluminio",
      body: "Hola Maria, fue un gusto conocerle. Podemos revisar productos de vidrio, accesorios de aluminio y materiales para construcción. Antes de continuar, ¿podría confirmar qué tipo de proyecto está evaluando?",
      tone: "polite_intro",
      review_status: "needs_review",
      risk_notes: "Spanish draft only. Human review required before use.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_FOLLOWUP_INDONESIA",
      customer_profile_draft_id: "DEMO_PROFILE_DRAFT_INDONESIA",
      language: "en",
      channel: "whatsapp",
      subject: "Ceiling system inquiry follow-up",
      body: "Hi Daniel, thanks for sharing your contact. We can review ceiling system and light steel keel requirements. Could you share your target specification, quantity and destination?",
      tone: "polite_intro",
      review_status: "draft",
      risk_notes: "Draft only. Email and website are missing.",
      created_at: "2026-06-21 demo",
    },
  ];
  const reviewQueue = profileDrafts
    .filter((record) => ["draft", "needs_review"].includes(record.review_status) || record.duplicate_status === "possible_duplicate")
    .map((record) => ({
      id: record.id,
      proposed_customer_name: record.proposed_customer_name,
      proposed_company_name: record.proposed_company_name,
      review_status: record.review_status,
      duplicate_status: record.duplicate_status,
      risk_level: record.risk_level,
      confidence_level: record.confidence_level,
      reason: record.reviewer_notes,
      created_at: record.created_at,
    }));

  return {
    summary: {
      total_captures: captureSources.length,
      needs_review_drafts: profileDrafts.filter((record) => ["draft", "needs_review"].includes(record.review_status)).length,
      possible_duplicates: profileDrafts.filter((record) => record.duplicate_status === "possible_duplicate").length,
      approved_drafts: profileDrafts.filter((record) => record.review_status === "approved").length,
      followup_drafts: followupDrafts.filter((record) => ["draft", "needs_review"].includes(record.review_status)).length,
      high_risk_drafts: profileDrafts.filter((record) => record.risk_level === "high").length,
    },
    captureSources,
    extractionResults,
    profileDrafts,
    reviewQueue,
    duplicateChecks,
    followupDrafts,
  };
}

async function loadBusinessCardCaptureReadOnly() {
  businessCardApiState.status = "loading";
  businessCardApiState.error = "";
  businessCardApiState.source = "api";
  refreshBusinessCardCaptureView();

  try {
    const [summaryPayload, sourcesPayload, extractionsPayload, draftsPayload, queuePayload, duplicatePayload, followupPayload] =
      await Promise.all([
        fetchBusinessCardResource(BUSINESS_CARD_SUMMARY_ENDPOINT),
        fetchBusinessCardResource(BUSINESS_CARD_CAPTURE_SOURCES_ENDPOINT),
        fetchBusinessCardResource(BUSINESS_CARD_EXTRACTION_RESULTS_ENDPOINT),
        fetchBusinessCardResource(CUSTOMER_PROFILE_DRAFTS_ENDPOINT),
        fetchBusinessCardResource(BUSINESS_CARD_REVIEW_QUEUE_ENDPOINT),
        fetchBusinessCardResource(BUSINESS_CARD_DUPLICATE_CHECKS_ENDPOINT),
        fetchBusinessCardResource(BUSINESS_CARD_FOLLOWUP_DRAFTS_ENDPOINT),
      ]);

    businessCardApiState.summary = summaryPayload.summary || null;
    businessCardApiState.captureSources = businessCardRecords(sourcesPayload);
    businessCardApiState.extractionResults = businessCardRecords(extractionsPayload);
    businessCardApiState.profileDrafts = businessCardRecords(draftsPayload);
    businessCardApiState.reviewQueue = businessCardRecords(queuePayload);
    businessCardApiState.duplicateChecks = businessCardRecords(duplicatePayload);
    businessCardApiState.followupDrafts = businessCardRecords(followupPayload);

    const recordCount =
      businessCardApiState.captureSources.length +
      businessCardApiState.extractionResults.length +
      businessCardApiState.profileDrafts.length +
      businessCardApiState.reviewQueue.length +
      businessCardApiState.duplicateChecks.length +
      businessCardApiState.followupDrafts.length;

    if (businessCardIsFallbackPayload(summaryPayload, sourcesPayload, extractionsPayload, draftsPayload, queuePayload, duplicatePayload, followupPayload)) {
      const fallback = fallbackBusinessCardApiData();
      Object.assign(businessCardApiState, fallback);
      businessCardApiState.status = "error";
      businessCardApiState.error = "business-card admin-read source unavailable; showing fallback demo";
      businessCardApiState.source = fallbackLabel;
    } else if (recordCount === 0) {
      const fallback = fallbackBusinessCardApiData();
      Object.assign(businessCardApiState, fallback);
      businessCardApiState.status = "empty";
      businessCardApiState.source = fallbackLabel;
    } else {
      businessCardApiState.status = "loaded";
      businessCardApiState.source = "api";
    }
  } catch (error) {
    const fallback = fallbackBusinessCardApiData();
    Object.assign(businessCardApiState, fallback);
    businessCardApiState.status = "error";
    businessCardApiState.error = error.message || "Unknown API error";
    businessCardApiState.source = fallbackLabel;
  }

  refreshBusinessCardCaptureView();
}

function refreshBusinessCardCaptureView() {
  if (activeSectionId !== "business-card-capture") return;
  mainContent.innerHTML = renderBusinessCardCapture();
  reviewPanel.innerHTML = renderBusinessCardCaptureReview();
}

async function fetchCustomerVerificationResource(endpoint) {
  const token = getAdminAccessToken();
  const response = await fetch(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `${endpoint} failed with ${response.status}`);
  }
  return payload;
}

function fetchCustomerVerificationSummary() {
  return fetchCustomerVerificationResource(CUSTOMER_VERIFICATION_SUMMARY_ENDPOINT);
}

function fetchCustomerVerificationRequests() {
  return fetchCustomerVerificationResource(CUSTOMER_VERIFICATION_REQUESTS_ENDPOINT);
}

function fetchCustomerVerificationEvidence() {
  return fetchCustomerVerificationResource(CUSTOMER_VERIFICATION_EVIDENCE_ENDPOINT);
}

function fetchCustomerVerificationScores() {
  return fetchCustomerVerificationResource(CUSTOMER_VERIFICATION_SCORES_ENDPOINT);
}

function fetchCustomerVerificationDuplicateMatches() {
  return fetchCustomerVerificationResource(CUSTOMER_VERIFICATION_DUPLICATE_MATCHES_ENDPOINT);
}

function fetchCustomerVerificationReviewQueue() {
  return fetchCustomerVerificationResource(CUSTOMER_VERIFICATION_REVIEW_QUEUE_ENDPOINT);
}

function fetchCustomerVerificationReviews() {
  return fetchCustomerVerificationResource(CUSTOMER_VERIFICATION_REVIEWS_ENDPOINT);
}

function customerVerificationRecords(payload) {
  return Array.isArray(payload?.records) ? payload.records : [];
}

function customerVerificationIsFallbackPayload(...payloads) {
  return payloads.some((payload) => payload?.meta?.source === "fallback_demo" || payload?.meta?.is_fallback === true);
}

function fallbackCustomerVerificationApiData() {
  const requests = [
    {
      id: "DEMO_CUSTOMER_VERIFY_PERU",
      source_type: "inquiry",
      customer_name: "Carlos Ramirez",
      company_name: "DEMO Facade Solutions",
      contact_name: "Carlos Ramirez",
      email: "carlos.ramirez@example.com",
      phone: "+51 000 000 001",
      whatsapp: "+51 000 000 001",
      website: "https://example.com/demo-facade",
      country: "Peru",
      requested_by: "demo_operator",
      requested_at: "2026-06-21 demo",
      verification_status: "needs_more_info",
      created_at: "2026-06-21 demo",
      updated_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_PANAMA",
      source_type: "whatsapp_contact",
      customer_name: "Maria Gonzalez",
      company_name: "DEMO Construction Importers",
      contact_name: "Maria Gonzalez",
      email: "maria.gonzalez@example.com",
      phone: "+507 000 000 002",
      whatsapp: "+507 000 000 002",
      website: "https://example.com/demo-construction",
      country: "Panama",
      requested_by: "demo_operator",
      requested_at: "2026-06-21 demo",
      verification_status: "possible_duplicate",
      created_at: "2026-06-21 demo",
      updated_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
      source_type: "prospecting_lead",
      customer_name: "Daniel Wong",
      company_name: "DEMO Building Materials Asia",
      contact_name: "Daniel Wong",
      email: "daniel.wong@example.com",
      phone: "+62 000 000 003",
      whatsapp: "+62 000 000 003",
      website: "https://example.com/demo-building-materials",
      country: "Indonesia",
      requested_by: "demo_operator",
      requested_at: "2026-06-21 demo",
      verification_status: "pending",
      created_at: "2026-06-21 demo",
      updated_at: "2026-06-21 demo",
    },
  ];
  const evidence = [
    {
      id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PERU_PRODUCT",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
      evidence_type: "inquiry_content",
      evidence_label: "Product interest",
      evidence_value: "Aluminum windows / facade systems",
      evidence_source: "demo_seed",
      evidence_status: "needs_review",
      confidence_level: "medium",
      risk_level: "medium",
      notes: "Needs drawings, specifications, and target quantity before commercial judgment.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PERU_WEBSITE",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
      evidence_type: "company_website",
      evidence_label: "Website",
      evidence_value: "example.com/demo-facade",
      evidence_source: "demo_seed",
      evidence_status: "likely",
      confidence_level: "medium",
      risk_level: "medium",
      notes: "Website looks plausible but is demo-only and must be checked manually.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PANAMA_DUPLICATE",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
      evidence_type: "duplicate_match",
      evidence_label: "Similar company name",
      evidence_value: "DEMO Construction Importer",
      evidence_source: "demo_seed",
      evidence_status: "needs_review",
      confidence_level: "medium",
      risk_level: "medium",
      notes: "Possible duplicate should be reviewed before creating or merging customer records.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PANAMA_PRODUCT",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
      evidence_type: "product_interest",
      evidence_label: "Product interest",
      evidence_value: "Glass / aluminum accessories",
      evidence_source: "demo_seed",
      evidence_status: "likely",
      confidence_level: "medium",
      risk_level: "medium",
      notes: "Interest is useful for follow-up but not enough for customer identity confirmation.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_INDONESIA_PRODUCT",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
      evidence_type: "product_interest",
      evidence_label: "Product interest",
      evidence_value: "Ceiling system / light steel keel",
      evidence_source: "demo_seed",
      evidence_status: "likely",
      confidence_level: "medium",
      risk_level: "low",
      notes: "Prospecting lead needs more source evidence before commercial follow-up.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_INDONESIA_EMAIL",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
      evidence_type: "email_domain",
      evidence_label: "Email domain",
      evidence_value: "example.com",
      evidence_source: "demo_seed",
      evidence_status: "not_checked",
      confidence_level: "low",
      risk_level: "medium",
      notes: "Demo domain is not a real verification signal.",
      created_at: "2026-06-21 demo",
    },
  ];
  const scores = [
    {
      id: "DEMO_CUSTOMER_VERIFY_SCORE_PERU",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
      credibility_score: 65,
      relevance_score: 80,
      risk_score: 45,
      duplicate_score: 20,
      followup_priority_score: 75,
      confidence_level: "medium",
      risk_level: "medium",
      score_explanation: "Inquiry is relevant but missing drawings, specifications, and target quantity.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_SCORE_PANAMA",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
      credibility_score: 55,
      relevance_score: 70,
      risk_score: 55,
      duplicate_score: 72,
      followup_priority_score: 50,
      confidence_level: "medium",
      risk_level: "medium",
      score_explanation: "Possible duplicate risk should be reviewed before follow-up.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_SCORE_INDONESIA",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
      credibility_score: 45,
      relevance_score: 68,
      risk_score: 60,
      duplicate_score: 30,
      followup_priority_score: 55,
      confidence_level: "low",
      risk_level: "medium",
      score_explanation: "Lead is early-stage and should remain read-only until identity evidence improves.",
      created_at: "2026-06-21 demo",
    },
  ];
  const duplicateMatches = [
    {
      id: "DEMO_CUSTOMER_VERIFY_DUPLICATE_PANAMA",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
      matched_entity_type: "customer",
      matched_label: "DEMO Construction Importer",
      match_type: "similar_company_name",
      match_confidence: "medium",
      match_reason: "Similar company name and Panama country signal.",
      created_at: "2026-06-21 demo",
    },
  ];
  const reviews = [
    {
      id: "DEMO_CUSTOMER_VERIFY_REVIEW_PERU",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
      review_status: "pending",
      decision: "request_more_info",
      decision_reason: "Drawings, specifications, and target quantity are still missing.",
      next_action: "Ask for drawings, product specifications, and target quantity before quotation review.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_REVIEW_PANAMA",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
      review_status: "pending",
      decision: "hold",
      decision_reason: "Possible duplicate needs manual review.",
      next_action: "Compare existing customer records before creating or merging any customer profile.",
      created_at: "2026-06-21 demo",
    },
    {
      id: "DEMO_CUSTOMER_VERIFY_REVIEW_INDONESIA",
      verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
      review_status: "pending",
      decision: "request_more_info",
      decision_reason: "Prospecting lead has limited identity evidence.",
      next_action: "Collect more source evidence before sales follow-up.",
      created_at: "2026-06-21 demo",
    },
  ];
  const summary = {
    total_requests: requests.length,
    pending_requests: 2,
    verified_requests: 0,
    needs_more_info: 1,
    possible_duplicates: 2,
    risky_requests: 0,
    high_priority_followups: 1,
  };
  const reviewQueue = requests
    .filter((record) => record.verification_status !== "verified")
    .map((request) => {
      const score = scores.find((record) => record.verification_request_id === request.id) || {};
      const review = reviews.find((record) => record.verification_request_id === request.id) || {};
      return {
        id: request.id,
        customer_name: request.customer_name,
        company_name: request.company_name,
        country: request.country,
        verification_status: request.verification_status,
        confidence_level: score.confidence_level || "medium",
        risk_level: score.risk_level || "medium",
        followup_priority_score: score.followup_priority_score || 50,
        reason: review.decision_reason || score.score_explanation || "Customer verification requires human review.",
        next_action: review.next_action || "Review evidence before any customer action.",
        created_at: request.created_at,
      };
    });

  return { summary, requests, evidence, scores, duplicateMatches, reviewQueue, reviews };
}

async function loadCustomerVerificationReadOnly() {
  customerVerificationApiState.status = "loading";
  customerVerificationApiState.error = "";
  customerVerificationApiState.source = "api";
  refreshCustomerVerificationView();

  try {
    const [summaryPayload, requestsPayload, evidencePayload, scoresPayload, duplicatePayload, queuePayload, reviewsPayload] = await Promise.all([
      fetchCustomerVerificationSummary(),
      fetchCustomerVerificationRequests(),
      fetchCustomerVerificationEvidence(),
      fetchCustomerVerificationScores(),
      fetchCustomerVerificationDuplicateMatches(),
      fetchCustomerVerificationReviewQueue(),
      fetchCustomerVerificationReviews(),
    ]);

    customerVerificationApiState.summary = summaryPayload.summary || null;
    customerVerificationApiState.requests = customerVerificationRecords(requestsPayload);
    customerVerificationApiState.evidence = customerVerificationRecords(evidencePayload);
    customerVerificationApiState.scores = customerVerificationRecords(scoresPayload);
    customerVerificationApiState.duplicateMatches = customerVerificationRecords(duplicatePayload);
    customerVerificationApiState.reviewQueue = customerVerificationRecords(queuePayload);
    customerVerificationApiState.reviews = customerVerificationRecords(reviewsPayload);

    const recordCount =
      customerVerificationApiState.requests.length +
      customerVerificationApiState.evidence.length +
      customerVerificationApiState.scores.length +
      customerVerificationApiState.duplicateMatches.length +
      customerVerificationApiState.reviewQueue.length +
      customerVerificationApiState.reviews.length;

    if (customerVerificationIsFallbackPayload(summaryPayload, requestsPayload, evidencePayload, scoresPayload, duplicatePayload, queuePayload, reviewsPayload)) {
      const fallback = fallbackCustomerVerificationApiData();
      Object.assign(customerVerificationApiState, fallback);
      customerVerificationApiState.status = "error";
      customerVerificationApiState.error = "customer-verification admin-read source unavailable; showing fallback demo";
      customerVerificationApiState.source = fallbackLabel;
    } else if (recordCount === 0) {
      const fallback = fallbackCustomerVerificationApiData();
      Object.assign(customerVerificationApiState, fallback);
      customerVerificationApiState.status = "empty";
      customerVerificationApiState.source = fallbackLabel;
    } else {
      customerVerificationApiState.status = "loaded";
      customerVerificationApiState.source = "api";
    }
  } catch (error) {
    const fallback = fallbackCustomerVerificationApiData();
    Object.assign(customerVerificationApiState, fallback);
    customerVerificationApiState.status = "error";
    customerVerificationApiState.error = error.message || "Unknown API error";
    customerVerificationApiState.source = fallbackLabel;
  }

  refreshCustomerVerificationView();
}

function refreshCustomerVerificationView() {
  if (activeSectionId !== "customer-verification") return;
  mainContent.innerHTML = renderCustomerVerification();
  reviewPanel.innerHTML = renderCustomerVerificationReview();
}

async function loadDashboardSummaryReadOnly() {
  dashboardSummaryApiState.status = "loading";
  dashboardSummaryApiState.error = "";
  dashboardSummaryApiState.source = "api";
  refreshDashboardView();

  try {
    const token = getAdminAccessToken();
    const response = await fetch(DASHBOARD_SUMMARY_ENDPOINT, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `${DASHBOARD_SUMMARY_ENDPOINT} failed with ${response.status}`);
    }
    const summary = normalizeDashboardSummaryPayload(payload);
    if (!summary) {
      dashboardSummaryApiState.status = "empty";
      dashboardSummaryApiState.summary = null;
      dashboardSummaryApiState.source = fallbackLabel;
    } else {
      dashboardSummaryApiState.status = "loaded";
      dashboardSummaryApiState.summary = summary;
      dashboardSummaryApiState.source = "api";
    }
  } catch (error) {
    dashboardSummaryApiState.status = "error";
    dashboardSummaryApiState.error = error.message || "Unknown API error";
    dashboardSummaryApiState.summary = null;
    dashboardSummaryApiState.source = fallbackLabel;
  }

  refreshDashboardView();
}

function refreshDashboardView() {
  if (activeSectionId !== "dashboard") return;
  mainContent.innerHTML = renderDashboard();
  reviewPanel.innerHTML = renderDashboardReview();
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
      ? renderDataStatus("error", "公司 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${companyApiState.error}`)
      : renderDataStatus("success", "公司数据已加载", `数据来源：${companyApiState.source}。只读列表，未连接创建、更新或删除动作。`);

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
    draft: "公司信息仅以只读列表展示。当前不创建、不更新、不删除，也不发送消息、生成报价或 PI。",
  });
}

function renderCompaniesLoading() {
  return `
    ${renderDataStatus("loading", "正在加载公司", "正在使用当前管理员会话请求 GET /api/companies。")}
    <div class="table-wrap table-skeleton" aria-label="Loading company rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderCompaniesEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时公司数据", "当前没有可用实时数据。本页面保持只读；创建或写入能力将在后续审批阶段开放。")}
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
    firstColumnSubtitle: (company) => company.website || company.id || "只读公司记录",
    bodyData: companies,
  });
}

function renderReadOnlyCompanyCard() {
  return `
    <div class="form-card read-only-card">
      <h3>公司查看模式</h3>
      <p>该卡片仅用于内部试用查看，不提交数据、不创建记录。</p>
      <div class="form-grid">
        <label class="field">
          <span>允许动作</span>
          <input type="text" value="只读查看" readonly disabled aria-readonly="true" aria-disabled="true" title="只读预览，暂不支持公司资料编辑或写入" />
          <small>未连接创建或更新 API。</small>
        </label>
        <label class="field">
          <span>安全边界</span>
          <input type="text" value="不自动发送或承诺" readonly disabled aria-readonly="true" aria-disabled="true" title="当前为内部试用，不执行发送、承诺或公司资料修改" />
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
      ? renderDataStatus("error", "客户 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${customerApiState.error}`)
      : renderDataStatus("success", "客户数据已加载", `数据来源：${customerApiState.source}。只读 CRM 列表，未连接创建、更新、导入、导出或删除动作。`);

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
          <dd>GET ${CUSTOMERS_ENDPOINT}</dd>
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
    ${renderDataStatus("loading", "正在加载客户", `正在使用当前管理员会话请求 GET ${CUSTOMERS_ENDPOINT}。`)}
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
        : "静态预览（安全示例）",
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
    endpoint: CUSTOMERS_ENDPOINT,
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
  const workflowModel = getSupplierWorkflowViewModel();
  return `
    <div class="supplier-workflow-preview" aria-label="供应商中心只读工作流预览">
      <div class="supplier-workflow-header">
        <div>
          <span class="state-label">供应商中心</span>
          <h3>供应商中心</h3>
          <p>集中查看供应商能力、报价状态、风险提醒和人工核实事项。</p>
          <p class="supplier-safety-note">只读数据用于界面展示；所有询价、报价、交期、质保和供应商承诺必须人工核实。</p>
        </div>
        <div class="workbench-badges">
          ${badge(workflowModel.sourceLabel, workflowModel.isLive ? "active" : "draft")}
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
          <span>${escapeHtml(workflowModel.sourceLabel)}</span>
        </div>
        <div class="supplier-summary-grid">
          ${renderSummaryCards(workflowModel.summaryCards, renderSupplierSummaryCard)}
        </div>
      </section>

      <section class="supplier-workflow-section" aria-label="供应商处理队列">
        <div class="workbench-section-header">
          <div>
            <h3>供应商处理队列</h3>
            <p>队列仅展示候选匹配和人工核实建议，不发送 RFQ，不确认报价或交期。</p>
          </div>
          <span>${escapeHtml(workflowModel.queueCountLabel)}</span>
        </div>
        <div class="supplier-queue">
          ${workflowModel.items.map(renderSupplierQueueItem).join("")}
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
  const { selectedItem, isLive } = getSupplierWorkflowViewModel();
  return `
    <div class="review-stack">
      <div class="review-card supplier-review-card">
        <div class="supplier-review-heading">
          <div>
            <h3>供应商复核预览</h3>
            <p>${isLive ? "实时只读记录：" : "固定示例："}${escapeHtml(selectedItem.title)}。</p>
          </div>
          ${badge(isLive ? "实时只读数据" : "静态", isLive ? "active" : "draft")}
        </div>
        <dl>
          <dt>供应商摘要</dt>
          <dd>${escapeHtml(selectedItem.summary)}</dd>
          <dt>能力范围</dt>
          <dd>${escapeHtml(selectedItem.capability)}</dd>
          <dt>适用询盘</dt>
          <dd>${escapeHtml(selectedItem.matchedInquiries)}</dd>
          <dt>待确认事项</dt>
          <dd>${escapeHtml(selectedItem.need)}</dd>
          <dt>风险点</dt>
          <dd>${escapeHtml(selectedItem.riskDescription)}</dd>
          <dt>AI 建议</dt>
          <dd>${escapeHtml(selectedItem.aiSuggestion)}</dd>
          <dt>人工下一步</dt>
          <dd>${escapeHtml(selectedItem.humanNextStep)}</dd>
        </dl>
        <div class="supplier-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities(selectedItem.disabledCapabilities)}
          </div>
        </div>
      </div>
      <div class="review-card">
        <h3>供应商预览状态</h3>
        <dl>
          <dt>数据来源</dt>
          <dd>${escapeHtml(isLive ? "实时只读制造能力数据派生" : "静态预览")}</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
          <dt>外发动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
    </div>
  `;
}

function getSupplierWorkflowViewModel() {
  const isLive = capabilityApiState.status === "loaded" && capabilityApiState.capabilities.length > 0;
  const items = isLive
    ? capabilityApiState.capabilities.map(mapCapabilityRecordToSupplierItem)
    : supplierWorkflowItems.map(normalizeStaticSupplierWorkflowItem);
  return {
    isLive,
    items,
    selectedItem: items[0] || normalizeStaticSupplierWorkflowItem(supplierWorkflowItems[0]),
    summaryCards: isLive ? buildSupplierSummaryCardsFromRecords(items) : supplierWorkflowSummaryCards,
    sourceLabel: isLive
      ? "实时只读数据"
      : capabilityApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览（安全示例）",
    queueCountLabel: isLive ? `${items.length} 条只读能力派生记录` : "5 条静态示例",
  };
}

function normalizeStaticSupplierWorkflowItem(item) {
  return {
    ...item,
    summary: item.summary || `${item.title}仅作为候选供应商预览，不能确认报价、交期或供应商承诺。`,
    matchedInquiries: item.matchedInquiries || "待人工匹配询盘",
    humanNextStep: item.humanNextStep || "由业务人员核对项目要求和供应商资料，再决定是否人工发起询价。",
    riskDescription: item.riskDescription || "不能直接确认报价、交期、安装效果或供应商正式承诺。",
  };
}

function mapCapabilityRecordToSupplierItem(record, index) {
  const capabilityItem = mapCapabilityRecordToWorkflowItem(record, index);
  const title = firstDisplayValue([
    record.supplier,
    record.company,
    record.title,
    record.name,
    record.supplier_name,
    record.company_name,
    record.vendor_name,
    record.factory_name,
    record.equipment,
    `只读供应商能力记录 ${index + 1}`,
  ]);
  return {
    title,
    capability: capabilityItem.process,
    status: firstDisplayValue([record.supplier_status, record.status, record.capability_status, "待人工核实"]),
    risk: capabilityItem.risk,
    riskTone: capabilityItem.riskTone,
    need: capabilityItem.missingInfo.join("、"),
    matchedInquiries: capabilityItem.matchedInquiries,
    summary: firstDisplayValue([
      record.summary,
      record.supplier_summary,
      record.public_description,
      record.internal_notes,
      `${title} / ${capabilityItem.process}`,
    ]),
    aiSuggestion: firstDisplayValue([
      record.ai_suggestion,
      record.suggestion,
      record.suggested_next_step,
      record.summary,
      record.public_description,
      "能力资料仅供候选匹配，必须人工确认供应商反馈后再使用。",
    ]),
    humanNextStep: firstDisplayValue([
      record.human_next_step,
      record.next_action,
      "人工核实供应商能力、报价有效期、交期和质量边界后再推进。",
    ]),
    riskDescription: capabilityItem.riskDescription,
    disabledCapabilities: ["不可发送 RFQ", "不可确认报价", "不可确认交期", "不可生成客户报价"],
  };
}

function buildSupplierSummaryCardsFromRecords(items) {
  const highRiskCount = items.filter((item) => item.risk === "高").length;
  const missingCount = items.filter((item) => item.need && item.need !== "能力资料待补充").length;
  const reviewCount = items.filter((item) => item.status.includes("核实") || item.status.includes("确认")).length;
  return [
    { label: "只读能力记录", value: String(items.length), subtitle: "从制造能力只读数据派生", tone: "info" },
    { label: "待报价确认", value: String(reviewCount || items.length), subtitle: "报价、有效期或币种需人工复核", tone: "warning" },
    { label: "能力匹配", value: String(items.length), subtitle: "仅作为候选供应商能力参考", tone: "neutral" },
    { label: "高风险供应商", value: String(highRiskCount), subtitle: "质保、责任或交期风险", tone: "danger" },
    { label: "待补资料", value: String(missingCount), subtitle: "系统、认证、包装或产能资料缺失", tone: "warning" },
    { label: "写入动作", value: "0", subtitle: "未连接 RFQ、报价或承诺动作", tone: "info" },
  ];
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
      ? renderDataStatus("error", "询盘 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${inquiryApiState.error}`)
      : renderDataStatus("success", "询盘数据已加载", `数据来源：${inquiryApiState.source}。只读询盘列表，未连接创建、AI 自动处理、发送、报价或 PI 动作。`);

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
          <dd>GET ${INQUIRIES_ENDPOINT}</dd>
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
    ${renderDataStatus("loading", "正在加载询盘", `正在使用当前管理员会话请求 GET ${INQUIRIES_ENDPOINT}。`)}
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
        : "静态预览（安全示例）",
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
    { label: "静态预览", value: "保留", subtitle: "实时数据不可用时显示安全示例", tone: "neutral" },
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
    endpoint: INQUIRIES_ENDPOINT,
    payloadKey: "inquiries",
    fallbackRecords: inquiryPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshInquiriesView,
  });
}

function refreshInquiriesView() {
  if (activeSectionId === "inquiries") {
    mainContent.innerHTML = renderInquiries();
    reviewPanel.innerHTML = renderInquiryReview();
  }
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

function createBusinessCardCaptureState() {
  return {
    status: "idle",
    summary: null,
    captureSources: [],
    extractionResults: [],
    profileDrafts: [],
    reviewQueue: [],
    duplicateChecks: [],
    followupDrafts: [],
    error: "",
    source: "not loaded",
  };
}

function createCustomerVerificationState() {
  return {
    status: "idle",
    summary: null,
    requests: [],
    evidence: [],
    scores: [],
    duplicateMatches: [],
    reviewQueue: [],
    reviews: [],
    error: "",
    source: "not loaded",
  };
}

function createFollowupAssistantState() {
  return {
    status: "idle",
    summary: null,
    candidates: [],
    missingInformation: [],
    recommendations: [],
    messageDrafts: [],
    reviewQueue: [],
    reviews: [],
    error: "",
    source: "not loaded",
  };
}

function createInquiryIntelligenceState() {
  return {
    status: "idle",
    summary: null,
    requests: [],
    classifications: [],
    missingInformation: [],
    quotationReadiness: [],
    supplierRequirements: [],
    replyDrafts: [],
    reviewQueue: [],
    reviews: [],
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
    const records = Array.isArray(payload[payloadKey]) ? payload[payloadKey] : Array.isArray(payload.records) ? payload.records : [];
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
      ? renderDataStatus("error", "产品 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${productApiState.error}`)
      : renderDataStatus("success", "产品数据已加载", `数据来源：${productApiState.source}。只读列表，未连接创建、更新或删除动作。`);

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
    draft: "产品信息仅以只读列表展示。当前不创建、不更新、不删除，也不发送消息、生成报价或 PI。",
  });
}

function renderProductsLoading() {
  return `
    ${renderDataStatus("loading", "正在加载产品", "正在使用当前管理员会话请求 GET /api/products。")}
    <div class="table-wrap table-skeleton" aria-label="Loading product rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderProductsEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时产品数据", "当前没有可用实时数据。本页面保持只读；创建或写入能力将在后续审批阶段开放。")}
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
    firstColumnSubtitle: (product) => product.code || product.id || "只读产品记录",
    bodyData: products,
  });
}

function renderReadOnlyProductCard() {
  return `
    <div class="form-card read-only-card">
      <h3>产品查看模式</h3>
      <p>该卡片仅用于内部试用查看，不提交数据、不创建记录。</p>
      <div class="form-grid">
        <label class="field">
          <span>允许动作</span>
          <input type="text" value="只读产品查看" readonly disabled aria-readonly="true" aria-disabled="true" title="只读预览，暂不支持产品编辑或写入" />
          <small>未连接创建、更新或删除 API。</small>
        </label>
        <label class="field">
          <span>业务线</span>
          <input type="text" value="A_ARCHITECTURAL / B_INDUSTRIAL / UNKNOWN" readonly disabled aria-readonly="true" aria-disabled="true" title="当前为内部试用，仅展示业务线枚举，不执行产品修改" />
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
  const workflowModel = getCapabilityWorkflowViewModel();
  if (capabilityApiState.status === "idle" || capabilityApiState.status === "loading") {
    return `
      ${renderManufacturingCapabilitiesLoading()}
      ${renderCapabilityWorkflowPreview(workflowModel)}
    `;
  }

  if (capabilityApiState.status === "empty") {
    return `
      ${renderManufacturingCapabilitiesEmpty()}
      ${renderCapabilityWorkflowPreview(workflowModel)}
    `;
  }

  const statusNotice =
    capabilityApiState.status === "error"
      ? renderDataStatus("error", "制造能力 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${capabilityApiState.error}`)
      : renderDataStatus("success", "制造能力数据已加载", `数据来源：${capabilityApiState.source}。只读列表，未连接创建、更新、删除或供应商确认动作。`);

  return `
    ${statusNotice}
    ${renderCapabilityWorkflowPreview(workflowModel)}
  `;
}

function renderManufacturingCapabilityReview() {
  const { selectedItem, isLive } = getCapabilityWorkflowViewModel();
  return `
    <div class="review-stack">
      <div class="review-card capability-review-card">
        <div class="capability-review-heading">
          <div>
            <h3>制造能力复核预览</h3>
            <p>${isLive ? "实时只读记录：" : "固定示例："}${escapeHtml(selectedItem.title)}。</p>
          </div>
          ${badge(isLive ? "实时只读数据" : "不承诺交期", isLive ? "active" : "pending")}
        </div>
        <dl>
          <dt>能力摘要</dt>
          <dd>${escapeHtml(selectedItem.summary)}</dd>
          <dt>适用询盘</dt>
          <dd>${escapeHtml(selectedItem.matchedInquiries)}</dd>
          <dt>加工方式</dt>
          <dd>${escapeHtml(selectedItem.process)}</dd>
          <dt>资料缺口</dt>
          <dd>${escapeHtml(selectedItem.missingInfo.join("、"))}</dd>
          <dt>风险点</dt>
          <dd>${escapeHtml(selectedItem.riskDescription)}</dd>
          <dt>AI 建议</dt>
          <dd>${escapeHtml(selectedItem.aiSuggestion)}</dd>
          <dt>人工下一步</dt>
          <dd>${escapeHtml(selectedItem.humanNextStep)}</dd>
        </dl>
        <div class="capability-review-group">
          <h4>禁用能力</h4>
          <div class="disabled-chip-row">
            ${renderDisabledCapabilities([...selectedItem.disabledCapabilities, "不可触发生产 / 发货"])}
          </div>
        </div>
      </div>
      <div class="review-card">
        <h3>制造能力 API 状态</h3>
        <dl>
          <dt>API 路由</dt>
          <dd>GET ${SUPPLIER_CAPABILITIES_ENDPOINT}</dd>
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
    ${renderDataStatus("loading", "正在加载制造能力", `正在使用当前管理员会话请求 GET ${SUPPLIER_CAPABILITIES_ENDPOINT}。`)}
    <div class="table-wrap table-skeleton" aria-label="Loading manufacturing capability rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderManufacturingCapabilitiesEmpty() {
  return `
    ${renderDataStatus("empty", "暂无实时制造能力数据", "当前没有可用实时数据。本页面保持只读；产能确认、供应商承诺和写入能力将在后续审批阶段规划。")}
  `;
}

function getCapabilityWorkflowViewModel() {
  const isLive = capabilityApiState.status === "loaded" && capabilityApiState.capabilities.length > 0;
  const items = isLive
    ? capabilityApiState.capabilities.map(mapCapabilityRecordToWorkflowItem)
    : capabilityWorkflowItems.map(normalizeStaticCapabilityWorkflowItem);
  return {
    isLive,
    items,
    selectedItem: items[0] || normalizeStaticCapabilityWorkflowItem(capabilityWorkflowItems[0]),
    summaryCards: isLive ? buildCapabilitySummaryCardsFromRecords(items) : capabilityWorkflowSummaryCards,
    sourceLabel: isLive
      ? "实时只读数据"
      : capabilityApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览（安全示例）",
    queueCountLabel: isLive ? `${items.length} 条只读记录` : "5 条静态示例",
  };
}

function normalizeStaticCapabilityWorkflowItem(item) {
  return {
    ...item,
    summary: item.summary || `${item.title}仅用于能力匹配预览，不能确认生产可行性、报价或交期。`,
    aiSuggestion: item.aiSuggestion || "先核对系统资料和供应商反馈，再由人工判断是否进入询价或报价准备。",
    humanNextStep: item.humanNextStep || "补齐技术资料并核实供应商能力，不在本页面承诺生产或发货。",
    riskDescription: item.riskDescription || "不能直接确认安装结果、生产可行性、正式报价或交期。",
  };
}

function mapCapabilityRecordToWorkflowItem(record, index) {
  record = record || {};
  const missingInfo = getCapabilityMissingInfo(record);
  const risk = deriveCapabilityRisk(record, missingInfo);
  const title = firstDisplayValue([
    record.title,
    record.name,
    record.capability_name,
    record.equipment,
    record.process,
    record.capability_line,
    `只读制造能力记录 ${index + 1}`,
  ]);
  return {
    title,
    process: firstDisplayValue([
      record.process,
      record.capability_category,
      record.manufacturing_method,
      record.equipment,
      record.capability_line,
      "能力资料待补充",
    ]),
    matchedInquiries: firstDisplayValue([
      record.matched_inquiries,
      record.business_note,
      record.company,
      record.supplier,
      record.product_category,
      record.capability_line,
      "需要供应商确认",
    ]),
    risk: risk.level,
    riskTone: risk.tone,
    missingInfo,
    summary: firstDisplayValue([
      record.public_description,
      record.summary,
      record.internal_notes,
      `${title} / ${record.monthly_capacity || "产能待确认"}`,
    ]),
    aiSuggestion: firstDisplayValue([
      record.ai_suggestion,
      record.suggested_next_step,
      record.public_description,
      "能力记录仅供查看，必须人工核实供应商反馈后再判断。",
    ]),
    humanNextStep: firstDisplayValue([
      record.human_next_step,
      record.next_action,
      "人工核实设备、产能、最大长度、质量边界和交期后再推进。",
    ]),
    riskDescription: risk.description,
    disabledCapabilities: ["不可确认生产", "不可确认交期", "不可生成正式报价"],
  };
}

function getCapabilityMissingInfo(record) {
  const missing = normalizeListValue(record.missing_info || record.missing_information || record.missingInfo);
  if (!missing.includes("信息待补充")) return missing;
  const inferredMissing = [];
  if (!hasDisplayValue([record.equipment])) inferredMissing.push("设备");
  if (!hasDisplayValue([record.monthly_capacity])) inferredMissing.push("月产能");
  if (!hasDisplayValue([record.max_length])) inferredMissing.push("最大长度");
  if (!hasDisplayValue([record.public_description])) inferredMissing.push("公开描述");
  return inferredMissing.length ? inferredMissing : ["能力资料待补充"];
}

function deriveCapabilityRisk(record, missingInfo) {
  const combinedText = [
    record.risk,
    record.risk_level,
    record.status,
    record.capability_status,
    record.public_description,
    record.internal_notes,
  ]
    .flat()
    .join(" ")
    .toLowerCase();
  const highRiskTerms = ["high", "高", "delivery", "quality", "claim", "refund", "warranty", "coastal", "责任", "质保", "赔付", "质量", "交期", "沿海"];
  if (highRiskTerms.some((term) => combinedText.includes(term))) {
    return {
      level: "高",
      tone: "danger",
      description: "能力记录包含交期、质量、质保、环境适配或责任相关风险，必须人工复核。",
    };
  }
  if (missingInfo.length > 0) {
    return {
      level: "中",
      tone: "warning",
      description: "能力资料仍有缺失，不能确认生产可行性、报价或交期。",
    };
  }
  return {
    level: "暂无风险等级",
    tone: "neutral",
    description: "暂无明确风险等级，仍需人工确认后再推进。",
  };
}

function buildCapabilitySummaryCardsFromRecords(items) {
  const missingCount = items.filter((item) => item.missingInfo.length > 0).length;
  const highRiskCount = items.filter((item) => item.risk === "高").length;
  const reviewCount = items.filter((item) => item.risk !== "暂无风险等级" || item.missingInfo.length > 0).length;
  return [
    { label: "只读能力", value: String(items.length), subtitle: "来自现有制造能力只读路径", tone: "info" },
    { label: "可匹配询盘", value: String(items.length), subtitle: "仅供人工能力匹配判断", tone: "neutral" },
    { label: "需技术确认", value: String(reviewCount || items.length), subtitle: "图纸、工艺或供应商反馈待补充", tone: "warning" },
    { label: "高风险工艺", value: String(highRiskCount), subtitle: "责任、质保或环境适配相关", tone: "danger" },
    { label: "待补资料", value: String(missingCount), subtitle: "材料、包装、产能或描述缺失", tone: "warning" },
    { label: "写入动作", value: "0", subtitle: "不确认生产、报价或交期", tone: "info" },
  ];
}

function renderCapabilityWorkflowPreview(model = getCapabilityWorkflowViewModel()) {
  return `
    <div class="capability-workflow-preview" aria-label="制造能力中心只读工作流预览">
      <div class="capability-workflow-header">
        <div>
          <span class="state-label">制造能力中心</span>
          <h3>制造能力中心</h3>
          <p>查看产品能力、加工方式、资料缺口和生产风险。</p>
          <p class="capability-safety-note">只读数据用于界面展示；所有生产能力、加工方案、交期和质量责任必须人工复核。</p>
        </div>
        <div class="workbench-badges">
          ${badge(model.sourceLabel, model.isLive ? "active" : "draft")}
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
          <span>${escapeHtml(model.sourceLabel)}</span>
        </div>
        <div class="capability-summary-grid">
          ${renderSummaryCards(model.summaryCards, renderCapabilitySummaryCard)}
        </div>
      </section>

      <section class="capability-workflow-section" aria-label="制造能力队列">
        <div class="workbench-section-header">
          <div>
            <h3>制造能力队列</h3>
            <p>队列只展示能力匹配和缺失资料，不确认生产可行性、交期或报价。</p>
          </div>
          <span>${escapeHtml(model.queueCountLabel)}</span>
        </div>
        <div class="capability-queue">
          ${model.items.map(renderCapabilityQueueItem).join("")}
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
          <small>未连接创建、更新或删除 API。</small>
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
    endpoint: SUPPLIER_CAPABILITIES_ENDPOINT,
    payloadKey: "manufacturing_capabilities",
    fallbackRecords: capabilityPreviewFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshManufacturingCapabilitiesView,
  });
}

function refreshManufacturingCapabilitiesView() {
  if (activeSectionId === "manufacturing-capabilities") {
    mainContent.innerHTML = renderManufacturingCapabilities();
    reviewPanel.innerHTML = renderManufacturingCapabilityReview();
  }
  if (activeSectionId === "suppliers") {
    mainContent.innerHTML = renderSuppliers();
    reviewPanel.innerHTML = renderSupplierReview();
  }
}

function renderAiDrafts() {
  const reviewModel = getAiReviewViewModel();
  if (aiDraftApiState.status === "idle" || aiDraftApiState.status === "loading") {
    return renderAiDraftsLoading(reviewModel);
  }

  const statusNotice =
    aiDraftApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时 AI 询盘分析草稿", "当前没有可用实时数据。AI 复核中心 V2 使用静态只读预览，不执行任何业务动作。")
      : aiDraftApiState.status === "error"
      ? renderDataStatus("error", "AI 询盘分析 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${aiDraftApiState.error}`)
      : renderDataStatus("success", "AI 询盘分析草稿已加载", `数据来源：${aiDraftApiState.source}。只读草稿列表，未连接发送、审批、应用建议、报价或 PI 动作。`);

  return `
    ${statusNotice}
    ${renderAiReviewCenterPreview(reviewModel)}
  `;
}

function getAiReviewViewModel() {
  const isLive = aiDraftApiState.status === "loaded" && aiDraftApiState.drafts.length > 0;
  const items = isLive
    ? aiDraftApiState.drafts.map(mapAiAnalysisRecordToReviewItem)
    : aiReviewQueueItems.map(normalizeStaticAiReviewItem);
  return {
    isLive,
    items,
    selectedItem: items[0] || normalizeStaticAiReviewItem(aiReviewQueueItems[0]),
    summaryCards: isLive ? buildAiReviewSummaryCardsFromRecords(items) : aiReviewSummaryCards,
    sourceLabel: isLive
      ? "实时只读数据"
      : aiDraftApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览（安全示例）",
    queueCountLabel: isLive ? `${items.length} 条只读记录` : "6 条静态示例",
  };
}

function normalizeStaticAiReviewItem(item) {
  return {
    ...item,
    summary: item.summary || `${item.title}需要人工复核，当前不能发送、审批、报价、生成 PI 或创建订单。`,
  };
}

function mapAiAnalysisRecordToReviewItem(record, index) {
  record = record || {};
  const extractedRequirements = record.extracted_requirements || record.requirements || record.analysis || {};
  const missingInfo = normalizeListValue(record.missing_information || record.missing_info || record.missingInfo);
  const riskFlags = normalizeListValue(record.risk_flags || record.riskFlags || record.risks);
  const risk = deriveAiReviewRisk(record, riskFlags, missingInfo);
  const title = firstDisplayValue([
    record.title,
    record.inquiry_title,
    extractedRequirements.product,
    extractedRequirements.project,
    record.detected_business_line,
    `AI 分析记录 ${index + 1}`,
  ]);

  return {
    title,
    type: firstDisplayValue([record.type, record.category, record.task_type, record.analysis_type, record.draft_type, "AI 分析记录"]),
    risk: risk.level,
    riskTone: risk.tone,
    status: normalizeAiReviewStatus(record.approval_status || record.status, record.approval_required),
    missingInfo,
    summary: firstDisplayValue([
      record.ai_summary,
      record.summary,
      record.analysis_summary,
      formatObjectSummary(extractedRequirements),
      title,
    ]),
    aiSuggestion: firstDisplayValue([
      record.suggestion,
      record.suggested_reply,
      record.ai_suggestion,
      record.recommended_reply,
      record.suggested_next_step,
      "已有 AI 分析记录仅供查看，必须由人工确认后再使用。",
    ]),
    humanNextStep: firstDisplayValue([
      record.human_next_step,
      record.next_action,
      record.next_step,
      "人工复核风险、缺失信息和业务边界后再决定下一步。",
    ]),
    disabledCapabilities: ["不可自动发送", "不可自动审批", "不可生成报价", "不可生成 PI", "不可确认订单"],
  };
}

function normalizeAiReviewStatus(value, approvalRequired) {
  const status = String(value ?? "").trim();
  const lowerStatus = status.toLowerCase();
  if (approvalRequired === true || lowerStatus.includes("review") || lowerStatus.includes("draft")) return "待人工复核";
  if (lowerStatus.includes("blocked") || lowerStatus.includes("reject")) return "禁止自动结论";
  if (!status) return "待人工复核";
  return status;
}

function deriveAiReviewRisk(record, riskFlags, missingInfo) {
  const combinedText = [
    record.risk,
    record.risk_level,
    record.action_boundary,
    record.approval_status,
    record.status,
    riskFlags,
    record.suggested_reply,
    record.ai_summary,
    record.summary,
  ]
    .flat()
    .join(" ")
    .toLowerCase();
  const highRiskTerms = ["blocked", "high", "高", "price", "payment", "delivery", "quality", "claim", "refund", "quotation", "pi", "赔付", "质量", "价格", "付款", "交期", "报价"];
  if (highRiskTerms.some((term) => combinedText.includes(term))) {
    return { level: "高", tone: "danger" };
  }
  if (missingInfo.length > 0 || riskFlags.length > 0) {
    return { level: "中", tone: "warning" };
  }
  return { level: "暂无风险等级", tone: "neutral" };
}

function formatObjectSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const summary = Object.entries(value)
    .filter(([, item]) => item !== undefined && item !== null && String(item).trim() !== "")
    .map(([key, item]) => `${key}: ${item}`)
    .join("，");
  return summary;
}

function buildAiReviewSummaryCardsFromRecords(items) {
  const highRiskCount = items.filter((item) => item.risk === "高").length;
  const missingCount = items.filter((item) => !item.missingInfo.includes("信息待补充") && item.missingInfo.length > 0).length;
  const reviewCount = items.filter((item) => item.status.includes("复核") || item.status.includes("禁止")).length;
  const suggestionCount = items.filter((item) => item.aiSuggestion && item.aiSuggestion !== "—").length;
  return [
    { label: "只读 AI 记录", value: String(items.length), subtitle: "来自现有 AI 分析只读路径", tone: "info" },
    { label: "高风险建议", value: String(highRiskCount), subtitle: "价格、付款、交期、质量或 PI 相关", tone: "danger" },
    { label: "缺失信息提醒", value: String(missingCount), subtitle: "规格、图纸、认证或客户信息缺失", tone: "warning" },
    { label: "待人工复核", value: String(reviewCount || items.length), subtitle: "不能自动发送或审批", tone: "warning" },
    { label: "已有建议文本", value: String(suggestionCount), subtitle: "仅展示已有分析或草稿", tone: "neutral" },
    { label: "写入动作", value: "0", subtitle: "未连接发送、审批、报价或 PI", tone: "info" },
  ];
}

function renderAiReviewCenterPreview(model = getAiReviewViewModel()) {
  return `
    <div class="ai-review-preview" aria-label="AI 复核中心只读工作流预览">
      <div class="ai-review-preview-header">
        <div>
          <span class="state-label">AI 复核中心</span>
          <h3>AI 复核中心</h3>
          <p>集中复核 AI 草稿、风险提醒、缺失信息和人工下一步建议。</p>
          <p class="ai-review-safety-note">只读数据用于界面展示；AI 仅可展示已有分析和草稿，所有发送、报价、PI、订单、赔付和交期承诺必须人工复核。</p>
        </div>
        <div class="ai-review-preview-badges">
          ${badge(model.sourceLabel, model.isLive ? "active" : "draft")}
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
          <p>${escapeHtml(model.isLive ? "只读统计来自现有 AI 分析记录，不代表审批或发送状态。" : "所有数字均为静态示例，不代表实时业务状态。")}</p>
        </div>
        <div class="ai-review-summary-grid">
          ${renderSummaryCards(model.summaryCards, renderAiReviewSummaryCard)}
        </div>
      </section>

      <section class="ai-review-section" aria-label="AI 复核队列">
        <div class="workbench-section-header">
          <div>
            <span>AI REVIEW QUEUE</span>
            <h3>AI 复核队列</h3>
          </div>
          <p>按风险和信息缺口整理，帮助操作员先判断再行动。${escapeHtml(model.queueCountLabel)}</p>
        </div>
        <div class="ai-review-queue">
          ${model.items.map(renderAiReviewQueueItem).join("")}
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
  const { selectedItem: selected, isLive } = getAiReviewViewModel();
  return `
    <div class="review-card ai-review-card" aria-label="AI 复核预览">
      <div class="ai-review-heading">
        <div>
          <span class="state-label">AI 复核预览</span>
          <h3>AI 复核预览</h3>
          <p>${isLive ? "实时只读记录：" : "固定示例："}${escapeHtml(selected.title)}。</p>
        </div>
        <div class="ai-review-meta">
          ${badge(isLive ? "实时只读数据" : "静态预览", isLive ? "active" : "draft")}
          ${badge("只读", "active")}
          ${badge("不自动发送", "pending")}
        </div>
      </div>
      <dl>
        <dt>复核摘要</dt>
        <dd>${escapeHtml(selected.summary)}</dd>
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
        <dd>AI 仅可展示已有分析和草稿；所有发送、报价、PI、订单、赔付和交期承诺必须人工复核。</dd>
      </dl>
      <div class="ai-review-group">
        <h4>禁用能力</h4>
        <div class="disabled-chip-row">
          ${renderDisabledCapabilities([...selected.disabledCapabilities, "不可下单", "不可触发付款 / 生产 / 发货"])}
        </div>
      </div>
      <div class="ai-review-group">
        <h4>技术说明</h4>
        <p>${isLive ? "实时只读数据。当前只展示既有记录，不调用 AI、不执行助手、不写入数据库。" : "静态预览数据。当前不调用 AI、不执行助手、不写入数据库。"}</p>
        <dl class="ai-review-technical">
          <dt>API 路由</dt>
          <dd>GET ${AI_REVIEW_ENDPOINT}</dd>
          <dt>记录数量</dt>
          <dd>${escapeHtml(String(aiDraftApiState.drafts.length))}</dd>
          <dt>写入动作</dt>
          <dd>未连接</dd>
        </dl>
      </div>
    </div>
  `;
}

function renderAiDraftsLoading(model = getAiReviewViewModel()) {
  return `
    ${renderDataStatus("loading", "正在加载 AI 询盘分析草稿", `正在使用当前管理员会话请求 GET ${AI_REVIEW_ENDPOINT}。`)}
    ${renderAiReviewCenterPreview(model)}
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

function getFileCenterViewModel() {
  const isLive = documentApiState.status === "loaded" && documentApiState.documents.length > 0;
  const items = isLive
    ? documentApiState.documents.map(mapDocumentRecordToFileItem)
    : fileCenterQueueItems.map(normalizeStaticFileCenterItem);
  return {
    isLive,
    items,
    selectedItem: items[0] || normalizeStaticFileCenterItem(fileCenterQueueItems[0]),
    summaryCards: isLive ? buildFileSummaryCardsFromRecords(items) : fileCenterSummaryCards,
    sourceLabel: isLive
      ? "实时只读数据"
      : documentApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览（安全示例）",
    queueCountLabel: isLive ? `${items.length} 条只读文件元数据` : "6 条静态示例",
  };
}

function normalizeStaticFileCenterItem(item) {
  return {
    ...item,
    reviewNote: item.reviewNote || item.aiSuggestion || "静态文件复核示例，仅用于界面验证。",
    humanNextStep: item.humanNextStep || "人工确认文件类型、关联业务和风险边界后再推进。",
    disabledCapabilities: item.disabledCapabilities || ["不可上传", "不可下载", "不可删除", "不可解析"],
  };
}

function mapDocumentRecordToFileItem(record, index) {
  record = record || {};
  const title = firstDisplayValue([record.title, record.name, `只读文件元数据 ${index + 1}`]);
  const fileType = firstDisplayValue([record.file_type, record.document_type, "文件资料"]);
  const linkedBusinessType = firstDisplayValue([record.linked_business_type, "未关联"]);
  const linkedBusinessId = firstDisplayValue([record.linked_business_id, ""]);
  const source = firstDisplayValue([record.source, "admin-read documents"]);
  const status = firstDisplayValue([record.status, "待人工复核"]);
  const risk = normalizeFileRisk(record.risk);
  const missingInfo = getDocumentMissingMetadata(record);
  const createdAt = formatDateValue(record.created_at);
  const updatedAt = formatDateValue(record.updated_at);
  const fileSize = formatFileSize(record.file_size);

  return {
    title,
    type: fileType,
    linkedBusiness: linkedBusinessId === "—" ? linkedBusinessType : `${linkedBusinessType} / ${linkedBusinessId}`,
    status,
    risk: risk.level,
    riskTone: risk.tone,
    missingInfo,
    reviewNote: `仅展示文件元数据：来源 ${source}，创建 ${createdAt}，更新 ${updatedAt}，大小 ${fileSize}。不读取文件内容。`,
    humanNextStep: "人工确认文件类型、关联业务和风险边界后，再决定是否进入文件归档、供应商询价或报价准备。",
    disabledCapabilities: ["不可上传", "不可下载", "不可删除", "不可解析 / OCR", "不可生成报价", "不可生成 PI"],
  };
}

function normalizeFileRisk(value) {
  const risk = String(value ?? "").trim();
  const lowerRisk = risk.toLowerCase();
  if (risk.includes("高") || lowerRisk.includes("high")) return { level: "高", tone: "danger" };
  if (risk.includes("中") || lowerRisk.includes("medium") || lowerRisk.includes("review")) return { level: "中", tone: "warning" };
  return { level: risk || "暂无风险等级", tone: "neutral" };
}

function getDocumentMissingMetadata(record) {
  const missing = [];
  if (!hasDisplayValue([record.title, record.name])) missing.push("文件名称");
  if (!hasDisplayValue([record.file_type, record.document_type])) missing.push("文件类型");
  if (!hasDisplayValue([record.linked_business_type])) missing.push("关联类型");
  if (!hasDisplayValue([record.linked_business_id])) missing.push("关联业务 ID");
  return missing.length ? missing : ["需要人工确认"];
}

function formatFileSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size) || size <= 0) return "未提供";
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${Math.round(size)} B`;
}

function buildFileSummaryCardsFromRecords(items) {
  const highRiskCount = items.filter((item) => item.risk === "高").length;
  const missingCount = items.filter((item) => !item.missingInfo.includes("需要人工确认")).length;
  const quoteDocCount = items.filter((item) => /报价|PI|合同|quotation|contract/i.test(`${item.title} ${item.type}`)).length;
  const drawingCount = items.filter((item) => /图纸|技术|drawing|cad|pdf/i.test(`${item.title} ${item.type}`)).length;
  return [
    { label: "只读文件", value: String(items.length), subtitle: "来自 admin-read 文件元数据", tone: "info" },
    { label: "缺失元数据", value: String(missingCount), subtitle: "名称、类型或关联业务待确认", tone: "warning" },
    { label: "图纸 / 技术资料", value: String(drawingCount), subtitle: "仅按文件名和类型保守识别", tone: "info" },
    { label: "报价 / PI / 合同", value: String(quoteDocCount), subtitle: "业务单据必须人工复核", tone: "danger" },
    { label: "高风险提醒", value: String(highRiskCount), subtitle: "价格、付款、交期或责任相关", tone: "danger" },
    { label: "写入动作", value: "0", subtitle: "不上传、下载、删除、解析或 OCR", tone: "neutral" },
  ];
}

function renderFiles() {
  const model = getFileCenterViewModel();
  const statusNotice =
    documentApiState.status === "loading"
      ? renderDataStatus("loading", "正在加载文件元数据", `正在使用当前管理员会话请求 GET ${DOCUMENTS_ENDPOINT}。`)
      : documentApiState.status === "error"
      ? renderDataStatus("error", "文件元数据 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${documentApiState.error}`)
      : documentApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时文件元数据", "当前没有可用文件元数据，继续显示静态预览（安全示例）。")
      : "";

  return `
    <div class="file-center-preview" aria-label="文件中心静态工作流预览">
      ${statusNotice}
      <div class="file-center-header">
        <div>
          <span class="state-label">文件中心</span>
          <h3>文件中心</h3>
          <p>集中查看询盘附件、图纸资料、合同单据、质量证据和缺失文件。</p>
          <p class="file-center-safety-note">${model.isLive ? "实时只读文件元数据，仅用于人工复核；不读取文件内容、不展示存储路径或下载链接。" : "静态预览数据，仅用于界面验证；所有文件解析、报价、PI、合同、订单、赔付和交期承诺必须人工复核。"}</p>
        </div>
        <div class="file-center-badges">
          ${badge(model.sourceLabel, model.isLive ? "active" : "draft")}
          ${badge("只读", "active")}
          ${badge("人工复核", "approval")}
          ${badge("不上传 / 下载 / 解析", "pending")}
        </div>
      </div>

      <section class="file-center-section" aria-label="文件复核概览">
        <div class="workbench-section-header">
          <div>
            <span>FILE REVIEW SUMMARY</span>
            <h3>文件复核概览</h3>
          </div>
          <p>${escapeHtml(model.isLive ? "只读统计来自文件元数据，不代表文件内容已读取或业务动作可执行。" : "所有文件记录均为静态示例，不代表真实客户文件。")}</p>
        </div>
        <div class="file-summary-grid">
          ${renderSummaryCards(model.summaryCards, renderFileSummaryCard)}
        </div>
      </section>

      <section class="file-center-section" aria-label="文件复核队列">
        <div class="workbench-section-header">
          <div>
            <span>FILE REVIEW QUEUE</span>
            <h3>文件复核队列</h3>
          </div>
          <p>按文件类型、风险和缺失资料整理，帮助操作员先复核再进入业务动作。${escapeHtml(model.queueCountLabel)}</p>
        </div>
        <div class="file-review-queue">
          ${model.items.map(renderFileQueueItem).join("")}
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
  const reviewNote = item.reviewNote || item.aiSuggestion || "需要人工确认文件元数据和业务边界。";

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
      <p><strong>复核说明：</strong>${escapeHtml(reviewNote)}</p>
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
  const { selectedItem: selected, isLive } = getFileCenterViewModel();
  const reviewNote = selected.reviewNote || selected.aiSuggestion || "需要人工确认文件元数据和业务边界。";
  return `
    <div class="review-card file-review-card" aria-label="文件复核预览">
      <div class="file-review-heading">
        <div>
          <span class="state-label">文件复核预览</span>
          <h3>文件复核预览</h3>
          <p>${isLive ? "实时只读记录：" : "固定示例："}${escapeHtml(selected.title)}。</p>
        </div>
        <div class="file-review-meta">
          ${badge(isLive ? "实时只读数据" : "静态预览", isLive ? "active" : "draft")}
          ${badge("只读", "active")}
          ${badge("不上传 / 下载 / 解析", "pending")}
        </div>
      </div>
      <dl>
        <dt>文件摘要</dt>
        <dd>${escapeHtml(reviewNote)}</dd>
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
        <dt>复核说明</dt>
        <dd>${escapeHtml(reviewNote)}</dd>
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
        <p>${isLive ? "本页只展示实时只读文件元数据；不读取文件内容、不展示存储路径或下载链接、不上传、不删除、不解析、不归档，也不生成报价、PI、合同或订单。" : "本页只展示静态文件复核预览；不读取真实文件、不上传、不删除、不解析、不归档，也不生成报价、PI、合同或订单。"}</p>
      </div>
    </div>
  `;
}

function renderQuotations() {
  const reviewModel = getQuoteReviewViewModel();
  const metadataModel = getQuotationMetadataViewModel();
  const statusNotice =
    preQuotationApiState.status === "loading"
      ? renderDataStatus("loading", "正在加载报价前复核", `正在请求 GET ${PRE_QUOTATION_REVIEW_ENDPOINT}。`)
      : preQuotationApiState.status === "error"
      ? renderDataStatus("error", "报价前复核 API 暂不可用", `${apiUnavailableMessage} 显示静态预览（安全示例）。系统提示：${preQuotationApiState.error}`)
      : preQuotationApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时报价前复核", "当前没有可用实时复核数据，继续显示静态预览（安全示例）。")
      : preQuotationApiState.status === "loaded"
      ? renderDataStatus("success", "报价前复核数据已加载", `数据来源：${preQuotationApiState.source}。只读复核列表，未连接价格计算、报价、PI、合同或订单动作。`)
      : "";
  const metadataStatusNotice =
    quotationMetadataApiState.status === "loading"
      ? renderDataStatus("loading", "正在加载报价元数据", `正在请求 GET ${QUOTATIONS_ENDPOINT}。`)
      : quotationMetadataApiState.status === "error"
      ? renderDataStatus("error", "报价元数据 API 暂不可用", `${apiUnavailableMessage} 显示静态预览 fallback。系统提示：${quotationMetadataApiState.error}`)
      : quotationMetadataApiState.status === "empty"
      ? renderDataStatus("empty", "暂无实时报价元数据", "当前没有可用实时报价元数据，继续显示静态预览 fallback。")
      : quotationMetadataApiState.status === "loaded"
      ? renderDataStatus("success", "报价元数据已加载", `数据来源：${quotationMetadataApiState.source}。只读报价记录，仅展示安全元数据，不展示明细、成本、利润、付款或银行信息。`)
      : "";
  return `
    <div class="quote-review-preview" aria-label="报价前复核只读工作流预览">
      ${statusNotice}
      <div class="quote-review-header">
        <div>
          <span class="state-label">报价前复核</span>
          <h3>报价前复核</h3>
          <p>集中检查客户需求、供应商报价、资料完整性、风险边界和人工报价准备状态。</p>
          <p class="quote-review-safety-note">只读数据用于界面展示；所有价格、报价、PI、合同、订单、付款、生产、发货和交期承诺必须人工复核。</p>
        </div>
        <div class="quote-review-badges">
          ${badge(reviewModel.sourceLabel, reviewModel.isLive ? "active" : "draft")}
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
          <p>${escapeHtml(reviewModel.isLive ? "只读统计来自 admin-read 复核记录，不代表价格、报价或 PI 可以使用。" : "所有报价状态均为静态示例，不代表真实业务状态。")}</p>
        </div>
        <div class="quote-summary-grid">
          ${renderSummaryCards(reviewModel.summaryCards, renderQuoteSummaryCard)}
        </div>
      </section>

      <section class="quote-review-section" aria-label="报价前复核队列">
        <div class="workbench-section-header">
          <div>
            <span>PRE-QUOTATION QUEUE</span>
            <h3>报价前复核队列</h3>
          </div>
          <p>先确认资料、供应商反馈和风险边界，再由人工准备报价资料。${escapeHtml(reviewModel.queueCountLabel)}</p>
        </div>
        <div class="quote-review-queue">
          ${reviewModel.items.map(renderQuoteQueueItem).join("")}
        </div>
      </section>

      <section class="quote-review-section quotation-metadata-section" aria-label="正式报价元数据只读列表">
        ${metadataStatusNotice}
        <div class="workbench-section-header">
          <div>
            <span>QUOTATION METADATA</span>
            <h3>正式报价元数据</h3>
          </div>
          <p>${escapeHtml(metadataModel.isLive ? "只读展示已存在的报价元数据，不计算价格、不生成报价单、不发送客户。" : "静态预览 fallback，不代表真实报价或客户可用状态。")}</p>
        </div>
        <div class="quotation-metadata-intro">
          <div>
            <span class="state-label">${escapeHtml(metadataModel.sourceLabel)}</span>
            <p>报价前复核用于判断资料是否适合人工准备报价；正式报价元数据只展示已有报价记录的安全摘要。</p>
          </div>
          <div class="quote-review-badges">
            ${badge("只读报价记录", "active")}
            ${badge("仅供内部查看", "draft")}
            ${badge("明细暂不展示", "pending")}
            ${badge("不发送客户", "pending")}
          </div>
        </div>
        <div class="quotation-metadata-grid">
          ${metadataModel.items.map(renderQuotationMetadataCard).join("")}
        </div>
      </section>
    </div>
  `;
}

function getQuoteReviewViewModel() {
  const isLive = preQuotationApiState.status === "loaded" && preQuotationApiState.reviews.length > 0;
  const items = isLive
    ? preQuotationApiState.reviews
    : quoteReviewQueueItems.map(normalizeStaticQuoteReviewItem);
  return {
    isLive,
    items,
    selectedItem: items[0] || normalizeStaticQuoteReviewItem(quoteReviewQueueItems[0]),
    summaryCards: isLive ? buildQuoteSummaryCardsFromRecords(items) : quoteReviewSummaryCards,
    sourceLabel: isLive
      ? "实时只读数据"
      : preQuotationApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览（安全示例）",
    queueCountLabel: isLive ? `${items.length} 条 admin-read 复核记录` : "6 条静态示例",
  };
}

function getQuotationMetadataViewModel() {
  const isLive = quotationMetadataApiState.status === "loaded" && quotationMetadataApiState.quotations.length > 0;
  const items = isLive
    ? quotationMetadataApiState.quotations
    : quotationMetadataFallback.map((record, index) => mapQuotationMetadataRecord(record, index));
  return {
    isLive,
    items,
    sourceLabel: isLive
      ? "实时只读数据"
      : quotationMetadataApiState.status === "error"
        ? "API 暂不可用，显示静态预览"
        : "静态预览 fallback",
  };
}

function normalizeQuotationMetadataRecords(records) {
  return (Array.isArray(records) ? records : []).map(mapQuotationMetadataRecord);
}

function mapQuotationMetadataRecord(record, index) {
  const status = normalizeQuotationMetadataStatus(record.quote_status || record.status || record.safety_status);
  return {
    quoteNo: firstDisplayValue([record.quote_no, record.quotation_no, record.code, `QT-META-${index + 1}`]),
    inquiryRef: firstDisplayValue([record.inquiry_id, record.inquiry_title, record.inquiry_ref, "询盘关联待人工确认"]),
    customerName: firstDisplayValue([record.customer_name, record.company_name, "客户信息待人工确认"]),
    quoteStatus: status,
    currency: normalizeQuotationCurrency(record.currency),
    totalAmount: normalizeQuotationAmount(record.total_amount, record.amount_total),
    itemCount: normalizeQuotationItemCount(record.item_count, record.items_count),
    reviewRequired: normalizeQuotationReviewRequired(record.human_review_required, status),
    safetyStatus: normalizeQuotationSafetyStatus(record.safety_status, status),
    createdAt: normalizeDateLabel(record.created_at),
    updatedAt: normalizeDateLabel(record.updated_at),
  };
}

function normalizeQuotationMetadataStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (!status) return "待人工复核";
  if (status.includes("missing") || status.includes("incomplete") || status.includes("信息待补充")) return "信息待补充";
  if (status.includes("draft") || status.includes("草稿")) return "草稿仅供内部查看";
  if (status.includes("review") || status.includes("pending") || status.includes("复核")) return "待人工复核";
  if (status.includes("approved") || status.includes("sent") || status.includes("confirmed")) return "状态需人工复核";
  return String(value);
}

function normalizeQuotationCurrency(value) {
  const currency = String(value || "").trim().toUpperCase();
  return currency || "USD";
}

function normalizeQuotationAmount(...values) {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  if (value === undefined) return "金额暂不展示";
  if (typeof value === "number" && Number.isFinite(value)) return `只读合计 ${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return String(value);
}

function normalizeQuotationItemCount(...values) {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  if (value === undefined) return "明细暂不展示";
  if (typeof value === "number" && Number.isFinite(value)) return `${value} 项（明细暂不展示）`;
  return `${String(value)}（明细暂不展示）`;
}

function normalizeQuotationReviewRequired(value, status) {
  if (value === false && status === "草稿仅供内部查看") return "仍需人工确认";
  return value === false ? "未标记，但仍需人工确认" : "待人工复核";
}

function normalizeQuotationSafetyStatus(value, status) {
  const safety = String(value || "").trim();
  if (safety) return safety;
  if (status === "信息待补充") return "资料待补充";
  if (status === "草稿仅供内部查看") return "仅供内部查看";
  return "人工复核必需";
}

function normalizeDateLabel(value) {
  const date = String(value || "").trim();
  return date || "日期待确认";
}

function renderQuotationMetadataCard(item) {
  return `
    <article class="quotation-metadata-card">
      <div class="quotation-metadata-card-header">
        <div>
          <span class="workbench-category">报价元数据</span>
          <h4>${escapeHtml(item.quoteNo)}</h4>
        </div>
        <span class="quote-status">${escapeHtml(item.quoteStatus)}</span>
      </div>
      <dl>
        <dt>客户</dt>
        <dd>${escapeHtml(item.customerName)}</dd>
        <dt>关联询盘</dt>
        <dd>${escapeHtml(item.inquiryRef)}</dd>
        <dt>币种 / 合计</dt>
        <dd>${escapeHtml(item.currency)} / ${escapeHtml(item.totalAmount)}</dd>
        <dt>明细</dt>
        <dd>${escapeHtml(item.itemCount)}</dd>
        <dt>人工复核</dt>
        <dd>${escapeHtml(item.reviewRequired)}</dd>
        <dt>安全状态</dt>
        <dd>${escapeHtml(item.safetyStatus)}</dd>
        <dt>更新时间</dt>
        <dd>${escapeHtml(item.updatedAt || item.createdAt)}</dd>
      </dl>
      <div class="disabled-chip-row">
        ${renderDisabledCapabilities(["不计算价格", "不生成报价单", "不发送客户", "不生成 PI / 合同 / 订单", "不展示报价明细"])}
      </div>
    </article>
  `;
}

function normalizePreQuotationReviewRecords(records) {
  return (Array.isArray(records) ? records : []).map((record, index) => {
    if (record.customerNeed || record.missingInfo || record.disabledCapabilities) {
      return normalizeStaticQuoteReviewItem(record);
    }
    return mapPreQuotationRecordToQuoteReviewItem(record, index);
  });
}

function mapPreQuotationRecordToQuoteReviewItem(record, index) {
  const missingInfo = normalizePreQuotationMissingInfo(record.missing_information);
  const status = normalizePreQuotationStatus(record.readiness_status, record.risk, missingInfo);
  const risk = normalizePreQuotationRisk(record.risk, missingInfo);
  const title = firstDisplayValue([
    record.inquiry_title,
    record.title,
    record.inquiry_id ? `报价前复核 ${record.inquiry_id}` : "",
    `报价前复核 ${index + 1}`,
  ]);

  return {
    title,
    status,
    risk: risk.level,
    riskTone: risk.tone,
    readiness: normalizePreQuotationReadiness(record.readiness_status, status),
    customerNeed: firstDisplayValue([
      record.product_summary,
      record.customer_name ? `${record.customer_name} 的报价前复核需求` : "",
      "客户需求待人工确认",
    ]),
    supplierStatus: normalizePreQuotationSupplierStatus(record.supplier_status),
    missingInfo,
    aiSuggestion: firstDisplayValue([
      record.ai_suggestion_summary,
      "只读报价前复核记录仅供人工参考，不能生成报价或确认价格。",
    ]),
    humanNextStep: firstDisplayValue([
      record.human_next_step,
      "人工补齐资料、确认供应商反馈和风险边界后，再决定是否准备报价资料。",
    ]),
    disabledCapabilities: ["不可生成报价", "不可计算价格", "不可生成 PI", "不可生成合同", "不可确认订单"],
    summary: firstDisplayValue([
      record.product_summary,
      record.customer_name ? `${record.customer_name} 的报价前复核资料需要人工确认。` : "",
      "报价前复核资料需要人工确认。",
    ]),
    riskDescription: risk.description,
  };
}

function normalizePreQuotationMissingInfo(value) {
  const items = normalizeListValue(value).filter((item) => item !== "—");
  return items.length ? items : ["需要人工确认"];
}

function normalizePreQuotationStatus(readinessStatus, riskValue, missingInfo) {
  const status = String(readinessStatus || "").trim();
  const risk = String(riskValue || "").trim();
  if (risk.includes("高")) return "待人工复核";
  if (status === "needs_customer_clarification") return "信息待补充";
  if (status === "needs_supplier_confirmation") return "供应商待确认";
  if (status === "missing_documents") return "文件待确认";
  if (status === "draft_only") return "草稿仅供参考";
  if (missingInfo.length > 0 && !missingInfo.includes("需要人工确认")) return "信息待补充";
  return "待人工复核";
}

function normalizePreQuotationReadiness(readinessStatus, statusLabel) {
  const status = String(readinessStatus || "").trim();
  if (status === "needs_customer_clarification") return "信息待补充";
  if (status === "needs_supplier_confirmation") return "供应商待确认";
  if (status === "missing_documents") return "文件待确认";
  if (status === "draft_only") return "草稿仅供参考";
  return statusLabel || "需要人工确认";
}

function normalizePreQuotationSupplierStatus(value) {
  const status = String(value || "").trim();
  if (!status) return "供应商待确认";
  if (status.includes("待确认") || status.includes("人工")) return status;
  return "供应商待确认";
}

function normalizePreQuotationRisk(value, missingInfo) {
  const risk = String(value || "").trim();
  if (risk.includes("高")) {
    return {
      level: "高",
      tone: "danger",
      description: "记录包含高风险提示，价格、报价、PI、合同、订单、付款、生产、发货和交期承诺都必须人工复核。",
    };
  }
  if (risk.includes("补充") || (missingInfo.length > 0 && !missingInfo.includes("需要人工确认"))) {
    return {
      level: "中",
      tone: "warning",
      description: "报价前资料仍需补充，不能确认价格、供应商报价、PI 或订单状态。",
    };
  }
  return {
    level: "暂无风险等级",
    tone: "neutral",
    description: "暂无明确风险等级，仍需人工确认后再推进报价前复核。",
  };
}

function normalizeStaticQuoteReviewItem(item) {
  return {
    ...item,
    summary: item.summary || `${item.title}仅用于报价前复核预览，不能生成报价、PI、合同或订单。`,
    riskDescription: item.riskDescription || "价格、报价、PI、合同、订单、付款、生产、发货和交期承诺都必须人工复核。",
  };
}

function mapInquiryRecordToQuoteReviewItem(record, index) {
  const inquiryItem = mapInquiryRecordToWorkflowItem(record, index);
  const missingInfo = inquiryItem.missingInfo;
  const risk = deriveQuoteReviewRisk(record, inquiryItem, missingInfo);
  return {
    title: `${inquiryItem.title} 报价前复核`,
    status: normalizeQuoteReviewStatus(record.status || record.inquiry_status, risk, missingInfo),
    risk: risk.level,
    riskTone: risk.tone,
    readiness: deriveQuoteReadiness(risk, missingInfo),
    customerNeed: firstDisplayValue([
      record.project_description,
      record.original_message,
      record.ai_summary,
      inquiryItem.summary,
      "客户需求待人工确认",
    ]),
    supplierStatus: firstDisplayValue([
      record.supplier_status,
      record.supplier_quote_status,
      record.supplier_feedback,
      record.supplier_notes,
      "供应商信息待确认",
    ]),
    missingInfo,
    aiSuggestion: firstDisplayValue([
      record.ai_suggestion,
      record.suggested_next_step,
      record.ai_summary,
      "只读询盘记录仅可用于报价前复核，不能生成报价或确认价格。",
    ]),
    humanNextStep: firstDisplayValue([
      record.human_next_step,
      record.next_action,
      record.next_step,
      "人工补齐资料、确认供应商反馈和风险边界后，再决定是否准备报价资料。",
    ]),
    disabledCapabilities: ["不可生成报价", "不可计算价格", "不可生成 PI", "不可确认订单"],
    summary: inquiryItem.summary,
    riskDescription: risk.description,
  };
}

function normalizeQuoteReviewStatus(value, risk, missingInfo) {
  const status = String(value ?? "").trim();
  const upperStatus = status.toUpperCase();
  if (risk.level === "高") return "高风险";
  if (missingInfo.length > 0 && !missingInfo.includes("信息待补充")) return "资料不完整";
  if (upperStatus.includes("MISSING")) return "资料不完整";
  if (upperStatus.includes("REVIEW") || upperStatus.includes("NEED")) return "待人工复核";
  return status || "待人工复核";
}

function deriveQuoteReadiness(risk, missingInfo) {
  if (risk.level === "高") return "禁止自动报价";
  if (missingInfo.length > 0 && !missingInfo.includes("信息待补充")) return "资料待补充";
  return "待人工复核";
}

function deriveQuoteReviewRisk(record, inquiryItem, missingInfo) {
  const combinedText = [
    record.risk,
    record.risk_level,
    record.risk_flags,
    record.status,
    record.original_message,
    record.project_description,
    record.ai_summary,
    inquiryItem.risk,
    inquiryItem.riskDescription,
  ]
    .flat()
    .join(" ")
    .toLowerCase();
  const highRiskTerms = ["high", "高", "price", "payment", "delivery", "quality", "claim", "refund", "quotation", "pi", "contract", "order", "赔付", "质量", "价格", "付款", "交期", "报价", "合同", "订单"];
  if (highRiskTerms.some((term) => combinedText.includes(term))) {
    return {
      level: "高",
      tone: "danger",
      description: "记录包含价格、付款、交期、质量、责任、报价、PI、合同或订单相关风险，必须人工复核。",
    };
  }
  if (missingInfo.length > 0) {
    return {
      level: "中",
      tone: "warning",
      description: "报价前资料仍有缺失，不能确认价格、供应商报价、PI 或订单状态。",
    };
  }
  return {
    level: "暂无风险等级",
    tone: "neutral",
    description: "暂无明确风险等级，仍需人工确认后再推进报价前复核。",
  };
}

function buildQuoteSummaryCardsFromRecords(items) {
  const missingCount = items.filter((item) => !item.missingInfo.includes("信息待补充") && item.missingInfo.length > 0).length;
  const highRiskCount = items.filter((item) => item.risk === "高").length;
  const supplierPendingCount = items.filter((item) => item.supplierStatus.includes("待确认")).length;
  const reviewCount = items.filter((item) => item.status.includes("复核") || item.status.includes("不完整") || item.status.includes("高风险")).length;
  return [
    { label: "只读询盘", value: String(items.length), subtitle: "来自现有询盘只读路径", tone: "info" },
    { label: "资料不完整", value: String(missingCount), subtitle: "规格、图纸、包装或交期资料缺失", tone: "warning" },
    { label: "供应商待确认", value: String(supplierPendingCount || items.length), subtitle: "供应商报价或能力反馈待人工确认", tone: "neutral" },
    { label: "高风险报价", value: String(highRiskCount), subtitle: "价格、付款、质量或责任边界相关", tone: "danger" },
    { label: "待人工复核", value: String(reviewCount || items.length), subtitle: "仅允许人工判断是否准备报价资料", tone: "warning" },
    { label: "写入动作", value: "0", subtitle: "不生成报价、PI、合同或订单", tone: "info" },
  ];
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
  const { selectedItem: selected, isLive } = getQuoteReviewViewModel();
  return `
    <div class="review-card quote-review-card" aria-label="报价前复核预览">
      <div class="quote-review-heading">
        <div>
          <span class="state-label">报价前复核预览</span>
          <h3>报价前复核预览</h3>
          <p>${isLive ? "实时只读记录：" : "固定示例："}${escapeHtml(selected.title)}。</p>
        </div>
        <div class="quote-review-meta">
          ${badge(isLive ? "实时只读数据" : "静态预览", isLive ? "active" : "draft")}
          ${badge("只读", "active")}
          ${badge("不生成报价", "pending")}
        </div>
      </div>
      <dl>
        <dt>复核摘要</dt>
        <dd>${escapeHtml(selected.summary)}</dd>
        <dt>客户需求</dt>
        <dd>${escapeHtml(selected.customerNeed)}</dd>
        <dt>供应商状态</dt>
        <dd>${escapeHtml(selected.supplierStatus)}</dd>
        <dt>风险点</dt>
        <dd><span class="quote-risk quote-risk-${escapeHtml(selected.riskTone)}">风险 ${escapeHtml(selected.risk)}</span> ${escapeHtml(selected.riskDescription)}</dd>
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
        <p>${isLive ? "实时只读数据。当前只展示既有询盘记录，不生成报价、不计算价格、不生成 PI、合同或订单。" : "静态预览数据。所有价格、报价、PI、合同、订单、赔付和交期承诺必须人工复核。"}</p>
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
          <p class="commercial-safety-note">当前为未来模块静态预览，仅供内部流程评审，不代表真实业务状态；所有价格、报价、PI、合同、订单、付款、生产、发货和赔付承诺必须人工复核。</p>
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
        <p>本页是未来模块静态预览，仅供内部流程评审；不调用 API、不写入数据、不执行审批、发送、报价、PI、订单、付款、生产或发货。</p>
      </div>
    </div>
  `;
}

function loadDocumentsReadOnly() {
  return loadReadOnlyList({
    state: documentApiState,
    collectionKey: "documents",
    endpoint: DOCUMENTS_ENDPOINT,
    payloadKey: "documents",
    fallbackRecords: fileCenterQueueItems,
    fallbackSource: fallbackLabel,
    refresh: refreshDocumentsView,
  });
}

function refreshDocumentsView() {
  if (activeSectionId !== "files") return;
  mainContent.innerHTML = renderFiles();
  reviewPanel.innerHTML = renderFileReview();
}

function loadPreQuotationReviewReadOnly() {
  return loadReadOnlyList({
    state: preQuotationApiState,
    collectionKey: "reviews",
    endpoint: PRE_QUOTATION_REVIEW_ENDPOINT,
    payloadKey: "pre_quotation_reviews",
    fallbackRecords: quoteReviewQueueItems,
    fallbackSource: fallbackLabel,
    refresh: refreshPreQuotationReviewView,
    normalize: normalizePreQuotationReviewRecords,
  });
}

function refreshPreQuotationReviewView() {
  if (activeSectionId !== "quotations") return;
  mainContent.innerHTML = renderQuotations();
  reviewPanel.innerHTML = renderQuotationReview();
}

function loadQuotationMetadataReadOnly() {
  return loadReadOnlyList({
    state: quotationMetadataApiState,
    collectionKey: "quotations",
    endpoint: QUOTATIONS_ENDPOINT,
    payloadKey: "quotations",
    fallbackRecords: quotationMetadataFallback,
    fallbackSource: fallbackLabel,
    refresh: refreshQuotationMetadataView,
    normalize: normalizeQuotationMetadataRecords,
  });
}

function refreshQuotationMetadataView() {
  if (activeSectionId !== "quotations") return;
  mainContent.innerHTML = renderQuotations();
  reviewPanel.innerHTML = renderQuotationReview();
}

function loadAiDraftsReadOnly() {
  return loadReadOnlyList({
    state: aiDraftApiState,
    collectionKey: "drafts",
    endpoint: AI_REVIEW_ENDPOINT,
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
                        : "静态示例";
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
                ? `<textarea readonly aria-readonly="true" title="仅示例字段，不会提交数据">${escapeHtml(value)}</textarea>`
                : `<input type="text" value="${escapeHtml(value)}" readonly aria-readonly="true" title="仅示例字段，不会提交数据" />`;
            return `
              <label class="field">
                <span>${escapeHtml(label)}</span>
                ${control}
                <small>只读字段样式示例；未连接保存或提交动作。</small>
              </label>
            `;
          })
          .join("")}
      </div>
      <div class="form-actions">
        <button class="button secondary mock-action" type="button" disabled aria-disabled="true" title="仅示例控件，不会取消或提交数据">取消 - 仅示例</button>
        <button class="button primary mock-action" type="button" disabled aria-disabled="true" title="仅模拟草稿按钮，不会保存或写入数据">保存草稿 - 仅模拟</button>
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
        <h3>草稿 / 复核说明</h3>
        <div class="draft-box">${escapeHtml(draft)}</div>
      </div>
      <div class="review-card">
        <h3>安全检查</h3>
        <ul class="check-list">
          <li>仅草稿 / 仅复核</li>
          <li>需要人工确认</li>
          <li>不自动发送</li>
          <li>不确认价格、付款、交期或 PI</li>
        </ul>
      </div>
    </div>
  `;
}

renderNav();
setSection("dashboard");
