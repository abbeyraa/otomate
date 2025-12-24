const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let nextServer;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const PORT = process.env.PORT || 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/logo.png"),
    show: false, // Jangan tampilkan sampai siap
  });

  // Tampilkan window setelah siap
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Load aplikasi
  const url = `http://localhost:${PORT}`;
  mainWindow.loadURL(url);

  // Handle navigation errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      if (errorCode === -106) {
        // ERR_INTERNET_DISCONNECTED atau server belum siap
        console.log("Waiting for server to start...");
        setTimeout(() => {
          mainWindow.reload();
        }, 1000);
      }
    }
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function startNextServer() {
  if (isDev) {
    // Development: jalankan Next.js dev server
    nextServer = spawn("npm", ["run", "dev"], {
      cwd: path.join(__dirname, ".."),
      shell: true,
      stdio: "inherit",
    });

    nextServer.on("error", (err) => {
      console.error("Failed to start Next.js server:", err);
    });
  } else {
    // Production: jalankan Next.js standalone server
    let nextPath;
    if (app.isPackaged) {
      // Ketika di-packaged dengan asarUnpack, file ada di app.asar.unpacked
      // atau di resourcesPath/app
      const appPath = app.getAppPath();
      nextPath = path.join(appPath, ".next", "standalone");

      // Fallback jika tidak ditemukan
      if (!require("fs").existsSync(nextPath)) {
        nextPath = path.join(
          process.resourcesPath,
          "app",
          ".next",
          "standalone"
        );
      }
    } else {
      // Development build (setelah npm run build, sebelum packaging)
      nextPath = path.join(__dirname, "..", ".next", "standalone");
    }

    const serverPath = path.join(nextPath, "server.js");

    // Set environment variables untuk Next.js
    const env = {
      ...process.env,
      PORT: PORT.toString(),
      HOSTNAME: "localhost",
      NODE_ENV: "production",
    };

    // Set path untuk static files (Next.js akan otomatis mencari di parent folder)
    if (app.isPackaged) {
      const appPath = app.getAppPath();
      let staticPath = path.join(appPath, ".next", "static");

      // Fallback jika tidak ditemukan
      if (!require("fs").existsSync(staticPath)) {
        staticPath = path.join(process.resourcesPath, "app", ".next", "static");
      }
      env.NEXT_STATIC_FOLDER = staticPath;
    } else {
      const staticPath = path.join(__dirname, "..", ".next", "static");
      env.NEXT_STATIC_FOLDER = staticPath;
    }

    console.log("Starting Next.js server from:", nextPath);
    console.log("Server file:", serverPath);

    nextServer = spawn("node", [serverPath], {
      cwd: nextPath,
      shell: true,
      stdio: "inherit",
      env: env,
    });

    nextServer.on("error", (err) => {
      console.error("Failed to start Next.js server:", err);
      console.error("Server path:", serverPath);
      console.error("Next path:", nextPath);
      console.error("App path:", app.getAppPath());
      console.error("Resources path:", process.resourcesPath);
    });

    nextServer.on("exit", (code) => {
      console.log(`Next.js server exited with code ${code}`);
    });
  }
}

app.whenReady().then(() => {
  startNextServer();

  // Tunggu server siap sebelum membuat window
  setTimeout(
    () => {
      createWindow();
    },
    isDev ? 3000 : 2000
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (nextServer) {
      nextServer.kill();
    }
    app.quit();
  }
});

app.on("before-quit", () => {
  if (nextServer) {
    nextServer.kill();
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
