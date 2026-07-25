import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const databasePath = path.resolve(workspace, "test-e2e.db");

if (
  path.dirname(databasePath) !== workspace ||
  path.basename(databasePath) !== "test-e2e.db"
) {
  throw new Error("Unerwarteter Pfad fuer die E2E-Testdatenbank.");
}

for (const suffix of ["", "-journal", "-shm", "-wal"]) {
  await rm(`${databasePath}${suffix}`, { force: true });
}

const isWindows = process.platform === "win32";
const command = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "npm";
const args = isWindows
  ? ["/d", "/s", "/c", "npm.cmd run db:reset-demo"]
  : ["run", "db:reset-demo"];
const child = spawn(command, args, {
  env: {
    ...process.env,
    DATABASE_URL: "file:./test-e2e.db",
  },
  stdio: "inherit",
});

const exitCode = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("exit", (code) => resolve(code ?? 1));
});

if (exitCode !== 0) {
  process.exitCode = exitCode;
}
