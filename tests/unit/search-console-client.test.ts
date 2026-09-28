import { describe, expect, it, vi } from "vitest";

import {
  SearchConsoleClient,
  type AuthenticatedRequester,
  type RequestOptions,
} from "../../src/google/search-console-client.js";
import { createLogger } from "../../src/shared/logger.js";
import { createTestConfig } from "../helpers.js";

function mockRequester(data: unknown): {
  requester: AuthenticatedRequester;
  request: ReturnType<typeof vi.fn>;
} {
  const request = vi.fn(async (_options: RequestOptions) => ({ data }));
  return {
    requester: { request: request as unknown as AuthenticatedRequester["request"] },
    request,
  };
}

describe("SearchConsoleClient", () => {
  it("filters listed properties through the allowlist", async () => {
    const { requester } = mockRequester({
      siteEntry: [
        { siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" },
        { siteUrl: "sc-domain:other.com", permissionLevel: "siteOwner" },
      ],
    });
    const client = new SearchConsoleClient({
      config: createTestConfig({ allowedSites: new Set(["sc-domain:example.com"]) }),
      logger: createLogger("silent"),
      requester,
    });

    await expect(client.listSites()).resolves.toEqual([
      { siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" },
    ]);
  });

  it("URL-encodes property and sitemap identifiers", async () => {
    const { requester, request } = mockRequester({ path: "https://example.com/sitemap.xml" });
    const client = new SearchConsoleClient({
      config: createTestConfig(),
      logger: createLogger("silent"),
      requester,
    });

    await client.getSitemap("https://example.com/", "https://example.com/sitemap.xml");

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          "sites/https%3A%2F%2Fexample.com%2F/sitemaps/https%3A%2F%2Fexample.com%2Fsitemap.xml",
        ),
      }),
    );
  });

  it("caps analytics rows using the configured maximum", async () => {
    const { requester, request } = mockRequester({ rows: [] });
    const client = new SearchConsoleClient({
      config: createTestConfig({ maxAnalyticsRows: 500 }),
      logger: createLogger("silent"),
      requester,
    });

    await client.querySearchAnalytics("sc-domain:example.com", {
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      rowLimit: 25_000,
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rowLimit: 500 }) }),
    );
  });

  it("blocks properties outside the allowlist before making a request", async () => {
    const { requester, request } = mockRequester({});
    const client = new SearchConsoleClient({
      config: createTestConfig({ allowedSites: new Set(["sc-domain:example.com"]) }),
      logger: createLogger("silent"),
      requester,
    });

    await expect(client.getSite("sc-domain:other.com")).rejects.toThrow("is not allowed");
    expect(request).not.toHaveBeenCalled();
  });

  it("blocks write operations unless explicitly enabled", async () => {
    const { requester, request } = mockRequester({});
    const client = new SearchConsoleClient({
      config: createTestConfig(),
      logger: createLogger("silent"),
      requester,
    });

    await expect(
      client.submitSitemap("sc-domain:example.com", "https://example.com/sitemap.xml"),
    ).rejects.toThrow("Write tools are disabled");
    expect(request).not.toHaveBeenCalled();
  });
});
