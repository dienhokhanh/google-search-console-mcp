export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

export interface AppConfig {
  credentialsFile?: string;
  allowedSites: ReadonlySet<string>;
  enableWriteTools: boolean;
  requestTimeoutMs: number;
  maxRetries: number;
  maxAnalyticsRows: number;
  logLevel: LogLevel;
}

export interface StoredConfig {
  credentialsFile?: string;
  allowedSites?: string[];
  enableWriteTools?: boolean;
}
