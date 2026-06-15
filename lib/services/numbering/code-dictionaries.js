const CUSTOMER_TYPE_CODES = Object.freeze({
  DIST: "Distributor",
  CON: "Contractor",
  DEV: "Developer",
  TRD: "Trader",
  FAB: "Fabricator",
  WIN: "Window/Door Company",
  GLZ: "Glazing Company",
  RET: "Retailer",
  PROJ: "Project Owner",
  GOV: "Government",
  UNK: "Unknown",
});

const SOURCE_CODES = Object.freeze({
  AI: "AI Lead Discovery",
  ALI: "Alibaba",
  MIC: "Made-in-China",
  WEB: "Website",
  WA: "WhatsApp",
  EM: "Email",
  EXH: "Trade Show",
  REF: "Referral",
  OLD: "Old Customer",
  MAN: "Manual Entry",
  LIN: "LinkedIn",
  SEA: "Search Engine",
});

const SUPPLIER_CATEGORY_CODES = Object.freeze({
  ALU: "Aluminum",
  GLS: "Glass",
  STL: "Steel",
  SS: "Stainless Steel",
  CEI: "Ceiling",
  RAIL: "Railing",
  MAC: "Machining",
  HW: "Hardware",
  CART: "Golf Cart",
  PKG: "Packaging",
  OTH: "Other",
});

const OBJECT_TYPE_CODES = Object.freeze({
  customer_company: "CUST",
  customer_contact: "CONT",
  supplier_company: "SUP",
  supplier_contact: "SCONT",
  inquiry: "INQ",
  project: "PRJ",
  supplier_rfq: "RFQ",
  supplier_quote: "SQUO",
  customer_quotation: "QUO",
  pi: "PI",
  order: "ORD",
  purchase_order: "PO",
  document: "DOC",
  attachment: "ATT",
  communication_thread: "COM",
  task: "TASK",
  knowledge_article: "KB",
  approval_review: "APR",
});

const DEFAULT_CODES = Object.freeze({
  UNKNOWN_COUNTRY: "XX",
  UNKNOWN_CUSTOMER_TYPE: "UNK",
  UNKNOWN_SOURCE: "MAN",
  OTHER_SUPPLIER_CATEGORY: "OTH",
});

const CUSTOMER_TYPE_CODE_VALUES = Object.freeze(Object.keys(CUSTOMER_TYPE_CODES));
const SOURCE_CODE_VALUES = Object.freeze(Object.keys(SOURCE_CODES));
const SUPPLIER_CATEGORY_CODE_VALUES = Object.freeze(Object.keys(SUPPLIER_CATEGORY_CODES));
const OBJECT_TYPE_CODE_VALUES = Object.freeze(Object.values(OBJECT_TYPE_CODES));

module.exports = {
  CUSTOMER_TYPE_CODES,
  SOURCE_CODES,
  SUPPLIER_CATEGORY_CODES,
  OBJECT_TYPE_CODES,
  DEFAULT_CODES,
  CUSTOMER_TYPE_CODE_VALUES,
  SOURCE_CODE_VALUES,
  SUPPLIER_CATEGORY_CODE_VALUES,
  OBJECT_TYPE_CODE_VALUES,
};
