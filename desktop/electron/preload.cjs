const fs = require("node:fs");
const path = require("node:path");
const { contextBridge, ipcRenderer } = require("electron");

const saveFilePrefix = "variable-city-";

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
const saveDir = path.join(userDataPath, "saves");

function sanitizeKey(key) {
  return String(key ?? "save")
    .trim()
    .replace(/[^a-z0-9_.-]/gi, "_")
    .slice(0, 80) || "save";
}

function savePathFor(key) {
  return path.join(saveDir, `${saveFilePrefix}${sanitizeKey(key)}.json`);
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
});
