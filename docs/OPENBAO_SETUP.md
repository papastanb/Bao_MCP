# OpenBao Setup

## Goal

Use OpenBao as the source of truth for MCP API keys and tokens.

## Store a secret

```bash
bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret <mcp>/api_key key=TA_CLE_API
```

Example:

```bash
bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret context7/api_key key=TA_CLE_API
```

## MCP config pattern

Prefer `openbao-mcp-exec` on `PATH`:

```json
"context7": {
  "type": "local",
  "command": [
    "openbao-mcp-exec",
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

If the helper is not on `PATH`, replace `openbao-mcp-exec` with an absolute path.
