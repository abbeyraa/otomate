"use client";

export default function DataSourceSection({
  dataSource,
  setDataSource,
  fileName,
  handleFileSelect,
  xlsxSheets,
  selectedSheet,
  handleSheetChange,
  loading,
  error,
  manualColumns,
  manualRows,
  addManualColumn,
  removeManualColumn,
  renameManualColumn,
  addManualRow,
  removeManualRow,
  handleManualCellChange,
  effectiveRows,
  selectedRowIndex,
  handleRowChange,
}) {
  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white/70 backdrop-blur-sm p-8 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-[#22223b] mb-1">
            Sumber Data
          </h2>
          <span className="text-sm text-[#8d99ae]">
            Pilih unggah file atau input manual. Sistem otomatis mengenali kolom
            sebagai variabel.
          </span>
        </div>
        {fileName && (
          <span className="rounded bg-[#eff6ff] px-3 py-1 text-sm text-[#3b82f6] font-medium">
            {fileName}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 font-medium text-[#22223b]">
          <input
            type="radio"
            checked={dataSource === "upload"}
            onChange={() => {
              setDataSource("upload");
              handleRowChange(0);
            }}
            className="form-radio accent-[#3b82f6] w-4 h-4"
          />
          <span className="hover:underline cursor-pointer">Upload CSV/XLSX</span>
        </label>
        <label className="flex items-center gap-2 font-medium text-[#22223b]">
          <input
            type="radio"
            checked={dataSource === "manual"}
            onChange={() => {
              setDataSource("manual");
              handleRowChange(0);
            }}
            className="form-radio accent-[#10b981] w-4 h-4"
          />
          <span className="hover:underline cursor-pointer">Input manual</span>
        </label>
      </div>

      {dataSource === "upload" && (
        <>
          <input
            id="automate-file-input"
            type="file"
            accept=".csv,.xlsx"
            className="mt-6 block w-full cursor-pointer rounded-lg border-2 border-dashed border-[#d1d5db] p-4 text-base transition-all duration-200 focus:ring-2 focus:ring-[#3b82f6]"
            onChange={(e) =>
              e.target.files[0] && handleFileSelect(e.target.files[0])
            }
          />
          {xlsxSheets.length > 0 && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-[#3730a3]">
                Sheet
              </label>
              <select
                value={selectedSheet}
                onChange={(e) => handleSheetChange(e.target.value)}
                className="w-full rounded border border-[#e5e5e5] p-2 text-base bg-[#f3f4f6]"
              >
                {xlsxSheets.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {dataSource === "manual" && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm text-[#374151] mb-2 sm:mb-0">
              Isi data manual. Kolom otomatis terhubung ke variabel.
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={addManualColumn}
                className="rounded-lg bg-[#f3f4f6] px-4 py-1.5 text-sm font-semibold text-[#3b82f6] hover:bg-[#e8eafc] border border-[#e5e5e5] transition"
              >
                + Kolom
              </button>
              <button
                type="button"
                onClick={addManualRow}
                className="rounded-lg bg-[#2563eb] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1741ad] transition"
              >
                + Baris
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#e5e5e5] bg-white py-2">
            <table className="min-w-full divide-y divide-[#e5e7eb] text-sm">
              <thead className="bg-[#f7f7fb]">
                <tr>
                  {manualColumns.map((col, idx) => (
                    <th
                      key={`${col}-${idx}`}
                      className="px-3 py-2 text-left font-bold text-[#3730a3]"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          value={col}
                          onChange={(e) => renameManualColumn(idx, e.target.value)}
                          className="w-full rounded border border-[#d1d5db] px-2 py-1 text-sm bg-[#edf1fa] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeManualColumn(idx)}
                          disabled={manualColumns.length === 1}
                          className="text-xs text-red-600 disabled:text-gray-400"
                        >
                          Hapus
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left font-bold text-[#3730a3]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] bg-white">
                {manualRows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {manualColumns.map((col) => (
                      <td key={`${rowIdx}-${col}`} className="px-3 py-2">
                        <input
                          value={row[col] ?? ""}
                          onChange={(e) =>
                            handleManualCellChange(rowIdx, col, e.target.value)
                          }
                          className="w-full rounded border border-[#d1d5db] px-2 py-1 text-sm bg-[#f8fafc] focus:bg-white"
                          placeholder={`Row ${rowIdx + 1}`}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeManualRow(rowIdx)}
                        disabled={manualRows.length === 1}
                        className="text-xs text-red-600 disabled:text-gray-400"
                      >
                        Hapus baris
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#b1b7c8] mt-2">
            Kolom dan baris manual akan muncul sebagai variabel yang sama pada
            pemetaan.
          </p>
        </div>
      )}

      {effectiveRows.length > 0 && (
        <div className="mt-5">
          <label className="mb-1 block text-sm font-bold text-[#22223b]">
            Pilih baris sebagai sample input
          </label>
          <select
            value={selectedRowIndex}
            onChange={(e) => handleRowChange(parseInt(e.target.value, 10))}
            className="w-full rounded border border-[#e5e5e5] p-2 text-base bg-[#edf1fa]"
          >
            {effectiveRows.map((_, idx) => (
              <option key={idx} value={idx}>
                Row {idx + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <p className="mt-4 text-base text-[#6b7280] animate-pulse">
          Memproses file...
        </p>
      )}
      {error && <p className="mt-4 text-base text-red-600">{error}</p>}
    </div>
  );
}
