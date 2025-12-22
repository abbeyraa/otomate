import { humanType } from "./humanType";
import { findElementByLabel } from "./elementFinder";
import { clickByTextOrSelector } from "./clickHandler";
import { waitForIndicator, checkIndicator } from "./indicators";
import { waitForPageReady } from "./indicators";
import { installDialogAutoAcceptIfNeeded } from "./dialog";

/**
 * Execute a single action
 * @param {Page} page - Playwright page object
 * @param {Object} action - Action configuration
 * @param {Object} plan - Automation plan
 * @param {Object} rowData - Row data untuk fill action
 * @returns {Promise<Object>} Action result
 */
export async function executeAction(page, action, plan, rowData) {
  try {
    switch (action.type) {
      case "fill": {
        const fieldMapping = plan.fieldMappings.find(
          (fm) => fm.name === action.target
        );
        if (!fieldMapping) {
          throw new Error(`Field mapping not found: ${action.target}`);
        }

        // Ambil nilai dari data atau value action
        const value =
          action.value !== undefined && action.value !== null
            ? action.value
            : rowData[fieldMapping.dataKey] || "";

        // Cari elemen berdasarkan label
        const element = await findElementByLabel(
          page,
          fieldMapping.labels,
          fieldMapping.fallbackLabels || [],
          fieldMapping.type
        );

        if (!element) {
          throw new Error(
            `Element not found for field: ${
              fieldMapping.name
            } with labels: ${fieldMapping.labels.join(", ")}`
          );
        }

        // Isi berdasarkan tipe
        if (fieldMapping.type === "checkbox" || fieldMapping.type === "radio") {
          if (value) {
            await element.check();
          } else {
            await element.uncheck();
          }
        } else if (fieldMapping.type === "select") {
          await element.selectOption(value);
        } else {
          // Gunakan human typing untuk input text/textarea
          await humanType(element, String(value));
        }

        return { type: action.type, target: action.target, success: true };
      }

      case "click": {
        await clickByTextOrSelector(page, action.target);
        return { type: action.type, target: action.target, success: true };
      }

      case "wait": {
        const duration = action.value || 1;
        await page.waitForTimeout(duration * 1000);
        return { type: action.type, success: true };
      }

      case "handleDialog": {
        // Backward-compatible: action ini mengaktifkan auto-accept dialog.
        // Namun handler idealnya sudah dipasang dari awal sebelum click terjadi.
        installDialogAutoAcceptIfNeeded(page, plan, true);
        return { type: action.type, success: true };
      }

      case "navigate": {
        if (action.target) {
          await page.goto(action.target, { waitUntil: "networkidle" });
        } else {
          // Kembali ke halaman target awal
          await page.goto(plan.target.url, { waitUntil: "networkidle" });
          await waitForPageReady(page, plan.target.pageReadyIndicator);
        }
        return {
          type: action.type,
          target: action.target || plan.target.url,
          success: true,
        };
      }

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  } catch (error) {
    return {
      type: action.type,
      target: action.target,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Execute actions for a single row of data
 * @param {Page} page - Playwright page object
 * @param {Object} plan - Automation plan
 * @param {Object} rowData - Row data
 * @param {number} rowIndex - Row index
 * @param {string} targetUrl - Target URL
 * @returns {Promise<Object>} Execution result
 */
export async function executeActionsForRow(page, plan, rowData, rowIndex, targetUrl) {
  const actionResults = [];
  const startTime = Date.now();
  const warnings = [];

  try {
    // Pastikan kita di halaman target
    const currentUrl = page.url();
    if (!currentUrl.includes(new URL(targetUrl).pathname)) {
      await page.goto(targetUrl, { waitUntil: "networkidle" });
      await waitForPageReady(page, plan.target.pageReadyIndicator);
    }

    // Eksekusi setiap action
    for (const action of plan.actions) {
      const actionResult = await executeAction(page, action, plan, rowData);
      actionResults.push(actionResult);

      // Jika action gagal, bisa stop atau continue
      if (!actionResult.success && action.required !== false) {
        throw new Error(`Action failed: ${action.type} -> ${action.target}`);
      }

      // Wait for jika ada
      if (action.waitFor) {
        await waitForIndicator(page, action.waitFor);
      }
    }

    // Check success indicator
    const success =
      plan.successIndicator?.type && plan.successIndicator?.value
        ? await checkIndicator(page, plan.successIndicator)
        : null;
    const failure =
      plan.failureIndicator?.type && plan.failureIndicator?.value
        ? await checkIndicator(page, plan.failureIndicator)
        : false;

    const status = failure
      ? "failed"
      : success === true
      ? "success"
      : actionResults.every((ar) => ar.success) && success !== false
      ? "success"
      : "partial";

    return {
      rowIndex,
      status,
      data: rowData,
      actions: actionResults,
      warnings,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      rowIndex,
      status: "failed",
      data: rowData,
      actions: actionResults,
      error: error.message,
      warnings,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Execute actions with loop mode
 * @param {Page} page - Playwright page object
 * @param {Object} plan - Automation plan
 * @param {Object} rowData - Row data
 * @param {string} targetUrl - Target URL
 * @returns {Promise<Array>} Array of execution results
 */
export async function executeActionsWithLoop(page, plan, rowData, targetUrl) {
  const loop = plan.execution?.loop || {};
  const maxIterations = Number(loop.maxIterations ?? 50);
  const delaySeconds = Number(loop.delaySeconds ?? 0);
  const stopWhen = loop.stopWhen === "visible" ? "visible" : "notVisible";
  const indicator = loop.indicator;

  if (!indicator?.type || !indicator?.value) {
    throw new Error(
      "Mode loop membutuhkan execution.loop.indicator (type & value)."
    );
  }

  const iterations = [];

  for (let i = 0; i < maxIterations; i++) {
    const indicatorState = await checkIndicator(page, indicator);
    const shouldStop =
      stopWhen === "visible"
        ? indicatorState === true
        : indicatorState === false;

    if (shouldStop) {
      if (i === 0) {
        iterations.push({
          rowIndex: 0,
          status: "success",
          data: rowData,
          actions: [],
          warnings: [
            "Loop berhenti sebelum iterasi pertama (kondisi stop sudah terpenuhi).",
          ],
          duration: 0,
        });
      }
      break;
    }

    const result = await executeActionsForRow(
      page,
      plan,
      rowData,
      i,
      targetUrl
    );
    iterations.push(result);

    // Jika ada failure indicator dan terdeteksi, stop segera
    if (plan.failureIndicator) {
      const failureDetected = await checkIndicator(page, plan.failureIndicator);
      if (failureDetected) break;
    }

    if (delaySeconds > 0) {
      await page.waitForTimeout(delaySeconds * 1000);
    }
  }

  return iterations;
}
