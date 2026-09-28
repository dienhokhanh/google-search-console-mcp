import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "dist/cli.js",
  "dist/index.js",
  "dist/index.d.ts",
  "README.md",
  "LICENSE",
  "server.json",
];

await Promise.all(requiredFiles.map((path) => access(path)));

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const serverJson = JSON.parse(await readFile("server.json", "utf8"));
const cli = await readFile("dist/cli.js", "utf8");

if (packageJson.version !== serverJson.version) {
  throw new Error("package.json and server.json versions do not match.");
}

if (packageJson.mcpName !== serverJson.name) {
  throw new Error("package.json mcpName and server.json name do not match.");
}

if (serverJson.packages?.[0]?.version !== packageJson.version) {
  throw new Error("The MCP Registry package version does not match package.json.");
}

if (!cli.startsWith("#!/usr/bin/env node")) {
  throw new Error("The compiled CLI is missing its executable shebang.");
}

process.stdout.write(
  `Package metadata is consistent for ${packageJson.name}@${packageJson.version}.\n`,
);
