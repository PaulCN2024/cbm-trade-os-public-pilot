import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateAccessoryItem,
  calculateAluminumProfileItem,
  calculateChargeItem,
  calculateCutAluminumProfileItem,
  calculateDocumentItem,
  calculateDocumentTotals,
} from "../lib/document-calculations.js";

test("calculates aluminum_profile weight and amount without mutating input", () => {
  const input = {
    item_type: "aluminum_profile",
    quantity_pcs: 115,
    length_m: 5.85,
    weight_kg_per_m: 4.8,
    unit_price: 4.45,
    internal_weight_factor: 1.1,
  };
  const original = structuredClone(input);

  const result = calculateAluminumProfileItem(input);
  const expectedWeight = Math.round((115 * 5.85 * 4.8 * 1.1 + Number.EPSILON) * 1000) / 1000;
  const expectedAmount = Math.round((expectedWeight * 4.45 + Number.EPSILON) * 100) / 100;

  assert.equal(result.total_weight_kg, expectedWeight);
  assert.equal(result.amount, expectedAmount);
  assert.equal(result.amount_usd, expectedAmount);
  assert.deepEqual(input, original);
});

test("calculates cut_aluminum_profile amount", () => {
  const result = calculateCutAluminumProfileItem({
    item_type: "cut_aluminum_profile",
    item_code: "CL5437",
    quantity_pcs: 6500,
    unit_price: 0.52,
  });

  assert.equal(result.amount, 3380);
});

test("calculates accessory amount", () => {
  const result = calculateAccessoryItem({
    item_type: "accessory",
    item_name: "Wall End Caps",
    quantity_pcs: 45,
    unit_price: 2.34,
  });

  assert.equal(result.amount, 105.3);
});

test("calculates charge amount from quantity and unit price", () => {
  const result = calculateChargeItem({
    item_type: "charge",
    display_name: "Air Freight Charge for First 1,000 pcs",
    quantity: 1,
    unit_price: 2000,
  });

  assert.equal(result.amount, 2000);
});

test("preserves existing charge amount when quantity and unit_price are not valid", () => {
  const result = calculateChargeItem({
    item_type: "charge",
    display_name: "Air Freight Charge for First 1,000 pcs",
    amount: 2000,
    internal_cost_note: "150kg * RMB85/kg + RMB600 customs declaration",
  });

  assert.equal(result.amount, 2000);
});

test("summarizes document totals by subtotal, charges and total weight", () => {
  const result = calculateDocumentTotals([
    {
      item_type: "aluminum_profile",
      quantity_pcs: 115,
      length_m: 5.85,
      weight_kg_per_m: 4.8,
      unit_price: 4.45,
      internal_weight_factor: 1.1,
    },
    {
      item_type: "cut_aluminum_profile",
      quantity_pcs: 6500,
      unit_price: 0.52,
    },
    {
      item_type: "accessory",
      quantity_pcs: 45,
      unit_price: 2.34,
    },
    {
      item_type: "charge",
      quantity: 1,
      unit_price: 2000,
    },
  ]);

  const aluminumWeight = Math.round((115 * 5.85 * 4.8 * 1.1 + Number.EPSILON) * 1000) / 1000;
  const aluminumAmount = Math.round((aluminumWeight * 4.45 + Number.EPSILON) * 100) / 100;
  const subtotal = Math.round((aluminumAmount + 3380 + 105.3 + Number.EPSILON) * 100) / 100;

  assert.equal(result.subtotal_amount, subtotal);
  assert.equal(result.charges_amount, 2000);
  assert.equal(result.total_amount, subtotal + 2000);
  assert.equal(result.total_weight_kg, aluminumWeight);
});

test("unsupported item_type throws a clear error", () => {
  assert.throws(() => calculateDocumentItem({ item_type: "unknown_type" }), /Unsupported document item_type: unknown_type/);
});
