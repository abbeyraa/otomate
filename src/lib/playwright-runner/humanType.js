/**
 * Type text dengan efek typing seperti manusia
 * @param {Locator} element - Playwright locator untuk input element
 * @param {string} text - Teks yang akan diketik
 * @param {Object} options - Opsi konfigurasi
 * @param {number} options.minDelay - Delay minimum per karakter (ms)
 * @param {number} options.maxDelay - Delay maksimum per karakter (ms)
 */
export async function humanType(element, text, options = {}) {
  const { minDelay = 50, maxDelay = 150 } = options;
  const textStr = String(text || "");

  if (!textStr) return;

  // Clear field terlebih dahulu
  await element.clear();

  // Focus pada element
  await element.focus();

  // Ketik setiap karakter dengan delay random seperti manusia mengetik
  for (let i = 0; i < textStr.length; i++) {
    const char = textStr[i];
    // Generate delay random antara minDelay dan maxDelay
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    await element.type(char, { delay: Math.round(delay) });
  }
}
