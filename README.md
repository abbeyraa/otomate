# PrivyLens — Node-based Automation Editor + Playwright Runner

## Ringkasan

PrivyLens adalah aplikasi **Next.js (App Router)** dengan UI **node-based editor** untuk merancang “Automation Plan” (rencana otomasi) pengisian form berbasis browser, lalu mengeksekusinya di server menggunakan **Playwright (Chromium)**.

- **Home (`/`)** langsung membuka **Editor**.
- Route lama **`/automate`** sudah **redirect** ke home (Editor).

---

## Konsep UI (Node-based)

Di Editor, user **klik node/card** di canvas untuk mengisi detail di panel kanan.

### Menambahkan Node

- **Klik kanan** di area kosong canvas untuk menampilkan context menu
- Pilih **"Sumber Data"** atau **"Alur Aksi"** untuk menambahkan node baru
- Node akan ditambahkan di posisi klik kanan

Saat ini Editor mendukung 2 mode:

### 1) Data-driven

Cocok untuk input form berdasarkan dataset.

- **Sumber Data**: upload CSV/XLSX (diparse di browser) atau input manual
- **Mode data**:
  - `single` (1 baris)
  - `batch` (semua baris)
- **Field Mapping**: definisi field bisnis → label di halaman → `dataKey`
- **Alur Aksi** bisa berisi `fill`, `click`, `wait`, `navigate`, `handleDialog`

Eksekusi mengikuti mode data (`single/batch`).

### 2) Action-only (bulk)

Cocok untuk otomasi aksi berulang tanpa dataset (mis. bulk delete).

- Tidak butuh **Sumber Data** dan **Field Mapping**
- Alur aksi biasanya `click/wait/navigate/handleDialog`
- Mendukung **loop** sampai kondisi terpenuhi (contoh: berhenti saat data habis)

Konfigurasi loop disimpan di `plan.execution`:

- `execution.mode`: `once` atau `loop`
- `execution.loop.indicator`: selector/text/url yang dipakai sebagai trigger
- `execution.loop.stopWhen`: `visible` atau `notVisible`

---

## Cara kerja (arsitektur singkat)

1. UI Editor menyusun `plan`.
2. Tombol **“Jalankan Automation Plan”** memanggil Server Action `runAutomation(plan)`.
3. Server Action memanggil runner Playwright `executeAutomationPlan(plan)`.
4. Runner mengembalikan **execution report** → UI menampilkan ringkasan + detail.

Komponen kunci:

- UI editor: `src/app/editor/page.jsx`
- Server action: `src/app/actions/runAutomation.js`
- Runner: `src/lib/playwright-runner/` (modular structure)
- Parsing CSV/XLSX: `src/lib/api.js` (langsung di frontend)
- Canvas/node editor: `@xyflow/react`

### Struktur Playwright Runner (Modular)

Runner Playwright diorganisir dalam struktur modular untuk kemudahan maintenance dan debugging:

- `index.js` - Entry point utama
- `loader.js` - Lazy loading Playwright library
- `normalize.js` - Normalisasi dan validasi automation plan
- `login.js` - Handler untuk proses login
- `navigation.js` - Handler untuk navigasi steps
- `actions.js` - Eksekusi actions (fill, click, wait, navigate, handleDialog)
- `elementFinder.js` - Pencarian elemen berdasarkan label atau selector
- `clickHandler.js` - Handler klik dengan multiple strategies
- `humanType.js` - Human-like typing effect untuk input
- `indicators.js` - Handler untuk page ready, wait, dan check indicators
- `dialog.js` - Auto-accept handler untuk browser dialogs
- `utils.js` - Utility functions (string escaping)

---

## Contoh Automation Plan

### A) Data-driven (disederhanakan)

```json
{
  "target": {
    "url": "https://example.com/form",
    "pageReadyIndicator": { "type": "selector", "value": ".form-root" }
  },
  "dataSource": {
    "type": "upload",
    "rows": [{ "nama": "A", "email": "a@example.com" }],
    "mode": "single",
    "selectedRowIndex": 0
  },
  "fieldMappings": [
    {
      "name": "Nama Lengkap",
      "type": "text",
      "dataKey": "nama",
      "required": true,
      "labels": ["Nama", "Nama Lengkap"],
      "fallbackLabels": ["Full Name"]
    }
  ],
  "actions": [
    { "type": "fill", "target": "Nama Lengkap" },
    { "type": "click", "target": "Submit" }
  ]
}
```

### B) Action-only bulk delete (loop sampai data habis)

```json
{
  "target": {
    "url": "https://example.com/transactions",
    "pageReadyIndicator": { "type": "selector", "value": ".table" }
  },
  "dataSource": {
    "type": "manual",
    "rows": [{}],
    "mode": "single",
    "selectedRowIndex": 0
  },
  "fieldMappings": [],
  "execution": {
    "mode": "loop",
    "loop": {
      "maxIterations": 200,
      "delaySeconds": 0,
      "stopWhen": "notVisible",
      "indicator": { "type": "selector", "value": "button.btn-delete" }
    }
  },
  "actions": [
    { "type": "click", "target": "button.btn-delete" },
    { "type": "handleDialog" }
  ]
}
```

