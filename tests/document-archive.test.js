import test from "node:test";
import assert from "node:assert/strict";

import {
  buildArchivePath,
  buildExportFileName,
  buildZipPath,
  getNextVersion,
  normalizeArchiveSegment,
} from "../lib/document-archive.js";

test("buildArchivePath creates customer year-order folder", () => {
  const result = buildArchivePath({
    base_path: "桌面 / MacBook Air / OneNote",
    customer_folder_alias: "巴拿马Kevin",
    archive_year: 2026,
    archive_order_no: 4,
  });

  assert.equal(result, "桌面 / MacBook Air / OneNote / 巴拿马Kevin / 2026-4");
});

test("buildArchivePath supports English base path", () => {
  const result = buildArchivePath({
    base_path: "Desktop / MacBook Air / OneNote",
    customer_folder_alias: "巴拿马Kevin",
    archive_year: 2026,
    archive_order_no: 4,
  });

  assert.equal(result, "Desktop / MacBook Air / OneNote / 巴拿马Kevin / 2026-4");
});

test("buildExportFileName creates recommended file name", () => {
  const result = buildExportFileName({
    customer_alias: "巴拿马Kevin",
    archive_year: 2026,
    archive_order_no: 4,
    project: "Celeste4",
    document_type: "CommercialInvoice",
    date: "20260610",
    version: "v1",
    ext: "xlsx",
  });

  assert.equal(result, "巴拿马Kevin_2026-4_Celeste4_CommercialInvoice_20260610_v1.xlsx");
});

test("getNextVersion returns v3 when v1 and v2 exist", () => {
  const result = getNextVersion([
    "巴拿马Kevin_2026-4_Celeste4_CommercialInvoice_20260610_v1.xlsx",
    "巴拿马Kevin_2026-4_Celeste4_CommercialInvoice_20260610_v2.xlsx",
  ]);

  assert.equal(result, "v3");
});

test("getNextVersion returns v1 when no files exist", () => {
  assert.equal(getNextVersion([]), "v1");
});

test("buildZipPath creates archive structure without desktop root", () => {
  const result = buildZipPath({
    base_path: "桌面 / MacBook Air / OneNote",
    customer_alias: "巴拿马Kevin",
    archive_year: 2026,
    archive_order_no: 4,
    file_name: "xxx.pdf",
  });

  assert.equal(result, "MacBook Air/OneNote/巴拿马Kevin/2026-4/xxx.pdf");
});

test("illegal filename characters are cleaned and project fallback works", () => {
  const result = buildExportFileName({
    customer_alias: "巴拿马:Kevin?",
    archive_year: 2026,
    archive_order_no: 4,
    project: "",
    document_type: "PI",
    date: "20260610",
    version: 2,
    ext: "pdf",
  });

  assert.equal(result, "巴拿马Kevin_2026-4_Project_PI_20260610_v2.pdf");
  assert.equal(normalizeArchiveSegment(" A/B:C*D? "), "ABCD");
});
