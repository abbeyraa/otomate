const toggle = document.getElementById("toggle");

const render = (on) => {
  toggle.dataset.on = String(on);
};

const load = async () => {
  const { privyLensEnabled } = await chrome.storage.sync.get({
    privyLensEnabled: true,
  });
  render(privyLensEnabled !== false);
};

toggle.addEventListener("click", async () => {
  const next = toggle.dataset.on !== "true";
  await chrome.storage.sync.set({ privyLensEnabled: next });
  render(next);
});

load();
