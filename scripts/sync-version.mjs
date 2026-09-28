import { readFile, writeFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const serverJson = JSON.parse(await readFile("server.json", "utf8"));

serverJson.version = packageJson.version;
for (const entry of serverJson.packages ?? []) {
  entry.version = packageJson.version;
}

await writeFile("server.json", `${JSON.stringify(serverJson, null, 2)}\n`);
process.stdout.write(`Updated server.json to ${packageJson.version}.\n`);
