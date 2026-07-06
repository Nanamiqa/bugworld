const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { badgeSize, candidateSize, candidateFile, maps } = require("./chapter-map-asset-manifest.cjs");

const rootDir = path.resolve(__dirname, "..", "..");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    scanlines[rowStart] = 0;
    rgba.copy(scanlines, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(scanlines, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function canvas(width, height) {
  return Buffer.alloc(width * height * 4);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mix(a, b, t) {
  return a.map((value, index) => Math.round(value + (b[index] - value) * t));
}

function blendPixel(buffer, width, height, x, y, color, alpha = 1) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (px < 0 || py < 0 || px >= width || py >= height) return;
  const index = (py * width + px) * 4;
  const srcAlpha = clamp((color[3] ?? 255) / 255 * alpha, 0, 1);
  const dstAlpha = buffer[index + 3] / 255;
  const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);
  if (outAlpha <= 0) return;
  for (let channel = 0; channel < 3; channel += 1) {
    const src = color[channel];
    const dst = buffer[index + channel];
    buffer[index + channel] = Math.round((src * srcAlpha + dst * dstAlpha * (1 - srcAlpha)) / outAlpha);
  }
  buffer[index + 3] = Math.round(outAlpha * 255);
}

function rect(buffer, width, height, x, y, w, h, color, alpha = 1) {
  for (let py = Math.floor(y); py < Math.ceil(y + h); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + w); px += 1) {
      blendPixel(buffer, width, height, px, py, color, alpha);
    }
  }
}

function circle(buffer, width, height, cx, cy, radius, color, alpha = 1) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) blendPixel(buffer, width, height, x, y, color, alpha);
    }
  }
}

function line(buffer, width, height, x1, y1, x2, y2, thickness, color, alpha = 1) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 1.8));
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    circle(buffer, width, height, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, color, alpha);
  }
}

function roundedRect(buffer, width, height, x, y, w, h, radius, color, alpha = 1) {
  for (let py = Math.floor(y); py < Math.ceil(y + h); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + w); px += 1) {
      const dx = Math.max(x + radius - px, 0, px - (x + w - radius));
      const dy = Math.max(y + radius - py, 0, py - (y + h - radius));
      if (dx * dx + dy * dy <= radius * radius) blendPixel(buffer, width, height, px, py, color, alpha);
    }
  }
}

const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "01010", "01010", "00100", "01010", "01010", "10001"],
  Y: ["10001", "01010", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["10010", "10010", "10010", "11111", "00010", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "#": ["01010", "11111", "01010", "01010", "11111", "01010", "01010"],
};

function glyphFor(char) {
  return FONT[char] ?? null;
}

function textWidth(text, scale) {
  return [...String(text).toUpperCase()].reduce((total, char) => {
    if (char === " ") return total + 4 * scale;
    return total + (glyphFor(char) ? 6 : 4) * scale;
  }, 0);
}

function drawText(buffer, width, height, text, x, y, scale, color, alpha = 1) {
  let cursorX = x;
  for (const rawChar of String(text).toUpperCase()) {
    if (rawChar === " ") {
      cursorX += 4 * scale;
      continue;
    }
    const glyph = glyphFor(rawChar);
    if (!glyph) {
      cursorX += 4 * scale;
      continue;
    }
    for (let row = 0; row < glyph.length; row += 1) {
      for (let column = 0; column < glyph[row].length; column += 1) {
        if (glyph[row][column] === "1") {
          rect(buffer, width, height, cursorX + column * scale, y + row * scale, scale, scale, color, alpha);
        }
      }
    }
    cursorX += 6 * scale;
  }
  return cursorX;
}

function drawWrappedText(buffer, width, height, text, x, y, maxWidth, scale, color, alpha = 1, maxLines = 4) {
  const words = String(text).toUpperCase().split(/\s+/).filter(Boolean);
  let lineText = "";
  let lineY = y;
  let lines = 0;
  for (const word of words) {
    const candidate = lineText ? `${lineText} ${word}` : word;
    if (lineText && textWidth(candidate, scale) > maxWidth) {
      drawText(buffer, width, height, lineText, x, lineY, scale, color, alpha);
      lineY += 10 * scale;
      lines += 1;
      lineText = word;
      if (lines >= maxLines) return lineY;
    } else {
      lineText = candidate;
    }
  }
  if (lineText && lines < maxLines) {
    drawText(buffer, width, height, lineText, x, lineY, scale, color, alpha);
    lineY += 10 * scale;
  }
  return lineY;
}

function drawBackground(buffer, width, height) {
  const base = [16, 25, 38];
  const cool = [38, 56, 74];
  const warm = [63, 48, 58];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / Math.max(1, width - 1);
      const ny = y / Math.max(1, height - 1);
      const glow = clamp(1 - Math.hypot(nx - 0.52, ny - 0.46) * 1.25, 0, 1);
      const scan = ((x * 13 + y * 17 + (x * y) % 23) % 31) / 255;
      const color = mix(mix(base, cool, nx * 0.28 + glow * 0.24), warm, ny * 0.18);
      blendPixel(buffer, width, height, x, y, [color[0] + scan * 26, color[1] + scan * 20, color[2] + scan * 16, 255], 1);
    }
  }
  for (let x = 0; x < width; x += 96) line(buffer, width, height, x, 0, x - 240, height, 1, [255, 255, 255, 255], 0.035);
  for (let y = 44; y < height; y += 86) line(buffer, width, height, 0, y, width, y + 28, 1, [255, 255, 255, 255], 0.025);
}

