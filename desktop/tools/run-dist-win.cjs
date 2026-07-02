const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..", "..");
const builderCli = path.join(rootDir, "node_modules", "electron-builder", "cli.js");
const electronExe = path.join(rootDir, "node_modules", "electron", "dist", "electron.exe");
const packageDir = path.join(rootDir, "dist", "steam-demo", "win-unpacked");
const appAsar = path.join(packageDir, "resources", "app.asar");
const localBuilderCache = path.join(rootDir, "tmp", "electron-builder-cache");

const buildTimeoutMs = readTimeout("VARIABLE_CITY_DIST_TIMEOUT_MS", 240000);
const checkTimeoutMs = readTimeout("VARIABLE_CITY_DIST_CHECK_TIMEOUT_MS", 30000);
const smokeTimeoutMs = readTimeout("VARIABLE_CITY_DIST_SMOKE_TIMEOUT_MS", 60000);

function readTimeout(name, fallbackMs) {
  const raw = process.env[name];
  if (!raw) {
    return fallbackMs;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 1000 ? value : fallbackMs;
}

function fail(message) {
  console.error(`dist:win error: ${message}`);
  process.exit(1);
}

function ensureFile(file, hint) {
  if (!fs.existsSync(file)) {
    fail(`${path.relative(rootDir, file)} is missing. ${hint}`);
  }
}

function markerMtimeMs() {
  try {
    return fs.statSync(appAsar).mtimeMs;
  } catch {
    return 0;
  }
}

function killProcessTree(pid) {
  if (!pid) {
    return Promise.resolve();
  }

  if (process.platform === "win32") {
    return new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
        cwd: rootDir,
        stdio: "ignore",
        windowsHide: true
      });
      killer.on("error", resolve);
      killer.on("exit", resolve);
    });
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      return Promise.resolve();
    }
  }
  return Promise.resolve();
}

function runCommand(label, command, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? 30000;
  const allowTimeout = options.allowTimeout === true;

  return new Promise((resolve, reject) => {
    let timedOut = false;
    const child = spawn(command, args, {
      cwd: rootDir,
      env: options.env ?? process.env,
      stdio: "inherit",
      windowsHide: true,
      detached: process.platform !== "win32"
    });

    const timer = setTimeout(() => {
      timedOut = true;
      console.warn(`${label} exceeded ${timeoutMs}ms; stopping process tree.`);
      void killProcessTree(child.pid);
    }, timeoutMs);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(new Error(`${label} failed to start: ${error.message}`));
    });

    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      if (timedOut && allowTimeout) {
        resolve({ timedOut: true, code, signal });
        return;
      }
      if (timedOut) {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        return;
      }
      if (signal) {
        reject(new Error(`${label} exited by signal ${signal}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`${label} exited with code ${code}`));
        return;
      }
      resolve({ timedOut: false, code, signal });
    });
  });
}

async function runNodeScript(label, relativeScript, timeoutMs) {
  await runCommand(label, process.execPath, [path.join(rootDir, relativeScript)], {
    timeoutMs
  });
}

async function main() {
  ensureFile(builderCli, "Run npm install first.");
  ensureFile(electronExe, "Run npm run desktop:install-electron first.");
  fs.mkdirSync(localBuilderCache, { recursive: true });

  const buildStartedAt = Date.now();
  const previousMarkerMtime = markerMtimeMs();
  const buildEnv = {
    ...process.env,
    CSC_IDENTITY_AUTO_DISCOVERY: process.env.CSC_IDENTITY_AUTO_DISCOVERY ?? "false",
    ELECTRON_MIRROR: process.env.ELECTRON_MIRROR ?? "https://npmmirror.com/mirrors/electron/",
    ELECTRON_BUILDER_CACHE: process.env.ELECTRON_BUILDER_CACHE ?? localBuilderCache
  };

  const result = await runCommand("electron-builder --win dir", process.execPath, [builderCli, "--win", "dir", "--publish", "never"], {
    env: buildEnv,
    timeoutMs: buildTimeoutMs,
    allowTimeout: true
  });

  if (result.timedOut) {
    const freshMarkerMtime = markerMtimeMs();
    if (freshMarkerMtime < buildStartedAt - 2000 || freshMarkerMtime <= previousMarkerMtime) {
      fail("electron-builder timed out before producing a fresh app.asar marker.");
    }
    console.warn("electron-builder timed out after producing a fresh package; continuing with package validation.");
  } else {
    console.log("electron-builder completed normally; validating package.");
  }

  await runNodeScript("dist package check", "desktop/tools/check-dist-package.cjs", checkTimeoutMs);
  await runNodeScript("packaged smoke test", "desktop/tools/run-packaged-smoke.cjs", smokeTimeoutMs);

  if (result.timedOut) {
    console.warn("dist:win accepted the timed-out builder process because fresh output passed package and smoke checks.");
  } else {
    console.log("dist:win completed with package and smoke checks.");
  }
}

main().catch((error) => {
  console.error(`dist:win error: ${error.message}`);
  process.exit(1);
});
