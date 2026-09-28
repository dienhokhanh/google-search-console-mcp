# Security model

## Trust boundaries

The MCP client can ask the server to call Google Search Console on behalf of the configured identity. The effective access is the intersection of:

1. Google permissions granted to the identity.
2. The OAuth scope selected by the server.
3. The optional `GSC_ALLOWED_SITES` policy.
4. The set of tools registered at startup.

## Safe defaults

- Read-only scope and tools.
- No telemetry.
- No credential contents in logs.
- Bounded timeouts and retries.
- Bounded Search Analytics row counts.
- Structured validation for all MCP inputs.

## Write mode

When `GSC_ENABLE_WRITE_TOOLS=true`, the server requests the full Search Console scope and registers sitemap submission and deletion tools. Restart the server after changing this setting.

## Reporting vulnerabilities

Follow [SECURITY.md](../SECURITY.md). Do not include credentials, tokens, private property URLs, or Search Console response data in a public issue.
