import { humanType } from "./humanType";

/**
 * Perform login
 * @param {Page} page - Playwright page object
 * @param {Object} loginConfig - Login configuration
 */
export async function performLogin(page, loginConfig) {
  await page.goto(loginConfig.url, { waitUntil: "networkidle" });

  // Cari field username dan password berdasarkan label atau selector umum
  const usernameSelectors = [
    'input[name="username"]',
    'input[name="email"]',
    'input[type="text"]',
    'input[type="email"]',
    "input#username",
    "input#email",
  ];

  const passwordSelectors = [
    'input[name="password"]',
    'input[type="password"]',
    "input#password",
  ];

  // Coba isi username
  let usernameFilled = false;
  for (const selector of usernameSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        await humanType(element, loginConfig.username);
        usernameFilled = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!usernameFilled) {
    throw new Error("Username field not found");
  }

  // Coba isi password
  let passwordFilled = false;
  for (const selector of passwordSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        await humanType(element, loginConfig.password);
        passwordFilled = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!passwordFilled) {
    throw new Error("Password field not found");
  }

  // Cari dan klik tombol submit/login
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'button:has-text("Masuk")',
  ];

  let submitted = false;
  for (const selector of submitSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        submitted = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!submitted) {
    throw new Error("Submit button not found");
  }

  // Tunggu navigasi setelah login
  await page.waitForURL("**", { timeout: 10000 });
}
