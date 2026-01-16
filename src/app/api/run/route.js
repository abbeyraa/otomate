import { NextResponse } from "next/server";
import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { getPlaywrightContextOptions } from "../playwright-options.js";
import { readSettings } from "../settings/settingsStorage.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_PATH = path.join(process.cwd(), "data", "inspect-log.json");
const DATA_PATH = path.join(process.cwd(), "files", "data-source.json");

async function writeLog(data) {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  await fs.writeFile(LOG_PATH, JSON.stringify(data, null, 2), "utf-8");
}

const allowedInputKinds = new Set([
  "text",
  "number",
  "date",
  "checkbox",
  "radio",
  "toggle",
  "select",
]);

const toColumnLabel = (index) => {
  let label = "";
  let value = index + 1;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
};

const getSheetColumns = (sheet, hasHeader) => {
  if (!sheet) return [];
  const maxColumns = sheet.maxColumns ?? sheet.columns?.length ?? 0;
  if (hasHeader && sheet.rows?.length) {
    const headerRow = Array.isArray(sheet.rows[0]) ? sheet.rows[0] : [];
    return Array.from({ length: maxColumns }, (_, index) => {
      const raw = headerRow[index];
      const cleaned =
        raw === null || raw === undefined ? "" : String(raw).trim();
      return cleaned || sheet.columns?.[index] || toColumnLabel(index);
    });
  }
  if (sheet.columns?.length) return sheet.columns;
  return Array.from({ length: maxColumns }, (_, index) => toColumnLabel(index));
};

const getSheetRows = (sheet, hasHeader) => {
  if (!sheet?.rows?.length) return [];
  return hasHeader ? sheet.rows.slice(1) : sheet.rows;
};

const buildHeaderIndex = (headers) => {
  const index = new Map();
  headers.forEach((header, idx) => {
    const key = String(header || "").trim();
    if (key && !index.has(key)) {
      index.set(key, idx);
    }
  });
  return index;
};

const normalizeRowValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const resolveStepWithData = (step, row, headerIndex) => {
  if (!step || step.type !== "Input") return step;
  const key = String(step.value || "").trim();
  if (!key || !headerIndex?.has(key)) return step;
  const rowValues = Array.isArray(row) ? row : [];
  const columnIndex = headerIndex.get(key);
  const resolvedValue = normalizeRowValue(rowValues[columnIndex]);
  return { ...step, value: resolvedValue };
};

