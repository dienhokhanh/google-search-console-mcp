import type { CallToolResult } from "@modelcontextprotocol/server";

import { formatGoogleApiError } from "../google/api-error.js";

export function successResult(data: Record<string, unknown>, summary?: string): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: summary
          ? `${summary}\n\n${JSON.stringify(data, null, 2)}`
          : JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  };
}

export function errorResult(error: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: formatGoogleApiError(error) }],
    isError: true,
  };
}

export async function runTool(operation: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await operation();
  } catch (error) {
    return errorResult(error);
  }
}
