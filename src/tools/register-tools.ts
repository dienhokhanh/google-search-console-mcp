import type { McpServer } from "@modelcontextprotocol/server";

import type { AppConfig } from "../config/types.js";
import type { SearchConsoleClient } from "../google/search-console-client.js";
import { registerAnalyticsTools } from "./analytics.js";
import { registerInspectionTools } from "./inspection.js";
import { registerSitemapTools } from "./sitemaps.js";
import { registerSiteTools } from "./sites.js";

export function registerTools(
  server: McpServer,
  client: SearchConsoleClient,
  config: AppConfig,
): void {
  registerSiteTools(server, client);
  registerAnalyticsTools(server, client);
  registerSitemapTools(server, client, config);
  registerInspectionTools(server, client);
}
