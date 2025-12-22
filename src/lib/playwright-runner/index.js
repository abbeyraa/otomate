// Main entry point untuk Playwright runner
// Catatan: File ini harus dijalankan di server-side (Node.js), tidak bisa di browser

import { loadPlaywright } from "./loader";
import { normalizePlan } from "./normalize";
import { performLogin } from "./login";
import { performNavigation } from "./navigation";
import { executeActionsForRow, executeActionsWithLoop } from "./actions";
import { waitForPageReady, checkIndicator } from "./indicators";
import { installDialogAutoAcceptIfNeeded } from "./dialog";

/**
 * Eksekusi Automation Plan menggunakan Playwright
 * @param {Object} plan - Automation plan dari UI
 * @returns {Promise<Object>} Execution report
 */
export async function executeAutomationPlan(plan) {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const normalizedPlan = normalizePlan(plan);
  const results = [];
  const startTime = Date.now();

  try {
    // Jika flow mengandung handleDialog, pasang handler dari awal agar dialog
    // yang muncul saat click tidak membuat aksi terlihat "tidak jalan".
    installDialogAutoAcceptIfNeeded(page, normalizedPlan);

    // Step 1: Login jika diperlukan
    if (normalizedPlan.target.login) {
      await performLogin(page, normalizedPlan.target.login);
    }

    // Step 2: Navigation ke halaman target
    if (
      normalizedPlan.target.navigation &&
      normalizedPlan.target.navigation.length > 0
    ) {
      await performNavigation(page, normalizedPlan.target.navigation);
    }

    // Step 3: Navigate ke target URL dan tunggu page ready
    await page.goto(normalizedPlan.target.url, { waitUntil: "networkidle" });
    await waitForPageReady(page, normalizedPlan.target.pageReadyIndicator);

    // Step 4: Eksekusi berdasarkan mode
    if (normalizedPlan.dataSource.mode === "batch") {
      // Batch mode: loop untuk setiap baris data
      for (let i = 0; i < normalizedPlan.dataSource.rows.length; i++) {
        const rowData = normalizedPlan.dataSource.rows[i];
        const result = await executeActionsForRow(
          page,
          normalizedPlan,
          rowData,
          i,
          normalizedPlan.target.url
        );
        results.push(result);

        // Jika gagal dan ada failure indicator, stop atau continue sesuai kebutuhan
        if (result.status === "failed" && normalizedPlan.failureIndicator) {
          const failureDetected = await checkIndicator(
            page,
            normalizedPlan.failureIndicator
          );
          if (failureDetected) {
            break; // Stop jika failure indicator terdeteksi
          }
        }
      }
    } else {
      // Single mode: hanya eksekusi untuk satu baris
      const rowIndex =
        normalizedPlan.dataSource.selectedRowIndex !== undefined
          ? normalizedPlan.dataSource.selectedRowIndex
          : 0;
      const rowData = normalizedPlan.dataSource.rows[rowIndex] || {};

      if (normalizedPlan.execution?.mode === "loop") {
        const loopResults = await executeActionsWithLoop(
          page,
          normalizedPlan,
          rowData,
          normalizedPlan.target.url
        );
        results.push(...loopResults);
      } else {
        const result = await executeActionsForRow(
          page,
          normalizedPlan,
          rowData,
          rowIndex,
          normalizedPlan.target.url
        );
        results.push(result);
      }
    }

    // Step 5: Generate summary
    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      partial: results.filter((r) => r.status === "partial").length,
    };

    const duration = Date.now() - startTime;

    return {
      status:
        summary.failed === 0
          ? "success"
          : summary.success > 0
          ? "partial"
          : "failed",
      summary,
      results,
      duration,
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
      results,
      duration: Date.now() - startTime,
    };
  } finally {
    await browser.close();
  }
}
