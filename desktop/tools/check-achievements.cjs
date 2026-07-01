const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const webCatalogPath = path.join(rootDir, "src", "data", "achievement-data.js");
const steamCatalogPath = path.join(rootDir, "desktop", "steam", "achievements.json");

const webSource = fs.readFileSync(webCatalogPath, "utf8");
const steamCatalog = JSON.parse(fs.readFileSync(steamCatalogPath, "utf8"));
const apiNames = Array.from(webSource.matchAll(/steamApiName:\s*"([^"]+)"/g)).map((match) => match[1]);
const ids = Array.from(webSource.matchAll(/id:\s*"([^"]+)"/g)).map((match) => match[1]);

function fail(message) {
  console.error(`Achievement catalog error: ${message}`);
  process.exitCode = 1;
}

if (steamCatalog.schemaVersion !== 1) {
  fail("schemaVersion must be 1");
}

if (!Array.isArray(steamCatalog.achievements) || steamCatalog.achievements.length === 0) {
  fail("achievements must be a non-empty array");
}

if (new Set(ids).size !== ids.length) {
  fail("web achievement ids must be unique");
}

if (new Set(apiNames).size !== apiNames.length) {
  fail("web steamApiName values must be unique");
}

const steamApiNames = new Set();
for (const achievement of steamCatalog.achievements) {
  if (!achievement.apiName || !/^ACH_[A-Z0-9_]+$/.test(achievement.apiName)) {
    fail(`invalid apiName: ${achievement.apiName ?? "(missing)"}`);
  }
  if (steamApiNames.has(achievement.apiName)) {
    fail(`duplicate Steam apiName: ${achievement.apiName}`);
  }
  steamApiNames.add(achievement.apiName);
  if (!achievement.displayName || !achievement.description) {
    fail(`${achievement.apiName} must define displayName and description`);
  }
}

for (const apiName of apiNames) {
  if (!steamApiNames.has(apiName)) {
    fail(`web catalog references missing Steam apiName ${apiName}`);
  }
}

for (const apiName of steamApiNames) {
  if (!apiNames.includes(apiName)) {
    fail(`Steam catalog contains apiName not used by web catalog: ${apiName}`);
  }
}

if (!process.exitCode) {
  console.log(`Achievement catalog ok: ${steamApiNames.size} Steam achievements`);
}
