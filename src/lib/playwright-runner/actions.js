import { humanType } from "./humanType";
import { findElementByLabel } from "./elementFinder";
import { clickByTextOrSelector } from "./clickHandler";
import { waitForIndicator, checkIndicator } from "./indicators";
import { waitForPageReady } from "./indicators";
import { installDialogAutoAcceptIfNeeded } from "./dialog";

/**
 * Executes a single automation action based on its type.
 * Supports fill, click, wait, handleDialog, and navigate action types.
 *
 * @param {Page} page - Playwright page object.
 * @param {Object} action - Action configuration object.
 * @param {string} action.type - Type of action to execute.
 * @param {string} action.target - Target element or URL for the action.
 * @param {*} action.value - Optional value for fill/wait actions.
 * @param {Object} plan - Complete automation plan configuration.
 * @param {Object} rowData - Row data for fill actions (field mapping).
 * @returns {Promise<Object>} Action execution result with success status.
 */
export async function executeAction(page, action, plan, rowData) {
  try {
    switch (action.type) {
      case "fill": {
        // === Find field mapping configuration ===
        const fieldMapping = plan.fieldMappings.find(
          (fm) => fm.name === action.target
        );
        if (!fieldMapping) {
          throw new Error(`Field mapping not found: ${action.target}`);
        }

        // === Extract value from action or row data ===
        const value =
          action.value !== undefined && action.value !== null
            ? action.value
            : rowData[fieldMapping.dataKey] || "";

        // === Locate element using label-based search ===
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

        // === Fill element based on field type ===
        if (fieldMapping.type === "checkbox" || fieldMapping.type === "radio") {
          if (value) {
            await element.check();
          } else {
            await element.uncheck();
          }
        } else if (fieldMapping.type === "select") {
          await element.selectOption(value);
        } else {
          // === Use human typing for text/textarea inputs ===
          await humanType(element, String(value));
        }

        return { type: action.type, target: action.target, success: true };
      }

      case "click": {
        // === Execute click action on target element ===
        await clickByTextOrSelector(page, action.target);
        return { type: action.type, target: action.target, success: true };
      }

      case "wait": {
        // === Execute wait action with specified duration ===
        const duration = action.value || 1;
        await page.waitForTimeout(duration * 1000);
        return { type: action.type, success: true };
      }

      case "handleDialog": {
        // === Install dialog auto-accept handler ===
        // Note: Backward-compatible action. Handler should ideally be installed
        // at the start before any clicks occur, but this allows explicit activation.
        installDialogAutoAcceptIfNeeded(page, plan, true);
        return { type: action.type, success: true };
      }

      case "navigate": {
        // === Execute navigation action ===
        if (action.target) {
          // === Navigate to specified URL ===
          await page.goto(action.target, { waitUntil: "networkidle" });
        } else {
          // === Navigate back to initial target URL ===
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
    // === Return error result if action execution fails ===
    return {
      type: action.type,
      target: action.target,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Executes all actions in the automation plan for a single row of data.
 * Ensures the page is on the target URL before execution and evaluates
 * success/failure indicators after completion.
 *
 * @param {Page} page - Playwright page object.
 * @param {Object} plan - Complete automation plan configuration.
 * @param {Object} rowData - Data row to use for fill actions.
 * @param {number} rowIndex - Index of the current row being processed.
 * @param {string} targetUrl - Target URL to ensure we're on the correct page.
 * @returns {Promise<Object>} Execution result with status, actions, and metadata.
 */
export async function executeActionsForRow(
  page,
  plan,
  rowData,
  rowIndex,
  targetUrl
) {
  const actionResults = [];
  const startTime = Date.now();
  const warnings = [];

  try {
    // === Ensure we're on the target page ===
    const currentUrl = page.url();
    if (!currentUrl.includes(new URL(targetUrl).pathname)) {
      await page.goto(targetUrl, { waitUntil: "networkidle" });
      await waitForPageReady(page, plan.target.pageReadyIndicator);
    }

    // === Execute each action in sequence ===
    for (const action of plan.actions) {
      const actionResult = await executeAction(page, action, plan, rowData);
      actionResults.push(actionResult);

      // === Stop execution if required action fails ===
      if (!actionResult.success && action.required !== false) {
        throw new Error(`Action failed: ${action.type} -> ${action.target}`);
      }

      // === Wait for indicator if specified ===
      if (action.waitFor) {
        await waitForIndicator(page, action.waitFor);
      }
    }

    // === Evaluate success and failure indicators ===
    const success =
      plan.successIndicator?.type && plan.successIndicator?.value
        ? await checkIndicator(page, plan.successIndicator)
        : null;
    const failure =
      plan.failureIndicator?.type && plan.failureIndicator?.value
        ? await checkIndicator(page, plan.failureIndicator)
        : false;

    // === Determine final execution status ===
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
    // === Return failed result with error details ===
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
 * Executes actions in loop mode until a stop condition is met.
 * Continues iterating until the indicator condition is satisfied or max iterations reached.
 *
 * @param {Page} page - Playwright page object.
 * @param {Object} plan - Complete automation plan configuration.
 * @param {Object} rowData - Data row to use for fill actions.
 * @param {string} targetUrl - Target URL to ensure we're on the correct page.
 * @returns {Promise<Array>} Array of execution results for each iteration.
 * @throws {Error} If loop indicator configuration is missing.
 */
export async function executeActionsWithLoop(page, plan, rowData, targetUrl) {
  // === Extract loop configuration with defaults ===
  const loop = plan.execution?.loop || {};
  const maxIterations = Number(loop.maxIterations ?? 50);
  const delaySeconds = Number(loop.delaySeconds ?? 0);
  const stopWhen = loop.stopWhen === "visible" ? "visible" : "notVisible";
  const indicator = loop.indicator;

  // === Validate loop indicator configuration ===
  if (!indicator?.type || !indicator?.value) {
    throw new Error(
      "Mode loop membutuhkan execution.loop.indicator (type & value)."
    );
  }

  const iterations = [];

  // === Execute loop until stop condition or max iterations ===
  for (let i = 0; i < maxIterations; i++) {
    // === Check indicator state to determine if loop should stop ===
    const indicatorState = await checkIndicator(page, indicator);
    const shouldStop =
      stopWhen === "visible"
        ? indicatorState === true
        : indicatorState === false;

    if (shouldStop) {
      // === Handle case where stop condition is met before first iteration ===
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

    // === Execute actions for current iteration ===
    const result = await executeActionsForRow(
      page,
      plan,
      rowData,
      i,
      targetUrl
    );
    iterations.push(result);

    // === Check for failure indicator and abort if detected ===
    if (plan.failureIndicator) {
      const failureDetected = await checkIndicator(page, plan.failureIndicator);
      if (failureDetected) break;
    }

    // === Apply delay between iterations if configured ===
    if (delaySeconds > 0) {
      await page.waitForTimeout(delaySeconds * 1000);
    }
  }

  return iterations;
}
