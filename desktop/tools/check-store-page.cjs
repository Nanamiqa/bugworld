const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifestPath = path.join(root, "desktop/steam/store-assets/store-assets.json");
const pagePath = path.join(root, "desktop/steam/store-assets/store-page.json");

const errors = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Cannot read JSON ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}

function readPngSize(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing PNG: ${relativePath}`);
    return null;
  }
  const buffer = fs.readFileSync(absolutePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    errors.push(`PNG expected: ${relativePath}`);
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function readGifSize(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing GIF: ${relativePath}`);
    return null;
  }
  const buffer = fs.readFileSync(absolutePath);
  const header = buffer.subarray(0, 6).toString("ascii");
  if (header !== "GIF87a" && header !== "GIF89a") {
    errors.push(`GIF expected: ${relativePath}`);
    return null;
  }
  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8)
  };
}

function ensureReadyImage(item, relativePath, width, height, label) {
  if (item?.status !== "ready") {
    errors.push(`${label} must be marked ready`);
  }
  const size = readPngSize(relativePath);
  if (size && (size.width !== width || size.height !== height)) {
    errors.push(`${label} must be ${width}x${height}, got ${size.width}x${size.height}`);
  }
}

function ensureReadyGif(item, relativePath, width, height, label) {
  if (item?.status !== "ready") {
    errors.push(`${label} must be marked ready`);
  }
  const size = readGifSize(relativePath);
  if (size && (size.width !== width || size.height !== height)) {
    errors.push(`${label} must be ${width}x${height}, got ${size.width}x${size.height}`);
  }
}

const manifest = readJson(manifestPath);
const page = readJson(pagePath);