---

## Menjalankan aplikasi

### Prasyarat

- **Node.js** 18+
- **npm**

> Catatan: repo ini menginstall browser Playwright Chromium via script `postinstall`.

### Instalasi

```bash
npm install
```

### Development

```bash
npm run dev
```

Akses: `http://localhost:3000` (Editor)

### Production build

```bash
npm run build
npm start
```

---

## Fitur Playwright Automation

### Human-like Typing

- Input text menggunakan efek typing seperti manusia dengan random delay (50-150ms per karakter)
- Membantu menghindari deteksi sebagai automated input

### Robust Element Finding

- Multiple strategies untuk menemukan elemen:
  - CSS selector
  - Role-based (button, link)
  - Text content matching (exact & contains)
  - Attribute-based (title, aria-label, onclick)
  - XPath fallback
  - Icon-based dengan parent lookup

### Multiple Click Strategies

- Normal click dengan auto-wait
- Force click untuk overlay issues
- JavaScript click untuk bypass event handlers
- Manual event dispatch

### Dialog Handling

- Auto-accept untuk browser dialogs (alert, confirm, prompt)
- Handler dipasang otomatis jika ada action `handleDialog`

### Indicators

- **Page Ready Indicator**: Menunggu halaman selesai load (timeout 30s)
- **Wait Indicator**: Menunggu indikator setelah action (timeout 10s)
- **Check Indicator**: Cek keberadaan indikator tanpa menunggu
- Support untuk selector, text, dan URL-based indicators

## Catatan penting (Playwright / environment)

- Runner berjalan **server-side** (Server Action).
- Di `src/lib/playwright-runner/index.js`, browser diluncurkan dengan `headless: false` (Chromium akan muncul).
  - Untuk CI / server tanpa display, ubah ke `headless: true`.
- Kredensial login (jika dipakai) ikut terkirim sebagai bagian dari plan → gunakan hanya untuk dev/test.

---

## Testing & Lint

```bash
npm run lint
```

```bash
npx playwright test
```

---

## Struktur proyek (ringkas)

```text
privylens/
├── public/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── runAutomation.js      # Server action untuk eksekusi
│   │   ├── automate/                 # route lama (redirect ke /)
│   │   │   └── page.jsx
│   │   ├── editor/
│   │   │   ├── components/
│   │   │   │   ├── actions/         # Action node components
│   │   │   │   │   ├── ActionNode.jsx
│   │   │   │   │   ├── ActionNodeEditor.jsx
│   │   │   │   │   └── ActionFlowSection.jsx
│   │   │   │   ├── data-source/     # Data source components
│   │   │   │   │   ├── AddDataSourceNode.jsx
│   │   │   │   │   └── DataSourceSection.jsx
│   │   │   │   ├── field-mapping/    # Field mapping components
│   │   │   │   │   └── FieldMappingSection.jsx
│   │   │   │   ├── execution/       # Execution & preview components
│   │   │   │   │   ├── AutomationPlanPreview.jsx
│   │   │   │   │   └── ExecutionReport.jsx
│   │   │   │   ├── nodes/           # Node components
│   │   │   │   │   ├── CardNode.jsx
│   │   │   │   │   └── PaletteNode.jsx
│   │   │   │   └── target/          # Target configuration
│   │   │   │       └── TargetConfiguration.jsx
│   │   │   ├── context/
│   │   │   │   └── EditorContext.jsx # Context untuk state management
│   │   │   ├── utils/               # Utility functions
│   │   │   │   ├── nodeHelpers.js
│   │   │   │   ├── edgeHelpers.js
│   │   │   │   └── validationHelpers.js
│   │   │   ├── layout.jsx
│   │   │   └── page.jsx              # Editor (node-based)
│   │   ├── layout.jsx
│   │   └── page.jsx                  # Home -> Editor
│   ├── components/
│   │   ├── Header.jsx
│   │   └── EditorProviderWrapper.jsx
│   └── lib/
│       ├── api.js                    # CSV/XLSX parsing
│       └── playwright-runner/       # Modular Playwright runner
│           ├── index.js              # Entry point
│           ├── loader.js             # Playwright loader
│           ├── normalize.js          # Plan normalizer
│           ├── login.js              # Login handler
│           ├── navigation.js         # Navigation handler
│           ├── actions.js            # Action executor
│           ├── elementFinder.js      # Element finder
│           ├── clickHandler.js       # Click handler
│           ├── humanType.js          # Human typing
│           ├── indicators.js         # Indicator handlers
│           ├── dialog.js             # Dialog handler
│           └── utils.js              # Utilities
└── tests/
    └── example.spec.js
```
