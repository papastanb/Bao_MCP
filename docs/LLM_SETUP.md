# LLM Setup Guide

This section is written for coding agents and LLM-driven setup flows.

## Required policy

When an MCP requires a credential:

1. do not hardcode secrets in `opencode.json`
2. ask the user to store the secret in OpenBao first
3. prefer `openbao-mcp-exec` in the MCP `command` array
4. if `openbao-mcp-exec` is not on `PATH`, ask for or use an absolute path explicitly

## Required user reminder

Always give the user this storage command pattern:

```bash
bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret <mcp>/api_key key=TA_CLE_API
```

## Required MCP shape

```json
"<mcp>": {
  "type": "local",
  "command": [
    "openbao-mcp-exec",
    "secret",
    "<mcp>/api_key",
    "key",
    "--",
    "<launcher>",
    "<args>",
    "--api-key"
  ]
}
```

## Verification

After setup, verify with:

```bash
opencode mcp list
```

If the MCP helper is installed at a custom location, document that location in the local environment setup rather than baking it into public examples.
