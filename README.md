# OtoMate — Automation Partner for Internal Operations

## Tentang OtoMate

OtoMate adalah platform automasi web berbasis **Playwright** yang dirancang khusus untuk penggunaan internal kantor dan developer. Aplikasi ini menyediakan sistem automasi yang terkontrol, dapat diamati, dan dapat dipertanggungjawabkan untuk mendukung operasional harian yang efisien dan andal.

OtoMate bukan sekadar alat otomatisasi klik, melainkan solusi automasi yang komprehensif dengan pendekatan terstruktur untuk merancang, menjalankan, dan memelihara proses automasi web dalam lingkungan kerja yang nyata.

---

## Masalah yang Diselesaikan

Dalam operasional internal, tim sering menghadapi tantangan:

- **Tugas Berulang yang Membosankan**: Pengisian form, input data, atau proses administratif yang dilakukan berulang kali menghabiskan waktu dan rentan terhadap kesalahan manusia.
- **Kurangnya Kontrol dan Observabilitas**: Proses automasi yang tidak transparan membuat sulit untuk memahami apa yang terjadi, mengapa terjadi kegagalan, atau bagaimana memperbaikinya.
- **Ketidakstabilan dan Perubahan UI**: Website yang sering berubah membutuhkan pemeliharaan automasi yang terus-menerus, namun tanpa mekanisme yang jelas untuk mendeteksi dan menangani perubahan tersebut.
- **Kurangnya Akuntabilitas**: Tidak ada catatan yang jelas tentang apa yang telah dijalankan, kapan, dan dengan hasil seperti apa, sehingga sulit untuk audit atau troubleshooting.

OtoMate dirancang untuk mengatasi semua tantangan ini dengan pendekatan yang sistematis dan berkelanjutan.

---

## Filosofi Desain

### 1. Kontrol Penuh atas Proses

Setiap automasi di OtoMate dimulai dari **Automation Plan** yang terdefinisi dengan jelas. Plan ini bukan hanya urutan aksi, melainkan dokumen yang menjelaskan tujuan, konteks, dan parameter eksekusi. Dengan pendekatan ini, setiap automasi dapat direview, dimodifikasi, dan dipertanggungjawabkan.

### 2. Observabilitas yang Komprehensif

OtoMate menyediakan visibilitas penuh terhadap proses automasi. Setiap eksekusi menghasilkan laporan detail yang mencakup status setiap langkah, waktu eksekusi, dan konteks kegagalan jika terjadi. Sistem logging yang terstruktur memungkinkan pelacakan historis dan analisis pola.

### 3. Keandalan Jangka Panjang

Dengan fitur **versioning** untuk Automation Plan, perubahan dapat dilacak dan di-rollback jika diperlukan. **Safe Run** mode memungkinkan pengujian tanpa risiko, sementara **Session Reuse** mengoptimalkan penggunaan sumber daya dan menjaga konsistensi eksekusi.

### 4. Inteligensi dalam Menangani Kegagalan

**Failure Intelligence** secara otomatis mengklasifikasikan kegagalan berdasarkan kategori (perubahan selector, validasi form, session expired, dll.) dan memberikan rekomendasi perbaikan yang dapat ditindaklanjuti. **Assisted Repair** mode memungkinkan intervensi manual saat diperlukan, dengan kemampuan untuk pause, perbaiki, dan resume secara deterministik.

### 5. Pembelajaran dan Adaptasi

**Inspector Mode** membantu pengguna memahami proses interaksi halaman web sebelum menyusun automasi. Dengan observasi yang sistematis, pengguna dapat merancang automasi yang lebih robust dan sesuai dengan karakteristik halaman target.

---

## Fitur Utama

### Automation Plan

Automation Plan adalah dokumen terstruktur yang mendefinisikan seluruh proses automasi, meliputi:

- **Target Configuration**: URL target, indikator kesiapan halaman, dan konfigurasi login jika diperlukan
- **Data Source**: Sumber data (CSV/XLSX atau manual) dan mode eksekusi (single atau batch)
- **Field Mapping**: Pemetaan field bisnis ke elemen halaman dengan dukungan multiple label dan fallback
- **Action Flow**: Urutan aksi yang akan dieksekusi (fill, click, wait, navigate, handleDialog)
- **Execution Configuration**: Mode eksekusi (once atau loop) dengan kondisi penghentian yang dapat dikonfigurasi
- **Success/Failure Indicators**: Indikator untuk mendeteksi keberhasilan atau kegagalan proses

