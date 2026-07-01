const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const layoutPath = path.join(rootDir, "desktop", "steam", "save-layout.json");
const layout = JSON.parse(fs.readFileSync(layoutPath, "utf8"));

function fail(message) {
  console.error(`Steam cloud layout error: ${message}`);
  process.exitCode = 1;
}

if (layout.schemaVersion !== 1) {
  fail("schemaVersion must be 1");
}

if (!layout.appDataDirectory || !/^[a-z0-9_.-]+$/i.test(layout.appDataDirectory)) {
  fail("appDataDirectory must be a stable ASCII directory name");
}

if (!layout.saveSubdirectory || !/^[a-z0-9_.-]+$/i.test(layout.saveSubdirectory)) {
  fail("saveSubdirectory must be a stable ASCII directory name");
}

if (!layout.filePrefix || !layout.cloudPattern?.startsWith(layout.filePrefix)) {
  fail("cloudPattern must begin with filePrefix");
}

if (!Array.isArray(layout.slots) || layout.slots.length < 4) {
  fail("slots must include archive, run save, settings, and achievements");
}

const seenKeys = new Set();
const seenFiles = new Set();
for (const slot of layout.slots ?? []) {
  if (!slot.key || seenKeys.has(slot.key)) {
    fail(`duplicate or missing slot key: ${slot.key ?? "(missing)"}`);
  }
  seenKeys.add(slot.key);

  if (!slot.file || seenFiles.has(slot.file)) {
    fail(`duplicate or missing slot file: ${slot.file ?? "(missing)"}`);
  }
  seenFiles.add(slot.file);

  if (!slot.file.startsWith(layout.filePrefix) || !slot.file.endsWith(".json")) {
    fail(`${slot.file} must match ${layout.filePrefix}*.json`);
  }
}

for (const requiredKey of ["variableCityArchive", "variableCityRunSave", "variableCitySettings", "variableCityAchievements"]) {
  if (!seenKeys.has(requiredKey)) {
    fail(`missing required slot ${requiredKey}`);
  }
}

if (!layout.steamAutoCloud?.windowsRoot || !layout.steamAutoCloud?.windowsSubdirectory || !layout.steamAutoCloud?.pattern) {
  fail("steamAutoCloud must define windowsRoot, windowsSubdirectory, and pattern");
}

if (!process.exitCode) {
  console.log(`Steam cloud layout ok: ${layout.slots.length} slots, pattern ${layout.cloudPattern}`);
}
