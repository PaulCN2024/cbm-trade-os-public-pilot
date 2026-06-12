import test from "node:test";
import assert from "node:assert/strict";

import {
  DocumentType,
  createEmptyDb,
  createProductionOrderFromDocument,
  documentArchiveInfo,
  ensureDocumentSeeds,
} from "../lib/mock-crm.js";
import {
  assertNoForbiddenCustomerFields,
  assertNoForbiddenProductionFields,
  mapCustomerDocumentItems,
  mapProductionOrderItems,
} from "../lib/document-templates.js";

test("CL5437 sample keeps existing calculated total", () => {
  const db = createEmptyDb();
  ensureDocumentSeeds(db);
  const cl5437 = db.documents.find((document) => document.sample_key === "CL5437");

  assert.ok(cl5437);
  assert.equal(cl5437.document_no, "CBM-PI-CL5437");
  assert.equal(cl5437.total_usd, 5380);
  assert.equal(cl5437.items.find((item) => item.item_type === "cut_aluminum_profile").amount_usd, 3380);
  assert.equal(cl5437.items.find((item) => item.item_type === "charge").amount_usd, 2000);
});

test("O CLUB HANDRAILS sample maps customer items without forbidden customer fields", () => {
  const db = createEmptyDb();
  ensureDocumentSeeds(db);
  const oclub = db.documents.find((document) => document.sample_key === "O_CLUB_HANDRAILS");

  assert.ok(oclub);
  const mapped = mapCustomerDocumentItems(oclub.items);

  assert.ok(mapped.some((item) => item.item_code === "GJQ0001"));
  assert.ok(mapped.some((item) => item.item_name === "Wall End Caps"));
  assert.doesNotThrow(() => assertNoForbiddenCustomerFields(mapped));
});

test("existing customer preview mapped output keeps expected public fields", () => {
  const db = createEmptyDb();
  ensureDocumentSeeds(db);
  const oclub = db.documents.find((document) => document.sample_key === "O_CLUB_HANDRAILS");
  const profile = mapCustomerDocumentItems(oclub.items).find((item) => item.item_code === "GJQ0001");

  assert.equal(profile.description, "Aluminum handrail profile");
  assert.equal(profile.finish, "Powder coated");
  assert.equal(profile.color, "RAL 7016");
  assert.equal(profile.length_m, 5.85);
  assert.equal(profile.weight_kg_per_m, 4.454);
  assert.equal(profile.quantity_pcs, 115);
  assert.equal(profile.internal_weight_factor, undefined);
});

test("production order mapped output hides customer price bank and payment fields", () => {
  const db = createEmptyDb();
  ensureDocumentSeeds(db);
  const oclub = db.documents.find((document) => document.sample_key === "O_CLUB_HANDRAILS");
  const production = createProductionOrderFromDocument(db, oclub.id);
  const mapped = mapProductionOrderItems(production.items);

  assert.equal(production.document_type, DocumentType.PRODUCTION_ORDER);
  assert.doesNotThrow(() => assertNoForbiddenProductionFields(mapped));
  assert.equal(mapped.some((item) => item.amount !== undefined), false);
  assert.equal(mapped.some((item) => item.unit_price !== undefined), false);
  assert.equal(mapped.some((item) => item.bank_account !== undefined), false);
  assert.equal(mapped.some((item) => item.payment_term !== undefined), false);
});

test("documentArchiveInfo keeps existing file naming while exposing recommended archive fields", () => {
  const db = createEmptyDb();
  ensureDocumentSeeds(db);
  const cl5437 = db.documents.find((document) => document.sample_key === "CL5437");
  const archive = documentArchiveInfo(cl5437);
  const date = cl5437.date.replaceAll("-", "");

  assert.equal(archive.archive_folder, "询盘管理 / PanamaKevin / 2026");
  assert.equal(archive.pdf_file_name, `CBM_PI_PanamaKevin_CL5437_${date}.pdf`);
  assert.equal(archive.excel_file_name, `CBM_PI_PanamaKevin_CL5437_${date}.xlsx`);
  assert.match(archive.recommended_archive_path, /桌面 \/ MacBook Air \/ OneNote \/ PanamaKevin \/ 2026-CL5437/);
  assert.equal(archive.recommended_pdf_file_name, `PanamaKevin_2026-CL5437_CL5437_PI_${date}_v1.pdf`);
  assert.match(archive.recommended_zip_pdf_path, /MacBook Air\/OneNote\/PanamaKevin\/2026-CL5437\//);
});
