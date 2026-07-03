const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { assets, size } = require("./meta-asset-manifest.cjs");

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
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

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

function mix(a, b, t) {
  return a.map((value, index) => Math.round(value + (b[index] - value) * t));
}

function makeCanvas(width, height) {
  return Buffer.alloc(width * height * 4);
}

function blendPixel(buffer, width, x, y, color, alpha = 1) {
  if (x < 0 || y < 0 || x >= width || y >= width) {
    return;
  }
  const index = (Math.floor(y) * width + Math.floor(x)) * 4;
  const srcAlpha = clamp((color[3] ?? 255) / 255 * alpha, 0, 1);
  const dstAlpha = buffer[index + 3] / 255;
  const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);
  if (outAlpha <= 0) {
    return;
  }
  for (let channel = 0; channel < 3; channel += 1) {
    const src = color[channel];
    const dst = buffer[index + channel];
    buffer[index + channel] = Math.round((src * srcAlpha + dst * dstAlpha * (1 - srcAlpha)) / outAlpha);
  }
  buffer[index + 3] = Math.round(outAlpha * 255);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fillCircle(buffer, width, cx, cy, radius, color, alpha = 1) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        blendPixel(buffer, width, x, y, color, alpha);
      }
    }
  }
}

function strokeCircle(buffer, width, cx, cy, radius, thickness, color, alpha = 1) {
  const outer = radius + thickness / 2;
  const inner = radius - thickness / 2;
  for (let y = Math.floor(cy - outer); y <= Math.ceil(cy + outer); y += 1) {
    for (let x = Math.floor(cx - outer); x <= Math.ceil(cx + outer); x += 1) {
      const d = Math.hypot(x - cx, y - cy);
      if (d >= inner && d <= outer) {
        blendPixel(buffer, width, x, y, color, alpha);
      }
    }
  }
}

function line(buffer, width, x1, y1, x2, y2, thickness, color, alpha = 1) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2);
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    fillCircle(buffer, width, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, color, alpha);
  }
}

function roundedRect(buffer, width, x, y, w, h, radius, color, alpha = 1) {
  for (let py = Math.floor(y); py < Math.ceil(y + h); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + w); px += 1) {
      const dx = Math.max(x + radius - px, 0, px - (x + w - radius));
      const dy = Math.max(y + radius - py, 0, py - (y + h - radius));
      if (dx * dx + dy * dy <= radius * radius) {
        blendPixel(buffer, width, px, py, color, alpha);
      }
    }
  }
}

function drawBackground(buffer, width, asset) {
  const dark = [18, 30, 45];
  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / (width - 1);
      const ny = y / (width - 1);
      const radial = clamp(1 - Math.hypot(nx - 0.45, ny - 0.36) * 1.35, 0, 1);
      const base = mix(dark, asset.primary, 0.22 + radial * 0.42);
      const accent = mix(base, asset.secondary, Math.max(0, nx - 0.35) * 0.28);
      blendPixel(buffer, width, x, y, [...accent, 255], 1);
    }
  }
  fillCircle(buffer, width, 90, 28, 48, [...asset.secondary, 120], 0.28);
  fillCircle(buffer, width, 36, 96, 44, [...asset.primary, 120], 0.18);
  roundedRect(buffer, width, 8, 8, 112, 112, 24, [255, 255, 255, 255], 0.08);
  strokeCircle(buffer, width, 64, 64, 51, 3, [...asset.accent, 255], 0.42);
}

