import { existsSync, readFileSync } from "node:fs";

import { z } from "zod/v4";

import { getDefaultConfigFile } from "./paths.js";
import type { AppConfig, LogLevel, StoredConfig } from "./types.js";

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const envSchema = z.object({
  GSC_CREDENTIALS_FILE: z.string().trim().min(1).optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().trim().min(1).optional(),
  GSC_ALLOWED_SITES: z.string().optional(),
  GSC_ENABLE_WRITE_TOOLS: booleanString.optional(),
  GSC_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(300_000).default(30_000),
  GSC_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
  GSC_MAX_ANALYTICS_ROWS: z.coerce.number().int().min(1).max(25_000).default(25_000),
  GSC_LOG_LEVEL: z.enum(["silent", "error", "warn", "info", "debug"]).default("info"),
});

const storedConfigSchema = z.object({
  credentialsFile: z.string().trim().min(1).optional(),
  allowedSites: z.array(z.string().trim().min(1)).optional(),
  enableWriteTools: z.boolean().optional(),
});

function readStoredConfig(path: string): StoredConfig {
  if (!existsSync(path)) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read config file at ${path}: ${detail}`);
  }

  const result = storedConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid config file at ${path}: ${z.prettifyError(result.error)}`);
  }

  const data = result.data;
  return {
    ...(data.credentialsFile ? { credentialsFile: data.credentialsFile } : {}),
    ...(data.allowedSites ? { allowedSites: data.allowedSites } : {}),
    ...(data.enableWriteTools !== undefined ? { enableWriteTools: data.enableWriteTools } : {}),
  };
}

function parseSiteList(value: string | undefined): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value
    .split(",")
    .map((site) => site.trim())
    .filter(Boolean);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${z.prettifyError(result.error)}`);
  }

  const values = result.data;
  const stored = readStoredConfig(getDefaultConfigFile(env));
  const allowedSites = parseSiteList(values.GSC_ALLOWED_SITES) ?? stored.allowedSites ?? [];
  const credentialsFile =
    values.GSC_CREDENTIALS_FILE ?? values.GOOGLE_APPLICATION_CREDENTIALS ?? stored.credentialsFile;

  return {
    ...(credentialsFile ? { credentialsFile } : {}),
    allowedSites: new Set(allowedSites),
    enableWriteTools: values.GSC_ENABLE_WRITE_TOOLS ?? stored.enableWriteTools ?? false,
    requestTimeoutMs: values.GSC_REQUEST_TIMEOUT_MS,
    maxRetries: values.GSC_MAX_RETRIES,
    maxAnalyticsRows: values.GSC_MAX_ANALYTICS_ROWS,
    logLevel: values.GSC_LOG_LEVEL as LogLevel,
  };
}