if (manifest && page) {
  if (page.schemaVersion !== 1) {
    errors.push(`Unsupported store page schemaVersion: ${page.schemaVersion}`);
  }

  const screenshots = new Map((manifest.screenshots ?? []).map((screenshot) => [screenshot.id, screenshot]));
  const readyScreenshots = [...screenshots.values()].filter((screenshot) => screenshot.status === "ready");
  const order = page.screenshotOrder ?? [];
  const seen = new Set();

  if (order.length !== readyScreenshots.length) {
    errors.push(`Screenshot order must include all ${readyScreenshots.length} ready screenshots, got ${order.length}`);
  }

  for (let index = 0; index < order.length; index++) {
    const entry = order[index];
    if (entry.rank !== index + 1) {
      errors.push(`Screenshot rank mismatch at index ${index}: expected ${index + 1}, got ${entry.rank}`);
    }
    if (!entry.id || seen.has(entry.id)) {
      errors.push(`Screenshot order duplicate or empty id: ${entry.id}`);
    }
    seen.add(entry.id);

    const screenshot = screenshots.get(entry.id);
    if (!screenshot) {
      errors.push(`Screenshot order references unknown id: ${entry.id}`);
      continue;
    }
    ensureReadyImage(
      screenshot,
      screenshot.targetFile,
      screenshot.width,
      screenshot.height,
      `Ordered screenshot ${entry.id}`
    );
    if (!entry.role || !entry.reason) {
      errors.push(`Screenshot order ${entry.id} needs role and reason`);
    }
  }

  if (order[0]?.id !== "screenshot_04_boss_protocol_rider") {
    errors.push("Steam page should lead with the boss combat screenshot, not a menu or settings shot");
  }
  if (order[order.length - 1]?.id !== "screenshot_06_pc_settings") {
    errors.push("PC settings screenshot should stay last as a support proof shot");
  }

  const leaderboardMeta = screenshots.get("screenshot_01_start_menu");
  const leaderboardOrder = order.find((entry) => entry.id === "screenshot_01_start_menu");
  if (!leaderboardMeta) {
    errors.push("Leaderboard/meta screenshot is missing from the manifest");
  } else {
    if (leaderboardMeta.captureUrl !== "index.html?storeShot=leaderboard") {
      errors.push(`Leaderboard/meta screenshot should use storeShot=leaderboard, got ${leaderboardMeta.captureUrl}`);
    }
    for (const term of ["开场榜首", "三套流派榜首", "流派首榜", "S连胜", "三流派首榜"]) {
      if (!leaderboardMeta.mustShow?.some((item) => String(item).includes(term))) {
        errors.push(`Leaderboard/meta screenshot mustShow should include ${term}`);
      }
    }
  }
  if (leaderboardOrder?.role !== "leaderboard_meta_progression") {
    errors.push(`Leaderboard/meta screenshot role should be leaderboard_meta_progression, got ${leaderboardOrder?.role}`);
  }

  const leaderboardPromo = page.reviewArtifacts?.leaderboardPromo;
  if (!leaderboardPromo) {
    errors.push("Leaderboard promo review artifact is required");
  } else {
    if (leaderboardPromo.sourceScreenshot !== leaderboardMeta?.targetFile) {
      errors.push(`Leaderboard promo should source ${leaderboardMeta?.targetFile}, got ${leaderboardPromo.sourceScreenshot}`);
    }
    if (leaderboardPromo.width !== 1920 || leaderboardPromo.height !== 1080) {
      errors.push(`Leaderboard promo should be 1920x1080, got ${leaderboardPromo.width}x${leaderboardPromo.height}`);
    }
    for (const term of ["30秒开场榜", "三套 #1 全S", "S连胜 x6", "首榜奖励 3/3", "成就 11/11"]) {
      const haystack = [
        leaderboardPromo.titleZhCN,
        leaderboardPromo.subtitleZhCN,
        ...(leaderboardPromo.badges ?? []),
        ...(leaderboardPromo.cardValues ?? []),
        leaderboardPromo.footerZhCN,
      ].map(String);
      if (!haystack.some((item) => item.includes(term))) {
        errors.push(`Leaderboard promo copy should include ${term}`);
      }
    }
    const frames = leaderboardPromo.trailerFrames ?? [];
    if (frames.length !== 3) {
      errors.push(`Leaderboard promo should include 3 trailer frames, got ${frames.length}`);
    }
    const frameIds = new Set();
    for (const [index, frame] of frames.entries()) {
      if (!frame.id || frameIds.has(frame.id)) {
        errors.push(`Leaderboard trailer frame ${index + 1} has duplicate or missing id`);
      }
      frameIds.add(frame.id);
      ensureReadyImage(frame, frame.path, frame.width, frame.height, `Leaderboard trailer frame ${index + 1}`);
      if (frame.width !== 1920 || frame.height !== 1080) {
        errors.push(`Leaderboard trailer frame ${index + 1} should be 1920x1080`);
      }
      for (const field of ["titleZhCN", "subtitleZhCN", "metricTitle", "metricValue", "tag"]) {
        if (!frame[field]) {
          errors.push(`Leaderboard trailer frame ${index + 1} is missing ${field}`);
        }
      }
    }
    const frameCopy = frames.flatMap((frame) => [
      frame.titleZhCN,
      frame.subtitleZhCN,
      frame.metricTitle,
      frame.metricValue,
      frame.tag,
    ]).map(String);
    for (const term of ["第一把就追榜", "三套 #1 全S", "奖励 3/3", "成就 11/11", "S连胜 x6"]) {
      if (!frameCopy.some((item) => item.includes(term))) {
        errors.push(`Leaderboard trailer frames should include ${term}`);
      }
    }
    const animatedLoop = leaderboardPromo.animatedLoop;
    if (!animatedLoop) {
      errors.push("Leaderboard promo should include an animatedLoop GIF artifact");
    } else {
      ensureReadyGif(
        animatedLoop,
        animatedLoop.path,
        animatedLoop.width,
        animatedLoop.height,
        "Leaderboard teaser loop"
      );
      if (animatedLoop.width !== 960 || animatedLoop.height !== 540) {
        errors.push(`Leaderboard teaser loop should be 960x540, got ${animatedLoop.width}x${animatedLoop.height}`);
      }
      if (animatedLoop.frameDelayMs < 600 || animatedLoop.frameDelayMs > 1400) {
        errors.push(`Leaderboard teaser loop frameDelayMs should stay readable, got ${animatedLoop.frameDelayMs}`);
      }
      const expectedFramePaths = frames.map((frame) => frame.path);
      const loopFrames = animatedLoop.frames ?? [];
      if (loopFrames.length !== expectedFramePaths.length) {
        errors.push(`Leaderboard teaser loop should include ${expectedFramePaths.length} frames, got ${loopFrames.length}`);
      }
      for (const [index, expectedPath] of expectedFramePaths.entries()) {
        if (loopFrames[index] !== expectedPath) {
          errors.push(`Leaderboard teaser loop frame ${index + 1} should source ${expectedPath}, got ${loopFrames[index]}`);
        }
      }
    }
    const announcementHeader = leaderboardPromo.announcementHeader;
    if (!announcementHeader) {
      errors.push("Leaderboard promo should include an announcementHeader PNG artifact");
    } else {
      ensureReadyImage(
        announcementHeader,
        announcementHeader.path,
        announcementHeader.width,
        announcementHeader.height,
        "Leaderboard announcement header"
      );
      if (announcementHeader.width !== 1920 || announcementHeader.height !== 622) {
        errors.push(`Leaderboard announcement header should be 1920x622, got ${announcementHeader.width}x${announcementHeader.height}`);
      }
      if (announcementHeader.sourcePromo !== leaderboardPromo.path) {
        errors.push(`Leaderboard announcement header should source ${leaderboardPromo.path}, got ${announcementHeader.sourcePromo}`);
      }
      if (announcementHeader.sourceFrame !== frames[0]?.path) {
        errors.push(`Leaderboard announcement header should source the first teaser frame, got ${announcementHeader.sourceFrame}`);
      }
      const headerCopy = [
        announcementHeader.headlineZhCN,
        announcementHeader.headlineEnUS,
        announcementHeader.deckZhCN,
        ...(announcementHeader.chips ?? []),
      ].map(String);
      for (const term of ["第一把就想追榜", "30秒开场榜", "三套 #1 全S", "S连胜 x6", "首榜奖励 3/3"]) {
        if (!headerCopy.some((item) => item.includes(term))) {
          errors.push(`Leaderboard announcement header copy should include ${term}`);
        }
      }
    }
  }

  const capsules = new Map((manifest.capsules ?? []).map((capsule) => [capsule.id, capsule]));
  const capsuleUse = page.capsuleUse ?? {};
  for (const [slot, capsuleId] of Object.entries(capsuleUse)) {
    const capsule = capsules.get(capsuleId);
    if (!capsule) {
      errors.push(`Capsule slot ${slot} references unknown capsule: ${capsuleId}`);
      continue;
    }
    ensureReadyImage(capsule, capsule.plannedOutput, capsule.width, capsule.height, `Capsule slot ${slot}`);
  }

  const contactSheet = page.reviewArtifacts?.contactSheet;
  if (!contactSheet) {
    errors.push("Store page review contact sheet is required");
  } else {
    ensureReadyImage(
      contactSheet,
      contactSheet.path,
      contactSheet.width,
      contactSheet.height,
      "Store screenshot contact sheet"
    );
  }

  const openingRushTrailerBoard = page.reviewArtifacts?.openingRushTrailerBoard;
  if (!openingRushTrailerBoard) {
    errors.push("Opening rush trailer board review artifact is required");
  } else {
    ensureReadyImage(
      openingRushTrailerBoard,
      openingRushTrailerBoard.path,
      openingRushTrailerBoard.width,
      openingRushTrailerBoard.height,
      "Opening rush trailer board"
    );
    const sourceScreenshot = screenshots.get(openingRushTrailerBoard.sourceScreenshotId);
    if (!sourceScreenshot) {
      errors.push(`Opening rush trailer board references unknown screenshot: ${openingRushTrailerBoard.sourceScreenshotId}`);
    } else {
      if (sourceScreenshot.status !== "review") {
        errors.push(`Opening rush trailer board source should stay review-only, got ${sourceScreenshot.status}`);
      }
      if (sourceScreenshot.captureUrl !== "index.html?storeShot=opening-rush-trailer") {
        errors.push(`Opening rush trailer board should use storeShot=opening-rush-trailer, got ${sourceScreenshot.captureUrl}`);
      }
      if (sourceScreenshot.targetFile !== openingRushTrailerBoard.path) {
        errors.push(`Opening rush trailer board path should match source targetFile, got ${sourceScreenshot.targetFile}`);
      }
      for (const term of openingRushTrailerBoard.requiredBeats ?? []) {
        if (!sourceScreenshot.mustShow?.some((item) => String(item).includes(term))) {
          errors.push(`Opening rush trailer board source mustShow should include ${term}`);
        }
      }
    }

    const clipFrames = openingRushTrailerBoard.captureFrames ?? [];
    if (clipFrames.length !== 7) {
      errors.push(`Opening rush trailer clip should include 7 captured frames, got ${clipFrames.length}`);
    }
    const clipFrameIds = new Set();
    let previousCaptureAtMs = -1;
    for (const [index, frame] of clipFrames.entries()) {
      if (!frame.id || clipFrameIds.has(frame.id)) {
        errors.push(`Opening rush clip frame ${index + 1} has duplicate or missing id`);
      }
      clipFrameIds.add(frame.id);
      ensureReadyImage(frame, frame.path, frame.width, frame.height, `Opening rush clip frame ${index + 1}`);
      if (frame.width !== 1920 || frame.height !== 1080) {
        errors.push(`Opening rush clip frame ${index + 1} should be 1920x1080`);
      }
      if (!frame.beat || !frame.noteZhCN) {
        errors.push(`Opening rush clip frame ${index + 1} needs beat and noteZhCN`);
      }
      if (!Number.isFinite(frame.captureAtMs) || frame.captureAtMs <= previousCaptureAtMs) {
        errors.push(`Opening rush clip frame ${index + 1} must have increasing captureAtMs`);
      }
      previousCaptureAtMs = frame.captureAtMs;
    }
    const clipFrameCopy = clipFrames.flatMap((frame) => [frame.beat, frame.noteZhCN]).map(String);
    for (const term of ["首个异常", "裂隙落点", "先手截击", "S级开场", "再来"]) {
      if (!clipFrameCopy.some((item) => item.includes(term))) {
        errors.push(`Opening rush clip frames should include ${term}`);
      }
    }

    const animatedClip = openingRushTrailerBoard.animatedClip;
    if (!animatedClip) {
      errors.push("Opening rush trailer board should include an animatedClip GIF artifact");
    } else {
      ensureReadyGif(
        animatedClip,
        animatedClip.path,
        animatedClip.width,
        animatedClip.height,
        "Opening rush trailer clip"
      );
      if (animatedClip.width !== 960 || animatedClip.height !== 540) {
        errors.push(`Opening rush trailer clip should be 960x540, got ${animatedClip.width}x${animatedClip.height}`);
      }
      if (animatedClip.captureUrl !== "index.html?storeShot=opening-rush-trailer&clip=1") {
        errors.push(`Opening rush trailer clip should capture the clip route, got ${animatedClip.captureUrl}`);
      }
      const frameDelayMs = Number(animatedClip.frameDelayMs) || 0;
      const durationSeconds = ((animatedClip.frames?.length ?? 0) * frameDelayMs) / 1000;
      if (frameDelayMs < 650 || frameDelayMs > 1100) {
        errors.push(`Opening rush trailer clip frameDelayMs should stay readable, got ${animatedClip.frameDelayMs}`);
      }
      if (durationSeconds < 6 || durationSeconds > 8) {
        errors.push(`Opening rush trailer clip should last 6-8 seconds, got ${durationSeconds.toFixed(1)}s`);
      }
      const expectedFramePaths = clipFrames.map((frame) => frame.path);
      const clipFramePaths = animatedClip.frames ?? [];
      if (clipFramePaths.length !== expectedFramePaths.length) {
        errors.push(`Opening rush trailer clip should include ${expectedFramePaths.length} frames, got ${clipFramePaths.length}`);
      }
      for (const [index, expectedPath] of expectedFramePaths.entries()) {
        if (clipFramePaths[index] !== expectedPath) {
          errors.push(`Opening rush trailer clip frame ${index + 1} should source ${expectedPath}, got ${clipFramePaths[index]}`);
        }
      }
    }
  }

  for (const [artifactId, artifact] of Object.entries(page.reviewArtifacts ?? {})) {
    if (artifactId === "contactSheet") {
      continue;
    }
    if (!artifact?.path || !artifact.width || !artifact.height) {
      errors.push(`Review artifact ${artifactId} needs path, width, and height`);
      continue;
    }
    ensureReadyImage(
      artifact,
      artifact.path,
      artifact.width,
      artifact.height,
      `Review artifact ${artifactId}`
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Store page review ok: ${page.screenshotOrder.length} ordered screenshots, contact sheet 1920x1080`);
