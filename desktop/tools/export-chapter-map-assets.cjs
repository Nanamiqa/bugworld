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

function drawBadge(buffer, width, height, map, offsetX = 0, offsetY = 0, scale = 1) {
  const p = map.palette;
  const bg = p.background;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / Math.max(1, width - 1);
      const ny = y / Math.max(1, height - 1);
      const glow = clamp(1 - Math.hypot(nx - 0.62, ny - 0.34) * 1.35, 0, 1);
      const color = mix(mix(bg, p.primary, 0.18), p.secondary, glow * 0.22 + nx * 0.1);
      blendPixel(buffer, width, height, offsetX + x * scale, offsetY + y * scale, [...color, 255], 1);
    }
  }

  const sx = (value) => offsetX + value * scale;
  const sy = (value) => offsetY + value * scale;
  const sw = (value) => value * scale;
  roundedRect(buffer, width, height, sx(12), sy(12), sw(296), sw(156), sw(18), [255, 255, 255, 255], 0.07);
  rect(buffer, width, height, sx(24), sy(126), sw(272), sw(18), [...p.hazard, 255], 0.22);

  if (map.id === "metro-loop") {
    for (const y of [48, 82, 116]) line(buffer, width, height, sx(28), sy(y), sx(292), sy(y + 10), sw(5), [255, 255, 255, 255], 0.28);
    line(buffer, width, height, sx(36), sy(136), sx(272), sy(42), sw(10), [...p.primary, 255], 0.78);
    line(buffer, width, height, sx(48), sy(36), sx(286), sy(138), sw(7), [...p.secondary, 255], 0.64);
    roundedRect(buffer, width, height, sx(215), sy(54), sw(58), sw(45), sw(8), [255, 255, 255, 255], 0.85);
    for (let x = 58; x <= 176; x += 24) circle(buffer, width, height, sx(x), sy(102 + (x % 2) * 10), sw(5), [...p.hazard, 255], 0.9);
  } else if (map.id === "hash-market") {
    for (let x = 26; x < 290; x += 38) roundedRect(buffer, width, height, sx(x), sy(44 + (x % 3) * 6), sw(32), sw(54), sw(6), [255, 255, 255, 255], 0.26);
    for (let x = 34; x < 290; x += 42) line(buffer, width, height, sx(x), sy(20), sx(x - 16), sy(154), sw(3), [...p.hazard, 255], 0.55);
    line(buffer, width, height, sx(32), sy(140), sx(292), sy(72), sw(8), [...p.secondary, 255], 0.72);
    line(buffer, width, height, sx(40), sy(70), sx(276), sy(135), sw(5), [...p.primary, 255], 0.72);
    for (let i = 0; i < 12; i += 1) circle(buffer, width, height, sx(52 + i * 20), sy(42 + (i % 4) * 25), sw(4), [...p.hazard, 255], 0.92);
  } else if (map.id === "promise-tower") {
    roundedRect(buffer, width, height, sx(138), sy(24), sw(50), sw(132), sw(14), [255, 255, 255, 255], 0.2);
    for (let y = 38; y < 146; y += 18) rect(buffer, width, height, sx(150), sy(y), sw(26), sw(5), [...p.hazard, 255], 0.68);
    line(buffer, width, height, sx(164), sy(42), sx(70), sy(84), sw(7), [...p.primary, 255], 0.75);
    line(buffer, width, height, sx(164), sy(72), sx(268), sy(44), sw(7), [...p.secondary, 255], 0.75);
    line(buffer, width, height, sx(164), sy(102), sx(54), sy(138), sw(7), [...p.secondary, 255], 0.64);
    line(buffer, width, height, sx(164), sy(122), sx(270), sy(136), sw(7), [...p.primary, 255], 0.64);
    for (const [x, y] of [[70, 84], [268, 44], [54, 138], [270, 136]]) circle(buffer, width, height, sx(x), sy(y), sw(13), [255, 255, 255, 255], 0.82);
  } else if (map.id === "whitebox-core") {
    for (let x = 24; x < 300; x += 32) line(buffer, width, height, sx(x), sy(20), sx(x), sy(158), sw(2), [...p.primary, 255], 0.25);
    for (let y = 28; y < 152; y += 28) line(buffer, width, height, sx(22), sy(y), sx(298), sy(y), sw(2), [...p.primary, 255], 0.25);
    roundedRect(buffer, width, height, sx(126), sy(52), sw(70), sw(70), sw(10), [255, 255, 255, 255], 0.76);
    rect(buffer, width, height, sx(139), sy(65), sw(44), sw(44), [...p.secondary, 255], 0.5);
    line(buffer, width, height, sx(34), sy(58), sx(286), sy(58), sw(10), [...p.hazard, 255], 0.6);
    line(buffer, width, height, sx(44), sy(128), sx(278), sy(98), sw(8), [...p.secondary, 255], 0.5);
    circle(buffer, width, height, sx(161), sy(87), sw(22), [...p.hazard, 255], 0.55);
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

const sheet = canvas(candidateSize.width, candidateSize.height);
rect(sheet, candidateSize.width, candidateSize.height, 0, 0, candidateSize.width, candidateSize.height, [16, 25, 38, 255], 1);
const panels = [
  { x: 96, y: 80, map: maps[0] },
  { x: 1008, y: 80, map: maps[1] },
  { x: 96, y: 570, map: maps[2] },
  { x: 1008, y: 570, map: maps[3] },
];
for (const panel of panels) {
  roundedRect(sheet, candidateSize.width, candidateSize.height, panel.x - 24, panel.y - 24, 840, 408, 28, [255, 255, 255, 255], 0.08);
  drawBadge(sheet, candidateSize.width, candidateSize.height, panel.map, panel.x, panel.y, 2.45);
  const p = panel.map.palette;
  for (let i = 0; i < 4; i += 1) {
    rect(sheet, candidateSize.width, candidateSize.height, panel.x + 34 + i * 112, panel.y + 352, 80, 12, [...p.hazard, 255], 0.65 - i * 0.08);
  }
}
savePng(candidateFile, candidateSize.width, candidateSize.height, sheet);
