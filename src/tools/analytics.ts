import type { McpServer } from "@modelcontextprotocol/server";

import type { SearchConsoleClient } from "../google/search-console-client.js";
import { querySearchAnalyticsInputSchema } from "../schemas/analytics.js";
import { runTool, successResult } from "../shared/tool-result.js";

export function registerAnalyticsTools(server: McpServer, client: SearchConsoleClient): void {
  server.registerTool(
    "gsc_query_search_analytics",
    {
      title: "Query Search Analytics",
      description:
        "Query clicks, impressions, CTR, and average position from Google Search Console. Use startRow for pagination.",
      inputSchema: querySearchAnalyticsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    ({ siteUrl, ...query }) =>
      runTool(async () => {
        const response = await client.querySearchAnalytics(siteUrl, {
          startDate: query.startDate,
          endDate: query.endDate,
          type: query.type,
          dataState: query.dataState,
          rowLimit: query.rowLimit,
          startRow: query.startRow,
          ...(query.dimensions ? { dimensions: query.dimensions } : {}),
          ...(query.dimensionFilterGroups
            ? { dimensionFilterGroups: query.dimensionFilterGroups }
            : {}),
          ...(query.aggregationType ? { aggregationType: query.aggregationType } : {}),
        });
        const rows = response.rows ?? [];
        return successResult(
          {
            siteUrl,
            rows,
            rowCount: rows.length,
            startRow: query.startRow,
            requestedRowLimit: query.rowLimit,
            responseAggregationType: response.responseAggregationType ?? null,
            metadata: response.metadata ?? null,
          },
          `Returned ${rows.length} Search Analytics rows.`,
        );
      }),
  );
}
