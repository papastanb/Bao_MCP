# AGENTS.md

## Build & Validation

- Install: `bun install`
- Typecheck: `bun run check`
- Lint: `bun run lint`
- Build: `bun run build`

## Project Intent

This package is an OpenCode plugin that enforces a secure MCP installation workflow:

1. never hardcode MCP secrets in `opencode.json`
2. store MCP credentials in OpenBao first
3. wire MCP processes through `openbao-mcp-exec` or an equivalent absolute path

## Conventions

- Keep public docs path-agnostic: do not reference personal home directories in README examples
- Treat the TUI module as a first-class surface for OpenCode plugin UX
- Prefer minimal, deterministic plugin hooks over complex magic
