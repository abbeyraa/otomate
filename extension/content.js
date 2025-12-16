(() => {
  let enabled = true;
  let config = null;
  let observer = null;
  let running = false;

  const log = (...args) => console.info("[PrivyLens]", ...args);
  const warn = (...args) => console.warn("[PrivyLens]", ...args);

  const loadToggle = async () => {
    try {
      const { privyLensEnabled } = await chrome.storage.sync.get({
        privyLensEnabled: true,
      });
      enabled = privyLensEnabled !== false;
    } catch (err) {
      warn("Gagal baca toggle, fallback ON", err);
      enabled = true;
    }
  };

  const watchToggle = () => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;
      if (changes.privyLensEnabled) {
        enabled = changes.privyLensEnabled.newValue !== false;
        log("Toggle berubah:", enabled);
        if (enabled) maybeStart();
      }
    });
  };

  const loadConfig = async () => {
    try {
      const res = await fetch(chrome.runtime.getURL("config.json"));
      config = await res.json();
      log("Config dimuat", config);
    } catch (err) {
      warn("Gagal memuat config.json", err);
      config = null;
    }
  };

  const nativeSetValue = (el, value) => {
    const setter =
      Object.getOwnPropertyDescriptor(el.__proto__, "value")?.set ||
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const findByText = (selectors, text) => {
    const lower = text.trim().toLowerCase();
    for (const sel of selectors) {
      const nodes = document.querySelectorAll(sel);
      for (const n of nodes) {
        const t = (n.textContent || n.value || "").trim().toLowerCase();
        if (t.includes(lower)) return n;
      }
    }
    return null;
  };

  const waitForElement = (selector, timeout = 5000) =>
    new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      const obs = new MutationObserver(() => {
        const node = document.querySelector(selector);
        if (node) {
          obs.disconnect();
          resolve(node);
        }
      });
      obs.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      setTimeout(() => {
        obs.disconnect();
        reject(new Error("timeout"));
      }, timeout);
    });

  const clickOpenButton = async () => {
    if (!config?.openButton) return;
    const { selector, text } = config.openButton;
    let target = null;
    if (selector) {
      try {
        target = document.querySelector(selector);
      } catch (err) {
        warn("Selector openButton invalid", selector, err);
      }
    }
    if (!target && text) {
      target = findByText(
        [
          "button",
          "a",
          "[role=button]",
          "input[type=button]",
          "input[type=submit]",
        ],
        text
      );
    }
    if (target) {
      log("Klik tombol pembuka form", target);
      target.click();
    } else {
      warn("Tombol pembuka tidak ditemukan");
    }
  };

  const fillFields = () => {
    if (!config?.mappings?.length || !config?.data) return;
    for (const mapping of config.mappings) {
      const { selector, name, text } = mapping;
      let el = null;
      if (selector) {
        try {
          el = document.querySelector(selector);
        } catch (err) {
          warn("Selector mapping invalid", selector, err);
        }
      }
      if (!el && name) {
        el = document.querySelector(`[name="${name}"]`);
      }
      if (!el && text) {
        el = findByText(["label", "button", "a"], text);
      }
      if (!el) {
        warn("Elemen tidak ditemukan untuk mapping", mapping);
        continue;
      }
      const value = config.data[mapping.variable];
      if (value === undefined) {
        warn("Data untuk variabel kosong", mapping.variable);
        continue;
      }
      if ("value" in el) {
        nativeSetValue(el, value);
        log("Set value", mapping.variable, "->", selector || name || text);
      } else {
        el.textContent = value;
      }
    }
  };

  const maybeStart = async () => {
    if (running || !enabled) return;
    running = true;
    if (!config) await loadConfig();
    if (!config) {
      running = false;
      return;
    }
    try {
      await clickOpenButton();
      fillFields();
    } catch (err) {
      warn("Automation error", err);
    } finally {
      running = false;
    }
  };

  const attachObserver = () => {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      if (enabled) maybeStart();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  };

  const init = async () => {
    await loadToggle();
    watchToggle();
    attachObserver();
    maybeStart();
  };

  init();
})();
