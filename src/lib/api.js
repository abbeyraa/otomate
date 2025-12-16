// Ekstrak CSV/XLSX langsung di FE (tidak lagi lewat backend)
// Menggunakan library: papaparse untuk CSV, sheetjs untuk XLSX

import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Ekstrak semua baris dari file CSV/XLSX ke array of object.
 * Digunakan oleh halaman Automation Plan untuk membaca sumber data.
 *
 * @param {File} file
 * @param {string|null} sheetName jika xlsx, nama sheet yang dipilih
 * @returns {Promise<Array<Object>>}
 */
export async function extractAllRows(file, sheetName = null) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "csv") {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });
  }

  if (["xlsx", "xls"].includes(ext)) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const targetSheet =
      sheetName && workbook.Sheets[sheetName]
        ? sheetName
        : workbook.SheetNames[0];
    const ws = workbook.Sheets[targetSheet];
    return XLSX.utils.sheet_to_json(ws, { defval: "" });
  }

  throw new Error("File type not supported. Please upload CSV or XLSX.");
}

/**
 * Ambil daftar sheet dari file xlsx.
 *
 * @param {File} file
 * @returns {Promise<Array<string>>}
 */
export async function getXlsxSheets(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (!["xlsx", "xls"].includes(ext)) {
    throw new Error("File is not an XLSX/XLS file");
  }
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  return workbook.SheetNames;
}

/**
 * Jalankan Automation Plan menggunakan Playwright Runner.
 * Fungsi ini sekarang memanggil runAutomation dari app/actions/runAutomation.js
 *
 * @param {Object} plan Automation Plan final yang dihasilkan UI
 * @returns {Promise<Object>} Laporan eksekusi dari Runner
 */
export async function runAutomationPlan(plan) {
  try {
    // Import dinamis server action untuk menghindari error di client-side
    const { runAutomation } = await import("../app/actions/runAutomation");
    const report = await runAutomation(plan);
    return report;
  } catch (error) {
    console.error("Automation execution error:", error);
    throw new Error(
      error.message ||
        "Gagal menjalankan automation plan. Pastikan Playwright sudah terinstall dan dijalankan di server-side."
    );
  }
}
