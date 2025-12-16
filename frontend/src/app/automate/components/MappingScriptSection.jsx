"use client";

export default function MappingScriptSection({
  targetHtml,
  setTargetHtml,
  handleExtractInputs,
  formInputs,
  needOpenButton,
  setNeedOpenButton,
  openButtonSelector,
  setOpenButtonSelector,
  mappings,
  updateMapping,
  removeMapping,
  addMapping,
  columns,
  postMode,
  setPostMode,
  inputAllRows,
  setInputAllRows,
  generateScript,
  automationResult,
  handleNextRow,
  effectiveRowsLength,
  selectedRowIndex,
}) {
  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white/80 shadow-md p-8 backdrop-blur-md h-full flex flex-col">
        <h3 className="text-lg font-bold text-[#22223b]">
          Pemetaan Variabel &rarr; Elemen Form
        </h3>
        <p className="mt-2 text-base text-[#8d99ae]">
          Tambahkan selector CSS dan pilih variabel dari kolom.
        </p>
        <div className="mt-5">
          <label className="mb-1 block text-sm font-semibold text-[#3730a3]">
            HTML Target (paste dari website)
          </label>
          <textarea
            value={targetHtml}
            onChange={(e) => setTargetHtml(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[#e5e5e5] p-3 text-base font-mono bg-[#f7f7fc] focus:ring-2 focus:ring-[#3b82f6]"
            placeholder="<form>...</form>"
          />
          <p className="mt-2 text-xs text-[#b1b7c8]">
            Tempelkan HTML halaman target. Data ini membantu mendeteksi input
            form via AI lokal atau untuk mapping manual.
          </p>
          <button
            type="button"
            onClick={handleExtractInputs}
            className="mt-3 inline-flex items-center rounded-lg bg-[#3b82f6] hover:bg-[#1741ad] px-5 py-2 text-sm font-semibold text-white focus:ring-2 focus:ring-[#3b82f6] transition"
          >
            Deteksi input dari HTML
          </button>
          {formInputs.length > 0 && (
            <p className="mt-2 text-xs text-[#22223b]">
              <b>{formInputs.length}</b> field input ditemukan dari HTML.
            </p>
          )}
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={needOpenButton}
            onChange={(e) => setNeedOpenButton(e.target.checked)}
            className="rounded accent-[#3b82f6] h-4 w-4"
            id="checkbox-openform"
          />
          <label
            htmlFor="checkbox-openform"
            className="cursor-pointer text-[#374151]"
          >
            Form dibuka dengan klik tombol terlebih dahulu
          </label>
        </div>
        {needOpenButton && (
          <input
            type="text"
            value={openButtonSelector}
            onChange={(e) => setOpenButtonSelector(e.target.value)}
            placeholder='CSS selector atau teks tombol (mis: a[href="/kelola_lga/jenis_laporan/add"] atau "Tambah Data")'
            className="mt-3 w-full rounded-lg border border-[#d1d5db] p-2 text-sm bg-[#f7f7fc] focus:bg-white"
          />
        )}
        <div className="mt-6 space-y-6 flex-1">
          {mappings.map((mapping, idx) => (
            <div
              key={idx}
              className="rounded-xl border-2 border-[#e5e5eb] bg-[#f9fafb]/50 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm font-semibold text-[#3730a3]">
                <span>Mapping #{idx + 1}</span>
                <button
                  onClick={() => removeMapping(idx)}
                  className="text-xs text-white bg-[#f87171] hover:bg-[#b91c1c] px-3 py-1 rounded transition"
                >
                  Hapus
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#374151]">
                    CSS Selector
                  </label>
                  <select
                    className="w-full rounded-md border border-[#e5e5e5] p-2 text-sm bg-[#f8fafc]"
                    value={mapping.selector}
                    onChange={(e) =>
                      updateMapping(idx, "selector", e.target.value)
                    }
                  >
                    <option value="">Pilih selector dari HTML</option>
                    {formInputs.map((input) => (
                      <option key={input.selector} value={input.selector}>
                        {input.label ||
                          input.name ||
                          input.placeholder ||
                          input.selector}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#374151]">
                    Variabel
                  </label>
                  <select
                    value={mapping.variable}
                    onChange={(e) =>
                      updateMapping(idx, "variable", e.target.value)
                    }
                    className="w-full rounded-md border border-[#e5e5e5] p-2 text-sm bg-[#f8fafc]"
                  >
                    <option value="">Pilih variabel</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={postMode}
              onChange={(e) => {
                setPostMode(e.target.checked);
                setInputAllRows(false);
              }}
              className="rounded border-[#e5e5e5]"
            />
            <span>Post (auto klik submit & tidak menampilkan popup)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inputAllRows}
              onChange={(e) => {
                setInputAllRows(e.target.checked);
                setPostMode(true);
              }}
              className="rounded border-[#e5e5e5]"
            />
            <span>
              Input semua row (loop). Tanpa centang: hanya row aktif.
            </span>
          </label>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={addMapping}
            className="rounded-xl bg-gradient-to-br from-[#1f2937] to-[#374151] px-6 py-2 text-base font-bold text-white shadow-lg hover:bg-[#22223b]/75 transition"
          >
            + Mapping
          </button>
          <button
            onClick={generateScript}
            className="rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] px-6 py-2 text-base font-bold text-white shadow-md hover:from-[#1741ad] transition"
          >
            Generate Script
          </button>
        </div>
        {automationResult && (
          <div
            className={`mt-6 rounded-xl border-2 p-5 ${
              automationResult.success
                ? "border-[#6ee7b7] bg-[#f0fdf4]"
                : "border-[#fca5a5] bg-[#fef2f2]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg text-[#22223b]">
                {automationResult.success
                  ? "Automation Berhasil"
                  : "Automation Gagal"}
              </h4>
              {automationResult.success &&
                selectedRowIndex < effectiveRowsLength - 1 && (
                  <button
                    onClick={handleNextRow}
                    className="text-xs font-medium text-[#10b981] cursor-pointer transition hover:underline"
                  >
                    Next Row{" "}
                    <span aria-label="next" role="img">
                      →
                    </span>
                  </button>
                )}
            </div>
            {automationResult.filled_count !== undefined && (
              <p className="mt-1 text-sm text-[#374151]">
                <b>{automationResult.filled_count}</b> field berhasil diisi.
              </p>
            )}
            {automationResult.errors?.length > 0 && (
              <div className="mt-2 text-xs text-red-600 space-y-1">
                {automationResult.errors.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
  );
}
