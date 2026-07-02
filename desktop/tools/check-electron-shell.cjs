const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const errors = [];

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    errors.push(`Cannot read ${relativePath}: ${error.message}`);
    return null;
  }
}

function requireFile(relativePath, label = relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`${label} missing: ${relativePath}`);
  }
}

function requireText(relativePath, pattern, label) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`${label} missing file: ${relativePath}`);
    return;
  }
  const text = fs.readFileSync(absolutePath, "utf8");
  if (!pattern.test(text)) {
    errors.push(`${label} not found in ${relativePath}`);
  }
}

const packageJson = readJson("package.json");
const saveLayout = readJson("desktop/steam/save-layout.json");

requireFile("index.html", "Web entry");
requireFile("desktop/electron/main.cjs", "Electron main");
requireFile("desktop/electron/preload.cjs", "Electron preload");
requireFile("desktop/steam/save-layout.json", "Steam Cloud layout");
requireFile("desktop/steam/steam-autocloud.example.vdf", "Steam Auto-Cloud VDF");

if (packageJson) {
  if (packageJson.main !== "desktop/electron/main.cjs") {
    errors.push(`package.json main must be desktop/electron/main.cjs, got ${packageJson.main}`);
  }
  if (!packageJson.scripts?.desktop) {
    errors.push("package.json scripts.desktop is required");
  }
  if (!packageJson.scripts?.["desktop:smoke"]) {
    errors.push("package.json scripts.desktop:smoke is required");
  }
  if (!packageJson.scripts?.["desktop:install-electron"]) {
    errors.push("package.json scripts.desktop:install-electron is required");
  }
  if (!packageJson.scripts?.["dist:win"]) {
    errors.push("package.json scripts.dist:win is required");
  }
  if (packageJson.scripts?.["dist:win"] !== "node desktop/tools/run-dist-win.cjs") {
    errors.push("package.json scripts.dist:win must use the stability wrapper");
  }
  if (!packageJson.scripts?.["dist:win:raw"]) {
    errors.push("package.json scripts.dist:win:raw is required for direct electron-builder access");
  }
  if (!packageJson.scripts?.["dist:check"]) {
    errors.push("package.json scripts.dist:check is required");
  }
  if (!packageJson.scripts?.["dist:smoke"]) {
    errors.push("package.json scripts.dist:smoke is required");
  }
  if (!packageJson.devDependencies?.electron) {
    errors.push("Electron devDependency is required");
  }
  if (!packageJson.devDependencies?.["electron-builder"]) {
    errors.push("electron-builder devDependency is required");
  }
  if (packageJson.build?.extraMetadata?.main !== "desktop/electron/main.cjs") {
    errors.push("build.extraMetadata.main must point at desktop/electron/main.cjs");
  }
  if (packageJson.build?.electronDist !== "node_modules/electron/dist") {
    errors.push("build.electronDist must point at node_modules/electron/dist");
  }
  if (packageJson.build?.win?.signAndEditExecutable !== false) {
    errors.push("build.win.signAndEditExecutable must be false for unsigned dir smoke builds");
  }
  const files = packageJson.build?.files ?? [];
  for (const requiredPattern of ["index.html", "src/**/*", "desktop/electron/**/*", "desktop/steam/**/*"]) {
    if (!files.includes(requiredPattern)) {
      errors.push(`build.files missing ${requiredPattern}`);
    }
  }
}

if (saveLayout) {
  const cloudSlots = saveLayout.slots?.filter((slot) => slot.cloud) ?? [];
  if (cloudSlots.length < 4) {
    errors.push(`Expected at least 4 cloud save slots, got ${cloudSlots.length}`);
  }
}

requireText("desktop/electron/main.cjs", /VARIABLE_CITY_ELECTRON_SMOKE/, "Electron smoke mode");
requireText("desktop/electron/main.cjs", /loadFile\(path\.join\(rootDir, "index\.html"\)\)/, "Electron web entry load");
requireText("desktop/electron/main.cjs", /setWindowOpenHandler/, "External link guard");
requireText("desktop/electron/preload.cjs", /contextBridge\.exposeInMainWorld\("VariableCityPlatform"/, "Platform bridge");
requireText("desktop/electron/preload.cjs", /describeStorage/, "Desktop storage description");
requireText("desktop/electron/preload.cjs", /steamCloud/, "Steam Cloud bridge metadata");

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Electron shell preflight ok: entry, bridge, storage, smoke scripts, and build files are wired");
