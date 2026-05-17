#!/usr/bin/env node
/* eslint-disable */
const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";

const watcher = spawn(
  process.execPath,
  [path.join(__dirname, "build-content.js"), "--watch"],
  { stdio: "inherit", cwd: ROOT },
);

const cra = spawn(
  isWin ? "npx.cmd" : "npx",
  ["react-scripts", "start"],
  { stdio: "inherit", cwd: ROOT, shell: isWin },
);

let exiting = false;
function shutdown(code) {
  if (exiting) return;
  exiting = true;
  for (const child of [watcher, cra]) {
    if (child && !child.killed) {
      try { child.kill(); } catch {}
    }
  }
  process.exit(code ?? 0);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
cra.on("exit", (code) => shutdown(code ?? 0));
watcher.on("exit", (code) => {
  if (code !== 0 && !exiting) {
    console.error(`[dev] content watcher exited with code ${code}`);
    shutdown(code ?? 1);
  }
});
