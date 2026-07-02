const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const packageDir = path.join(rootDir, "dist", "steam-demo", "win-unpacked");
const productExe = path.join(packageDir, "变量城夜巡.exe");
const appAsar = path.join(packageDir, "resources", "app.asar");

const requiredFiles = [
  ["product exe", productExe],
  ["app.asar", appAsar],
  ["resources.pak", path.join(packageDir, "resources.pak")],
  ["chrome_100_percent.pak", path.join(packageDir, "chrome_100_percent.pak")],
  ["ffmpeg.dll", path.join(packageDir, "ffmpeg.dll")],
  ["vulkan-1.dll", path.join(packageDir, "vulkan-1.dll")]
];

const errors = [];

function fail(message) {
  errors.push(`Dist package error: ${message}`);
}

if (!fs.existsSync(packageDir)) {
  fail(`package directory missing: ${path.relative(rootDir, packageDir)}`);
}

for (const [label, file] of requiredFiles) {
  if (!fs.existsSync(file)) {
    fail(`${label} missing: ${path.relative(rootDir, file)}`);
    continue;
  }
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size <= 0) {
    fail(`${label} is empty or not a file: ${path.relative(rootDir, file)}`);
  }
}

const localesDir = path.join(packageDir, "locales");
if (!fs.existsSync(localesDir) || fs.readdirSync(localesDir).filter((name) => name.endsWith(".pak")).length < 2) {
  fail("locales directory must contain Chromium locale .pak files");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const exeSizeMb = (fs.statSync(productExe).size / 1024 / 1024).toFixed(1);
const asarSizeMb = (fs.statSync(appAsar).size / 1024 / 1024).toFixed(1);
console.log(`Dist package ok: win-unpacked, exe ${exeSizeMb} MB, app.asar ${asarSizeMb} MB`);
