const fs = require("node:fs");
const path = require("node:path");
const { assets, size } = require("./meta-asset-manifest.cjs");

const rootDir = path.resolve(__dirname, "..", "..");
const mainPath = path.join(rootDir, "src", "main.js");
const mainSource = fs.readFileSync(mainPath, "utf8");
const failures = [];

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("invalid PNG signature");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length,
  };
}

for (const asset of assets) {
  const filePath = path.join(rootDir, asset.file);
  if (!fs.existsSync(filePath)) {
    failures.push(`${asset.file} is missing`);
    continue;
  }

  try {
    const dimensions = readPngSize(filePath);
    if (dimensions.width !== size || dimensions.height !== size) {
      failures.push(`${asset.file} is ${dimensions.width}x${dimensions.height}, expected ${size}x${size}`);
    }
    if (dimensions.bytes < 900) {
      failures.push(`${asset.file} looks too small (${dimensions.bytes} bytes)`);
    }
  } catch (error) {
    failures.push(`${asset.file}: ${error.message}`);
  }

  if (!mainSource.includes(`${asset.assetKey}:`)) {
    failures.push(`${asset.assetKey} missing from assetSources`);
  }
  if (!mainSource.includes(`iconKey: "${asset.assetKey}"`)) {
    failures.push(`${asset.assetKey} missing from metaProgressNodes`);
  }
}

if (failures.length > 0) {
  console.error(`Meta asset check failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Meta progression assets ok: ${assets.length} icons at ${size}x${size}`);
