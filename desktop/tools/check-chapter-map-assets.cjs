const fs = require("node:fs");
const path = require("node:path");
const {
  badgeSize,
  candidateSize,
  candidateFile,
  combatCandidateSize,
  combatCandidateFile,
  maps,
} = require("./chapter-map-asset-manifest.cjs");

const rootDir = path.resolve(__dirname, "..", "..");
const mainSource = fs.readFileSync(path.join(rootDir, "src", "main.js"), "utf8");
const storeManifestPath = path.join(rootDir, "desktop", "steam", "store-assets", "store-assets.json");
const storeManifest = JSON.parse(fs.readFileSync(storeManifestPath, "utf8"));
const errors = [];
const screenshotsById = new Map((storeManifest.screenshots ?? []).map((entry) => [entry.id, entry]));

function readPngSize(relativePath) {
  const filePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(filePath)) {
    errors.push(`${relativePath} is missing`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    errors.push(`${relativePath} is not a PNG`);
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length,
  };
}

for (const map of maps) {
  for (const field of ["shotTitle", "shotFocus", "deviceLabel"]) {
    if (typeof map[field] !== "string" || map[field].trim().length < 8) {
      errors.push(`${map.id} is missing a useful ${field}`);
    }
  }
  for (const field of ["combatTitle", "combatFocus"]) {
    if (typeof map[field] !== "string" || map[field].trim().length < 8) {
      errors.push(`${map.id} is missing a useful ${field}`);
    }
  }
  for (const field of ["combatShotFile", "storeScreenshotId", "storeScreenshotTitle"]) {
    if (typeof map[field] !== "string" || map[field].trim().length < 8) {
      errors.push(`${map.id} is missing ${field}`);
    }
  }
  if (!Array.isArray(map.compositionTags) || map.compositionTags.length < 3) {
    errors.push(`${map.id} needs at least 3 compositionTags for screenshot planning`);
  }
  if (!Array.isArray(map.combatChecklist) || map.combatChecklist.length < 4) {
    errors.push(`${map.id} needs 4 combatChecklist items for chapter shot planning`);
  }
  if (!Array.isArray(map.callouts) || map.callouts.length < 3) {
    errors.push(`${map.id} needs at least 3 map callouts`);
  } else {
    for (const callout of map.callouts) {
      if (typeof callout.label !== "string" || callout.label.trim().length < 3) {
        errors.push(`${map.id} has an unnamed callout`);
      }
      if (typeof callout.x !== "number" || typeof callout.y !== "number") {
        errors.push(`${map.id} callout ${callout.label ?? "unknown"} needs numeric coordinates`);
      }
    }
  }
  if (!Array.isArray(map.combatCallouts) || map.combatCallouts.length < 3) {
    errors.push(`${map.id} needs at least 3 combat callouts`);
  } else {
    for (const callout of map.combatCallouts) {
      if (typeof callout.label !== "string" || callout.label.trim().length < 3) {
        errors.push(`${map.id} has an unnamed combat callout`);
      }
      if (typeof callout.x !== "number" || typeof callout.y !== "number") {
        errors.push(`${map.id} combat callout ${callout.label ?? "unknown"} needs numeric coordinates`);
      }
    }
  }

  const dimensions = readPngSize(map.file);
  if (dimensions) {
    if (dimensions.width !== badgeSize.width || dimensions.height !== badgeSize.height) {
      errors.push(`${map.file} is ${dimensions.width}x${dimensions.height}, expected ${badgeSize.width}x${badgeSize.height}`);
    }
    if (dimensions.bytes < 8000) {
      errors.push(`${map.file} looks too small (${dimensions.bytes} bytes)`);
    }
  }
  if (!mainSource.includes(`${map.assetKey}:`)) {
    errors.push(`${map.assetKey} missing from assetSources`);
  }
  if (!mainSource.includes(`badgeKey: "${map.assetKey}"`)) {
    errors.push(`${map.assetKey} missing from chapterMaps`);
  }

  const combatShot = readPngSize(map.combatShotFile);
  if (combatShot) {
    if (combatShot.width !== 1920 || combatShot.height !== 1080) {
      errors.push(`${map.combatShotFile} is ${combatShot.width}x${combatShot.height}, expected 1920x1080`);
    }
    if (combatShot.bytes < 180000) {
      errors.push(`${map.combatShotFile} looks too small (${combatShot.bytes} bytes)`);
    }
  }
  const screenshot = screenshotsById.get(map.storeScreenshotId);
  if (!screenshot) {
    errors.push(`${map.storeScreenshotId} missing from store screenshots`);
  } else {
    if (screenshot.status !== "ready") {
      errors.push(`${map.storeScreenshotId} must be ready`);
    }
    if (screenshot.targetFile !== map.combatShotFile) {
      errors.push(`${map.storeScreenshotId} targetFile should be ${map.combatShotFile}`);
    }
    if (screenshot.title !== map.storeScreenshotTitle) {
      errors.push(`${map.storeScreenshotId} title should match chapter map manifest`);
    }
    for (const term of ["地图装置", "敌人机制", "Boss", "武器特效"]) {
      if (!screenshot.mustShow?.some((item) => String(item).includes(term))) {
        errors.push(`${map.storeScreenshotId} mustShow should include ${term}`);
      }
    }
  }
}

const candidate = readPngSize(candidateFile);
if (candidate) {
  if (candidate.width !== candidateSize.width || candidate.height !== candidateSize.height) {
    errors.push(`${candidateFile} is ${candidate.width}x${candidate.height}, expected ${candidateSize.width}x${candidateSize.height}`);
  }
  if (candidate.bytes < 120000) {
    errors.push(`${candidateFile} looks too small (${candidate.bytes} bytes)`);
  }
}

const combatCandidate = readPngSize(combatCandidateFile);
if (combatCandidate) {
  if (combatCandidate.width !== combatCandidateSize.width || combatCandidate.height !== combatCandidateSize.height) {
    errors.push(
      `${combatCandidateFile} is ${combatCandidate.width}x${combatCandidate.height}, ` +
        `expected ${combatCandidateSize.width}x${combatCandidateSize.height}`
    );
  }
  if (combatCandidate.bytes < 120000) {
    errors.push(`${combatCandidateFile} looks too small (${combatCandidate.bytes} bytes)`);
  }
}

const sourceImagePaths = new Set((storeManifest.sourceImages ?? []).map((entry) => entry.path));
for (const map of maps) {
  if (!sourceImagePaths.has(map.file)) {
    errors.push(`${map.file} missing from store sourceImages`);
  }
}
if (!sourceImagePaths.has(candidateFile)) {
  errors.push(`${candidateFile} missing from store sourceImages`);
}
if (!sourceImagePaths.has(combatCandidateFile)) {
  errors.push(`${combatCandidateFile} missing from store sourceImages`);
}

if (errors.length > 0) {
  console.error(`Chapter map asset check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Chapter map assets ok: ${maps.length} badges and 2 candidate sheets`);
