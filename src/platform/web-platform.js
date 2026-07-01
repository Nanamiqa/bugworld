(function () {
  const storageFallback = new Map();

  function readJson(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return storageFallback.has(key) ? storageFallback.get(key) : fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      storageFallback.set(key, value);
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      storageFallback.delete(key);
    }
  }

  async function requestFullscreen(target = document.documentElement) {
    if (!target?.requestFullscreen) {
      return false;
    }
    try {
      await target.requestFullscreen();
      return true;
    } catch {
      return false;
    }
  }

  async function exitFullscreen() {
    if (!document.fullscreenElement || !document.exitFullscreen) {
      return false;
    }
    try {
      await document.exitFullscreen();
      return true;
    } catch {
      return false;
    }
  }

  function unlockAchievement(id) {
    const unlocked = readJson("variableCityAchievements", []);
    if (!Array.isArray(unlocked) || unlocked.includes(id)) {
      return false;
    }
    unlocked.push(id);
    writeJson("variableCityAchievements", unlocked);
    return true;
  }

  const defaults = {
    id: "web",
    label: "GitHub Pages",
    isDesktop: false,
    supportsFullscreen: Boolean(document.documentElement?.requestFullscreen),
    supportsGamepad: Boolean(navigator.getGamepads),
    storage: { readJson, writeJson, remove },
    requestFullscreen,
    exitFullscreen,
    isFullscreen: () => Boolean(document.fullscreenElement),
    getGamepads: () => (navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []),
    unlockAchievement,
  };

  window.VariableCityPlatform = {
    ...defaults,
    ...(window.VariableCityPlatform ?? {}),
    storage: {
      ...defaults.storage,
      ...(window.VariableCityPlatform?.storage ?? {}),
    },
  };
})();
