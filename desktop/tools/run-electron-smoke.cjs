const path = require("node:path");
const { spawn } = require("node:child_process");

let electronBinary;
try {
  electronBinary = require("electron");
} catch {
  console.error("Electron is not installed. Run npm install before npm run desktop:smoke.");
  process.exit(1);
}

const child = spawn(electronBinary, ["."], {
  cwd: path.resolve(__dirname, "../.."),
  env: {
    ...process.env,
    VARIABLE_CITY_ELECTRON_SMOKE: "1",
  },
  stdio: "inherit",
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Electron smoke exited by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
