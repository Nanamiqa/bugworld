const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

const rootDir = path.resolve(__dirname, "..", "..");
const reportDir = path.join(rootDir, "tmp", "electron-runtime-monitor");
const reportPath = path.join(reportDir, "latest.json");
const monitorSaveRoot = path.join(reportDir, "user-data");
const durationMs = readDuration("VARIABLE_CITY_RUNTIME_MONITOR_MS", 600000);
const sampleMs = readDuration("VARIABLE_CITY_RUNTIME_MONITOR_SAMPLE_MS", 1000);
const minimumAverageFps = Number.parseFloat(process.env.VARIABLE_CITY_RUNTIME_MONITOR_MIN_FPS ?? "24");
const maximumWorkingSetMb = Number.parseFloat(process.env.VARIABLE_CITY_RUNTIME_MONITOR_MAX_MB ?? "1200");
const routePressureEnabled = process.env.VARIABLE_CITY_ROUTE_PRESSURE === "1";

app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");

let mainWindow = null;
let sampleTimer = null;
let finishTimer = null;
let loadTimeout = null;
const diagnostics = {
  startedAt: new Date().toISOString(),
  durationMs,
  sampleMs,
  consoleErrors: [],
  pageErrors: [],
  loadFailures: [],
  rendererFailures: [],
  samples: [],
  storageProbe: null,
  routePressure: null,
  initialProbe: null,
};

function readDuration(name, fallbackMs) {
  const raw = process.env[name];
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 1000 ? value : fallbackMs;
}

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
  return monitorSaveRoot;
}

function memorySnapshot() {
  return app.getAppMetrics().map((metric) => ({
    type: metric.type,
    pid: metric.pid,
    workingSetMb: Number((metric.memory.workingSetSize / 1024).toFixed(1)),
    privateMb: Number((metric.memory.privateBytes / 1024).toFixed(1)),
  }));
}

function summarizeMemory(samples) {
  let maxWorkingSetMb = 0;
  let maxPrivateMb = 0;
  for (const sample of samples) {
    for (const metric of sample.memory ?? []) {
      maxWorkingSetMb = Math.max(maxWorkingSetMb, metric.workingSetMb ?? 0);
      maxPrivateMb = Math.max(maxPrivateMb, metric.privateMb ?? 0);
    }
  }
  return { maxWorkingSetMb, maxPrivateMb };
}

function getSteadyPageSamples(pageSamples) {
  if (pageSamples.length < 6) {
    return { warmupSampleCount: 0, samples: pageSamples };
  }
  const warmupSampleCount = Math.min(3, Math.floor(pageSamples.length / 4));
  return {
    warmupSampleCount,
    samples: pageSamples.slice(warmupSampleCount),
  };
}

function pageProbeScript() {
  return `
    (() => {
      const monitor = window.__variableCityRuntimeMonitor ?? {
        frames: [],
        errors: [],
        rejections: [],
        createdAt: performance.now()
      };
      if (!window.__variableCityRuntimeMonitor) {
        window.__variableCityRuntimeMonitor = monitor;
        window.addEventListener("error", (event) => {
          monitor.errors.push({
            message: String(event.message ?? "error"),
            source: String(event.filename ?? ""),
            line: Number(event.lineno ?? 0)
          });
        });
        window.addEventListener("unhandledrejection", (event) => {
          monitor.rejections.push({
            reason: String(event.reason?.message ?? event.reason ?? "unhandled rejection")
          });
        });
        const tick = (now) => {
          if (monitor.lastFrameAt) {
            monitor.frames.push(now - monitor.lastFrameAt);
            if (monitor.frames.length > 1200) {
              monitor.frames.shift();
            }
          }
          monitor.lastFrameAt = now;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }

      const canvas = document.querySelector("#gameCanvas");
      let canvasNonBlank = false;
      let canvasSample = null;
      if (canvas) {
        try {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          const width = Math.max(1, canvas.width);
          const height = Math.max(1, canvas.height);
          const points = [
            [Math.floor(width * 0.5), Math.floor(height * 0.5)],
            [Math.floor(width * 0.25), Math.floor(height * 0.25)],
            [Math.floor(width * 0.75), Math.floor(height * 0.7)]
          ];
          canvasSample = points.map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data));
          canvasNonBlank = canvasSample.some((rgba) => rgba[3] > 0 && (rgba[0] + rgba[1] + rgba[2]) > 0);
        } catch (error) {
          canvasSample = { error: String(error.message ?? error) };
        }
      }

      const recentFrames = monitor.frames.slice(-300);
      const avgDelta = recentFrames.reduce((sum, value) => sum + value, 0) / Math.max(1, recentFrames.length);
      const maxDelta = recentFrames.reduce((max, value) => Math.max(max, value), 0);
      return {
        title: document.title,
        hasCanvas: Boolean(canvas),
        canvasNonBlank,
        canvasSample,
        platformId: window.VariableCityPlatform?.id ?? null,
        storageMode: window.VariableCityPlatform?.storage?.describe?.().mode ?? null,
        storageFileCount: window.VariableCityPlatform?.storage?.describe?.().files?.length ?? 0,
        frameCount: monitor.frames.length,
        averageFps: avgDelta > 0 ? 1000 / avgDelta : 0,
        worstRecentFps: maxDelta > 0 ? 1000 / maxDelta : 0,
        pageErrorCount: monitor.errors.length,
        rejectionCount: monitor.rejections.length,
        pageErrors: monitor.errors.slice(-5),
        rejections: monitor.rejections.slice(-5)
      };
    })()
  `;
}

