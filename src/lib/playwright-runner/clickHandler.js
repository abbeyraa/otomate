import { escapeForCssString, escapeForRegex } from "./utils";

/**
 * Get clickable locator untuk element berdasarkan text atau selector
 * @param {Page} page - Playwright page object
 * @param {string} target - Text atau selector
 * @returns {Promise<Locator|null>} Element locator or null
 */
export async function getClickableLocator(page, target) {
  if (!target) return null;
  const t = String(target).trim();
  if (!t) return null;
  const exactTextRe = new RegExp(`^\\s*${escapeForRegex(t)}\\s*$`, "i");
  const containsTextRe = new RegExp(escapeForRegex(t), "i");

  // Helper untuk validasi elemen
  const validateElement = async (locator) => {
    try {
      // Pastikan elemen visible dan enabled
      const isVisible = await locator.isVisible({ timeout: 2000 });
      if (!isVisible) return false;

      // Cek apakah elemen enabled (tidak disabled)
      const isEnabled = await locator
        .isEnabled({ timeout: 1000 })
        .catch(() => true);
      if (!isEnabled) return false;

      // Coba trial click untuk memastikan bisa diklik
      await locator.click({ timeout: 3000, trial: true });
      return true;
    } catch (e) {
      return false;
    }
  };

  // 1) Coba sebagai selector CSS (trial click)
  try {
    const css = page.locator(t).first();
    if (await validateElement(css)) {
      return css;
    }
  } catch (e) {
    // lanjut
  }

  // 2) Role-based EXACT (paling akurat untuk button/link)
  try {
    const btnExact = page.getByRole("button", { name: t, exact: true }).first();
    if (await validateElement(btnExact)) {
      return btnExact;
    }
  } catch (e) {
    // lanjut
  }

  // 2b) Role-based regex EXACT (tahan whitespace/icon, tapi tetap EXACT)
  try {
    const btnRegex = page
      .getByRole("button", {
        name: exactTextRe,
      })
      .first();
    if (await validateElement(btnRegex)) {
      return btnRegex;
    }
  } catch (e) {
    // lanjut
  }

  // 2c) Filter berbasis textContent yang EXACT (untuk button submit dengan icon)
  try {
    const btnByTextExact = page
      .locator("button")
      .filter({ hasText: exactTextRe })
      .first();
    if (await validateElement(btnByTextExact)) {
      return btnByTextExact;
    }
  } catch (e) {
    // lanjut
  }

  // 2d) Role-based dengan contains (untuk kasus ada whitespace/icon tambahan)
  try {
    const btnContains = page
      .getByRole("button", { name: containsTextRe })
      .first();
    // Untuk contains, pastikan text content exact match untuk menghindari false positive
    const textContent = await btnContains.textContent({ timeout: 2000 });
    if (textContent && exactTextRe.test(textContent.trim())) {
      if (await validateElement(btnContains)) {
        return btnContains;
      }
    }
  } catch (e) {
    // lanjut
  }

  // 2e) Button dengan filter contains text yang kemudian di-validate exact
  try {
    const btnByContains = page
      .locator("button")
      .filter({ hasText: containsTextRe })
      .first();
    const textContent = await btnByContains.textContent({ timeout: 2000 });
    if (textContent && exactTextRe.test(textContent.trim())) {
      if (await validateElement(btnByContains)) {
        return btnByContains;
      }
    }
  } catch (e) {
    // lanjut
  }

  // 2f) Fallback: Role-based tanpa exact (jika exact tidak ketemu)
  try {
    const btn = page.getByRole("button", { name: t }).first();
    const textContent = await btn.textContent({ timeout: 2000 });
    if (textContent && exactTextRe.test(textContent.trim())) {
      if (await validateElement(btn)) {
        return btn;
      }
    }
  } catch (e) {
    // lanjut
  }

  // 2g) Button dengan title attribute (untuk tombol icon seperti Delete)
  try {
    const btnByTitle = page.locator(`button[title="${t}" i]`).first();
    if (await validateElement(btnByTitle)) {
      return btnByTitle;
    }
  } catch (e) {
    // lanjut
  }

  // 2h) Button dengan aria-label
  try {
    const btnByAriaLabel = page.locator(`button[aria-label="${t}" i]`).first();
    if (await validateElement(btnByAriaLabel)) {
      return btnByAriaLabel;
    }
  } catch (e) {
    // lanjut
  }

  // 2i) Button dengan title yang contains (case-insensitive)
  try {
    const btnByTitleContains = page
      .locator("button")
      .filter({ has: page.locator(`[title*="${t}" i]`) })
      .first();
    if (await validateElement(btnByTitleContains)) {
      return btnByTitleContains;
    }
  } catch (e) {
    // lanjut
  }

  // 2j) Button dengan aria-label yang contains
  try {
    const btnByAriaLabelContains = page
      .locator("button")
      .filter({ has: page.locator(`[aria-label*="${t}" i]`) })
      .first();
    if (await validateElement(btnByAriaLabelContains)) {
      return btnByAriaLabelContains;
    }
  } catch (e) {
    // lanjut
  }

  // 2k) Button dengan onclick yang contains text (untuk kasus deleteTransaction('ID'))
  try {
    const btnByOnclick = page.locator(`button[onclick*="${t}" i]`).first();
    if (await validateElement(btnByOnclick)) {
      return btnByOnclick;
    }
  } catch (e) {
    // lanjut
  }

  // 2l) Button dengan icon yang memiliki title/aria-label di parent
  try {
    // Cari icon dengan class yang umum (bi-trash, bi-pencil, dll) lalu cari parent button
    const iconSelectors = [
      `i.bi-trash`,
      `i.bi-pencil`,
      `i.bi-x`,
      `i.bi-check`,
      `i.fa-trash`,
      `i.fa-pencil`,
      `svg[title="${t}" i]`,
      `svg[aria-label="${t}" i]`,
    ];

    for (const iconSel of iconSelectors) {
      try {
        const icon = page.locator(iconSel).first();
        if (await icon.isVisible({ timeout: 1000 })) {
          // Cek apakah parent button memiliki title/aria-label yang match
          const parentButton = icon.locator(
            "xpath=ancestor-or-self::button[1]"
          );
          const title = await parentButton
            .getAttribute("title")
            .catch(() => null);
          const ariaLabel = await parentButton
            .getAttribute("aria-label")
            .catch(() => null);

          if (
            (title && containsTextRe.test(title)) ||
            (ariaLabel && containsTextRe.test(ariaLabel))
          ) {
            if (await validateElement(parentButton)) {
              return parentButton;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    // lanjut
  }

  // 2m) XPath untuk button dengan title attribute
  try {
    const xpathTitle = page
      .locator(
        `xpath=//button[@title="${t}" or contains(translate(@title, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${t.toLowerCase()}')]`
      )
      .first();
    if (await validateElement(xpathTitle)) {
      return xpathTitle;
    }
  } catch (e) {
    // lanjut
  }

  // 2n) XPath untuk button dengan aria-label
  try {
    const xpathAriaLabel = page
      .locator(
        `xpath=//button[@aria-label="${t}" or contains(translate(@aria-label, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${t.toLowerCase()}')]`
      )
      .first();
    if (await validateElement(xpathAriaLabel)) {
      return xpathAriaLabel;
    }
  } catch (e) {
    // lanjut
  }

  // 2o) Button dengan kombinasi class dan title (untuk Bootstrap buttons)
  // Contoh: button.btn-outline-danger[title="Delete"]
  try {
    const btnByClassAndTitle = page.locator(`button[title="${t}" i]`).first();
    if (await validateElement(btnByClassAndTitle)) {
      return btnByClassAndTitle;
    }
  } catch (e) {
    // lanjut
  }

  // 2p) Button yang mengandung icon dengan title yang match
  // Cari semua button, lalu filter yang memiliki title/aria-label yang match
  try {
    const allButtons = page.locator("button");
    const count = await allButtons.count();
    for (let i = 0; i < Math.min(count, 50); i++) {
      try {
        const btn = allButtons.nth(i);
        const title = await btn.getAttribute("title").catch(() => null);
        const ariaLabel = await btn
          .getAttribute("aria-label")
          .catch(() => null);
        const textContent = await btn
          .textContent({ timeout: 500 })
          .catch(() => "");

        // Cek apakah title/aria-label/textContent match
        if (
          (title && containsTextRe.test(title)) ||
          (ariaLabel && containsTextRe.test(ariaLabel)) ||
          (textContent && exactTextRe.test(textContent.trim()))
        ) {
          if (await validateElement(btn)) {
            return btn;
          }
        }
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    // lanjut
  }

  // 3) Link exact
  try {
    const linkExact = page.getByRole("link", { name: t, exact: true }).first();
    if (await validateElement(linkExact)) {
      return linkExact;
    }
  } catch (e) {
    // lanjut
  }

  // Link exact regex
  try {
    const linkRegex = page.getByRole("link", { name: exactTextRe }).first();
    if (await validateElement(linkRegex)) {
      return linkRegex;
    }
  } catch (e) {
    // lanjut
  }

  // Link contains dengan exact validation
  try {
    const link = page.getByRole("link", { name: t }).first();
    const textContent = await link.textContent({ timeout: 2000 });
    if (textContent && exactTextRe.test(textContent.trim())) {
      if (await validateElement(link)) {
        return link;
      }
    }
  } catch (e) {
    // lanjut
  }

  // 4) Fallback CSS text selectors
  const esc = escapeForCssString(t);
  const candidates = [
    `button:text-is("${esc}")`,
    `button:has-text("${esc}")`,
    `a:has-text("${esc}")`,
    `[role="button"]:has-text("${esc}")`,
    `[role="menuitem"]:has-text("${esc}")`,
    `input[type="submit"][value="${esc}"]`,
    `input[type="button"][value="${esc}"]`,
  ];

  for (const sel of candidates) {
    try {
      const loc = page.locator(sel).first();
      const textContent = await loc
        .textContent({ timeout: 2000 })
        .catch(() => null);
      if (!textContent || exactTextRe.test(textContent.trim())) {
        if (await validateElement(loc)) {
          return loc;
        }
      }
    } catch (e) {
      continue;
    }
  }

  // 5) Cari text lalu naik ke ancestor yang clickable
  try {
    const textLoc = page.getByText(t, { exact: true }).first();
    if (await textLoc.isVisible({ timeout: 2000 })) {
      const ancestorButton = textLoc.locator(
        "xpath=ancestor-or-self::button[1]"
      );
      if (await validateElement(ancestorButton)) {
        return ancestorButton;
      }
    }
  } catch (e) {
    // lanjut
  }

  try {
    const textLoc = page.getByText(t).first();
    if (await textLoc.isVisible({ timeout: 2000 })) {
      const textContent = await textLoc.textContent({ timeout: 1000 });
      if (textContent && exactTextRe.test(textContent.trim())) {
        const ancestorRoleButton = textLoc.locator(
          'xpath=ancestor-or-self::*[@role="button"][1]'
        );
        if (await validateElement(ancestorRoleButton)) {
          return ancestorRoleButton;
        }
      }
    }
  } catch (e) {
    // lanjut
  }

  try {
    const textLoc = page.getByText(t).first();
    if (await textLoc.isVisible({ timeout: 2000 })) {
      const textContent = await textLoc.textContent({ timeout: 1000 });
      if (textContent && exactTextRe.test(textContent.trim())) {
        const ancestorLink = textLoc.locator("xpath=ancestor-or-self::a[1]");
        if (await validateElement(ancestorLink)) {
          return ancestorLink;
        }
      }
    }
  } catch (e) {
    // lanjut
  }

  // 6) XPath fallback untuk button dengan text exact
  try {
    const xpathButton = page
      .locator(
        `xpath=//button[normalize-space(text())="${t}" or normalize-space(.)="${t}"]`
      )
      .first();
    if (await validateElement(xpathButton)) {
      return xpathButton;
    }
  } catch (e) {
    // lanjut
  }

  // 7) XPath untuk elemen dengan role button
  try {
    const xpathRoleButton = page
      .locator(
        `xpath=//*[@role="button"][normalize-space(text())="${t}" or normalize-space(.)="${t}"]`
      )
      .first();
    if (await validateElement(xpathRoleButton)) {
      return xpathRoleButton;
    }
  } catch (e) {
    // lanjut
  }

  return null;
}

/**
 * Click element by text or selector
 * @param {Page} page - Playwright page object
 * @param {string} target - Text or selector to click
 */
export async function clickByTextOrSelector(page, target) {
  const locator = await getClickableLocator(page, target);
  if (!locator) {
    throw new Error(`Click target not found: ${target}`);
  }

  // Pastikan terlihat di viewport dulu
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 3000 });
  } catch (e) {
    // abaikan, lanjutkan
  }

  // Tunggu elemen benar-benar siap (visible dan enabled)
  try {
    await locator.waitFor({ state: "visible", timeout: 5000 });
  } catch (e) {
    // abaikan, lanjutkan
  }

  // Coba beberapa strategi klik
  const clickStrategies = [
    // 1. Normal click dengan auto-wait
    async () => {
      await locator.click({ timeout: 10000 });
    },
    // 2. Click dengan force (untuk overlay/pointer-events)
    async () => {
      await locator.click({ timeout: 10000, force: true });
    },
    // 3. Click dengan JavaScript (bypass event handlers)
    async () => {
      await locator.evaluate((el) => {
        if (el instanceof HTMLElement) {
          el.click();
        }
      });
    },
    // 4. Dispatch click event manual
    async () => {
      await locator.dispatchEvent("click");
    },
  ];

  for (const strategy of clickStrategies) {
    try {
      await strategy();
      // Tunggu sedikit untuk memastikan click terproses
      await page.waitForTimeout(500);
      return;
    } catch (e) {
      // Coba strategi berikutnya
      continue;
    }
  }

  // Jika semua strategi gagal, throw error
  throw new Error(`Failed to click target: ${target}`);
}
