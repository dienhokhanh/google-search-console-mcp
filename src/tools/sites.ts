import type { McpServer } from "@modelcontextprotocol/server";

import type { SearchConsoleClient } from "../google/search-console-client.js";
import { emptyInputSchema } from "../schemas/common.js";
import { getSiteInputSchema } from "../schemas/sites.js";
import { runTool, successResult } from "../shared/tool-result.js";

export function registerSiteTools(server: McpServer, client: SearchConsoleClient): void {
  server.registerTool(
    "gsc_list_sites",
    {
      title: "List Search Console properties",
      description: "List Google Search Console properties available to the configured identity.",
      inputSchema: emptyInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    () =>
      runTool(async () => {
        const sites = await client.listSites();
        return successResult(
          { sites, count: sites.length },
          `Found ${sites.length} Search Console properties.`,
        );
      }),
  );

  server.registerTool(
    "gsc_get_site",
    {
      title: "Get a Search Console property",
      description: "Get permission information for one Google Search Console property.",
      inputSchema: getSiteInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    ({ siteUrl }) =>
      runTool(async () => {
        const site = await client.getSite(siteUrl);
        return successResult({ site });
      }),
  );
}
