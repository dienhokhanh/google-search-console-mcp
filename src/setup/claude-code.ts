import { spawnSync } from "node:child_process";

import { PACKAGE_NAME } from "../version.js";

const SERVER_NAME = "google-search-console";

export interface RegisterResult {
  registered: boolean;
  message: string;
}

function serverCommandArgs(): string[] {
  if (process.platform === "win32") {
    return ["cmd", "/c", "npx", "-y", PACKAGE_NAME];
  }

  return ["npx", "-y", PACKAGE_NAME];
}

function claudeCandidates(): string[] {
  return process.platform === "win32" ? ["claude.exe", "claude.cmd", "claude"] : ["claude"];
}

export function getManualRegistrationCommand(configFile: string): string {
  const command = serverCommandArgs().map(quoteForDisplay).join(" ");
  return `claude mcp add ${SERVER_NAME} --scope user --env GSC_CONFIG_FILE=${quoteForDisplay(configFile)} -- ${command}`;
}

export function registerWithClaudeCode(configFile: string): RegisterResult {
  const args = [
    "mcp",
    "add",
    SERVER_NAME,
    "--scope",
    "user",
    "--env",
    `GSC_CONFIG_FILE=${configFile}`,
    "--",
    ...serverCommandArgs(),
  ];

  for (const candidate of claudeCandidates()) {
    const result = spawnSync(candidate, args, { stdio: "inherit", shell: false });
    if (!result.error && result.status === 0) {
      return {
        registered: true,
        message: `Registered "${SERVER_NAME}" with Claude Code at user scope.`,
      };
    }

    if (!result.error && result.status !== null) {
      return {
        registered: false,
        message: `Claude Code returned exit code ${String(result.status)}.`,
      };
    }
  }

  return {
    registered: false,
    message: "Claude Code CLI was not found on PATH.",
  };
}

function quoteForDisplay(value: string): string {
  return /[\s"']/u.test(value) ? JSON.stringify(value) : value;
}
