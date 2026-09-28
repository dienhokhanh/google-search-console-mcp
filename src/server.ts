import { McpServer } from "@modelcontextprotocol/server";

import { SearchConsoleClient } from "./google/search-console-client.js";
import { createLogger, type Logger } from "./shared/logger.js";
import type { AppConfig } from "./config/types.js";
import { registerTools } from "./tools/register-tools.js";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./version.js";

export interface CreateServerOptions {
  config: AppConfig;
  logger?: Logger;
  client?: SearchConsoleClient;
}

export function createServer(options: CreateServerOptions): McpServer {
  const logger = options.logger ?? createLogger(options.config.logLevel);
  const client = options.client ?? new SearchConsoleClient({ config: options.config, logger });
  const server = new McpServer({
    name: PACKAGE_NAME,
    version: PACKAGE_VERSION,
    title: "Google Search Console MCP",
  });

  registerTools(server, client, options.config);
  return server;
}
