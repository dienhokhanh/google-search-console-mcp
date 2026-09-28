import { homedir } from "node:os";
import { join } from "node:path";

import { PACKAGE_NAME } from "../version.js";

export function getDefaultConfigDirectory(env: NodeJS.ProcessEnv = process.env): string {
  if (env.GSC_CONFIG_DIR) {
    return env.GSC_CONFIG_DIR;
  }

  if (process.platform === "win32" && env.APPDATA) {
    return join(env.APPDATA, PACKAGE_NAME);
  }

  if (env.XDG_CONFIG_HOME) {
    return join(env.XDG_CONFIG_HOME, PACKAGE_NAME);
  }

  return join(homedir(), ".config", PACKAGE_NAME);
}

export function getDefaultConfigFile(env: NodeJS.ProcessEnv = process.env): string {
  return env.GSC_CONFIG_FILE ?? join(getDefaultConfigDirectory(env), "config.json");
}
