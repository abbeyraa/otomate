import { escapeForCssString, escapeForRegex } from "./utils";
import { getClickableLocator } from "./clickHandler";

/**
 * Find element by label (text atau associated label)
 * @param {Page} page - Playwright page object
 * @param {Array} labels - Array of labels to search
 * @param {Array} fallbackLabels - Array of fallback labels
 * @param {string} fieldType - Type of field (text, select, checkbox, etc.)
 * @returns {Promise<Locator|null>} Element locator or null
 */
export async function findElementByLabel(page, labels, fallbackLabels, fieldType) {
  // Coba label utama dulu
  for (const label of labels) {
    if (!label) continue;

    // Cari dengan berbagai strategi
    const strategies = [
      // Label element dengan for attribute
      `label:has-text("${label}")`,
      // Input dengan placeholder
      `input[placeholder*="${label}"]`,
      `textarea[placeholder*="${label}"]`,
      // Input dengan name/id yang mirip
      `input[name*="${label.toLowerCase().replace(/\s+/g, "_")}"]`,
      // Textarea dengan name/id yang mirip
      `textarea[name*="${label.toLowerCase().replace(/\s+/g, "_")}"]`,
      // Select dengan name/id yang mirip
      `select[name*="${label.toLowerCase().replace(/\s+/g, "_")}"]`,
    ];

    for (const strategy of strategies) {
      try {
        const element = page.locator(strategy).first();
        if (await element.isVisible({ timeout: 1000 })) {
          // Jika label, ambil input yang terkait
          if (strategy.startsWith("label:")) {
            const forAttr = await element.getAttribute("for");
            if (forAttr) {
              return page.locator(`#${forAttr}`).first();
            }
            // Jika tidak ada for, cari input berikutnya
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

  // Coba fallback labels
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
 * Find element by text or selector
 * @param {Page} page - Playwright page object
 * @param {string} target - Text or selector to find
 * @returns {Promise<Locator|null>} Element locator or null
 */
export async function findElementByTextOrSelector(page, target) {
  return await getClickableLocator(page, target);
}
