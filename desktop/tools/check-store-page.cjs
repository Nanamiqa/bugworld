const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifestPath = path.join(root, "desktop/steam/store-assets/store-assets.json");
const pagePath = path.join(root, "desktop/steam/store-assets/store-page.json");

const errors = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Cannot read JSON ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}

function readPngSize(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing PNG: ${relativePath}`);
    return null;
  }
  const buffer = fs.readFileSync(absolutePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    errors.push(`PNG expected: ${relativePath}`);
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function ensureReadyImage(item, relativePath, width, height, label) {
  if (item?.status !== "ready") {
    errors.push(`${label} must be marked ready`);
  }
  const size = readPngSize(relativePath);
  if (size && (size.width !== width || size.height !== height)) {
    errors.push(`${label} must be ${width}x${height}, got ${size.width}x${size.height}`);
  }
}

const manifest = readJson(manifestPath);
const page = readJson(pagePath);

if (manifest && page) {
  if (page.schemaVersion !== 1) {
    errors.push(`Unsupported store page schemaVersion: ${page.schemaVersion}`);
  }

  const screenshots = new Map((manifest.screenshots ?? []).map((screenshot) => [screenshot.id, screenshot]));
  const readyScreenshots = [...screenshots.values()].filter((screenshot) => screenshot.status === "ready");
  const order = page.screenshotOrder ?? [];
  const seen = new Set();

  if (order.length !== readyScreenshots.length) {
    errors.push(`Screenshot order must include all ${readyScreenshots.length} ready screenshots, got ${order.length}`);
  }

  for (let index = 0; index < order.length; index++) {
    const entry = order[index];
    if (entry.rank !== index + 1) {
      errors.push(`Screenshot rank mismatch at index ${index}: expected ${index + 1}, got ${entry.rank}`);
    }
    if (!entry.id || seen.has(entry.id)) {
      errors.push(`Screenshot order duplicate or empty id: ${entry.id}`);
    }
    seen.add(entry.id);

    const screenshot = screenshots.get(entry.id);
    if (!screenshot) {
      errors.push(`Screenshot order references unknown id: ${entry.id}`);
      continue;
    }
    ensureReadyImage(
      screenshot,
      screenshot.targetFile,
      screenshot.width,
      screenshot.height,
      `Ordered screenshot ${entry.id}`
    );
    if (!entry.role || !entry.reason) {
      errors.push(`Screenshot order ${entry.id} needs role and reason`);
    }
  }

  if (order[0]?.id !== "screenshot_04_boss_protocol_rider") {
    errors.push("Steam page should lead with the boss combat screenshot, not a menu or settings shot");
  }
  if (order[order.length - 1]?.id !== "screenshot_06_pc_settings") {
    errors.push("PC settings screenshot should stay last as a support proof shot");
  }

  const capsules = new Map((manifest.capsules ?? []).map((capsule) => [capsule.id, capsule]));
  const capsuleUse = page.capsuleUse ?? {};
  for (const [slot, capsuleId] of Object.entries(capsuleUse)) {
    const capsule = capsules.get(capsuleId);
    if (!capsule) {
      errors.push(`Capsule slot ${slot} references unknown capsule: ${capsuleId}`);
      continue;
    }
    ensureReadyImage(capsule, capsule.plannedOutput, capsule.width, capsule.height, `Capsule slot ${slot}`);
  }

  const contactSheet = page.reviewArtifacts?.contactSheet;
  if (!contactSheet) {
    errors.push("Store page review contact sheet is required");
  } else {
    ensureReadyImage(
      contactSheet,
      contactSheet.path,
      contactSheet.width,
      contactSheet.height,
      "Store screenshot contact sheet"
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Store page review ok: ${page.screenshotOrder.length} ordered screenshots, contact sheet 1920x1080`);
