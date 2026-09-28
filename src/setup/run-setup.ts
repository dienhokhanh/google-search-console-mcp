import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";

import { loadConfig } from "../config/env.js";
import { getDefaultConfigFile } from "../config/paths.js";
import type { StoredConfig } from "../config/types.js";
import { formatGoogleApiError } from "../google/api-error.js";
import { SearchConsoleClient } from "../google/search-console-client.js";
import { createLogger } from "../shared/logger.js";
import { getManualRegistrationCommand, registerWithClaudeCode } from "./claude-code.js";
import { writeStoredConfig } from "./config-writer.js";

interface SetupOptions {
  credentialsFile?: string;
  allowedSites?: string[];
  enableWriteTools: boolean;
  skipRegister: boolean;
  nonInteractive: boolean;
}

function parseSetupOptions(args: string[]): SetupOptions {
  const options: SetupOptions = {
    enableWriteTools: false,
    skipRegister: false,
    nonInteractive: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--credentials") {
      const value = args[index + 1];
      if (!value) throw new Error("--credentials requires a file path.");
      options.credentialsFile = value;
      index += 1;
    } else if (argument === "--allowed-sites") {
      const value = args[index + 1];
      if (!value) throw new Error("--allowed-sites requires a comma-separated value.");
      options.allowedSites = value
        .split(",")
        .map((site) => site.trim())
        .filter(Boolean);
      index += 1;
    } else if (argument === "--enable-write-tools") {
      options.enableWriteTools = true;
    } else if (argument === "--skip-register") {
      options.skipRegister = true;
    } else if (argument === "--non-interactive") {
      options.nonInteractive = true;
    } else {
      throw new Error(`Unknown setup option: ${argument ?? ""}`);
    }
  }

  return options;
}

async function promptForCredentials(current: string | undefined): Promise<string | undefined> {
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const defaultText = current ? ` [${current}]` : "";
    const answer = await terminal.question(
      `Path to a Google service account JSON file${defaultText} (leave empty to use Application Default Credentials): `,
    );
    return answer.trim() || current;
  } finally {
    terminal.close();
  }
}

export async function runSetup(args: string[]): Promise<number> {
  const options = parseSetupOptions(args);
  const configFile = getDefaultConfigFile();
  const current = loadConfig();
  let credentialsFile = options.credentialsFile ?? current.credentialsFile;

  if (!options.nonInteractive && process.stdin.isTTY && !options.credentialsFile) {
    credentialsFile = await promptForCredentials(credentialsFile);
  }

  if (credentialsFile) {
    credentialsFile = resolve(credentialsFile);
    if (!existsSync(credentialsFile)) {
      throw new Error(`Credentials file does not exist: ${credentialsFile}`);
    }
  }

  const storedConfig: StoredConfig = {
    ...(credentialsFile ? { credentialsFile } : {}),
    ...(options.allowedSites ? { allowedSites: options.allowedSites } : {}),
    enableWriteTools: options.enableWriteTools,
  };
  await writeStoredConfig(configFile, storedConfig);
  process.stdout.write(`Saved configuration to ${configFile}\n`);

  const config = loadConfig({ ...process.env, GSC_CONFIG_FILE: configFile });
  const client = new SearchConsoleClient({ config, logger: createLogger("silent") });

  try {
    const sites = await client.listSites();
    process.stdout.write(
      `Google authentication succeeded. Found ${sites.length} accessible properties.\n`,
    );
    if (sites.length > 0) {
      for (const site of sites) {
        process.stdout.write(`  - ${site.siteUrl} (${site.permissionLevel})\n`);
      }
    }
  } catch (error) {
    process.stderr.write(`${formatGoogleApiError(error)}\n`);
    process.stderr.write(
      "Configuration was saved, but validation failed. Ensure the Search Console API is enabled and the identity has property access.\n",
    );
    return 1;
  }

  if (options.skipRegister) {
    process.stdout.write("Skipped Claude Code registration.\n");
    return 0;
  }

  const registration = registerWithClaudeCode(configFile);
  process.stdout.write(`${registration.message}\n`);
  if (!registration.registered) {
    process.stdout.write("Register it manually with:\n");
    process.stdout.write(`  ${getManualRegistrationCommand(configFile)}\n`);
  }

  return registration.registered ? 0 : 1;
}