Plan ini dapat disimpan, di-version, dan digunakan kembali untuk eksekusi berulang.

### Versioning

Setiap perubahan pada Automation Plan dapat disimpan sebagai versi baru. Sistem versioning memungkinkan:

- Pelacakan perubahan dari waktu ke waktu
- Rollback ke versi sebelumnya jika diperlukan
- Perbandingan antar versi untuk memahami evolusi plan
- Dokumentasi alasan perubahan melalui metadata versi

### Safe Run Mode

Safe Run adalah mode pengujian yang mengeksekusi automasi tanpa melakukan aksi yang bersifat permanen (seperti submit form). Mode ini berguna untuk:

- Memvalidasi logika automasi sebelum eksekusi penuh
- Menguji perubahan pada plan tanpa risiko
- Debugging dan troubleshooting tanpa mempengaruhi data produksi

### Session Reuse

Session Reuse mengoptimalkan penggunaan browser session untuk mengurangi overhead dan menjaga konsistensi. Fitur ini:

- Memanfaatkan session yang sudah ada untuk mengurangi waktu loading
- Menjaga state browser antar eksekusi untuk proses yang berhubungan
- Mengurangi konsumsi sumber daya dengan menghindari inisialisasi berulang

### Failure Intelligence

Sistem Failure Intelligence secara otomatis menganalisis kegagalan dan memberikan insight yang dapat ditindaklanjuti:

- **Klasifikasi Otomatis**: Mengkategorikan kegagalan berdasarkan pola error (selector change, label change, form validation, session expired, timing issue, dll.)
- **Severity Assessment**: Menentukan tingkat keparahan kegagalan (critical, high, medium, low)
- **Rekomendasi Perbaikan**: Menghasilkan saran spesifik untuk mengatasi masalah berdasarkan klasifikasi
- **Pattern Analysis**: Menganalisis pola kegagalan dari multiple failures untuk mengidentifikasi masalah sistemik

### Assisted Repair

Assisted Repair mode memungkinkan intervensi manual saat terjadi kegagalan:

- **Pause on Failure**: Otomatis pause saat kegagalan terdeteksi
- **Manual Intervention**: Pengguna dapat memperbaiki masalah secara manual di browser
- **Deterministic Resume**: Resume eksekusi dari titik yang tepat setelah perbaikan
- **State Preservation**: Menyimpan state eksekusi untuk recovery yang akurat

### Inspector Mode

Inspector Mode adalah alat observasi interaktif untuk memahami proses interaksi halaman web:

- **Browser Preview**: Membuka halaman target dalam browser nyata untuk observasi
- **Process Timeline**: Menampilkan events secara kronologis (navigation, loading, element appear, click, input, dll.)
- **Event Recording**: Mencatat berbagai jenis events untuk analisis
- **Action Flow Generation**: Mengkonversi selected events menjadi draft Automation Plan
- **Draft Management**: Menyimpan dan memuat draft untuk iterasi desain

---

## Arsitektur Teknis

OtoMate dibangun dengan teknologi modern untuk memastikan keandalan dan performa:

- **Frontend**: Next.js (App Router) dengan React untuk UI yang responsif dan interaktif
- **Node-based Editor**: Menggunakan `@xyflow/react` untuk visual editor yang intuitif
- **Automation Engine**: Playwright (Chromium) untuk eksekusi automasi yang robust
- **Modular Architecture**: Struktur kode yang modular untuk kemudahan maintenance dan pengembangan

### Struktur Runner

Playwright runner diorganisir dalam struktur modular:

- **Normalization**: Validasi dan normalisasi automation plan
- **Login Handler**: Manajemen proses autentikasi
- **Navigation Handler**: Penanganan navigasi dan routing
- **Action Executor**: Eksekusi berbagai jenis aksi dengan multiple strategies
- **Element Finder**: Pencarian elemen dengan berbagai strategi (selector, label, role, text, dll.)
- **Indicator Handlers**: Penanganan page ready, wait, dan check indicators
- **Dialog Handler**: Auto-handling untuk browser dialogs

---

## Penggunaan

### Prasyarat

- **Node.js** 18 atau lebih tinggi
- **npm** untuk manajemen dependensi

> **Catatan**: Repositori ini secara otomatis menginstall browser Playwright Chromium melalui script `postinstall`.

