// API base URL. Ganti ke "/api" jika deploy di nginx reverse proxy.
// Jika "localhost", maka gunakan env/setting yang sesuai.
const API_BASE_URL = "http://localhost:8000";

/**
 * Analisis teks dengan API backend.
 * @param {string} text
 * @returns {Promise<Object>} result, summary, tags, keyFindings
 */
export async function analyzeText(text) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await response.json();

  // Validasi response status (API backend mengembalikan ok === 200 jika sukses)
  if (data.ok !== 200) {
    throw new Error(data.detail || "Failed to analyze text");
  }

  return {
    result: data.raw,
    summary: data.summary,
    tags: data.tags,
    keyFindings: data.key_findings,
  };
}

/**
 * Ekstrak variabel dari file (csv/xlsx), hanya dari baris tertentu.
 * @param {File} file
 * @param {number} rowIndex baris ke berapa yang diambil (0 default)
 * @param {string|null} sheetName jika xlsx, nama sheet yang dipilih
 * @returns {Promise<Object>} Object mapping nama kolom/variabel ke value
 */
export async function extractVariables(file, rowIndex = 0, sheetName = null) {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  params.append("row_index", rowIndex.toString());
  if (sheetName) params.append("sheet_name", sheetName);

  const response = await fetch(`${API_BASE_URL}/variables/extract?${params}`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to extract variables");
  }

  return data.variables;
}

/**
 * Ekstrak semua baris dari file CSV/XLSX ke array of object.
 * @param {File} file
 * @param {string|null} sheetName jika xlsx, nama sheet yang dipilih
 * @returns {Promise<Array<Object>>}
 */
export async function extractAllRows(file, sheetName = null) {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  if (sheetName) params.append("sheet_name", sheetName);

  const response = await fetch(
    `${API_BASE_URL}/variables/extract-rows?${params}`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to extract rows");
  }

  return data.rows;
}

/**
 * Ambil daftar sheet dari file xlsx.
 * @param {File} file
 * @returns {Promise<Array<string>>}
 */
export async function getXlsxSheets(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/variables/xlsx-sheets`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to get sheets");
  }

  return data.sheets;
}

/**
 * Jalankan otomatisasi pengisian form di server backend.
 * @param {string} url Target URL untuk otomasi browser (via Playwright)
 * @param {Array} mappings Mapping field form (selector, variable)
 * @param {Object|Array} payload Data yang diisi (per-row object)
 * @param {Object} options Pengaturan otomasi (misal: submit otomatis)
 * @returns {Promise<Object>} Response data dari backend otomasi
 */
export async function runAutomation(url, mappings, payload, options = {}) {
  const response = await fetch(`${API_BASE_URL}/automation/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      mappings,
      payload,
      options,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to run automation");
  }

  return data;
}

/**
 * Ekstrak semua input dari HTML form (gunakan di UI mapping selector otomatis).
 * @param {string} html
 * @returns {Promise<Array<Object>>} Array of input field detail
 */
export async function extractInputsFromHtml(html) {
  const response = await fetch(`${API_BASE_URL}/automation/extract-inputs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to extract inputs from HTML");
  }

  return data.inputs || [];
}

/**
 * Kirim pesan chat ke backend (misal untuk fitur AI asisten).
 * @param {string} message Isi pesan chat
 * @param {string|null} documentContext (opsional)
 * @returns {Promise<Object>} Jawaban dari AI/backend
 */
export async function sendChatMessage(message, documentContext = null) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      document_context: documentContext,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send chat message");
  }

  return data;
}
