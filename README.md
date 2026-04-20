# opencode-openbao-mcp-guard

OpenCode plugin that standardizes secure MCP installation when an MCP needs an API key or token.

## Features

- Blocks obvious hardcoded secrets in `opencode.json` and `opencode.jsonc`
- Injects a secure MCP reminder into relevant chats
- Registers a global `/add-secure-mcp` command
- Exposes a TUI module with the same plugin ID for clean OpenCode plugin integration
- Documents the OpenBao-first workflow for MCP secrets

## Security model

For MCPs that need an API key:

1. Store the key in OpenBao first
2. Configure the MCP to fetch the key at runtime through `openbao-mcp-exec`
3. Never write the key directly into `opencode.json`

OpenBao storage example:

```bash
bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret context7/api_key key=TA_CLE_API
```

OpenCode MCP example:

```json
"context7": {
  "type": "local",
  "command": [
    "/home/stan/.local/bin/openbao-mcp-exec",
    "secret",
    "context7/api_key",
    "key",
    "--",
    "npx",
    "-y",
    "@upstash/context7-mcp",
    "--api-key"
  ]
}
```

## Install

### Local development

```bash
cd "/mnt/d/Claude SB/Bao_MCP"
bun install
bun run build
```

Then add the built plugin to OpenCode:

```json
{
  "plugin": [
    "file:///mnt/d/Claude SB/Bao_MCP/dist/index.js"
  ]
}
```

The package also exposes a TUI entrypoint at `./tui` for OpenCode's TUI plugin surface.

Or during development, you can point directly to source:

```json
{
  "plugin": [
    "file:///mnt/d/Claude SB/Bao_MCP/src/index.ts"
  ]
}
```

## Commands

- `/add-secure-mcp`: guided secure MCP installation flow

## Development

```bash
bun run build
bun run check
bun run lint
```
