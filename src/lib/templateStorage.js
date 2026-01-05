/**
 * Template Storage Service
 * Uses browser localStorage.
 */

const TEMPLATES_STORAGE_KEY = "otomate_templates";

/**
 * Read templates from storage
 */
export async function getTemplates() {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Failed to load templates:", error);
    return [];
  }
}

/**
 * Save templates to storage
 */
export async function saveTemplates(templates) {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch (error) {
    console.error("Failed to save templates:", error);
    return false;
  }
}

/**
 * Migrate templates from localStorage to file storage
 * This is called once on app startup if migration hasn't been done
 */
export async function getStorageInfo() {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const templates = stored ? JSON.parse(stored) : [];
    return {
      type: "localStorage",
      templateCount: templates.length,
      size: stored ? stored.length : 0,
    };
  } catch (error) {
    console.error("Error getting storage info:", error);
    return {
      type: "unknown",
      error: error.message,
    };
  }
}
