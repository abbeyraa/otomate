chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ privyLensEnabled: true }).catch(() => {});
});
