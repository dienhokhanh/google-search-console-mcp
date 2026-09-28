import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SearchConsoleClient,
  type AuthenticatedRequester,
} from "../../src/google/search-console-client.js";
import { createServer } from "../../src/server.js";
import { createLogger } from "../../src/shared/logger.js";
import { createTestConfig } from "../helpers.js";

const closeCallbacks: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(closeCallbacks.splice(0).map((close) => close()));
});

async function createConnectedClient(enableWriteTools = false): Promise<Client> {
  const config = createTestConfig({ enableWriteTools });
  const request = vi.fn(async () => ({
    data: {
      siteEntry: [{ siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" }],
    },
  }));
  const requester: AuthenticatedRequester = {
    request: request as unknown as AuthenticatedRequester["request"],
  };
  const apiClient = new SearchConsoleClient({ config, logger: createLogger("silent"), requester });
  const server = createServer({ config, logger: createLogger("silent"), client: apiClient });
  const client = new Client({ name: "contract-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);
  await client.connect(clientTransport);
  closeCallbacks.push(async () => {
    await client.close();
    await server.close();
  });
  return client;
}

describe("MCP server contract", () => {
  it("advertises read-only tools by default", async () => {
    const client = await createConnectedClient();
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);

    expect(names).toEqual(
      expect.arrayContaining([
        "gsc_list_sites",
        "gsc_get_site",
        "gsc_query_search_analytics",
        "gsc_list_sitemaps",
        "gsc_get_sitemap",
        "gsc_inspect_url",
      ]),
    );
    expect(names).not.toContain("gsc_submit_sitemap");
    expect(names).not.toContain("gsc_delete_sitemap");
  });

  it("returns structured data from a tool call", async () => {
    const client = await createConnectedClient();
    const result = await client.callTool({ name: "gsc_list_sites", arguments: {} });

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      sites: [{ siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" }],
      count: 1,
    });
  });

  it("only advertises mutation tools after explicit opt-in", async () => {
    const client = await createConnectedClient(true);
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);

    expect(names).toContain("gsc_submit_sitemap");
    expect(names).toContain("gsc_delete_sitemap");
  });
});
