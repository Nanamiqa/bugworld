const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifestPath = path.join(root, "desktop/steam/store-assets/store-assets.json");
const pagePath = path.join(root, "desktop/steam/store-assets/store-page.json");

const errors = [];

const FIRST_SCREEN_IDS = [
  "screenshot_04_boss_protocol_rider",
  "screenshot_07_metro_combat_showcase",
  "screenshot_08_hash_combat_showcase",
  "screenshot_09_promise_combat_showcase",
  "screenshot_10_whitebox_combat_showcase"
];

const CHAPTER_COMBAT_IDS = new Map([
  ["screenshot_07_metro_combat_showcase", 2],
  ["screenshot_08_hash_combat_showcase", 3],
  ["screenshot_09_promise_combat_showcase", 4],
  ["screenshot_10_whitebox_combat_showcase", 5]
]);

const CHAPTER_COMBAT_ROLES = new Map([
  ["screenshot_07_metro_combat_showcase", "chapter_combat_metro"],
  ["screenshot_08_hash_combat_showcase", "chapter_combat_hash"],
  ["screenshot_09_promise_combat_showcase", "chapter_combat_promise"],
  ["screenshot_10_whitebox_combat_showcase", "chapter_combat_whitebox"]
]);

const MIN_SCREENSHOT_BYTES = 900 * 1024;
const MIN_REVIEW_BYTES = 700 * 1024;

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Cannot read JSON ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}

function inspectPng(relativePath, label, expectedWidth, expectedHeight, minimumBytes) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`${label} is missing: ${relativePath}`);
    return null;
  }

  const buffer = fs.readFileSync(absolutePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    errors.push(`${label} must be a PNG: ${relativePath}`);
    return null;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== expectedWidth || height !== expectedHeight) {
    errors.push(`${label} must be ${expectedWidth}x${expectedHeight}, got ${width}x${height}`);
  }
  if (buffer.length < minimumBytes) {
    errors.push(`${label} looks too lightweight for a dense Steam screenshot (${buffer.length} bytes)`);
  }

  return { width, height, bytes: buffer.length };
}

function ensureIncludesAll(actual, expected, label) {
  const missing = expected.filter((id) => !actual.includes(id));
  if (missing.length > 0) {
    errors.push(`${label} missing: ${missing.join(", ")}`);
  }
}

const manifest = readJson(manifestPath);
const page = readJson(pagePath);

if (manifest && page) {
  const screenshots = new Map((manifest.screenshots ?? []).map((screenshot) => [screenshot.id, screenshot]));
  const order = page.screenshotOrder ?? [];
  const firstScreen = order.slice(0, FIRST_SCREEN_IDS.length);
  const firstScreenIds = firstScreen.map((entry) => entry.id);

  if (!page.steamPageGoal || !/readable combat/i.test(page.steamPageGoal)) {
    errors.push("Steam page goal should explicitly prioritize readable combat");
  }

  if (firstScreen.length !== FIRST_SCREEN_IDS.length) {
    errors.push(`First Steam screenshot screen must contain ${FIRST_SCREEN_IDS.length} entries`);
  }
  if (JSON.stringify(firstScreenIds) !== JSON.stringify(FIRST_SCREEN_IDS)) {
    errors.push(`First Steam screenshot screen should be ${FIRST_SCREEN_IDS.join(" -> ")}, got ${firstScreenIds.join(" -> ")}`);
  }
  ensureIncludesAll(firstScreenIds, [...CHAPTER_COMBAT_IDS.keys()], "First Steam screenshot screen");

  for (let index = 0; index < firstScreen.length; index++) {
    const entry = firstScreen[index];
    const screenshot = screenshots.get(entry.id);
    if (!screenshot) {
      errors.push(`First-screen screenshot references unknown id: ${entry.id}`);
      continue;
    }

    if (entry.rank !== index + 1) {
      errors.push(`First-screen rank mismatch for ${entry.id}: expected ${index + 1}, got ${entry.rank}`);
    }
    if (screenshot.status !== "ready") {
      errors.push(`First-screen screenshot must be ready: ${entry.id}`);
    }
    if (!screenshot.captureUrl?.includes("storeShot=")) {
      errors.push(`First-screen screenshot needs a stable storeShot captureUrl: ${entry.id}`);
    }
    if (!Array.isArray(screenshot.mustShow) || screenshot.mustShow.length < 4) {
      errors.push(`First-screen screenshot needs at least four mustShow proof points: ${entry.id}`);
    }
    if (!entry.role || !entry.reason || entry.reason.length < 60) {
      errors.push(`First-screen order entry needs a specific role and reason: ${entry.id}`);
    }

    inspectPng(
      screenshot.targetFile,
      `First-screen screenshot ${entry.id}`,
      screenshot.width,
      screenshot.height,
      MIN_SCREENSHOT_BYTES
    );

    const expectedChapter = CHAPTER_COMBAT_IDS.get(entry.id);
    if (expectedChapter) {
      const expectedRole = CHAPTER_COMBAT_ROLES.get(entry.id);
      if (entry.role !== expectedRole) {
        errors.push(`Chapter combat screenshot role should be ${expectedRole}, got ${entry.role}: ${entry.id}`);
      }
      if (screenshot.captureUrl !== `index.html?storeShot=chapter-${expectedChapter}-combat`) {
        errors.push(`Chapter combat screenshot has the wrong capture route: ${entry.id}`);
      }
    }
  }

  const firstScreenRoles = firstScreen.map((entry) => entry.role);
  if (firstScreenRoles.some((role) => /menu|settings|support|meta|pc/i.test(role))) {
    errors.push(`First Steam screenshot screen must not spend a slot on menu/settings support shots: ${firstScreenRoles.join(", ")}`);
  }

  const contactSheet = page.reviewArtifacts?.contactSheet;
  if (!contactSheet?.path) {
    errors.push("Contact sheet review artifact is required for first-impression review");
  } else {
    inspectPng(
      contactSheet.path,
      "Store screenshot contact sheet",
      contactSheet.width,
      contactSheet.height,
      MIN_REVIEW_BYTES
    );
  }

  const chapterSheet = page.reviewArtifacts?.chapterCombatShowcaseSheet;
  if (!chapterSheet?.path) {
    errors.push("Chapter combat showcase sheet is required for first-impression review");
  } else {
    inspectPng(
      chapterSheet.path,
      "Chapter combat showcase sheet",
      chapterSheet.width,
      chapterSheet.height,
      MIN_REVIEW_BYTES
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Store first impression ok: first ${FIRST_SCREEN_IDS.length} screenshots lead with boss combat plus 4 chapter combat proof shots.`);
