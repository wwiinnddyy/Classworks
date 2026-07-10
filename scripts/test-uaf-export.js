import assert from "node:assert/strict";
import { createUafDocument, hasExportableHomework, normalizeUafDate, UafExportValidationError } from "../src/utils/uafExport.js";

const items = [
  { type: "exam", name: "考试安排", content: "ignored" },
  { type: "homework", name: "数学", content: "完成第 1、2 题" },
  { type: "time", name: "时间" },
  { type: "custom", name: "班级任务", content: "整理讲台" },
];

assert.equal(normalizeUafDate("20260711"), "2026-07-11");
assert.equal(hasExportableHomework(items), true);
assert.deepEqual(createUafDocument(items, "20260711"), [
  { subject: "数学", date: "2026-07-11", content: "完成第 1、2 题", tags: [] },
  { subject: "班级任务", date: "2026-07-11", content: "整理讲台", tags: [] },
]);
assert.throws(() => createUafDocument([], "20260711"), UafExportValidationError);
assert.throws(
  () => createUafDocument([{ type: "homework", name: "数学", content: "x".repeat(2001) }], "20260711"),
  /2000/,
);
console.log("Classworks UAF export mapping tests passed.");
