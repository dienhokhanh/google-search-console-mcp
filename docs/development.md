# Development

## Prerequisites

- Node.js 22.14 or newer
- npm

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run check
```

## Test strategy

- Unit tests validate configuration, API request construction, policy gates, and error redaction.
- Contract tests connect the official MCP client and server through an in-memory transport.
- Live Google API tests are intentionally opt-in and must never run with production credentials in pull requests.

## Release process

Release Please maintains versions and the changelog. Publishing a GitHub Release triggers npm trusted publishing, a GHCR image build, and MCP Registry publication.

The npm package must be configured with this repository as a Trusted Publisher before automated npm publishing can succeed.
