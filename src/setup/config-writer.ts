import { chmod, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { StoredConfig } from "../config/types.js";

export async function writeStoredConfig(path: string, config: StoredConfig): Promise<void> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  if (process.platform !== "win32") {
    await chmod(path, 0o600);
  }
}
