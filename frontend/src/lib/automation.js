/**
 * Generate automation script untuk pengisian form
 * @param {Object} params - Parameter untuk generate script
 * @param {Array} params.activeMappings - Array mapping selector ke variabel
 * @param {string} params.template - Template string dengan placeholder {{var}}
 * @param {Array} params.activeRows - Array data rows yang akan diproses
 * @param {boolean} params.postMode - Mode post (auto submit)
 * @param {boolean} params.inputAllRows - Mode input semua rows
 * @param {string} params.targetUrl - URL target (opsional)
 * @param {boolean} params.needOpenButton - Apakah perlu klik tombol untuk membuka form
 * @param {string} params.openButtonSelector - CSS selector tombol pembuka form
 * @returns {string} Generated script sebagai string
 */
export function generateAutomationScript({
  activeMappings,
  template,
  activeRows,
  postMode,
  inputAllRows,
  targetUrl = "",
  needOpenButton = false,
  openButtonSelector = "",
}) {
  const script = `
// Script otomatisasi pengisian form (manual console)
// Options di-generate dari UI:
const options = { post: ${postMode}, inputAllRows: ${inputAllRows} };

// === Resume automation state ===
const RESUME_KEY = "__pl_resume_index";
const startIndex = Number(localStorage.getItem(RESUME_KEY) || 0);
if (startIndex > 0) {
  console.info("Resume automation dari row:", startIndex + 1);
}
    ${
      targetUrl
        ? `if (!location.href.includes("${targetUrl}")) { console.warn("Buka halaman target: ${targetUrl}"); }`
        : ""
    }

if (options.post) {
  try {
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = () => "";
    console.info("Popup (alert/confirm/prompt) dimatikan sementara.");
    const closeDialogs = () => {
      document.querySelectorAll('dialog[open]').forEach((d) => {
        try { d.close(); } catch (_) {}
      });
      document.querySelectorAll("[role='dialog'], [aria-modal='true'], .modal, .modal-overlay, [class*='modal']").forEach((el) => {
        const btn = el.querySelector(
          "[data-dismiss], [data-bs-dismiss], .btn-close, .close, button[aria-label='Close'], button, [role='button']"
        );
        if (btn) { try { btn.click(); } catch (_) {} }
        el.style.display = 'none';
      });
      document.querySelectorAll(".modal button, dialog button, [aria-modal='true'] button").forEach((btn) => {
        const label = (btn.textContent || btn.innerText || '').toLowerCase();
        if (label.includes('tutup') || label.includes('close') || label.includes('ok')) {
          try { btn.click(); } catch (_) {}
        }
      });
    };
    closeDialogs();
    const dialogCloser = setInterval(closeDialogs, 5000);
    window.__pl_stop_close_dialogs = () => clearInterval(dialogCloser);
  } catch (e) {
    console.warn("Gagal meng-override popup:", e);
  }
}

const mappings = ${JSON.stringify(activeMappings, null, 2)};
const template = ${JSON.stringify(template)};
const delayMs = 5000;

// === Intercept submit agar halaman tidak reload ===
if (options.post && !window.__pl_submit_patched) {
  window.__pl_submit_patched = true;

  document.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.info("Form submit dicegah oleh automation.");
    },
    true
  );
}

function findElement(selector) {
  try {
    return (
      document.querySelector(selector) ||
      document.querySelector(\`[name="\${selector}"]\`) ||
      document.querySelector(\`#\${selector}\`)
    );
  } catch {
    return null;
  }
}


function fillFromPayload(payload) {
  const resolvedTemplate = template.replace(/{{(\\w+)}}/g, (_, key) => payload[key] ?? "");
  console.info("Template terisi:", resolvedTemplate);

  mappings.forEach(({ selector, variable }) => {
    const el = findElement(selector);
    if (!el) { console.warn("Elemen tidak ditemukan:", selector); return; }
    const value = payload[variable] ?? "";
    if ("value" in el) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      el.textContent = value;
    }
  });
  console.info("Payload yang digunakan:", payload);
}

function postIfNeeded() {
  if (!options.post) return;
  const submit =
    document.querySelector("button[type='submit'], input[type='submit'], button:not([type])") || null;
  if (submit) {
    console.info("Mengklik tombol submit:", submit);
    submit.click();
  } else {
    console.warn("Tombol submit tidak ditemukan.");
  }
}

async function waitForInput(selector, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (document.querySelector(selector)) return true;
    await wait(200);
    console.info("Form harusnya sudah siap sekarang");
  }
  return false;
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function openFormIfNeeded() {
  const raw = ${JSON.stringify(openButtonSelector || "")}.trim();
  if (!raw) return;

  // 1) Deteksi kalau ini HTML <a ...>
  const looksLikeHtml = raw.startsWith("<") && raw.includes(">");

  let selector = raw;
  let byText = "";

  if (looksLikeHtml) {
    const hrefMatch = raw.match(/href\s*=\s*["']([^"']+)["']/i);
    const textMatch = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    if (hrefMatch?.[1]) {
      const href = hrefMatch[1];

      // bikin selector paling stabil
      // prioritas: href path relatif
      try {
        const u = new URL(href, location.origin);
        const path = u.pathname + (u.search || "");
        selector = \`a[href="\${path}"], a[href="\${href}"]\`;
      } catch {
        selector = \`a[href="\${href}"]\`;
      }
    } else if (textMatch) {
      byText = textMatch.toLowerCase();
      selector = "";
    }
  }

  // 2) Coba sebagai CSS selector (kalau valid)
  let openButton = null;
  if (selector) {
    try {
      openButton = document.querySelector(selector);
    } catch (e) {
      // selector invalid -> fallback ke text
      selector = "";
    }
  }

  // 3) Fallback: cari berdasarkan teks tombol
  if (!openButton) {
    const text = (byText || raw).trim().toLowerCase();
    if (text) {
      const candidates = Array.from(
        document.querySelectorAll("a, button, [role='button'], input[type='button'], input[type='submit']")
      );
      openButton = candidates.find((el) =>
        (el.textContent || el.value || "").trim().toLowerCase().includes(text)
      );
    }
  }

  if (openButton) {
    console.info("Mengklik tombol untuk membuka form:", openButton);
    openButton.click();
    await wait(800);
    console.info("Form harusnya sudah siap sekarang");
  } else {
    console.warn("Tombol pembuka form tidak ditemukan:", raw);
  }
}


const rowsData = ${JSON.stringify(activeRows, null, 2)};

(async () => {
  await openFormIfNeeded();

  if (options.inputAllRows) {
    for (let i = startIndex; i < rowsData.length; i++) {
      const payload = rowsData[i] || {};
      console.group(\`Row \${i + 1}\`);
      fillFromPayload(payload);
      console.groupEnd();

      // === SIMPAN PROGRESS SEBELUM SUBMIT / NAVIGASI ===
      localStorage.setItem(RESUME_KEY, String(i + 1));

      postIfNeeded();

      if (i < rowsData.length - 1) {
        await wait(delayMs);
        console.info("Form harusnya sudah siap sekarang");
      }
    }
    // === SELESAI SEMUA ROW ===
    localStorage.removeItem(RESUME_KEY);
  } else {
    localStorage.removeItem(RESUME_KEY);
    const payload = rowsData[0] || {};
    fillFromPayload(payload);
    postIfNeeded();
  }

  if (window.__pl_stop_close_dialogs) {
    window.__pl_stop_close_dialogs();
  }

})();`;

  return script;
}