### Instalasi

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Akses aplikasi di `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Workflow Penggunaan

### 1. Merancang Automation Plan

Gunakan **Editor** untuk merancang Automation Plan dengan pendekatan visual:

- Konfigurasi target URL dan indikator kesiapan halaman
- Tambahkan sumber data (jika diperlukan) atau gunakan mode action-only
- Definisikan field mapping untuk data-driven automation
- Susun action flow dengan drag-and-drop node editor
- Konfigurasi execution mode dan indikator sukses/gagal

### 2. Observasi dengan Inspector (Opsional)

Sebelum menyusun plan, gunakan **Inspector Mode** untuk:

- Mengamati interaksi halaman secara real-time
- Mencatat events penting dalam timeline
- Generate draft action flow dari events yang terpilih

### 3. Pengujian dengan Safe Run

Sebelum eksekusi penuh, uji plan dengan **Safe Run Mode**:

- Validasi logika automasi tanpa risiko
- Identifikasi masalah potensial sebelum produksi
- Pastikan semua aksi dapat dieksekusi dengan benar

### 4. Eksekusi dan Monitoring

Jalankan automasi dan pantau proses:

- Eksekusi menghasilkan execution report yang detail
- Setiap langkah dicatat dengan status dan waktu
- Kegagalan otomatis dianalisis oleh Failure Intelligence

### 5. Penanganan Kegagalan

Jika terjadi kegagalan:

- Review klasifikasi dan rekomendasi dari Failure Intelligence
- Gunakan Assisted Repair untuk intervensi manual jika diperlukan
- Update Automation Plan berdasarkan insight yang diperoleh
- Simpan sebagai versi baru untuk pelacakan perubahan

---

## Keamanan dan Best Practices

### Kredensial dan Data Sensitif

- Kredensial login disimpan sebagai bagian dari Automation Plan → **Gunakan hanya untuk development/testing**
- Untuk produksi, pertimbangkan menggunakan environment variables atau sistem manajemen secret yang aman
- Jangan commit kredensial ke version control

### Safe Run untuk Testing

- Selalu uji plan baru dengan Safe Run mode sebelum eksekusi penuh
- Gunakan Safe Run untuk memvalidasi perubahan pada plan yang sudah ada

### Versioning dan Dokumentasi

- Simpan setiap perubahan signifikan sebagai versi baru
- Dokumentasikan alasan perubahan dalam metadata versi
- Review versi sebelumnya untuk memahami evolusi plan

### Monitoring dan Logging

- Review execution report secara rutin untuk mengidentifikasi pola kegagalan
- Gunakan Failure Intelligence untuk memahami akar masalah
- Maintain log eksekusi untuk audit dan troubleshooting

---

## Testing & Quality Assurance

```bash
# Linting
npm run lint

