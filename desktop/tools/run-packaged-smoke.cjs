const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..", "..");
const productExe = path.join(rootDir, "dist", "steam-demo", "win-unpacked", "变量城夜巡.exe");

if (!fs.existsSync(productExe)) {
  console.error("Packaged exe is missing. Run npm run dist:win before npm run dist:smoke.");
  process.exit(1);
}

const child = spawn(productExe, {
  cwd: path.dirname(productExe),
  env: {
    ...process.env,
    VARIABLE_CITY_ELECTRON_SMOKE: "1"
  },
  stdio: "inherit",
  windowsHide: true
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Packaged smoke exited by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
