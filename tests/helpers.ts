import type { AppConfig } from "../src/config/types.js";

export function createTestConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    allowedSites: new Set<string>(),
    enableWriteTools: false,
    requestTimeoutMs: 5_000,
    maxRetries: 0,
    maxAnalyticsRows: 25_000,
    logLevel: "silent",
    ...overrides,
  };
}
