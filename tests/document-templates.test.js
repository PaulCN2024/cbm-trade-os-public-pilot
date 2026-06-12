import test from "node:test";
import assert from "node:assert/strict";

import {
  assertNoForbiddenCustomerFields,
  assertNoForbiddenProductionFields,
  mapCommercialInvoiceSummary,
  mapCustomerDocumentItem,
  mapProductionOrderItem,
} from "../lib/document-templates.js";

test("customer aluminum_profile mapping shows kg fields but hides internal factor and uplift terms", () => {
  const mapped = mapCustomerDocumentItem({
    item_type: "aluminum_profile",
    image: "profile.png",
    item_code: "AL-01",
    description: "Aluminum profile",
    finish: "Anodized",
    color: "Silver",
    length_m: 5.85,
    weight_kg_per_m: 4.8,
    quantity_pcs: 115,
    total_weight_kg: 3552.12,
    unit_price: 4.45,
    amount: 15806.93,
    internal_weight_factor: 1.1,
    internal_note: "上浮 hidden",
  });

  assert.equal(mapped.weight_kg_per_m, 4.8);
  assert.equal(mapped.internal_weight_factor, undefined);
  assert.doesNotThrow(() => assertNoForbiddenCustomerFields(mapped));
});

test("customer assertion fails when forbidden terms appear in nested objects", () => {
  assert.throws(
    () =>
      assertNoForbiddenCustomerFields({
        safe: {
          nested: "This includes uplift and should fail.",
        },
      }),
    /Forbidden customer document field or term/,
  );
});

test("accessory mapped item hides length and weight fields", () => {
  const mapped = mapCustomerDocumentItem({
    item_type: "accessory",
    image: "cap.png",
    item_name: "Wall End Caps",
    quantity_pcs: 45,
    unit_price: 2.34,
    amount: 105.3,
    length_m: 1.5,
    weight_kg_per_m: 0.8,
    total_weight_kg: 54,
  });

  assert.equal(mapped.length_m, undefined);
  assert.equal(mapped.weight_kg_per_m, undefined);
  assert.equal(mapped.total_weight_kg, undefined);
  assert.doesNotThrow(() => assertNoForbiddenCustomerFields(mapped));
});

test("charge mapped item shows amount but hides internal cost note", () => {
  const mapped = mapCustomerDocumentItem({
    item_type: "charge",
    display_name: "Air Freight Charge for First 1,000 pcs",
    amount: 2000,
    internal_cost_note: "150kg * RMB85/kg + RMB600 customs declaration",
  });

  assert.equal(mapped.amount, 2000);
  assert.equal(mapped.internal_cost_note, undefined);
  assert.doesNotThrow(() => assertNoForbiddenCustomerFields(mapped));
});

test("manual_review_note does not appear in customer document mapping", () => {
  const mapped = mapCustomerDocumentItem({
    item_type: "cut_aluminum_profile",
    item_code: "CL5437",
    description: "Cut aluminum profile",
    finish: "Powder coated",
    cut_length_mm: 114,
    quantity_pcs: 6500,
    unit_price_usd_per_pc: 0.52,
    amount_usd: 3380,
    manual_review_note: "内部审核备注，仅内部使用",
  });

  assert.equal(mapped.manual_review_note, undefined);
  assert.equal(JSON.stringify(mapped).includes("内部审核备注"), false);
  assert.doesNotThrow(() => assertNoForbiddenCustomerFields(mapped));
});

test("production order mapped data hides customer, price, amount, bank and payment terms", () => {
  const mapped = mapProductionOrderItem({
    item_type: "aluminum_profile",
    project_code: "OCLUB",
    item_code: "AL-01",
    description: "Aluminum profile",
    material: "6063-T5",
    finish: "Powder coated",
    color: "Black",
    length_m: 5.85,
    quantity_pcs: 115,
    unit_price: 4.45,
    amount: 15806.93,
    customer_company_name: "PANAGLASS",
    customer_email: "buyer@example.com",
    bank_account: "secret",
    payment_term: "30% deposit",
  });

  assert.equal(mapped.customer_company_name, undefined);
  assert.equal(mapped.unit_price, undefined);
  assert.equal(mapped.amount, undefined);
  assert.equal(mapped.bank_account, undefined);
  assert.equal(mapped.payment_term, undefined);
  assert.doesNotThrow(() => assertNoForbiddenProductionFields(mapped));
});

test("production assertion fails when forbidden price text appears", () => {
  assert.throws(
    () =>
      assertNoForbiddenProductionFields({
        remark: "Please check sales price before production.",
      }),
    /Forbidden production order field or term/,
  );
});

test("commercial invoice summary mode hides detailed material item list", () => {
  const summary = mapCommercialInvoiceSummary({
    customer: { name: "PANAGLASS" },
    seller: { company_name: "CBM GLOBAL LIMITED" },
    project_code: "Celeste4",
    goods_description: "Aluminum handrail system",
    subtotal_usd: 12000,
    shipment_cost: 800,
    remarks: "For customs clearance only.",
    items: [
      {
        item_code: "CL5437",
        material: "6063-T5",
        internal_weight_factor: 1.1,
        quantity_pcs: 6500,
        total_weight_kg: 720,
      },
    ],
  });

  assert.deepEqual(Object.keys(summary), [
    "buyer",
    "seller",
    "project",
    "goods_description",
    "total_quantity",
    "total_net_weight",
    "goods_value",
    "shipment_cost",
    "invoice_total",
    "remarks",
  ]);
  assert.equal(summary.buyer, "PANAGLASS");
  assert.equal(summary.total_quantity, 6500);
  assert.equal(summary.total_net_weight, 720);
  assert.equal(summary.invoice_total, 12800);
  assert.equal(summary.items, undefined);
  assert.doesNotThrow(() => assertNoForbiddenCustomerFields(summary));
});