function storageProbeScript() {
  const nonce = `runtime-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `
    (() => {
      const key = "variableCityRuntimeMonitor";
      const payload = { nonce: ${JSON.stringify(nonce)}, savedAt: Date.now(), source: "desktop-runtime-monitor" };
      const storage = window.VariableCityPlatform?.storage;
      if (!storage?.writeJson || !storage?.readJson || !storage?.remove) {
        return { ok: false, reason: "storage bridge incomplete" };
      }
      const wrote = storage.writeJson(key, payload);
      const readBack = storage.readJson(key, null);
      const removed = storage.remove(key);
      return {
        ok: Boolean(wrote && removed && readBack?.nonce === payload.nonce),
        wrote: Boolean(wrote),
        readBackMatches: readBack?.nonce === payload.nonce,
        removed: Boolean(removed),
        storageMode: storage.describe?.().mode ?? null,
        fileCount: storage.describe?.().files?.length ?? 0
      };
    })()
  `;
}

function routePressureScript() {
  return `
    (() => {
      const hooks = window.__variableCityTestHooks;
      if (!hooks?.runRoutePressureTest) {
        return { ok: false, failures: ["automation test hooks unavailable"] };
      }
      return hooks.runRoutePressureTest();
    })()
  `;
}

function installWindowGuards(win) {
  win.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    if (level >= 3) {
      diagnostics.consoleErrors.push({
        level,
        message: String(message),
        line: Number(line ?? 0),
        sourceId: String(sourceId ?? ""),
      });
    }
  });

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    diagnostics.loadFailures.push({ errorCode, errorDescription, validatedURL });
  });

  win.webContents.on("render-process-gone", (_event, details) => {
    diagnostics.rendererFailures.push(details);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

async function samplePage() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  try {
    const page = await mainWindow.webContents.executeJavaScript(pageProbeScript());
    diagnostics.samples.push({
      at: new Date().toISOString(),
      page,
      memory: memorySnapshot(),
    });
  } catch (error) {
    diagnostics.pageErrors.push({ message: error.message });
  }
}

function writeReport(summary) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({ ...diagnostics, summary }, null, 2), "utf8");
}

function finish(exitCode = 0) {
  clearTimeout(loadTimeout);
  clearTimeout(finishTimer);
  clearInterval(sampleTimer);
  const pageSamples = diagnostics.samples.map((sample) => sample.page);
  const steady = getSteadyPageSamples(pageSamples);
  const rawFpsValues = pageSamples.map((page) => page.averageFps).filter((value) => Number.isFinite(value) && value > 0);
  const fpsValues = steady.samples.map((page) => page.averageFps).filter((value) => Number.isFinite(value) && value > 0);
  const worstFpsValues = steady.samples.map((page) => page.worstRecentFps).filter((value) => Number.isFinite(value) && value > 0);
  const rawAverageFps = rawFpsValues.reduce((sum, value) => sum + value, 0) / Math.max(1, rawFpsValues.length);
  const averageFps = fpsValues.reduce((sum, value) => sum + value, 0) / Math.max(1, fpsValues.length);
  const worstRecentFps = Math.min(...worstFpsValues, Number.POSITIVE_INFINITY);
  const memory = summarizeMemory(diagnostics.samples);
  const lastPage = pageSamples.at(-1) ?? diagnostics.initialProbe ?? {};
  const pageErrorCount = pageSamples.reduce((sum, page) => sum + (page.pageErrorCount ?? 0) + (page.rejectionCount ?? 0), 0);
  const summary = {
    ok: exitCode === 0,
    reportPath,
    averageFps: Number(averageFps.toFixed(1)),
    rawAverageFps: Number(rawAverageFps.toFixed(1)),
    worstRecentFps: Number((Number.isFinite(worstRecentFps) ? worstRecentFps : 0).toFixed(1)),
    maxWorkingSetMb: memory.maxWorkingSetMb,
    maxPrivateMb: memory.maxPrivateMb,
    sampleCount: diagnostics.samples.length,
    warmupSampleCount: steady.warmupSampleCount,
    consoleErrorCount: diagnostics.consoleErrors.length,
    pageErrorCount,
    loadFailureCount: diagnostics.loadFailures.length,
    rendererFailureCount: diagnostics.rendererFailures.length,
    storageProbeOk: Boolean(diagnostics.storageProbe?.ok),
    routePressureOk: !routePressureEnabled || Boolean(diagnostics.routePressure?.ok),
    routePressureChapterCount: diagnostics.routePressure?.chapters?.length ?? 0,
    canvasNonBlank: Boolean(lastPage.canvasNonBlank),
    platformId: lastPage.platformId ?? diagnostics.initialProbe?.platformId ?? null,
  };

  const failures = [];
  if (summary.platformId !== "electron") {
    failures.push(`platformId=${summary.platformId}`);
  }
  if (!summary.canvasNonBlank) {
    failures.push("canvas did not produce nonblank pixels");
  }
  if (!summary.storageProbeOk) {
    failures.push("storage probe failed");
  }
  if (routePressureEnabled && !summary.routePressureOk) {
    failures.push(`route pressure failed: ${(diagnostics.routePressure?.failures ?? ["unknown"]).join("; ")}`);
  }
  if (summary.consoleErrorCount > 0 || summary.pageErrorCount > 0 || summary.loadFailureCount > 0 || summary.rendererFailureCount > 0) {
    failures.push("runtime errors were captured");
  }
  if (summary.averageFps < minimumAverageFps) {
    failures.push(`average FPS ${summary.averageFps} < ${minimumAverageFps}`);
  }
  if (summary.maxWorkingSetMb > maximumWorkingSetMb) {
    failures.push(`working set ${summary.maxWorkingSetMb} MB > ${maximumWorkingSetMb} MB`);
  }

  summary.ok = failures.length === 0 && exitCode === 0;
  summary.failures = failures;
  writeReport(summary);

  if (summary.ok) {
    console.log(`Electron runtime monitor ok: ${JSON.stringify(summary)}`);
  } else {
    console.error(`Electron runtime monitor failed: ${JSON.stringify(summary)}`);
  }

  app.exit(summary.ok ? 0 : 1);
}

async function startMonitor() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    x: -32000,
    y: -32000,
    minWidth: 960,
    minHeight: 540,
    title: "变量城夜巡",
    backgroundColor: "#f6f8fb",
    autoHideMenuBar: true,
    focusable: false,
    skipTaskbar: true,
    show: true,
    webPreferences: {
      preload: path.join(rootDir, "desktop", "electron", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  installWindowGuards(mainWindow);
  loadTimeout = setTimeout(() => {
    diagnostics.loadFailures.push({ errorDescription: "window load timed out" });
    finish(1);
  }, 20000);

  mainWindow.webContents.once("did-finish-load", async () => {
    clearTimeout(loadTimeout);
    try {
      diagnostics.initialProbe = await mainWindow.webContents.executeJavaScript(pageProbeScript());
      diagnostics.storageProbe = await mainWindow.webContents.executeJavaScript(storageProbeScript());
      if (routePressureEnabled) {
        diagnostics.routePressure = await mainWindow.webContents.executeJavaScript(routePressureScript());
      }
      await samplePage();
      sampleTimer = setInterval(() => {
        void samplePage();
      }, sampleMs);
      finishTimer = setTimeout(() => finish(0), durationMs);
    } catch (error) {
      diagnostics.pageErrors.push({ message: error.message });
      finish(1);
    }
  });

  const loadOptions = routePressureEnabled ? { query: { automation: "1" } } : undefined;
  mainWindow.loadFile(path.join(rootDir, "index.html"), loadOptions);
}

app.whenReady().then(() => {
  ipcMain.on("variable-city:get-user-data-path", (event) => {
    event.returnValue = getGameSaveRoot();
  });

  startMonitor();
});

app.on("window-all-closed", () => {
  app.quit();
});
