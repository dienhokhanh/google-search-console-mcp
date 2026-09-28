# Troubleshooting

## Authentication failed

- Confirm the credentials file exists and contains valid Google credentials.
- Confirm the Search Console API is enabled in the credential's Google Cloud project.
- Run `npx -y google-search-console-mcp doctor`.

## Access denied

- Add the service account email or ADC identity to the Search Console property.
- Match domain properties exactly, for example `sc-domain:example.com`.
- Check `GSC_ALLOWED_SITES` if an allowlist is configured.

## Claude Code reports “Connection closed” on Windows

Use `cmd /c npx` in the MCP configuration. The setup wizard applies this automatically.

## Quota exceeded

Reduce date ranges, row counts, or repeated URL Inspection calls. Search Console applies separate quotas to Search Analytics, URL Inspection, and other resources.

## Tools are missing

Sitemap mutation tools are intentionally absent unless `GSC_ENABLE_WRITE_TOOLS=true`. Restart the MCP client after changing configuration.
