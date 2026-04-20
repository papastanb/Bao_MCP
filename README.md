# opencode-openbao-mcp-guard

OpenCode plugin that standardizes secure MCP installation when an MCP needs an API key or token.

This package is self-contained from the OpenCode side: it does not require a separate local instruction file in `opencode.json`. Guidance is embedded in the plugin behavior, the TUI surface, and the `/add-secure-mcp` command.

## Version

- Current package version: `0.2.0`
- npm: `https://www.npmjs.com/package/opencode-openbao-mcp-guard`
- GitHub: `https://github.com/papastanb/Bao_MCP`

## What it does

- blocks obvious hardcoded secrets in `opencode.json` and `opencode.jsonc`
- injects a secure MCP reminder into relevant chats
- registers a guided `/add-secure-mcp` command
- exposes a TUI module for OpenCode plugin integration
- keeps the OpenBao-first workflow embedded in the plugin behavior

## Security model

For MCPs that need an API key:

1. store the key in OpenBao first
2. configure the MCP to fetch the key at runtime through `openbao-mcp-exec`
3. never write the key directly into `opencode.json`

OpenBao storage example:

```bash
bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret context7/api_key key=TA_CLE_API
```

OpenCode MCP example:

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

If `openbao-mcp-exec` is not on `PATH`, replace it with an absolute path in your local config.

## Install in OpenCode

Add the plugin to your global OpenCode config:

```json
{
  "plugin": [
    "opencode-openbao-mcp-guard"
  ]
}
```

OpenCode will install the package automatically.

## TUI integration

This package ships both:

- a server plugin entrypoint
- a TUI plugin entrypoint (`./tui`)

The TUI module registers a visible command launcher and shows a first-load toast so the plugin is discoverable in the TUI plugin list and command picker.

## Slash command

- `/add-secure-mcp`: guided secure MCP installation flow

The command tells the model to:

- avoid hardcoded secrets
- ask for the MCP package/launcher details
- remind the user to store the key in OpenBao first
- generate the correct `command` array using `openbao-mcp-exec`

## OpenBao setup

Minimal pattern:

```bash
bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret <mcp>/api_key key=TA_CLE_API
```

More details:

- [`docs/OPENBAO_SETUP.md`](./docs/OPENBAO_SETUP.md)

## Setup for LLMs

If an LLM or coding agent is using this plugin, it should follow these rules:

1. never hardcode API keys in `opencode.json`
2. always ask the user to store the secret in OpenBao first
3. prefer `openbao-mcp-exec` on `PATH`
4. if the helper is not on `PATH`, request or use an explicit absolute path locally

Dedicated guide:

- [`docs/LLM_SETUP.md`](./docs/LLM_SETUP.md)

## Development

```bash
bun install
bun run check
bun run lint
bun run build
```

## Local development install

```json
{
  "plugin": [
    "file:///absolute/path/to/Bao_MCP"
  ]
}
```

During development, loading the package root is preferred over pointing to a single built file because it keeps the server and TUI plugin surfaces together.

## Release process

See:

- [`CHANGELOG.md`](./CHANGELOG.md)
- [`RELEASE.md`](./RELEASE.md)

## License

MIT
