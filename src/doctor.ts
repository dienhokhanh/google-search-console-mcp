import { loadConfig } from "./config/env.js";
import { SearchConsoleClient } from "./google/search-console-client.js";
import { createLogger } from "./shared/logger.js";

export async function runDoctor(): Promise<number> {
  const config = loadConfig();
  process.stdout.write("Google Search Console MCP diagnostics\n");
  process.stdout.write(
    `Credentials: ${config.credentialsFile ? "configured file" : "Application Default Credentials"}\n`,
  );
  process.stdout.write(`Write tools: ${config.enableWriteTools ? "enabled" : "disabled"}\n`);
  process.stdout.write(
    `Property allowlist: ${config.allowedSites.size > 0 ? String(config.allowedSites.size) : "not set"}\n`,
  );

  const client = new SearchConsoleClient({ config, logger: createLogger("silent") });
  const sites = await client.listSites();
  process.stdout.write(`API connection: OK (${sites.length} accessible properties)\n`);
  return 0;
}