function drawBadge(buffer, canvasWidth, canvasHeight, map, offsetX = 0, offsetY = 0, scale = 1) {
  const p = map.palette;
  const bg = p.background;
  const localWidth = badgeSize.width;
  const localHeight = badgeSize.height;
  for (let y = 0; y < localHeight; y += 1) {
    for (let x = 0; x < localWidth; x += 1) {
      const nx = x / Math.max(1, localWidth - 1);
      const ny = y / Math.max(1, localHeight - 1);
      const glow = clamp(1 - Math.hypot(nx - 0.62, ny - 0.34) * 1.35, 0, 1);
      const color = mix(mix(bg, p.primary, 0.18), p.secondary, glow * 0.22 + nx * 0.1);
      blendPixel(buffer, canvasWidth, canvasHeight, offsetX + x * scale, offsetY + y * scale, [...color, 255], 1);
    }
  }

  const sx = (value) => offsetX + value * scale;
  const sy = (value) => offsetY + value * scale;
  const sw = (value) => value * scale;
  roundedRect(buffer, canvasWidth, canvasHeight, sx(12), sy(12), sw(296), sw(156), sw(18), [255, 255, 255, 255], 0.07);
  rect(buffer, canvasWidth, canvasHeight, sx(24), sy(126), sw(272), sw(18), [...p.hazard, 255], 0.22);

  if (map.id === "metro-loop") {
    for (const y of [48, 82, 116]) line(buffer, canvasWidth, canvasHeight, sx(28), sy(y), sx(292), sy(y + 10), sw(5), [255, 255, 255, 255], 0.28);
    line(buffer, canvasWidth, canvasHeight, sx(36), sy(136), sx(272), sy(42), sw(10), [...p.primary, 255], 0.78);
    line(buffer, canvasWidth, canvasHeight, sx(48), sy(36), sx(286), sy(138), sw(7), [...p.secondary, 255], 0.64);
    roundedRect(buffer, canvasWidth, canvasHeight, sx(215), sy(54), sw(58), sw(45), sw(8), [255, 255, 255, 255], 0.85);
    for (let x = 58; x <= 176; x += 24) circle(buffer, canvasWidth, canvasHeight, sx(x), sy(102 + (x % 2) * 10), sw(5), [...p.hazard, 255], 0.9);
  } else if (map.id === "hash-market") {
    for (let x = 26; x < 290; x += 38) roundedRect(buffer, canvasWidth, canvasHeight, sx(x), sy(44 + (x % 3) * 6), sw(32), sw(54), sw(6), [255, 255, 255, 255], 0.26);
    for (let x = 34; x < 290; x += 42) line(buffer, canvasWidth, canvasHeight, sx(x), sy(20), sx(x - 16), sy(154), sw(3), [...p.hazard, 255], 0.55);
    line(buffer, canvasWidth, canvasHeight, sx(32), sy(140), sx(292), sy(72), sw(8), [...p.secondary, 255], 0.72);
    line(buffer, canvasWidth, canvasHeight, sx(40), sy(70), sx(276), sy(135), sw(5), [...p.primary, 255], 0.72);
    for (let i = 0; i < 12; i += 1) circle(buffer, canvasWidth, canvasHeight, sx(52 + i * 20), sy(42 + (i % 4) * 25), sw(4), [...p.hazard, 255], 0.92);
  } else if (map.id === "promise-tower") {
    roundedRect(buffer, canvasWidth, canvasHeight, sx(138), sy(24), sw(50), sw(132), sw(14), [255, 255, 255, 255], 0.2);
    for (let y = 38; y < 146; y += 18) rect(buffer, canvasWidth, canvasHeight, sx(150), sy(y), sw(26), sw(5), [...p.hazard, 255], 0.68);
    line(buffer, canvasWidth, canvasHeight, sx(164), sy(42), sx(70), sy(84), sw(7), [...p.primary, 255], 0.75);
    line(buffer, canvasWidth, canvasHeight, sx(164), sy(72), sx(268), sy(44), sw(7), [...p.secondary, 255], 0.75);
    line(buffer, canvasWidth, canvasHeight, sx(164), sy(102), sx(54), sy(138), sw(7), [...p.secondary, 255], 0.64);
    line(buffer, canvasWidth, canvasHeight, sx(164), sy(122), sx(270), sy(136), sw(7), [...p.primary, 255], 0.64);
    for (const [x, y] of [[70, 84], [268, 44], [54, 138], [270, 136]]) circle(buffer, canvasWidth, canvasHeight, sx(x), sy(y), sw(13), [255, 255, 255, 255], 0.82);
  } else if (map.id === "whitebox-core") {
    for (let x = 24; x < 300; x += 32) line(buffer, canvasWidth, canvasHeight, sx(x), sy(20), sx(x), sy(158), sw(2), [...p.primary, 255], 0.25);
    for (let y = 28; y < 152; y += 28) line(buffer, canvasWidth, canvasHeight, sx(22), sy(y), sx(298), sy(y), sw(2), [...p.primary, 255], 0.25);
    roundedRect(buffer, canvasWidth, canvasHeight, sx(126), sy(52), sw(70), sw(70), sw(10), [255, 255, 255, 255], 0.76);
    rect(buffer, canvasWidth, canvasHeight, sx(139), sy(65), sw(44), sw(44), [...p.secondary, 255], 0.5);
    line(buffer, canvasWidth, canvasHeight, sx(34), sy(58), sx(286), sy(58), sw(10), [...p.hazard, 255], 0.6);
    line(buffer, canvasWidth, canvasHeight, sx(44), sy(128), sx(278), sy(98), sw(8), [...p.secondary, 255], 0.5);
    circle(buffer, canvasWidth, canvasHeight, sx(161), sy(87), sw(22), [...p.hazard, 255], 0.55);
  }
}

