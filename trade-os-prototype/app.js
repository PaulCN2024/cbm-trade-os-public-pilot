import {
  BusinessLine,
  DocumentItemType,
  DocumentStatus,
  DocumentType,
  ProductStatus,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
  ProjectStage,
  ProductionStatus,
  QuotationStatus,
  Source,
  ShipmentStatus,
  TaskStatus,
  TaskType,
  analyzeInquiry,
  buildBusinessFlowRows,
  createAlibabaInquiries,
  createAfterSalesCaseFromShipment,
  createBlankDocument,
  createCustomerFromInquiry,
  createCustomerFromLead,
  createEmptyDb,
  createFollowUpTask,
  createInquiryFromLead,
  createProductionOrderFromDocument,
  createOrderFromQuotation,
  createProjectFromInquiry,
  createQuotationDraft,
  createShipmentFromOrder,
  createRepeatBusinessReminder,
  documentArchiveInfo,
  duplicateDocument,
  ensureDocumentSeeds,
  ensureProductSeeds,
  importWebsiteInquiries,
  newId,
  productToDocumentItem,
  upsertCalculatedDocument,
  updateLeadStatus,
  updateAfterSalesFeedback,
  updateOrderMockStatus,
  updateInquiryStatus,
} from "../lib/mock-crm.js";
import {
  DATA_MODE,
  convertLeadToCustomer,
  dataModeLabel,
  importWebsiteInquiriesIntoCrm,
  loadPilotData,
  updateLeadReviewStatus,
} from "../lib/data-adapter.js";
import { getAdminSession, publicEnv, requireAdminAuth, signOutAdmin } from "../lib/admin-auth.js";
import {
  mapCustomerDocumentItem,
  mapProductionOrderItem,
} from "../lib/document-templates.js";
import {
  contextTargetSummary,
  hasCommandContext,
  resolveCommandContext,
} from "../lib/command-center/context-resolver.js";
import { buildContextWorkflow } from "../lib/command-center/context-workflow.js";
import {
  COMMAND_HISTORY_STORAGE_KEY,
  buildDocumentDraftReviewSummary,
  createFollowUpTaskDraft,
  findCommandHistoryRecord,
  generateDocumentDraftChecklist,
  listDocumentDraftReviewRecords,
  markWorkflowStepCompleted,
  saveManualReviewNote,
  updateManualReviewStatus,
  upsertCommandHistoryRecord,
} from "../lib/command-center/command-history.js";

const STORAGE_KEY = "cbm-trade-os-v2";

if (!requireAdminAuth()) {
  throw new Error("Admin login required");
}

const seedData = {
  customers: [
    {
      id: "cus-panaglass",
      name: "Demo Facade Buyer A",
      country: "Demo Market A",
      type: "幕墙/玻璃/门窗项目客户",
      status: "active",
      importance: "A",
      aliases: "Demo Facade Buyer, Demo Facade Group, Demo Project Holdings, Demo Import Company",
      summary:
        "核心项目客户。长期采购建筑铝型材、ACM、胶条、五金、保护膜、吊篮和配套材料；特别关注喷涂质量、保护包装、图纸版本和船期。",
      lastContact: "2026-05-14",
    },
    {
      id: "cus-davac",
      name: "Demo Aluminum Importer B",
      country: "Demo Market B",
      type: "铝型材进口客户",
      status: "active",
      importance: "B",
      aliases: "Demo Importer SAC, Corporacion Demo Importer SAC",
      summary:
        "秘鲁 Demo Port B 方向铝型材和五金客户。邮件中有 1x20GP、Demo Origin Port to Demo Port B、提单确认、重量声明、FOB 费用等物流执行内容。",
      lastContact: "2025-08-12",
    },
    {
      id: "cus-garo",
      name: "Demo Metal Works C",
      country: "Demo Market C",
      type: "铝材项目客户",
      status: "active",
      importance: "B",
      aliases: "Demo Metal Contact",
      summary:
        "以色列客户，涉及 TUV/SGS 第三方验货、装柜监督、按图纸尺寸抽检和 Alibaba Trade Assurance 流程。",
      lastContact: "2026-04-07",
    },
    {
      id: "cus-vkt",
      name: "Demo Window Fabricator D",
      country: "Demo Market D",
      type: "门窗/铝型材客户",
      status: "reference",
      importance: "B",
      aliases: "Demo Window Fabricator, Demo Window Fabricator Sdn Bhd",
      summary:
        "可作为独立站案例背书的历史客户线。资料中有推荐信和项目记录，适合后续沉淀为 case study。",
      lastContact: "2023-11-21",
    },
  ],
  projects: [
    {
      id: "prj-guyana",
      customerId: "cus-panaglass",
      name: "Demo Project Market Curtain Wall & ACM Supply",
      country: "Demo Project Market",
      type: "幕墙/ACM 项目",
      stage: "shipping",
      products: "Curtain wall profiles, ACM panels, hardware, gaskets, suspended platform",
      status: "多批次出货中",
      risk: "单证、分批发货、余额和证书需要持续跟进",
    },
    {
      id: "prj-oclub",
      customerId: "cus-panaglass",
      name: "Demo Tower Aluminium Order",
      country: "Demo Market A",
      type: "铝型材订单",
      stage: "production",
      products: "RAL 7016 smooth powder coating aluminium profiles",
      status: "客户已确认追加项和余额付款",
      risk: "6.4m 长度影响柜型；喷涂均匀性和厚塑料包装必须严格确认",
    },
    {
      id: "prj-celeste",
      customerId: "cus-panaglass",
      name: "Demo Residence Phase Orders",
      country: "Demo Market A",
      type: "门窗型材项目",
      stage: "production",
      products: "RAL 9016 / RAL 9011 window and door profiles",
      status: "多阶段订单持续推进",
      risk: "颜色、表面效果、图纸版本和客户公司主体变化需留痕",
    },
    {
      id: "prj-davac-callao",
      customerId: "cus-davac",
      name: "1x20GP Demo Origin Port to Demo Port B",
      country: "Demo Market B",
      type: "铝型材出货",
      stage: "shipping",
      products: "Aluminum profiles and hardware",
      status: "提单、重量声明、FOB 费用和放货资料已进入物流流程",
      risk: "柜况、提单确认、费用结算和公章文件要求需记录",
    },
    {
      id: "prj-garo-inspection",
      customerId: "cus-garo",
      name: "Pre-shipment Inspection",
      country: "Demo Market C",
      type: "质检/验货",
      stage: "inspection",
      products: "Aluminum profiles with drawing-based dimension inspection",
      status: "第三方验货流程跟进",
      risk: "TUV/SGS 服务范围、抽检数量、费用和验货日期需清晰归档",
    },
  ],
  leads: [
    {
      id: "lead-acm",
      title: "ACM A2 fireproof panel technical documents",
      source: "Gmail",
      customerId: "cus-panaglass",
      stage: "need_clarification",
      score: 92,
      summary:
        "客户需要 ACM 和 foil supplier brochure，并确认 6mm A2 core ACM 每平方米重量，供政府检查使用。",
      missing: "供应商正式资料、重量说明、证书文件",
    },
    {
      id: "lead-gasket",
      title: "EPDM curtain wall gasket quotation",
      source: "Gmail",
      customerId: "cus-panaglass",
      stage: "quoted",
      score: 87,
      summary:
        "客户需要用于 Nanping / Orion 幕墙型材的 EPDM 胶条，数量约 9000 米，并提供 CAD。",
      missing: "胶条断面确认、材质标准、包装和交期",
    },
    {
      id: "lead-balustrade",
      title: "Aluminium balustrade quote",
      source: "Gmail",
      customerId: "cus-panaglass",
      stage: "new",
      score: 78,
      summary:
        "客户询价 10mm 钢化玻璃用铝扶手系统，约 400m 型材和多种接头、盖帽、法兰。",
      missing: "表面处理、安装方式、测试订单数量、目的港",
    },
    {
      id: "lead-platform",
      title: "Suspended platform compliance documents",
      source: "Gmail",
      customerId: "cus-panaglass",
      stage: "need_clarification",
      score: 74,
      summary:
        "客户要求吊篮符合 EN 1808、CSA Z271、OSHA、ASME 等标准，并需要证书、手册和供应商确认。",
      missing: "最终型号、认证范围、供应商资料、英文技术文件",
    },
  ],
  quotes: [
    {
      id: "quo-oclub",
      projectId: "prj-oclub",
      no: "QT-Demo Tower-202603",
      customer: "Demo Facade Buyer",
      amount: 0,
      currency: "USD",
      status: "sent",
      items: "RAL 7016 smooth powder coating profiles, 6.4m length",
    },
    {
      id: "quo-acm",
      projectId: "prj-guyana",
      no: "QT-ACM-A2-202510",
      customer: "Demo Import Company / Demo Facade Buyer",
      amount: 0,
      currency: "USD",
      status: "negotiating",
      items: "6mm fireproof ACM, RAL BRUSH 9002 / 7005, milling and curve",
    },
  ],
  shipments: [
    {
      id: "shp-davac",
      projectId: "prj-davac-callao",
      route: "Demo Origin Port -> Demo Port B",
      container: "1x20GP",
      goods: "Aluminum profiles",
      status: "BL confirmed",
      eta: "2025-08-18",
      notes: "重量 9110kg、381 件、28CBM；有重量声明、公章、FOB 费用和放货流程。",
    },
    {
      id: "shp-guyana",
      projectId: "prj-guyana",
      route: "Qingdao/Demo Origin Port -> Demo Destination / Demo Transshipment Port",
      container: "40FT / 40HC 多批次",
      goods: "Aluminum profiles, ACM, hardware, platform",
      status: "Documents follow-up",
      eta: "TBD",
      notes: "多家公司抬头、多批 PI/PL/CI，需统一绑定到 Demo Project Market 项目。",
    },
  ],
  tasks: [
    {
      id: "task-1",
      title: "确认 Demo Tower 喷涂和包装要求",
      projectId: "prj-oclub",
      due: "Today",
      priority: "high",
      note: "客户明确要求 RAL 7016 smooth finish、喷涂均匀、保护贴和厚塑料膜。",
    },
    {
      id: "task-2",
      title: "整理 ACM 证书和每平方米重量说明",
      projectId: "prj-guyana",
      due: "This week",
      priority: "normal",
      note: "政府检查需要 supplier brochure 和 6mm A2 core 重量说明。",
    },
    {
      id: "task-3",
      title: "Demo Importer 出货单证归档",
      projectId: "prj-davac-callao",
      due: "This week",
      priority: "normal",
      note: "提单、重量声明、费用确认、ETA、放货记录需要归档。",
    },
  ],
  buildPlan: [
    {
      id: "build-1",
      phase: "Phase 1",
      title: "CBM 基础数据中心",
      status: "next",
      scope: "客户、联系人、公司别名、项目、询盘、报价、订单、出货、文件索引",
      outcome: "把 Drive、本地资料、Gmail 和 WhatsApp 学习结果落到统一数据结构。",
    },
    {
      id: "build-2",
      phase: "Phase 2",
      title: "独立站获客闭环",
      status: "in-progress",
      scope: "项目型询盘表单、CSV/邮件线索、产品页、案例页、SEO 页面",
      outcome: "新客户可以通过 CBM 独立站提交图纸、BOQ、目的港和报价需求。",
    },
    {
      id: "build-3",
      phase: "Phase 3",
      title: "AI 资料解析与报价助手",
      status: "planned",
      scope: "Excel/PDF 抽取、BOQ 导入、按 kg/m2/pcs 报价、版本对比",
      outcome: "系统自动提取产品、规格、颜色、重量、数量、金额和缺失信息。",
    },
    {
      id: "build-4",
      phase: "Phase 4",
      title: "单证与发货自动检查",
      status: "planned",
      scope: "PI/CI/PL/BL 一致性、柜号、重量、CBM、目的港、ETA",
      outcome: "发货前自动提示客户主体、件数、重量、CBM 和目的港风险。",
    },
    {
      id: "build-5",
      phase: "Phase 5",
      title: "WhatsApp/Gmail 只读学习与人工确认回复",
      status: "guarded",
      scope: "只读读取、话术学习、跟进任务、回复草稿、发送前人工确认",
      outcome: "最大化自动化，但所有外发消息都必须由你确认。",
    },
  ],
  whatsappSignals: [
    {
      id: "wa-kevin",
      contact: "Demo Contact A",
      country: "Demo Market A / Demo Project Market",
      type: "订单/技术/物流",
      score: 96,
      signal: "吊篮安装资料、BL/发票/装箱单/柜号对应关系、到港订单归属确认。",
      action: "建立订单-PI-PL-CI-BL-Container 映射，并生成技术资料包回复草稿。",
      status: "active-project",
    },
    {
      id: "wa-garo",
      contact: "Demo Metal Works Contact",
      country: "Demo Market C",
      type: "报价/质检/开模",
      score: 90,
      signal: "45 度切割、spacer、颜色数量变更、检测费、合同上传、喷涂脱落原因分析。",
      action: "把每次数量/颜色/加工费变化做成报价版本，并追踪验货决策。",
      status: "quote-review",
    },
    {
      id: "wa-davac",
      contact: "Demo Importer / Demo Market B forwarder",
      country: "Demo Market B",
      type: "单证/清关",
      score: 88,
      signal: "MBL、HBL、付款方、目的港申报名称不一致，已修改并发送新发票。",
      action: "运行单证主体一致性检查，记录文件版本和对方确认状态。",
      status: "docs-risk",
    },
    {
      id: "wa-Demo After-sales Contact",
      contact: "Demo After-sales Contact",
      country: "Unknown",
      type: "售后/替代件",
      score: 86,
      signal: "Pergola 电机损坏，替代电机尺寸、行程、直径、安装支架不匹配。",
      action: "创建售后问题单，收集原电机参数并匹配供应商替代件。",
      status: "after-sales",
    },
    {
      id: "wa-tubos",
      contact: "Demo Tube Inquiry",
      country: "Demo Market B",
      type: "西语询盘/开模",
      score: 82,
      signal: "客户询问薄壁铝管，当前无完全相同模具，需要样品或图纸确认开新模。",
      action: "启动西语样品/图纸/模具费/起订量收集流程。",
      status: "mold-check",
    },
    {
      id: "wa-ecuador",
      contact: "Demo Windows and Doors",
      country: "Ecuador",
      type: "社媒线索/需求收集",
      score: 73,
      signal: "西语沟通中要求客户提供简短产品清单。",
      action: "发送产品清单收集模板，并按门窗/型材/五金分类进入询盘池。",
      status: "need-list",
    },
    {
      id: "wa-arm",
      contact: "Demo Accessories (Paul)",
      country: "Vietnam / supplier coordination",
      type: "配件/内部确认",
      score: 70,
      signal: "列表摘要出现 ok let me check，可能是配件确认类任务。",
      action: "自动把 let me check 转成待办，要求补负责人和截止时间。",
      status: "task-needed",
    },
  ],
  replyDrafts: [
    {
      id: "draft-list-es",
      language: "Spanish",
      scenario: "西语新客户需求清单",
      title: "Solicitar lista de productos",
      text: "Buen día. Para cotizar correctamente, por favor envíeme una lista breve con producto, cantidad, medidas, color/RAL, acabado, puerto de destino y fotos o dibujos si los tiene.",
    },
    {
      id: "draft-docs-en",
      language: "English",
      scenario: "单证主体不一致",
      title: "Document consistency check",
      text: "Before we release the final documents, please confirm the exact company name for invoice, consignee, notify party and destination declaration, so the BL and payment records match for customs clearance.",
    },
    {
      id: "draft-engineer-en",
      language: "English",
      scenario: "客户需内部工程师确认",
      title: "Support engineer review",
      text: "No problem. I will prepare the key drawing, dimensions and technical notes so your engineer can review faster. Please tell me if they need DWG, PDF, photos or a sample reference.",
    },
    {
      id: "draft-mold-es",
      language: "Spanish",
      scenario: "无现成模具，需要样品/图纸",
      title: "Confirmar molde nuevo",
      text: "Actualmente no tenemos un molde exactamente igual. Si puede enviarnos una muestra o dibujo con medidas, espesor, tolerancia y acabado, podemos revisar el costo del molde, MOQ y tiempo de muestra.",
    },
  ],
  orderFlow: [
    {
      id: "flow-1",
      stage: "Lead",
      owner: "AI + Sales",
      trigger: "Website / Gmail / WhatsApp / Facebook / Instagram",
      automation: "识别国家、语言、产品、客户类型和缺失信息；低价值聊天自动过滤。",
    },
    {
      id: "flow-2",
      stage: "Technical Clarification",
      owner: "Sales + Engineer",
      trigger: "图纸、照片、样品、工程师确认",
      automation: "生成尺寸/RAL/表面处理/数量/证书/目的港清单，并把 let me check 转成任务。",
    },
    {
      id: "flow-3",
      stage: "Quote & Negotiation",
      owner: "Sales",
      trigger: "报价、改数量、加加工费、验货费、合同",
      automation: "保存报价版本，比较变更点，生成英文/西语解释和客户确认记录。",
    },
    {
      id: "flow-4",
      stage: "Order & Documents",
      owner: "Sales + Logistics",
      trigger: "PI、CI、PL、BL、付款、公司主体",
      automation: "检查买方/付款方/收货人/通知方/目的港申报一致性，绑定柜号和文件版本。",
    },
    {
      id: "flow-5",
      stage: "Shipment Tracking",
      owner: "Logistics",
      trigger: "装柜、开船、ETA、到港、清关",
      automation: "按柜号追踪状态，客户询问时自动找到对应订单和单证。",
    },
    {
      id: "flow-6",
      stage: "After-sales",
      owner: "Sales + Supplier",
      trigger: "安装问题、尺寸不符、故障件、政府检查",
      automation: "把视频/照片/图纸转成问题单，追踪原因、责任、替代件和最终关闭。",
    },
  ],
  prospects: [
    {
      id: "prospect-1",
      company: "Facade contractor - Colombia",
      country: "Colombia",
      segment: "幕墙承包商",
      channel: "LinkedIn",
      fit: 88,
      status: "research",
      need: "Curtain wall profiles, ACM, gaskets, project sourcing",
      nextAction: "查找采购/工程负责人，发送 Demo Project Market 项目型供应案例",
    },
    {
      id: "prospect-2",
      company: "Window fabricator - Chile",
      country: "Chile",
      segment: "门窗加工厂",
      channel: "Google SEO",
      fit: 82,
      status: "contacted",
      need: "Custom aluminum extrusion, RAL powder coating, hardware package",
      nextAction: "发送系统窗型材和表面处理能力介绍",
    },
    {
      id: "prospect-3",
      company: "Glass processor - Demo Market A",
      country: "Demo Market A",
      segment: "玻璃加工厂",
      channel: "Referral",
      fit: 79,
      status: "warm",
      need: "Mirror, protective film, ACM, installation accessories",
      nextAction: "用 Demo Facade Buyer 周边品类经验做轻量触达",
    },
  ],
  websitePages: [
    {
      id: "page-home",
      title: "Custom Aluminum Extrusion and Architectural Aluminum Project Supply",
      type: "Home",
      status: "draft",
      target: "海外门窗厂、幕墙公司、建材进口商",
      cta: "Upload drawings and request quotation",
      seo: "custom aluminum extrusion China, curtain wall profiles supplier",
    },
    {
      id: "page-curtain-wall",
      title: "Curtain Wall Aluminum Profiles and Project Packages",
      type: "Product",
      status: "priority",
      target: "幕墙公司、工程承包商",
      cta: "Send profile drawings",
      seo: "curtain wall aluminium profiles, pressure plate, mullion, cap",
    },
    {
      id: "page-acm",
      title: "A2 Fireproof ACM Panels for Facade Projects",
      type: "Product",
      status: "priority",
      target: "ACM 幕墙项目客户",
      cta: "Request panel schedule review",
      seo: "A2 fireproof ACM panel, aluminum composite panel facade",
    },
    {
      id: "page-case-guyana",
      title: "Demo Project Market Curtain Wall and ACM Project Supply Case",
      type: "Case Study",
      status: "review",
      target: "中南美工程客户",
      cta: "Discuss project supply",
      seo: "curtain wall project supply China, aluminium profile export case",
    },
  ],
  socialPosts: [
    {
      id: "post-1",
      platform: "LinkedIn",
      topic: "How to prepare aluminium profile drawings for fast quotation",
      audience: "工程师/采购",
      status: "draft",
      goal: "教育客户上传完整图纸和 RAL/finish 信息",
    },
    {
      id: "post-2",
      platform: "LinkedIn",
      topic: "What we check before shipping long aluminium profiles",
      audience: "门窗厂/进口商",
      status: "ready",
      goal: "展示包装、长度、柜型和装柜经验",
    },
    {
      id: "post-3",
      platform: "Facebook",
      topic: "ACM facade panel schedule review from China supplier",
      audience: "中南美幕墙客户",
      status: "draft",
      goal: "引导客户上传 panel schedule 和图纸",
    },
  ],
  campaigns: [
    {
      id: "camp-latam-curtain",
      name: "LATAM Curtain Wall Contractors",
      market: "Demo Market A, Colombia, Demo Market B, Chile",
      offer: "Curtain wall profiles + ACM + gasket + hardware project package",
      channel: "LinkedIn + Email + Website landing page",
      stage: "building-list",
      leads: 45,
      replies: 0,
      nextAction: "建立 100 家目标公司名单并分层",
    },
    {
      id: "camp-window-factory",
      name: "Window Fabricators Custom Extrusion",
      market: "Central America",
      offer: "Custom extrusion, powder coating, hardware sourcing, export documents",
      channel: "Google SEO + WhatsApp follow-up",
      stage: "content-ready",
      leads: 18,
      replies: 3,
      nextAction: "发布独立站产品页并跟进已回复客户",
    },
  ],
  inquiries: [],
  architectural_requirements: [],
  precision_requirements: [],
  quotations: [],
  orders: [],
  document_drafts: [],
  documents: [],
  sellers: [],
  products: [],
  after_sales_cases: [],
  follow_up_tasks: [],
  communication_logs: [],
  attachments: [],
};

const navItems = [
  ["dashboard", "⌂", "工作台"],
  ["actionCenter", "◧", "行动中心"],
  ["acquisition", "⊕", "获客中心"],
  ["flow", "⇢", "业务链路"],
  ["customers", "◫", "客户 360"],
  ["prospects", "◎", "潜客"],
  ["leadPool", "◉", "线索池"],
  ["leads", "◇", "询盘池"],
  ["website", "▣", "独立站"],
  ["alibaba", "▧", "阿里巴巴询盘"],
  ["social", "◌", "社媒"],
  ["campaigns", "◈", "开发活动"],
  ["whatsapp", "◍", "WhatsApp"],
  ["automation", "⌬", "订单自动化"],
  ["projects", "▦", "项目"],
  ["products", "▨", "产品库"],
  ["quotes", "≋", "报价"],
  ["documents", "▥", "单据中心"],
  ["commandCenter", "⌘", "指令中心"],
  ["orders", "▤", "订单"],
  ["shipments", "⇄", "出货"],
  ["afterSales", "↺", "售后"],
  ["assistant", "✦", "AI 助手"],
];

let state = loadState();
const initialUrlParams = new URLSearchParams(window.location.search);
const commandCenterContext = resolveCommandContext(initialUrlParams);
commandCenterContext.command_id ||= initialUrlParams.get("command_id") || "";
commandCenterContext.command_summary ||= initialUrlParams.get("command_summary") || "";
let view = commandCenterContext.view || "dashboard";
let searchTerm = "";
let selectedInquiryId = commandCenterContext.inquiry_id || initialUrlParams.get("inquiry") || "";
let selectedCustomerId = commandCenterContext.customer_id || initialUrlParams.get("customer") || "";
let selectedQuoteId = "";
let selectedProjectId = commandCenterContext.project_id || initialUrlParams.get("project") || "";
let selectedOrderId = "";
let selectedShipmentId = "";
let selectedDocumentId = commandCenterContext.document_id || commandCenterContext.draft_id || initialUrlParams.get("document") || "";
let selectedProductId = "";
let selectedLeadId = commandCenterContext.lead_id || "";
let selectedTaskId = commandCenterContext.task_id || "";
let commandHistory = loadCommandHistory();
const adminIdentityEl = document.querySelector("#adminIdentity");
const leadFilters = {
  source: "ALL",
  status: "ALL",
  business_line: "ALL",
  score: "ALL",
};
const inquiryFilters = {
  business_line: "ALL",
  status: "ALL",
  source: "ALL",
  score: "ALL",
};
const documentFilters = {
  customer: "ALL",
  project: "ALL",
  type: "ALL",
  status: "ALL",
};
const productFilters = {
  type: "ALL",
  status: "ALL",
};

const app = document.querySelector("#app");
const nav = document.querySelector("#nav");
const pageTitle = document.querySelector("#pageTitle");
const searchInput = document.querySelector("#globalSearch");
const dialog = document.querySelector("#entityDialog");
const entityForm = document.querySelector("#entityForm");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogFields = document.querySelector("#dialogFields");

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = structuredClone(seedData);
    ensureDocumentSeeds(initial);
    ensureProductSeeds(initial);
    return initial;
  }
  try {
    return normalizeState(JSON.parse(stored));
  } catch {
    return structuredClone(seedData);
  }
}

