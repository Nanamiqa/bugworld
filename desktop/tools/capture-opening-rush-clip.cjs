const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root ?? path.join(__dirname, "..", ".."));
const port = Number(args.port ?? 4185);
const timeoutMs = Number(args.timeoutMs ?? 18000);
const pagePath = path.join(root, "desktop", "steam", "store-assets", "store-page.json");
const tmpDir = path.join(root, "tmp");

main().catch((error) => {
  console.error(error?.stack ?? error?.message ?? error);
  process.exitCode = 1;
});

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) {
      continue;
    }
    const key = value.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }
    index += 1;
    result[key] = next;
  }
  return result;
}

async function main() {
  const page = JSON.parse(fs.readFileSync(pagePath, "utf8"));
  const board = page.reviewArtifacts?.openingRushTrailerBoard;
  const frames = board?.captureFrames ?? [];
  const clip = board?.animatedClip;
  if (!board || frames.length === 0 || !clip) {
    throw new Error("store-page.json needs openingRushTrailerBoard.captureFrames and animatedClip before capture.");
  }

  const browserPath = findBrowser();
  fs.mkdirSync(tmpDir, { recursive: true });
  const server = await startStaticServer(root, port);
  try {
    await captureClip({ frames, clip, browserPath });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.EDGE_PATH,
    "C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  const browserPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!browserPath) {
    throw new Error("No Edge or Chrome executable was found for headless opening-rush capture.");
  }
  return browserPath;
}

function startStaticServer(rootDir, listenPort) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${listenPort}/`);
    const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "") || "index.html";
    let filePath = path.resolve(rootDir, relativePath);
    const relativeToRoot = path.relative(rootDir, filePath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, { "content-type": getMimeType(filePath) });
      response.end(data);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(listenPort, "127.0.0.1", () => resolve(server));
  });
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  }[ext] ?? "application/octet-stream";
}

async function captureClip({ frames, clip, browserPath }) {
  const frameWidth = Math.max(...frames.map((frame) => Number(frame.width) || 0));
  const frameHeight = Math.max(...frames.map((frame) => Number(frame.height) || 0));
  const debugPort = await getFreePort();
  const profileDir = path.join(tmpDir, `opening-rush-clip-profile-${Date.now()}`);
  fs.mkdirSync(profileDir, { recursive: true });
  const captureUrl = clip.captureUrl ?? "index.html?storeShot=opening-rush-trailer&clip=1";
  const targetUrl = new URL(captureUrl, `http://127.0.0.1:${port}/`).toString();
  const browserArgs = [
    "--headless=new",
    "--disable-gpu",
    "--disable-gpu-sandbox",
    "--disable-gpu-compositing",
    "--disable-software-rasterizer",
    "--disable-accelerated-2d-canvas",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-features=CalculateNativeWinOcclusion,Vulkan,DefaultANGLEVulkan,UseSkiaRenderer",
    "--hide-scrollbars",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-sandbox",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "--force-device-scale-factor=1",
    `--window-size=${frameWidth},${frameHeight}`,
    targetUrl,
  ];
  const browser = spawn(browserPath, browserArgs, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let stderr = "";
  browser.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  try {
    const page = await waitForPage(debugPort, targetUrl, timeoutMs);
    const client = await createCdpClient(page.webSocketDebuggerUrl);
    try {
      await client.send("Page.enable");
      await client.send("Runtime.enable");
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: frameWidth,
        height: frameHeight,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await waitForReady(client, timeoutMs);
      await delay(180);
      const startedAt = Date.now();
      for (const [index, frame] of frames.entries()) {
        const targetMs = Number(frame.captureAtMs ?? index * (clip.frameDelayMs ?? 900));
        const remainingMs = targetMs - (Date.now() - startedAt);
        if (remainingMs > 0) {
          await delay(remainingMs);
        }
        const targetSeconds = targetMs / 1000;
        await client.send("Runtime.evaluate", {
          expression: `window.__variableCitySetOpeningRushClipTime?.(${JSON.stringify(targetSeconds)})`,
          returnByValue: true,
        });
        await delay(80);
        const outputPath = path.join(root, frame.path);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        const screenshot = await client.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          captureBeyondViewport: false,
        });
        fs.writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));
        const length = fs.statSync(outputPath).size;
        if (length < 10000) {
          throw new Error(`Opening-rush frame looks too small: ${frame.path} (${length} bytes)`);
        }
        const progress = await readClipProgress(client);
        console.log(`Captured ${frame.id} at ${targetMs}ms -> ${frame.path} (${progress.activeTitle || frame.beat})`);
      }
    } finally {
      client.close();
    }
  } finally {
    browser.kill();
    await waitForProcessExit(browser, 3000);
    await removeDirWithRetry(profileDir, { bestEffort: true });
    if (browser.exitCode && browser.exitCode !== 0 && stderr.trim()) {
      console.warn(stderr.trim().split(/\r?\n/).slice(-4).join("\n"));
    }
  }
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const freePort = typeof address === "object" ? address.port : 0;
      server.close(() => resolve(freePort));
    });
  });
}

async function waitForPage(debugPort, targetUrl, waitMs) {
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const pages = await response.json();
      const page = pages.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl && entry.url === targetUrl)
        ?? pages.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
      if (page) {
        return page;
      }
    } catch {
      // Browser is still starting.
    }
    await delay(120);
  }
  throw new Error(`Timed out waiting for browser page: ${targetUrl}`);
}

function createCdpClient(webSocketUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    let nextId = 1;
    const pending = new Map();
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          const id = nextId;
          nextId += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((commandResolve, commandReject) => {
            pending.set(id, { resolve: commandResolve, reject: commandReject, method });
          });
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) {
        return;
      }
      const command = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        command.reject(new Error(`${command.method} failed: ${message.error.message}`));
      } else {
        command.resolve(message.result ?? {});
      }
    });
    socket.addEventListener("error", reject);
    socket.addEventListener("close", () => {
      for (const command of pending.values()) {
        command.reject(new Error(`${command.method} failed: CDP socket closed`));
      }
      pending.clear();
    });
  });
}

async function waitForReady(client, waitMs) {
  const deadline = Date.now() + waitMs;
  let lastValue = null;
  while (Date.now() < deadline) {
    const result = await client.send("Runtime.evaluate", {
      expression: "({ readyState: document.readyState, storeShotReady: Boolean(window.__variableCityStoreShotReady), title: document.title })",
      returnByValue: true,
    });
    lastValue = result.result?.value ?? null;
    if (lastValue?.readyState === "complete" && lastValue.storeShotReady) {
      return;
    }
    await delay(120);
  }
  throw new Error(`Timed out waiting for opening-rush clip readiness: ${JSON.stringify(lastValue)}`);
}

async function readClipProgress(client) {
  const result = await client.send("Runtime.evaluate", {
    expression: "window.__variableCityOpeningRushClipProgress ?? {}",
    returnByValue: true,
  });
  return result.result?.value ?? {};
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForProcessExit(child, waitMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    delay(waitMs),
  ]);
}

async function removeDirWithRetry(dir, options = {}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!["EBUSY", "EPERM", "ENOTEMPTY"].includes(error?.code)) {
        throw error;
      }
      if (attempt === 4 && options.bestEffort) {
        console.warn(`Warning: could not remove temporary browser profile yet: ${dir}`);
        return;
      }
      if (attempt === 4) {
        throw error;
      }
      await delay(250 + attempt * 200);
    }
  }
}
