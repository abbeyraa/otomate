// Load Playwright library
// Catatan: File ini harus dijalankan di server-side (Node.js), tidak bisa di browser

let playwrightLoaded = false;
let playwright = null;

/**
 * Load Playwright library (lazy loading)
 * @returns {Promise<Object>} Playwright module
 */
export async function loadPlaywright() {
  if (!playwrightLoaded) {
    try {
      playwright = await import("playwright");
      playwrightLoaded = true;
    } catch (error) {
      throw new Error(
        "Playwright tidak tersedia. Pastikan playwright sudah diinstall: npm install playwright"
      );
    }
  }
  return playwright;
}
