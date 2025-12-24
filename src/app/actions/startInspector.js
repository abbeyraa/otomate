"use server";

import { loadPlaywright } from "@/lib/playwright-runner/loader";
import { setupInspectorListeners } from "@/lib/inspectorRecorder";

/**
 * Start inspector session
 * Returns WebSocket URL or polling endpoint for real-time events
 */
export async function startInspector(targetUrl) {
  try {
    const { chromium } = await loadPlaywright();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to target URL
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    // Setup event listeners
    const events = [];
    const stopListener = await setupInspectorListeners(page, (event) => {
      events.push(event);
    });

    return {
      success: true,
      browserId: `browser-${Date.now()}`,
      pageUrl: page.url(),
      message: "Inspector started. Browser is now in observation mode.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