# Playwright tests
npx playwright test
```

---

## Struktur Proyek

```
otomate/
├── public/               # Static assets
├── src/
│   ├── app/
│   │   ├── actions/      # Server actions (runAutomation, startInspector)
│   │   ├── create-template/  # Template creation page
│   │   ├── editor/       # Main automation editor
│   │   │   ├── components/
│   │   │   │   ├── actions/        # Action node components
│   │   │   │   ├── data-source/    # Data source components
│   │   │   │   ├── execution/     # Execution & report components
│   │   │   │   ├── field-mapping/  # Field mapping components
│   │   │   │   ├── nodes/          # Base node components
│   │   │   │   └── target/         # Target configuration
│   │   │   ├── context/            # Editor state management
│   │   │   └── utils/              # Editor utilities
│   │   ├── inspector/    # Inspector mode page
│   │   ├── settings/     # Application settings
│   │   └── templates/    # Automation plan templates
│   ├── components/        # Shared UI components
│   └── lib/
│       ├── api.js                    # CSV/XLSX parsing
│       ├── assistedRepair.js         # Assisted repair utilities
│       ├── failureIntelligence.js    # Failure analysis system
│       ├── inspectorRecorder.js     # Inspector event recording
│       └── playwright-runner/        # Modular Playwright runner
│           ├── index.js              # Entry point
│           ├── loader.js             # Playwright loader
│           ├── normalize.js          # Plan normalizer
│           ├── login.js              # Login handler
│           ├── navigation.js         # Navigation handler
│           ├── actions.js            # Action executor
│           ├── elementFinder.js      # Element finder
│           ├── clickHandler.js       # Click handler
│           ├── humanType.js          # Human-like typing
│           ├── indicators.js         # Indicator handlers
│           ├── dialog.js             # Dialog handler
│           └── utils.js              # Utilities
└── tests/                # Test files
```

---

## Visi Jangka Panjang

OtoMate dirancang sebagai alat kerja jangka panjang yang:

- **Stabil dan Dapat Diandalkan**: Arsitektur yang solid dan praktik pengembangan yang baik memastikan aplikasi dapat diandalkan untuk penggunaan sehari-hari
- **Mudah Dipelihara**: Struktur modular dan dokumentasi yang jelas memudahkan maintenance dan pengembangan lebih lanjut
- **Dapat Dikembangkan**: Ekstensibilitas memungkinkan penambahan fitur baru sesuai kebutuhan operasional
- **Berfokus pada Workflow Nyata**: Setiap fitur dirancang untuk menyelesaikan masalah nyata dalam lingkungan kerja internal

---

## Kontribusi dan Dukungan

OtoMate adalah aplikasi internal yang dikembangkan untuk mendukung operasional perusahaan. Untuk pertanyaan, saran, atau laporan masalah, silakan hubungi tim pengembang internal.

---

## Lisensi

Aplikasi ini adalah proprietary software untuk penggunaan internal perusahaan.

---

**OtoMate** — Automation Partner for Internal Operations

_Mengotomatisasi dengan kontrol, observabilitas, dan akuntabilitas._

---

## Documentation: TEMPLATE_STORAGE.md

### Template Storage - LocalStorage Implementation

## ?? Overview

Template storage menggunakan `localStorage` dengan key `otomate_templates`.

## ??? Lokasi Penyimpanan

- Browser `localStorage` pada key `otomate_templates`

## ?? Struktur Implementasi

### Frontend Service

- **File**: `src/lib/templateStorage.js`
- **Fungsi**:
  - `getTemplates()` - Membaca template dari localStorage
  - `saveTemplates(templates)` - Menyimpan template ke localStorage
  - `getStorageInfo()` - Info ringkas tentang storage

## ?? Penggunaan

### Di Component React

```javascript
import { getTemplates, saveTemplates } from "@/lib/templateStorage";

// Read templates
const templates = await getTemplates();

// Save templates
const success = await saveTemplates(templates);
```

## ? Keuntungan

1. **Sederhana**: Tidak memerlukan service tambahan
2. **Cepat**: Akses data tersimpan langsung di browser
3. **Ringan**: Cocok untuk kebutuhan internal
4. **No Dependencies**: Tidak perlu install database library

## ?? Debugging

### Check Storage Info

```javascript
import { getStorageInfo } from "@/lib/templateStorage";

