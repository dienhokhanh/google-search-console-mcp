import type { McpServer } from "@modelcontextprotocol/server";

import type { SearchConsoleClient } from "../google/search-console-client.js";
import { inspectUrlInputSchema } from "../schemas/inspection.js";
import { runTool, successResult } from "../shared/tool-result.js";

export function registerInspectionTools(server: McpServer, client: SearchConsoleClient): void {
  server.registerTool(
    "gsc_inspect_url",
    {
      title: "Inspect a URL",
      description:
        "Inspect the version of a URL currently known to Google's index. This does not run a live test or request indexing.",
      inputSchema: inspectUrlInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    ({ siteUrl, inspectionUrl, languageCode }) =>
      runTool(async () => {
        const result = await client.inspectUrl(siteUrl, inspectionUrl, languageCode);
        return successResult({ siteUrl, inspectionUrl, ...result });
      }),
  );
}
