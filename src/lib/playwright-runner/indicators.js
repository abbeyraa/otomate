/**
 * Wait for page ready indicator
 * @param {Page} page - Playwright page object
 * @param {Object} indicator - Indicator configuration
 */
export async function waitForPageReady(page, indicator) {
  if (indicator.type === "selector") {
    await page.waitForSelector(indicator.value, { timeout: 30000 });
  } else if (indicator.type === "text") {
    await page.waitForSelector(`text=${indicator.value}`, { timeout: 30000 });
  } else if (indicator.type === "url") {
    await page.waitForURL(`**${indicator.value}**`, { timeout: 30000 });
  }
}

/**
 * Wait for indicator
 * @param {Page} page - Playwright page object
 * @param {Object} indicator - Indicator configuration
 */
export async function waitForIndicator(page, indicator) {
  if (indicator.type === "selector") {
    await page.waitForSelector(indicator.value, { timeout: 10000 });
  } else if (indicator.type === "text") {
    await page.waitForSelector(`text=${indicator.value}`, { timeout: 10000 });
  } else if (indicator.type === "url") {
    await page.waitForURL(`**${indicator.value}**`, { timeout: 10000 });
  }
}

/**
 * Check if indicator exists
 * @param {Page} page - Playwright page object
 * @param {Object} indicator - Indicator configuration
 * @returns {Promise<boolean>} True jika indicator ditemukan
 */
export async function checkIndicator(page, indicator) {
  try {
    if (indicator.type === "selector") {
      const element = await page.locator(indicator.value).first();
      return await element.isVisible({ timeout: 2000 });
    } else if (indicator.type === "text") {
      const element = await page.locator(`text=${indicator.value}`).first();
      return await element.isVisible({ timeout: 2000 });
    } else if (indicator.type === "url") {
      const url = page.url();
      return url.includes(indicator.value);
    }
    return false;
  } catch (e) {
    return false;
  }
}