function drawSymbol(buffer, width, asset) {
  const white = [255, 255, 255, 255];
  const accent = [...asset.accent, 255];
  const primary = [...asset.primary, 255];
  const secondary = [...asset.secondary, 255];

  if (asset.symbol === "heart") {
    fillCircle(buffer, width, 51, 50, 17, white, 0.92);
    fillCircle(buffer, width, 77, 50, 17, white, 0.92);
    line(buffer, width, 38, 61, 64, 94, 24, white, 0.92);
    line(buffer, width, 90, 61, 64, 94, 24, white, 0.92);
    line(buffer, width, 36, 67, 49, 67, 4, primary, 0.95);
    line(buffer, width, 49, 67, 56, 55, 4, primary, 0.95);
    line(buffer, width, 56, 55, 68, 78, 4, primary, 0.95);
    line(buffer, width, 68, 78, 82, 66, 4, primary, 0.95);
    line(buffer, width, 82, 66, 94, 66, 4, primary, 0.95);
  } else if (asset.symbol === "cache") {
    roundedRect(buffer, width, 33, 31, 62, 66, 12, white, 0.9);
    roundedRect(buffer, width, 43, 42, 42, 14, 5, primary, 0.9);
    roundedRect(buffer, width, 43, 62, 42, 14, 5, secondary, 0.9);
    roundedRect(buffer, width, 43, 82, 42, 7, 3, accent, 0.9);
    for (const x of [36, 92]) {
      for (let y = 42; y <= 88; y += 11) {
        line(buffer, width, x, y, x + (x < 64 ? -12 : 12), y, 4, accent, 0.9);
      }
    }
  } else if (asset.symbol === "route") {
    line(buffer, width, 31, 84, 54, 45, 9, white, 0.9);
    line(buffer, width, 54, 45, 75, 82, 9, white, 0.9);
    line(buffer, width, 75, 82, 98, 36, 9, white, 0.9);
    fillCircle(buffer, width, 31, 84, 12, primary, 0.98);
    fillCircle(buffer, width, 54, 45, 12, secondary, 0.98);
    fillCircle(buffer, width, 75, 82, 12, primary, 0.98);
    fillCircle(buffer, width, 98, 36, 12, secondary, 0.98);
  } else if (asset.symbol === "shield") {
    line(buffer, width, 64, 25, 96, 42, 13, white, 0.92);
    line(buffer, width, 64, 25, 32, 42, 13, white, 0.92);
    line(buffer, width, 32, 42, 39, 78, 13, white, 0.92);
    line(buffer, width, 96, 42, 89, 78, 13, white, 0.92);
    line(buffer, width, 39, 78, 64, 101, 13, white, 0.92);
    line(buffer, width, 89, 78, 64, 101, 13, white, 0.92);
    line(buffer, width, 64, 39, 64, 87, 5, primary, 0.95);
    line(buffer, width, 47, 63, 81, 63, 5, secondary, 0.95);
  } else if (asset.symbol === "paperclip") {
    strokeCircle(buffer, width, 64, 61, 30, 10, white, 0.93);
    strokeCircle(buffer, width, 64, 61, 17, 7, primary, 0.95);
    line(buffer, width, 81, 82, 101, 101, 6, secondary, 0.95);
    fillCircle(buffer, width, 101, 101, 7, secondary, 0.98);
  } else if (asset.symbol === "keyboard") {
    roundedRect(buffer, width, 25, 42, 78, 50, 10, white, 0.91);
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        roundedRect(buffer, width, 35 + col * 12, 52 + row * 11, 8, 7, 2, row === 1 ? secondary : primary, 0.9);
      }
    }
    line(buffer, width, 38, 84, 86, 84, 5, secondary, 0.9);
  } else if (asset.symbol === "spray") {
    roundedRect(buffer, width, 36, 52, 35, 49, 9, white, 0.92);
    roundedRect(buffer, width, 43, 36, 25, 21, 6, primary, 0.92);
    roundedRect(buffer, width, 67, 41, 23, 10, 4, white, 0.9);
    line(buffer, width, 89, 46, 107, 36, 4, secondary, 0.95);
    line(buffer, width, 88, 51, 110, 55, 4, secondary, 0.95);
    line(buffer, width, 87, 56, 103, 72, 4, secondary, 0.95);
    fillCircle(buffer, width, 52, 77, 8, primary, 0.72);
  }
}

for (const asset of assets) {
  const buffer = makeCanvas(size, size);
  drawBackground(buffer, size, asset);
  drawSymbol(buffer, size, asset);
  const outPath = path.join(rootDir, asset.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, encodePng(size, size, buffer));
  console.log(`wrote ${asset.file}`);
}
