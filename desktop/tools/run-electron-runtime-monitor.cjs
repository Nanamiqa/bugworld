const path = require("node:path");
const { spawn } = require("node:child_process");

let electronBinary;
try {
  electronBinary = require("electron");
} catch {
  console.error("Electron is not installed. Run npm install before npm run desktop:monitor.");
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..", "..");
const monitorMain = path.join(__dirname, "electron-runtime-monitor-main.cjs");

function readArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

const durationArg = readArg("duration-ms");
const sampleArg = readArg("sample-ms");

const child = spawn(electronBinary, [monitorMain], {
  cwd: rootDir,
  env: {
    ...process.env,
    VARIABLE_CITY_RUNTIME_MONITOR_MS: durationArg ?? process.env.VARIABLE_CITY_RUNTIME_MONITOR_MS ?? "",
    VARIABLE_CITY_RUNTIME_MONITOR_SAMPLE_MS: sampleArg ?? process.env.VARIABLE_CITY_RUNTIME_MONITOR_SAMPLE_MS ?? "",
  },
  stdio: "inherit",
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Electron runtime monitor exited by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
