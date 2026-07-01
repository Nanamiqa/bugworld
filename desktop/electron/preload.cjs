const fs = require("node:fs");
const path = require("node:path");
const { contextBridge, ipcRenderer } = require("electron");

const fallbackSaveLayout = {
  appDataDirectory: "variable-city-nightwatch",
  saveSubdirectory: "saves",
  filePrefix: "variable-city-",
  cloudPattern: "variable-city-*.json",
  steamAutoCloud: {
    windowsRoot: "WinAppDataRoaming",
    windowsSubdirectory: "variable-city-nightwatch/saves",
    recursive: false,
    pattern: "variable-city-*.json",
  },
  slots: [
    { key: "variableCityArchive", file: "variable-city-variableCityArchive.json", label: "Archive", cloud: true },
    { key: "variableCityRunSave", file: "variable-city-variableCityRunSave.json", label: "Run checkpoint", cloud: true },
    { key: "variableCitySettings", file: "variable-city-variableCitySettings.json", label: "Settings", cloud: true },
    { key: "variableCityAchievements", file: "variable-city-variableCityAchievements.json", label: "Local achievements", cloud: true },
  ],
};

function loadSaveLayout() {
  try {
    const layoutPath = path.resolve(__dirname, "..", "steam", "save-layout.json");
    return {
      ...fallbackSaveLayout,
      ...JSON.parse(fs.readFileSync(layoutPath, "utf8")),
    };
  } catch {
    return fallbackSaveLayout;
  }
}

const saveLayout = loadSaveLayout();
const saveFilePrefix = saveLayout.filePrefix ?? fallbackSaveLayout.filePrefix;
const slotByKey = new Map((saveLayout.slots ?? []).map((slot) => [slot.key, slot]));

function getUserDataPath() {
  try {
    const userDataPath = ipcRenderer.sendSync("variable-city:get-user-data-path");
    if (typeof userDataPath === "string" && userDataPath.trim()) {
      return userDataPath;
    }
  } catch {
    // Fall back below when the app is launched in an unusual test harness.
  }
  return path.join(process.cwd(), ".variable-city-user-data");
}

const userDataPath = getUserDataPath();
const saveDir = path.join(userDataPath, saveLayout.saveSubdirectory ?? "saves");

function sanitizeKey(key) {
  return String(key ?? "save")
    .trim()
    .replace(/[^a-z0-9_.-]/gi, "_")
    .slice(0, 80) || "save";
}

function savePathFor(key) {
  const slot = slotByKey.get(String(key));
  const fileName = slot?.file ?? `${saveFilePrefix}${sanitizeKey(key)}.json`;
  return path.join(saveDir, fileName);
}

function ensureSaveDir() {
  fs.mkdirSync(saveDir, { recursive: true });
}

function readJson(key, fallback = null) {
  try {
    const filePath = savePathFor(key);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    ensureSaveDir();
    const filePath = savePathFor(key);
    const tempPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(value, null, 2), "utf8");
    fs.renameSync(tempPath, filePath);
    return true;
  } catch {
    return false;
  }
}

function remove(key) {
  try {
    const filePath = savePathFor(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch {
    return false;
  }
}

function listFiles() {
  try {
    if (!fs.existsSync(saveDir)) {
      return [];
    }
    return fs.readdirSync(saveDir)
      .filter((fileName) => fileName.startsWith(saveFilePrefix) && fileName.endsWith(".json"))
      .map((fileName) => {
        const filePath = path.join(saveDir, fileName);
        const stats = fs.statSync(filePath);
        return {
          file: fileName,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
        };
      });
  } catch {
    return [];
  }
}

function describeStorage() {
  return {
    mode: "file",
    label: "JSON files",
    userDataPath,
    saveDir,
    cloudPattern: saveLayout.cloudPattern ?? `${saveFilePrefix}*.json`,
    steamAutoCloud: saveLayout.steamAutoCloud ?? fallbackSaveLayout.steamAutoCloud,
    slots: (saveLayout.slots ?? []).map((slot) => ({
      key: slot.key,
      file: slot.file,
      label: slot.label,
      cloud: Boolean(slot.cloud),
    })),
    files: listFiles(),
  };
}

function getGamepads() {
  if (!navigator.getGamepads) {
    return [];
  }

  return Array.from(navigator.getGamepads())
    .filter(Boolean)
    .map((pad) => ({
      id: pad.id,
      connected: pad.connected,
      axes: Array.from(pad.axes ?? []),
      buttons: Array.from(pad.buttons ?? []).map((button) => ({
        pressed: Boolean(button.pressed),
        value: Number(button.value ?? 0),
      })),
    }));
}

function unlockAchievement(id) {
  const achievementId = String(id ?? "").trim();
  if (!achievementId) {
    return false;
  }

  const unlocked = readJson("variableCityAchievements", []);
  const list = Array.isArray(unlocked) ? unlocked : [];
  if (list.includes(achievementId)) {
    return false;
  }

  list.push(achievementId);
  return writeJson("variableCityAchievements", list);
}

contextBridge.exposeInMainWorld("VariableCityPlatform", {
  id: "electron",
  label: "Steam Desktop",
  isDesktop: true,
  userDataPath,
  saveDir,
  supportsFullscreen: true,
  supportsGamepad: true,
  storage: {
    readJson,
    writeJson,
    remove,
    listFiles,
    describe: describeStorage,
  },
  requestFullscreen: async () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      return true;
    }
    return false;
  },
  exitFullscreen: async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    }
    return false;
  },
  isFullscreen: () => Boolean(document.fullscreenElement),
  getGamepads,
  unlockAchievement,
  steamCloud: describeStorage().steamAutoCloud,
});
