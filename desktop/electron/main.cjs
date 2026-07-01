const path = require("node:path");
const fs = require("node:fs");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

const rootDir = path.resolve(__dirname, "..", "..");
let mainWindow = null;

function loadSaveLayout() {
  try {
    const layoutPath = path.join(rootDir, "desktop", "steam", "save-layout.json");
    return JSON.parse(fs.readFileSync(layoutPath, "utf8"));
  } catch {
    return {
      appDataDirectory: "variable-city-nightwatch",
    };
  }
}

const saveLayout = loadSaveLayout();

function getGameSaveRoot() {
  const directory = saveLayout.appDataDirectory ?? "variable-city-nightwatch";
  return path.join(app.getPath("appData"), directory);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "变量城夜巡",
    backgroundColor: "#f6f8fb",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (process.env.VARIABLE_CITY_DEVTOOLS === "1") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.loadFile(path.join(rootDir, "index.html"));
}

app.whenReady().then(() => {
  ipcMain.on("variable-city:get-user-data-path", (event) => {
    event.returnValue = getGameSaveRoot();
  });

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
