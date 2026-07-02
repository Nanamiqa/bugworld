const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const announcementPath = path.join(rootDir, "desktop", "steam", "announcement-draft.json");
const announcement = JSON.parse(fs.readFileSync(announcementPath, "utf8"));

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return `"${text.replace(/"/g, '""')}"`;
}

function row(values) {
  return values.map(csvCell).join(",");
}

function byLocale(locale) {
  const localization = (announcement.localizations ?? []).find((entry) => entry.locale === locale);
  if (!localization) {
    throw new Error(`Missing announcement localization ${locale}`);
  }
  return localization;
}

function valueAt(localization, fieldKey) {
  const [group, indexText, property] = fieldKey.split(".");
  if (group === "root") {
    return localization[indexText];
  }
  if (group === "section") {
    return localization.sections[Number(indexText)]?.[property];
  }
  if (group === "roadmap") {
    return localization.roadmap[Number(indexText)];
  }
  if (group === "feedback") {
    return localization.feedbackChannels[Number(indexText)];
  }
  throw new Error(`Unknown localization field ${fieldKey}`);
}

const zhCN = byLocale("zh-CN");
const enUS = byLocale("en-US");
const definitions = [
  ["root.title", "metadata", "title", "Steam event title"],
  ["root.summary", "metadata", "summary", "Steam event summary or subtitle"],
  ["root.opening", "body", "paragraph", "Opening paragraph"],
  ...zhCN.sections.flatMap((section, index) => [
    [`section.${index}.heading`, `section_${index + 1}`, "heading", `Section ${index + 1} heading`],
    [`section.${index}.body`, `section_${index + 1}`, "paragraph", `Section ${index + 1} body`]
  ]),
  ...zhCN.roadmap.map((_, index) => [`roadmap.${index}`, "roadmap", "bullet", `Roadmap bullet ${index + 1}`]),
  ...zhCN.feedbackChannels.map((_, index) => [
    `feedback.${index}`,
    "feedback",
    "bullet",
    `Feedback channel ${index + 1}`
  ]),
  ["root.closing", "body", "paragraph", "Closing paragraph"]
];

const rows = [
  row(["field_key", "section", "field_type", "zh-CN", "en-US", "notes"]),
  ...definitions.map(([fieldKey, section, fieldType, notes]) =>
    row([fieldKey, section, fieldType, valueAt(zhCN, fieldKey), valueAt(enUS, fieldKey), notes])
  )
];

for (const exportEntry of announcement.localizationExports ?? []) {
  if (exportEntry.format !== "csv") {
    continue;
  }
  const outputPath = path.join(rootDir, exportEntry.path);
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, `${rows.join("\n")}\n`, "utf8");
  console.log(`Wrote ${exportEntry.path}`);
}
