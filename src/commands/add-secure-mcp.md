---
description: Add an MCP server using OpenBao for API-key storage
agent: build
---
Help me add an MCP server securely in OpenCode.

Requirements:
- Never hardcode API keys or tokens in `opencode.json`
- Use OpenBao as the source of truth for secrets
- Use `openbao-mcp-exec` in the MCP `command` array when the MCP needs a secret passed as a CLI argument. If it is not on `PATH`, use an absolute path instead.
- Remind me to store the secret first with a command in this form:

```bash
bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret <mcp>/api_key key=TA_CLE_API
```

What to do:
- Ask for the MCP name, package or command, and how the secret must be passed (for example `--api-key`)
- Update the appropriate OpenCode config with a secure MCP entry
- Show the final config snippet
- Explain how to verify the MCP with `opencode mcp list`