function normalizeState(saved) {
  const next = structuredClone(seedData);
  Object.entries(saved || {}).forEach(([key, value]) => {
    if (Array.isArray(next[key]) && Array.isArray(value)) next[key] = value;
  });
  const db = createEmptyDb(next);
  next.customers = db.customers;
  next.leads = db.leads;
  next.inquiries = db.inquiries;
  next.architectural_requirements = db.architectural_requirements;
  next.precision_requirements = db.precision_requirements;
  next.projects = db.projects;
  next.quotations = db.quotations;
  next.orders = db.orders;
  next.shipments = db.shipments;
  next.document_drafts = db.document_drafts;
  next.documents = db.documents;
  next.sellers = db.sellers;
  next.products = db.products;
  next.after_sales_cases = db.after_sales_cases;
  next.follow_up_tasks = db.follow_up_tasks;
  next.communication_logs = db.communication_logs;
  next.attachments = db.attachments;
  ensureDocumentSeeds(next);
  ensureProductSeeds(next);
  return next;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderAdminIdentity() {
  if (!adminIdentityEl) return;
  const env = publicEnv();
  const session = getAdminSession();
  const adminEmail = session?.user?.email || (DATA_MODE === "mock" ? "mock mode" : "not signed in");
  const supabaseConfigured = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  adminIdentityEl.innerHTML = `
    <span><strong>Admin:</strong> ${adminEmail}</span>
    <span><strong>Mode:</strong> ${DATA_MODE}</span>
    <span><strong>Supabase:</strong> ${supabaseConfigured ? "configured" : "not configured"}</span>
  `;
}

async function refreshPilotDataFromAdapter(showError = false) {
  if (DATA_MODE !== "supabase") return;
  try {
    const pilot = await loadPilotData();
    state.leads = pilot.leads || [];
    state.customers = pilot.customers || [];
    state.inquiries = pilot.inquiries || [];
    state.follow_up_tasks = pilot.follow_up_tasks || [];
    state.attachments = pilot.attachments || [];
    saveState();
    render();
  } catch (error) {
    console.warn("Supabase pilot refresh failed", error);
    if (showError) {
      alert(`Supabase pilot refresh failed: ${error.message}. Mock modules remain available.`);
    }
  }
}

async function importWebsiteLeads() {
  const result = await importWebsiteInquiriesIntoCrm();
  if (DATA_MODE === "supabase") {
    await refreshPilotDataFromAdapter(true);
    alert("Supabase pilot mode: website inquiries are read from /api/inquiries. No local import is required.");
    return;
  }
  const imported = result.imported || [];
  if (!imported.length) {
    alert("没有新的独立站询盘可导入。请先在 CBM 独立站提交测试询盘，或确认旧数据已导入。");
    return;
  }
  state = result.db || state;
  render();
  alert(`已导入 ${imported.length} 条独立站询盘，并生成 Lead / Inquiry / Requirement / Follow-up。`);
}

function runFullDemoFlow() {
  let inquiry = selectedInquiryId ? state.inquiries.find((item) => item.id === selectedInquiryId) : state.inquiries[0];
  if (!inquiry) {
    const lead = {
      id: newId("lead"),
      title: "Demo precision aluminum RFQ",
      company: "Demo Precision Buyer",
      name: "Demo Purchasing Manager",
      email: "buyer@example.com",
      whatsapp: "+00 000 000 000",
      country: "Demo Market",
      business_line: BusinessLine.PRECISION,
      source: Source.WEBSITE,
      project_type: "CNC aluminum parts and machined extrusion components",
      summary:
        "Customer needs CNC aluminum parts, custom extruded and machined aluminum components, anodized finish, quantity and tolerance to be reviewed manually.",
      score: 88,
      status: "NEW",
      created_at: new Date().toISOString(),
    };
    state.leads.unshift(lead);
    inquiry = createInquiryFromLead(state, lead.id);
  }

  const customer = createCustomerFromInquiry(state, inquiry.id);
  const project = createProjectFromInquiry(state, inquiry.id);
  const quotation = inquiry.quotation_id
    ? state.quotations.find((item) => item.id === inquiry.quotation_id)
    : createQuotationDraft(state, inquiry.id, "inquiry");
  const order = quotation ? createOrderFromQuotation(state, quotation.id) : null;
  const shipment = order ? createShipmentFromOrder(state, order.id) : null;
  const afterSalesCase = shipment ? createAfterSalesCaseFromShipment(state, shipment.id) : null;
  const repeatTask = afterSalesCase ? createRepeatBusinessReminder(state, afterSalesCase.id) : null;

  selectedInquiryId = inquiry.id;
  selectedCustomerId = customer?.id || selectedCustomerId;
  saveState();
  render();
  alert(
    [
      "Full demo flow 已生成：",
      `Customer: ${customer?.name || "-"}`,
      `Project: ${project?.title || project?.name || "-"}`,
      `Quotation: ${quotation?.quote_no || "-"}`,
      `Order: ${order?.order_no || "-"}`,
      `Shipment: ${shipment?.shipment_no || "-"}`,
      `After-sales: ${afterSalesCase?.case_no || "-"}`,
      `Repeat task: ${repeatTask?.title || "-"}`,
      "所有报价、PI、价格、交期和付款条款仍需人工审核。",
    ].join("\n"),
  );
}

function resetData() {
  state = structuredClone(seedData);
  ensureDocumentSeeds(state);
  ensureProductSeeds(state);
  saveState();
  render();
}

function customerName(id) {
  return state.customers.find((item) => item.id === id)?.name || "未绑定客户";
}

function projectName(id) {
  return state.projects.find((item) => item.id === id)?.name || "未绑定项目";
}

function matches(value) {
  if (!searchTerm) return true;
  return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
}

function statusBadge(status) {
  const lower = String(status || "").toLowerCase();
  let kind = "";
  if (["active", "sent", "shipping", "quoted", "bl confirmed"].some((key) => lower.includes(key))) kind = "ok";
  if (["need", "production", "inspection", "negotiating"].some((key) => lower.includes(key))) kind = "warning";
  if (["risk", "blocked", "lost"].some((key) => lower.includes(key))) kind = "danger";
  return `<span class="badge ${kind}">${status || "open"}</span>`;
}

function renderNav() {
  nav.innerHTML = navItems
    .map(
      ([id, icon, label]) =>
        `<button type="button" class="${view === id ? "active" : ""}" data-view="${id}"><span>${icon}</span>${label}</button>`,
    )
    .join("");
}

function setView(next) {
  view = next;
  render();
}

function render() {
  renderNav();
  renderAdminIdentity();
  const item = navItems.find(([id]) => id === view);
  pageTitle.textContent = item?.[2] || "Dashboard";
  const renderer = {
    dashboard: renderDashboard,
    actionCenter: renderActionCenter,
    acquisition: renderAcquisition,
    flow: renderFlowCenter,
    customers: renderCustomers,
    prospects: renderProspects,
    leadPool: renderLeadPool,
    leads: renderLeads,
    website: renderWebsite,
    alibaba: renderAlibaba,
    social: renderSocial,
    campaigns: renderCampaigns,
    whatsapp: renderWhatsapp,
    automation: renderAutomation,
    projects: renderProjects,
    products: renderProducts,
    quotes: renderQuotes,
    documents: renderDocuments,
    commandCenter: renderCommandCenter,
    orders: renderOrders,
    shipments: renderShipments,
    afterSales: renderAfterSales,
    assistant: renderAssistant,
  }[view];
  app.innerHTML = renderCommandCenterContextBanner() + renderer();
  bindViewEvents();
  scrollContextTargetIntoView();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function commandContextWarnings() {
  if (!hasCommandContext(commandCenterContext)) return [];
  const warnings = [...(commandCenterContext.warnings || [])];
  if (commandCenterContext.customer_id && !state.customers.some((item) => item.id === commandCenterContext.customer_id)) {
    warnings.push("未找到目标记录，当前显示模块概览。");
  }
  if (commandCenterContext.lead_id && !state.leads.some((item) => item.id === commandCenterContext.lead_id)) {
    warnings.push("未找到目标记录，当前显示模块概览。");
  }
  if (commandCenterContext.inquiry_id && !state.inquiries.some((item) => item.id === commandCenterContext.inquiry_id)) {
    warnings.push("未找到目标记录，当前显示模块概览。");
  }
  if (commandCenterContext.task_id && !state.follow_up_tasks.some((item) => item.id === commandCenterContext.task_id)) {
    warnings.push("未找到目标记录，当前显示模块概览。");
  }
  const documentTarget = commandCenterContext.document_id || commandCenterContext.draft_id;
  if (documentTarget && !state.documents.some((item) => item.id === documentTarget)) {
    warnings.push("未找到目标记录，当前显示模块概览。");
  }
  return [...new Set(warnings)];
}

function contextRecommendedAction() {
  if (!hasCommandContext(commandCenterContext)) return "";
  if (view === "documents") return "检查草稿上下文，人工确认字段后再导出。";
  if (view === "customers") return "查看客户 360 历史记录，并选择下一步安全跟进。";
  if (view === "leads") return "先检查询盘详情和缺失信息，再进入报价工作。";
  if (view === "leadPool") return "审核线索质量，确认合格后再手动转客户。";
  if (view === "actionCenter") return "检查跟进优先级；发送客户消息仍需人工审核。";
  return "检查已打开的模块。系统不会自动执行高风险动作。";
}

function commandStatusLabel(value) {
  const labels = {
    pending: "待处理",
    completed: "已完成",
    blocked: "已阻止",
    skipped: "已跳过",
    draft_only: "仅草稿",
    review_pending: "待审核",
    reviewed: "已内部审核",
    created_draft: "已创建草稿",
    planned: "已生成计划",
    previewed: "已预览",
    confirmed: "已确认",
    executed: "已执行",
    resumed: "已恢复",
    cancelled: "已取消",
    blocked_requires_manual_review: "已阻止，需人工审核",
    required: "需要",
    not_required: "不需要",
  };
  return labels[String(value || "").toLowerCase()] || value || "-";
}

function commandWorkflowTitle(value) {
  const labels = {
    "Document Center workflow": "单据中心流程",
    "Document Draft Workflow": "单据草稿流程",
    "Customer Context Workflow": "客户上下文流程",
    "Inquiry Context Workflow": "询盘上下文流程",
    "Lead Review Workflow": "线索审核流程",
    "Follow-up Workflow": "跟进流程",
    "Command Center Workflow": "指令中心流程",
  };
  return labels[value] || value || "指令上下文流程";
}

function commandProgressSummaryLabel(value) {
  return String(value || "")
    .replaceAll("completed", "已完成")
    .replaceAll("pending", "待处理")
    .replaceAll("blocked", "已阻止");
}

function commandLinkLabel(value) {
  const labels = {
    "Return to Command Center": "返回指令中心",
    "Document Center": "单据中心",
    "Customer 360": "客户 360",
    "Inquiry Detail": "询盘详情",
    "Lead Review": "线索审核",
    "Follow-up Workbench": "跟进工作台",
  };
  return labels[value] || value || "";
}

function commandActionLabel(value) {
  const text = String(value || "");
  const exact = {
    "Copy context summary": "复制上下文摘要",
    "Return to Command Center": "返回指令中心",
    "Create follow-up task draft": "创建跟进任务草稿",
    "Review Customer 360 history": "查看客户 360 历史",
    "Review inquiry details": "检查询盘详情",
    "Review lead quality": "审核线索质量",
    "Review follow-up priority": "检查跟进优先级",
    "Find customer/project reference": "查找客户/项目引用",
    "Prepare document draft data": "准备单据草稿数据",
    "Check forbidden customer fields": "检查禁用字段",
    "Calculate totals": "计算合计",
    "Build archive file name": "生成归档文件名",
    "Mark manual review required": "标记为需要人工审核",
    "Create Follow-up Task": "创建跟进任务草稿",
    "Copy Draft Summary": "复制草稿摘要",
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
    "Send official quotation": "发送正式报价",
    "Send official PI": "发送正式 PI",
    "Confirm bank account": "确认银行信息",
    "Confirm payment terms": "确认付款条款",
    "Confirm delivery time": "确认交期",
    "Send customer message": "发送客户消息",
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
    .replaceAll("No automatic", "不自动")
    .replaceAll("Send", "发送")
    .replaceAll("Confirm", "确认")
    .replaceAll("Export", "导出")
    .replaceAll("automatically", "自动");
}

function renderCommandCenterContextBanner() {
  if (!hasCommandContext(commandCenterContext)) return "";
  const commandHistoryRecord = findCommandHistoryRecord(commandHistory, commandCenterContext.command_id);
  const rows = contextTargetSummary(commandCenterContext)
    .map(([key, value]) => `<span class="context-chip">${escapeHtml(key)}=${escapeHtml(value)}</span>`)
    .join("");
  const warnings = commandContextWarnings();
  const workflow = buildContextWorkflow({
    ...commandCenterContext,
    view,
    warnings,
    command_history_record: commandHistoryRecord,
  });
  return `
    <section class="context-banner workflow-panel" data-command-context-panel>
      <div class="context-workflow-head">
        <div>
          <strong>来自指令中心</strong>
          <h2>${escapeHtml(commandWorkflowTitle(workflow.title))}</h2>
          <p>${escapeHtml(workflow.command_summary)}</p>
          ${workflow.command_status ? `<p><strong>状态:</strong> ${escapeHtml(commandStatusLabel(workflow.command_status))} · <strong>识别意图:</strong> ${escapeHtml(workflow.parsed_intent || "-")} · ${escapeHtml(commandProgressSummaryLabel(workflow.workflow_progress_summary))}</p>` : ""}
        </div>
        <div class="context-actions">
          <button class="ghost-button" data-context-action="copy" type="button">复制上下文摘要</button>
          <button class="ghost-button" data-context-action="draft-follow-up" type="button">创建跟进任务草稿</button>
          <button class="ghost-button" data-context-action="document-checklist" type="button">生成单据草稿检查清单</button>
          <button class="ghost-button" data-context-action="mark-review-pending" type="button">标记为待审核</button>
          <button class="ghost-button" data-context-action="clear" type="button">清除上下文</button>
          <a class="ghost-button" href="${escapeHtml(workflow.return_to_command_center_url)}">返回指令中心</a>
          ${commandCenterContext.command_id ? `<a class="ghost-button" href="${escapeHtml(workflow.return_to_command_center_url)}">继续处理流程</a>` : ""}
        </div>
      </div>
      <div class="context-banner-main">
        <span class="context-chip">source=${escapeHtml(commandCenterContext.source)}</span>
        <span class="context-chip">view=${escapeHtml(view)}</span>
        ${rows}
        <span class="context-next-action">${escapeHtml(workflow.target_summary || contextRecommendedAction())}</span>
        ${workflow.warnings.map((warning) => `<span class="context-warning">${escapeHtml(warning)}</span>`).join("")}
      </div>
      ${commandCenterContext.command_id ? `
        <div class="review-note-box">
          <label for="contextReviewNote">审核备注 <span>仅内部使用，不会发送给客户</span></label>
          <textarea id="contextReviewNote" data-context-review-note rows="2" placeholder="记录人工审核意见或下一步内部处理说明。">${escapeHtml(commandHistoryRecord?.manual_review_note || "")}</textarea>
          <button class="ghost-button" data-context-action="save-review-note" type="button">保存审核备注</button>
        </div>
      ` : ""}
      <div class="context-workflow-grid">
        ${workflow.workflow_progress.length ? `
        <div>
          <h3>流程进度</h3>
          <ol class="workflow-progress-list">
            ${workflow.workflow_progress.map((step) => `
              <li>
                <span class="workflow-status ${escapeHtml(step.status)}">${escapeHtml(commandStatusLabel(step.status))}</span>
                <span>${escapeHtml(commandActionLabel(step.label))}</span>
                ${step.status === "pending" ? `<button class="mini-button" data-workflow-step-complete="${escapeHtml(step.step_id)}" type="button">标记步骤完成</button>` : ""}
              </li>
            `).join("")}
          </ol>
        </div>` : ""}
        <div>
          <h3>建议下一步</h3>
          <ol>${workflow.suggested_steps.map((step) => `<li>${escapeHtml(commandActionLabel(step))}</li>`).join("")}</ol>
        </div>
        <div>
          <h3>安全内部动作</h3>
          <ul>${workflow.safe_actions.map((action) => `<li>${escapeHtml(commandActionLabel(action))}</li>`).join("")}</ul>
          ${commandHistoryRecord?.document_draft_checklist?.length ? `<h3>单据草稿检查清单</h3><ul>${commandHistoryRecord.document_draft_checklist.map((item) => `<li>${escapeHtml(item.label)} · ${escapeHtml(commandStatusLabel(item.status))}</li>`).join("")}</ul>` : ""}
          ${workflow.draft_references.length ? `<h3>草稿引用</h3><ul>${workflow.draft_references.map((draft) => `<li>${escapeHtml(draft.draft_type || "draft")} · ${escapeHtml(commandStatusLabel(draft.status || "draft_only"))} · ${escapeHtml(draft.draft_id || "")}</li>`).join("")}</ul>` : ""}
          ${workflow.related_links.length ? `<div class="context-link-row">${workflow.related_links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(commandLinkLabel(link.label))}</a>`).join("")}</div>` : ""}
        </div>
        <div>
          <h3>禁止动作</h3>
          <p class="muted">这些动作不会自动执行，需要人工审核：</p>
          <ul>${workflow.blocked_actions.map((action) => `<li>${escapeHtml(commandActionLabel(action))}</li>`).join("")}</ul>
        </div>
      </div>
    </section>
  `;
}

function loadCommandHistory() {
  try {
    return JSON.parse(localStorage.getItem(COMMAND_HISTORY_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCommandHistory(history) {
  commandHistory = history;
  localStorage.setItem(COMMAND_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
}

function isContextTarget(kind, id) {
  if (!id || !hasCommandContext(commandCenterContext)) return false;
  if (kind === "customer") return commandCenterContext.customer_id === id;
  if (kind === "lead") return commandCenterContext.lead_id === id;
  if (kind === "inquiry") return commandCenterContext.inquiry_id === id;
  if (kind === "document") return commandCenterContext.document_id === id || commandCenterContext.draft_id === id;
  if (kind === "task") return commandCenterContext.task_id === id;
  if (kind === "project") return commandCenterContext.project_id === id;
  return false;
}

function contextRowClass(kind, id, baseClass = "") {
  return [baseClass, isContextTarget(kind, id) ? "command-target-row" : ""].filter(Boolean).join(" ");
}

function contextCardClass(kind, id, baseClass = "") {
  return [baseClass, isContextTarget(kind, id) ? "command-target-card" : ""].filter(Boolean).join(" ");
}

function commandContextSummaryText() {
  const workflow = buildContextWorkflow({ ...commandCenterContext, view, warnings: commandContextWarnings() });
  const values = contextTargetSummary(commandCenterContext)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
  return `来自指令中心；${commandWorkflowTitle(workflow.title)}；view=${view}${values ? `; ${values}` : ""}；target=${workflow.target_summary}；steps=${workflow.suggested_steps.join(" > ")}`;
}

function scrollContextTargetIntoView() {
  const target = app.querySelector(".command-target-row, .command-target-card");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderActionCenter() {
  const queue = applyFollowUpContextFilter(buildActionQueue());
  const today = new Date().toISOString().slice(0, 10);
  const overdue = state.follow_up_tasks.filter((item) => item.status === TaskStatus.PENDING && item.due_date && item.due_date < today);
  const dueSoon = state.follow_up_tasks.filter((item) => item.status === TaskStatus.PENDING && item.due_date && item.due_date >= today).slice(0, 6);
  const stageStats = businessStageStats();
  const safetyItems = [
    "No automatic customer messages",
    "No automatic official quotation or PI",
    "No price, delivery time, payment terms or bank account confirmation",
    "Manual review required before any external commitment",
  ];

  return `
    <div class="toolbar">
      <div>
        <h2>行动中心</h2>
        <p class="muted">把主业务链路变成今天可以执行的工作队列：先看阻塞，再进详情页处理。Data layer: ${dataModeLabel()}.</p>
      </div>
      <div class="toolbar-actions">
        <button class="primary-button" data-run-demo-flow type="button">Run Full Mock Flow</button>
        <button class="ghost-button" data-import-website-leads type="button">Import Website Inquiries</button>
        <button class="ghost-button" data-view-shortcut="flow" type="button">Open Flow Center</button>
      </div>
    </div>

    <div class="grid stats-grid compact-stats">
      ${stat("行动项", queue.length, "跨询盘、报价、订单、出货、售后")}
      ${stat("高优先级", queue.filter((item) => item.priority === "high").length, "建议今天先处理")}
      ${stat("逾期待办", overdue.length, "pending follow-up overdue")}
      ${stat("今日后续", dueSoon.length, "近期需要跟进")}
      ${stat("需人工审核", queue.filter((item) => item.risk === "manual-review").length, "报价/PI/单证/赔偿")}
      ${stat("复购机会", queue.filter((item) => item.stage === "Repeat").length, "repeat business")}
    </div>

    <section class="panel action-board">
      <div class="panel-header">
        <div>
          <h2>业务阶段健康度</h2>
          <p>每个数字都来自 mock CRM 对象，后续可直接迁移成数据库看板。</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="stage-strip">
          ${stageStats
            .map(
              (stage) => `
                <article class="stage-card ${stage.blocked ? "blocked" : ""}">
                  <span>${stage.label}</span>
                  <strong>${stage.count}</strong>
                  <small>${stage.hint}</small>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <div class="grid two-col" style="margin-top:16px">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>下一步行动队列</h2>
            <p>按风险和业务推进顺序排序，不自动外发任何消息。</p>
          </div>
        </div>
        <div class="panel-body action-queue">
          ${queue.map(actionQueueCard).join("") || empty("暂无行动项。可以运行 Full Mock Flow 创建完整链路。")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>人工审核边界</h2>
            <p>行动中心只组织工作，不替你做高风险承诺。</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="process-grid dense">
            ${safetyItems.map((item) => `<div class="process-step">${item}</div>`).join("")}
          </div>
          <div class="timeline" style="margin-top:16px">
            ${dueSoon
              .map(
                (task) => `
                  <article class="timeline-item">
                    <h3>${task.title}</h3>
                    <p>${task.type} · due ${task.due_date || "-"} · ${task.status}</p>
                  </article>
                `,
              )
              .join("") || empty("暂无近期待办。")}
          </div>
        </div>
      </section>
    </div>
  `;
}

function businessStageStats() {
  const readyToQuote = state.inquiries.filter((item) => item.status === InquiryStatus.READY_TO_QUOTE);
  const quoteReview = state.quotations.filter((item) => item.manual_review_required && item.status !== QuotationStatus.ACCEPTED_MOCK);
  const orderReview = state.orders.filter((item) => item.manual_review_required && item.status !== OrderStatus.CLOSED);
  const shipmentReview = state.shipments.filter((item) => item.manual_review_required && item.status !== ShipmentStatus.CLOSED);
  const afterSalesOpen = state.after_sales_cases.filter((item) => item.status !== "CLOSED");
  const repeatTasks = state.follow_up_tasks.filter((item) => item.type === TaskType.REPEAT_BUSINESS && item.status === TaskStatus.PENDING);
  return [
    { label: "Lead", count: state.leads.length, hint: "dedupe + qualify", blocked: false },
    { label: "Inquiry", count: state.inquiries.length, hint: `${readyToQuote.length} ready to quote`, blocked: state.inquiries.some((item) => (item.missing_info || []).length) },
    { label: "Project", count: state.projects.length, hint: "stage tracking", blocked: false },
    { label: "Quotation", count: state.quotations.length, hint: `${quoteReview.length} need review`, blocked: quoteReview.length > 0 },
    { label: "Order", count: state.orders.length, hint: `${orderReview.length} PI/payment review`, blocked: orderReview.length > 0 },
    { label: "Shipment", count: state.shipments.length, hint: `${shipmentReview.length} document review`, blocked: shipmentReview.length > 0 },
    { label: "After-sales", count: afterSalesOpen.length, hint: "feedback + issues", blocked: afterSalesOpen.length > 0 },
    { label: "Repeat", count: repeatTasks.length, hint: "repeat business reminders", blocked: false },
  ];
}

function buildActionQueue() {
  const today = new Date().toISOString().slice(0, 10);
  const items = [];

  state.follow_up_tasks
    .filter((task) => task.status === TaskStatus.PENDING)
    .forEach((task) => {
      items.push({
        id: task.id,
        stage: task.type === TaskType.REPEAT_BUSINESS ? "Repeat" : "Follow-up",
        title: task.title,
        owner: relatedCustomerName(task.customer_id) || "Unassigned customer",
        reason: task.due_date && task.due_date < today ? `Overdue since ${task.due_date}` : `Due ${task.due_date || "-"}`,
        priority: task.priority === "high" || (task.due_date && task.due_date < today) ? "high" : "normal",
        risk: task.type === TaskType.REPEAT_BUSINESS ? "growth" : "follow-up",
        view: task.after_sales_case_id ? "afterSales" : task.shipment_id ? "shipments" : task.order_id ? "orders" : task.quotation_id ? "quotes" : task.inquiry_id ? "leads" : "dashboard",
      });
    });

  state.inquiries
    .filter((item) => (item.missing_info || []).length || item.status === InquiryStatus.READY_TO_QUOTE)
    .forEach((inquiry) => {
      const hasQuote = state.quotations.some((quote) => quote.inquiry_id === inquiry.id);
      const needsInfo = (inquiry.missing_info || []).length > 0;
      if (needsInfo || (inquiry.status === InquiryStatus.READY_TO_QUOTE && !hasQuote)) {
        items.push({
          id: inquiry.id,
          stage: "Inquiry",
          title: inquiry.title,
          owner: customerOrLeadName(inquiry),
          reason: needsInfo
            ? `Missing info: ${inquiry.missing_info.slice(0, 3).join(", ")}`
            : "Ready to create quotation draft",
          priority: inquiry.score >= 85 || inquiry.status === InquiryStatus.READY_TO_QUOTE ? "high" : "normal",
          risk: needsInfo ? "missing-info" : "manual-review",
          view: "leads",
        });
      }
    });

  state.quotations
    .filter((quote) => quote.manual_review_required && quote.status !== QuotationStatus.ACCEPTED_MOCK)
    .forEach((quote) => {
      items.push({
        id: quote.id,
        stage: "Quotation",
        title: quote.quote_no || quote.no || "Quotation draft",
        owner: relatedCustomerName(quote.customer_id) || quote.customer || "Customer",
        reason: "Manual price, lead time, freight, payment terms and send review required",
        priority: "high",
        risk: "manual-review",
        view: "quotes",
      });
    });

  state.orders
    .filter((order) => order.manual_review_required && order.status !== OrderStatus.CLOSED)
    .forEach((order) => {
      items.push({
        id: order.id,
        stage: "Order",
        title: order.order_no,
        owner: relatedCustomerName(order.customer_id) || order.customer || "Customer",
        reason: order.next_action || "PI, payment and production status need manual review",
        priority: order.status === OrderStatus.PI_REVIEW || order.payment_status === PaymentStatus.NOT_CONFIRMED ? "high" : "normal",
        risk: "manual-review",
        view: "orders",
      });
    });

  state.shipments
    .filter((shipment) => shipment.manual_review_required && shipment.status !== ShipmentStatus.CLOSED)
    .forEach((shipment) => {
      const afterSales = state.after_sales_cases.find((item) => item.shipment_id === shipment.id);
      items.push({
        id: shipment.id,
        stage: "Shipment",
        title: shipment.shipment_no || shipment.route || "Shipment draft",
        owner: relatedCustomerName(shipment.customer_id) || "Customer",
        reason: afterSales ? "Document placeholders still require review" : "Create after-sales follow-up after shipment review",
        priority: afterSales ? "normal" : "high",
        risk: "manual-review",
        view: "shipments",
      });
    });

  state.after_sales_cases
    .filter((item) => item.status !== "CLOSED")
    .forEach((item) => {
      const repeatTask = state.follow_up_tasks.find(
        (task) => task.after_sales_case_id === item.id && task.type === TaskType.REPEAT_BUSINESS,
      );
      if (!repeatTask || item.status !== "REPEAT_BUSINESS_OPPORTUNITY") {
        items.push({
          id: item.id,
          stage: "After-sales",
          title: item.case_no,
          owner: relatedCustomerName(item.customer_id) || item.customer || "Customer",
          reason: repeatTask ? "Customer feedback still needs manual review" : "Create repeat business reminder after feedback review",
          priority: repeatTask ? "normal" : "high",
          risk: "manual-review",
          view: "afterSales",
        });
      }
    });

  return items
    .sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high") || stageWeight(a.stage) - stageWeight(b.stage))
    .slice(0, 18);
}

function applyFollowUpContextFilter(queue) {
  if (view !== "actionCenter" || !commandCenterContext.filter) return queue;
  const today = new Date().toISOString().slice(0, 10);
  if (commandCenterContext.filter === "today") {
    return queue.filter((item) => item.stage !== "Follow-up" || state.follow_up_tasks.some((task) => task.id === item.id && task.due_date === today));
  }
  if (commandCenterContext.filter === "overdue") {
    return queue.filter((item) => item.stage !== "Follow-up" || state.follow_up_tasks.some((task) => task.id === item.id && task.due_date && task.due_date < today));
  }
  return queue;
}

function stageWeight(stage) {
  return {
    "Follow-up": 1,
    Inquiry: 2,
    Quotation: 3,
    Order: 4,
    Shipment: 5,
    "After-sales": 6,
    Repeat: 7,
  }[stage] || 9;
}

function relatedCustomerName(customerId) {
  return customerId ? state.customers.find((item) => item.id === customerId)?.name || "" : "";
}

function actionQueueCard(item) {
  const riskClass = item.priority === "high" ? "danger" : item.risk === "growth" ? "ok" : "warning";
  const cardClass = contextCardClass("task", item.stage === "Follow-up" ? item.id : "", "queue-card");
  return `
    <article class="${cardClass}">
      <div>
        <span class="badge ${riskClass}">${item.priority === "high" ? "High" : item.stage}</span>
        <h3>${item.title}</h3>
        <p>${item.owner}</p>
        <p>${item.reason}</p>
      </div>
      <button class="ghost-button" data-view-shortcut="${item.view}" type="button">Open ${item.stage}</button>
    </article>
  `;
}

function followUpWorkbenchSection() {
  const today = new Date().toISOString().slice(0, 10);
  const pending = state.follow_up_tasks.filter((item) => item.status === TaskStatus.PENDING);
  const overdue = pending.filter((item) => item.due_date && item.due_date < today);
  const highPriorityInquiries = state.inquiries.filter((item) => Number(item.score || 0) >= 85);
  const leadsNeedingReview = state.leads.filter((item) => ["NEW", "NEED_REVIEW", "QUALIFYING"].includes(item.status || "NEW"));
  const missingInfoInquiries = state.inquiries.filter(
    (item) => item.status === InquiryStatus.NEED_MORE_INFO || (item.missing_info || []).length,
  );
  const rows = [
    ...overdue.slice(0, 4).map((task) => ({
      type: "Overdue follow-up",
      title: task.title,
      status: task.status,
      detail: `${task.due_date || "-"} · ${task.priority || "normal"}`,
      view: "dashboard",
    })),
    ...leadsNeedingReview.slice(0, 4).map((lead) => ({
      type: "Lead needs review",
      title: lead.company || lead.name || lead.title || "Lead",
      status: lead.status || "NEW",
      detail: `${lead.source || "-"} · ${lead.country || "-"} · ${lead.business_line || "-"}`,
      view: "leadPool",
    })),
    ...missingInfoInquiries.slice(0, 4).map((inquiry) => ({
      type: "Missing info inquiry",
      title: inquiry.title,
      status: inquiry.status,
      detail: `${(inquiry.missing_info || []).slice(0, 3).join(", ") || "Checklist review needed"}`,
      view: "leads",
    })),
  ].slice(0, 10);

  return `
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>Follow-up Workbench</h2>
          <p>Admin-only pilot view for first real website inquiries. No messages are sent automatically.</p>
        </div>
        <span class="badge">${DATA_MODE === "supabase" ? "Supabase pilot" : "Mock localStorage"}</span>
      </div>
      <div class="grid stats-grid compact-stats">
        ${stat("Pending follow-ups", pending.length, "manual tasks")}
        ${stat("Overdue follow-ups", overdue.length, "needs action")}
        ${stat("High-priority inquiries", highPriorityInquiries.length, "score 85+")}
        ${stat("Leads needing review", leadsNeedingReview.length, "NEW / NEED_REVIEW")}
        ${stat("Missing info inquiries", missingInfoInquiries.length, "checklist gaps")}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Type</th><th>Record</th><th>Status</th><th>Detail</th><th>Open</th></tr></thead>
          <tbody>
            ${
              rows
                .map(
                  (row) => `
                    <tr>
                      <td>${row.type}</td>
                      <td>${row.title}</td>
                      <td>${statusBadge(row.status)}</td>
                      <td>${row.detail}</td>
                      <td><button class="ghost-button" data-view-shortcut="${row.view}" type="button">Open</button></td>
                    </tr>
                  `,
                )
                .join("") || `<tr><td colspan="5">${empty("No urgent follow-up items.")}</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDashboard() {
  const activeProjects = state.projects.filter((item) => !["closed", "delivered"].includes(item.stage)).length;
  const urgentLeads = state.inquiries.filter((item) => item.status === InquiryStatus.NEED_MORE_INFO || item.score >= 85).length;
  const prospects = state.prospects.length;
  const pendingFollowUps = state.follow_up_tasks.filter((item) => item.status === TaskStatus.PENDING);
  const overdueFollowUps = pendingFollowUps.filter((item) => item.due_date && item.due_date < new Date().toISOString().slice(0, 10));
  const tasks = pendingFollowUps.filter((item) => item.priority === "high").length;
  const whatsappHot = state.whatsappSignals.filter((item) => item.score >= 80).length;
  const filteredTasks = [...pendingFollowUps, ...state.tasks].filter(matches);
  const highScoreInquiries = state.inquiries.filter((item) => item.score >= 85);
  const readyToQuote = state.inquiries.filter((item) => item.status === InquiryStatus.READY_TO_QUOTE);
  const orderDrafts = state.orders.filter((item) => item.status !== OrderStatus.CLOSED);
  const shipmentDrafts = state.shipments.filter((item) => item.manual_review_required);
  const afterSalesOpen = state.after_sales_cases.filter((item) => item.status !== "CLOSED");
  const repeatTasks = state.follow_up_tasks.filter((item) => item.type === "REPEAT_BUSINESS");
  const reviewDocs = [
    ...state.documents.filter((item) => item.manual_review_required || item.status === DocumentStatus.NEED_REVIEW),
    ...listDocumentDraftReviewRecords(commandHistory).filter((item) => item.manual_review_required),
  ];
  const blockedActions = [
    ...state.quotations.filter((item) => item.manual_review_required),
    ...state.orders.filter((item) => item.manual_review_required),
    ...state.shipments.filter((item) => item.manual_review_required),
    ...commandHistory.filter((item) => item.approval_required || item.blocked_actions?.length),
  ];
  const latestInquiries = state.inquiries
    .slice()
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    .slice(0, 4);
  const recentCommands = commandHistory.slice(0, 4);
  const todayWorkflow = buildActionQueue().slice(0, 5);

  return `
    <section class="ops-hero panel">
      <div class="ops-hero-copy">
        <span class="badge ok">指令优先</span>
        <h2>今天先处理这些事</h2>
        <p>工作台只显示每日经营状态和下一步动作。复杂详情进入模块、抽屉或指令中心继续处理。</p>
        <div class="toolbar-actions">
          <a class="primary-button" href="/admin/command-center">进入指令中心</a>
          <button class="ghost-button" data-view-shortcut="actionCenter" type="button">查看行动中心</button>
          <button class="ghost-button" data-import-website-leads type="button">导入网站询盘</button>
        </div>
      </div>
      <aside class="ops-context-panel">
        <strong>人工审核边界</strong>
        <span>不自动发送消息 / 正式报价 / PI</span>
        <span>不确认价格、交期、付款、银行信息</span>
        <span>所有高风险动作显示：需要人工审核</span>
      </aside>
    </section>

    <div class="grid stats-grid task-stats">
      ${stat("今日待处理", pendingFollowUps.length + urgentLeads, `${overdueFollowUps.length} 个逾期`)}
      ${stat("待审核询盘", state.inquiries.filter((item) => item.status === InquiryStatus.NEED_MORE_INFO || item.status === InquiryStatus.NEW).length, "缺资料 / 新询盘")}
      ${stat("待跟进客户", pendingFollowUps.length, "人工跟进任务")}
      ${stat("待审核单据", reviewDocs.length, "草稿 / PI / 报价")}
      ${stat("高风险阻止动作", blockedActions.length, "需要人工审核")}
    </div>

    ${followUpWorkbenchSection()}

    <div class="grid two-col dashboard-workflow-grid" style="margin-top:16px">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>今日工作流</h2>
            <p>按优先级组织，不自动外发任何客户消息。</p>
          </div>
        </div>
        <div class="panel-body action-queue">
          ${todayWorkflow.map(actionQueueCard).join("") || empty("暂无今日工作流。")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
          <h2>需要人工审核</h2>
          <p>报价、PI、单据、付款和外发动作都只进入内部审核。</p>
          </div>
        </div>
        <div class="panel-body task-list compact-list">
          ${blockedActions.slice(0, 6).map((item) => `
            <article class="task-item">
              <span class="badge danger">需要人工审核</span>
              <h3>${escapeHtml(item.title || item.quote_no || item.order_no || item.shipment_no || item.raw_command || "高风险动作")}</h3>
              <p>${escapeHtml(item.status || item.review_status || item.parsed_intent || "manual review required")}</p>
            </article>
          `).join("") || empty("暂无被阻止的高风险动作。")}
        </div>
      </section>
    </div>

    <div class="grid two-col dashboard-workflow-grid" style="margin-top:16px">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>最近指令</h2>
            <p>从指令中心恢复上下文，继续安全内部流程。</p>
          </div>
        </div>
        <div class="panel-body timeline compact-list">
          ${recentCommands.map((item) => `
            <article class="timeline-item">
              <span class="badge ${item.approval_required ? "danger" : "ok"}">${item.approval_required ? "需要人工审核" : "安全内部动作"}</span>
              <h3>${escapeHtml(item.raw_command || item.original_command || "未命名指令")}</h3>
              <p>${escapeHtml(commandStatusLabel(item.status))} · ${escapeHtml(item.parsed_intent || "-")}</p>
              <a class="ghost-link" href="/admin/command-center?command_id=${escapeHtml(item.command_id)}">继续处理流程</a>
            </article>
          `).join("") || empty("暂无指令记录。")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>最新网站询盘</h2>
            <p>从公开网站进入的前端 CRM 数据，先审核再转项目/报价。</p>
          </div>
        </div>
        <div class="panel-body timeline compact-list">
          ${latestInquiries.map((item) => `
            <article class="timeline-item">
              ${statusBadge(item.status)}
              <h3>${escapeHtml(item.title || "Website inquiry")}</h3>
              <p>${escapeHtml(item.business_line || "-")} · ${escapeHtml(item.source || "-")} · Score ${escapeHtml(item.score || 0)}</p>
              <button class="link-button" data-view-inquiry="${escapeHtml(item.id)}" type="button">打开询盘详情</button>
            </article>
          `).join("") || empty("暂无网站询盘。")}
        </div>
      </section>
    </div>
  `;
}

function stat(label, value, hint) {
  return `
    <section class="panel stat">
      <span>${label}</span>
      <strong>${value}</strong>
      <span>${hint}</span>
    </section>
  `;
}

function growthFunnel() {
  const websitePriority = state.websitePages.filter((item) => item.status === "priority").length;
  const readyPosts = state.socialPosts.filter((item) => item.status === "ready").length;
  const warmProspects = state.prospects.filter((item) => item.status === "warm" || item.fit >= 85).length;
  const campaignLeads = state.campaigns.reduce((sum, item) => sum + Number(item.leads || 0), 0);
  return `
    <div class="process-grid">
      <div class="process-step"><strong>${websitePriority}</strong><span>优先独立站页面</span></div>
      <div class="process-step"><strong>${readyPosts}</strong><span>可发布社媒内容</span></div>
      <div class="process-step"><strong>${warmProspects}</strong><span>高匹配潜客</span></div>
      <div class="process-step"><strong>${campaignLeads}</strong><span>开发活动线索</span></div>
    </div>
    <div class="timeline" style="margin-top:16px">
      ${state.campaigns
        .map(
          (campaign) => `
            <article class="timeline-item">
              <h3>${campaign.name} ${statusBadge(campaign.stage)}</h3>
              <p>${campaign.market} · ${campaign.offer}</p>
              <p><strong>下一步：</strong>${campaign.nextAction}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function sourceCounts() {
  const sources = [Source.WEBSITE, Source.ALIBABA, Source.GMAIL, Source.WHATSAPP, Source.MANUAL, "google_ads", "seo", "social_media", "trade_show"];
  return sources.map((source) => ({
    source,
    leads: state.leads.filter((item) => item.source === source).length,
    inquiries: state.inquiries.filter((item) => item.source === source).length,
  }));
}

function latestAcquisitionRows() {
  const leadRows = state.leads.map((item) => ({
    type: "Lead",
    id: item.id,
    source: item.source || "-",
    title: item.title || item.company || item.name || "Untitled lead",
    company: item.company || item.name || "-",
    country: item.country || "-",
    business_line: item.business_line || "",
    score: item.score || 0,
    created_at: item.created_at || item.updated_at || "",
  }));
  const inquiryRows = state.inquiries.map((item) => ({
    type: "Inquiry",
    id: item.id,
    source: item.source || "-",
    title: item.title || "Untitled inquiry",
    company: item.lead_info?.company || item.lead_info?.name || "-",
    country: item.lead_info?.country || "-",
    business_line: item.business_line || "",
    score: item.score || 0,
    created_at: item.created_at || item.updated_at || "",
  }));
  return [...inquiryRows, ...leadRows]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 12);
}

function renderAcquisition() {
  const counts = sourceCounts();
  const rows = latestAcquisitionRows();
  const websiteNew = (() => {
    try {
      return JSON.parse(localStorage.getItem("cbm-website-inquiries") || "[]").filter((item) => !item.imported).length;
    } catch {
      return 0;
    }
  })();
  const pendingTasks = state.follow_up_tasks.filter((item) => item.status === TaskStatus.PENDING);
  return `
    <div class="toolbar">
      <div>
        <h2>获客中心 Acquisition Center</h2>
        <p class="muted">统一承接独立站、阿里巴巴、Gmail、WhatsApp、社媒、Google Ads、展会和手动导入线索。</p>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-view-shortcut="website" type="button">独立站</button>
        <button class="ghost-button" data-view-shortcut="alibaba" type="button">阿里巴巴</button>
        <button class="primary-button" data-acquisition-action="run-all-demo" type="button">Run Unified Acquisition Demo</button>
      </div>
    </div>

    <div class="grid stats-grid compact-stats">
      ${stat("Website New", websiteNew, "待导入网站询盘")}
      ${stat("Total Leads", state.leads.length, "所有来源")}
      ${stat("Total Inquiries", state.inquiries.length, "进入询盘池")}
      ${stat("Alibaba", state.inquiries.filter((item) => item.source === Source.ALIBABA).length, "alibaba inquiries")}
      ${stat("Manual / Gmail / WhatsApp", state.leads.filter((item) => [Source.MANUAL, Source.GMAIL, Source.WHATSAPP].includes(item.source)).length, "read-only intake")}
      ${stat("Pending Follow-ups", pendingTasks.length, "待人工跟进")}
    </div>

    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>多渠道获客入口</h2>
          <p>当前阶段全部是 mock/localStorage；任何消息回复、报价、PI 都不会自动发送。</p>
        </div>
        <span class="badge danger">Manual review required</span>
      </div>
      <div class="panel-body">
        <div class="channel-grid">
          ${[
            ["Independent Website", "website inquiry → import → inquiry pool", "import-website"],
            ["Alibaba International", "paste / CSV batch → lead + inquiry", "import-alibaba-batch"],
            ["Gmail Read-only", "email summary → manual lead draft", "create-gmail-demo"],
            ["WhatsApp Read-only", "chat learning → manual lead draft", "create-whatsapp-demo"],
            ["Manual Import", "trade show / referral / customs data", "create-manual-demo"],
          ]
            .map(
              ([title, text, action]) => `
                <article class="detail-box">
                  <h3>${title}</h3>
                  <p>${text}</p>
                  <button class="ghost-button" data-acquisition-action="${action}" type="button">Create / Import</button>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <div class="grid two-col" style="margin-top:16px">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>手动录入获客线索</h2>
            <p>用于展会、海关数据、社媒名单、WhatsApp list、邮件开发名单等来源。</p>
          </div>
        </div>
        <div class="panel-body form-grid">
          <div class="field">
            <label for="acqSource">来源</label>
            <select id="acqSource">
              <option value="${Source.MANUAL}">manual</option>
              <option value="${Source.GMAIL}">gmail</option>
              <option value="${Source.WHATSAPP}">whatsapp</option>
              <option value="google_ads">google_ads</option>
              <option value="seo">seo</option>
              <option value="social_media">social_media</option>
              <option value="trade_show">trade_show</option>
            </select>
          </div>
          <div class="field">
            <label for="acqBusinessLine">业务线</label>
            <select id="acqBusinessLine">
              <option value="${BusinessLine.ARCHITECTURAL}">Architectural Aluminum Project</option>
              <option value="${BusinessLine.PRECISION}">Precision Aluminum Manufacturing</option>
            </select>
          </div>
          <div class="field"><label for="acqCompany">公司</label><input id="acqCompany" type="text" value="Demo Multi-channel Buyer" /></div>
          <div class="field"><label for="acqName">联系人</label><input id="acqName" type="text" value="Demo Contact" /></div>
          <div class="field"><label for="acqCountry">国家</label><input id="acqCountry" type="text" value="Demo Market" /></div>
          <div class="field"><label for="acqEmail">邮箱</label><input id="acqEmail" type="text" value="demo-buyer@example.com" /></div>
          <div class="field"><label for="acqTitle">线索标题</label><input id="acqTitle" type="text" value="Multi-channel aluminum inquiry" /></div>
          <div class="field"><label for="acqSummary">需求摘要</label><textarea id="acqSummary">Customer is interested in aluminum windows, curtain wall systems or CNC aluminum parts. Need manual qualification before quote.</textarea></div>
          <div class="detail-actions">
            <button class="primary-button" data-acquisition-action="create-lead" type="button">Create Lead</button>
            <button class="primary-button" data-acquisition-action="create-lead-inquiry" type="button">Create Lead + Inquiry</button>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>渠道数据概览</h2>
            <p>后续接 Supabase 时可迁移为 AcquisitionChannel / MarketingSource 表。</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Source</th><th>Leads</th><th>Inquiries</th><th>Status</th></tr></thead>
            <tbody>
              ${counts
                .map(
                  (item) => `
                    <tr>
                      <td><span class="badge">${item.source}</span></td>
                      <td>${item.leads}</td>
                      <td>${item.inquiries}</td>
                      <td>${item.source === Source.WEBSITE || item.source === Source.ALIBABA ? "mock import ready" : "manual/read-only mock"}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>最新获客记录</h2>
          <p>所有来源最终都应该进入 Lead Pool 或 Inquiry Pool。</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>类型</th><th>标题</th><th>客户</th><th>国家</th><th>来源</th><th>业务线</th><th>评分</th><th>动作</th></tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>${row.type}</td>
                    <td class="name-cell"><strong>${row.title}</strong><span>${dateOnly(row.created_at)}</span></td>
                    <td>${row.company}</td>
                    <td>${row.country}</td>
                    <td><span class="badge">${row.source}</span></td>
                    <td>${row.business_line ? businessLineLabel(row.business_line) : "-"}</td>
                    <td><span class="badge ${Number(row.score) >= 85 ? "ok" : "warning"}">${row.score}</span></td>
                    <td>${row.type === "Inquiry" ? `<button class="ghost-button" data-open-related-inquiry="${row.id}" type="button">Open Inquiry</button>` : `<button class="ghost-button" data-lead-action="convert-inquiry" data-id="${row.id}" type="button">Convert</button>`}</td>
                  </tr>
                `,
              )
              .join("") || `<tr><td colspan="8">${empty("暂无获客记录。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function detailBox(title, rows) {
  return `
    <article class="detail-box">
      <h3>${title}</h3>
      ${rows
        .map(([key, value]) => `<p><strong>${labelize(key)}:</strong> ${value || "-"}</p>`)
        .join("")}
    </article>
  `;
}

function labelize(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function requirementForInquiry(inquiry) {
  const table =
    inquiry.business_line === BusinessLine.ARCHITECTURAL
      ? state.architectural_requirements
      : state.precision_requirements;
  return table.find((item) => item.inquiry_id === inquiry.id);
}

function businessLineLabel(value) {
  return value === BusinessLine.PRECISION ? "Precision Aluminum" : "Architectural Aluminum";
}

function customerOrLeadName(inquiry) {
  const customer = state.customers.find((item) => item.id === inquiry.customer_id);
  return customer?.name || inquiry.lead_info?.company || inquiry.lead_info?.name || "-";
}

function dateOnly(value) {
  return String(value || "").slice(0, 10) || "-";
}

function nextFollowUpDate(inquiryId) {
  const task = state.follow_up_tasks
    .filter((item) => item.inquiry_id === inquiryId && item.status === TaskStatus.PENDING)
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))[0];
  return task?.due_date || "-";
}

function followUpStatusForInquiry(inquiryId) {
  const related = state.follow_up_tasks.filter((item) => item.inquiry_id === inquiryId);
  if (!related.length) return "NO_TASK";
  const pending = related.filter((item) => item.status === TaskStatus.PENDING);
  if (pending.length) return `${pending.length} PENDING`;
  return related[0].status || "DONE";
}

function shipmentDocuments(shipment) {
  return state.document_drafts.filter((doc) => doc.shipment_id === shipment.id);
}

function scoreLevel(score) {
  if (Number(score) >= 85) return "HIGH";
  if (Number(score) >= 65) return "MEDIUM";
  return "LOW";
}

function renderFlowCenter() {
  const rows = buildBusinessFlowRows(state).filter(matches);
  return `
    <div class="toolbar">
      <div>
        <h2>业务链路总览</h2>
        <p class="muted">把客户开发、询盘、项目、报价、订单、出货和跟进放到一条主线上看。</p>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-view-shortcut="leads" type="button">去询盘池</button>
        <button class="ghost-button" data-view-shortcut="quotes" type="button">去报价中心</button>
        <button class="ghost-button" data-view-shortcut="orders" type="button">去订单中心</button>
      </div>
    </div>
    <div class="grid stats-grid">
      ${stat("链路记录", rows.length, "来自 Inquiry 主对象")}
      ${stat("报价阶段", rows.filter((item) => item.current_stage === "Quotation").length, "报价草稿和审核")}
      ${stat("订单阶段", rows.filter((item) => item.current_stage === "Order").length, "PI / payment / production")}
      ${stat("出货阶段", rows.filter((item) => item.current_stage === "Shipment").length, "shipment + documents")}
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>客户 / 来源</th>
              <th>当前阶段</th>
              <th>询盘</th>
              <th>项目</th>
              <th>报价</th>
              <th>订单</th>
              <th>出货</th>
              <th>下一步</th>
              <th>风险</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td class="name-cell"><strong>${row.customer}</strong><span>${row.source} · ${row.country || "-"}</span></td>
                    <td>${statusBadge(row.current_stage)}<br><span class="badge ${row.score >= 85 ? "ok" : "warning"}">Score ${row.score}</span></td>
                    <td>${row.inquiry_title}<br>${statusBadge(row.inquiry_status)}</td>
                    <td>${row.project_title || "-"}<br>${row.project_stage ? statusBadge(row.project_stage) : ""}</td>
                    <td>${row.quotation_no || "-"}<br>${row.quotation_status ? statusBadge(row.quotation_status) : ""}</td>
                    <td>${row.order_no || "-"}<br>${row.order_status ? statusBadge(row.order_status) : ""}</td>
                    <td>${row.shipment_no || "-"}<br>${row.shipment_status ? statusBadge(row.shipment_status) : ""}</td>
                    <td>${row.next_action}<br><span class="muted">${row.next_follow_up_at || ""}</span></td>
                    <td><span class="badge danger">${row.risk}</span></td>
                  </tr>
                `,
              )
              .join("") || `<tr><td colspan="9">${empty("暂无链路记录。先从独立站提交并导入询盘。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderLeadPool() {
  const leads = state.leads
    .filter(matches)
    .filter((item) => leadFilters.source === "ALL" || item.source === leadFilters.source)
    .filter((item) => leadFilters.status === "ALL" || item.status === leadFilters.status || item.stage === leadFilters.status)
    .filter((item) => leadFilters.business_line === "ALL" || item.business_line === leadFilters.business_line)
    .filter((item) => leadFilters.score === "ALL" || scoreLevel(item.score) === leadFilters.score);
  const duplicateGroups = leadDuplicateGroups();
  const qualified = leads.filter((lead) => ["QUALIFIED", "QUALIFYING", "HIGH_POTENTIAL", "CONVERTED", "CONVERTED_TO_CUSTOMER"].includes(lead.status)).length;
  const conversionReady = leads.filter((lead) => leadQualification(lead).decision === "READY_TO_CONVERT").length;
  const needsReview = leads.filter((lead) => ["NEW", "NEED_REVIEW", "QUALIFYING"].includes(lead.status || "NEW")).length;
  return `
    <div class="toolbar">
      <div>
        <h2>线索池</h2>
        <p class="muted">${DATA_MODE === "supabase" ? "Supabase Lead Review: public website inquiries create Lead + Inquiry + FollowUpTask. Customer requires manual conversion." : "Mock Lead Review: localStorage lead qualification and manual conversion."}</p>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-lead-action-global="qualify-all" type="button">Run Lead Qualification</button>
        <button class="primary-button" data-action="add-lead" type="button">新增线索</button>
      </div>
    </div>
    <div class="grid stats-grid compact-stats">
      ${stat("筛选线索", leads.length, "current view")}
      ${stat("高潜力", leads.filter((lead) => Number(lead.score || 0) >= 85).length, "score 85+")}
      ${stat("可转询盘", conversionReady, "ready to convert")}
      ${stat("待审核", needsReview, "NEW / NEED_REVIEW")}
      ${stat("已资格审核", qualified, "qualified / converted")}
      ${stat("重复风险组", duplicateGroups.length, "same email/company")}
      ${stat("无效/丢失", leads.filter((lead) => ["LOST", "INVALID"].includes(lead.status)).length, "lost or invalid")}
    </div>
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Lead Qualification Radar</h2>
          <p>系统根据来源、联系方式、业务线、国家、需求描述和重复风险做 mock 资格判断。</p>
        </div>
        <span class="badge warning">Rule-based mock</span>
      </div>
      <div class="panel-body">
        <div class="process-grid dense">
          ${[
            `High score: ${leads.filter((lead) => Number(lead.score || 0) >= 85).length}`,
            `Ready to convert: ${conversionReady}`,
            `Need research: ${leads.filter((lead) => leadQualification(lead).decision === "NEED_RESEARCH").length}`,
            `Duplicate risk: ${duplicateGroups.reduce((sum, group) => sum + group.length, 0)}`,
            `Manual review: required before any reply or quote`,
          ]
            .map((item) => `<div class="process-step">${item}</div>`)
            .join("")}
        </div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-body">
        <div class="filter-row">
          ${leadFilterSelect("source", "来源", [["ALL", "全部来源"], ["website", "website"], ["alibaba", "alibaba"], ["gmail", "gmail"], ["whatsapp", "whatsapp"], ["manual", "manual"], ["google_ads", "google_ads"], ["seo", "seo"], ["social_media", "social_media"], ["trade_show", "trade_show"], ["CBM Website", "CBM Website"], ["Gmail", "旧数据 Gmail"], ["LinkedIn", "旧数据 LinkedIn"], ["Google Ads", "旧数据 Google Ads"], ["Trade Show", "旧数据 Trade Show"]])}
          ${leadFilterSelect("status", "状态", [["ALL", "全部状态"], ["NEW", "NEW"], ["NEED_REVIEW", "NEED_REVIEW"], ["QUALIFIED", "QUALIFIED"], ["DISQUALIFIED", "DISQUALIFIED"], ["CONVERTED_TO_CUSTOMER", "CONVERTED_TO_CUSTOMER"], ["QUALIFYING", "旧数据 QUALIFYING"], ["HIGH_POTENTIAL", "旧数据 HIGH_POTENTIAL"], ["DUPLICATE_REVIEW", "旧数据 DUPLICATE_REVIEW"], ["CONVERTED", "旧数据 CONVERTED"], ["LOST", "旧数据 LOST"], ["INVALID", "旧数据 INVALID"]])}
          ${leadFilterSelect("business_line", "业务线", [["ALL", "全部业务线"], [BusinessLine.ARCHITECTURAL, "建筑铝系统"], [BusinessLine.PRECISION, "精密铝制造"]])}
          ${leadFilterSelect("score", "评分", [["ALL", "全部评分"], ["HIGH", "HIGH 85+"], ["MEDIUM", "MEDIUM 65-84"], ["LOW", "LOW <65"]])}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>来源</th>
              <th>客户 / 公司</th>
              <th>联系方式</th>
              <th>业务线 / 询盘</th>
              <th>摘要</th>
              <th>状态</th>
              <th>跟进</th>
              <th>创建时间</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            ${leads
              .map((lead) => {
                const inquiry = state.inquiries.find((item) => item.lead_id === lead.id);
                const duplicate = findLeadDuplicate(lead);
                const quality = leadQualification(lead);
                return `
                  <tr class="${contextRowClass("lead", lead.id)}">
                    <td><span class="badge">${lead.source || "-"}</span><br><span class="muted">${sourceTier(lead.source)}</span>${lead.is_test || lead.metadata?.is_test ? `<br><span class="badge warning">TEST DATA</span>` : ""}</td>
                    <td class="name-cell"><strong>${lead.name || "-"}</strong><span>${lead.company || "-"} · ${lead.country || "-"}</span><span>${duplicate ? "可能重复: " + (duplicate.company || duplicate.email || duplicate.title) : ""}</span></td>
                    <td>${lead.email || "-"}<br><span class="muted">${lead.whatsapp || ""}</span></td>
                    <td>${lead.business_line ? businessLineLabel(lead.business_line) : "-"}<br><strong>${lead.inquiry_title || inquiry?.title || lead.title || "-"}</strong></td>
                    <td>${lead.inquiry_summary || inquiry?.ai_summary || lead.summary || "-"}<br><span class="muted">${quality.next_action}</span></td>
                    <td>${statusBadge(lead.status || lead.stage)}<br><span class="badge ${Number(lead.score || 0) >= 85 ? "ok" : "warning"}">Score ${lead.score || 0}</span></td>
                    <td>${statusBadge(lead.follow_up_task_status || followUpStatusForInquiry(inquiry?.id))}</td>
                    <td>${dateOnly(lead.created_at)}</td>
                    <td class="action-cell">
                      <button class="ghost-button" data-lead-action="qualify" data-id="${lead.id}" type="button">Mark Qualified</button>
                      <button class="ghost-button" data-lead-action="need-review" data-id="${lead.id}" type="button">Need Review</button>
                      <button class="ghost-button" data-lead-action="convert-customer" data-id="${lead.id}" type="button">Convert to Customer</button>
                      <button class="ghost-button" data-lead-action="mark-lost" data-id="${lead.id}" type="button">Disqualify</button>
                    </td>
                  </tr>
                `;
              })
              .join("") || `<tr><td colspan="9">${empty("暂无匹配线索。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>重复线索检查</h2>
          <p>按邮箱或公司名聚合，先提示人工判断，不自动合并客户数据。</p>
        </div>
      </div>
      <div class="panel-body">
        ${
          duplicateGroups.length
            ? `<div class="timeline">${duplicateGroups
                .map(
                  (group) => `
                    <article class="timeline-item">
                      <h3>${group[0].company || group[0].email || "Duplicate group"} ${statusBadge(`${group.length} records`)}</h3>
                      <p>${group.map((lead) => `${lead.source || "-"} · ${lead.title || lead.company || lead.name}`).join(" | ")}</p>
                      <p><strong>建议：</strong>人工确认是否同一客户；保留沟通历史，不自动合并。</p>
                    </article>
                  `,
                )
                .join("")}</div>`
            : empty("暂无明显重复线索。")
        }
      </div>
    </section>
  `;
}

function leadFilterSelect(name, label, options) {
  return `
    <label>
      <span>${label}</span>
      <select data-lead-filter="${name}">
        ${options.map(([value, text]) => `<option value="${value}" ${leadFilters[name] === value ? "selected" : ""}>${text}</option>`).join("")}
      </select>
    </label>
  `;
}

function findLeadDuplicate(lead) {
  return state.leads.find(
    (item) =>
      item.id !== lead.id &&
      ((lead.email && item.email === lead.email) || (lead.company && item.company === lead.company)),
  );
}

function leadDuplicateGroups() {
  const groups = new Map();
  state.leads.forEach((lead) => {
    const key = (lead.email || lead.company || "").trim().toLowerCase();
    if (!key) return;
    groups.set(key, [...(groups.get(key) || []), lead]);
  });
  return [...groups.values()].filter((group) => group.length > 1);
}

function sourceTier(source = "") {
  const normalized = String(source).toLowerCase();
  if ([Source.WEBSITE, Source.ALIBABA, "google_ads", "seo"].includes(normalized)) return "Inbound / high intent";
  if ([Source.GMAIL, Source.WHATSAPP, "trade_show"].includes(normalized)) return "Warm / manual review";
  if (["social_media", "linkedin", "manual"].includes(normalized)) return "Outbound / research";
  return "Unclassified source";
}

function leadQualification(lead) {
  const duplicate = findLeadDuplicate(lead);
  const hasContact = Boolean(lead.email || lead.whatsapp);
  const hasCompany = Boolean(lead.company || lead.name);
  const hasNeed = String(lead.summary || lead.need || lead.missing || lead.project_type || "").length > 40;
  const hasBusinessLine = Boolean(lead.business_line);
  const score = Number(lead.score || 0);
  if (duplicate) {
    return {
      decision: "DUPLICATE_REVIEW",
      reason: "Same email/company found",
      score_reason: `Score ${score}; duplicate risk`,
      next_action: "人工确认是否同一客户，再决定保留、合并或转询盘。",
    };
  }
  if (score >= 80 && hasContact && hasNeed && hasBusinessLine) {
    return {
      decision: "READY_TO_CONVERT",
      reason: "Contact + demand + business line",
      score_reason: `Score ${score}; good fit`,
      next_action: "转为询盘，生成缺失信息清单和人工回复草稿。",
    };
  }
  if (!hasContact || !hasCompany) {
    return {
      decision: "NEED_CONTACT",
      reason: "Missing contact/company",
      score_reason: `Score ${score}; contact gap`,
      next_action: "补充邮箱、WhatsApp、公司名和国家后再跟进。",
    };
  }
  if (!hasNeed || !hasBusinessLine) {
    return {
      decision: "NEED_RESEARCH",
      reason: "Need/product unclear",
      score_reason: `Score ${score}; need unclear`,
      next_action: "研究客户网站/采购背景，确认属于建筑铝项目还是精密铝制造。",
    };
  }
  return {
    decision: "QUALIFYING",
    reason: "Basic info exists",
    score_reason: `Score ${score}; normal`,
    next_action: "保持人工跟进，补充数量、图纸、表面处理和目的港。",
  };
}

function renderCustomers() {
  const customers = state.customers.filter(matches);
  const selected = state.customers.find((item) => item.id === selectedCustomerId) || customers[0] || null;
  selectedCustomerId = selected?.id || "";
  return `
    <div class="toolbar">
      <div>
        <h2>客户 360</h2>
        <p class="muted">主客户、关联公司、国家、项目和 AI 业务摘要。</p>
      </div>
      <div class="toolbar-actions">
        <button class="primary-button" data-action="add-customer" type="button">新增客户</button>
      </div>
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>客户</th>
              <th>国家</th>
              <th>类型</th>
              <th>关联公司</th>
              <th>状态</th>
              <th>关联数据</th>
              <th>摘要</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            ${customers
              .map(
                (customer) => {
                  const related = customerRelatedCounts(customer.id);
                  return `
                  <tr class="${contextRowClass("customer", customer.id)}">
                    <td class="name-cell"><strong>${customer.name}</strong><span>最近联系 ${customer.lastContact}</span></td>
                    <td>${customer.country}</td>
                    <td>${customer.type}</td>
                    <td>${customer.aliases}</td>
                    <td>${statusBadge(customer.status)} <span class="badge">${customer.importance}</span></td>
                    <td>
                      <span class="badge">Lead ${related.leads}</span>
                      <span class="badge">Inquiry ${related.inquiries}</span>
                      <span class="badge">Project ${related.projects}</span>
                      <span class="badge">Quote ${related.quotations}</span>
                      <span class="badge">Order ${related.orders}</span>
                      <span class="badge">Shipment ${related.shipments}</span>
                      <span class="badge">After-sales ${related.afterSales}</span>
                      <span class="badge">Task ${related.tasks}</span>
                    </td>
                    <td>${customer.summary}</td>
                    <td><button class="ghost-button" data-view-customer="${customer.id}" type="button">查看 360</button></td>
                  </tr>
                `;
                },
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
    ${selected ? customerDetail(selected) : ""}
  `;
}

function customerDetail(customer) {
  const leads = state.leads.filter((item) => item.customer_id === customer.id || item.customerId === customer.id || item.company === customer.name);
  const inquiries = state.inquiries.filter((item) => item.customer_id === customer.id);
  const projects = state.projects.filter((item) => item.customer_id === customer.id || item.customerId === customer.id);
  const quotations = state.quotations.filter((item) => item.customer_id === customer.id);
  const orders = state.orders.filter((item) => item.customer_id === customer.id);
  const shipments = state.shipments.filter((item) => item.customer_id === customer.id);
  const afterSales = state.after_sales_cases.filter((item) => item.customer_id === customer.id);
  const tasks = state.follow_up_tasks.filter((item) => item.customer_id === customer.id);
  const logs = state.communication_logs.filter((item) => item.customer_id === customer.id);
  const timeline = customerTimeline({ leads, inquiries, projects, quotations, orders, shipments, afterSales, tasks, logs });
  const pendingTasks = tasks.filter((item) => item.status === TaskStatus.PENDING);
  const latestInquiry = inquiries[0];
  const nextAction =
    pendingTasks[0]?.title ||
    latestInquiry?.recommended_next_action ||
    projects[0]?.next_action ||
    afterSales[0]?.next_action ||
    "Review customer history and decide next manual follow-up.";
  const healthScore = Math.min(
    100,
    45 +
      inquiries.length * 8 +
      projects.length * 10 +
      quotations.length * 8 +
      orders.length * 10 +
      shipments.length * 6 +
      afterSales.length * 4 -
      pendingTasks.filter((item) => item.due_date && item.due_date < new Date().toISOString().slice(0, 10)).length * 8,
  );
  return `
    <section class="panel detail-panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${customer.name}</h2>
          <p>${customer.country || "-"} · ${customer.type || "-"} · Rating ${customer.importance || "-"}</p>
        </div>
        <span class="badge">Customer 360</span>
      </div>
      <div class="panel-body">
        <div class="customer-command">
          <article>
            <span>Customer Health</span>
            <strong>${healthScore}</strong>
            <small>${healthScore >= 80 ? "strong relationship" : healthScore >= 60 ? "active opportunity" : "needs development"}</small>
          </article>
          <article>
            <span>Next Manual Action</span>
            <strong>${nextAction}</strong>
            <small>No auto-send. Review before customer contact.</small>
          </article>
          <article>
            <span>Open Follow-ups</span>
            <strong>${pendingTasks.length}</strong>
            <small>${pendingTasks[0]?.due_date || "no pending due date"}</small>
          </article>
        </div>
        <div class="detail-grid">
          ${detailList("Basic Info", [
            ["Contact", customer.contact_name || customer.name],
            ["Email", customer.email],
            ["WhatsApp", customer.whatsapp],
            ["Aliases", customer.aliases],
            ["Last contact", customer.lastContact],
          ])}
          ${detailList("Leads", leads.map((item) => [item.source || "lead", item.title || item.company || item.name]))}
          ${detailList(
            "Inquiries",
            inquiries.map((item) => [
              item.status,
              `<button class="link-button" data-open-related-inquiry="${item.id}" type="button">${item.title}</button>`,
            ]),
          )}
          ${detailList("Projects", projects.map((item) => [item.stage, item.title || item.name]))}
          ${detailList("Quotations", quotations.map((item) => [item.status, item.quote_no || item.no]))}
          ${detailList("Orders", orders.map((item) => [item.status, item.order_no]))}
          ${detailList("Shipments", shipments.map((item) => [item.status, item.shipment_no || item.route]))}
          ${detailList("After-sales", afterSales.map((item) => [item.status, item.case_no]))}
          ${detailList("Follow-up Tasks", tasks.map((item) => [item.due_date || item.status, item.title]))}
          ${detailList("Communication Logs", logs.map((item) => [item.channel || item.source || "log", item.summary || item.title || item.content]))}
          <article class="detail-box wide">
            <h3>Customer Timeline</h3>
            <div class="mini-timeline">
              ${timeline.map((item) => `<p><strong>${item.date}</strong><span>${item.type}</span>${item.text}</p>`).join("") || "<p>暂无时间线记录</p>"}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Customer Summary</h3>
            <p>${customer.summary || "暂无摘要"}</p>
          </article>
        </div>
      </div>
    </section>
  `;
}

function customerTimeline(groups) {
  const rows = [];
  groups.leads.forEach((item) => rows.push({ date: dateOnly(item.created_at || item.lastContact), type: "Lead", text: item.title || item.company || item.name }));
  groups.inquiries.forEach((item) => rows.push({ date: dateOnly(item.created_at), type: "Inquiry", text: `${item.title} · ${item.status}` }));
  groups.projects.forEach((item) => rows.push({ date: dateOnly(item.created_at || item.updated_at), type: "Project", text: `${item.title || item.name} · ${item.stage || item.status || "-"}` }));
  groups.quotations.forEach((item) => rows.push({ date: dateOnly(item.created_at), type: "Quotation", text: `${item.quote_no || item.no} · ${item.status}` }));
  groups.orders.forEach((item) => rows.push({ date: dateOnly(item.created_at), type: "Order", text: `${item.order_no} · ${item.status}` }));
  groups.shipments.forEach((item) => rows.push({ date: dateOnly(item.created_at), type: "Shipment", text: `${item.shipment_no || item.route} · ${item.status}` }));
  groups.afterSales.forEach((item) => rows.push({ date: dateOnly(item.created_at), type: "After-sales", text: `${item.case_no} · ${item.status}` }));
  groups.tasks.forEach((item) => rows.push({ date: item.due_date || dateOnly(item.created_at), type: "Task", text: `${item.title} · ${item.status}` }));
  groups.logs.forEach((item) => rows.push({ date: dateOnly(item.created_at || item.date), type: item.channel || "Log", text: item.summary || item.content || item.title || "-" }));
  return rows.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 12);
}

function detailList(title, rows) {
  const normalized = rows.filter((row) => row && (row[0] || row[1]));
  return `
    <article class="detail-box">
      <h3>${title}</h3>
      ${normalized.map(([label, value]) => `<p><strong>${label || "-"}:</strong> ${value || "-"}</p>`).join("") || "<p>暂无记录</p>"}
    </article>
  `;
}

function customerRelatedCounts(customerId) {
  return {
    leads: state.leads.filter((item) => item.customer_id === customerId || item.customerId === customerId).length,
    inquiries: state.inquiries.filter((item) => item.customer_id === customerId).length,
    projects: state.projects.filter((item) => item.customer_id === customerId || item.customerId === customerId).length,
    quotations: state.quotations.filter((item) => item.customer_id === customerId).length,
    orders: state.orders.filter((item) => item.customer_id === customerId).length,
    shipments: state.shipments.filter((item) => item.customer_id === customerId).length,
    afterSales: state.after_sales_cases.filter((item) => item.customer_id === customerId).length,
    logs: state.communication_logs.filter((item) => item.customer_id === customerId).length,
    tasks: state.follow_up_tasks.filter((item) => item.customer_id === customerId).length,
  };
}

function renderProspects() {
  const prospects = state.prospects.filter(matches);
  return `
    <div class="toolbar">
      <div>
        <h2>潜在客户池</h2>
        <p class="muted">持续开发新客户的核心列表：目标公司、匹配度、触达渠道和下一步。</p>
      </div>
      <button class="primary-button" data-action="add-prospect" type="button">新增潜客</button>
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>目标公司</th>
              <th>国家</th>
              <th>客户类型</th>
              <th>渠道</th>
              <th>匹配度</th>
              <th>状态</th>
              <th>需求判断</th>
              <th>下一步</th>
            </tr>
          </thead>
          <tbody>
            ${prospects
              .map(
                (prospect) => `
                  <tr>
                    <td class="name-cell"><strong>${prospect.company}</strong></td>
                    <td>${prospect.country}</td>
                    <td>${prospect.segment}</td>
                    <td>${prospect.channel}</td>
                    <td><span class="badge ${prospect.fit >= 85 ? "ok" : "warning"}">${prospect.fit}</span></td>
                    <td>${statusBadge(prospect.status)}</td>
                    <td>${prospect.need}</td>
                    <td>${prospect.nextAction}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderWebsite() {
  const pages = state.websitePages.filter(matches);
  return `
    <div class="toolbar">
      <div>
        <h2>独立站增长中心</h2>
        <p class="muted">用产品页、案例页和询盘表单承接 Google/社媒流量。</p>
      </div>
      <button class="primary-button" data-action="add-page" type="button">新增页面</button>
    </div>
    <div class="grid two-col">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>页面计划</h2>
            <p>每个页面都要有目标客户、SEO 词和询盘动作</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>页面</th>
                <th>类型</th>
                <th>状态</th>
                <th>目标客户</th>
                <th>CTA</th>
                <th>SEO</th>
              </tr>
            </thead>
            <tbody>
              ${pages
                .map(
                  (page) => `
                    <tr>
                      <td class="name-cell"><strong>${page.title}</strong></td>
                      <td>${page.type}</td>
                      <td>${statusBadge(page.status)}</td>
                      <td>${page.target}</td>
                      <td>${page.cta}</td>
                      <td>${page.seo}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>询盘表单字段</h2>
            <p>专门适配你的项目型铝材业务</p>
          </div>
        </div>
        <div class="panel-body task-list">
          ${[
            "Product type / Project type",
            "Drawing upload: DWG, PDF, Excel, image",
            "RAL color / Surface finish / Length",
            "Quantity / Destination port / Required certificate",
            "Auto-create Lead + AI missing-info checklist",
          ]
            .map((item) => `<article class="task-item"><h3>${item}</h3><p>进入后台询盘池后自动生成回复草稿。</p></article>`)
            .join("")}
        </div>
      </section>
    </section>
  `;
}

function sampleAlibabaText() {
  return `Product: CNC aluminum parts and custom extruded and machined aluminum components
Buyer: Demo Alibaba Purchasing Manager
Company: Demo Alibaba Industrial Buyer
Country: Mexico
Email: purchasing@example.com
WhatsApp: +52 000 000 0000
Quantity: 5000 pcs first trial order, annual demand to be confirmed
Material: 6061-T6 aluminum, anodized black
Destination port: Manzanillo
Attachments: bracket-step-file.step; product-photo.jpg
Inquiry URL: https://message.alibaba.com/mock-thread
Message: We are looking for CNC aluminum parts, aluminum brackets, aluminum housings and aluminum connectors. Please review tolerance, inspection report and packing. Official quotation should be manually reviewed.`;
}

function sampleAlibabaBatchText() {
  return `Product,Buyer,Company,Country,Email,WhatsApp,Quantity,Material,Destination port,Attachments,Inquiry URL,Message
CNC aluminum parts,Demo Purchasing Manager,Demo Mexico Industrial Buyer,Mexico,purchasing-mx@example.com,+52 000 000 0000,5000 pcs trial and annual demand to confirm,6061-T6 anodized black,Manzanillo,bracket.step; photo.jpg,https://message.alibaba.com/mock-thread-mx,Need CNC aluminum parts aluminum brackets housings connectors tolerance inspection report and packing.
Aluminum window and curtain wall profiles,Demo Project Buyer,Demo Colombia Facade Contractor,Colombia,project-co@example.com,+57 000 000 0000,1200 sqm project,6063-T5 powder coated RAL 7016,Cartagena,facade-drawing.pdf; boq.xlsx,https://message.alibaba.com/mock-thread-co,Looking for curtain wall systems facade aluminum materials glass railings and aluminum louvers for a project. Need manual quotation review.
Custom extruded and machined aluminum components,Demo OEM Buyer,Demo Chile Equipment Manufacturer,Chile,oem-cl@example.com,+56 000 000 0000,8000 pcs first order monthly repeat demand,6082 aluminum powder coated silver,San Antonio,connector.dxf; inspection-request.pdf,https://message.alibaba.com/mock-thread-cl,Need custom extruded and machined aluminum components aluminum connectors anodized aluminum parts and powder coated aluminum parts.`;
}

function runAlibabaFullFlow() {
  let inquiry = state.inquiries.find((item) => item.source === Source.ALIBABA);
  if (!inquiry) {
    const result = createAlibabaInquiries(state, sampleAlibabaBatchText());
    inquiry = result.imported[0] || state.inquiries.find((item) => item.source === Source.ALIBABA);
  }
  if (!inquiry) {
    alert("未能创建阿里巴巴询盘。");
    return;
  }
  const customer = createCustomerFromInquiry(state, inquiry.id);
  const project = createProjectFromInquiry(state, inquiry.id);
  const quotation = createQuotationDraft(state, inquiry.id, "inquiry");
  const order = quotation ? createOrderFromQuotation(state, quotation.id) : null;
  const shipment = order ? createShipmentFromOrder(state, order.id) : null;
  const afterSalesCase = shipment ? createAfterSalesCaseFromShipment(state, shipment.id) : null;
  const repeatTask = afterSalesCase ? createRepeatBusinessReminder(state, afterSalesCase.id) : null;
  selectedInquiryId = inquiry.id;
  selectedCustomerId = customer?.id || selectedCustomerId;
  saveState();
  render();
  alert(
    [
      "Alibaba full mock flow 已生成：",
      `Inquiry: ${inquiry.title}`,
      `Customer: ${customer?.name || "-"}`,
      `Project: ${project?.title || project?.name || "-"}`,
      `Quotation Draft: ${quotation?.quote_no || "-"}`,
      `Order: ${order?.order_no || "-"}`,
      `Shipment: ${shipment?.shipment_no || "-"}`,
      `After-sales: ${afterSalesCase?.case_no || "-"}`,
      `Repeat task: ${repeatTask?.title || "-"}`,
      "仍然不会自动回复客户，不会自动发送正式报价或 PI。",
    ].join("\n"),
  );
}

function sampleAcquisitionLead(source = Source.MANUAL) {
  const sourceLabels = {
    [Source.GMAIL]: "Gmail read-only inquiry",
    [Source.WHATSAPP]: "WhatsApp read-only inquiry",
    [Source.MANUAL]: "Manual imported lead",
    google_ads: "Google Ads landing page lead",
    seo: "SEO organic inquiry",
    social_media: "Social media prospect",
    trade_show: "Trade show lead",
  };
  return {
    id: newId("lead"),
    title: sourceLabels[source] || "Multi-channel acquisition lead",
    company: `Demo ${String(source).replaceAll("_", " ")} Buyer`,
    name: "Demo Contact",
    email: `${String(source).replaceAll("_", "-")}@example.com`,
    whatsapp: "+00 000 000 000",
    country: "Demo Market",
    business_line: source === Source.WHATSAPP ? BusinessLine.PRECISION : BusinessLine.ARCHITECTURAL,
    source,
    acquisition_channel: String(source).toUpperCase(),
    project_type: source === Source.WHATSAPP ? "CNC aluminum parts and machined components" : "Aluminum windows, doors and curtain wall materials",
    summary:
      source === Source.WHATSAPP
        ? "Read-only WhatsApp learning lead. Customer mentioned CNC aluminum parts, tolerance and anodized finish. Manual reply required."
        : "Multi-channel lead for aluminum project supply. Need drawings, quantity, finish and destination before manual quotation review.",
    score: source === Source.GMAIL || source === Source.WHATSAPP ? 78 : 68,
    status: "NEW",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function createLeadFromAcquisitionForm(convertToInquiry = false) {
  const source = document.querySelector("#acqSource")?.value || Source.MANUAL;
  const lead = {
    id: newId("lead"),
    title: document.querySelector("#acqTitle")?.value || "Manual acquisition lead",
    company: document.querySelector("#acqCompany")?.value || "Unknown company",
    name: document.querySelector("#acqName")?.value || "",
    email: document.querySelector("#acqEmail")?.value || "",
    whatsapp: "",
    country: document.querySelector("#acqCountry")?.value || "",
    business_line: document.querySelector("#acqBusinessLine")?.value || BusinessLine.ARCHITECTURAL,
    source,
    acquisition_channel: String(source).toUpperCase(),
    project_type: document.querySelector("#acqTitle")?.value || "",
    summary: document.querySelector("#acqSummary")?.value || "",
    score: 65,
    status: "NEW",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  state.leads.unshift(lead);
  const inquiry = convertToInquiry ? createInquiryFromLead(state, lead.id) : null;
  selectedInquiryId = inquiry?.id || selectedInquiryId;
  saveState();
  render();
  alert(
    convertToInquiry
      ? `已创建获客线索并生成询盘：${inquiry?.title || lead.title}。`
      : `已创建获客线索：${lead.title}。`,
  );
}

function runUnifiedAcquisitionDemo() {
  importWebsiteInquiries(state);
  createAlibabaInquiries(state, sampleAlibabaBatchText());
  [Source.GMAIL, Source.WHATSAPP, Source.MANUAL, "google_ads", "seo", "social_media", "trade_show"].forEach((source) => {
    const lead = sampleAcquisitionLead(source);
    const exists = state.leads.some((item) => item.email === lead.email || (item.source === source && item.company === lead.company));
    if (!exists) state.leads.unshift(lead);
  });
  const firstUnconverted = state.leads.find((lead) => !state.inquiries.some((inquiry) => inquiry.lead_id === lead.id));
  const inquiry = firstUnconverted ? createInquiryFromLead(state, firstUnconverted.id) : state.inquiries[0];
  if (inquiry) selectedInquiryId = inquiry.id;
  saveState();
  render();
  alert("Unified Acquisition Demo 已完成：独立站、阿里巴巴、Gmail、WhatsApp、手动/广告/SEO/社媒/展会来源已进入统一获客视图。所有外发动作仍需人工审核。");
}

function renderAlibaba() {
  const alibabaInquiries = state.inquiries.filter((item) => item.source === Source.ALIBABA);
  const alibabaLeads = state.leads.filter((item) => item.source === Source.ALIBABA);
  const alibabaProjects = state.projects.filter((item) =>
    state.inquiries.some((inquiry) => inquiry.source === Source.ALIBABA && inquiry.id === item.inquiry_id),
  );
  const alibabaQuotes = state.quotations.filter((item) =>
    state.inquiries.some((inquiry) => inquiry.source === Source.ALIBABA && inquiry.id === item.inquiry_id),
  );
  const latest = alibabaInquiries[0];
  return `
    <div class="toolbar">
      <div>
        <h2>阿里巴巴询盘整理</h2>
        <p class="muted">先做半自动导入：粘贴阿里巴巴国际站询盘内容，系统整理为 Lead + Inquiry + 缺失信息 + 跟进任务。</p>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-alibaba-action="sample" type="button">填入示例</button>
        <button class="ghost-button" data-alibaba-action="sample-batch" type="button">填入批量示例</button>
        <button class="primary-button" data-alibaba-action="create-sample" type="button">创建示例询盘</button>
        <button class="primary-button" data-alibaba-action="run-full-flow" type="button">Run Alibaba Full Flow</button>
      </div>
    </div>

    <section class="panel safety-panel">
      <div class="panel-header">
        <div>
          <h2>Alibaba International Station Integration - Mock Only</h2>
          <p>当前不连接阿里巴巴接口，不读取真实账号，不发送任何消息。这里只把你粘贴的询盘文本整理成内部 CRM 数据。</p>
        </div>
        <span class="badge danger">No auto-send</span>
      </div>
      <div class="panel-body">
        <div class="process-grid dense">
          ${[
            "Paste Alibaba inquiry text",
            "Paste CSV/TSV batch export",
            "Create Lead + Inquiry",
            "Skip duplicate Alibaba inquiries",
            "Rule-based missing-info analysis",
            "Create manual follow-up task",
            "Convert to Customer / Project / Quotation Draft",
            "Manual review required before reply or official quote",
          ]
            .map((item) => `<div class="process-step">${item}</div>`)
            .join("")}
        </div>
      </div>
    </section>

    <div class="grid two-col" style="margin-top:16px">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>粘贴 / 批量导入阿里巴巴询盘</h2>
            <p>支持单条文本、多条文本块、CSV/TSV 表格。字段：Product, Buyer, Company, Country, Email, WhatsApp, Quantity, Material, Destination port, Attachments, Inquiry URL, Message。</p>
          </div>
        </div>
        <div class="panel-body">
          <textarea class="wide-textarea" id="alibabaInquiryText" placeholder="Paste Alibaba inquiry text here..."></textarea>
          <div class="detail-actions">
            <button class="primary-button" data-alibaba-action="import-text" type="button">Import Alibaba Inquiries to CRM</button>
            <button class="ghost-button" data-view-shortcut="leads" type="button">Go to Inquiry Pool</button>
          </div>
          <p class="demo-note">Official quotation requires manual review. No automatic reply, price, delivery time, PI or payment terms are confirmed by this demo.</p>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>当前阿里巴巴数据</h2>
            <p>所有数据都保存在浏览器 localStorage mock CRM 中。</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="grid stats-grid compact-stats">
            ${stat("Alibaba Leads", alibabaLeads.length, "source = alibaba")}
            ${stat("Alibaba Inquiries", alibabaInquiries.length, "进入询盘池")}
            ${stat("Alibaba Projects", alibabaProjects.length, "已转项目")}
            ${stat("Alibaba Quotes", alibabaQuotes.length, "报价草稿")}
            ${stat("High Score", alibabaInquiries.filter((item) => item.score >= 85).length, "Score 85+")}
            ${stat("Need Info", alibabaInquiries.filter((item) => item.missing_info?.length).length, "缺失信息")}
          </div>
          <article class="detail-box wide" style="margin-top:16px">
            <h3>Latest Alibaba Inquiry</h3>
            ${
              latest
                ? `<p><strong>${latest.title}</strong></p>
                  <p>${latest.lead_info?.company || "-"} · ${latest.lead_info?.country || "-"} · Score ${latest.score}</p>
                  <p>${latest.ai_summary}</p>
                  <button class="ghost-button" data-open-related-inquiry="${latest.id}" type="button">Open in Inquiry Pool</button>`
                : "<p>暂无阿里巴巴询盘。可以先填入示例或粘贴一条真实询盘文本。</p>"
            }
          </article>
        </div>
      </section>
    </div>

    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>最近阿里巴巴询盘</h2>
          <p>批量导入后在这里快速检查质量分、缺失信息和下一步动作。</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>询盘</th>
              <th>买家</th>
              <th>国家</th>
              <th>业务线</th>
              <th>评分</th>
              <th>缺失信息</th>
              <th>下一步</th>
            </tr>
          </thead>
          <tbody>
            ${alibabaInquiries
              .slice(0, 8)
              .map(
                (item) => `
                  <tr>
                    <td class="name-cell"><button class="link-button" data-open-related-inquiry="${item.id}" type="button">${item.title}</button><span>${item.project_type || "-"}</span></td>
                    <td>${item.lead_info?.company || item.lead_info?.name || "-"}</td>
                    <td>${item.lead_info?.country || "-"}</td>
                    <td>${businessLineLabel(item.business_line)}</td>
                    <td><span class="badge ${item.score >= 85 ? "ok" : "warning"}">${item.score}</span></td>
                    <td>${(item.missing_info || []).slice(0, 3).join(", ") || "基础信息较完整"}</td>
                    <td>${item.recommended_next_action || "-"}</td>
                  </tr>
                `,
              )
              .join("") || `<tr><td colspan="7">${empty("暂无阿里巴巴询盘。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>后续真实接入路径</h2>
          <p>等阿里巴巴账号和权限确认后，再判断能否通过官方 Open Platform 同步订单、产品或询盘相关数据。</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="timeline">
          ${[
            ["Phase 1", "Manual paste / CSV import", "现在可用，最稳，不依赖接口权限。"],
            ["Phase 2", "Email notification parsing", "如果阿里巴巴询盘邮件进入 Gmail，可从邮件中整理到同一套 CRM 流程。"],
            ["Phase 3", "Official API validation", "确认 Alibaba Open Platform 是否给当前卖家账号开放询盘/消息数据权限。"],
            ["Phase 4", "Read-only sync", "即使接 API，也先只读同步，不自动回复、不自动报价。"],
          ]
            .map(([phase, title, text]) => `<article class="timeline-item"><h3>${phase} · ${title}</h3><p>${text}</p></article>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderSocial() {
  const posts = state.socialPosts.filter(matches);
  return `
    <div class="toolbar">
      <div>
        <h2>社媒内容与触达</h2>
        <p class="muted">LinkedIn、Facebook、YouTube/短视频都围绕“项目能力证明”产出。</p>
      </div>
      <button class="primary-button" data-action="add-post" type="button">新增内容</button>
    </div>
    <div class="grid two-col">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>内容队列</h2>
            <p>把真实项目经验变成持续获客内容</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>平台</th>
                <th>主题</th>
                <th>受众</th>
                <th>状态</th>
                <th>目标</th>
              </tr>
            </thead>
            <tbody>
              ${posts
                .map(
                  (post) => `
                    <tr>
                      <td>${post.platform}</td>
                      <td class="name-cell"><strong>${post.topic}</strong></td>
                      <td>${post.audience}</td>
                      <td>${statusBadge(post.status)}</td>
                      <td>${post.goal}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>推荐内容支柱</h2>
            <p>避免发散，持续强化同一个专业定位</p>
          </div>
        </div>
        <div class="panel-body task-list">
          ${[
            ["Drawing Review", "如何准备型材图纸、panel schedule、RAL/finish 信息。"],
            ["Project Supply", "展示从报价、生产、验货、装柜到单证的完整供应链能力。"],
            ["Quality & Packaging", "喷涂、保护膜、厚塑料包装、长料装柜和第三方验货。"],
            ["Case Studies", "Demo Project Market、Demo Market A、Demo Market B、Demo Market C 等项目经验脱敏沉淀。"],
          ]
            .map(([title, text]) => `<article class="task-item"><h3>${title}</h3><p>${text}</p></article>`)
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCampaigns() {
  const campaigns = state.campaigns.filter(matches);
  return `
    <div class="toolbar">
      <div>
        <h2>客户开发活动</h2>
        <p class="muted">把目标市场、内容、潜客、邮件和跟进节奏放在同一个漏斗里。</p>
      </div>
      <button class="primary-button" data-action="add-campaign" type="button">新增活动</button>
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>活动</th>
              <th>市场</th>
              <th>主打方案</th>
              <th>渠道</th>
              <th>阶段</th>
              <th>线索/回复</th>
              <th>下一步</th>
            </tr>
          </thead>
          <tbody>
            ${campaigns
              .map(
                (campaign) => `
                  <tr>
                    <td class="name-cell"><strong>${campaign.name}</strong></td>
                    <td>${campaign.market}</td>
                    <td>${campaign.offer}</td>
                    <td>${campaign.channel}</td>
                    <td>${statusBadge(campaign.stage)}</td>
                    <td>${campaign.leads} / ${campaign.replies}</td>
                    <td>${campaign.nextAction}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>标准开发节奏</h2>
          <p>每个潜客自动生成任务，避免加了好友就断掉</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="process-grid">
          ${["Day 0 研究客户", "Day 1 首封开发信", "Day 3 LinkedIn 触达", "Day 7 案例跟进", "Day 14 技术资料包", "Day 30 复盘评分"]
            .map((step) => `<div class="process-step">${step}</div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderLeads() {
  const inquiries = state.inquiries
    .filter(matches)
    .filter((item) => inquiryFilters.business_line === "ALL" || item.business_line === inquiryFilters.business_line)
    .filter((item) => inquiryFilters.status === "ALL" || item.status === inquiryFilters.status)
    .filter((item) => inquiryFilters.source === "ALL" || item.source === inquiryFilters.source)
    .filter((item) => inquiryFilters.score === "ALL" || scoreLevel(item.score) === inquiryFilters.score);
  const selected = state.inquiries.find((item) => item.id === selectedInquiryId) || inquiries[0] || null;
  selectedInquiryId = selected?.id || "";
  const readyToQuote = inquiries.filter((item) => item.status === InquiryStatus.READY_TO_QUOTE).length;
  const needInfo = inquiries.filter((item) => item.status === InquiryStatus.NEED_MORE_INFO).length;
  const quoted = inquiries.filter((item) => item.status === InquiryStatus.QUOTATION_DRAFTED).length;
  const highScore = inquiries.filter((item) => Number(item.score || 0) >= 85).length;
  return `
    <div class="toolbar">
      <div>
        <h2>询盘池</h2>
        <p class="muted">${DATA_MODE === "supabase" ? "Supabase pilot: public website inquiry creates Lead + Inquiry + FollowUpTask. Customer is created only after manual conversion." : "Mock localStorage: website inquiry import creates Lead、Inquiry、Requirement、附件和跟进任务。"}</p>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-import-website-leads type="button">导入独立站询盘</button>
        <button class="ghost-button" data-run-demo-flow type="button">Run Full Demo Flow</button>
        <button class="primary-button" data-action="add-lead" type="button">新增询盘</button>
      </div>
    </div>

    <div class="grid stats-grid compact-stats">
      ${stat("数据来源", DATA_MODE === "supabase" ? "Supabase" : "localStorage", dataModeLabel())}
      ${stat("当前询盘", inquiries.length, "筛选后的记录")}
      ${stat("高分询盘", highScore, "Score 85+")}
      ${stat("缺资料", needInfo, "Need more info")}
      ${stat("可报价", readyToQuote, "Ready to quote")}
      ${stat("已出草稿", quoted, "Quotation drafted")}
      ${stat("待跟进", inquiries.reduce((sum, item) => sum + state.follow_up_tasks.filter((task) => task.inquiry_id === item.id && task.status === TaskStatus.PENDING).length, 0), "Pending tasks")}
    </div>

    <section class="panel">
      <div class="panel-body">
        <div class="notice-card">
          <strong>${DATA_MODE === "supabase" ? "Real Supabase pilot data" : "Mock localStorage data"}</strong>
          <p>${DATA_MODE === "supabase" ? "This list is loaded from /api/inquiries, /api/customers and /api/follow-ups with the current admin session. Public inquiries stay as Lead records until a user manually converts them to Customer." : "This list is loaded from browser localStorage for local demo and development testing."}</p>
        </div>
        <div class="filter-row">
          ${filterSelect("business_line", "业务线", [
            ["ALL", "全部业务线"],
            [BusinessLine.ARCHITECTURAL, "建筑铝系统"],
            [BusinessLine.PRECISION, "精密铝制造"],
          ])}
          ${filterSelect("status", "状态", [
            ["ALL", "全部状态"],
            [InquiryStatus.NEW, "NEW"],
            [InquiryStatus.NEED_MORE_INFO, "NEED_MORE_INFO"],
            [InquiryStatus.READY_TO_QUOTE, "READY_TO_QUOTE"],
            [InquiryStatus.QUOTATION_DRAFTED, "QUOTATION_DRAFTED"],
            [InquiryStatus.CONVERTED_TO_PROJECT, "CONVERTED_TO_PROJECT"],
            [InquiryStatus.CLOSED, "CLOSED"],
          ])}
          ${filterSelect("source", "来源", [
            ["ALL", "全部来源"],
            [Source.WEBSITE, "website"],
            [Source.ALIBABA, "alibaba"],
            [Source.GMAIL, "gmail"],
            [Source.WHATSAPP, "whatsapp"],
            [Source.MANUAL, "manual"],
          ])}
          ${filterSelect("score", "评分", [
            ["ALL", "全部评分"],
            ["HIGH", "HIGH 85+"],
            ["MEDIUM", "MEDIUM 65-84"],
            ["LOW", "LOW <65"],
          ])}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>询盘</th>
              <th>客户/公司</th>
              <th>国家</th>
              <th>业务线</th>
              <th>来源</th>
              <th>评分</th>
              <th>状态</th>
              <th>缺失</th>
              <th>跟进状态</th>
              <th>创建时间</th>
              <th>下次跟进</th>
            </tr>
          </thead>
          <tbody>
            ${inquiries
              .map(
                (inquiry) => `
                  <tr class="${contextRowClass("inquiry", inquiry.id, selected?.id === inquiry.id ? "selected-row" : "")}">
                    <td class="name-cell"><button class="link-button" data-view-inquiry="${inquiry.id}" type="button">${inquiry.title}</button><span>${inquiry.project_type || "-"}</span></td>
                    <td>${customerOrLeadName(inquiry)}</td>
                    <td>${inquiry.lead_info?.country || "-"}</td>
                    <td>${businessLineLabel(inquiry.business_line)}</td>
                    <td><span class="badge">${inquiry.source}</span></td>
                    <td><span class="badge ${inquiry.score >= 85 ? "ok" : inquiry.score >= 65 ? "warning" : ""}">${inquiry.score}</span></td>
                    <td>${statusBadge(inquiry.status)}</td>
                    <td>${(inquiry.missing_info || []).length}</td>
                    <td>${statusBadge(followUpStatusForInquiry(inquiry.id))}</td>
                    <td>${dateOnly(inquiry.created_at)}</td>
                    <td>${nextFollowUpDate(inquiry.id)}</td>
                  </tr>
                `,
              )
              .join("") || `<tr><td colspan="11">${empty("暂无匹配询盘")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    ${selected ? inquiryDetail(selected) : ""}
  `;
}

function filterSelect(name, label, options) {
  return `
    <label>
      <span>${label}</span>
      <select data-inquiry-filter="${name}">
        ${options.map(([value, text]) => `<option value="${value}" ${inquiryFilters[name] === value ? "selected" : ""}>${text}</option>`).join("")}
      </select>
    </label>
  `;
}

function inquiryReadiness(inquiry) {
  const missing = inquiry.missing_info || [];
  const hasContact = Boolean(inquiry.lead_info?.email || inquiry.lead_info?.whatsapp);
  const hasCompany = Boolean(inquiry.lead_info?.company || inquiry.lead_info?.name);
  const hasRequirement = Boolean(inquiry.project_type || inquiry.project_description);
  const hasDestination = Boolean(inquiry.destination_port || inquiry.lead_info?.country);
  const hasDrawingSignal =
    Boolean(inquiry.attachment_names?.length) ||
    /drawing|dwg|pdf|step|stp|iges|dxf|boq|schedule/i.test(
      `${inquiry.drawing_status || ""} ${inquiry.project_description || ""}`,
    );
  const score = Number(inquiry.score || 0);
  const blockers = [];
  if (!hasContact) blockers.push("customer contact");
  if (!hasCompany) blockers.push("company / buyer name");
  if (!hasRequirement) blockers.push("product or project requirement");
  if (!hasDestination) blockers.push("destination / market");
  if (!hasDrawingSignal) blockers.push("drawing / BOQ / technical file signal");
  if (missing.length > 4) blockers.push("too many missing technical items");
  if (score < 65) blockers.push("low score");
  const ready = blockers.length === 0 && score >= 65;
  return {
    ready,
    blockers,
    label: ready ? "READY_FOR_MANUAL_QUOTE_REVIEW" : "NEED_MORE_INFORMATION",
    nextAction: ready
      ? "Create quotation draft only as an internal draft. Manual price, lead time, payment and PI review required."
      : `Request missing information first: ${blockers.slice(0, 4).join(", ") || missing.slice(0, 4).join(", ")}`,
  };
}

function expectedInquiryChecklist(inquiry) {
  const text = `${inquiry.project_type || ""} ${inquiry.project_description || ""} ${inquiry.support_needed || ""} ${inquiry.material_finish || ""} ${inquiry.drawing_status || ""}`;
  const architectural = [
    ["drawings", Boolean(inquiry.attachment_names?.length) || /dwg|pdf|drawing|boq|schedule/i.test(text)],
    ["product category", Boolean(inquiry.project_type)],
    ["project location", Boolean(inquiry.lead_info?.country || inquiry.destination_port) || /location|site|project country/i.test(text)],
    ["glass specification", /glass|tempered|laminated|low-e|double glazing|triple glazing/i.test(text)],
    ["aluminum color", /ral|color|colour|anodized|powder|pvdf/i.test(text)],
    ["quantity/area", /qty|quantity|pcs|sets|sqm|m2|area|boq|schedule/i.test(text)],
    ["Destination port", Boolean(inquiry.destination_port)],
  ];
  const precision = [
    ["drawing file", Boolean(inquiry.attachment_names?.length) || /step|stp|iges|dwg|pdf|dxf|drawing/i.test(text)],
    ["material grade", /6061|6063|6082|7075|material|grade|t5|t6/i.test(text)],
    ["tolerance", /tolerance|\+\/-|precision/i.test(text)],
    ["surface finish", /anodized|powder|sandblast|finish|surface|color/i.test(text)],
    ["quantity", /qty|quantity|pcs|sets|annual|monthly|batch/i.test(text)],
    ["destination", Boolean(inquiry.destination_port || inquiry.lead_info?.country)],
  ];
  return inquiry.business_line === BusinessLine.PRECISION ? precision : architectural;
}

function checklistItem(label, done) {
  return `<div class="check-item ${done ? "done" : ""}"><span>${done ? "✓" : "!"}</span><strong>${label}</strong></div>`;
}

function replyDraftBlock(label, draft) {
  return `
    <article>
      <h4>${label}</h4>
      <pre>${draft || "Draft unavailable. Run mock analyzer or collect more inquiry information."}</pre>
    </article>
  `;
}

function safeReplyDrafts(inquiry) {
  const missing = (inquiry.missing_info || []).length
    ? (inquiry.missing_info || []).slice(0, 6).join(", ")
    : "drawings, quantity, material/finish, destination and any technical requirements";
  const name = inquiry.lead_info?.name || "Customer";
  return {
    en:
      inquiry.reply_draft_en ||
      `Dear ${name},\n\nThank you for your inquiry. We have received your information and will review it manually before any official quotation.\n\nTo prepare the next review step, please help confirm: ${missing}.\n\nPlease note this is not an official quotation. Price, delivery time, payment terms and PI require manual review.\n\nBest regards,\nCBM Team`,
    zh:
      inquiry.reply_draft_zh ||
      `${name}，您好，感谢您的询盘。我们已收到资料，正式报价前需要人工审核。\n\n为了继续评估，请补充确认：${missing}。\n\n请注意：此内容不是正式报价，价格、交期、付款条款和 PI 均需人工审核后确认。`,
    es:
      inquiry.reply_draft_es ||
      `Estimado/a ${name},\n\nGracias por su consulta. Revisaremos la información manualmente antes de cualquier cotización oficial.\n\nPara continuar, por favor confirme: ${missing}.\n\nEste mensaje no es una cotización oficial. Precio, plazo de entrega, condiciones de pago y PI requieren revisión manual.\n\nSaludos,\nCBM Team`,
  };
}

function inquiryDetail(inquiry) {
  const req = requirementForInquiry(inquiry);
  const tasks = state.follow_up_tasks.filter((task) => task.inquiry_id === inquiry.id);
  const attachments = state.attachments.filter((item) => item.inquiry_id === inquiry.id);
  const quotations = state.quotations.filter((item) => item.inquiry_id === inquiry.id);
  const project = state.projects.find((item) => item.id === inquiry.project_id || item.inquiry_id === inquiry.id);
  const quotation = quotations[0] || (project ? state.quotations.find((item) => item.project_id === project.id) : null);
  const order = quotation ? state.orders.find((item) => item.quotation_id === quotation.id) : null;
  const shipment = order ? state.shipments.find((item) => item.order_id === order.id) : null;
  const afterSalesCase = shipment ? state.after_sales_cases.find((item) => item.shipment_id === shipment.id) : null;
  const repeatTask = afterSalesCase
    ? state.follow_up_tasks.find((item) => item.after_sales_case_id === afterSalesCase.id && item.type === "REPEAT_BUSINESS")
    : null;
  const readiness = inquiryReadiness(inquiry);
  const checklist = expectedInquiryChecklist(inquiry);
  const drafts = safeReplyDrafts(inquiry);
  return `
    <section class="panel detail-panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${inquiry.title}</h2>
          <p>Manual review required before official quotation.</p>
        </div>
        <span class="badge danger">No auto-send</span>
      </div>
      <div class="panel-body">
        <div class="flow-checklist">
          ${flowStep("Website inquiry", true, inquiry.source)}
          ${flowStep("Lead / Customer", Boolean(inquiry.lead_id || inquiry.customer_id), customerOrLeadName(inquiry))}
          ${flowStep("Inquiry", true, inquiry.status)}
          ${flowStep("Project", Boolean(project), project?.stage || "not created")}
          ${flowStep("Quotation", Boolean(quotation), quotation?.status || "draft missing")}
          ${flowStep("Order", Boolean(order), order?.status || "not created")}
          ${flowStep("Shipment", Boolean(shipment), shipment?.status || "not created")}
          ${flowStep("After-sales", Boolean(afterSalesCase), afterSalesCase?.status || "not created")}
          ${flowStep("Repeat reminder", Boolean(repeatTask), repeatTask?.due_date || "not created")}
        </div>
        <div class="detail-actions">
          <button class="primary-button" data-inquiry-action="convert-customer" data-id="${inquiry.id}" type="button">Convert to Customer</button>
          <button class="primary-button" data-inquiry-action="convert-project" data-id="${inquiry.id}" type="button">Convert to Project</button>
          <button class="primary-button" data-inquiry-action="create-quote" data-id="${inquiry.id}" type="button">Create Quotation Draft</button>
          <button class="ghost-button" data-inquiry-action="ready-check" data-id="${inquiry.id}" type="button">Run Ready-to-Quote Check</button>
          <button class="ghost-button" data-inquiry-action="missing-task" data-id="${inquiry.id}" type="button">Create Missing Info Task</button>
          <button class="ghost-button" data-inquiry-action="need-more-info" data-id="${inquiry.id}" type="button">Mark Need More Info</button>
          <button class="ghost-button" data-inquiry-action="ready-to-quote" data-id="${inquiry.id}" type="button">Mark Ready to Quote</button>
          <button class="ghost-button" data-inquiry-action="close" data-id="${inquiry.id}" type="button">Close Inquiry</button>
        </div>
        <section class="inquiry-command">
          <article>
            <span>Ready to Quote Review</span>
            <strong>${readiness.label}</strong>
            <small>${readiness.nextAction}</small>
          </article>
          <article>
            <span>Manual Safety Boundary</span>
            <strong>No automatic quotation or PI</strong>
            <small>No price, lead time, payment term or bank account is confirmed by this demo.</small>
          </article>
          <article>
            <span>Missing Info Count</span>
            <strong>${(inquiry.missing_info || []).length + readiness.blockers.length}</strong>
            <small>${readiness.blockers.length ? readiness.blockers.join(", ") : "No readiness blocker detected."}</small>
          </article>
        </section>
        <div class="detail-grid">
          ${detailBox("客户/Lead", [
            ["Name", inquiry.lead_info?.name],
            ["Company", inquiry.lead_info?.company],
            ["Email", inquiry.lead_info?.email],
            ["WhatsApp", inquiry.lead_info?.whatsapp],
            ["Country", inquiry.lead_info?.country],
          ])}
          ${detailBox("原始网站提交", [
            ["Project type", inquiry.project_type],
            ["Drawing status", inquiry.drawing_status],
            ["Quote method", inquiry.quote_method],
            ["Material / finish", inquiry.material_finish],
            ["Destination port", inquiry.destination_port],
            ["Support", inquiry.support_needed],
          ])}
          ${detailBox("需求明细", Object.entries(req || {}).filter(([key]) => !["id", "inquiry_id", "created_at"].includes(key)))}
          <article class="detail-box wide">
            <h3>Mock AI Summary</h3>
            <p>${inquiry.ai_summary || analyzeInquiry(inquiry).ai_summary}</p>
            <p><strong>Recommended next action:</strong> ${inquiry.recommended_next_action || "-"}</p>
          </article>
          <article class="detail-box">
            <h3>Missing Information</h3>
            ${(inquiry.missing_info || []).map((item) => `<p>• ${item}</p>`).join("") || "<p>基础信息较完整。</p>"}
          </article>
          <article class="detail-box wide">
            <h3>Missing Info Checklist</h3>
            <div class="checklist-grid">
              ${checklist.map(([label, done]) => checklistItem(label, done)).join("")}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Ready to Quote Decision Panel</h3>
            <div class="quote-readiness ${readiness.ready ? "ready" : "blocked"}">
              <strong>${readiness.label}</strong>
              <p>${readiness.nextAction}</p>
              <p><span class="badge danger">Manual review required before official quotation</span></p>
            </div>
          </article>
          <article class="detail-box">
            <h3>Follow-up Tasks</h3>
            ${tasks.map((task) => `<p><strong>${task.type}</strong><br>${task.title}<br><span class="muted">${task.due_date} · ${task.status}</span></p>`).join("") || "<p>暂无任务</p>"}
          </article>
          <article class="detail-box">
            <h3>Attachments</h3>
            ${attachments.map((item) => `<p>${item.file_name}</p>`).join("") || "<p>暂无附件名</p>"}
          </article>
          <article class="detail-box">
            <h3>Quotation Drafts</h3>
            ${quotations.map((item) => `<p><strong>${item.quote_no}</strong><br>${item.status} · ${item.incoterm}<br>Manual review required: ${item.manual_review_required ? "Yes" : "No"}</p>`).join("") || "<p>暂无报价草稿</p>"}
          </article>
          <article class="detail-box wide">
            <h3>Related Business Chain</h3>
            <div class="relation-strip">
              ${relationPill("Lead", inquiry.lead_id || "linked by website key")}
              ${relationPill("Customer", inquiry.customer_id ? customerOrLeadName(inquiry) : "not converted")}
              ${relationPill("Project", project?.title || project?.name || "not created")}
              ${relationPill("Quotation", quotation?.quote_no || "not created")}
              ${relationPill("Order", order?.order_no || "not created")}
              ${relationPill("Shipment", shipment?.shipment_no || "not created")}
              ${relationPill("After-sales", afterSalesCase?.case_no || "not created")}
              ${relationPill("Repeat", repeatTask?.title || "not created")}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Reply Drafts - Human Review Only</h3>
            <div class="reply-draft-grid">
              ${replyDraftBlock("English Draft", drafts.en)}
              ${replyDraftBlock("Chinese Draft", drafts.zh)}
              ${replyDraftBlock("Spanish Draft", drafts.es)}
            </div>
          </article>
        </div>
      </div>
    </div>
  `;
}

function flowStep(label, done, detail) {
  return `
    <div class="flow-step ${done ? "done" : ""}">
      <span>${done ? "✓" : "•"}</span>
      <strong>${label}</strong>
      <small>${detail || "-"}</small>
    </div>
  `;
}

function relationPill(label, value) {
  return `<span><strong>${label}</strong>${value || "-"}</span>`;
}

function renderWhatsapp() {
  const signals = state.whatsappSignals.filter(matches);
  const drafts = state.replyDrafts.filter(matches);
  return `
    <div class="toolbar">
      <div>
        <h2>WhatsApp 智能学习</h2>
        <p class="muted">只读分析客户沟通，提取线索、任务、风险和回复草稿；默认不自动发送。</p>
      </div>
    </div>
    <div class="grid two-col">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>高价值聊天信号</h2>
            <p>从真实聊天中总结出的项目推进信号</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>联系人</th>
                <th>国家/区域</th>
                <th>类型</th>
                <th>评分</th>
                <th>识别信号</th>
                <th>系统动作</th>
              </tr>
            </thead>
            <tbody>
              ${signals
                .map(
                  (item) => `
                    <tr>
                      <td class="name-cell"><strong>${item.contact}</strong><span>${statusBadge(item.status)}</span></td>
                      <td>${item.country}</td>
                      <td>${item.type}</td>
                      <td><span class="badge ${item.score >= 85 ? "ok" : "warning"}">${item.score}</span></td>
                      <td>${item.signal}</td>
                      <td>${item.action}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>回复草稿库</h2>
            <p>AI 可生成草稿，但必须人工确认后发送</p>
          </div>
        </div>
        <div class="panel-body task-list">
          ${drafts
            .map(
              (draft) => `
                <article class="task-item">
                  <h3>${draft.title} <span class="badge">${draft.language}</span></h3>
                  <p class="muted">${draft.scenario}</p>
                  <p>${draft.text}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>同步规则</h2>
          <p>把聊天变成可执行业务数据</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="process-grid dense">
          ${[
            "只读读取，不发送、不点赞、不改标签",
            "验证码、广告、纯通知自动降权",
            "产品词、图纸、文件、照片、报价自动升权",
            "let me check 自动生成待办",
            "客户内部工程师/老板确认进入等待状态",
            "西语/英语自动翻译为内部中文任务",
          ]
            .map((step) => `<div class="process-step">${step}</div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderAutomation() {
  const steps = state.orderFlow.filter(matches);
  return `
    <div class="toolbar">
      <div>
        <h2>订单自动化中枢</h2>
        <p class="muted">从开发客户到售后关闭，所有动作都有触发条件、负责人和 AI 辅助。</p>
      </div>
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>阶段</th>
              <th>负责人</th>
              <th>触发条件</th>
              <th>自动化动作</th>
            </tr>
          </thead>
          <tbody>
            ${steps
              .map(
                (step) => `
                  <tr>
                    <td class="name-cell"><strong>${step.stage}</strong></td>
                    <td>${step.owner}</td>
                    <td>${step.trigger}</td>
                    <td>${step.automation}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
    <div class="grid two-col" style="margin-top:16px">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>下一步接口</h2>
            <p>后端真正落地时需要接入的数据源</p>
          </div>
        </div>
        <div class="panel-body task-list">
          ${[
            ["Gmail", "同步询盘、报价确认、单证和客户附件，提取任务和项目状态。"],
            ["WhatsApp", "通过合规方式只读同步聊天，生成线索评分、待办和回复草稿。"],
            ["客户资料文件夹", "索引报价单、图纸、PI/CI/PL/BL、证书、照片和视频。"],
            ["独立站", "询盘表单直接创建 Lead，并触发缺失信息清单和自动回复草稿。"],
          ]
            .map(([title, text]) => `<article class="task-item"><h3>${title}</h3><p>${text}</p></article>`)
            .join("")}
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>风险控制</h2>
            <p>自动化越强，越要保留人工确认点</p>
          </div>
        </div>
        <div class="panel-body task-list">
          ${[
            "客户回复默认生成草稿，不自动发送。",
            "报价、合同、发票、BL 修改必须人工确认。",
            "付款、清关主体、收货人不一致时强制标红。",
            "售后责任判断先收集证据，不自动承诺赔偿。",
          ]
            .map((item) => `<article class="task-item"><h3>${item}</h3><p>系统可以辅助判断，但关键承诺需要你确认。</p></article>`)
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderProjects() {
  const projects = state.projects.filter(matches);
  const selected = state.projects.find((item) => item.id === selectedProjectId) || projects[0] || null;
  selectedProjectId = selected?.id || "";
  const highPriority = projects.filter((item) => item.priority === "high").length;
  const requirementReview = projects.filter((item) => item.stage === ProjectStage.REQUIREMENT_REVIEW || item.stage === "requirement_review").length;
  const quotationStage = projects.filter((item) => item.stage === ProjectStage.QUOTATION || item.stage === "quotation").length;
  const ordered = projects.filter((item) => item.stage === ProjectStage.ORDERED || item.stage === "ordered").length;
  return `
    <div class="toolbar">
      <div>
        <h2>项目中心</h2>
        <p class="muted">把询盘转成项目后，集中管理需求评审、报价、谈判、订单、出货和售后关系。</p>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-view-shortcut="leads" type="button">从询盘创建项目</button>
        <button class="primary-button" data-action="add-project" type="button">新增项目</button>
      </div>
    </div>
    <div class="grid stats-grid compact-stats">
      ${stat("项目", projects.length, "current view")}
      ${stat("高优先级", highPriority, "priority high")}
      ${stat("需求评审", requirementReview, "requirement review")}
      ${stat("报价阶段", quotationStage, "quotation / negotiation")}
      ${stat("已下单", ordered, "mock ordered")}
      ${stat("关联报价", state.quotations.filter((quote) => projects.some((project) => project.id === quote.project_id)).length, "quote drafts")}
    </div>
    <section class="panel">
      <div class="panel-body">
        ${projectTable(projects)}
      </div>
    </section>
    ${selected ? projectDetail(selected) : ""}
  `;
}

function projectTable(projects) {
  if (!projects.length) return empty("暂无匹配项目");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>项目</th>
            <th>客户</th>
            <th>国家</th>
            <th>业务线 / 类型</th>
            <th>阶段</th>
            <th>优先级</th>
            <th>关联询盘/报价</th>
            <th>下一步</th>
            <th>动作</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map(
              (project) => `
                ${(() => {
                  const quoteCount = state.quotations.filter((item) => item.project_id === project.id).length;
                  const inquiry = state.inquiries.find((item) => item.id === project.inquiry_id);
                  return `
                  <tr>
                  <td class="name-cell"><button class="link-button" data-view-project="${project.id}" type="button">${project.title || project.name}</button><span>${project.status}</span></td>
                  <td>${customerName(project.customer_id || project.customerId)}</td>
                  <td>${project.country}</td>
                  <td>${project.business_line ? businessLineLabel(project.business_line) : ""}<br>${project.type}</td>
                  <td>${statusBadge(project.stage)}</td>
                  <td><span class="badge ${project.priority === "high" ? "danger" : ""}">${project.priority || "normal"}</span></td>
                  <td>${inquiry?.title || "-"}<br><span class="badge">Quote ${quoteCount}</span></td>
                  <td>${project.next_action || project.risk}</td>
                  <td><button class="ghost-button" data-view-project="${project.id}" type="button">Open Project</button></td>
                  </tr>
                  `;
                })()}
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function projectStages() {
  return [
    ProjectStage.REQUIREMENT_REVIEW,
    ProjectStage.QUOTATION,
    ProjectStage.NEGOTIATION,
    ProjectStage.ORDER_PENDING,
    ProjectStage.ORDERED,
    ProjectStage.LOST,
  ];
}

function projectRelations(project) {
  const inquiry = state.inquiries.find((item) => item.id === project.inquiry_id || item.project_id === project.id);
  const quotations = state.quotations.filter((item) => item.project_id === project.id || item.inquiry_id === inquiry?.id);
  const quotation = quotations[0] || null;
  const order = quotation ? state.orders.find((item) => item.quotation_id === quotation.id) : null;
  const shipment = order ? state.shipments.find((item) => item.order_id === order.id) : null;
  const afterSales = shipment ? state.after_sales_cases.find((item) => item.shipment_id === shipment.id) : null;
  const tasks = state.follow_up_tasks.filter(
    (item) => item.project_id === project.id || item.inquiry_id === inquiry?.id || item.quotation_id === quotation?.id,
  );
  return { inquiry, quotations, quotation, order, shipment, afterSales, tasks };
}

function projectDetail(project) {
  const { inquiry, quotations, quotation, order, shipment, afterSales, tasks } = projectRelations(project);
  const currentStageIndex = projectStages().indexOf(project.stage);
  return `
    <section class="panel detail-panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${project.title || project.name}</h2>
          <p>Project command center · all downstream actions remain mock/manual-review only.</p>
        </div>
        <span class="badge ${project.priority === "high" ? "danger" : "warning"}">${project.priority || "normal"} priority</span>
      </div>
      <div class="panel-body">
        <div class="project-stage-bar">
          ${projectStages()
            .map((stage, index) => `<div class="${index <= currentStageIndex ? "done" : ""}"><span>${index + 1}</span><strong>${stage}</strong></div>`)
            .join("")}
        </div>
        <div class="detail-actions">
          <button class="primary-button" data-project-action="create-quote" data-id="${project.id}" type="button">Create Quotation Draft</button>
          <button class="ghost-button" data-project-action="advance-quotation" data-id="${project.id}" type="button">Move to Quotation</button>
          <button class="ghost-button" data-project-action="advance-negotiation" data-id="${project.id}" type="button">Move to Negotiation</button>
          <button class="ghost-button" data-project-action="order-pending" data-id="${project.id}" type="button">Move to Order Pending</button>
          <button class="primary-button" data-project-action="create-order-shipment" data-id="${project.id}" type="button">Create Mock Order + Shipment</button>
          <button class="ghost-button" data-project-action="mark-lost" data-id="${project.id}" type="button">Mark Lost</button>
        </div>
        <section class="project-command">
          <article>
            <span>Current Stage</span>
            <strong>${project.stage || "-"}</strong>
            <small>${project.next_action || project.status || "Review project manually."}</small>
          </article>
          <article>
            <span>Risk / Blocker</span>
            <strong>${project.risk || "No major blocker recorded"}</strong>
            <small>Risk text is internal only. It does not commit delivery or price.</small>
          </article>
          <article>
            <span>Manual Review Boundary</span>
            <strong>No automatic order confirmation</strong>
            <small>PI, price, lead time, payment and bank details require human approval.</small>
          </article>
        </section>
        <div class="detail-grid">
          ${detailBox("Project Profile", [
            ["Customer", customerName(project.customer_id || project.customerId)],
            ["Country", project.country],
            ["Business line", project.business_line ? businessLineLabel(project.business_line) : ""],
            ["Type", project.type],
            ["Products", project.products],
            ["Status", project.status],
          ])}
          ${detailBox("Related Inquiry", [
            ["Inquiry", inquiry?.title],
            ["Inquiry status", inquiry?.status],
            ["Score", inquiry?.score],
            ["Missing info", inquiry?.missing_info?.length || 0],
          ])}
          ${detailBox("Quotation / Order", [
            ["Quotation drafts", quotations.length],
            ["Latest quote", quotation?.quote_no],
            ["Quote status", quotation?.status],
            ["Order", order?.order_no],
            ["Order status", order?.status],
          ])}
          <article class="detail-box wide">
            <h3>Project Relationship Map</h3>
            <div class="relation-strip">
              ${relationPill("Inquiry", inquiry?.title || "not linked")}
              ${relationPill("Customer", customerName(project.customer_id || project.customerId))}
              ${relationPill("Quotation", quotation?.quote_no || "not created")}
              ${relationPill("Order", order?.order_no || "not created")}
              ${relationPill("Shipment", shipment?.shipment_no || "not created")}
              ${relationPill("After-sales", afterSales?.case_no || "not created")}
              ${relationPill("Tasks", tasks.length)}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Project Tasks</h3>
            ${tasks.map((task) => `<p><strong>${task.type}</strong> · ${task.title}<br><span class="muted">${task.due_date || "-"} · ${task.status}</span></p>`).join("") || "<p>暂无项目任务。</p>"}
          </article>
          <article class="detail-box wide">
            <h3>Quotation Drafts</h3>
            ${quotations
              .map(
                (item) => `<p><strong>${item.quote_no}</strong> · ${item.status}<br>${item.incoterm || ""} · Manual review required: ${item.manual_review_required ? "Yes" : "No"}</p>`,
              )
              .join("") || "<p>暂无报价草稿。</p>"}
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderProducts() {
  ensureProductSeeds(state);
  const products = state.products.filter(productMatchesFilters).filter(matches);
  const selected = state.products.find((item) => item.id === selectedProductId) || products[0] || null;
  selectedProductId = selected?.id || "";
  const profileCount = state.products.filter((item) => item.product_type === DocumentItemType.ALUMINUM_PROFILE).length;
  const cutCount = state.products.filter((item) => item.product_type === DocumentItemType.CUT_ALUMINUM_PROFILE).length;
  const accessoryCount = state.products.filter((item) => item.product_type === DocumentItemType.ACCESSORY).length;
  const reviewCount = state.products.filter((item) => item.status === ProductStatus.NEED_REVIEW).length;
  return `
    <div class="toolbar">
      <div>
        <h2>产品资料库 Product Library</h2>
        <p class="muted">沉淀型材米重、长度、表面处理、默认价格、配件和费用模板，后续支撑报价和单据。</p>
      </div>
      <div class="toolbar-actions">
        <button class="primary-button" data-product-action="load-samples" type="button">Load Product Samples</button>
        <button class="ghost-button" data-product-action="add-profile" type="button">Add Profile</button>
        <button class="ghost-button" data-product-action="add-accessory" type="button">Add Accessory</button>
      </div>
    </div>
    <div class="grid stats-grid compact-stats">
      ${stat("产品", state.products.length, "library records")}
      ${stat("铝型材", profileCount, "kg price + weight")}
      ${stat("切割件", cutCount, "per piece")}
      ${stat("配件", accessoryCount, "accessories")}
      ${stat("需审核", reviewCount, "cost/template review")}
      ${stat("可进单据", products.length, "filtered products")}
    </div>
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Product List</h2>
          <p>第一版先做结构化产品库，图片和真实成本以后再接文件/数据库。</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="filter-row">
          <label>Type
            <select data-product-filter="type">
              <option value="ALL">All types</option>
              ${Object.values(DocumentItemType).map((value) => `<option value="${value}" ${productFilters.type === value ? "selected" : ""}>${productTypeLabel(value)}</option>`).join("")}
            </select>
          </label>
          <label>Status
            <select data-product-filter="status">
              <option value="ALL">All statuses</option>
              ${Object.values(ProductStatus).map((value) => `<option value="${value}" ${productFilters.status === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Material / Finish</th>
              <th>Length / Weight</th>
              <th>Default Price</th>
              <th>Status</th>
              <th>Source</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map(
                (product) => `
                  <tr class="${selected?.id === product.id ? "selected-row" : ""}">
                    <td class="name-cell"><button class="link-button" data-view-product="${product.id}" type="button">${product.item_code || product.item_name}</button><span>${product.item_name || product.description}</span></td>
                    <td>${productTypeLabel(product.product_type)}</td>
                    <td>${[product.material, product.finish, product.color].filter(Boolean).join(" / ") || "-"}</td>
                    <td>${product.length_m ? `${numberText(product.length_m)} m` : "-"}<br><span class="muted">${product.weight_kg_per_m ? `${numberText(product.weight_kg_per_m)} kg/m` : product.cut_length_mm ? `${numberText(product.cut_length_mm)} mm cut` : ""}</span></td>
                    <td>${product.default_unit_price_usd_per_kg ? `USD ${numberText(product.default_unit_price_usd_per_kg)}/kg` : product.default_unit_price_usd_per_pc ? `USD ${numberText(product.default_unit_price_usd_per_pc)}/pc` : "-"}</td>
                    <td>${statusBadge(product.status)}</td>
                    <td>${product.source || "-"}</td>
                    <td class="action-cell"><button class="ghost-button" data-product-action="add-to-document" data-id="${product.id}" type="button">Add to Latest Document</button></td>
                  </tr>
                `,
              )
              .join("") || `<tr><td colspan="8">${empty("暂无产品资料。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    ${selected ? productDetail(selected) : ""}
  `;
}

function productDetail(product) {
  return `
    <section class="panel detail-panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${product.item_code || product.item_name}</h2>
          <p>${productTypeLabel(product.product_type)} · ${product.category || "-"}</p>
        </div>
        <span class="badge ${product.status === ProductStatus.ACTIVE ? "ok" : "warning"}">${product.status}</span>
      </div>
      <div class="panel-body">
        <div class="detail-actions">
          <button class="primary-button" data-product-action="add-to-document" data-id="${product.id}" type="button">Add to Latest Document</button>
          <button class="ghost-button" data-view-shortcut="documents" type="button">Open Document Center</button>
        </div>
        <div class="detail-grid">
          ${detailBox("Product Profile", [
            ["Type", productTypeLabel(product.product_type)],
            ["Code", product.item_code],
            ["Name", product.item_name],
            ["Category", product.category],
            ["Source", product.source],
            ["Status", product.status],
          ])}
          ${detailBox("Technical Data", [
            ["Material", product.material],
            ["Finish", product.finish],
            ["Color", product.color],
            ["Length m", product.length_m],
            ["Weight kg/m", product.weight_kg_per_m],
            ["Cut length mm", product.cut_length_mm],
          ])}
          ${detailBox("Pricing Template", [
            ["USD/kg", product.default_unit_price_usd_per_kg],
            ["USD/pc", product.default_unit_price_usd_per_pc],
            ["Customer visible note", product.customer_visible_notes],
            ["Internal notes", product.internal_notes],
          ])}
        </div>
      </div>
    </section>
  `;
}

function productMatchesFilters(product) {
  if (productFilters.type !== "ALL" && product.product_type !== productFilters.type) return false;
  if (productFilters.status !== "ALL" && product.status !== productFilters.status) return false;
  return true;
}

function productTypeLabel(type) {
  return {
    [DocumentItemType.ALUMINUM_PROFILE]: "Aluminum Profile",
    [DocumentItemType.CUT_ALUMINUM_PROFILE]: "Cut Aluminum Profile",
    [DocumentItemType.ACCESSORY]: "Accessory",
    [DocumentItemType.CHARGE]: "Charge Template",
  }[type] || type;
}

function handleProductAction(action, productId) {
  let message = "";
  if (action === "load-samples") {
    ensureProductSeeds(state);
    message = "产品样例已加载。";
  }
  if (action === "add-profile" || action === "add-accessory") {
    const product = {
      id: newId("prod"),
      product_type: action === "add-profile" ? DocumentItemType.ALUMINUM_PROFILE : DocumentItemType.ACCESSORY,
      category: action === "add-profile" ? "Manual aluminum profile" : "Manual accessory",
      item_code: action === "add-profile" ? "NEW-PROFILE" : "NEW-ACCESSORY",
      item_name: action === "add-profile" ? "New aluminum profile" : "New accessory",
      description: "Manual product placeholder. Complete technical data before official quotation.",
      material: action === "add-profile" ? "6063-T5" : "",
      finish: "To be confirmed",
      color: "To be confirmed",
      length_m: action === "add-profile" ? 5.8 : "",
      weight_kg_per_m: action === "add-profile" ? 1 : "",
      default_unit_price_usd_per_kg: action === "add-profile" ? 4.5 : "",
      default_unit_price_usd_per_pc: action === "add-accessory" ? 1 : "",
      status: ProductStatus.NEED_REVIEW,
      source: "Manual",
      created_at: new Date().toISOString(),
    };
    state.products.unshift(product);
    selectedProductId = product.id;
    message = "已创建产品占位，需要后续补图纸、米重、价格和供应商资料。";
  }
  if (action === "add-to-document") {
    const product = state.products.find((item) => item.id === productId);
    let document = state.documents.find((item) => item.id === selectedDocumentId) || state.documents[0];
    if (!document) document = createBlankDocument(state, DocumentType.PROFORMA_INVOICE);
    const item = productToDocumentItem(product, 100);
    if (document && item) {
      document.items = [...(document.items || []), item];
      upsertCalculatedDocument(state, document);
      selectedDocumentId = document.id;
      message = `已把 ${product.item_code || product.item_name} 加入最新单据草稿。`;
    } else {
      message = "未找到产品或单据。";
    }
  }
  saveState();
  render();
  if (message) alert(message);
}

function renderQuotes() {
  const quotes = [...state.quotations, ...state.quotes].filter(matches);
  const selected = quotes.find((item) => item.id === selectedQuoteId) || quotes[0] || null;
  selectedQuoteId = selected?.id || "";
  const needReview = quotes.filter((item) => item.manual_review_required || item.status === "NEED_REVIEW").length;
  const drafted = quotes.filter((item) => item.status === "DRAFT").length;
  const accepted = quotes.filter((item) => item.status === "ACCEPTED_MOCK").length;
  return `
    <div class="toolbar">
      <div>
        <h2>报价中心</h2>
        <p class="muted">这里只生成报价草稿，不自动计算最终价格，不生成正式 PI。</p>
      </div>
      <button class="primary-button" data-action="add-quote" type="button">新增报价</button>
    </div>
    <div class="grid stats-grid compact-stats">
      ${stat("报价草稿", quotes.length, "含历史报价")}
      ${stat("需人工审核", needReview, "Manual review required")}
      ${stat("Draft", drafted, "待补价格字段")}
      ${stat("Mock Accepted", accepted, "仅演示接受状态")}
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>报价号</th>
              <th>客户</th>
              <th>项目</th>
              <th>询盘/业务线</th>
              <th>状态</th>
              <th>安全规则</th>
              <th>报价内容</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            ${quotes
              .map(
                (quote) => `
                  <tr class="${selected?.id === quote.id ? "selected-row" : ""}">
                    <td class="name-cell"><button class="link-button" data-view-quote="${quote.id}" type="button">${quote.quote_no || quote.no}</button><span>${quote.currency}</span></td>
                    <td>${quote.customer}</td>
                    <td>${projectName(quote.project_id || quote.projectId)}</td>
                    <td>${quote.inquiry_id ? state.inquiries.find((item) => item.id === quote.inquiry_id)?.title || quote.inquiry_id : "-"}<br><span class="muted">${quote.business_line ? businessLineLabel(quote.business_line) : ""}</span></td>
                    <td>${statusBadge(quote.status)}</td>
                    <td><span class="badge danger">Manual review required</span></td>
                    <td>${Array.isArray(quote.items) ? quote.items.map((item) => item.description || item.notes).join("; ") : quote.items}<br><span class="muted">${quote.destination_port || ""} ${quote.incoterm || ""}</span></td>
                    <td>${
                      quote.quote_no
                        ? `<button class="ghost-button" data-quote-action="accept-create-order" data-id="${quote.id}" type="button">Mark Accepted + Create Order</button>`
                        : `<span class="muted">历史报价</span>`
                    }</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
    ${selected ? quoteDetail(selected) : ""}
  `;
}

function quoteReadiness(quote) {
  const items = Array.isArray(quote.items) ? quote.items : [];
  const missing = new Set(quote.missing_price_fields || []);
  const blockers = [];
  if (!quote.customer) blockers.push("customer");
  if (!quote.business_line) blockers.push("business line");
  if (!quote.currency) blockers.push("currency");
  if (!quote.incoterm || /confirm/i.test(quote.incoterm)) blockers.push("incoterm");
  if (!quote.destination_port) blockers.push("destination port");
  if (!items.length) blockers.push("quote items");
  items.forEach((item) => {
    if (!item.description) blockers.push("item description");
    if (!item.quantity || /confirm/i.test(item.quantity)) blockers.push("quantity");
    if (!item.unit_price || /manual|confirm|required/i.test(item.unit_price)) blockers.push("unit price");
  });
  missing.forEach((item) => blockers.push(item));
  const uniqueBlockers = [...new Set(blockers)].filter(Boolean);
  const score = Math.max(0, 100 - uniqueBlockers.length * 8);
  return {
    score,
    blockers: uniqueBlockers,
    decision: uniqueBlockers.length ? "NEED_MANUAL_REVIEW" : "READY_FOR_MANUAL_SEND_REVIEW",
    nextAction: uniqueBlockers.length
      ? `Complete missing quote fields: ${uniqueBlockers.slice(0, 5).join(", ")}.`
      : "Perform final human review, then decide whether to send official quotation outside this demo.",
  };
}

function quoteFollowUpDraft(quote, inquiry) {
  const customerNameText = inquiry?.lead_info?.name || quote.customer || "Customer";
  const missing = (quote.missing_price_fields || ["unit price", "lead time", "payment terms"]).slice(0, 5).join(", ");
  return `Dear ${customerNameText},

Thank you for your inquiry. We are preparing an internal quotation draft for manual review.

Before any official quotation, please help confirm: ${missing}.

Please note that price, lead time, payment terms and PI details will only be confirmed after manual review.

Best regards,
CBM Team`;
}

function quoteDetail(quote) {
  const inquiry = state.inquiries.find((item) => item.id === quote.inquiry_id);
  const project = state.projects.find((item) => item.id === (quote.project_id || quote.projectId));
  const order = state.orders.find((item) => item.quotation_id === quote.id);
  const shipment = order ? state.shipments.find((item) => item.order_id === order.id) : null;
  const followUps = state.follow_up_tasks.filter((item) => item.quotation_id === quote.id || item.inquiry_id === quote.inquiry_id);
  const readiness = quoteReadiness(quote);
  const reviewItems = [
    ["Final unit price", "Manual input required"],
    ["Mold cost", "Confirm if new die is needed"],
    ["Packing cost", "Review packaging method and export protection"],
    ["Freight / incoterm", quote.incoterm || "FOB / CIF to be confirmed"],
    ["Lead time", "Manual confirmation required"],
    ["Payment terms", "Manual confirmation required"],
    ["Bank account", "Never auto-confirm"],
    ["PI / official quotation", "Do not send before manual review"],
  ];
  return `
    <section class="panel detail-panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${quote.quote_no || quote.no}</h2>
          <p>Quotation draft only. Official quotation requires manual review.</p>
        </div>
        <span class="badge danger">No automatic price / PI</span>
      </div>
      <div class="panel-body">
        <div class="quote-review-banner">
          <strong>需要人工审核</strong>
          <span>不自动发送报价，不自动发送 PI，不确认价格、交期或付款条款。</span>
        </div>
        <div class="detail-actions">
          ${
            quote.quote_no
              ? `<button class="primary-button" data-quote-action="accept-create-order" data-id="${quote.id}" type="button">Mark Accepted + Create Order</button>`
              : ""
          }
          ${quote.quote_no ? `<button class="ghost-button" data-quote-action="run-review" data-id="${quote.id}" type="button">Run Quote Review</button>` : ""}
          ${quote.quote_no ? `<button class="ghost-button" data-quote-action="mark-ready" data-id="${quote.id}" type="button">Mark Ready for Manual Send Review</button>` : ""}
          ${quote.quote_no ? `<button class="ghost-button" data-quote-action="create-follow-up" data-id="${quote.id}" type="button">Create Quote Follow-up Task</button>` : ""}
          ${inquiry ? `<button class="ghost-button" data-open-related-inquiry="${inquiry.id}" type="button">Open Related Inquiry</button>` : ""}
          ${project ? `<button class="ghost-button" data-view-shortcut="projects" type="button">Open Project Center</button>` : ""}
          ${order ? `<button class="ghost-button" data-view-shortcut="orders" type="button">Open Related Order</button>` : ""}
        </div>
        <section class="quote-command">
          <article>
            <span>Quote Completeness</span>
            <strong>${readiness.score}%</strong>
            <small>${readiness.decision}</small>
          </article>
          <article>
            <span>Next Manual Action</span>
            <strong>${readiness.blockers.length ? "Complete missing fields" : "Final human review"}</strong>
            <small>${readiness.nextAction}</small>
          </article>
          <article>
            <span>Official Boundary</span>
            <strong>Draft only</strong>
            <small>No official quotation, PI, price, lead time, payment term or bank account is confirmed here.</small>
          </article>
        </section>
        <div class="detail-grid">
          ${detailBox("Quotation Header", [
            ["Customer", quote.customer],
            ["Business line", quote.business_line ? businessLineLabel(quote.business_line) : "-"],
            ["Currency", quote.currency],
            ["Incoterm", quote.incoterm],
            ["Destination port", quote.destination_port],
            ["Status", quote.status],
          ])}
          ${detailBox("Related Records", [
            ["Inquiry", inquiry?.title],
            ["Project", project?.title || project?.name],
            ["Order", order?.order_no],
            ["Shipment", shipment?.shipment_no],
            ["Manual review", quote.manual_review_required ? "Yes" : "No"],
          ])}
          <article class="detail-box">
            <h3>Missing Price Fields</h3>
            ${(quote.missing_price_fields || ["unit price", "lead time", "payment terms"]).map((item) => `<p>• ${item}</p>`).join("")}
          </article>
          <article class="detail-box wide">
            <h3>Quote Risk Panel</h3>
            <div class="checklist-grid">
              ${readiness.blockers.length ? readiness.blockers.map((item) => checklistItem(item, false)).join("") : checklistItem("No quote blocker detected", true)}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Manual Quote Review Checklist</h3>
            <div class="review-grid">
              ${reviewItems.map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`).join("")}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Items Placeholder</h3>
            <div class="table-wrap compact-table">
              <table>
                <thead><tr><th>Description</th><th>Quantity</th><th>Unit price</th><th>Notes</th></tr></thead>
                <tbody>
                  ${
                    Array.isArray(quote.items)
                      ? quote.items
                          .map(
                            (item) =>
                              `<tr><td>${item.description || "-"}</td><td>${item.quantity || "-"}</td><td>${item.unit_price || "Manual input required"}</td><td>${item.notes || "-"}</td></tr>`,
                          )
                          .join("")
                      : `<tr><td colspan="4">${quote.items || "No item details"}</td></tr>`
                  }
                </tbody>
              </table>
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Quote Relationship Map</h3>
            <div class="relation-strip">
              ${relationPill("Inquiry", inquiry?.title || "not linked")}
              ${relationPill("Project", project?.title || project?.name || "not linked")}
              ${relationPill("Customer", quote.customer || "-")}
              ${relationPill("Order", order?.order_no || "not created")}
              ${relationPill("Shipment", shipment?.shipment_no || "not created")}
              ${relationPill("Follow-ups", followUps.length)}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Customer Follow-up Draft - Human Review Only</h3>
            <pre>${quoteFollowUpDraft(quote, inquiry)}</pre>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderDocuments() {
  ensureDocumentSeeds(state);
  const documents = state.documents.filter(documentMatchesFilters).filter(matches);
  const selected = documents.find((item) => item.id === selectedDocumentId) || documents[0] || null;
  selectedDocumentId = selected?.id || "";
  const piDocs = documents.filter((item) => item.document_type === DocumentType.PROFORMA_INVOICE).length;
  const productionDocs = documents.filter((item) => item.document_type === DocumentType.PRODUCTION_ORDER).length;
  const reviewDocs = documents.filter((item) => item.manual_review_required || item.status === DocumentStatus.NEED_REVIEW).length;
  return `
    <div class="toolbar">
      <div>
        <h2>单据中心 Document Center</h2>
        <p class="muted">创建、预览、导出 Quotation、Proforma Invoice 和中文生产单；客户单据与内部字段严格分离。</p>
      </div>
      <div class="toolbar-actions">
        <button class="primary-button" data-document-action="create-quotation" type="button">Create Quotation</button>
        <button class="primary-button" data-document-action="create-pi" type="button">Create PI</button>
        <button class="ghost-button" data-document-action="load-samples" type="button">Load Sample Documents</button>
      </div>
    </div>
    <div class="grid stats-grid compact-stats">
      ${stat("单据", documents.length, "documents")}
      ${stat("PI", piDocs, "proforma invoices")}
      ${stat("生产单", productionDocs, "factory production orders")}
      ${stat("需审核", reviewDocs, "manual review required")}
      ${stat("CL5437", cl5437Total(), "target USD 5380")}
      ${stat("卖方配置", state.sellers.length, "bank info in mock config")}
    </div>
    ${documentDraftReviewPanel()}
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Document List</h2>
          <p>支持客户、项目、类型、状态和全局搜索。</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="filter-row">
          <label>Customer
            <select data-document-filter="customer">
              <option value="ALL">All customers</option>
              ${uniqueDocumentValues("customer").map((value) => `<option value="${value}" ${documentFilters.customer === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <label>Project
            <select data-document-filter="project">
              <option value="ALL">All projects</option>
              ${uniqueDocumentValues("project").map((value) => `<option value="${value}" ${documentFilters.project === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <label>Type
            <select data-document-filter="type">
              <option value="ALL">All types</option>
              ${Object.values(DocumentType).map((value) => `<option value="${value}" ${documentFilters.type === value ? "selected" : ""}>${documentTypeLabel(value)}</option>`).join("")}
            </select>
          </label>
          <label>Status
            <select data-document-filter="status">
              <option value="ALL">All statuses</option>
              ${Object.values(DocumentStatus).map((value) => `<option value="${value}" ${documentFilters.status === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Customer</th>
              <th>Project</th>
              <th>Status</th>
              <th>Total</th>
              <th>Archive</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${documents
              .map((doc) => {
                const archive = documentArchiveInfo(doc);
                return `
                  <tr class="${contextRowClass("document", doc.id, selected?.id === doc.id ? "selected-row" : "")}">
                    <td class="name-cell"><button class="link-button" data-view-document="${doc.id}" type="button">${doc.document_no}</button><span>${doc.date}</span></td>
                    <td>${documentTypeLabel(doc.document_type)}</td>
                    <td>${doc.customer?.name || "-"}</td>
                    <td>${doc.project_name || "-"}<br><span class="muted">${doc.project_code || ""}</span></td>
                    <td>${statusBadge(doc.status)}<br><span class="badge danger">Manual review</span></td>
                    <td class="money-cell">${money(doc.total_usd)}</td>
                    <td>${archive.archive_folder}<br><span class="muted">${archive.excel_file_name}</span></td>
                    <td class="action-cell">
                      <button class="ghost-button" data-document-action="duplicate" data-id="${doc.id}" type="button">Copy</button>
                      <button class="ghost-button" data-document-action="production" data-id="${doc.id}" type="button">Generate Production Order</button>
                      <button class="ghost-button" data-document-action="excel" data-id="${doc.id}" type="button">Export Excel</button>
                      <button class="ghost-button" data-document-action="pdf" data-id="${doc.id}" type="button">Export PDF</button>
                    </td>
                  </tr>
                `;
              })
              .join("") || `<tr><td colspan="8">${empty("暂无单据。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    ${selected ? documentDetail(selected) : ""}
  `;
}

function documentDraftReviewPanel() {
  const draftReviews = listDocumentDraftReviewRecords(commandHistory);
  const highRiskCount = draftReviews.filter((draft) => draft.manual_review_required).length;
  const reviewedCount = draftReviews.filter((draft) => draft.review_status === "reviewed").length;
  return `
    <section class="panel document-draft-review-panel">
      <div class="panel-header">
        <div>
          <h2>单据草稿审核</h2>
          <p>从指令中心生成的单据草稿会在这里集中审核。已内部审核不代表已发送客户，也不代表正式单据已出具。</p>
        </div>
        <div class="mini-stats">
          <span>${draftReviews.length} drafts</span>
          <span>${highRiskCount} 需人工审核</span>
          <span>${reviewedCount} 已内部审核</span>
        </div>
      </div>
      <div class="document-draft-review-grid">
        ${draftReviews.length ? draftReviews.map(renderDocumentDraftReviewCard).join("") : `<p class="muted">暂无来自指令中心的单据草稿。先在 Command Center / 指令中心创建 PI、报价或生产单草稿。</p>`}
      </div>
    </section>
  `;
}

function renderDocumentDraftReviewCard(draft) {
  const checklist = (draft.checklist || [])
    .map((item) => `<li><span class="status-pill ${escapeHtml(item.status)}">${escapeHtml(commandStatusLabel(item.status))}</span>${escapeHtml(item.label)}</li>`)
    .join("");
  const refs = draft.related_business_objects?.length
    ? draft.related_business_objects
        .map((ref) => `<span class="context-chip">${escapeHtml(businessObjectTypeLabel(ref.type))}: ${escapeHtml(ref.label || ref.id || "对象")}</span>`)
        .join("")
    : `<span class="context-chip">未关联业务对象</span>`;
  const firstSafeRef = draft.related_business_objects?.find((ref) => ref.href);
  return `
    <article class="document-draft-review-card">
      <div class="audit-card-head">
        <div>
          <span class="card-type">${escapeHtml(documentDraftTypeLabel(draft.draft_type))}</span>
          <h3>${escapeHtml(draft.draft_id || "draft")}</h3>
          <p class="muted">command_id: ${escapeHtml(draft.command_id)} · ${escapeHtml(draft.original_command_summary || "-")}</p>
        </div>
        <span class="status-pill ${escapeHtml(draft.review_status)}">${escapeHtml(commandStatusLabel(draft.review_status))}</span>
      </div>
      <p><strong>关联业务对象:</strong> ${refs}</p>
      <p><strong>审核备注:</strong> ${escapeHtml(draft.manual_review_note_summary || "暂无")}</p>
      <p class="document-warning">已内部审核不代表已发送客户，也不代表正式单据已出具。</p>
      <details open>
        <summary>草稿安全检查清单</summary>
        <ul class="draft-checklist">${checklist}</ul>
      </details>
      <details>
        <summary>禁止动作</summary>
        <ul>${draft.blocked_actions?.length ? draft.blocked_actions.map((action) => `<li>${escapeHtml(commandActionLabel(action))}</li>`).join("") : "<li>暂无禁止动作。</li>"}</ul>
      </details>
      <label class="draft-review-note">内部审核备注
        <textarea data-document-draft-note="${escapeHtml(draft.command_id)}" rows="2" placeholder="仅内部记录，不会发送客户，也不会进入正式单据。"></textarea>
      </label>
      <div class="card-actions">
        <button class="ghost-button" data-document-draft-review-action="review_pending" data-command-id="${escapeHtml(draft.command_id)}" type="button">标记为待审核</button>
        <button class="ghost-button" data-document-draft-review-action="reviewed" data-command-id="${escapeHtml(draft.command_id)}" type="button">标记为已内部审核</button>
        <button class="ghost-button" data-document-draft-review-action="save_note" data-command-id="${escapeHtml(draft.command_id)}" type="button">保存内部备注</button>
        <button class="ghost-button" data-document-draft-review-action="copy_summary" data-command-id="${escapeHtml(draft.command_id)}" data-draft-id="${escapeHtml(draft.draft_id)}" type="button">复制草稿审核摘要</button>
        <a class="ghost-link" href="${escapeHtml(draft.audit_detail_link)}">打开审核详情</a>
        <a class="ghost-link" href="${escapeHtml(draft.resume_workflow_link)}">返回指令中心</a>
        ${firstSafeRef?.href ? `<a class="ghost-link" href="${escapeHtml(firstSafeRef.href)}">打开关联对象</a>` : ""}
      </div>
    </article>
  `;
}

function documentMatchesFilters(doc) {
  if (documentFilters.customer !== "ALL" && doc.customer?.name !== documentFilters.customer) return false;
  if (documentFilters.project !== "ALL" && doc.project_name !== documentFilters.project) return false;
  if (documentFilters.type !== "ALL" && doc.document_type !== documentFilters.type) return false;
  if (documentFilters.status !== "ALL" && doc.status !== documentFilters.status) return false;
  return true;
}

function uniqueDocumentValues(field) {
  const values = state.documents
    .map((doc) => (field === "customer" ? doc.customer?.name : doc.project_name))
    .filter(Boolean);
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function documentDetail(doc) {
  const archive = documentArchiveInfo(doc);
  return `
    <section class="panel detail-panel document-center" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${doc.document_no}</h2>
          <p>${documentTypeLabel(doc.document_type)} · ${archive.archive_folder}</p>
        </div>
        <span class="badge danger">Manual review required</span>
      </div>
      <div class="panel-body">
        <div class="detail-actions">
          <button class="ghost-button" data-document-action="duplicate" data-id="${doc.id}" type="button">Copy Document</button>
          <button class="primary-button" data-document-action="production" data-id="${doc.id}" type="button">Generate Production Order</button>
          <button class="ghost-button" data-document-action="excel" data-id="${doc.id}" type="button">Export Excel</button>
          <button class="ghost-button" data-document-action="pdf" data-id="${doc.id}" type="button">Export PDF</button>
        </div>
        <div class="detail-grid">
          ${detailBox("Header", [
            ["Document type", documentTypeLabel(doc.document_type)],
            ["Document no", doc.document_no],
            ["Date", doc.date],
            ["Trade term", doc.trade_term],
            ["Payment term", doc.payment_term],
            ["Currency", doc.currency],
          ])}
          ${detailBox("Customer / Project", [
            ["Customer", doc.customer?.name],
            ["Project", doc.project_name],
            ["Project address", doc.project_address],
            ["Loading port", doc.loading_port],
            ["Discharge port", doc.discharge_port],
            ["Archive file", archive.pdf_file_name],
          ])}
          ${detailBox("MVP Checks", [
            ["CL5437 total", doc.sample_key === "CL5437" ? money(doc.total_usd) : "-"],
            ["Internal factor visible", "No"],
            ["Charge internal cost visible", "No"],
            ["Production hides price", doc.document_type === DocumentType.PRODUCTION_ORDER ? "Yes" : "Preview below"],
          ])}
        </div>
        ${documentEditor(doc)}
        <article class="document-preview-wrap">
          <h3>Customer Document Preview</h3>
          ${doc.document_type === DocumentType.PRODUCTION_ORDER ? productionOrderPreview(doc) : customerDocumentPreview(doc)}
        </article>
        <article class="document-preview-wrap">
          <h3>Production Order Preview</h3>
          ${productionOrderPreview(doc)}
        </article>
      </div>
    </section>
  `;
}

function documentEditor(doc) {
  return `
    <article class="detail-box wide document-editor">
      <h3>Create / Edit Document</h3>
      <div class="document-edit-grid">
        ${documentInput("document_no", "Document No", doc.document_no)}
        ${documentInput("date", "Date", doc.date, "date")}
        ${documentInput("customer.name", "Customer", doc.customer?.name)}
        ${documentInput("project_name", "Project Name", doc.project_name)}
        ${documentInput("project_address", "Project Address", doc.project_address)}
        ${documentInput("customer.attn", "Attn", doc.customer?.attn)}
        ${documentInput("loading_port", "Loading Port", doc.loading_port)}
        ${documentInput("discharge_port", "Discharge Port", doc.discharge_port)}
        ${documentInput("trade_term", "Trade Term", doc.trade_term)}
        ${documentInput("payment_term", "Payment Term", doc.payment_term)}
        ${documentInput("currency", "Currency", doc.currency)}
        ${documentInput("exchange_rate", "Exchange Rate", doc.exchange_rate)}
        ${documentInput("remarks", "Remarks", doc.remarks)}
        ${documentInput("internal_notes", "Internal Notes", doc.internal_notes)}
      </div>
      <div class="detail-actions" style="margin-top:12px">
        <button class="primary-button" data-document-action="save-editor" data-id="${doc.id}" type="button">Save Header</button>
        <button class="ghost-button" data-document-action="add-profile-item" data-id="${doc.id}" type="button">Add Aluminum Profile</button>
        <button class="ghost-button" data-document-action="add-cut-item" data-id="${doc.id}" type="button">Add Cut Profile</button>
        <button class="ghost-button" data-document-action="add-accessory-item" data-id="${doc.id}" type="button">Add Accessory</button>
        <button class="ghost-button" data-document-action="add-charge-item" data-id="${doc.id}" type="button">Add Charge</button>
      </div>
    </article>
  `;
}

function documentInput(field, label, value = "", type = "text") {
  return `<label>${label}<input data-document-field="${field}" type="${type}" value="${String(value || "").replaceAll('"', "&quot;")}" /></label>`;
}

function customerDocumentPreview(doc) {
  const seller = doc.seller || state.sellers[0];
  return `
    <section class="document-preview customer-document">
      <header class="document-title">
        <div>
          <h2>${documentTypeLabel(doc.document_type)}</h2>
          <p>${doc.document_no} · ${doc.date}</p>
        </div>
        <strong>${seller.company_name}</strong>
      </header>
      <div class="document-party-grid">
        <div>
          <h3>Seller</h3>
          <p>${seller.company_name}</p>
        </div>
        <div>
          <h3>Buyer</h3>
          <p>${doc.customer?.name || "-"}<br>${doc.customer?.address || ""}<br>Attn: ${doc.customer?.attn || "-"}</p>
        </div>
      </div>
      ${documentHeaderTable(doc)}
      ${customerItemsTable(doc)}
      <div class="document-total"><span>Total</span><strong>${money(doc.total_usd)}</strong></div>
      <p><strong>Remarks:</strong> ${doc.remarks || "-"}</p>
      <p><strong>Payment Terms:</strong> ${doc.payment_term || "Manual review required"}</p>
      ${bankInfoBlock(seller)}
      <p class="document-warning">Official quotation requires manual review. No automatic price, delivery time, PI or payment terms are confirmed by this demo.</p>
    </section>
  `;
}

function productionOrderPreview(doc) {
  return `
    <section class="document-preview production-document">
      <header class="document-title">
        <div>
          <h2>中文生产单</h2>
          <p>${doc.document_type === DocumentType.PRODUCTION_ORDER ? doc.document_no : `PO-${doc.project_code || doc.document_no}`} · ${doc.date}</p>
        </div>
        <strong>工厂内部生产资料</strong>
      </header>
      <div class="document-party-grid">
        <div>
          <h3>项目代号</h3>
          <p>${doc.project_code || "-"}</p>
        </div>
        <div>
          <h3>生产备注</h3>
          <p>${doc.production_remarks || doc.remarks || "按图纸、样品和业务确认要求生产，所有变更需人工确认。"}</p>
        </div>
      </div>
      ${productionItemsTable(doc)}
      <p class="document-warning">本生产单仅保留工厂生产字段，商业条款与收款资料不在此页面展示。</p>
    </section>
  `;
}

function documentHeaderTable(doc) {
  return `
    <table class="document-meta-table">
      <tbody>
        <tr><th>Project</th><td>${doc.project_name || "-"}</td><th>Project Address</th><td>${doc.project_address || "-"}</td></tr>
        <tr><th>Loading Port</th><td>${doc.loading_port || "-"}</td><th>Discharge Port</th><td>${doc.discharge_port || "-"}</td></tr>
        <tr><th>Trade Term</th><td>${doc.trade_term || "-"}</td><th>Currency</th><td>${doc.currency || "USD"}</td></tr>
      </tbody>
    </table>
  `;
}

function customerItemsTable(doc) {
  return `
    <div class="table-wrap document-table-wrap">
      <table class="document-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Code / Name</th>
            <th>Description</th>
            <th>Finish</th>
            <th>Length</th>
            <th>Weight</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${doc.items.map(customerItemRow).join("")}</tbody>
      </table>
    </div>
  `;
}

function customerItemRow(item) {
  const mapped = mapCustomerDocumentItem(item);
  if (item.item_type === DocumentItemType.ALUMINUM_PROFILE) {
    return `<tr>
      <td>${imageCell(mapped.image)}</td>
      <td>${mapped.item_code || "-"}</td>
      <td>${mapped.description || "-"}</td>
      <td>${[item.material, mapped.finish, mapped.color].filter(Boolean).join(" / ")}</td>
      <td>${numberText(mapped.length_m)} m</td>
      <td>${numberText(mapped.weight_kg_per_m)} kg/m<br>${numberText(mapped.total_weight_kg)} kg</td>
      <td>${numberText(mapped.quantity_pcs)} pcs</td>
      <td>USD ${numberText(mapped.unit_price)}/kg</td>
      <td class="money-cell">${money(mapped.amount)}</td>
    </tr>`;
  }
  if (item.item_type === DocumentItemType.CUT_ALUMINUM_PROFILE) {
    return `<tr>
      <td>${imageCell(mapped.image)}</td>
      <td>${mapped.item_code || "-"}</td>
      <td>${mapped.description || "-"}</td>
      <td>${mapped.finish || "-"}</td>
      <td>${numberText(mapped.cut_length_mm)} mm</td>
      <td>-</td>
      <td>${numberText(mapped.quantity_pcs)} pcs</td>
      <td>USD ${numberText(mapped.unit_price)}/pc</td>
      <td class="money-cell">${money(mapped.amount)}</td>
    </tr>`;
  }
  if (item.item_type === DocumentItemType.ACCESSORY) {
    return `<tr>
      <td>${imageCell(mapped.image)}</td>
      <td>${mapped.item_name || "-"}</td>
      <td>${mapped.item_name || "-"}</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>${numberText(mapped.quantity_pcs)} pcs</td>
      <td>USD ${numberText(mapped.unit_price)}/pc</td>
      <td class="money-cell">${money(mapped.amount)}</td>
    </tr>`;
  }
  return `<tr>
    <td>-</td>
    <td>${mapped.display_name || "Charge"}</td>
    <td colspan="5">${mapped.display_name || "Charge"}</td>
    <td>-</td>
    <td class="money-cell">${money(mapped.amount)}</td>
  </tr>`;
}

function productionItemsTable(doc) {
  return `
    <div class="table-wrap document-table-wrap">
      <table class="document-table production-table">
        <thead>
          <tr>
            <th>图片</th>
            <th>型号</th>
            <th>产品名称</th>
            <th>材质</th>
            <th>表面处理</th>
            <th>颜色</th>
            <th>长度</th>
            <th>切割长度</th>
            <th>理论米重</th>
            <th>数量</th>
            <th>包装要求</th>
            <th>发货批次</th>
            <th>生产备注</th>
          </tr>
        </thead>
        <tbody>
          ${doc.items
            .filter((item) => item.item_type !== DocumentItemType.CHARGE)
            .map(
              (item) => {
                const mapped = mapProductionOrderItem(item);
                return `<tr>
                <td>${imageCell(mapped.image)}</td>
                <td>${mapped.item_code || mapped.item_name || "-"}</td>
                <td>${mapped.description || mapped.item_name || "-"}</td>
                <td>${mapped.material || "-"}</td>
                <td>${mapped.finish || "-"}</td>
                <td>${mapped.color || "-"}</td>
                <td>${mapped.length_m ? `${numberText(mapped.length_m)} m` : "-"}</td>
                <td>${mapped.cut_length_mm ? `${numberText(mapped.cut_length_mm)} mm` : "-"}</td>
                <td>${mapped.weight_kg_per_m ? `${numberText(mapped.weight_kg_per_m)} kg/m` : "-"}</td>
                <td>${numberText(mapped.quantity_pcs)} pcs</td>
                <td>${mapped.packing_requirement || "按业务确认包装，防刮擦、防变形。"}</td>
                <td>${mapped.shipping_batch || "To be confirmed"}</td>
                <td>${mapped.production_note || mapped.production_remark || doc.production_remarks || "-"}</td>
              </tr>`;
              },
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bankInfoBlock(seller) {
  const bank = seller.bank_info || {};
  return `
    <section class="bank-info">
      <h3>Bank Information</h3>
      <div class="bank-grid">
        <p><strong>Account Name:</strong> ${bank.account_name || "-"}</p>
        <p><strong>Account Number:</strong> ${bank.account_number || "-"}</p>
        <p><strong>Bank Name:</strong> ${bank.bank_name || "-"}</p>
        <p><strong>SWIFT/BIC Code:</strong> ${bank.swift_bic_code || "-"}</p>
        <p><strong>Sort Code:</strong> ${bank.sort_code || "-"}</p>
        <p><strong>Branch Code:</strong> ${bank.branch_code || "-"}</p>
        <p><strong>Bank Address:</strong> ${bank.bank_address || "-"}</p>
        <p><strong>Country/Region:</strong> ${bank.country_region || "-"}</p>
        <p><strong>Type of Account:</strong> ${bank.type_of_account || "-"}</p>
      </div>
    </section>
  `;
}

function documentTypeLabel(type) {
  return {
    [DocumentType.QUOTATION]: "Quotation",
    [DocumentType.PROFORMA_INVOICE]: "Proforma Invoice",
    [DocumentType.PRODUCTION_ORDER]: "Production Order",
    [DocumentType.CUTTING_LIST]: "Cutting List",
    [DocumentType.PACKING_LIST]: "Packing List",
  }[type] || type;
}

function documentDraftTypeLabel(type) {
  const labels = {
    document_draft: "单据草稿",
    PI: "PI 草稿",
    pi: "PI 草稿",
    proforma_invoice: "PI 草稿",
    quotation: "报价草稿",
    quotation_draft: "报价草稿",
    commercial_invoice: "Commercial Invoice 草稿",
    production_order: "中文生产单草稿",
  };
  return labels[type] || labels[String(type || "").toLowerCase()] || type || "单据草稿";
}

function businessObjectTypeLabel(type) {
  const labels = {
    customer: "客户",
    lead: "线索",
    inquiry: "询盘",
    project: "项目",
    quotation: "报价",
    document_draft: "单据草稿",
    follow_up_task: "跟进任务",
    archive_path: "归档路径",
  };
  return labels[type] || type || "对象";
}

function cl5437Total() {
  const doc = state.documents.find((item) => item.sample_key === "CL5437");
  return doc ? money(doc.total_usd) : "not loaded";
}

function money(value) {
  return `USD ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function numberText(value) {
  if (value === undefined || value === null || value === "") return "-";
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 3 });
}

function imageCell(src) {
  return src ? `<img class="doc-item-image" src="${src}" alt="">` : `<span class="image-placeholder">Image</span>`;
}

function handleDocumentAction(action, documentId) {
  let message = "";
  if (action === "load-samples") {
    ensureDocumentSeeds(state);
    message = "示例单据已加载：CL5437 和 O CLUB HANDRAILS。";
  }
  if (action === "create-quotation" || action === "create-pi") {
    const doc = createBlankDocument(state, action === "create-pi" ? DocumentType.PROFORMA_INVOICE : DocumentType.QUOTATION);
    selectedDocumentId = doc.id;
    message = `已创建 ${documentTypeLabel(doc.document_type)} 草稿。`;
  }
  if (action === "duplicate") {
    const doc = duplicateDocument(state, documentId);
    selectedDocumentId = doc?.id || selectedDocumentId;
    message = doc ? `已复制单据：${doc.document_no}` : "未找到单据。";
  }
  if (action === "production") {
    const doc = createProductionOrderFromDocument(state, documentId);
    selectedDocumentId = doc?.id || selectedDocumentId;
    message = doc ? `已生成中文生产单：${doc.document_no}` : "未找到单据。";
  }
  if (action === "save-editor") {
    const doc = saveDocumentEditor(documentId);
    selectedDocumentId = doc?.id || selectedDocumentId;
    message = doc ? "单据头信息已保存，并已重新计算金额。" : "未找到单据。";
  }
  if (action === "add-profile-item" || action === "add-cut-item" || action === "add-accessory-item" || action === "add-charge-item") {
    const doc = addDocumentItem(documentId, action);
    selectedDocumentId = doc?.id || selectedDocumentId;
    message = doc ? "已添加明细行并重新计算金额。" : "未找到单据。";
  }
  if (action === "excel") {
    exportDocumentExcel(documentId);
    return;
  }
  if (action === "pdf") {
    exportDocumentPdf(documentId);
    return;
  }
  saveState();
  render();
  if (message) alert(message);
}

async function handleDocumentDraftReviewAction(button) {
  const action = button.dataset.documentDraftReviewAction;
  const commandId = button.dataset.commandId;
  const draftId = button.dataset.draftId;
  if (!commandId) return;

  if (action === "review_pending" || action === "reviewed") {
    const result = updateManualReviewStatus(commandId, action, commandHistory, {
      reviewed_by: getAdminSession()?.user?.email || "local_admin",
    });
    if (result.ok) {
      saveCommandHistory(result.history);
      render();
    } else {
      button.textContent = "状态不可更新";
    }
    return;
  }

  if (action === "save_note") {
    const note = document.querySelector(`[data-document-draft-note="${CSS.escape(commandId)}"]`)?.value || "";
    const result = saveManualReviewNote(commandId, note, commandHistory, {
      reviewed_by: getAdminSession()?.user?.email || "local_admin",
    });
    if (result.ok) {
      saveCommandHistory(result.history);
      render();
    } else {
      button.textContent = "保存失败";
    }
    return;
  }

  if (action === "copy_summary") {
    const record = findCommandHistoryRecord(commandHistory, commandId);
    const draft = (record?.draft_references || []).find((item) => item.draft_id === draftId) || record?.draft_references?.[0] || {};
    const summary = record ? buildDocumentDraftReviewSummary(record, draft) : "未找到单据草稿审核记录。";
    try {
      await navigator.clipboard.writeText(summary);
      button.textContent = "已复制草稿审核摘要";
    } catch {
      button.textContent = "复制失败";
    }
  }
}

function saveDocumentEditor(documentId) {
  const doc = state.documents.find((item) => item.id === documentId);
  if (!doc) return null;
  document.querySelectorAll("[data-document-field]").forEach((input) => {
    const field = input.dataset.documentField;
    if (field?.startsWith("customer.")) {
      const key = field.split(".")[1];
      doc.customer = { ...(doc.customer || {}), [key]: input.value };
    } else {
      doc[field] = input.value;
    }
  });
  return upsertCalculatedDocument(state, doc);
}

function addDocumentItem(documentId, action) {
  const doc = state.documents.find((item) => item.id === documentId);
  if (!doc) return null;
  const item = {
    "add-profile-item": {
      id: newId("item"),
      item_type: DocumentItemType.ALUMINUM_PROFILE,
      image: "",
      item_code: "NEW-PROFILE",
      description: "Aluminum profile",
      material: "6063-T5",
      finish: "Powder coated",
      color: "To be confirmed",
      length_m: 5.8,
      weight_kg_per_m: 1,
      quantity_pcs: 100,
      unit_price_usd_per_kg: 4.5,
      internal_weight_factor: 1.1,
    },
    "add-cut-item": {
      id: newId("item"),
      item_type: DocumentItemType.CUT_ALUMINUM_PROFILE,
      image: "",
      item_code: "CUT-PROFILE",
      description: "Cut aluminum profile",
      finish: "Mill finish",
      cut_length_mm: 100,
      quantity_pcs: 1000,
      unit_price_usd_per_pc: 0.5,
    },
    "add-accessory-item": {
      id: newId("item"),
      item_type: DocumentItemType.ACCESSORY,
      image: "",
      item_name: "Accessory item",
      quantity_pcs: 100,
      unit_price_usd_per_pc: 1,
    },
    "add-charge-item": {
      id: newId("item"),
      item_type: DocumentItemType.CHARGE,
      display_name: "Freight / Other Charge",
      quantity: 1,
      unit_price: 100,
      amount: 100,
      internal_cost_note: "Internal cost note hidden from customer document by default.",
      show_internal_breakdown_to_customer: false,
    },
  }[action];
  doc.items = [...(doc.items || []), item];
  return upsertCalculatedDocument(state, doc);
}

function exportDocumentExcel(documentId) {
  const doc = state.documents.find((item) => item.id === documentId);
  if (!doc) {
    alert("未找到单据。");
    return;
  }
  const archive = documentArchiveInfo(doc);
  const html = excelDocumentHtml(doc);
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = archive.excel_file_name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportDocumentPdf(documentId) {
  const doc = state.documents.find((item) => item.id === documentId);
  if (!doc) {
    alert("未找到单据。");
    return;
  }
  const printable = doc.document_type === DocumentType.PRODUCTION_ORDER ? productionOrderPreview(doc) : customerDocumentPreview(doc);
  const win = window.open("", "_blank");
  if (!win) {
    alert("浏览器阻止了 PDF 预览窗口，请允许弹窗后重试。");
    return;
  }
  win.document.write(`<!doctype html><html><head><title>${doc.document_no}</title><link rel="stylesheet" href="/trade-os-prototype/styles.css"></head><body class="print-body">${printable}<script>window.onload=()=>window.print();</script></body></html>`);
  win.document.close();
}

function excelDocumentHtml(doc) {
  const body = doc.document_type === DocumentType.PRODUCTION_ORDER ? productionOrderPreview(doc) : customerDocumentPreview(doc);
  return `<!doctype html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px}th{font-weight:bold}.money-cell{text-align:right}.document-warning{color:#b84545}.image-placeholder{display:inline-block;border:1px solid #bbb;padding:12px}</style></head><body>${body}</body></html>`;
}

function renderOrders() {
  const orders = state.orders.filter(matches);
  const selected = state.orders.find((item) => item.id === selectedOrderId) || orders[0] || null;
  selectedOrderId = selected?.id || "";
  const piReview = orders.filter((item) => item.status === OrderStatus.PI_REVIEW).length;
  const paymentPending = orders.filter((item) => item.payment_status !== PaymentStatus.PAID_MOCK).length;
  const productionActive = orders.filter((item) => item.production_status !== ProductionStatus.READY_TO_SHIP).length;
  const readyToShip = orders.filter((item) => item.production_status === ProductionStatus.READY_TO_SHIP).length;
  return `
    <div class="toolbar">
      <div>
        <h2>订单中心</h2>
        <p class="muted">报价草稿人工接受后生成 mock 订单；PI、价格、交期、付款条款和银行信息仍需人工审核。</p>
      </div>
    </div>
    <div class="grid stats-grid compact-stats">
      ${stat("Mock 订单", orders.length, "internal order drafts")}
      ${stat("PI 审核", piReview, "PI review required")}
      ${stat("付款待确认", paymentPending, "mock payment status")}
      ${stat("生产跟进", productionActive, "production tracking")}
      ${stat("可出货", readyToShip, "ready to ship")}
      ${stat("单证草稿", state.document_drafts.filter((doc) => orders.some((order) => order.id === doc.order_id)).length, "document placeholders")}
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>订单</th>
              <th>客户</th>
              <th>项目</th>
              <th>付款状态</th>
              <th>生产状态</th>
              <th>单证占位</th>
              <th>风险/下一步</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map((order) => {
                const docs = state.document_drafts.filter((doc) => doc.order_id === order.id);
                const shipment = state.shipments.find((item) => item.order_id === order.id);
                return `
                  <tr class="${selected?.id === order.id ? "selected-row" : ""}">
                    <td class="name-cell"><button class="link-button" data-view-order="${order.id}" type="button">${order.order_no}</button><span>${statusBadge(order.status)}</span></td>
                    <td>${customerName(order.customer_id)}</td>
                    <td>${projectName(order.project_id)}</td>
                    <td>${statusBadge(order.payment_status)}</td>
                    <td>${statusBadge(order.production_status)}</td>
                    <td>${docs.length} 个占位<br><span class="badge danger">Need review</span></td>
                    <td>${order.next_action}<br><span class="muted">${(order.risk_flags || []).join("; ")}</span></td>
                    <td class="action-cell">
                      <button class="ghost-button" data-order-status="${PaymentStatus.DEPOSIT_PENDING}" data-order-field="payment_status" data-id="${order.id}" type="button">Deposit Pending</button>
                      <button class="ghost-button" data-order-status="${ProductionStatus.IN_PRODUCTION}" data-order-field="production_status" data-id="${order.id}" type="button">In Production</button>
                      <button class="ghost-button" data-order-status="${ProductionStatus.READY_TO_SHIP}" data-order-field="production_status" data-id="${order.id}" type="button">Ready to Ship</button>
                      ${
                        shipment
                          ? `<span class="badge ok">${shipment.shipment_no}</span>`
                          : `<button class="primary-button" data-order-action="create-shipment" data-id="${order.id}" type="button">Create Shipment Draft</button>`
                      }
                    </td>
                  </tr>
                `;
              })
              .join("") || `<tr><td colspan="8">${empty("暂无 mock 订单。请先在报价中心人工接受一个报价草稿。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    ${selected ? orderDetail(selected) : ""}
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>订单安全边界</h2>
          <p>这里只做订单草稿和状态跟踪，不替你承诺商业条款。</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="process-grid dense">
          ${[
            "PI draft placeholder only",
            "No final price confirmation",
            "No delivery time confirmation",
            "No payment terms confirmation",
            "No bank account confirmation",
            "Manual review required before official documents",
          ]
            .map((step) => `<div class="process-step">${step}</div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function orderRelations(order) {
  const quotation = state.quotations.find((item) => item.id === order.quotation_id);
  const inquiry = state.inquiries.find((item) => item.id === order.inquiry_id || item.id === quotation?.inquiry_id);
  const project = state.projects.find((item) => item.id === order.project_id || item.id === quotation?.project_id);
  const shipment = state.shipments.find((item) => item.order_id === order.id);
  const afterSales = shipment ? state.after_sales_cases.find((item) => item.shipment_id === shipment.id) : null;
  const docs = state.document_drafts.filter((doc) => doc.order_id === order.id);
  return { quotation, inquiry, project, shipment, afterSales, docs };
}

function orderDetail(order) {
  const { quotation, inquiry, project, shipment, afterSales, docs } = orderRelations(order);
  const riskFlags = order.risk_flags || [];
  return `
    <section class="panel detail-panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${order.order_no}</h2>
          <p>Order command center · PI, payment, production and documents are mock/manual-review only.</p>
        </div>
        <span class="badge danger">Manual review required</span>
      </div>
      <div class="panel-body">
        <section class="order-command">
          <article><span>Order Status</span><strong>${order.status}</strong><small>${order.next_action || "Review manually."}</small></article>
          <article><span>Payment</span><strong>${order.payment_status}</strong><small>No payment terms or bank account confirmed by this demo.</small></article>
          <article><span>Production</span><strong>${order.production_status}</strong><small>Lead time and readiness must be confirmed manually.</small></article>
        </section>
        <div class="detail-actions">
          <button class="ghost-button" data-order-status="${PaymentStatus.DEPOSIT_PENDING}" data-order-field="payment_status" data-id="${order.id}" type="button">Deposit Pending</button>
          <button class="ghost-button" data-order-status="${PaymentStatus.DEPOSIT_RECEIVED_MOCK}" data-order-field="payment_status" data-id="${order.id}" type="button">Mock Deposit Received</button>
          <button class="ghost-button" data-order-status="${ProductionStatus.IN_PRODUCTION}" data-order-field="production_status" data-id="${order.id}" type="button">In Production</button>
          <button class="ghost-button" data-order-status="${ProductionStatus.QC_PENDING}" data-order-field="production_status" data-id="${order.id}" type="button">QC Pending</button>
          <button class="ghost-button" data-order-status="${ProductionStatus.READY_TO_SHIP}" data-order-field="production_status" data-id="${order.id}" type="button">Ready to Ship</button>
          ${
            shipment
              ? `<button class="ghost-button" data-view-shipment="${shipment.id}" type="button">Open Shipment</button>`
              : `<button class="primary-button" data-order-action="create-shipment" data-id="${order.id}" type="button">Create Shipment Draft</button>`
          }
        </div>
        <div class="detail-grid">
          ${detailBox("Order Profile", [
            ["Customer", customerName(order.customer_id)],
            ["Business line", order.business_line ? businessLineLabel(order.business_line) : ""],
            ["Currency", order.currency],
            ["Incoterm", order.incoterm],
            ["Destination port", order.destination_port],
            ["Manual review", order.manual_review_required ? "Yes" : "No"],
          ])}
          ${detailBox("Related Records", [
            ["Quotation", quotation?.quote_no],
            ["Inquiry", inquiry?.title],
            ["Project", project?.title || project?.name],
            ["Shipment", shipment?.shipment_no],
            ["After-sales", afterSales?.case_no],
          ])}
          <article class="detail-box">
            <h3>Order Risk Flags</h3>
            ${riskFlags.map((item) => `<p>• ${item}</p>`).join("") || "<p>No risk flag recorded.</p>"}
          </article>
          <article class="detail-box wide">
            <h3>Document Draft Review</h3>
            <div class="review-grid">
              ${docs
                .map((doc) => `<div><strong>${doc.type}</strong><span>${doc.status}<br>${doc.notes}</span></div>`)
                .join("") || "<p>No document placeholders.</p>"}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Order Relationship Map</h3>
            <div class="relation-strip">
              ${relationPill("Quotation", quotation?.quote_no || "not linked")}
              ${relationPill("Inquiry", inquiry?.title || "not linked")}
              ${relationPill("Project", project?.title || project?.name || "not linked")}
              ${relationPill("Shipment", shipment?.shipment_no || "not created")}
              ${relationPill("After-sales", afterSales?.case_no || "not created")}
              ${relationPill("Documents", docs.length)}
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderShipments() {
  const shipments = state.shipments.filter(matches);
  const selected = state.shipments.find((item) => item.id === selectedShipmentId) || shipments[0] || null;
  selectedShipmentId = selected?.id || "";
  const booking = shipments.filter((item) => item.status === ShipmentStatus.BOOKING_PENDING).length;
  const manualDocs = state.document_drafts.filter((doc) => shipments.some((shipment) => shipment.id === doc.shipment_id)).length;
  const afterSalesCount = state.after_sales_cases.filter((item) => shipments.some((shipment) => shipment.id === item.shipment_id)).length;
  return `
    <div class="toolbar">
      <div>
        <h2>出货中心</h2>
        <p class="muted">记录柜型、路线、ETA、BL 状态和单证事项。</p>
      </div>
      <button class="primary-button" data-action="add-shipment" type="button">新增出货</button>
    </div>
    <div class="grid stats-grid compact-stats">
      ${stat("出货草稿", shipments.length, "shipment drafts")}
      ${stat("订舱待确认", booking, "booking pending")}
      ${stat("单证待审", manualDocs, "BL / CI / PL placeholders")}
      ${stat("售后跟进", afterSalesCount, "after-sales created")}
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>出货</th>
              <th>路线</th>
              <th>项目</th>
              <th>柜型</th>
              <th>货物</th>
              <th>状态</th>
              <th>ETA</th>
              <th>单证</th>
              <th>备注</th>
              <th>售后</th>
            </tr>
          </thead>
          <tbody>
            ${shipments
              .map(
                (shipment) => `
                  <tr class="${selected?.id === shipment.id ? "selected-row" : ""}">
                    <td class="name-cell"><button class="link-button" data-view-shipment="${shipment.id}" type="button">${shipment.shipment_no || shipment.id}</button><span>${shipment.order_id ? "From order" : "Seed data"}</span></td>
                    <td class="name-cell"><strong>${shipment.route}</strong></td>
                    <td>${projectName(shipment.project_id || shipment.projectId)}</td>
                    <td>${shipment.container}</td>
                    <td>${shipment.goods}</td>
                    <td>${statusBadge(shipment.status)}</td>
                    <td>${shipment.eta}</td>
                    <td>${shipmentDocuments(shipment).length} 个占位<br><span class="badge danger">Manual review</span></td>
                    <td>${shipment.notes}</td>
                    <td class="action-cell">
                      ${
                        state.after_sales_cases.find((item) => item.shipment_id === shipment.id)
                          ? `<span class="badge ok">Follow-up created</span>`
                          : `<button class="primary-button" data-shipment-action="create-after-sales" data-id="${shipment.id}" type="button">Create After-sales Follow-up</button>`
                      }
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
    ${selected ? shipmentDetail(selected) : ""}
  `;
}

function shipmentRelations(shipment) {
  const order = state.orders.find((item) => item.id === shipment.order_id);
  const quotation = order ? state.quotations.find((item) => item.id === order.quotation_id) : null;
  const inquiry = order ? state.inquiries.find((item) => item.id === order.inquiry_id || item.id === quotation?.inquiry_id) : null;
  const project = state.projects.find((item) => item.id === shipment.project_id || item.id === order?.project_id);
  const afterSales = state.after_sales_cases.find((item) => item.shipment_id === shipment.id);
  const docs = shipmentDocuments(shipment);
  return { order, quotation, inquiry, project, afterSales, docs };
}

function shipmentDetail(shipment) {
  const { order, quotation, inquiry, project, afterSales, docs } = shipmentRelations(shipment);
  return `
    <section class="panel detail-panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>${shipment.shipment_no || shipment.id}</h2>
          <p>Shipment command center · booking, BL, CI, PL and release documents require manual review.</p>
        </div>
        <span class="badge danger">Document review required</span>
      </div>
      <div class="panel-body">
        <section class="shipment-command">
          <article><span>Shipment Status</span><strong>${shipment.status}</strong><small>${shipment.notes || "Review shipping status manually."}</small></article>
          <article><span>Destination</span><strong>${shipment.destination_port || shipment.route || "-"}</strong><small>ETA and booking are placeholders until manually confirmed.</small></article>
          <article><span>Documents</span><strong>${docs.length}</strong><small>BL / CI / PL / booking placeholders require human review.</small></article>
        </section>
        <div class="detail-actions">
          ${
            afterSales
              ? `<button class="ghost-button" data-view-shortcut="afterSales" type="button">Open After-sales</button>`
              : `<button class="primary-button" data-shipment-action="create-after-sales" data-id="${shipment.id}" type="button">Create After-sales Follow-up</button>`
          }
          ${order ? `<button class="ghost-button" data-view-order="${order.id}" type="button">Open Order</button>` : ""}
        </div>
        <div class="detail-grid">
          ${detailBox("Shipment Profile", [
            ["Route", shipment.route],
            ["Container", shipment.container],
            ["Goods", shipment.goods],
            ["ETA", shipment.eta],
            ["Document status", shipment.document_status],
            ["Manual review", shipment.manual_review_required ? "Yes" : "No"],
          ])}
          ${detailBox("Related Records", [
            ["Order", order?.order_no],
            ["Quotation", quotation?.quote_no],
            ["Inquiry", inquiry?.title],
            ["Project", project?.title || project?.name],
            ["After-sales", afterSales?.case_no],
          ])}
          <article class="detail-box wide">
            <h3>Shipment Document Review</h3>
            <div class="review-grid">
              ${docs
                .map((doc) => `<div><strong>${doc.type}</strong><span>${doc.status}<br>${doc.notes}</span></div>`)
                .join("") || "<p>No shipment document placeholders.</p>"}
            </div>
          </article>
          <article class="detail-box wide">
            <h3>Shipment Relationship Map</h3>
            <div class="relation-strip">
              ${relationPill("Order", order?.order_no || "not linked")}
              ${relationPill("Quotation", quotation?.quote_no || "not linked")}
              ${relationPill("Project", project?.title || project?.name || "not linked")}
              ${relationPill("After-sales", afterSales?.case_no || "not created")}
              ${relationPill("Documents", docs.length)}
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderAfterSales() {
  const cases = state.after_sales_cases.filter(matches);
  const repeatTasks = state.follow_up_tasks.filter((item) => item.type === "REPEAT_BUSINESS");
  return `
    <div class="toolbar">
      <div>
        <h2>售后与复购</h2>
        <p class="muted">出货后跟进到货、质量反馈、替换件、投诉和下一次复购机会；只生成任务和草稿，不自动承诺赔偿。</p>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-view-shortcut="shipments" type="button">从出货创建售后</button>
      </div>
    </div>
    <div class="grid stats-grid">
      ${stat("售后案例", cases.length, "after-sales cases")}
      ${stat("待反馈", cases.filter((item) => item.status === "FOLLOW_UP_PENDING" || item.status === "WAITING_CUSTOMER_FEEDBACK").length, "客户反馈/质量确认")}
      ${stat("复购机会", cases.filter((item) => item.status === "REPEAT_BUSINESS_OPPORTUNITY").length, "repeat opportunity")}
      ${stat("复购任务", repeatTasks.length, "30 天回访")}
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>案例</th>
              <th>客户 / 项目</th>
              <th>状态</th>
              <th>问题/反馈</th>
              <th>复购机会</th>
              <th>下一步</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            ${cases
              .map(
                (item) => `
                  <tr>
                    <td class="name-cell"><strong>${item.case_no}</strong><span>${item.issue_type}</span></td>
                    <td>${customerName(item.customer_id)}<br><span class="muted">${projectName(item.project_id)}</span></td>
                    <td>${statusBadge(item.status)}</td>
                    <td>${item.customer_feedback || item.complaint_summary || "Awaiting feedback"}<br><span class="muted">Replacement: ${item.replacement_required ? "Yes" : "No"} · Compensation: ${item.compensation_required ? "Yes" : "No"}</span></td>
                    <td>${item.repeat_business_opportunity || "-"}</td>
                    <td>${item.next_action}<br><span class="badge danger">Manual review required</span></td>
                    <td class="action-cell">
                      <button class="ghost-button" data-after-sales-action="mock-feedback" data-id="${item.id}" type="button">Record Mock Feedback</button>
                      <button class="primary-button" data-after-sales-action="repeat-reminder" data-id="${item.id}" type="button">Create Repeat Reminder</button>
                    </td>
                  </tr>
                `,
              )
              .join("") || `<tr><td colspan="7">${empty("暂无售后案例。请先在出货中心创建售后跟进。")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h2>售后安全边界</h2>
          <p>系统只收集反馈和创建任务，不自动判断责任，不自动承诺赔偿或替换件。</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="process-grid dense">
          ${[
            "Collect delivery feedback",
            "Track quality issues and evidence",
            "Create replacement/compensation placeholders only",
            "Create repeat business reminders",
            "Manual review before customer commitments",
          ]
            .map((step) => `<div class="process-step">${step}</div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCommandCenter() {
  return `
    <div class="toolbar">
      <div>
        <h2>Command Center / 指令中心</h2>
        <p class="muted">自然语言指令入口。当前为 rule-based MVP，不接 OpenAI，不自动发送消息，不生成官方报价或 PI。</p>
      </div>
      <div class="toolbar-actions">
        <a class="primary-button" href="/admin/command-center">打开指令中心</a>
      </div>
    </div>
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>需要人工审核</h2>
          <p>报价、PI、付款条款、银行账号、交期、赔偿、责任判断、客户消息发送都必须人工审批。</p>
        </div>
      </div>
      <div class="panel-body">
        <p>指令中心会解析自然语言，生成计划，调用现有 mock 工具或安全占位工具，并展示结果预览。高风险动作不会自动执行到外部客户。</p>
      </div>
    </section>
  `;
}

function renderAssistant() {
  return `
    <div class="toolbar">
      <div>
        <h2>AI 助手</h2>
        <p class="muted">本原型先模拟 AI 结果，后续可接 OpenAI API 和 Gmail。</p>
      </div>
    </div>
    <div class="assistant-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>选择工作流</h2>
            <p>按你的真实业务流程设计</p>
          </div>
        </div>
        <div class="panel-body form-grid">
          <button class="primary-button" data-ai="lead" type="button">分析新询盘</button>
          <button class="primary-button" data-ai="prospect" type="button">生成潜客开发计划</button>
          <button class="primary-button" data-ai="content" type="button">生成独立站/社媒内容</button>
          <button class="primary-button" data-ai="campaign" type="button">生成开发活动节奏</button>
          <button class="primary-button" data-ai="whatsapp" type="button">分析 WhatsApp 聊天</button>
          <button class="primary-button" data-ai="automation" type="button">生成订单推进计划</button>
          <button class="primary-button" data-ai="reply" type="button">生成客户回复</button>
          <button class="primary-button" data-ai="project" type="button">总结项目状态</button>
          <button class="primary-button" data-ai="docs" type="button">检查单证风险</button>
          <button class="primary-button" data-ai="customer" type="button">生成客户 360</button>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>输出</h2>
            <p>可以作为后续真实 AI 提示词和接口返回格式</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="assistant-output" id="assistantOutput">选择左侧工作流生成模拟结果。</div>
        </div>
      </section>
    </div>
  `;
}

function leadCard(lead) {
  return `
    <article class="lead-card">
      <strong>${lead.title}</strong>
      <p>${lead.summary}</p>
      <p><span class="badge">${lead.source}</span> <span class="badge warning">Score ${lead.score}</span></p>
      <p><strong>缺失信息：</strong>${lead.missing}</p>
      <p class="muted">${customerName(lead.customerId)}</p>
    </article>
  `;
}

function taskCard(task) {
  if (task.inquiry_id) {
    const inquiry = state.inquiries.find((item) => item.id === task.inquiry_id);
    return `
      <article class="${contextCardClass("task", task.id, "task-item")}">
        <h3>${task.title} ${task.priority === "high" ? '<span class="badge danger">High</span>' : ""}</h3>
        <p>${inquiry?.title || "未绑定询盘"} · ${task.due_date || "-"}</p>
        <p>${task.type} · ${task.status}</p>
      </article>
    `;
  }
  return `
    <article class="${contextCardClass("task", task.id, "task-item")}">
      <h3>${task.title} ${task.priority === "high" ? '<span class="badge danger">High</span>' : ""}</h3>
      <p>${projectName(task.projectId)} · ${task.due}</p>
      <p>${task.note}</p>
    </article>
  `;
}

function empty(message) {
  return `<div class="empty">${message}</div>`;
}

const formDefinitions = {
  customer: {
    title: "新增客户",
    fields: [
      ["name", "客户名称", "text"],
      ["country", "国家", "text"],
      ["type", "客户类型", "text"],
      ["aliases", "关联公司/别名", "textarea"],
      ["summary", "AI 摘要/备注", "textarea"],
    ],
    save(values) {
      state.customers.push({
        id: `cus-${Date.now()}`,
        status: "active",
        importance: "C",
        lastContact: new Date().toISOString().slice(0, 10),
        ...values,
      });
    },
  },
  prospect: {
    title: "新增潜客",
    fields: [
      ["company", "目标公司", "text"],
      ["country", "国家", "text"],
      ["segment", "客户类型", "text"],
      ["channel", "来源渠道", "text"],
      ["need", "需求判断", "textarea"],
      ["nextAction", "下一步", "textarea"],
    ],
    save(values) {
      state.prospects.push({
        id: `prospect-${Date.now()}`,
        fit: 70,
        status: "research",
        ...values,
      });
    },
  },
  page: {
    title: "新增独立站页面",
    fields: [
      ["title", "页面标题", "text"],
      ["type", "页面类型", "text"],
      ["target", "目标客户", "textarea"],
      ["cta", "询盘动作 CTA", "text"],
      ["seo", "SEO 关键词", "textarea"],
    ],
    save(values) {
      state.websitePages.push({
        id: `page-${Date.now()}`,
        status: "draft",
        ...values,
      });
    },
  },
  post: {
    title: "新增社媒内容",
    fields: [
      ["platform", "平台", "text"],
      ["topic", "主题", "text"],
      ["audience", "目标受众", "text"],
      ["goal", "内容目标", "textarea"],
    ],
    save(values) {
      state.socialPosts.push({
        id: `post-${Date.now()}`,
        status: "draft",
        ...values,
      });
    },
  },
  campaign: {
    title: "新增开发活动",
    fields: [
      ["name", "活动名称", "text"],
      ["market", "目标市场", "text"],
      ["offer", "主打方案", "textarea"],
      ["channel", "渠道组合", "text"],
      ["nextAction", "下一步", "textarea"],
    ],
    save(values) {
      state.campaigns.push({
        id: `camp-${Date.now()}`,
        stage: "planning",
        leads: 0,
        replies: 0,
        ...values,
      });
    },
  },
  lead: {
    title: "新增线索",
    fields: [
      ["title", "线索标题", "text"],
      ["company", "公司", "text"],
      ["name", "联系人", "text"],
      ["email", "邮箱", "text"],
      ["country", "国家", "text"],
      ["business_line", "业务线 A_ARCHITECTURAL / B_PRECISION", "text"],
      ["source", "来源", "text"],
      ["summary", "需求摘要", "textarea"],
      ["missing", "缺失信息", "textarea"],
    ],
    save(values) {
      state.leads.push({
        id: `lead-${Date.now()}`,
        status: "NEW",
        stage: "new",
        score: 60,
        created_at: new Date().toISOString(),
        ...values,
      });
    },
  },
  project: {
    title: "新增项目",
    fields: [
      ["name", "项目名称", "text"],
      ["customerId", "客户", "customer"],
      ["country", "国家", "text"],
      ["type", "项目类型", "text"],
      ["stage", "阶段", "text"],
      ["products", "产品范围", "textarea"],
      ["risk", "风险/下一步", "textarea"],
    ],
    save(values) {
      state.projects.push({
        id: `prj-${Date.now()}`,
        status: "新建项目",
        ...values,
      });
    },
  },
  quote: {
    title: "新增报价",
    fields: [
      ["no", "报价号", "text"],
      ["customer", "客户名称", "text"],
      ["projectId", "项目", "project"],
      ["status", "状态", "text"],
      ["items", "报价内容", "textarea"],
    ],
    save(values) {
      state.quotes.push({
        id: `quo-${Date.now()}`,
        currency: "USD",
        amount: 0,
        ...values,
      });
    },
  },
  shipment: {
    title: "新增出货",
    fields: [
      ["route", "路线", "text"],
      ["projectId", "项目", "project"],
      ["container", "柜型", "text"],
      ["goods", "货物", "text"],
      ["status", "状态", "text"],
      ["eta", "ETA", "text"],
      ["notes", "备注", "textarea"],
    ],
    save(values) {
      state.shipments.push({
        id: `shp-${Date.now()}`,
        ...values,
      });
    },
  },
};

function openForm(type) {
  const definition = formDefinitions[type];
  dialogTitle.textContent = definition.title;
  dialogFields.innerHTML = definition.fields.map(renderField).join("");
  entityForm.dataset.type = type;
  dialog.showModal();
}

function renderField([name, label, type]) {
  if (type === "textarea") {
    return `<div class="field"><label for="${name}">${label}</label><textarea id="${name}" name="${name}"></textarea></div>`;
  }
  if (type === "customer") {
    return `
      <div class="field">
        <label for="${name}">${label}</label>
        <select id="${name}" name="${name}">
          ${state.customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join("")}
        </select>
      </div>
    `;
  }
  if (type === "project") {
    return `
      <div class="field">
        <label for="${name}">${label}</label>
        <select id="${name}" name="${name}">
          ${state.projects.map((project) => `<option value="${project.id}">${project.name}</option>`).join("")}
        </select>
      </div>
    `;
  }
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" /></div>`;
}

function bindViewEvents() {
  document.querySelectorAll("[data-context-action='copy']").forEach((button) => {
    button.addEventListener("click", async () => {
      const summary = commandContextSummaryText();
      try {
        await navigator.clipboard.writeText(summary);
        button.textContent = "已复制";
      } catch {
        button.textContent = "复制失败";
      }
    });
  });

  document.querySelectorAll("[data-context-action='draft-follow-up']").forEach((button) => {
    button.addEventListener("click", () => {
      const result = createFollowUpTaskDraft(commandCenterContext.command_id, commandHistory, commandCenterContext);
      if (result.ok) saveCommandHistory(result.history);
      button.textContent = result.ok ? "跟进草稿已创建" : "创建失败";
      button.title = "仅草稿，不会发送任何客户消息。";
      if (result.ok) render();
    });
  });

  document.querySelectorAll("[data-context-action='document-checklist']").forEach((button) => {
    button.addEventListener("click", () => {
      const result = generateDocumentDraftChecklist(commandCenterContext.command_id, commandHistory);
      if (result.ok) saveCommandHistory(result.history);
      button.textContent = result.ok ? "检查清单已生成" : "生成失败";
      if (result.ok) render();
    });
  });

  document.querySelectorAll("[data-context-action='mark-review-pending']").forEach((button) => {
    button.addEventListener("click", () => {
      const result = updateManualReviewStatus(commandCenterContext.command_id, "review_pending", commandHistory, {
        reviewed_by: getAdminSession()?.user?.email || "local_admin",
      });
      if (result.ok) saveCommandHistory(result.history);
      button.textContent = result.ok ? "已标记待审核" : "状态不可更新";
      if (result.ok) render();
    });
  });

  document.querySelectorAll("[data-context-action='save-review-note']").forEach((button) => {
    button.addEventListener("click", () => {
      const note = document.querySelector("[data-context-review-note]")?.value || "";
      const result = saveManualReviewNote(commandCenterContext.command_id, note, commandHistory, {
        reviewed_by: getAdminSession()?.user?.email || "local_admin",
      });
      if (result.ok) saveCommandHistory(result.history);
      button.textContent = result.ok ? "审核备注已保存" : "保存失败";
      if (result.ok) render();
    });
  });

  document.querySelectorAll("[data-context-action='clear']").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.confirm("确认清除当前模块中的指令中心上下文吗？")) {
        window.location.assign("/trade-os-prototype");
      }
    });
  });

  document.querySelectorAll("[data-workflow-step-complete]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = findCommandHistoryRecord(commandHistory, commandCenterContext.command_id);
      if (!record) {
        button.textContent = "No history";
        return;
      }
      const result = markWorkflowStepCompleted(record, button.dataset.workflowStepComplete);
      if (!result.ok) {
        button.textContent = "已阻止";
        return;
      }
      saveCommandHistory(upsertCommandHistoryRecord(commandHistory, result.record));
      render();
    });
  });

  document.querySelectorAll("[data-import-website-leads]").forEach((button) => {
    button.addEventListener("click", () => importWebsiteLeads());
  });

  document.querySelectorAll("[data-run-demo-flow]").forEach((button) => {
    button.addEventListener("click", runFullDemoFlow);
  });

  document.querySelectorAll("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewShortcut));
  });

  document.querySelectorAll("[data-lead-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      leadFilters[select.dataset.leadFilter] = select.value;
      render();
    });
  });

  document.querySelectorAll("[data-lead-action]").forEach((button) => {
    button.addEventListener("click", () => handleLeadAction(button.dataset.leadAction, button.dataset.id));
  });

  document.querySelectorAll("[data-lead-action-global]").forEach((button) => {
    button.addEventListener("click", () => handleLeadGlobalAction(button.dataset.leadActionGlobal));
  });

  document.querySelectorAll("[data-view-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCustomerId = button.dataset.viewCustomer;
      render();
    });
  });

  document.querySelectorAll("[data-open-related-inquiry]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedInquiryId = button.dataset.openRelatedInquiry;
      setView("leads");
    });
  });

  document.querySelectorAll("[data-inquiry-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      inquiryFilters[select.dataset.inquiryFilter] = select.value;
      selectedInquiryId = "";
      render();
    });
  });

  document.querySelectorAll("[data-view-inquiry]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedInquiryId = button.dataset.viewInquiry;
      render();
    });
  });

  document.querySelectorAll("[data-inquiry-action]").forEach((button) => {
    button.addEventListener("click", () => handleInquiryAction(button.dataset.inquiryAction, button.dataset.id));
  });

  document.querySelectorAll("[data-quote-action]").forEach((button) => {
    button.addEventListener("click", () => handleQuoteAction(button.dataset.quoteAction, button.dataset.id));
  });

  document.querySelectorAll("[data-view-document]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDocumentId = button.dataset.viewDocument;
      render();
    });
  });

  document.querySelectorAll("[data-document-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      documentFilters[select.dataset.documentFilter] = select.value;
      selectedDocumentId = "";
      render();
    });
  });

  document.querySelectorAll("[data-document-action]").forEach((button) => {
    button.addEventListener("click", () => handleDocumentAction(button.dataset.documentAction, button.dataset.id));
  });

  document.querySelectorAll("[data-document-draft-review-action]").forEach((button) => {
    button.addEventListener("click", () => handleDocumentDraftReviewAction(button));
  });

  document.querySelectorAll("[data-view-project]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedProjectId = button.dataset.viewProject;
      render();
    });
  });

  document.querySelectorAll("[data-project-action]").forEach((button) => {
    button.addEventListener("click", () => handleProjectAction(button.dataset.projectAction, button.dataset.id));
  });

  document.querySelectorAll("[data-view-product]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedProductId = button.dataset.viewProduct;
      render();
    });
  });

  document.querySelectorAll("[data-product-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      productFilters[select.dataset.productFilter] = select.value;
      selectedProductId = "";
      render();
    });
  });

  document.querySelectorAll("[data-product-action]").forEach((button) => {
    button.addEventListener("click", () => handleProductAction(button.dataset.productAction, button.dataset.id));
  });

  document.querySelectorAll("[data-view-quote]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedQuoteId = button.dataset.viewQuote;
      render();
    });
  });

  document.querySelectorAll("[data-order-action]").forEach((button) => {
    button.addEventListener("click", () => handleOrderAction(button.dataset.orderAction, button.dataset.id));
  });

  document.querySelectorAll("[data-view-order]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOrderId = button.dataset.viewOrder;
      setView("orders");
    });
  });

  document.querySelectorAll("[data-order-status]").forEach((button) => {
    button.addEventListener("click", () => handleOrderStatus(button.dataset.id, button.dataset.orderField, button.dataset.orderStatus));
  });

  document.querySelectorAll("[data-shipment-action]").forEach((button) => {
    button.addEventListener("click", () => handleShipmentAction(button.dataset.shipmentAction, button.dataset.id));
  });

  document.querySelectorAll("[data-view-shipment]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedShipmentId = button.dataset.viewShipment;
      setView("shipments");
    });
  });

  document.querySelectorAll("[data-after-sales-action]").forEach((button) => {
    button.addEventListener("click", () => handleAfterSalesAction(button.dataset.afterSalesAction, button.dataset.id));
  });

  document.querySelectorAll("[data-alibaba-action]").forEach((button) => {
    button.addEventListener("click", () => handleAlibabaAction(button.dataset.alibabaAction));
  });

  document.querySelectorAll("[data-acquisition-action]").forEach((button) => {
    button.addEventListener("click", () => handleAcquisitionAction(button.dataset.acquisitionAction));
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.action.replace("add-", "");
      openForm(type);
    });
  });

  document.querySelectorAll("[data-ai]").forEach((button) => {
    button.addEventListener("click", () => renderAiOutput(button.dataset.ai));
  });
}

function handleAlibabaAction(action) {
  const textarea = document.querySelector("#alibabaInquiryText");
  if (action === "sample") {
    if (textarea) textarea.value = sampleAlibabaText();
    return;
  }
  if (action === "sample-batch") {
    if (textarea) textarea.value = sampleAlibabaBatchText();
    return;
  }
  if (action === "run-full-flow") {
    runAlibabaFullFlow();
    return;
  }
  const text = action === "create-sample" ? sampleAlibabaText() : textarea?.value || "";
  if (!text.trim()) {
    alert("请先粘贴阿里巴巴询盘内容，或点击“填入示例”。");
    return;
  }
  const result = createAlibabaInquiries(state, text);
  const latest = result.imported[0] || result.skipped[0];
  selectedInquiryId = latest?.id || selectedInquiryId;
  saveState();
  render();
  alert(
    [
      `阿里巴巴询盘处理完成：导入 ${result.imported.length} 条，跳过重复 ${result.skipped.length} 条。`,
      "已为新记录生成 Lead / Inquiry / Requirement / Follow-up。",
      "不会自动回复客户，正式报价前必须人工审核。",
    ].join("\n"),
  );
}

async function handleAcquisitionAction(action) {
  if (action === "import-website") {
    await importWebsiteLeads();
    return;
  }
  if (action === "import-alibaba-batch") {
    const result = createAlibabaInquiries(state, sampleAlibabaBatchText());
    selectedInquiryId = result.imported[0]?.id || selectedInquiryId;
    saveState();
    render();
    alert(`阿里巴巴批量导入完成：导入 ${result.imported.length} 条，跳过重复 ${result.skipped.length} 条。`);
    return;
  }
  if (action === "create-gmail-demo" || action === "create-whatsapp-demo" || action === "create-manual-demo") {
    const source =
      action === "create-gmail-demo" ? Source.GMAIL : action === "create-whatsapp-demo" ? Source.WHATSAPP : Source.MANUAL;
    const lead = sampleAcquisitionLead(source);
    state.leads.unshift(lead);
    const inquiry = createInquiryFromLead(state, lead.id);
    selectedInquiryId = inquiry?.id || selectedInquiryId;
    saveState();
    render();
    alert(`已创建 ${source} mock 线索并生成询盘。不会发送任何客户消息。`);
    return;
  }
  if (action === "create-lead") {
    createLeadFromAcquisitionForm(false);
    return;
  }
  if (action === "create-lead-inquiry") {
    createLeadFromAcquisitionForm(true);
    return;
  }
  if (action === "run-all-demo") {
    runUnifiedAcquisitionDemo();
  }
}

function handleInquiryAction(action, inquiryId) {
  let message = "";
  const inquiry = state.inquiries.find((item) => item.id === inquiryId);
  if (action === "convert-customer") {
    const customer = createCustomerFromInquiry(state, inquiryId);
    message = customer ? `已转为客户：${customer.name}` : "未找到询盘。";
  }
  if (action === "convert-project") {
    const project = createProjectFromInquiry(state, inquiryId);
    message = project ? `已创建项目：${project.title || project.name}` : "未找到询盘。";
  }
  if (action === "create-quote") {
    const quotation = createQuotationDraft(state, inquiryId, "inquiry");
    message = quotation ? `已创建报价草稿：${quotation.quote_no}。正式报价前必须人工审核。` : "未找到询盘。";
  }
  if (action === "ready-check") {
    const readiness = inquiry ? inquiryReadiness(inquiry) : null;
    if (inquiry && readiness?.ready) {
      inquiry.status = InquiryStatus.READY_TO_QUOTE;
      inquiry.recommended_next_action = readiness.nextAction;
      inquiry.updated_at = new Date().toISOString();
    } else if (inquiry) {
      inquiry.status = InquiryStatus.NEED_MORE_INFO;
      inquiry.recommended_next_action = readiness.nextAction;
      inquiry.updated_at = new Date().toISOString();
    }
    message = readiness
      ? `Ready-to-Quote Check: ${readiness.label}。正式报价仍需人工审核。`
      : "未找到询盘。";
  }
  if (action === "missing-task") {
    if (inquiry) createFollowUpTask(state, inquiry, TaskType.REQUEST_MISSING_INFO);
    message = inquiry ? "已创建补充信息跟进任务，不会自动发送给客户。" : "未找到询盘。";
  }
  if (action === "need-more-info") {
    updateInquiryStatus(state, inquiryId, InquiryStatus.NEED_MORE_INFO);
    message = "已标记为需要补充信息。";
  }
  if (action === "ready-to-quote") {
    updateInquiryStatus(state, inquiryId, InquiryStatus.READY_TO_QUOTE);
    message = "已标记为可进入人工报价审核。";
  }
  if (action === "close") {
    updateInquiryStatus(state, inquiryId, InquiryStatus.CLOSED);
    message = "已关闭询盘。";
  }
  selectedInquiryId = inquiryId;
  saveState();
  render();
  if (message) alert(message);
}

function handleProjectAction(action, projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) {
    alert("未找到项目。");
    return;
  }
  const { inquiry, quotation } = projectRelations(project);
  let message = "";
  if (action === "create-quote") {
    const quote = createQuotationDraft(state, project.id, "project");
    project.stage = ProjectStage.QUOTATION;
    project.status = "Quotation draft created";
    project.next_action = "Review quote draft manually: price, lead time, payment terms, freight and PI must be confirmed by human.";
    project.updated_at = new Date().toISOString();
    selectedQuoteId = quote?.id || selectedQuoteId;
    message = quote ? `已创建项目报价草稿：${quote.quote_no}。正式报价前必须人工审核。` : "未找到关联询盘，无法创建报价草稿。";
  }
  if (action === "advance-quotation") {
    project.stage = ProjectStage.QUOTATION;
    project.status = "Quotation review";
    project.next_action = "Prepare quotation draft and collect missing price fields. Manual review required.";
    message = "项目已推进到报价阶段。";
  }
  if (action === "advance-negotiation") {
    project.stage = ProjectStage.NEGOTIATION;
    project.status = "Negotiation";
    project.next_action = "Track customer questions, revisions, target price and technical clarifications.";
    message = "项目已推进到谈判阶段。";
  }
  if (action === "order-pending") {
    project.stage = ProjectStage.ORDER_PENDING;
    project.status = "Order pending";
    project.next_action = "Wait for manual confirmation before PI, payment terms, bank details or production commitment.";
    message = "项目已推进到待下单阶段。";
  }
  if (action === "create-order-shipment") {
    const quote = quotation || (inquiry ? createQuotationDraft(state, inquiry.id, "inquiry") : null);
    const order = quote ? createOrderFromQuotation(state, quote.id) : null;
    const shipment = order ? createShipmentFromOrder(state, order.id) : null;
    project.stage = ProjectStage.ORDERED;
    project.status = "Mock order and shipment created";
    project.next_action = "Review PI, payment, production, booking and documents manually.";
    project.updated_at = new Date().toISOString();
    message = order
      ? `已创建 mock 订单和出货草稿：${order.order_no} / ${shipment?.shipment_no || "-"}。PI、价格、交期、付款条款仍需人工审核。`
      : "未找到报价草稿，无法创建订单。";
  }
  if (action === "mark-lost") {
    project.stage = ProjectStage.LOST;
    project.status = "Lost";
    project.next_action = "Record reason and schedule future reactivation if useful.";
    message = "项目已标记为 Lost。";
  }
  selectedProjectId = projectId;
  saveState();
  render();
  if (message) alert(message);
}

async function handleLeadAction(action, leadId) {
  let message = "";
  if (DATA_MODE === "supabase") {
    try {
      if (action === "qualify") {
        await updateLeadReviewStatus(leadId, "QUALIFIED", "Manual lead review marked qualified.");
        message = "Lead marked QUALIFIED.";
      }
      if (action === "need-review") {
        await updateLeadReviewStatus(leadId, "NEED_REVIEW", "Manual lead review requested.");
        message = "Lead marked NEED_REVIEW.";
      }
      if (action === "mark-lost") {
        await updateLeadReviewStatus(leadId, "DISQUALIFIED", "Manual lead review disqualified.");
        message = "Lead marked DISQUALIFIED.";
      }
      if (action === "convert-customer") {
        const result = await convertLeadToCustomer(leadId);
        selectedCustomerId = result.customer?.id || selectedCustomerId;
        message = result.customer ? `Lead converted to customer: ${result.customer.name}` : "Lead conversion failed.";
      }
      if (action === "convert-inquiry") {
        message = "Supabase public inquiries already create Inquiry records. Open Inquiry Pool to review it.";
      }
      await refreshPilotDataFromAdapter(false);
    } catch (error) {
      message = `Supabase lead action failed: ${error.message}`;
    }
    if (message) alert(message);
    return;
  }
  if (action === "qualify") {
    const lead = state.leads.find((item) => item.id === leadId);
    const quality = lead ? leadQualification(lead) : null;
    if (lead && quality) {
      lead.status = quality.decision === "READY_TO_CONVERT" ? "QUALIFIED" : quality.decision;
      lead.score = Math.max(Number(lead.score || 0), quality.decision === "READY_TO_CONVERT" ? 82 : Number(lead.score || 0));
      lead.qualification_decision = quality.decision;
      lead.qualification_reason = quality.reason;
      lead.next_action = quality.next_action;
      lead.updated_at = new Date().toISOString();
    }
    message = lead ? `线索资格判断完成：${quality.decision}` : "未找到线索。";
  }
  if (action === "convert-inquiry") {
    const inquiry = createInquiryFromLead(state, leadId);
    selectedInquiryId = inquiry?.id || selectedInquiryId;
    message = inquiry ? `已从线索生成询盘：${inquiry.title}` : "未找到线索。";
  }
  if (action === "convert-customer") {
    const customer = createCustomerFromLead(state, leadId);
    selectedCustomerId = customer?.id || selectedCustomerId;
    message = customer ? `已从线索生成客户：${customer.name}` : "未找到线索。";
  }
  if (action === "mark-high") {
    const lead = updateLeadStatus(state, leadId, "HIGH_POTENTIAL");
    if (lead) lead.score = Math.max(Number(lead.score || 0), 88);
    message = lead ? "已标记为高潜力线索。" : "未找到线索。";
  }
  if (action === "mark-lost") {
    const lead = updateLeadStatus(state, leadId, "DISQUALIFIED");
    message = lead ? "已标记为无效线索。" : "未找到线索。";
  }
  if (action === "need-review") {
    const lead = updateLeadStatus(state, leadId, "NEED_REVIEW");
    message = lead ? "已标记为需要审核。" : "未找到线索。";
  }
  saveState();
  render();
  if (message) alert(message);
}

function handleLeadGlobalAction(action) {
  if (action !== "qualify-all") return;
  let updated = 0;
  state.leads.forEach((lead) => {
    const quality = leadQualification(lead);
    lead.qualification_decision = quality.decision;
    lead.qualification_reason = quality.reason;
    lead.next_action = quality.next_action;
    if (quality.decision === "READY_TO_CONVERT") {
      lead.status = "QUALIFIED";
      lead.score = Math.max(Number(lead.score || 0), 82);
    } else if (quality.decision === "DUPLICATE_REVIEW") {
      lead.status = "DUPLICATE_REVIEW";
    } else if (quality.decision === "NEED_CONTACT" || quality.decision === "NEED_RESEARCH") {
      lead.status = "QUALIFYING";
    }
    lead.updated_at = new Date().toISOString();
    updated += 1;
  });
  saveState();
  render();
  alert(`Lead Qualification 完成：已审核 ${updated} 条线索。未自动发送消息，未自动合并重复客户。`);
}

function handleQuoteAction(action, quotationId) {
  let message = "";
  const quote = state.quotations.find((item) => item.id === quotationId);
  if (action === "accept-create-order") {
    const order = createOrderFromQuotation(state, quotationId);
    message = order
      ? `已生成 mock 订单：${order.order_no}。PI、价格、交期、付款条款和银行信息仍需人工审核。`
      : "未找到报价草稿。";
  }
  if (action === "run-review") {
    if (quote) {
      const readiness = quoteReadiness(quote);
      quote.review_score = readiness.score;
      quote.review_decision = readiness.decision;
      quote.review_blockers = readiness.blockers;
      quote.status = readiness.blockers.length ? "NEED_REVIEW" : "DRAFT";
      quote.updated_at = new Date().toISOString();
      message = `报价审核完成：${readiness.decision}，完整度 ${readiness.score}%。`;
    } else {
      message = "未找到报价草稿。";
    }
  }
  if (action === "mark-ready") {
    if (quote) {
      quote.status = "READY_FOR_MANUAL_SEND_REVIEW";
      quote.manual_review_required = true;
      quote.review_decision = "READY_FOR_MANUAL_SEND_REVIEW";
      quote.updated_at = new Date().toISOString();
      message = "已标记为 Ready for Manual Send Review。仍需人工决定是否外发正式报价。";
    } else {
      message = "未找到报价草稿。";
    }
  }
  if (action === "create-follow-up") {
    const inquiry = quote ? state.inquiries.find((item) => item.id === quote.inquiry_id) : null;
    if (inquiry) {
      inquiry.quotation_id = quote.id;
      createFollowUpTask(state, inquiry, TaskType.QUOTE_FOLLOW_UP);
      message = "已创建报价跟进任务。不会自动发送给客户。";
    } else {
      message = "未找到关联询盘，无法创建报价跟进任务。";
    }
  }
  selectedQuoteId = quotationId;
  saveState();
  render();
  if (message) alert(message);
}

function handleOrderAction(action, orderId) {
  let message = "";
  if (action === "create-shipment") {
    const shipment = createShipmentFromOrder(state, orderId);
    selectedOrderId = orderId;
    selectedShipmentId = shipment?.id || selectedShipmentId;
    message = shipment ? `已生成出货草稿：${shipment.shipment_no}。BL/CI/PL/订舱信息均为占位，需人工审核。` : "未找到订单。";
  }
  saveState();
  render();
  if (message) alert(message);
}

function handleOrderStatus(orderId, field, value) {
  const order = updateOrderMockStatus(state, orderId, field, value);
  selectedOrderId = orderId;
  saveState();
  render();
  alert(order ? `已更新 mock 订单状态：${field} = ${value}。` : "未找到订单。");
}

function handleShipmentAction(action, shipmentId) {
  let message = "";
  if (action === "create-after-sales") {
    const afterSalesCase = createAfterSalesCaseFromShipment(state, shipmentId);
    selectedShipmentId = shipmentId;
    message = afterSalesCase
      ? `已创建售后跟进：${afterSalesCase.case_no}。不会自动承诺赔偿、替换件或责任判断。`
      : "未找到出货记录。";
  }
  saveState();
  render();
  if (message) alert(message);
}

function handleAfterSalesAction(action, caseId) {
  let message = "";
  if (action === "mock-feedback") {
    const afterSalesCase = updateAfterSalesFeedback(
      state,
      caseId,
      "Mock feedback: customer received goods and needs manual satisfaction / issue review.",
    );
    message = afterSalesCase ? "已记录 mock 客户反馈，等待人工复核。" : "未找到售后案例。";
  }
  if (action === "repeat-reminder") {
    const task = createRepeatBusinessReminder(state, caseId);
    message = task ? `已创建复购提醒：${task.title}` : "未找到售后案例。";
  }
  saveState();
  render();
  if (message) alert(message);
}

function renderAiOutput(type) {
  const output = document.querySelector("#assistantOutput");
  const templates = {
    lead: `新询盘分析\n\n产品类别：ACM / curtain wall material\n客户意图：较强，客户已有项目和政府检查需求。\n缺失信息：供应商正式 brochure、证书、每平方米重量、交货时间。\n建议动作：先回复确认可提供技术文件，并要求客户确认最终项目名称和收货公司。`,
    prospect: `潜客开发计划\n\n目标客户：中南美幕墙承包商 / 门窗加工厂 / 玻璃加工厂\n优先市场：Demo Market A, Colombia, Demo Market B, Chile\n筛选条件：有 facade / curtain wall / aluminium window / glass processing 项目经验；网站展示工程案例；有采购或工程负责人。\n首触达卖点：我们不是只卖铝型材，而是能按图纸提供型材、ACM、胶条、五金、证书、包装和出口单证的一整套项目供应服务。\n下一步：建立 100 家目标公司名单，按国家和客户类型分层。`,
    content: `内容生成建议\n\n独立站页面：Curtain Wall Aluminum Profiles and Project Packages\nSEO 标题：Custom Curtain Wall Aluminum Profiles Supplier from China\n核心段落：We help facade contractors and glass companies source aluminum mullions, pressure plates, caps, ACM panels, gaskets, hardware and export documents based on project drawings.\n社媒帖子：Before quoting long aluminum profiles, we check profile code, drawing version, length, finish, RAL color, theoretical weight, packing and container plan.\nCTA：Upload your profile drawings or panel schedule for review.`,
    campaign: `开发活动节奏\n\n活动：LATAM Curtain Wall Contractors\nDay 0：研究公司网站、项目案例和关键联系人。\nDay 1：发送首封开发信，附项目供应能力简介。\nDay 3：LinkedIn 添加工程/采购负责人，发送简短消息。\nDay 7：跟进 Demo Project Market/Demo Market A 类似项目经验，强调图纸审查和单证能力。\nDay 14：发送产品资料包：curtain wall profiles, ACM, gasket, hardware。\nDay 30：按回复、网站访问、需求匹配度重新评分。`,
    whatsapp: `WhatsApp 聊天分析\n\n识别客户：Demo Tube Inquiry / Demo Market B\n语言：Spanish\n客户意图：询问薄壁铝管，已有参考照片，但缺少完整尺寸和公差。\n业务类型：新询盘 + 开模判断\n建议动作：要求客户提供样品、图纸、壁厚、外径、长度、表面处理、数量和目标港口。\n系统任务：创建 Mold Check 任务，负责人 Paul，状态为等待客户补资料。\n回复策略：先说明当前无完全相同模具，再给出可执行的样品/图纸确认路径。`,
    automation: `订单推进计划\n\n1. 询盘进入后自动识别来源、语种、国家、产品和缺失信息。\n2. 技术确认阶段绑定图纸、照片、视频、样品和客户内部工程师反馈。\n3. 报价阶段保存每个版本的数量、颜色、加工费、检测费和交期变化。\n4. 下单后把 PI、CI、PL、BL、柜号、付款方和收货人绑定到同一项目。\n5. 发货后按柜号生成 ETA、清关、到港和客户确认节点。\n6. 售后阶段把问题视频、现场照片、责任判断、供应商反馈和最终解决方案沉淀为知识库。`,
    reply: `英文回复草稿\n\nDear Demo Contact,\n\nThanks for your message. We are checking the supplier documents, technical brochure and the weight information for the 6mm A2 fireproof ACM panels.\n\nBefore we finalize the documents, please confirm whether the files should be issued under Demo Facade Buyer, Demo Facade Group or the Demo Project Market project company.\n\nBest regards,\nPaul`,
    project: `项目状态摘要：Demo Tower Aluminium Order\n\n当前阶段：production / balance follow-up\n关键要求：RAL 7016 smooth powder coating, uniform paint, protective stickers, thick plastic sheet packaging.\n风险：6.4m length may require 40FT container. Extra profiles may need next shipment.\n下一步：确认工厂已收到追加项，生产前再次确认喷涂和包装标准。`,
    docs: `单证检查结果\n\nWarnings:\n1. 客户主体可能存在 Demo Facade Buyer / Demo Facade Group / Demo Project Holdings 多公司抬头，需要人工确认。\n2. PI、CI、PL 中目的港和最终收货公司必须保持一致。\n3. 多批次出货需要核对件数、重量、CBM 和发票号。\n\nBlocking issues: 暂无。`,
    customer: `客户 360：Demo Facade Buyer / Demo Contact\n\n客户类型：长期工程项目客户。\n常购产品：建筑铝型材、幕墙型材、ACM、胶条、五金、保护膜、吊篮。\n沟通偏好：邮件中明确技术细节，要求快速确认；关注颜色、喷涂、包装、证书和船期。\n开发机会：ACM、hardware package、gasket、mirror、project supply case study。`,
  };
  output.textContent = templates[type];
}

nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (button) setView(button.dataset.view);
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  render();
});

document.querySelector("#resetDataButton").addEventListener("click", resetData);
document.querySelector("#adminLogoutButton")?.addEventListener("click", async () => {
  await signOutAdmin();
  window.location.assign("/admin/login");
});

entityForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const type = entityForm.dataset.type;
  const definition = formDefinitions[type];
  const values = Object.fromEntries(new FormData(entityForm).entries());
  definition.save(values);
  saveState();
  dialog.close();
  entityForm.reset();
  render();
});

saveState();
render();
refreshPilotDataFromAdapter();
