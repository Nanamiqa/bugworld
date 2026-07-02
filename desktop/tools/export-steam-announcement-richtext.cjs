const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const announcementPath = path.join(rootDir, "desktop", "steam", "announcement-draft.json");
const announcement = JSON.parse(fs.readFileSync(announcementPath, "utf8"));

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function cleanForBbcode(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .trim();
}

function listBlock(items) {
  return ["[list]", ...items.map((item) => `[*] ${cleanForBbcode(item)}`), "[/list]"].join("\n");
}

function buildRichText(localization) {
  const lines = [];
  lines.push(`[h1]${cleanForBbcode(localization.title)}[/h1]`);
  lines.push("");
  lines.push(`[b]${cleanForBbcode(localization.summary)}[/b]`);
  lines.push("");
  lines.push(cleanForBbcode(localization.opening));
  lines.push("");

  for (const section of localization.sections ?? []) {
    lines.push(`[h2]${cleanForBbcode(section.heading)}[/h2]`);
    lines.push(cleanForBbcode(section.body));
    lines.push("");
  }

  lines.push(`[h2]${localization.locale === "zh-CN" ? "下一步路线" : "Roadmap"}[/h2]`);
  lines.push(listBlock(localization.roadmap ?? []));
  lines.push("");
  lines.push(`[h2]${localization.locale === "zh-CN" ? "反馈入口" : "Feedback Channels"}[/h2]`);
  lines.push(listBlock(localization.feedbackChannels ?? []));
  lines.push("");
  lines.push(cleanForBbcode(localization.closing));
  lines.push("");
  lines.push(`[i]Draft ID: ${cleanForBbcode(announcement.announcementId)} / ${cleanForBbcode(announcement.draftDate)}[/i]`);
  lines.push("");

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}`;
}

const exportByLocale = new Map((announcement.richTextExports ?? []).map((entry) => [entry.locale, entry]));
for (const localization of announcement.localizations ?? []) {
  const exportEntry = exportByLocale.get(localization.locale);
  if (!exportEntry) {
    throw new Error(`Missing richTextExports entry for ${localization.locale}`);
  }
  const outputPath = path.join(rootDir, exportEntry.path);
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, buildRichText(localization), "utf8");
  console.log(`Wrote ${exportEntry.path}`);
}
