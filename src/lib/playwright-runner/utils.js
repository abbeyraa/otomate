/**
 * Utility functions untuk playwright runner
 */

/**
 * Escape string untuk digunakan di CSS selector
 * @param {string} value - String yang akan di-escape
 * @returns {string} Escaped string
 */
export function escapeForCssString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Escape string untuk digunakan di regex
 * @param {string} value - String yang akan di-escape
 * @returns {string} Escaped string
 */
export function escapeForRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
