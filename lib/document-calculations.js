export const DEFAULT_INTERNAL_WEIGHT_FACTOR = 1.1;

export const DocumentItemType = Object.freeze({
  ALUMINUM_PROFILE: "aluminum_profile",
  CUT_ALUMINUM_PROFILE: "cut_aluminum_profile",
  ACCESSORY: "accessory",
  CHARGE: "charge",
});

export function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function roundWeight(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 1000) / 1000;
}

export function calculateAluminumProfileItem(item) {
  const factor = Number(item.internal_weight_factor || DEFAULT_INTERNAL_WEIGHT_FACTOR);
  const totalWeight = roundWeight(
    Number(item.quantity_pcs || 0) * Number(item.length_m || 0) * Number(item.weight_kg_per_m || 0) * factor,
  );
  const unitPrice = Number(item.unit_price ?? item.unit_price_usd_per_kg ?? 0);

  return {
    ...item,
    total_weight_kg: totalWeight,
    amount: roundMoney(totalWeight * unitPrice),
    amount_usd: roundMoney(totalWeight * unitPrice),
  };
}

export function calculateCutAluminumProfileItem(item) {
  const amount = roundMoney(Number(item.quantity_pcs || 0) * Number(item.unit_price ?? item.unit_price_usd_per_pc ?? 0));
  return {
    ...item,
    amount,
    amount_usd: amount,
  };
}

export function calculateAccessoryItem(item) {
  const amount = roundMoney(Number(item.quantity_pcs || 0) * Number(item.unit_price ?? item.unit_price_usd_per_pc ?? 0));
  return {
    ...item,
    amount,
    amount_usd: amount,
  };
}

export function calculateChargeItem(item) {
  const hasValidQuantity = item.quantity !== undefined && item.quantity !== null && item.quantity !== "" && Number.isFinite(Number(item.quantity));
  const hasValidUnitPrice = item.unit_price !== undefined && item.unit_price !== null && item.unit_price !== "" && Number.isFinite(Number(item.unit_price));
  const amount = hasValidQuantity && hasValidUnitPrice ? Number(item.quantity) * Number(item.unit_price) : Number(item.amount ?? item.amount_usd ?? 0);

  return {
    ...item,
    amount: roundMoney(amount),
    amount_usd: roundMoney(amount),
  };
}

export function calculateDocumentItem(item) {
  if (!item || typeof item !== "object") {
    throw new Error("Document item must be an object.");
  }

  if (item.item_type === DocumentItemType.ALUMINUM_PROFILE) return calculateAluminumProfileItem(item);
  if (item.item_type === DocumentItemType.CUT_ALUMINUM_PROFILE) return calculateCutAluminumProfileItem(item);
  if (item.item_type === DocumentItemType.ACCESSORY) return calculateAccessoryItem(item);
  if (item.item_type === DocumentItemType.CHARGE) return calculateChargeItem(item);

  throw new Error(`Unsupported document item_type: ${item.item_type || "unknown"}`);
}

export function calculateDocumentTotals(items) {
  return (items || []).reduce(
    (totals, item) => {
      const calculated = calculateDocumentItem(item);
      const amount = Number(calculated.amount ?? calculated.amount_usd ?? 0);

      if (calculated.item_type === DocumentItemType.CHARGE) {
        totals.charges_amount = roundMoney(totals.charges_amount + amount);
      } else {
        totals.subtotal_amount = roundMoney(totals.subtotal_amount + amount);
      }

      if (calculated.item_type === DocumentItemType.ALUMINUM_PROFILE) {
        totals.total_weight_kg = roundWeight(totals.total_weight_kg + Number(calculated.total_weight_kg || 0));
      }

      totals.total_amount = roundMoney(totals.subtotal_amount + totals.charges_amount);
      return totals;
    },
    {
      subtotal_amount: 0,
      charges_amount: 0,
      total_amount: 0,
      total_weight_kg: 0,
    },
  );
}
