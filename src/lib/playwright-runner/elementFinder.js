import { escapeForCssString, escapeForRegex } from "./utils";
import { getClickableLocator } from "./clickHandler";

/**
 * Finds a form element by its associated label text using multiple search strategies.
 * Attempts various selector patterns to locate input, textarea, or select elements.
 *
 * @param {Page} page - Playwright page object.
 * @param {Array<string>} labels - Primary array of label texts to search for.
 * @param {Array<string>} fallbackLabels - Fallback array of label texts if primary search fails.
 * @param {string} fieldType - Type of field (text, select, checkbox, etc.) - currently unused but reserved.
 * @returns {Promise<Locator|null>} Element locator if found, null otherwise.
 */
export async function findElementByLabel(page, labels, fallbackLabels, fieldType) {
  // === Try primary labels first ===
  for (const label of labels) {
    if (!label) continue;

    // === Define multiple search strategies for label-based element finding ===
    const strategies = [
      // === Strategy 1: Label element with for attribute ===
      `label:has-text("${label}")`,
      // === Strategy 2: Input with placeholder containing label ===
      `input[placeholder*="${label}"]`,
      `textarea[placeholder*="${label}"]`,
      // === Strategy 3: Input with name/id similar to label (normalized) ===
      `input[name*="${label.toLowerCase().replace(/\s+/g, "_")}"]`,
      // === Strategy 4: Textarea with name/id similar to label ===
      `textarea[name*="${label.toLowerCase().replace(/\s+/g, "_")}"]`,
      // === Strategy 5: Select with name/id similar to label ===
      `select[name*="${label.toLowerCase().replace(/\s+/g, "_")}"]`,
    ];

    // === Try each strategy until one succeeds ===
    for (const strategy of strategies) {
      try {
        const element = page.locator(strategy).first();
        if (await element.isVisible({ timeout: 1000 })) {
          // === If found via label selector, get associated input element ===
          if (strategy.startsWith("label:")) {
            const forAttr = await element.getAttribute("for");
            if (forAttr) {
              return page.locator(`#${forAttr}`).first();
            }
            // === If no for attribute, find input in parent context ===
            return element
              .locator("..")
              .locator("input, textarea, select")
              .first();
          }
          return element;
        }
      } catch (e) {
        continue;
      }
    }
  }

  // === Try fallback labels if primary search failed ===
  for (const label of fallbackLabels) {
    if (!label) continue;
    const element = await findElementByTextOrSelector(page, label);
    if (element && (await element.isVisible({ timeout: 1000 }))) {
      return element;
    }
  }

  return null;
}

/**
 * Finds an element by text content or CSS selector.
 * Delegates to the clickable locator finder which handles both cases.
 *
 * @param {Page} page - Playwright page object.
 * @param {string} target - Text content or CSS selector to find.
 * @returns {Promise<Locator|null>} Element locator if found, null otherwise.
 */
export async function findElementByTextOrSelector(page, target) {
  return await getClickableLocator(page, target);
}