function savePng(relativePath, width, height, buffer) {
  const outPath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, encodePng(width, height, buffer));
  console.log(`wrote ${relativePath}`);
}

for (const map of maps) {
  const buffer = canvas(badgeSize.width, badgeSize.height);
  drawBadge(buffer, badgeSize.width, badgeSize.height, map);
  savePng(map.file, badgeSize.width, badgeSize.height, buffer);
}

function drawPillText(buffer, width, height, text, x, y, scale, fill, textColor) {
  const w = textWidth(text, scale) + 18;
  roundedRect(buffer, width, height, x, y, w, 9 * scale + 12, 8, fill, 0.9);
  drawText(buffer, width, height, text, x + 9, y + 7, scale, textColor, 1);
  return w;
}

function drawCallout(buffer, width, height, callout, imageX, imageY, imageW, imageH, scale, palette, index) {
  const dotX = imageX + callout.x * scale;
  const dotY = imageY + callout.y * scale;
  const labelWidth = Math.min(162, textWidth(callout.label, 2) + 18);
  const labelX = clamp(dotX + (index % 2 === 0 ? 18 : -labelWidth - 18), imageX + 10, imageX + imageW - labelWidth - 10);
  const labelY = clamp(dotY - 12 + index * 5, imageY + 12, imageY + imageH - 38);
  line(buffer, width, height, dotX, dotY, labelX + (labelX < dotX ? labelWidth : 0), labelY + 16, 2, [...palette.hazard, 255], 0.85);
  circle(buffer, width, height, dotX, dotY, 13, [...palette.hazard, 255], 0.85);
  circle(buffer, width, height, dotX, dotY, 5, [255, 255, 255, 255], 0.98);
  roundedRect(buffer, width, height, labelX, labelY, labelWidth, 30, 7, [8, 14, 22, 255], 0.88);
  drawText(buffer, width, height, callout.label, labelX + 9, labelY + 8, 2, [255, 255, 255, 255], 0.94);
}