async function loadDataSource() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function resolveLocator(page, step, timeoutMs) {
  const label = step.label?.trim();
  const scopeSelector = step.scopeSelector?.trim();
  const inputKind = step.inputKind || "text";
  let scope = page;
  const radioLabel =
    inputKind === "radio" && step.value?.trim() ? step.value.trim() : label;

  if (scopeSelector) {
    const scoped = page.locator(scopeSelector).first();
    try {
      await scoped.waitFor({ state: "visible", timeout: timeoutMs });
    } catch {
      throw new Error(`Scope selector not found: ${scopeSelector}`);
    }
    scope = scoped;
  }

  const candidates = [];
  if (step.type === "Input" && inputKind === "radio" && radioLabel) {
    const escaped = radioLabel.replace(/["\\]/g, "\\$&");
    candidates.push(scope.locator(`input[type="radio"][value="${escaped}"]`));
    candidates.push(scope.locator(`label:has-text("${escaped}")`));
  }

  if (radioLabel || label) {
    const effectiveLabel = radioLabel || label;
    if (step.type === "Click") {
      candidates.push(scope.getByRole("button", { name: effectiveLabel }));
      candidates.push(scope.getByRole("link", { name: effectiveLabel }));
      candidates.push(scope.getByText(effectiveLabel, { exact: true }));
    }
    if (step.type === "Input") {
      switch (inputKind) {
        case "checkbox":
        case "toggle":
          candidates.push(scope.getByRole("checkbox", { name: effectiveLabel }));
          candidates.push(scope.getByRole("switch", { name: effectiveLabel }));
          candidates.push(scope.getByLabel(effectiveLabel));
          break;
        case "radio":
          candidates.push(scope.getByRole("radio", { name: effectiveLabel }));
          candidates.push(scope.getByLabel(effectiveLabel));
          break;
        case "select":
          candidates.push(scope.getByRole("combobox", { name: effectiveLabel }));
          candidates.push(scope.getByLabel(effectiveLabel));
          break;
        case "number":
          candidates.push(scope.getByRole("spinbutton", { name: effectiveLabel }));
          candidates.push(scope.getByLabel(effectiveLabel));
          candidates.push(scope.getByRole("textbox", { name: effectiveLabel }));
          candidates.push(scope.getByPlaceholder(effectiveLabel));
          break;
        default:
          candidates.push(scope.getByRole("textbox", { name: effectiveLabel }));
          candidates.push(scope.getByLabel(effectiveLabel));
          candidates.push(scope.getByPlaceholder(effectiveLabel));
          break;
      }
    }
  }

  for (const locator of candidates) {
    try {
      const resolved = locator.first();
      await resolved.waitFor({ state: "visible", timeout: timeoutMs });
      return resolved;
    } catch {
      // Try the next locator candidate.
    }
  }

  if (step.type === "Input" && (label || radioLabel)) {
    const escapedLabel = (radioLabel || label).replace(/["\\]/g, "\\$&");
    const labelLocator = scope
      .locator(`label:has-text("${escapedLabel}")`)
      .first();
    try {
      await labelLocator.waitFor({ state: "visible", timeout: timeoutMs });
      const siblingField = labelLocator
        .locator(
          "xpath=following-sibling::input | following-sibling::textarea | following-sibling::select"
        )
        .first();
      await siblingField.waitFor({ state: "visible", timeout: timeoutMs });
      return siblingField;
    } catch {
      try {
        const container = labelLocator.locator("xpath=..");
        const field = container
          .locator("input, textarea, select")
          .first();
        await field.waitFor({ state: "visible", timeout: timeoutMs });
        return field;
      } catch {
        // Fall through to standard error handling.
      }
    }
  }

  if (step.type === "Click") {
    if (!label) {
      throw new Error("Label/Text is required for Click actions");
    }
    throw new Error(
      `Click target not found for label "${label}"${
        scopeSelector ? ` within scope "${scopeSelector}"` : ""
      }`
    );
  }

  if (step.type === "Input" && inputKind === "radio") {
    if (!label && !step.value?.trim()) {
      throw new Error("Radio input requires Label/Text or Value");
    }
  }

  if (step.type === "Input") {
    if (!label) {
      throw new Error("Label/Text is required for Input actions");
    }
    throw new Error(
      `Input target not found for label "${label}"${
        scopeSelector ? ` within scope "${scopeSelector}"` : ""
      }`
    );
  }

  throw new Error("Label/Text is required");
}

function normalizeBooleanValue(value) {
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on", "checked"].includes(normalized)) return true;
  if (["false", "0", "no", "off", "unchecked"].includes(normalized))
    return false;
  return null;
}

function formatDateValue(raw, format) {
  if (!format) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const yyyy = String(parsed.getFullYear());
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return format
    .replace(/YYYY/g, yyyy)
    .replace(/MM/g, mm)
    .replace(/DD/g, dd);
}

async function waitForNavigationOrPopup(page, timeoutMs) {
  const navigationPromise = page
    .waitForNavigation({ timeout: timeoutMs, waitUntil: "domcontentloaded" })
    .then(() => "navigation")
    .catch(() => null);
  const popupPromise = page
    .waitForEvent("popup", { timeout: timeoutMs })
    .then(() => "popup")
    .catch(() => null);
  const timeoutPromise = new Promise((resolve) =>
    setTimeout(() => resolve(null), timeoutMs)
  );
  return Promise.race([navigationPromise, popupPromise, timeoutPromise]);
}

async function waitForPageIdle(page, timeoutMs) {
  try {
    await page.waitForLoadState("networkidle", { timeout: timeoutMs });
  } catch {
    // Ignore idle timeout to avoid blocking runs indefinitely.
  }
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const targetUrl = payload.targetUrl?.trim() || "";
  const groups = Array.isArray(payload.groups) ? payload.groups : [];
  const firstStep = groups.find((group) => group?.steps?.length)?.steps?.[0];
  const shouldAutoNavigate = Boolean(targetUrl) && firstStep?.type !== "Navigate";
  const settings = await readSettings();
  const maxTimeoutMs = Number.parseInt(settings.maxTimeoutMs, 10) || 5000;
  const idleTimeoutMs = maxTimeoutMs;
  const storedData = await loadDataSource();
  const hasHeader = Boolean(storedData?.hasHeader);
  const activeSheet = storedData?.sheets?.[0] || null;
  const dataHeaders = getSheetColumns(activeSheet, hasHeader);
  const dataRows = getSheetRows(activeSheet, hasHeader);
  const headerIndex = buildHeaderIndex(dataHeaders);

  const report = {
    type: "run",
    startedAt: new Date().toISOString(),
    endedAt: null,
    targetUrl,
    status: "running",
    error: null,
    steps: [],
  };

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(getPlaywrightContextOptions(settings));
  const page = await context.newPage();
  await page.bringToFront();

  try {
    if (shouldAutoNavigate) {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
      await page.bringToFront();
      report.steps.push({
        group: "system",
        step: "Target URL",
        action: "Navigate",
        status: "success",
        ts: new Date().toISOString(),
      });
    }

    for (const group of groups) {
      const steps = Array.isArray(group.steps) ? group.steps : [];
      const useData =
        group?.repeat?.enabled &&
        group?.repeat?.mode === "data" &&
        group?.repeat?.useData !== false &&
        dataRows.length > 0;
      const repeatCount = Number.parseInt(group?.repeat?.count, 10);
      const maxIterations = useData
        ? Number.isFinite(repeatCount)
          ? Math.min(repeatCount, dataRows.length)
          : dataRows.length
        : 1;

      for (let iteration = 0; iteration < maxIterations; iteration += 1) {
        const row = useData ? dataRows[iteration] : null;
        for (const step of steps) {
          const stepReport = {
            group: group.name || group.id || "Group",
            step: step.title || step.id || "Step",
            action: step.type || "Unknown",
            status: "pending",
            ts: new Date().toISOString(),
          };

          try {
            const resolvedStep = useData
              ? resolveStepWithData(step, row, headerIndex)
              : step;
            if (!resolvedStep?.type) {
              throw new Error("Action type is required");
            }
            if (
              resolvedStep.type === "Input" &&
              !allowedInputKinds.has(resolvedStep.inputKind || "text")
            ) {
              throw new Error("Input kind is invalid");
            }
            switch (resolvedStep.type) {
              case "Click":
                {
                  const locator = await resolveLocator(
                    page,
                    resolvedStep,
                    maxTimeoutMs
                  );
                  await locator.click({ timeout: maxTimeoutMs });
                  await waitForNavigationOrPopup(page, idleTimeoutMs);
                  await waitForPageIdle(page, idleTimeoutMs);
                }
                break;
              case "Input":
                {
                  const locator = await resolveLocator(
                    page,
                    resolvedStep,
                    maxTimeoutMs
                  );
                  await locator.waitFor({
                    state: "visible",
                    timeout: maxTimeoutMs,
                  });
                  const inputKind = resolvedStep.inputKind || "text";
                  const rawValue = resolvedStep.value || "";
                  if (inputKind === "number" && !rawValue) {
                    throw new Error("Number value is required");
                  }
                  if (inputKind === "date" && !rawValue) {
                    throw new Error("Date value is required");
                  }
                  if (inputKind === "checkbox" || inputKind === "toggle") {
                    const desired = normalizeBooleanValue(rawValue);
                    if (desired === null) {
                      throw new Error("Checkbox value must be true or false");
                    }
                    if (desired) {
                      await locator.check({ timeout: maxTimeoutMs });
                    } else {
                      await locator.uncheck({ timeout: maxTimeoutMs });
                    }
                    break;
                  }

                  if (inputKind === "select") {
                    if (!rawValue) {
                      throw new Error("Option value is required");
                    }
                    await locator.selectOption({ value: rawValue });
                    break;
                  }

                  if (inputKind === "radio") {
                    await locator.click({ timeout: maxTimeoutMs });
                    break;
                  }

                  const finalValue =
                    inputKind === "date"
                      ? formatDateValue(rawValue, resolvedStep.dateFormat)
                      : rawValue;
                  await locator.click({ timeout: maxTimeoutMs });
                  await locator.press("Control+A");
                  await locator.press("Backspace");
                  await locator.pressSequentially(finalValue, { delay: 100 });
                  await waitForPageIdle(page, idleTimeoutMs);
                }
                break;
              case "Wait":
                {
                  const ms = Number.parseInt(resolvedStep.waitMs, 10) || 1000;
                  await page.waitForTimeout(ms);
                  await waitForPageIdle(page, idleTimeoutMs);
                }
                break;
              case "Navigate":
                if (!resolvedStep.url) throw new Error("URL is required");
                {
                  await page.goto(resolvedStep.url, {
                    waitUntil: "domcontentloaded",
                    timeout: maxTimeoutMs,
                  });
                  await waitForPageIdle(page, idleTimeoutMs);
                }
                break;
              default:
                throw new Error("Unsupported action type");
            }

            stepReport.status = "success";
          } catch (error) {
            const contextLabel = `${stepReport.group} / ${stepReport.step}`;
            const message = `${contextLabel}: ${error.message}`;
            stepReport.status = "failed";
            stepReport.error = message;
            report.steps.push(stepReport);
            report.status = "failed";
            report.error = {
              message,
              group: stepReport.group,
              step: stepReport.step,
            };
            throw error;
          }

          report.steps.push(stepReport);
        }
      }
    }

    report.status = "success";
  } catch (error) {
    report.status = report.status === "failed" ? report.status : "failed";
  } finally {
    report.endedAt = new Date().toISOString();
    await writeLog(report);
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  if (report.status !== "success") {
    return NextResponse.json(
      { success: false, error: report.error?.message || "Run failed", report },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, report });
}
