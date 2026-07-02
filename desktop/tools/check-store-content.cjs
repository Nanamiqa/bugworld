const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const contentPath = path.join(rootDir, "desktop", "steam", "store-content.json");
const packagePath = path.join(rootDir, "package.json");
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const errors = [];

function fail(message) {
  errors.push(`Steam store content error: ${message}`);
}

function charCount(text) {
  return [...String(text ?? "")].length;
}

function assertNoForbiddenText(text, label) {
  const value = String(text ?? "");
  if (/https?:\/\//i.test(value) || /www\./i.test(value)) {
    fail(`${label} must not contain external links`);
  }
  if (/wishlist|price|discount/i.test(value)) {
    fail(`${label} should avoid Steam UI or commercial CTA wording`);
  }
}

if (content.schemaVersion !== 1) {
  fail("schemaVersion must be 1");
}

if (content.appIdentity?.appNameZhCN !== packageJson.build?.productName) {
  fail("appNameZhCN must match package build.productName");
}

for (const requiredDoc of ["/doc/store/page", "/doc/store/tags", "/doc/store/localization/languages"]) {
  if (!content.sourceNotes?.some((note) => note.url?.includes(requiredDoc))) {
    fail(`sourceNotes must include ${requiredDoc}`);
  }
}

const localizations = content.localizations ?? [];
const locales = new Set(localizations.map((entry) => entry.locale));
for (const requiredLocale of ["zh-CN", "en-US"]) {
  if (!locales.has(requiredLocale)) {
    fail(`missing localization ${requiredLocale}`);
  }
}

if (!localizations.some((entry) => entry.locale === "en-US" && entry.isFallback === true)) {
  fail("English fallback localization is required for Steam");
}

for (const localization of localizations) {
  const prefix = `localization ${localization.locale}`;
  if (!localization.steamLanguageCode) {
    fail(`${prefix} needs a Steam language code`);
  }
  if (localization.fullAudio !== false) {
    fail(`${prefix} must not claim full audio until voiceover exists`);
  }
  const shortLength = charCount(localization.shortDescription);
  if (shortLength < 80 || shortLength > 300) {
    fail(`${prefix} shortDescription should stay between 80 and 300 characters, got ${shortLength}`);
  }
  assertNoForbiddenText(localization.shortDescription, `${prefix} shortDescription`);
  if (!Array.isArray(localization.aboutSections) || localization.aboutSections.length < 3) {
    fail(`${prefix} needs at least three about sections`);
  }
  for (const section of localization.aboutSections ?? []) {
    if (!section.heading || !section.body) {
      fail(`${prefix} about sections need heading and body`);
    }
    assertNoForbiddenText(section.heading, `${prefix} about heading`);
    assertNoForbiddenText(section.body, `${prefix} about body`);
    if (charCount(section.body) < 80) {
      fail(`${prefix} about body is too thin: ${section.heading}`);
    }
  }
  if (!Array.isArray(localization.featureBullets) || localization.featureBullets.length < 5) {
    fail(`${prefix} needs at least five feature bullets`);
  }
  for (const bullet of localization.featureBullets ?? []) {
    assertNoForbiddenText(bullet, `${prefix} feature bullet`);
    if (charCount(bullet) < 20) {
      fail(`${prefix} feature bullet is too short: ${bullet}`);
    }
  }
}

const tags = content.tags ?? [];
if (tags.length < 5 || tags.length > 20) {
  fail(`tags should include 5 to 20 entries, got ${tags.length}`);
}

const seenTags = new Set();
for (let index = 0; index < tags.length; index++) {
  const tag = tags[index];
  if (tag.rank !== index + 1) {
    fail(`tag rank mismatch at index ${index}: expected ${index + 1}, got ${tag.rank}`);
  }
  if (!tag.name || seenTags.has(tag.name)) {
    fail(`duplicate or missing tag: ${tag.name ?? "(missing)"}`);
  }
  seenTags.add(tag.name);
  if (!tag.reason) {
    fail(`tag ${tag.name} needs a reason`);
  }
}

for (const requiredTag of ["Action Roguelike", "Roguelite", "Bullet Hell", "Top-Down Shooter", "Singleplayer"]) {
  if (!seenTags.has(requiredTag)) {
    fail(`missing expected tag ${requiredTag}`);
  }
}

const features = new Set((content.storeFeatures ?? []).map((feature) => feature.name));
for (const requiredFeature of ["Single-player", "Steam Achievements", "Steam Cloud", "Partial Controller Support"]) {
  if (!features.has(requiredFeature)) {
    fail(`missing store feature ${requiredFeature}`);
  }
}

const requirements = content.systemRequirements?.windows;
for (const tierName of ["minimum", "recommended"]) {
  const tier = requirements?.[tierName];
  if (!tier) {
    fail(`missing Windows ${tierName} system requirements`);
    continue;
  }
  for (const field of ["os", "processor", "memory", "graphics", "directX", "storage", "additionalNotes"]) {
    if (!tier[field]) {
      fail(`Windows ${tierName} requirements missing ${field}`);
    }
  }
}

if (!Array.isArray(content.humanReviewChecklist) || content.humanReviewChecklist.length < 5) {
  fail("humanReviewChecklist needs at least five review items");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Steam store content ok: ${localizations.length} localizations, ${tags.length} tags, ` +
    `${content.storeFeatures.length} store features`
);
