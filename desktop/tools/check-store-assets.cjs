const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifestPath = path.join(root, "desktop/steam/store-assets/store-assets.json");
const docsPath = path.join(root, "docs/steam-store-assets.md");
const boardPath = path.join(root, "desktop/steam/store-assets/capsules.html");

const requiredCapsules = new Map([
  ["header_capsule", [920, 430]],
  ["small_capsule", [462, 174]],
  ["main_capsule", [1232, 706]],
  ["vertical_capsule", [748, 896]],
  ["library_capsule", [600, 900]],
  ["library_hero", [3840, 1240]],
  ["community_icon", [184, 184]]
]);

const errors = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Cannot read JSON ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}

function requireFile(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`${label} missing: ${relativePath}`);
  }
}

function readPngSize(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  const buffer = fs.readFileSync(absolutePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    errors.push(`PNG expected: ${relativePath}`);
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function requireUnique(items, selector, label) {
  const seen = new Set();
  for (const item of items) {
    const value = selector(item);
    if (!value) {
      errors.push(`${label} has an empty id or path`);
    } else if (seen.has(value)) {
      errors.push(`${label} duplicate: ${value}`);
    }
    seen.add(value);
  }
}

const manifest = readJson(manifestPath);
requireFile("desktop/steam/store-assets/capsules.html", "Capsule board");
requireFile("docs/steam-store-assets.md", "Steam store asset documentation");

if (manifest) {
  if (manifest.schemaVersion !== 1) {
    errors.push(`Unsupported schemaVersion: ${manifest.schemaVersion}`);
  }

  if (!manifest.brand?.zhCN || !manifest.brand?.enUS || !manifest.brand?.primaryKeyArt) {
    errors.push("Brand block must include zhCN, enUS, and primaryKeyArt");
  }

  const sourceImages = manifest.sourceImages ?? [];
  requireUnique(sourceImages, (item) => item.id, "sourceImages");
  for (const image of sourceImages) {
    requireFile(image.path, `Source image ${image.id}`);
  }

  const capsules = manifest.capsules ?? [];
  requireUnique(capsules, (item) => item.id, "capsules");
  const capsuleById = new Map(capsules.map((capsule) => [capsule.id, capsule]));
  for (const [id, [width, height]] of requiredCapsules) {
    const capsule = capsuleById.get(id);
    if (!capsule) {
      errors.push(`Required capsule missing: ${id}`);
      continue;
    }
    if (capsule.width !== width || capsule.height !== height) {
      errors.push(`Capsule ${id} must be ${width}x${height}, got ${capsule.width}x${capsule.height}`);
    }
    if (!capsule.source?.includes(`capsules.html#${id}`)) {
      errors.push(`Capsule ${id} must point at capsules.html#${id}`);
    }
    if (capsule.required !== true) {
      errors.push(`Capsule ${id} must be marked required`);
    }
    if (capsule.status === "ready") {
      requireFile(capsule.plannedOutput, `Ready capsule output ${id}`);
      const pngSize = readPngSize(capsule.plannedOutput);
      if (pngSize && (pngSize.width !== width || pngSize.height !== height)) {
        errors.push(
          `Ready capsule ${id} output must be ${width}x${height}, got ${pngSize.width}x${pngSize.height}`
        );
      }
    }
  }

  const html = fs.existsSync(boardPath) ? fs.readFileSync(boardPath, "utf8") : "";
  for (const id of requiredCapsules.keys()) {
    if (!html.includes(`id="${id}"`)) {
      errors.push(`Capsule board missing element id="${id}"`);
    }
  }

  const screenshots = manifest.screenshots ?? [];
  requireUnique(screenshots, (item) => item.id, "screenshots");
  requireUnique(screenshots, (item) => item.targetFile, "screenshot targetFile");
  if (screenshots.length < 5) {
    errors.push(`At least 5 planned screenshots are required, got ${screenshots.length}`);
  }
  for (const screenshot of screenshots) {
    if (screenshot.width < 1920 || screenshot.height < 1080) {
      errors.push(`Screenshot ${screenshot.id} must target at least 1920x1080`);
    }
    if (!Array.isArray(screenshot.mustShow) || screenshot.mustShow.length < 3) {
      errors.push(`Screenshot ${screenshot.id} needs at least three mustShow checks`);
    }
    if (screenshot.status === "ready") {
      requireFile(screenshot.targetFile, `Ready screenshot ${screenshot.id}`);
    }
  }

  const trailer = manifest.trailer;
  if (!trailer || !Array.isArray(trailer.beats)) {
    errors.push("Trailer block with beats is required");
  } else {
    if (trailer.targetDurationSeconds < 45 || trailer.targetDurationSeconds > 90) {
      errors.push(`Trailer duration should stay between 45 and 90 seconds, got ${trailer.targetDurationSeconds}`);
    }
    if (trailer.beats.length < 6) {
      errors.push(`Trailer needs at least 6 beats, got ${trailer.beats.length}`);
    }
  }

  const locales = new Set((manifest.localization ?? []).map((entry) => entry.locale));
  for (const requiredLocale of ["zh-CN", "en-US"]) {
    if (!locales.has(requiredLocale)) {
      errors.push(`Localization missing ${requiredLocale}`);
    }
  }

  if (!manifest.steamworksReferences?.some((entry) => entry.url?.includes("/doc/store/assets"))) {
    errors.push("Steamworks graphical asset reference is missing");
  }
  if (!manifest.steamworksReferences?.some((entry) => entry.url?.includes("/doc/store/trailer"))) {
    errors.push("Steamworks trailer reference is missing");
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Store asset manifest ok: ${manifest.capsules.length} capsules, ` +
    `${manifest.screenshots.length} screenshots, ${manifest.trailer.beats.length} trailer beats`
);