const info = await getStorageInfo();
console.log(info);
// Output: { type: 'localStorage', size: 1234, templateCount: 5 }
```

## ?? Catatan Penting

1. **Format Data**: Disimpan sebagai JSON
2. **Error Handling**: Semua error di-handle dengan fallback ke localStorage
3. **Data Validation**: Template harus berupa array, invalid data akan di-reject

---

## Documentation: FAILURE_INTELLIGENCE.md

### Failure Intelligence & Assisted Repair Mode

## Overview

Sistem ini mengubah kegagalan automation dari error mentah menjadi informasi terstruktur yang dapat dipahami, diperbaiki, dan dilanjutkan tanpa mengulang proses dari awal.

## Failure Intelligence

### Klasifikasi Kegagalan

Sistem mengklasifikasikan kegagalan ke dalam kategori berikut:

1. **Selector Change** - Selector element tidak ditemukan atau berubah
2. **Label Change** - Label atau teks field tidak ditemukan
3. **Form Validation** - Validasi form gagal atau data tidak valid
4. **Session Expired** - Sesi login telah kadaluarsa
5. **Timing Issue** - Masalah timing atau delay yang tidak cukup
6. **Page Loading** - Halaman membutuhkan waktu loading lebih lama
7. **UI Change** - Perubahan UI atau elemen tidak terlihat
8. **Network Error** - Masalah koneksi jaringan atau server
9. **Element Not Found** - Elemen tidak ditemukan
10. **Action Failed** - Action gagal dieksekusi
11. **Unknown** - Kegagalan tidak dapat diklasifikasikan

### Metadata Kegagalan

Setiap kegagalan menyimpan metadata terstruktur:

- Error message dan stack trace
- Klasifikasi dengan confidence level
- Context eksekusi (row index, action index, field, dll.)
- Metadata browser dan viewport

### Rekomendasi Perbaikan

Sistem menghasilkan rekomendasi praktis berdasarkan klasifikasi:

- Langkah-langkah perbaikan spesifik
- Prioritas (critical, high, medium, low)
- Action yang disarankan (check_label, add_fallback, dll.)

### Execution Report dengan Intelligence

Report menampilkan:

- Analisis pola kegagalan (frekuensi kategori)
- Rekomendasi perbaikan untuk setiap kegagalan
- User-friendly messages (bukan error teknis)
- Summary dengan distribusi kegagalan

## Assisted Repair Mode

### Fitur

1. **Pause on Failure** - Automation pause saat terjadi kegagalan
2. **Browser State Preservation** - Browser tetap terbuka di state terakhir
3. **Manual Repair** - User dapat melakukan perbaikan manual di browser
4. **Resume Options**:
   - **Continue** - Lanjutkan ke baris berikutnya (skip row saat ini)
   - **Retry** - Ulangi action yang gagal
   - **Skip Row** - Skip baris saat ini
   - **Abort** - Hentikan batch

### State Management

Execution state disimpan untuk recovery deterministik:

- Row index dan action index
- Data row yang sedang diproses
- Page URL dan state
- Failure metadata

### UI Components

- **AssistedRepairDialog** - Dialog untuk memilih tindakan perbaikan
- Toggle "Assisted Repair" di editor
- Informasi kegagalan dengan rekomendasi
- Progress indicator

## Implementasi

### Files

1. `src/lib/failureIntelligence.js` - Sistem klasifikasi dan analisis
2. `src/lib/assistedRepair.js` - State management untuk repair mode
3. `src/app/editor/components/execution/IntelligentExecutionReport.jsx` - Report dengan intelligence
4. `src/app/editor/components/execution/AssistedRepairDialog.jsx` - UI untuk repair mode
5. `src/lib/playwright-runner/actions.js` - Integrasi failure intelligence ke runner

### Integrasi

Failure Intelligence terintegrasi di:

- `executeAction()` - Menangkap error dan membuat metadata
- `executeActionsForRow()` - Menyertakan context untuk klasifikasi
- Execution report - Menampilkan intelligence dan rekomendasi

## Usage

### Mengaktifkan Assisted Repair Mode

1. Centang checkbox "Assisted Repair" di editor
2. Jalankan automation plan
3. Saat terjadi kegagalan, dialog akan muncul
4. Browser tetap terbuka untuk perbaikan manual
5. Pilih tindakan perbaikan dan klik "Terapkan"

### Melihat Intelligence Report

1. Setelah execution selesai, buka panel "Preview & Report"
2. Report menampilkan:
   - Analisis pola kegagalan
   - Rekomendasi perbaikan untuk setiap kegagalan
   - User-friendly messages

## Catatan Implementasi

**Assisted Repair Mode dengan Pause/Resume Real-time**:

- Implementasi saat ini menyediakan UI dan struktur dasar
- Untuk pause/resume real-time, diperlukan komunikasi WebSocket atau polling antara client dan server-side runner
- Browser state preservation memerlukan modifikasi runner untuk tidak menutup browser saat failure
- Resume logic memerlukan mekanisme untuk melanjutkan dari state yang disimpan

**Future Enhancements**:

- WebSocket connection untuk real-time communication
- Browser state persistence across repair sessions
- Automatic retry dengan exponential backoff
- Historical failure analysis dashboard
- Auto-fix suggestions berdasarkan pattern learning

---

## Documentation: INSPECTOR_GUIDE.md

### Interactive Automation Inspector Guide

## Overview

Interactive Automation Inspector adalah fitur yang memungkinkan pengguna mengamati dan memahami proses interaksi halaman web sebelum menyusun Automation Plan. Fitur ini membantu mengidentifikasi langkah-langkah yang diperlukan dalam automasi tanpa harus menebak atau melakukan trial and error.

## Fitur Utama

### 1. Browser Preview dengan Observasi

- Membuka halaman target dalam browser nyata (Playwright)
- Mode observasi tanpa eksekusi automasi
- Browser tetap terbuka untuk interaksi manual
- Real-time monitoring perubahan halaman

### 2. Process Timeline

- Menampilkan events secara kronologis
- Real-time update saat events terjadi
- Filter untuk menampilkan hanya events penting
- Visual timeline dengan icon dan color coding

### 3. Event Recording

Sistem mencatat berbagai jenis events:

- **Navigation** - Perubahan URL
- **Loading** - Status loading halaman
- **Network Idle** - Tidak ada request network aktif
- **Element Appear/Disappear** - Kemunculan/hilangnya elemen UI
- **Click** - Klik pengguna
- **Input** - Input data ke field
- **Submit** - Submit form
- **Modal/Toast** - Kemunculan modal atau toast notification
- **Spinner** - Loading spinner

### 4. Event Management

- **Select Events** - Pilih events untuk dijadikan action flow
- **Mark as Important** - Tandai events penting
- **Filter** - Tampilkan hanya events penting
- **View Details** - Lihat detail setiap event

### 5. Action Flow Generation

- Generate draft action flow dari selected events
- Konversi otomatis events ke actions:
  - Navigation → navigate action
  - Click → click action
  - Input → fill action
  - Network Idle/Element Appear → wait action
- Export ke Editor untuk editing lebih lanjut

### 6. Draft Management

- **Save Draft** - Simpan events dan selections
- **Load Draft** - Muat draft yang sudah disimpan
- **Import to Editor** - Import langsung ke Automation Plan editor

## Cara Menggunakan

### 1. Membuka Inspector

1. Klik menu "Inspector" di sidebar
2. Masukkan URL target di input field
3. Klik "Mulai Inspection"

### 2. Mengamati Halaman

- Browser Playwright akan terbuka dengan halaman target
- Interaksi manual di browser akan direkam sebagai events
- Events muncul secara real-time di timeline

### 3. Menandai Events Penting

- Klik icon check/cross di event card untuk menandai sebagai penting
- Gunakan filter "Hanya penting" untuk menyederhanakan view

### 4. Memilih Events untuk Action Flow

- Klik event card untuk memilih/deselect
- Selected events akan ditandai dengan border biru
- Pilih minimal satu event untuk generate action flow

### 5. Generate Action Flow

1. Pilih events yang ingin dijadikan actions
2. Klik "Generate Action Flow"
3. Pilih:
   - **OK** - Buka di Editor untuk editing
   - **Cancel** - Copy ke clipboard

### 6. Import ke Editor

- Jika memilih "OK", akan diarahkan ke Editor
- Actions akan otomatis ditambahkan ke canvas
- Actions dapat diedit seperti biasa

## Event Types dan Konversi

| Event Type     | Konversi ke Action | Keterangan                       |
| -------------- | ------------------ | -------------------------------- |
| Navigation     | `navigate`         | Navigate ke URL                  |
| Click          | `click`            | Click element                    |
| Input          | `fill`             | Fill field (perlu field mapping) |
| Network Idle   | `wait`             | Wait for network idle            |
| Element Appear | `wait`             | Wait for element dengan selector |
| Submit         | `click`            | Click submit button              |

## Tips Penggunaan

1. **Mulai dengan URL Target**

   - Pastikan URL target valid dan dapat diakses
   - Gunakan URL lengkap dengan protocol (https://)

2. **Tandai Events Penting**

   - Tandai events yang kritis untuk automasi
   - Contoh: Network Idle, Element Appear untuk form

3. **Pilih Events Secara Selektif**

   - Tidak semua events perlu dijadikan actions
   - Pilih events yang relevan dengan flow automasi

4. **Review di Editor**

   - Actions yang diimport perlu direview dan disesuaikan
   - Tambahkan field mappings untuk fill actions
   - Sesuaikan selectors jika perlu

5. **Save Draft**
   - Simpan draft jika ingin melanjutkan nanti
   - Berguna untuk iterasi dan perbaikan

## Integrasi dengan Editor

Actions yang diimport dari Inspector:

- Otomatis ditambahkan sebagai action nodes di canvas
- Terhubung secara sequential
- Dapat diedit seperti actions biasa
- Target URL otomatis diisi jika tersedia

## Catatan Implementasi

**Browser Preview**:

- Saat ini menggunakan placeholder UI
- Untuk implementasi penuh, diperlukan integrasi dengan Playwright browser instance
- Browser harus tetap terbuka selama inspection

**Event Recording**:

- `inspectorRecorder.js` menyediakan fungsi untuk setup listeners
- Real-time events memerlukan WebSocket atau polling mechanism
- Saat ini menggunakan simulasi events untuk demo

**Future Enhancements**:

- Real-time browser preview dengan iframe atau screenshot
- WebSocket connection untuk real-time events
- Screenshot capture untuk setiap event
- Video recording dari inspection session
- Auto-detect form fields dan generate field mappings
- Smart recommendations berdasarkan event patterns
