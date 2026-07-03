const fs = require("node:fs");
const path = require("node:path");
const { badgeSize, candidateSize, candidateFile, maps } = require("./chapter-map-asset-manifest.cjs");

const rootDir = path.resolve(__dirname, "..", "..");
const mainSource = fs.readFileSync(path.join(rootDir, "src", "main.js"), "utf8");
const storeManifestPath = path.join(rootDir, "desktop", "steam", "store-assets", "store-assets.json");
const storeManifest = JSON.parse(fs.readFileSync(storeManifestPath, "utf8"));
const errors = [];

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

const sourceImagePaths = new Set((storeManifest.sourceImages ?? []).map((entry) => entry.path));
for (const map of maps) {
  if (!sourceImagePaths.has(map.file)) {
    errors.push(`${map.file} missing from store sourceImages`);
  }
}
if (!sourceImagePaths.has(candidateFile)) {
  errors.push(`${candidateFile} missing from store sourceImages`);
}

if (errors.length > 0) {
  console.error(`Chapter map asset check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Chapter map assets ok: ${maps.length} badges and 1 candidate sheet`);