function drawCompositionPanel(buffer, width, height, panel, index) {
  const { x, y, map } = panel;
  const p = map.palette;
  const panelWidth = 820;
  const panelHeight = 438;
  const imageScale = 1.84;
  const imageX = x + 32;
  const imageY = y + 86;
  const imageW = badgeSize.width * imageScale;
  const imageH = badgeSize.height * imageScale;
  const sideX = x + 646;
  const sideY = y + 86;

  roundedRect(buffer, width, height, x, y, panelWidth, panelHeight, 24, [255, 255, 255, 255], 0.075);
  roundedRect(buffer, width, height, x + 8, y + 8, panelWidth - 16, panelHeight - 16, 18, [0, 0, 0, 255], 0.16);
  rect(buffer, width, height, x + 28, y + 66, panelWidth - 56, 3, [...p.hazard, 255], 0.85);
  rect(buffer, width, height, x + 28, y + 72, panelWidth - 56, 2, [...p.secondary, 255], 0.62);
  drawText(buffer, width, height, map.shotTitle, x + 30, y + 25, 4, [255, 255, 255, 255], 0.96);
  drawText(buffer, width, height, `SHOT ${String(index + 2).padStart(2, "0")}`, x + panelWidth - 158, y + 32, 2, [...p.hazard, 255], 0.98);

  roundedRect(buffer, width, height, imageX - 10, imageY - 10, imageW + 20, imageH + 20, 14, [255, 255, 255, 255], 0.11);
  drawBadge(buffer, width, height, map, imageX, imageY, imageScale);
  line(buffer, width, height, imageX - 4, imageY - 4, imageX + imageW + 4, imageY - 4, 2, [...p.secondary, 255], 0.45);
  line(buffer, width, height, imageX - 4, imageY + imageH + 4, imageX + imageW + 4, imageY + imageH + 4, 2, [...p.hazard, 255], 0.45);

  (map.callouts ?? []).forEach((callout, calloutIndex) => {
    drawCallout(buffer, width, height, callout, imageX, imageY, imageW, imageH, imageScale, p, calloutIndex);
  });

  roundedRect(buffer, width, height, sideX, sideY, 142, imageH + 20, 16, [7, 13, 22, 255], 0.72);
  drawPillText(buffer, width, height, "HOOK", sideX + 14, sideY + 16, 2, [...p.primary, 255], [8, 14, 22, 255]);
  let textY = sideY + 58;
  textY = drawWrappedText(buffer, width, height, map.shotFocus, sideX + 14, textY, 112, 1, [235, 242, 255, 255], 0.92, 5) + 12;
  drawPillText(buffer, width, height, "DEVICE", sideX + 14, textY, 2, [...p.hazard, 255], [8, 14, 22, 255]);
  textY += 38;
  textY = drawWrappedText(buffer, width, height, map.deviceLabel, sideX + 14, textY, 112, 2, [255, 255, 255, 255], 0.96, 3) + 6;
  drawText(buffer, width, height, "TAGS", sideX + 14, textY, 2, [...p.secondary, 255], 0.96);
  textY += 26;
  for (const tag of map.compositionTags ?? []) {
    const tagWidth = Math.min(116, Math.max(72, textWidth(tag, 1) + 16));
    roundedRect(buffer, width, height, sideX + 14, textY, tagWidth, 18, 5, [255, 255, 255, 255], 0.12);
    drawText(buffer, width, height, tag, sideX + 22, textY + 5, 1, [245, 250, 255, 255], 0.88);
    textY += 24;
  }

  for (let i = 0; i < 5; i += 1) {
    const meterWidth = 74 + i * 10;
    rect(buffer, width, height, x + 36 + i * 104, y + panelHeight - 30, meterWidth, 8, [...p.hazard, 255], 0.7 - i * 0.08);
  }
}

const sheet = canvas(candidateSize.width, candidateSize.height);
drawBackground(sheet, candidateSize.width, candidateSize.height);
drawText(sheet, candidateSize.width, candidateSize.height, "CHAPTER MAP SELLING SHOTS", 90, 32, 4, [255, 255, 255, 255], 0.94);
drawText(sheet, candidateSize.width, candidateSize.height, "INTERACTIVES / HAZARDS / BOSS ROUTES", 90, 78, 2, [176, 221, 255, 255], 0.86);
const panels = [
  { x: 78, y: 126, map: maps[0] },
  { x: 1022, y: 126, map: maps[1] },
  { x: 78, y: 604, map: maps[2] },
  { x: 1022, y: 604, map: maps[3] },
];
panels.forEach((panel, index) => drawCompositionPanel(sheet, candidateSize.width, candidateSize.height, panel, index));
savePng(candidateFile, candidateSize.width, candidateSize.height, sheet);
