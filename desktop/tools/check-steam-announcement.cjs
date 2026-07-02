const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const announcementPath = path.join(rootDir, "desktop", "steam", "announcement-draft.json");
const storeContentPath = path.join(rootDir, "desktop", "steam", "store-content.json");
const announcement = JSON.parse(fs.readFileSync(announcementPath, "utf8"));
const storeContent = JSON.parse(fs.readFileSync(storeContentPath, "utf8"));
const errors = [];

function fail(message) {
  errors.push(`Steam announcement error: ${message}`);
}

function charCount(text) {
  return [...String(text ?? "")].length;
}

function assertNoRawLinks(text, label) {
  const value = String(text ?? "");
  if (/https?:\/\//i.test(value) || /www\./i.test(value)) {
    fail(`${label} should not contain raw external links`);
  }
}

function readPngSize(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing PNG artifact ${relativePath}`);
    return null;
  }
  const buffer = fs.readFileSync(absolutePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    fail(`PNG expected for ${relativePath}`);
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function requireTextArtifact(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing text artifact ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function validateBbcodeExport(exportEntry, localization) {
  if (exportEntry.status !== "ready") {
    fail(`rich text export ${exportEntry.locale} must be marked ready`);
  }
  if (exportEntry.format !== "steam_bbcode") {
    fail(`rich text export ${exportEntry.locale} must use steam_bbcode format`);
  }
  if (!exportEntry.path?.endsWith(".bbcode")) {
    fail(`rich text export ${exportEntry.locale} must use a .bbcode path`);
  }
  const text = requireTextArtifact(exportEntry.path);
  if (!text) {
    return;
  }
  assertNoRawLinks(text, `rich text export ${exportEntry.locale}`);
  for (const requiredText of [localization.title, localization.summary, localization.opening, localization.closing]) {
    if (!text.includes(requiredText)) {
      fail(`rich text export ${exportEntry.locale} is missing text: ${requiredText}`);
    }
  }
  for (const section of localization.sections ?? []) {
    if (!text.includes(`[h2]${section.heading}[/h2]`) || !text.includes(section.body)) {
      fail(`rich text export ${exportEntry.locale} is missing section ${section.heading}`);
    }
  }
  for (const item of [...(localization.roadmap ?? []), ...(localization.feedbackChannels ?? [])]) {
    if (!text.includes(`[*] ${item}`)) {
      fail(`rich text export ${exportEntry.locale} is missing list item: ${item}`);
    }
  }
  for (const tag of ["h1", "h2", "b", "i", "list"]) {
    const open = countMatches(text, new RegExp(`\\[${tag}\\]`, "g"));
    const close = countMatches(text, new RegExp(`\\[/${tag}\\]`, "g"));
    if (open !== close) {
      fail(`rich text export ${exportEntry.locale} has unbalanced [${tag}] tags`);
    }
  }
}

if (announcement.schemaVersion !== 1) {
  fail("schemaVersion must be 1");
}

for (const requiredDoc of ["/doc/marketing/event_tools", "/doc/marketing/event_tools/event_graphical_assets"]) {
  if (!announcement.sourceNotes?.some((note) => note.url?.includes(requiredDoc))) {
    fail(`sourceNotes must include ${requiredDoc}`);
  }
}

if (!announcement.publishingIntent?.primaryGoal || !Array.isArray(announcement.publishingIntent.doNotPublishBefore)) {
  fail("publishingIntent must include primaryGoal and doNotPublishBefore");
}
if ((announcement.publishingIntent.doNotPublishBefore ?? []).length < 3) {
  fail("doNotPublishBefore should record at least three blockers");
}

const storeLocales = new Set((storeContent.localizations ?? []).map((entry) => entry.locale));
const localizations = announcement.localizations ?? [];
const locales = new Set();
if (!localizations.some((entry) => entry.locale === "en-US" && entry.isFallback === true)) {
  fail("English fallback announcement localization is required");
}

for (const localization of localizations) {
  const prefix = `localization ${localization.locale}`;
  const isCjk = localization.locale === "zh-CN";
  const minSummaryLength = isCjk ? 40 : 60;
  const minOpeningLength = isCjk ? 80 : 140;
  const minSectionLength = isCjk ? 70 : 120;
  locales.add(localization.locale);
  if (!storeLocales.has(localization.locale)) {
    fail(`${prefix} is missing from store-content.json`);
  }
  if (!localization.steamLanguageCode) {
    fail(`${prefix} needs a Steam language code`);
  }
  if (charCount(localization.title) < 20 || charCount(localization.title) > 120) {
    fail(`${prefix} title should be between 20 and 120 characters`);
  }
  if (charCount(localization.summary) < minSummaryLength || charCount(localization.summary) > 240) {
    fail(`${prefix} summary should be between ${minSummaryLength} and 240 characters`);
  }
  if (charCount(localization.opening) < minOpeningLength) {
    fail(`${prefix} opening is too thin`);
  }
  assertNoRawLinks(localization.title, `${prefix} title`);
  assertNoRawLinks(localization.summary, `${prefix} summary`);
  assertNoRawLinks(localization.opening, `${prefix} opening`);

  if (!Array.isArray(localization.sections) || localization.sections.length < 3) {
    fail(`${prefix} needs at least three sections`);
  }
  for (const section of localization.sections ?? []) {
    if (!section.heading || charCount(section.body) < minSectionLength) {
      fail(`${prefix} section ${section.heading ?? "(missing)"} needs heading and substantial body`);
    }
    assertNoRawLinks(section.heading, `${prefix} section heading`);
    assertNoRawLinks(section.body, `${prefix} section body`);
  }

  if (!Array.isArray(localization.roadmap) || localization.roadmap.length < 3) {
    fail(`${prefix} needs at least three roadmap bullets`);
  }
  if (!Array.isArray(localization.feedbackChannels) || localization.feedbackChannels.length < 3) {
    fail(`${prefix} needs at least three feedback channels`);
  }
  for (const item of [...(localization.roadmap ?? []), ...(localization.feedbackChannels ?? []), localization.closing]) {
    if (charCount(item) < 20) {
      fail(`${prefix} item is too short: ${item}`);
    }
    assertNoRawLinks(item, `${prefix} roadmap or feedback item`);
  }
}

for (const requiredLocale of ["zh-CN", "en-US"]) {
  if (!locales.has(requiredLocale)) {
    fail(`missing announcement localization ${requiredLocale}`);
  }
}

const richTextExports = announcement.richTextExports ?? [];
if (richTextExports.length !== localizations.length) {
  fail(`richTextExports must include one file per localization, got ${richTextExports.length}`);
}
const richTextByLocale = new Map();
for (const exportEntry of richTextExports) {
  if (!exportEntry.locale || richTextByLocale.has(exportEntry.locale)) {
    fail(`duplicate or missing rich text export locale: ${exportEntry.locale ?? "(missing)"}`);
    continue;
  }
  richTextByLocale.set(exportEntry.locale, exportEntry);
}
for (const localization of localizations) {
  const exportEntry = richTextByLocale.get(localization.locale);
  if (!exportEntry) {
    fail(`missing rich text export for ${localization.locale}`);
    continue;
  }
  validateBbcodeExport(exportEntry, localization);
}

const cover = announcement.eventAssets?.cover;
const header = announcement.eventAssets?.header;
for (const [label, asset, expectedWidth, expectedHeight] of [
  ["cover", cover, 800, 450],
  ["header", header, 1920, 622]
]) {
  if (!asset) {
    fail(`missing event asset ${label}`);
    continue;
  }
  if (asset.status !== "ready") {
    fail(`event asset ${label} must be marked ready`);
  }
  if (asset.width !== expectedWidth || asset.height !== expectedHeight) {
    fail(`event asset ${label} should be ${expectedWidth}x${expectedHeight}`);
  }
  const size = readPngSize(asset.path);
  if (size && (size.width !== expectedWidth || size.height !== expectedHeight)) {
    fail(`event asset ${label} PNG must be ${expectedWidth}x${expectedHeight}, got ${size.width}x${size.height}`);
  }
}

if (!Array.isArray(announcement.humanReviewChecklist) || announcement.humanReviewChecklist.length < 5) {
  fail("humanReviewChecklist needs at least five review items");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Steam announcement ok: ${localizations.length} localizations, cover 800x450, ` +
    `header 1920x622, ${richTextExports.length} rich text exports`
);
