# Configuration

Configuration is loaded in this order:

1. Environment variables.
2. The setup-generated user config file.
3. Safe built-in defaults.

## Stored configuration

The setup wizard writes `config.json` to:

- Windows: `%APPDATA%\google-search-console-mcp\config.json`
- macOS and Linux: `$XDG_CONFIG_HOME/google-search-console-mcp/config.json`, or `~/.config/google-search-console-mcp/config.json`

Override this path with `GSC_CONFIG_FILE`.

Example:

```json
{
  "credentialsFile": "/absolute/path/to/service-account.json",
  "allowedSites": ["sc-domain:example.com"],
  "enableWriteTools": false
}
```

## Property allowlist

Set `GSC_ALLOWED_SITES` to limit the properties the server may access:

```bash
GSC_ALLOWED_SITES=sc-domain:example.com,https://www.example.com/
```

The values must exactly match the property identifiers returned by Search Console.

## Write tools

Write tools are disabled by default. Enable them only when sitemap submission or deletion is required:

```bash
GSC_ENABLE_WRITE_TOOLS=true
```

Enabling write tools changes the requested Google OAuth scope and registers two additional MCP tools.
