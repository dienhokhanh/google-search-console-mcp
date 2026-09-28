import type { McpServer } from "@modelcontextprotocol/server";

import type { AppConfig } from "../config/types.js";
import type { SearchConsoleClient } from "../google/search-console-client.js";
import { listSitemapsInputSchema, sitemapInputSchema } from "../schemas/sitemaps.js";
import { runTool, successResult } from "../shared/tool-result.js";

export function registerSitemapTools(
  server: McpServer,
  client: SearchConsoleClient,
  config: AppConfig,
): void {
  server.registerTool(
    "gsc_list_sitemaps",
    {
      title: "List sitemaps",
      description: "List sitemaps submitted for a Google Search Console property.",
      inputSchema: listSitemapsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    ({ siteUrl, sitemapIndex }) =>
      runTool(async () => {
        const sitemaps = await client.listSitemaps(siteUrl, sitemapIndex);
        return successResult({ siteUrl, sitemaps, count: sitemaps.length });
      }),
  );

  server.registerTool(
    "gsc_get_sitemap",
    {
      title: "Get a sitemap",
      description: "Get details about a submitted sitemap.",
      inputSchema: sitemapInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    ({ siteUrl, sitemapUrl }) =>
      runTool(async () => successResult({ sitemap: await client.getSitemap(siteUrl, sitemapUrl) })),
  );

  if (!config.enableWriteTools) {
    return;
  }

  server.registerTool(
    "gsc_submit_sitemap",
    {
      title: "Submit a sitemap",
      description:
        "Submit a sitemap to Google Search Console. This write tool must be explicitly enabled.",
      inputSchema: sitemapInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    ({ siteUrl, sitemapUrl }) =>
      runTool(async () => {
        await client.submitSitemap(siteUrl, sitemapUrl);
        return successResult(
          { siteUrl, sitemapUrl, submitted: true },
          "Sitemap submitted successfully.",
        );
      }),
  );

  server.registerTool(
    "gsc_delete_sitemap",
    {
      title: "Delete a sitemap",
      description:
        "Remove a submitted sitemap from Google Search Console. This destructive tool must be explicitly enabled.",
      inputSchema: sitemapInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    ({ siteUrl, sitemapUrl }) =>
      runTool(async () => {
        await client.deleteSitemap(siteUrl, sitemapUrl);
        return successResult(
          { siteUrl, sitemapUrl, deleted: true },
          "Sitemap deleted successfully.",
        );
      }),
  );
}
