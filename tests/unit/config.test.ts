import { describe, expect, it } from "vitest";

import { loadConfig } from "../../src/config/env.js";

describe("loadConfig", () => {
  it("loads safe defaults without a config file", () => {
    const config = loadConfig({ GSC_CONFIG_FILE: "Z:\\missing-gsc-config.json" });

    expect(config.enableWriteTools).toBe(false);
    expect(config.maxAnalyticsRows).toBe(25_000);
    expect(config.maxRetries).toBe(2);
    expect(config.allowedSites.size).toBe(0);
  });

  it("parses environment overrides", () => {
    const config = loadConfig({
      GSC_CONFIG_FILE: "Z:\\missing-gsc-config.json",
      GSC_ALLOWED_SITES: "sc-domain:example.com, https://www.example.com/",
      GSC_ENABLE_WRITE_TOOLS: "true",
      GSC_MAX_ANALYTICS_ROWS: "5000",
      GSC_LOG_LEVEL: "debug",
    });

    expect(config.enableWriteTools).toBe(true);
    expect(config.maxAnalyticsRows).toBe(5_000);
    expect(config.allowedSites).toEqual(
      new Set(["sc-domain:example.com", "https://www.example.com/"]),
    );
    expect(config.logLevel).toBe("debug");
  });

  it("rejects unsafe values", () => {
    expect(() =>
      loadConfig({ GSC_CONFIG_FILE: "Z:\\missing-gsc-config.json", GSC_MAX_RETRIES: "100" }),
    ).toThrow("Invalid environment configuration");
  });
});
