# Google Search Console MCP

A secure, community-maintained Model Context Protocol server for Google Search Console. It gives MCP clients structured access to Search Analytics, properties, sitemaps, and URL Inspection.

[![CI](https://github.com/dienhokhanh/google-search-console-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/dienhokhanh/google-search-console-mcp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/google-search-console-mcp)](https://www.npmjs.com/package/google-search-console-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.14-339933)](https://nodejs.org/)

## Features

- Query clicks, impressions, CTR, and average position.
- List and inspect Search Console properties.
- List and inspect submitted sitemaps.
- Inspect the indexed version of a URL.
- Return both readable text and structured MCP output.
- Restrict access to an explicit property allowlist.
- Keep sitemap mutation tools disabled by default.
- Authenticate with a service account or Google Application Default Credentials.
- Install with `npx`; no global package installation is required.

## Requirements

- Node.js 22.14 or newer.
- A Google Cloud project with the Search Console API enabled.
- A Google identity that has access to at least one Search Console property.
- An MCP client such as Claude Code.

## Quick start

### 1. Prepare Google credentials

For a service account:

1. Enable the **Google Search Console API** in a Google Cloud project.
2. Create a service account and download its JSON key.
3. In Google Search Console, add the service account email under **Settings → Users and permissions** for each property it should access.

See [Authentication](docs/authentication.md) for Application Default Credentials and detailed setup instructions.

### 2. Run the setup wizard

```bash
npx -y google-search-console-mcp setup
```

The wizard validates Google access, stores only the credential file path in the user configuration directory, and registers the MCP server with Claude Code at user scope.

Non-interactive setup is also supported:

```bash
npx -y google-search-console-mcp setup \
  --credentials /absolute/path/to/service-account.json \
  --allowed-sites sc-domain:example.com,https://www.example.com/ \
  --non-interactive
```

On Windows PowerShell, use one line or PowerShell backticks instead of backslashes.

### 3. Use it from Claude Code

Restart Claude Code after setup, then try:

```text
List my Google Search Console properties.
Show clicks and impressions for the last 28 days, grouped by query.
Inspect https://www.example.com/article for indexing issues.
List the sitemaps submitted for sc-domain:example.com.
```

Run diagnostics at any time:

```bash
npx -y google-search-console-mcp doctor
```

## Manual Claude Code registration

macOS and Linux:

```bash
claude mcp add google-search-console --scope user \
  --env GSC_CREDENTIALS_FILE=/absolute/path/to/service-account.json \
  -- npx -y google-search-console-mcp
```

Windows:

```powershell
claude mcp add google-search-console --scope user --env GSC_CREDENTIALS_FILE=C:\path\to\service-account.json -- cmd /c npx -y google-search-console-mcp
```

See [Client setup](docs/client-setup.md) for project-level JSON configuration.

## Tools

| Tool                         | Default | Description                                           |
| ---------------------------- | ------- | ----------------------------------------------------- |
| `gsc_list_sites`             | Enabled | List accessible Search Console properties.            |
| `gsc_get_site`               | Enabled | Get permission information for one property.          |
| `gsc_query_search_analytics` | Enabled | Query Search Analytics metrics and dimensions.        |
| `gsc_list_sitemaps`          | Enabled | List submitted sitemaps.                              |
| `gsc_get_sitemap`            | Enabled | Get details about one sitemap.                        |
| `gsc_inspect_url`            | Enabled | Inspect the version of a URL known to Google's index. |
| `gsc_submit_sitemap`         | Opt-in  | Submit a sitemap.                                     |
| `gsc_delete_sitemap`         | Opt-in  | Remove a submitted sitemap.                           |

URL Inspection does not run a live test and cannot request indexing. Google does not expose those actions through the Search Console API.

See the complete [Tool reference](docs/tools.md).

## Configuration

| Variable                         | Default             | Description                                     |
| -------------------------------- | ------------------- | ----------------------------------------------- |
| `GSC_CREDENTIALS_FILE`           | ADC                 | Path to a service account JSON file.            |
| `GOOGLE_APPLICATION_CREDENTIALS` | ADC                 | Standard Google credential file variable.       |
| `GSC_ALLOWED_SITES`              | All accessible      | Comma-separated property allowlist.             |
| `GSC_ENABLE_WRITE_TOOLS`         | `false`             | Register sitemap mutation tools.                |
| `GSC_REQUEST_TIMEOUT_MS`         | `30000`             | Google API request timeout.                     |
| `GSC_MAX_RETRIES`                | `2`                 | Retry count for transient failures.             |
| `GSC_MAX_ANALYTICS_ROWS`         | `25000`             | Maximum rows returned by one analytics request. |
| `GSC_LOG_LEVEL`                  | `info`              | `silent`, `error`, `warn`, `info`, or `debug`.  |
| `GSC_CONFIG_FILE`                | OS config directory | Override the setup-generated config path.       |

Environment variables take precedence over the stored user configuration. See [Configuration](docs/configuration.md).

## Security defaults

- Read-only Google scope unless write tools are enabled.
- No credentials or API response data are written to logs.
- Logs go to stderr so MCP stdio messages remain valid.
- Write tools are absent from the tool list unless explicitly enabled.
- Property access can be constrained with `GSC_ALLOWED_SITES`.
- No telemetry.

Read [Security model](docs/security-model.md) and [Security policy](SECURITY.md) before enabling write tools.

## Development

```bash
git clone https://github.com/dienhokhanh/google-search-console-mcp.git
cd google-search-console-mcp
npm install
npm run check
```

Run the development server:

```bash
npm run dev
```

See [Development](docs/development.md) and [Contributing](CONTRIBUTING.md).

## License

[MIT](LICENSE)
