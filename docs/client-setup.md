# MCP client setup

## Claude Code user scope

The recommended approach is:

```bash
npx -y google-search-console-mcp setup
```

The wizard calls `claude mcp add` and registers the server at user scope.

## Claude Code project scope

Create `.mcp.json` at the project root.

macOS and Linux:

```json
{
  "mcpServers": {
    "google-search-console": {
      "command": "npx",
      "args": ["-y", "google-search-console-mcp"],
      "env": {
        "GSC_CREDENTIALS_FILE": "${GSC_CREDENTIALS_FILE}",
        "GSC_ALLOWED_SITES": "${GSC_ALLOWED_SITES:-}"
      }
    }
  }
}
```

Windows:

```json
{
  "mcpServers": {
    "google-search-console": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "google-search-console-mcp"],
      "env": {
        "GSC_CREDENTIALS_FILE": "${GSC_CREDENTIALS_FILE}",
        "GSC_ALLOWED_SITES": "${GSC_ALLOWED_SITES:-}"
      }
    }
  }
}
```

Claude Code asks for approval before starting a project-scoped MCP server.

## Other MCP clients

Use a stdio server configuration with:

- Command: `npx`
- Arguments: `-y`, `google-search-console-mcp`
- Environment: credentials and optional policy settings

On native Windows, use `cmd /c npx` for clients that cannot directly execute `npx.cmd`.
