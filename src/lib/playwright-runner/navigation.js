import { findElementByTextOrSelector } from "./elementFinder";
import { waitForIndicator } from "./indicators";

/**
 * Perform navigation steps
 * @param {Page} page - Playwright page object
 * @param {Array} navigationSteps - Array of navigation steps
 */
export async function performNavigation(page, navigationSteps) {
  for (const step of navigationSteps) {
    if (step.type === "click") {
      const element = await findElementByTextOrSelector(page, step.target);
      if (!element) {
        throw new Error(`Navigation click target not found: ${step.target}`);
      }
      await element.click();
      if (step.waitFor) {
        await waitForIndicator(page, step.waitFor);
      }
    } else if (step.type === "navigate") {
      await page.goto(step.target, { waitUntil: "networkidle" });
    } else if (step.type === "wait") {
      await page.waitForTimeout((step.duration || 1) * 1000);
    }
  }
}
