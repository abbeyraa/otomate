import { findElementByTextOrSelector } from "./elementFinder";
import { waitForIndicator } from "./indicators";

/**
 * Performs a sequence of navigation steps to reach the target page.
 * Supports click, navigate, and wait step types.
 *
 * @param {Page} page - Playwright page object.
 * @param {Array} navigationSteps - Array of navigation step configurations.
 * @param {Object} navigationSteps[].type - Step type: "click", "navigate", or "wait".
 * @param {string} navigationSteps[].target - Target element text/selector (for click) or URL (for navigate).
 * @param {Object} navigationSteps[].waitFor - Optional indicator to wait for after click.
 * @param {number} navigationSteps[].duration - Wait duration in seconds (for wait type).
 * @throws {Error} If a click target cannot be found.
 */
export async function performNavigation(page, navigationSteps) {
  for (const step of navigationSteps) {
    if (step.type === "click") {
      // === Execute click navigation step ===
      const element = await findElementByTextOrSelector(page, step.target);
      if (!element) {
        throw new Error(`Navigation click target not found: ${step.target}`);
      }
      await element.click();
      
      // === Wait for indicator if specified ===
      if (step.waitFor) {
        await waitForIndicator(page, step.waitFor);
      }
    } else if (step.type === "navigate") {
      // === Execute direct navigation step ===
      await page.goto(step.target, { waitUntil: "networkidle" });
    } else if (step.type === "wait") {
      // === Execute wait step ===
      await page.waitForTimeout((step.duration || 1) * 1000);
    }
  }
}
