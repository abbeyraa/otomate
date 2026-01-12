export const metadata = {
  title: "OtoMate - Automation Builder",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ef] px-6 py-12 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 opacity-70 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-200 via-teal-200 to-emerald-200 opacity-70 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 opacity-50 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.15)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              OtoMate Automation Builder
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 lg:text-4xl">
              Panduan Cepat Editor &amp; Scope Selector
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Halaman ini menjelaskan cara mengisi input di Editor, memilih
              target elemen dengan scope selector, dan contoh nyata untuk tombol
              &quot;Masuk&quot;. Semua materi bisa dibuka/tutup agar fokus tetap
              rapi.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Procedure",
                  desc: "Rangkuman langkah dari start sampai run.",
                },
                {
                  title: "Handle Inputs",
                  desc: "Cara memilih jenis input & nilai.",
                },
                {
                  title: "Scope Selector",
                  desc: "Batasi area pencarian agar lebih akurat.",
                },
                {
                  title: "Use Case",
                  desc: "Contoh tombol “Masuk” dengan data-*",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Open Editor",
                  desc: "Buat flow baru dan mulai Inspect.",
                  href: "/editor",
                },
                {
                  title: "Templates",
                  desc: "Simpan atau pakai ulang template.",
                  href: "/template",
                },
                {
                  title: "Settings",
                  desc: "Atur browser dan output.",
                  href: "/settings",
                },
              ].map((card) => (
                <a
                  key={card.title}
                  href={card.href}
                  className="group rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Quick Start
                  </p>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">{card.desc}</p>
                  <span className="mt-3 inline-flex text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    Buka →
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                Checklist
              </p>
              <h2 className="mt-3 text-xl font-semibold">
                Siap melakukan automation pertama?
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>1. Buka Editor dan tambah step.</li>
                <li>2. Isi Label/Text sesuai tampilan halaman.</li>
                <li>3. Tambahkan Scope Selector bila target banyak.</li>
                <li>4. Jalankan Inspect untuk verifikasi.</li>
                <li>5. Run dan simpan template.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Tips Stabil
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Gunakan data atribut atau label yang konsisten. Hindari selector
                yang bergantung pada urutan DOM karena mudah berubah.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  data-*
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Role + Text
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Scope sebagai parent
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              Expandable Guide
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Klik judul untuk membuka detail.
            </p>
            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Procedure Utama",
                  content: (
                    <ol className="space-y-2 text-sm text-slate-600">
                      <li>1. Masuk ke halaman Editor.</li>
                      <li>2. Tambah step baru (Click, Input, Navigate, Wait).</li>
                      <li>3. Isi Label/Text sesuai elemen di UI.</li>
                      <li>
                        4. Tambahkan Scope Selector bila ada banyak elemen serupa.
                      </li>
                      <li>5. Jalankan Inspect, lalu Run.</li>
                    </ol>
                  ),
                },
                {
                  title: "Apa yang bisa diotomasi?",
                  content: (
                    <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        Klik tombol / link
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        Isi teks, angka, tanggal
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        Pilih checkbox / toggle
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        Pilih option dropdown
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Cara mengisi Input",
                  content: (
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>
                        Pilih <strong>Jenis Input</strong> sesuai field. Isi
                        label dengan teks yang terlihat di UI (misalnya
                        &quot;Email&quot;). Isi nilai sesuai format:
                      </p>
                      <ul className="space-y-1">
                        <li>- Text: ketik bebas.</li>
                        <li>- Number: gunakan angka tanpa simbol.</li>
                        <li>- Date: format contoh <code>2025-01-31</code>.</li>
                        <li>- Checkbox/Toggle: <code>true</code> atau{" "}
                        <code>false</code>.</li>
                        <li>- Select: gunakan value option.</li>
                      </ul>
                    </div>
                  ),
                },
              ].map((item) => (
                <details
                  key={item.title}
                  className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800">
                    {item.title}
                    <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {item.content}
                  </div>
                </details>
              ))} 
            </div>
          </div>

          <div className="self-start rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Scope Selector Case
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Scope selector dipakai untuk mempersempit area pencarian. Gunakan
                  selector parent agar pencarian label tidak &quot;nyasar&quot;.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Click Navigation
              </span>
            </div>

            <details className="group mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800">
                Contoh tombol &quot;Masuk&quot;
                <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                <p>HTML target:</p>
                <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
                  {`<button type="button" class="card-text btn btn-primary" data-entt="4" data-note="PT. XYZ" style="border-radius: 10px;">
  Masuk
</button>`}
                </pre>
                <div className="mt-4 space-y-2">
                  <p className="font-semibold text-slate-800">
                    Isi di Editor:
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <strong>Action:</strong> Click
                    </li>
                    <li>
                      <strong>Label / Text:</strong> Masuk
                    </li>
                    <li>
                      <strong>Scope Selector:</strong>{" "}
                      <code>.card:has(button[data-note="PT. XYZ"])</code>
                    </li>
                  </ul>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Tip: scope selector sebaiknya menunjuk container/card yang
                  membungkus tombol. Jika container tidak punya atribut khusus,
                  gunakan <code>:has()</code> untuk mencari parent yang berisi
                  tombol unik.
                </p>
              </div>
            </details>

            <details className="group mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800">
                Alternatif selector cepat
                <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                <p>Contoh CSS selector yang stabil:</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <code>[data-note="PT. XYZ"]</code>
                  </li>
                  <li>
                    <code>button[data-entt="4"]</code>
                  </li>
                  <li>
                    <code>button.card-text.btn.btn-primary</code>
                  </li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  Gunakan selector di atas sebagai scope bila ada lebih dari satu
                  tombol &quot;Masuk&quot; di halaman.
                </p>
              </div>
            </details>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">FAQ</h2>
              <p className="mt-2 text-sm text-slate-600">
                Jawaban singkat, termasuk default value agar fungsinya jelas.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Defaults
            </span>
          </div>
          <div className="mt-6 columns-1 gap-3 lg:columns-2">
            {[
              {
                q: "Apa fungsi Scope Selector?",
                a: "Membatasi area pencarian elemen agar label tidak salah pilih. Default: kosong (global page).",
              },
              {
                q: "Apa default Label/Text?",
                a: "Tidak ada default. Isi dengan teks yang terlihat di UI, mis. “Masuk” atau “Email”.",
              },
              {
                q: "Apa default Input Kind?",
                a: "Default: Text. Gunakan Select/Date/Number sesuai tipe input di halaman.",
              },
              {
                q: "Bagaimana default Value untuk Checkbox/Toggle?",
                a: "Gunakan true/false. Default: kosong (tidak mengubah state).",
              },
              {
                q: "Apa default URL di Navigate?",
                a: "Tidak ada default. Harus diisi URL lengkap termasuk https://.",
              },
              {
                q: "Mengapa Click tidak jalan?",
                a: "Cek Label/Text sesuai UI dan tambahkan Scope Selector jika ada banyak elemen serupa.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group mb-3 break-inside-avoid rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800">
                  {item.q}
                  <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
