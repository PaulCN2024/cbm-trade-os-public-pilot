const CustomerForbiddenTerms = [
  "internal_weight_factor",
  "internal_cost_note",
  "internal_cost_amount",
  "profit",
  "margin",
  "RMB cost",
  "1.10",
  "uplift",
  "上浮",
  "wastage",
  "packing weight",
  "factory notes",
  "production internal notes",
];

const ProductionForbiddenTerms = [
  "customer company name",
  "customer address",
  "customer contact",
  "customer email",
  "customer phone",
  "unit price",
  "amount",
  "total amount",
  "bank account",
  "payment term",
  "profit",
  "exchange rate",
  "internal cost",
  "sales price",
  "customer",
  "price",
  "bank",
  "payment",
];

export function mapCustomerDocumentItem(item) {
  if (item.item_type === "aluminum_profile") {
    return pick(item, ["image", "item_code", "description", "finish", "color", "length_m", "weight_kg_per_m", "quantity_pcs", "total_weight_kg", "unit_price", "amount"]);
  }
  if (item.item_type === "cut_aluminum_profile") {
    return pick(item, ["image", "item_code", "description", "finish", "cut_length_mm", "quantity_pcs", "unit_price", "amount"]);
  }
  if (item.item_type === "accessory") {
    return pick(item, ["image", "item_name", "quantity_pcs", "unit_price", "amount"]);
  }
  if (item.item_type === "charge") {
    return pick(item, ["display_name", "amount"]);
  }
  throw new Error(`Unsupported customer document item_type: ${item.item_type || "unknown"}`);
}

export function mapCustomerDocumentItems(items) {
  return (items || []).map(mapCustomerDocumentItem);
}

export function mapProductionOrderItem(item) {
  return pick(item, [
    "production_order_no",
    "date",
    "project_code",
    "image",
    "item_code",
    "model",
    "item_name",
    "description",
    "material",
    "finish",
    "color",
    "length_m",
    "cut_length_mm",
    "weight_kg_per_m",
    "quantity_pcs",
    "unit",
    "packing_requirement",
    "shipment_batch",
    "cutting_requirement",
    "production_remark",
  ]);
}

export function mapProductionOrderItems(items) {
  return (items || []).map(mapProductionOrderItem);
}

export function getCustomerVisibleColumns(itemType) {
  return {
    aluminum_profile: ["image", "item_code", "description", "finish", "color", "length_m", "weight_kg_per_m", "quantity_pcs", "total_weight_kg", "unit_price", "amount"],
    cut_aluminum_profile: ["image", "item_code", "description", "finish", "cut_length_mm", "quantity_pcs", "unit_price", "amount"],
    accessory: ["image", "item_name", "quantity_pcs", "unit_price", "amount"],
    charge: ["display_name", "amount"],
  }[itemType] || [];
}

export function getProductionOrderVisibleFields() {
  return [
    "production_order_no",
    "date",
    "project_code",
    "image",
    "item_code",
    "model",
    "item_name",
    "description",
    "material",
    "finish",
    "color",
    "length_m",
    "cut_length_mm",
    "weight_kg_per_m",
    "quantity_pcs",
    "unit",
    "packing_requirement",
    "shipment_batch",
    "cutting_requirement",
    "production_remark",
  ];
}

export function mapCommercialInvoiceSummary(document = {}) {
  const items = document.items || [];
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity_pcs || item.quantity || 0), 0);
  const totalNetWeight = items.reduce((sum, item) => sum + Number(item.total_weight_kg || 0), 0);
  const goodsValue = Number(document.goods_value ?? document.subtotal_amount ?? document.subtotal_usd ?? 0);
  const shipmentCost = Number(document.shipment_cost ?? document.freight_amount ?? 0);

  return {
    buyer: document.buyer || document.customer?.name || "",
    seller: document.seller?.company_name || document.seller || "",
    project: document.project || document.project_name || document.project_code || "",
    goods_description: document.goods_description || "Aluminum products",
    total_quantity: totalQuantity,
    total_net_weight: totalNetWeight,
    goods_value: goodsValue,
    shipment_cost: shipmentCost,
    invoice_total: Number(document.invoice_total ?? goodsValue + shipmentCost),
    remarks: document.remarks || "",
  };
}

export function assertNoForbiddenCustomerFields(mappedData) {
  assertNoForbiddenTerms(mappedData, CustomerForbiddenTerms, "customer document");
}

export function assertNoForbiddenProductionFields(mappedData) {
  assertNoForbiddenTerms(mappedData, ProductionForbiddenTerms, "production order");
}

function pick(source, fields) {
  return fields.reduce((result, field) => {
    const value = source[field] ?? aliasValue(source, field);
    if (value !== undefined) result[field] = value;
    return result;
  }, {});
}

function aliasValue(source, field) {
  if (field === "unit_price") return source.unit_price_usd_per_kg ?? source.unit_price_usd_per_pc;
  if (field === "amount") return source.amount_usd;
  if (field === "item_name") return source.display_name;
  if (field === "shipment_batch") return source.shipping_batch;
  if (field === "production_remark") return source.production_note;
  return undefined;
}

function assertNoForbiddenTerms(value, terms, scope) {
  const hits = [];
  scanValue(value, terms, hits, "");
  if (hits.length) {
    throw new Error(`Forbidden ${scope} field or term found: ${hits[0]}`);
  }
}

function scanValue(value, terms, hits, path) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanValue(item, terms, hits, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      scanText(key, terms, hits, `${path}.${key}`);
      scanValue(child, terms, hits, `${path}.${key}`);
    });
    return;
  }

  if (typeof value === "string") {
    scanText(value, terms, hits, path);
  }
}

function scanText(text, terms, hits, path) {
  const normalizedText = normalizeText(text);
  terms.forEach((term) => {
    const normalizedTerm = normalizeText(term);
    if (normalizedText.includes(normalizedTerm)) {
      hits.push(`${path || "value"} contains ${term}`);
    }
  });
}

function normalizeText(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
