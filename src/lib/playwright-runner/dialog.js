/**
 * Install dialog auto-accept handler jika diperlukan
 * @param {Page} page - Playwright page object
 * @param {Object} plan - Automation plan
 * @param {boolean} force - Force install bahkan jika tidak ada handleDialog action
 */
export function installDialogAutoAcceptIfNeeded(page, plan, force = false) {
  const shouldInstall =
    force ||
    (Array.isArray(plan?.actions) &&
      plan.actions.some((a) => a?.type === "handleDialog"));
  if (!shouldInstall) return;
  if (page.__privylensDialogAutoAcceptInstalled) return;
  page.__privylensDialogAutoAcceptInstalled = true;

  page.on("dialog", async (dialog) => {
    try {
      await dialog.accept();
    } catch (e) {
      // no-op
    }
  });
}
