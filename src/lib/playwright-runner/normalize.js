/**
 * Normalize automation plan untuk memastikan struktur data valid
 * @param {Object} plan - Automation plan dari UI
 * @returns {Object} Normalized plan
 */
export function normalizePlan(plan) {
  if (!plan || typeof plan !== "object") {
    throw new Error("Automation plan tidak valid");
  }

  const target = plan.target || {};
  if (!target.url) {
    throw new Error("Target URL tidak ditemukan di plan");
  }
  if (!target.pageReadyIndicator?.type || !target.pageReadyIndicator?.value) {
    throw new Error("Page Ready Indicator tidak valid di plan");
  }

  const dataSource =
    plan.dataSource && typeof plan.dataSource === "object"
      ? plan.dataSource
      : {
          type: "manual",
          rows: [{}],
          mode: "single",
          selectedRowIndex: 0,
        };

  const rows = Array.isArray(dataSource.rows) ? dataSource.rows : [{}];
  const safeDataSource = {
    type: dataSource.type || "manual",
    rows: rows.length > 0 ? rows : [{}],
    mode: dataSource.mode === "batch" ? "batch" : "single",
    ...(dataSource.selectedRowIndex !== undefined
      ? { selectedRowIndex: dataSource.selectedRowIndex }
      : {}),
  };

  return {
    ...plan,
    target,
    dataSource: safeDataSource,
    fieldMappings: Array.isArray(plan.fieldMappings) ? plan.fieldMappings : [],
    actions: Array.isArray(plan.actions) ? plan.actions : [],
  };
}
