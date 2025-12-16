"use client";

export default function VariablesPreviewSection({
  columns,
  previewRows,
  effectiveRowsLength,
}) {
  return (
    <>
      <div className="rounded-2xl border border-[#e5e5e5] bg-white/70 backdrop-blur-sm p-8 shadow-md">
        <h3 className="text-lg font-semibold text-[#22223b] mb-2">
          Variabel yang Tersedia
        </h3>
        {columns.length === 0 ? (
          <p className="my-2 text-base text-[#b1b7c8]">
            Kolom dari file akan muncul di sini sebagai variabel.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-3">
            {columns.map((col) => (
              <span
                key={col}
                className="rounded-full border border-[#3730a3]/10 bg-[#eef2ff] px-4 py-1 text-sm font-bold text-[#3730a3] tracking-wider shadow"
              >
                {`{{${col}}}`}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#e5e5e5] bg-white/70 backdrop-blur-sm p-8 shadow-md">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-[#22223b]">
            Pratinjau Data
          </h3>
          <span className="text-sm text-[#8d99ae]">
            {effectiveRowsLength > 0 ? (
              <>
                Menampilkan{" "}
                <span className="font-semibold">{previewRows.length}</span> dari{" "}
                <span className="font-semibold">{effectiveRowsLength}</span>{" "}
                baris
              </>
            ) : (
              ""
            )}
          </span>
        </div>
        {effectiveRowsLength === 0 ? (
          <p className="mt-3 text-base text-[#b1b7c8]">
            Unggah CSV/XLSX atau isi data manual untuk melihat pratinjau.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded border border-[#e5e5e5]">
            <table className="min-w-full divide-y divide-[#e5e7eb] text-sm">
              <thead className="bg-[#f7f7fb]">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-bold text-[#3730a3]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] bg-white">
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td
                        key={`${idx}-${col}`}
                        className="whitespace-nowrap px-3 py-2 text-[#4b5563]"
                      >
                        {row[col] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
