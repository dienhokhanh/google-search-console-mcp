import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { loadConfig } from "./config/env.js";
import { runDoctor } from "./doctor.js";
import { createServer } from "./server.js";
import { runSetup } from "./setup/run-setup.js";
import { createLogger } from "./shared/logger.js";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./version.js";

function printHelp(): void {
  process.stdout.write(`Google Search Console MCP ${PACKAGE_VERSION}\n\n`);
  process.stdout.write("Usage:\n");
  process.stdout.write(`  ${PACKAGE_NAME}                Start the MCP server over stdio\n`);
  process.stdout.write(`  ${PACKAGE_NAME} setup [options] Run the configuration wizard\n`);
  process.stdout.write(`  ${PACKAGE_NAME} doctor          Test configuration and API access\n\n`);
  process.stdout.write("Setup options:\n");
  process.stdout.write("  --credentials <path>       Service account JSON file\n");
  process.stdout.write("  --allowed-sites <sites>    Comma-separated property allowlist\n");
  process.stdout.write("  --enable-write-tools       Enable sitemap submission and deletion\n");
  process.stdout.write(
    "  --skip-register            Do not register the server with Claude Code\n",
  );
  process.stdout.write("  --non-interactive          Do not prompt for input\n");
}

async function serve(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config.logLevel);
  const handle = serveStdio(() => createServer({ config, logger }), {
    onerror: (error) => logger.error("MCP transport error", { error: error.message }),
  });

  logger.info("Google Search Console MCP server started", {
    version: PACKAGE_VERSION,
    writeTools: config.enableWriteTools,
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info("Stopping MCP server", { signal });
    await handle.close();
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "--version" || command === "-v") {
    process.stdout.write(`${PACKAGE_VERSION}\n`);
    return;
  }

  if (command === "setup") {
    process.exitCode = await runSetup(args);
    return;
  }

  if (command === "doctor") {
    process.exitCode = await runDoctor();
    return;
  }

  if (command) {
    throw new Error(`Unknown command: ${command}. Run ${PACKAGE_NAME} --help for usage.`);
  }

  await serve();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${PACKAGE_NAME}: ${message}\n`);
  process.exitCode = 1;
});
