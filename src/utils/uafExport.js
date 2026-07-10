const LIMITS = {
  subjectMax: 200,
  contentMax: 2000,
  tagMax: 50,
  tagCountMax: 20,
};

export class UafExportValidationError extends Error {
  constructor(issues) {
    super(issues.join("；"));
    this.name = "UafExportValidationError";
    this.issues = issues;
  }
}

export function normalizeUafDate(value) {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  throw new UafExportValidationError([`日期 ${value || "(空)"} 不是有效的 YYYYMMDD 或 YYYY-MM-DD 格式`]);
}

export function createUafDocument(items, dateValue) {
  const date = normalizeUafDate(dateValue);
  const assignments = items
    .filter((item) => item && (item.type === "homework" || item.type === "custom"))
    .filter((item) => typeof item.content === "string" && item.content.trim().length > 0)
    .map((item) => ({
      subject: String(item.name || "").trim(),
      date,
      content: item.content,
      tags: [],
    }));

  if (assignments.length === 0) {
    throw new UafExportValidationError(["当前日期没有可导出的作业"]);
  }

  const issues = [];
  assignments.forEach((assignment, index) => {
    const label = assignment.subject || `第 ${index + 1} 张卡片`;
    if (!assignment.subject) issues.push(`${label}：科目名称不能为空`);
    if (assignment.subject.length > LIMITS.subjectMax) {
      issues.push(`${label}：科目名称超过 ${LIMITS.subjectMax} 个字符`);
    }
    if (!assignment.content) issues.push(`${label}：正文不能为空`);
    if (assignment.content.length > LIMITS.contentMax) {
      issues.push(`${label}：正文超过 ${LIMITS.contentMax} 个字符`);
    }
    if (assignment.tags.length > LIMITS.tagCountMax) {
      issues.push(`${label}：标签超过 ${LIMITS.tagCountMax} 个`);
    }
    for (const tag of assignment.tags) {
      if (!tag || tag.length > LIMITS.tagMax || tag.includes(";")) {
        issues.push(`${label}：包含无效标签`);
        break;
      }
    }
  });
  if (issues.length > 0) throw new UafExportValidationError(issues);
  return assignments;
}

export function hasExportableHomework(items) {
  return items.some(
    (item) =>
      item &&
      (item.type === "homework" || item.type === "custom") &&
      typeof item.content === "string" &&
      item.content.trim().length > 0,
  );
}

export async function downloadUafDocument(items, dateValue) {
  const assignments = createUafDocument(items, dateValue);
  const { createUafPdf } = await import("../vendor/uaf/browser.js");
  const base = import.meta.env.BASE_URL || "/";
  const fontUrl = new URL(`${base}uaf/NotoSansSC-Regular.otf`, window.location.origin);
  const wasmUrl = new URL(`${base}uaf/hb-subset.wasm`, window.location.origin);
  const pdfBytes = await createUafPdf(assignments, { fontUrl, wasmUrl });
  const blob = new window.Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = normalizeUafDate(dateValue);
  link.href = url;
  link.download = `Classworks-作业-${date}.uaf.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return link.download;
}
