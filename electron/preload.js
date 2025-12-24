// Preload script untuk Electron
// File ini berjalan di context terisolasi sebelum halaman dimuat
// Bisa digunakan untuk expose API yang aman ke renderer process

const { contextBridge } = require('electron');

// Expose protected methods yang memungkinkan renderer process
// menggunakan API Electron dengan aman
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

