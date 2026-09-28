import type { LogLevel } from "../config/types.js";

const priorities: Record<Exclude<LogLevel, "silent">, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export function createLogger(level: LogLevel): Logger {
  function write(
    entryLevel: Exclude<LogLevel, "silent">,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (level === "silent" || priorities[entryLevel] > priorities[level]) {
      return;
    }

    process.stderr.write(
      `${JSON.stringify({
        timestamp: new Date().toISOString(),
        level: entryLevel,
        message,
        ...(context ?? {}),
      })}\n`,
    );
  }

  return {
    error: (message, context) => write("error", message, context),
    warn: (message, context) => write("warn", message, context),
    info: (message, context) => write("info", message, context),
    debug: (message, context) => write("debug", message, context),
  };
}
